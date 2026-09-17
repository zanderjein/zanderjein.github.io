#!/usr/bin/env node
/* ==========================================================================
   fetch-posters.js — pull poster art for the Interests shelves from TMDB.

   Run:  node scripts/fetch-posters.js
   Key:  put your TMDB v3 API key in a file called .tmdb-key in the repo root
         (it is gitignored), or set TMDB_API_KEY in the environment.

   Writes: assets/posters/<slug>.jpg  and  data/posters.json
   Titles with no confident TMDB match are listed under "missing" and the
   site falls back to a designed typographic tile for them.

   Attribution: this product uses the TMDB API but is not endorsed or
   certified by TMDB. The footer of the site carries the required line.
   ========================================================================== */

const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'posters');
const MANIFEST = path.join(ROOT, 'data', 'posters.json');
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

/* --- the shelves are defined once, in main.js; read them from there ------- */
async function readShelves() {
  const src = await fs.readFile(path.join(ROOT, 'main.js'), 'utf8');
  const start = src.indexOf('const SITE = {');
  if (start < 0) throw new Error('could not find the SITE block in main.js');

  // walk braces to find the end of the object literal
  let depth = 0, i = src.indexOf('{', start), end = -1;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) throw new Error('could not parse the SITE block');

  const site = eval('(' + src.slice(src.indexOf('{', start), end) + ')');
  return site.interests || [];
}

async function readKey() {
  if (process.env.TMDB_API_KEY) return process.env.TMDB_API_KEY.trim();
  try {
    return (await fs.readFile(path.join(ROOT, '.tmdb-key'), 'utf8')).trim();
  } catch {
    console.error(
      '\nNo TMDB key found.\n' +
      '  1. Sign up at https://www.themoviedb.org/signup\n' +
      '  2. Verify the email TMDB sends you\n' +
      '  3. Open https://www.themoviedb.org/settings/api\n' +
      '  4. Click "Create" and choose "Developer"\n' +
      '  5. Accept the terms; for the form you can use "zanderjein.com",\n' +
      '     https://zanderjein.com and "personal website" as the answers\n' +
      '  6. Copy the 32-character "API Key (v3 auth)"\n' +
      '  7. Save it here:  echo YOUR_KEY > .tmdb-key\n'
    );
    process.exit(1);
  }
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Search movies, then TV, and take the most popular confident match. */
async function findPoster(title, key) {
  for (const kind of ['movie', 'tv']) {
    const url = `https://api.themoviedb.org/3/search/${kind}`
      + `?api_key=${encodeURIComponent(key)}&include_adult=false&query=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 401) throw new Error('TMDB rejected the key (401). Check .tmdb-key.');
      continue;
    }
    const json = await res.json();
    const wanted = title.toLowerCase();
    const hits = (json.results || [])
      .filter((r) => r.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    // prefer an exact title match before falling back to the most popular hit
    const exact = hits.find((r) => (r.title || r.name || '').toLowerCase() === wanted);
    const pick = exact || hits[0];
    if (pick) return { path: pick.poster_path, matched: pick.title || pick.name, kind };
  }
  return null;
}

async function main() {
  const key = await readKey();
  const shelves = await readShelves();
  await fs.mkdir(OUT_DIR, { recursive: true });

  const posters = {};
  const missing = [];
  const notes = [];

  for (const shelf of shelves) {
    for (const title of shelf.items) {
      let hit = null;
      try {
        hit = await findPoster(title, key);
      } catch (err) {
        console.error(`  ! ${title}: ${err.message}`);
        if (String(err.message).includes('401')) process.exit(1);
      }

      if (!hit) {
        missing.push(title);
        console.log(`  – ${title}: no match, using a typographic tile`);
        continue;
      }

      const file = `${slug(title)}.jpg`;
      const img = await fetch(IMG_BASE + hit.path);
      if (!img.ok) { missing.push(title); continue; }
      await fs.writeFile(path.join(OUT_DIR, file), Buffer.from(await img.arrayBuffer()));

      posters[title] = `assets/posters/${file}`;
      if (hit.matched.toLowerCase() !== title.toLowerCase()) {
        notes.push(`${title} → TMDB "${hit.matched}" (${hit.kind})`);
      }
      console.log(`  ✓ ${title}`);
    }
  }

  await fs.writeFile(MANIFEST, JSON.stringify({
    updated: new Date().toISOString(),
    source: 'TMDB — this product uses the TMDB API but is not endorsed or certified by TMDB.',
    posters,
    missing,
    notes
  }, null, 2) + '\n');

  console.log(`\n${Object.keys(posters).length} posters saved, ${missing.length} falling back to type.`);
  if (notes.length) { console.log('\nInexact matches worth a look:'); notes.forEach((n) => console.log('  ' + n)); }
}

main().catch((err) => { console.error(err); process.exit(1); });
