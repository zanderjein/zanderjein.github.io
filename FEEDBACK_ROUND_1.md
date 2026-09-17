# Feedback round 1 — do all of this before Phase 2

Read REDESIGN_BRIEF.md again first; everything there still applies except where this file overrides it.

## Decisions
- Font pairing: **A** (Instrument Serif + Inter). Delete the other test pages once applied.
- Navy: **A** (#0F2044).
- Case: **no more lowercase anywhere.** Sentence case for headings and body, Title Case for proper names and section titles. Old lowercase phrasing may be re-cased but not rewritten.
- Commit nothing until Zander has reviewed locally.

## Overall
1. **More interactivity, still calm.** Zander wants it "a little more interactive." Add: hover reveals on cards (a second line or detail slides in), a magnetic/tilt effect on the library covers (small, ~3°), section headings that get a short underline sweep when scrolled into view, a scroll-progress hairline at the very top in navy, and nav links that highlight the active section. Keep everything under 300ms and reduced-motion-safe. No sounds, no cursor changes.
2. **Too much empty space.** Tighten vertical rhythm: section padding down ~30%, and fill the width — the "Also found at" list (screenshot) sits alone in the left half of the page with nothing beside it. Use two-column layouts on desktop where a section has a natural pair (e.g. About text on the left, affiliations on the right; Now cards in a 4-up row). Stack on mobile.
3. **Character.** Take cues from maggieappleton.com's "Essays" cards (screenshot): each block is a card with a visual element, a serif title, a one-line description, and small meta below. Apply that card language site-wide: writing, works, interests. Visual elements must be original (abstract navy line-art, ornaments, or typographic marks) — no copyrighted illustrations.

## Sections (new order)
1. **Hero** — as built, re-cased.
2. **Now** — as built, plus a fifth card: *"Assistant stage managing *Come From Away* at the Yale Dramat"* (this is "what I'm up to"; make it easy to edit in one place).
3. **About** — text left; **affiliations right as a logo wall.** Four orgs: Council on Foreign Relations (Think Global Health), Yale Health Care Affordability Lab, Yale Law Journal, Tobin Center for Economic Policy. Each tile: the org's official logo in monochrome navy (CSS filter), org name and subline, links to the org's site in a new tab; on hover the tile lifts and the logo returns to full color. **Logos must be official files** — find each org's press/brand page and use their downloadable asset; if none is downloadable, use a typographic wordmark tile instead. Do not redraw or approximate any logo.
4. **Works** — NEW section: things Zander has worked on. Card grid, Maggie-style. Ask Zander to paste his LinkedIn Experience section (Claude Code cannot open LinkedIn) and build cards from it: role, org, one-line description, dates, link. Seed it from known items: Bank of Thailand internship (research on tariff impacts and US–China trade effects on Thai exports), Cambridge Department of Politics and International Studies research on post-conflict democracies, the Health Care Affordability Lab fellowship. If a card lacks a link, omit the link.
5. **Writing** — as built, re-cased. Featured piece large, older ones compact.
6. **Library** — as built, plus tilt-on-hover.
7. **Interests** — NEW. Two shelves in the same card language, each a compact horizontal scroller on desktop and a 2-column grid on mobile, with typographic tiles (no posters or stills — those are copyrighted; use title in serif on a navy-tinted tile with a subtle variation per tile, e.g. a rotated ornament or a numeral):
   - *Musicals:* Ragtime, Merrily We Roll Along, Hamilton, West Side Story, Hadestown, The Sound of Music, Into the Woods, Sweeney Todd, Fiddler on the Roof.
   - *Movies:* Crazy Rich Asians, Top Gun: Maverick, The Meg, Spider-Man: Brand New Day, The Intern, Ratatouille, Jurassic Park, Hoppers, The Farewell, Barbie, The Dark Knight, Oppenheimer, Memento, Better Off Dead.
   Show 8 per shelf with a "show all" toggle. Order is Zander's; keep it.
8. **Awards** — NEW, a shelf at the very end before Say hi. Known items: Represented Thailand at the World Schools Debating Championships; Bronze medal, International Philosophy Olympiad (essay on law and war); Herb Scarf Fellowship, Yale Health Care Affordability Lab. Style as a simple timeline or medal-row — restrained, no trophy emoji. Ask Zander for the rest of the list and add them in his order.
9. **Say hi** — as built.

Update section numbering (01–09) and the nav.

## Data
- Keep all editable lists (interests, awards, works, the Dramat line) in one JSON or a clearly marked block at the top of `main.js`, so Zander can add a movie without touching HTML.

## Before you stop
- Re-verify no horizontal overflow at 375 / 768 / 1280.
- List every question you still need answered from Zander in one numbered block at the end.
