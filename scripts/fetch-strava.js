#!/usr/bin/env node
/* ==========================================================================
   fetch-strava.js — refresh data/strava.json with this year's running totals.

   Run (in the workflow):  node scripts/fetch-strava.js

   Needs three environment variables, stored as repository secrets:
     STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN
   If any is missing the script says so and exits cleanly, so the workflow
   stays green before Strava has been set up.

   Strava rotates refresh tokens: "Once a new refresh token code has been
   returned, the older code will no longer work." So when Strava hands back a
   new one, it is written — before anything else can fail — to the path in
   STRAVA_REFRESH_TOKEN_OUT, and the workflow saves it back into the secret.
   Tokens are never printed.

   Fails safely: on any error the existing data/strava.json is kept and the
   script exits non-zero.
   ========================================================================== */

const fs = require('fs/promises');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'data', 'strava.json');
const API = 'https://www.strava.com/api/v3';
const METERS_PER_MILE = 1609.344;
const PER_PAGE = 100;
const MAX_PAGES = 30;   // 3,000 activities in a year — a runaway guard, not a limit
const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun']);

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN, STRAVA_REFRESH_TOKEN_OUT } = process.env;

/** Strava's error body names what it rejected, e.g. "RefreshToken.refresh_token invalid".
    It never contains a credential, so it is safe to log. */
async function stravaErrorDetail(res) {
  try {
    const body = await res.json();
    const parts = (Array.isArray(body.errors) ? body.errors : [])
      .map((e) => [e.resource && e.field ? `${e.resource}.${e.field}` : e.resource || e.field, e.code]
        .filter(Boolean).join(' '))
      .filter(Boolean);
    const detail = [body.message, parts.join('; ')].filter(Boolean).join(': ');
    return detail ? ` (Strava said: ${detail})` : '';
  } catch {
    return '';
  }
}

async function refreshAccessToken() {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: STRAVA_REFRESH_TOKEN
    })
  });

  if (!res.ok) {
    throw new Error(`token refresh returned HTTP ${res.status}${await stravaErrorDetail(res)}.`
      + (res.status === 400 || res.status === 401
        ? ' The stored refresh token or client credentials were rejected. If the last run could not save a rotated token, authorize again (walkthrough step 3) and save the new token.'
        : ''));
  }

  const json = await res.json();
  if (!json.access_token) throw new Error('token refresh returned no access token');

  // keep both tokens out of the Actions log even if something echoes them later
  if (process.env.GITHUB_ACTIONS) {
    console.log(`::add-mask::${json.access_token}`);
    if (json.refresh_token) console.log(`::add-mask::${json.refresh_token}`);
  }

  // save a rotated refresh token first: the old one is already dead
  if (json.refresh_token && json.refresh_token !== STRAVA_REFRESH_TOKEN) {
    if (STRAVA_REFRESH_TOKEN_OUT) {
      await fs.writeFile(STRAVA_REFRESH_TOKEN_OUT, json.refresh_token, { mode: 0o600 });
      console.log('Strava issued a new refresh token; handed to the workflow to save.');
    } else {
      console.warn('Strava issued a new refresh token, but STRAVA_REFRESH_TOKEN_OUT is not set, so it was not saved.');
    }
  }

  return json.access_token;
}

async function listActivitiesSince(accessToken, afterEpoch) {
  const all = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${API}/athlete/activities?after=${afterEpoch}&per_page=${PER_PAGE}&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (res.status === 429) throw new Error('Strava rate limit hit (HTTP 429); will retry next run');
    if (!res.ok) throw new Error(`activities page ${page} returned HTTP ${res.status}${await stravaErrorDetail(res)}`);
    const batch = await res.json();
    if (!Array.isArray(batch)) throw new Error(`activities page ${page} was not a list`);
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < PER_PAGE) break;
  }
  return all;
}

const isRun = (a) => RUN_TYPES.has(a.sport_type) || (!a.sport_type && a.type === 'Run');
const toMiles = (meters) => Math.round((Number(meters) || 0) / METERS_PER_MILE * 10) / 10;

async function readExisting() {
  try { return JSON.parse(await fs.readFile(OUT, 'utf8')); } catch { return null; }
}

async function main() {
  const missing = ['STRAVA_CLIENT_ID', 'STRAVA_CLIENT_SECRET', 'STRAVA_REFRESH_TOKEN']
    .filter((k) => !process.env[k]);
  if (missing.length) {
    console.log(`Strava not configured yet (missing ${missing.join(', ')}); skipping.`);
    return;
  }

  const year = new Date().getUTCFullYear();
  const accessToken = await refreshAccessToken();

  // ask from a day before 1 Jan UTC, then keep runs whose *local* date is this year,
  // so a New Year's Eve evening run in any time zone lands in the right year
  const after = Math.floor(Date.UTC(year, 0, 1) / 1000) - 24 * 60 * 60;
  const activities = await listActivitiesSince(accessToken, after);

  const runs = activities
    .filter(isRun)
    .filter((a) => String(a.start_date_local || '').startsWith(String(year)))
    .sort((a, b) => String(b.start_date_local).localeCompare(String(a.start_date_local)));

  const totalMiles = Math.round(runs.reduce((sum, a) => sum + (Number(a.distance) || 0), 0) / METERS_PER_MILE * 10) / 10;
  const last = runs[0];

  const data = {
    year,
    runs: runs.length,
    miles: totalMiles,
    lastRun: last
      ? { name: last.name || 'Run', date: String(last.start_date_local).slice(0, 10), miles: toMiles(last.distance) }
      : null
  };

  const existing = await readExisting();

  // a same-year total collapsing to zero is far likelier to be an API or permission
  // problem than a real change, so keep what's there rather than blanking the card
  if (existing && existing.year === year && existing.runs > 0 && data.runs === 0) {
    throw new Error(`Strava returned 0 runs for ${year} but ${existing.runs} were recorded before; keeping the previous file`);
  }

  const same = existing
    && existing.year === data.year
    && existing.runs === data.runs
    && existing.miles === data.miles
    && JSON.stringify(existing.lastRun) === JSON.stringify(data.lastRun);

  if (same) {
    console.log(`No change: ${data.runs} runs, ${data.miles} mi in ${year}.`);
    return;
  }

  await fs.writeFile(OUT, JSON.stringify({ updated: new Date().toISOString(), ...data }, null, 2) + '\n');
  console.log(`Updated: ${data.runs} runs, ${data.miles} mi in ${year}.`);
}

main().catch((err) => {
  console.error(`Strava refresh failed: ${err.message}`);
  console.error('data/strava.json left untouched.');
  process.exit(1);
});
