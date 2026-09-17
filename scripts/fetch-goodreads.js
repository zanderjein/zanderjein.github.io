#!/usr/bin/env node
/* ==========================================================================
   fetch-goodreads.js — refresh data/books.json from the public "read" shelf.

   Run:  node scripts/fetch-goodreads.js
   No API key and no dependencies: Goodreads retired its API, so this reads
   the shelf's public RSS feed. The shelf must be public for this to work.

   Fails safely: if the feed errors or returns nothing usable, the existing
   data/books.json is left exactly as it is and the script exits non-zero,
   so one bad fetch never blanks the Library.
   ========================================================================== */

const fs = require('fs/promises');
const path = require('path');

const USER_ID = '65803906';
const SHELF = 'read';
const OUT = path.resolve(__dirname, '..', 'data', 'books.json');
const PAGES = 3;          // the feed returns ~100 items per page; 3 is ample headroom
const UA = 'Mozilla/5.0 (compatible; zanderjein.com static site build)';

const strip = (s) => (s || '')
  .replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&amp;/g, '&')
  .trim();

const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? strip(m[1]) : '';
};

/** "Sat, 29 Aug 2026 06:59:26 -0700" -> "2026-08-29" (the shelf's own local day) */
function isoDay(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d)) return '';
  const m = raw.match(/\b(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\b/);
  if (m) {
    const months = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
    const mm = months[m[2]];
    if (mm) return `${m[3]}-${String(mm).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
  }
  return d.toISOString().slice(0, 10);
}

/* book_large_image_url is the ._SY475_ variant — about 475px tall, which is the
   right weight for the page. The unsuffixed original can be well over 1MB. */

async function fetchPage(page) {
  const url = `https://www.goodreads.com/review/list_rss/${USER_ID}?shelf=${SHELF}&page=${page}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`feed page ${page} returned ${res.status}`);
  const xml = await res.text();
  if (/shelf is private/i.test(xml)) {
    throw new Error('the shelf is private — make it public in Goodreads privacy settings');
  }
  return xml;
}

function parse(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, block]) => {
    const readAt = isoDay(tag(block, 'user_read_at')) || isoDay(tag(block, 'user_date_added'));
    return {
      title: tag(block, 'title'),
      author: tag(block, 'author_name'),
      cover: tag(block, 'book_large_image_url') || tag(block, 'book_image_url'),
      rating: Number(tag(block, 'user_rating')) || 0,
      readAt,
      link: (tag(block, 'link') || '').split('?')[0]
    };
  }).filter((b) => b.title);
}

async function main() {
  const books = [];
  for (let page = 1; page <= PAGES; page++) {
    const batch = parse(await fetchPage(page));
    if (!batch.length) break;
    books.push(...batch);
    if (batch.length < 100) break;
  }

  if (!books.length) throw new Error('feed parsed to zero books — keeping the previous file');

  // newest read first; books with no read date sink to the bottom
  books.sort((a, b) => (b.readAt || '').localeCompare(a.readAt || ''));

  await fs.writeFile(OUT, JSON.stringify({
    updated: new Date().toISOString(),
    source: `https://www.goodreads.com/review/list_rss/${USER_ID}?shelf=${SHELF}`,
    books
  }, null, 2) + '\n');

  const undated = books.filter((b) => !b.readAt).length;
  console.log(`${books.length} books written to data/books.json`);
  if (undated) console.log(`  (${undated} have no "date read" on Goodreads and sort last)`);
}

main().catch((err) => {
  console.error('Goodreads refresh failed:', err.message);
  console.error('data/books.json left untouched.');
  process.exit(1);
});
