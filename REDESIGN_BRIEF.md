# zanderjein.com — redesign brief

This file is the source of truth for the redesign. Read it fully before touching anything.

## 0. Non-negotiables

- Keep `CNAME` (contains `zanderjein.com`) in the repo root. Never delete or modify it.
- Plain HTML / CSS / vanilla JS. No framework, no build step. Site must keep working on GitHub Pages as static files.
- Zander is not deeply technical. Any step he must do himself (OAuth, secrets) gets a concrete, numbered walkthrough.
- Work in phases (Section 8). Get sign-off after each phase before starting the next.
- Preserve local preview: `python3 -m http.server` → http://localhost:8000. All links must be relative and work under that.

## 1. Feel

Light, warm, minimal in color, rich in craft. References for the *amount* of design: joshwcomeau.com, maggieappleton.com, paco.me, shopify.design, shopify.com/editions/winter2026. rauno.me is the upper limit of interactivity — do not go that far (no OS metaphor, no sounds).

Rules of thumb:
- Nothing spins, flies, or auto-plays. Motion is calm: things settle into place as you scroll, links and cards respond to hover.
- Typography carries the page. Big, confident headings; generous white space; a clear rhythm.
- The dynamism comes from the site being *alive* — real data from Goodreads, Strava, and Whoop — more than from animation.
- Respect `prefers-reduced-motion`: all animations must degrade to instant.
- No scroll hijacking, no scroll-snap, no custom cursor, no preloader screen.

## 2. Visual system

- **Background:** white (`#FFFFFF`, or a barely-off-white like `#FCFCFC` if pure white glares). Keep the site light. No dark mode toggle for now.
- **Ink / accent:** navy blue. Use a deep navy (around `#0F2044`) for headings and primary text, a slightly lighter navy (around `#1E3A6E`) for links and hover states, and a soft navy-tinted gray for secondary text. Navy is the only color on the site — no green, no second accent. Test two navy shades on a sample page before committing.
- **The old cream + forest green is gone.**
- **Type:** one serif display face for headings (candidates: Instrument Serif, Fraunces, Newsreader) and one clean sans for body/UI (candidates: Inter, Geist). Load from Google Fonts with proper fallbacks. Pick the pairing that looks best in navy on white; show Zander two options as a test page before committing.
- **Case:** NOT all-lowercase anymore. Mix and match for the best look — e.g. sentence-case headings, lowercase nav labels or taglines, small-caps section numbers. Body prose in normal case. Judge each element on its own; consistency within a role (all nav labels the same case) matters more than a global rule.
- **Emoji section decorations from the old site:** drop them. Use small type/ornament details instead (section numbers, a thin rule, a small navy dot).

## 3. Structure (single scrolling page)

1. **Hero** — Zander's name large, one line of who he is (Yale, economics + mathematics, U.S. healthcare), a short rotating or fading line of "currently thinking about / reading / training for". Nav to sections below.
2. **Now** — a panel of small live cards pulled from JSON (Section 6):
   - *Reading now / last finished* (Goodreads)
   - *Running* (Strava): total miles this year, total runs this year, and a goal card: "training for the Boston Half" with a countdown in days to **Sunday, November 8, 2026** (the B.A.A. Boston Half Marathon, Franklin Park, 8:00 a.m.).
   - *Sleep* (Whoop): last night's sleep score and recovery score. No strain.
   Each card shows a "last updated" timestamp derived from the JSON.
3. **About** — short personal paragraph (voice preserved from current site, see Section 7), then a compact professional block: Council on Foreign Relations (Think Global Health), Yale Health Care Affordability Lab, Yale Law Journal, Tobin Center / Yale Department of Economics. Keep this restrained — a list with one line each, not a résumé.
4. **Writing** — Substack pieces. Feature the latest piece as a larger block (title, date, one-line description), older pieces as a compact list. All link out to Substack. Keep the existing entry: "why you should care about the U.S. healthcare system" (05.25.26, healthcare).
5. **Library** — the centerpiece. A responsive grid of book covers from the Goodreads "read" shelf, newest first: cover, title, author, Zander's star rating, date read. Covers lift slightly and gain a soft shadow on hover. Clicking a cover opens the book's Goodreads page in a new tab. No review pages on this site.
6. **Say hi** — email (obfuscated as now), LinkedIn, Substack. Footer: © Zander Jein · New Haven, CT.

Sections keep a numbered marker (01–06) as a nod to the old site, but styled as small type, not headings.

## 4. Motion spec

- On scroll into view: elements fade up ~12px over ~500ms with a gentle ease-out, staggered within a section (IntersectionObserver, CSS transitions; no library needed).
- Links: animated underline (grows from left) in navy.
- Cards and covers: hover lift 2–4px + shadow, ~200ms.
- Hero rotating line: cross-fade every ~4s; pauses on hover.
- Section numbers: optional subtle color change as that section becomes active.
- Everything wrapped so `prefers-reduced-motion: reduce` disables transitions.

## 5. Responsive

- Mobile first. Library grid: 2 columns on phones, 3 on tablet, 4–5 on desktop. Now-panel cards stack on mobile.
- No horizontal overflow ever.
- Test at 375px, 768px, 1280px widths.

## 6. Live data pipeline

All three services need secrets or have no CORS-friendly API, so the site never calls them directly. Instead, a GitHub Action refreshes JSON files in the repo, and the page fetches those.

**Layout**
```
data/books.json
data/strava.json
data/whoop.json
scripts/fetch-goodreads.js
scripts/fetch-strava.js
scripts/fetch-whoop.js
.github/workflows/refresh-data.yml
```

**Workflow:** runs on a cron twice a day (e.g. 06:00 and 18:00 UTC) and on manual dispatch. Node 20, no npm install if possible (use built-in `fetch` and a tiny XML parse for RSS; if a package is truly needed, keep a minimal `package.json`). Each script writes its JSON; workflow commits with message `chore: refresh data [skip ci]` only if files changed. Each script must fail gracefully: if a service errors, keep the previous JSON and log the error, so one broken integration never blanks the site.

**Goodreads** — no API. Use the shelf RSS feed:
`https://www.goodreads.com/review/list_rss/65803906?shelf=read`
(Zander's profile: https://www.goodreads.com/user/show/65803906-zander-jeinthanuttkanont — user ID `65803906`.)
Parse each item: title, author_name, book_large_image_url (fall back to book_image_url), user_rating, user_read_at, link. Write `{ updated: ISO, books: [...] }` sorted by read date desc. Ratings render as ★ characters. The "read" shelf currently has ~45 books. Note the RSS feed may only return the most recent ~100 items per page; if the shelf grows past that, page with `&page=2`.

**Strava** — OAuth app with `activity:read_all`. Store `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN` as repo secrets. Script refreshes the access token, pages through activities since Jan 1 of the current year, filters `type === "Run"`, writes `{ updated, year, runs, miles, lastRun: { name, date, miles } }`. Provide a one-time walkthrough for Zander to create the app at strava.com/settings/api and obtain the refresh token (include the exact authorize URL and the curl for the token exchange).

**Whoop** — Whoop Developer Platform OAuth app with scopes `read:sleep read:recovery`. Secrets `WHOOP_CLIENT_ID`, `WHOOP_CLIENT_SECRET`, `WHOOP_REFRESH_TOKEN`. Script refreshes the token, fetches the most recent sleep and recovery, writes `{ updated, sleepScore, recoveryScore, date }`. Same one-time walkthrough. Whoop refresh tokens rotate on use — the script must handle that by updating the stored secret via the GitHub API (or document the limitation and provide the fallback). Verify current Whoop API docs before writing this; do not rely on memory.

**Front-end:** `fetch('data/books.json')` etc. on load; render into the Now panel and Library. If a JSON file is missing or empty, the section shows a quiet placeholder, never an error.

**Countdown:** race date `2026-11-08` lives as a constant at the top of `main.js` so Zander can edit it for future races. After race day, the card should switch to a "ran the Boston Half" state rather than counting negative days.

## 7. Content and voice

- Keep Zander's existing phrasing where it survives ("welcome to a microcosm of my brain", "please say hi", "i love hearing from people…"). When adapting case, do not rewrite sentences — only adjust capitalization and fix mechanical typos.
- Do not invent biography. Use only what's in the current site plus the professional affiliations listed in Section 3.
- No photos of Zander anywhere.
- Remove the old `/reading/*.html` review pages, the Travels section entirely, and the Music remnants if any. Add a small `404.html` that links home so old review URLs degrade gracefully.

## 8. Phases

**Phase 1 — Design with placeholder data.** New `index.html`, `styles.css`, `main.js`; create `data/*.json` with realistic sample data (5–8 fake books with real cover URLs from Goodreads for layout testing, sample run/sleep numbers). Font-pairing test page. Stop and let Zander review locally.

**Phase 2 — Goodreads live.** Real RSS script + workflow, since it needs no secrets. Verify the Action runs green.

**Phase 3 — Strava, then Whoop.** One at a time, each with its numbered walkthrough. Confirm each shows real data before moving on.

**Phase 4 — Polish.** Motion tuning, responsive pass, Lighthouse check (performance + accessibility ≥ 90), meta tags / Open Graph / favicon.

After each phase, print the exact commands for Zander to preview and to deploy:
```
python3 -m http.server   # preview at http://localhost:8000
git add . && git commit -m "…" && git push
```
