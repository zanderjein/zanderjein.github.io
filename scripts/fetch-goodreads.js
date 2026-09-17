#!/usr/bin/env node
/* ==========================================================================
   fetch-goodreads.js — refresh data/books.json from the public "read" shelf.

   Run:  node scripts/fetch-goodreads.js
   No API key and no dependencies: Goodreads retired its API, so this reads
   the shelf's public RSS feed. The shelf must be public for this to work.

   Writes only when the book list has actually changed, so the scheduled
   workflow doesn't commit a new timestamp twice a day for nothing. `updated`
   therefore means "when the shelf last changed".

   Fails safely: if the feed errors or returns nothing usable, the existing
   data/books.json is left exactly as it is and the script exits non-zero,
   so one bad fetch never blanks the Library.
   ========================================================================== */

const fs = require('fs/promises');
const path = require('path');

const USER_ID = '65803906';
const SHELF = 'read';
const OUT = path.resolve(__dirname, '..', 'data', 'books.json');
const MAX_PAGES = 20;     // the feed pages at roughly 100 items; this is a runaway guard, not a limit
const UA = 'Mozilla/5.0 (compatible; zanderjein.com static site build)';

const decode = (s) => (s || '')
  .replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&amp;/g, '&')
  .trim();

const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : '';
};

const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };

/** "Sat, 29 Aug 2026 06:59:26 -0700" -> "2026-08-29", the day as Goodreads wrote it. */
function isoDay(raw) {
  const m = (raw || '').match(/\b(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\b/);
  if (m && MONTHS[m[2]]) {
    return `${m[3]}-${String(MONTHS[m[2]]).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
  }
  const d = new Date(raw);
  return raw && !isNaN(d) ? d.toISOString().slice(0, 10) : '';
}

async function fetchPage(page) {
  const url = `https://www.goodreads.com/review/list_rss/${USER_ID}?shelf=${SHELF}&page=${page}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`feed page ${page} returned HTTP ${res.status}`);
  const xml = await res.text();
  if (/shelf is private/i.test(xml)) {
    throw new Error('the shelf is private — make it public in Goodreads privacy settings');
  }
  if (!/<rss[\s>]/.test(xml)) throw new Error(`feed page ${page} did not return RSS`);
  return xml;
}

function parse(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, block]) => {
    const bookId = tag(block, 'book_id');
    return {
      title: tag(block, 'title'),
      author: tag(block, 'author_name'),
      // the ._SY475_ variant is ~475px tall; the unsuffixed original can exceed 1MB
      cover: tag(block, 'book_large_image_url') || tag(block, 'book_image_url'),
      rating: Number(tag(block, 'user_rating')) || 0,
      readAt: isoDay(tag(block, 'user_read_at')) || isoDay(tag(block, 'user_date_added')),
      // the book's own page, as the Library promises; the item <link> is the review page
      link: bookId
        ? `https://www.goodreads.com/book/show/${bookId}`
        : tag(block, 'link').split('?')[0]
    };
  }).filter((b) => b.title);
}

async function readExisting() {
  try {
    return JSON.parse(await fs.readFile(OUT, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  const books = [];
  const seen = new Set();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = parse(await fetchPage(page));
    const fresh = batch.filter((b) => !seen.has(b.link));
    // stop on an empty page, or on a page that only repeats what we already have
    if (!fresh.length) break;
    fresh.forEach((b) => seen.add(b.link));
    books.push(...fresh);
  }

  if (!books.length) throw new Error('feed parsed to zero books');

  // newest read first; books with no read date sink to the bottom
  books.sort((a, b) => (b.readAt || '').localeCompare(a.readAt || ''));

  const existing = await readExisting();
  if (existing && JSON.stringify(existing.books) === JSON.stringify(books)) {
    console.log(`No change: ${books.length} books, data/books.json left as is.`);
    return;
  }

  await fs.writeFile(OUT, JSON.stringify({
    updated: new Date().toISOString(),
    source: `https://www.goodreads.com/review/list_rss/${USER_ID}?shelf=${SHELF}`,
    books
  }, null, 2) + '\n');

  const before = existing && Array.isArray(existing.books) ? existing.books.length : 0;
  console.log(`Updated: ${books.length} books written to data/books.json (was ${before}).`);
  const undated = books.filter((b) => !b.readAt).length;
  if (undated) console.log(`  ${undated} have no "date read" on Goodreads and sort last.`);
}

main().catch((err) => {
  console.error(`Goodreads refresh failed: ${err.message}`);
  console.error('data/books.json left untouched.');
  process.exit(1);
});
