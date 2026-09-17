#!/usr/bin/env node
/* ==========================================================================
   fetch-whoop.js — refresh data/whoop.json with the latest sleep and recovery.

   Run (in the workflow):  node scripts/fetch-whoop.js

   Needs three environment variables, stored as repository secrets:
     WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET, WHOOP_REFRESH_TOKEN
   If any is missing the script says so and exits cleanly, so the workflow
   stays green before Whoop has been set up.

   WHOOP rotates the refresh token on every refresh: "the refresh token from
   the refresh response is now the valid refresh token, and your app must use
   the new refresh token on the subsequent refresh request." So the new token
   is written — before anything else can fail — to the path in
   WHOOP_REFRESH_TOKEN_OUT, and the workflow saves it back into the secret.
   Tokens are never printed.

   Writes { updated, date, sleepScore, recoveryScore } only when they change.
   Fails safely: on any error the existing data/whoop.json is kept and the
   script exits non-zero.
   ========================================================================== */

const fs = require('fs/promises');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'data', 'whoop.json');
const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const API = 'https://api.prod.whoop.com/developer/v2';

const { WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET, WHOOP_REFRESH_TOKEN, WHOOP_REFRESH_TOKEN_OUT } = process.env;

/** WHOOP's error bodies name the problem (e.g. "invalid_grant") and never hold a credential. */
async function errorDetail(res) {
  try {
    const text = await res.text();
    try {
      const body = JSON.parse(text);
      const detail = [body.error, body.error_description, body.message].filter(Boolean).join(': ');
      return detail ? ` (WHOOP said: ${detail})` : '';
    } catch {
      return text ? ` (WHOOP said: ${text.slice(0, 160)})` : '';
    }
  } catch {
    return '';
  }
}

async function refreshAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: WHOOP_REFRESH_TOKEN,
      client_id: WHOOP_CLIENT_ID,
      client_secret: WHOOP_CLIENT_SECRET,
      scope: 'offline'
    })
  });

  if (!res.ok) {
    throw new Error(`token refresh returned HTTP ${res.status}${await errorDetail(res)}.`
      + (res.status === 400 || res.status === 401
        ? ' The stored refresh token or client credentials were rejected. If an earlier run could not save its new token, run ~/whoop-token.sh again.'
        : ''));
  }

  const json = await res.json();
  if (!json.access_token) throw new Error('token refresh returned no access token');

  // keep both tokens out of the Actions log even if something echoes them later
  if (process.env.GITHUB_ACTIONS) {
    console.log(`::add-mask::${json.access_token}`);
    if (json.refresh_token) console.log(`::add-mask::${json.refresh_token}`);
  }

  // the old refresh token is already dead, so hand the new one over first
  if (json.refresh_token && json.refresh_token !== WHOOP_REFRESH_TOKEN) {
    if (WHOOP_REFRESH_TOKEN_OUT) {
      await fs.writeFile(WHOOP_REFRESH_TOKEN_OUT, json.refresh_token, { mode: 0o600 });
      console.log('WHOOP issued a new refresh token; handed to the workflow to save.');
    } else {
      console.warn('WHOOP issued a new refresh token, but WHOOP_REFRESH_TOKEN_OUT is not set, so it was not saved.');
    }
  } else if (!json.refresh_token) {
    console.warn('WHOOP returned no refresh token; the offline scope may be missing from the authorization.');
  }

  return json.access_token;
}

async function get(accessToken, pathAndQuery) {
  const res = await fetch(API + pathAndQuery, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (res.status === 429) throw new Error('WHOOP rate limit hit (HTTP 429); will retry next run');
  if (!res.ok) throw new Error(`${pathAndQuery.split('?')[0]} returned HTTP ${res.status}${await errorDetail(res)}`);
  return res.json();
}

/** "2026-09-17T11:02:00.000Z" with offset "-04:00" -> "2026-09-17", the day you woke up locally. */
function localDay(iso, offset) {
  const t = Date.parse(iso);
  if (isNaN(t)) return '';
  const m = String(offset || '').match(/^([+-])(\d{2}):?(\d{2})$/);
  const minutes = m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
  return new Date(t + minutes * 60000).toISOString().slice(0, 10);
}

async function readExisting() {
  try { return JSON.parse(await fs.readFile(OUT, 'utf8')); } catch { return null; }
}

async function main() {
  const missing = ['WHOOP_CLIENT_ID', 'WHOOP_CLIENT_SECRET', 'WHOOP_REFRESH_TOKEN']
    .filter((k) => !process.env[k]);
  if (missing.length) {
    console.log(`WHOOP not configured yet (missing ${missing.join(', ')}); skipping.`);
    return;
  }

  const accessToken = await refreshAccessToken();

  // newest recoveries first; take the most recent night where both scores are final
  const { records = [] } = await get(accessToken, '/recovery?limit=10');
  const recoveries = records
    .filter((r) => r && r.score_state === 'SCORED' && r.score && r.sleep_id)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  let data = null;
  for (const recovery of recoveries) {
    const sleep = await get(accessToken, `/activity/sleep/${encodeURIComponent(recovery.sleep_id)}`);
    if (!sleep || sleep.nap || sleep.score_state !== 'SCORED' || !sleep.score) continue;
    const sleepScore = Math.round(Number(sleep.score.sleep_performance_percentage));
    const recoveryScore = Math.round(Number(recovery.score.recovery_score));
    if (!Number.isFinite(sleepScore) || !Number.isFinite(recoveryScore)) continue;
    data = { date: localDay(sleep.end, sleep.timezone_offset), sleepScore, recoveryScore };
    break;
  }

  if (!data) throw new Error('no scored night found in the latest recoveries (still pending?); keeping the previous file');

  const existing = await readExisting();
  const same = existing
    && existing.date === data.date
    && existing.sleepScore === data.sleepScore
    && existing.recoveryScore === data.recoveryScore
    && !('_note' in existing);

  if (same) {
    console.log(`No change: sleep ${data.sleepScore}%, recovery ${data.recoveryScore}% for ${data.date}.`);
    return;
  }

  await fs.writeFile(OUT, JSON.stringify({ updated: new Date().toISOString(), ...data }, null, 2) + '\n');
  console.log(`Updated: sleep ${data.sleepScore}%, recovery ${data.recoveryScore}% for ${data.date}.`);
}

main().catch((err) => {
  console.error(`WHOOP refresh failed: ${err.message}`);
  console.error('data/whoop.json left untouched.');
  process.exit(1);
});
