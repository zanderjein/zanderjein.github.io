#!/usr/bin/env node
/* ==========================================================================
   fetch-posters.js — pull poster art for the Interests shelves from TMDB.

   Run:  node scripts/fetch-posters.js

   Credential: put either TMDB credential in a file called .tmdb-key in the
   repo root (it is gitignored), or set TMDB_API_KEY. Both kinds work:
     - the "API Read Access Token" (long, starts with eyJ…) is sent as a header
     - the older 32-character "API Key" is sent as a query parameter

   Writes: assets/posters/<slug>.jpg  and  data/posters.json
   Every title's match (TMDB title, year, id) is recorded under "matches" so a
   wrong film can be spotted and pinned in OVERRIDES below. Titles with no
   match fall back to the site's typographic tile.

   This product uses the TMDB API but is not endorsed or certified by TMDB.
   ========================================================================== */

const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'posters');
const MANIFEST = path.join(ROOT, 'data', 'posters.json');
// the wall shows posters at up to ~170px wide; w342 covers that on high-density screens
const IMG_BASE = 'https://image.tmdb.org/t/p/w342';

/* Pin a title to one exact TMDB entry when search picks the wrong one,
   e.g. 'West Side Story': { kind: 'movie', id: 1725 }.
   A value of null forces the typographic tile. */
const OVERRIDES = {
  // search matched a 2021 short about gym bullying; this is the musical itself
  'Ragtime': { kind: 'movie', id: 1244956 },          // Ragtime, The Musical: All-Star Reunion Concert (2024)
  // search matched a 2006 BBC drama that isn't the musical
  'Sweeney Todd': { kind: 'movie', id: 13885 },      // Sweeney Todd: The Demon Barber of Fleet Street (2007)
  // listed on TMDB under a longer title, so exact search missed it
  'Hadestown': { kind: 'movie', id: 1439808 }        // Hadestown: The Musical (2026), filmed stage production
};

/* --- the shelves are defined once, in main.js; read them from there ------- */
async function readShelves() {
  const src = await fs.readFile(path.join(ROOT, 'main.js'), 'utf8');
  const start = src.indexOf('const SITE = {');
  if (start < 0) throw new Error('could not find the SITE block in main.js');

  let depth = 0, i = src.indexOf('{', start), end = -1;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) throw new Error('could not parse the SITE block');

  const site = eval('(' + src.slice(src.indexOf('{', start), end) + ')');
  return site.interests || [];
}

async function readCredential() {
  if (process.env.TMDB_API_KEY) return process.env.TMDB_API_KEY.trim();
  try {
    return (await fs.readFile(path.join(ROOT, '.tmdb-key'), 'utf8')).trim();
  } catch {
    console.error(
      '\nNo TMDB credential found.\n' +
      '  1. Sign up at https://www.themoviedb.org/signup and confirm your email\n' +
      '  2. Open https://www.themoviedb.org/settings/api, click Create, choose Developer\n' +
      '  3. Copy the API Read Access Token (or the API Key)\n' +
      '  4. With it copied, run:  pbpaste > .tmdb-key\n'
    );
    process.exit(1);
  }
}

/** A read access token is a JWT (three dot-separated parts); a v3 key is 32 hex chars. */
function tmdbFetch(credential) {
  const isToken = credential.split('.').length === 3;
  return (pathAndQuery) => {
    const url = new URL('https://api.themoviedb.org/3' + pathAndQuery);
    const headers = { accept: 'application/json' };
    if (isToken) headers.Authorization = `Bearer ${credential}`;
    else url.searchParams.set('api_key', credential);
    return fetch(url, { headers });
  };
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const yearOf = (r) => (r.release_date || r.first_air_date || '').slice(0, 4);

async function lookup(api, title) {
  if (Object.prototype.hasOwnProperty.call(OVERRIDES, title)) {
    const pin = OVERRIDES[title];
    if (!pin) return null;
    const res = await api(`/${pin.kind}/${pin.id}`);
    if (!res.ok) throw new Error(`override ${pin.kind}/${pin.id} returned HTTP ${res.status}`);
    const r = await res.json();
    return r.poster_path ? { ...r, kind: pin.kind, pinned: true } : null;
  }

  // films first: for the musicals, a filmed version is the poster people know
  for (const kind of ['movie', 'tv']) {
    const res = await api(`/search/${kind}?include_adult=false&query=${encodeURIComponent(title)}`);
    if (res.status === 401) throw new Error('TMDB rejected the credential (401). Check .tmdb-key.');
    if (!res.ok) continue;
    const hits = ((await res.json()).results || [])
      .filter((r) => r.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    // only accept a title that actually matches; a near miss gets the typographic tile
    const exact = hits.find((r) => norm(r.title || r.name) === norm(title));
    if (exact) return { ...exact, kind };
  }
  return null;
}

async function main() {
  const api = tmdbFetch(await readCredential());
  const shelves = await readShelves();
  await fs.mkdir(OUT_DIR, { recursive: true });

  const posters = {};
  const matches = {};
  const missing = [];

  for (const shelf of shelves) {
    for (const title of shelf.items) {
      let hit = null;
      try {
        hit = await lookup(api, title);
      } catch (err) {
        console.error(`  ! ${title}: ${err.message}`);
        if (/401/.test(err.message)) process.exit(1);
      }

      if (!hit) {
        missing.push(title);
        console.log(`  – ${title}: no exact match; typographic tile`);
        continue;
      }

      const file = `${slug(title)}.jpg`;
      const img = await fetch(IMG_BASE + hit.poster_path);
      if (!img.ok) {
        missing.push(title);
        console.log(`  – ${title}: poster download failed (HTTP ${img.status}); typographic tile`);
        continue;
      }
      await fs.writeFile(path.join(OUT_DIR, file), Buffer.from(await img.arrayBuffer()));

      posters[title] = `assets/posters/${file}`;
      matches[title] = { tmdb: `${hit.kind}/${hit.id}`, title: hit.title || hit.name, year: yearOf(hit), pinned: !!hit.pinned };
      console.log(`  ✓ ${title}  →  ${matches[title].title} (${matches[title].year || 'n.d.'}, ${matches[title].tmdb})`);
    }
  }

  // drop posters left over from titles no longer on a shelf
  const keep = new Set(Object.values(posters).map((p) => path.basename(p)));
  for (const f of await fs.readdir(OUT_DIR)) {
    if (f.endsWith('.jpg') && !keep.has(f)) await fs.unlink(path.join(OUT_DIR, f));
  }

  await fs.writeFile(MANIFEST, JSON.stringify({
    updated: new Date().toISOString(),
    source: 'TMDB — this product uses the TMDB API but is not endorsed or certified by TMDB.',
    posters,
    matches,
    missing
  }, null, 2) + '\n');

  console.log(`\n${Object.keys(posters).length} posters saved, ${missing.length} typographic.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
