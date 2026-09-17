# Feedback round 2

Read REDESIGN_BRIEF.md and FEEDBACK_ROUND_1.md first; this file overrides where they conflict. Commit nothing until Zander has reviewed locally. Show him a preview after each numbered block below, in order, rather than all at once.

## 1. Dynamism: left-to-right eye movement and size play

The page currently reads straight down a single column. Break that up:
- Alternate section alignment. Some sections lead from the left (heading left, content right), some from the right (heading and tagline on the right, content on the left). Suggested rhythm: Hero left · About left · Health right · Professional Experiences full-width logo band · Library left (big book left, grid right) · Interests right (shelves scroll right-to-left) · Awards left · Connect centered.
- Vary scale. Section headings can vary in size (About and Library larger; Awards and Connect smaller). Health uses one oversized numeral. The Library hero cover should be markedly bigger than the grid covers. At least one element per section should be noticeably larger than the rest.
- Use offset and overlap sparingly: e.g. the Library hero cover overlaps the section rule by ~20px; the Interests heading sits half over the top of the poster row. Two or three moments of this across the page, not everywhere.
- Content max-width can widen to ~1200px on desktop so the left/right alternation has room to breathe.
- Keep all existing motion rules (reduced-motion safe, under 300ms).

## 2. Hero tagline

Replace "welcome to a microcosm of my brain" with something interesting but professional. Build a quick test page with these four set in the real hero, and let Zander pick:
- A. "Economics & Mathematics at Yale. Debate, healthcare, and a lot of reading."
- B. "Studying how markets and medicine collide."
- C. "A student of economics, a debater by habit, a reader by choice."
- D. "Notes from a Yale economics student who reads too much."
Keep the one-line rotating "currently…" line beneath it.

## 3. Section order

Move Health to sit directly below About. New order: Hero · About · Health · Professional Experiences · Library · Interests · Awards · Connect. Renumber and update the nav.

## 4. Health section

- Tagline: exactly "Strava and Whoop enthusiast".
- Layout: Running on the left, Last Night on the right, side by side, equal height, one shared card style.
- Last Night: replace the bars with two circular gauges (ring progress), Sleep and Recovery, the percentage in the serif at the ring's center, label beneath. Rings animate in on scroll (draw from 0 to value, ~600ms) and are static under reduced motion.
- Running: big numerals for miles and runs, the Boston Half countdown as a smaller inline line, not a separate tile.
- Fine-tune until the two cards feel like one composition: same corner radius, same padding, same label style, numerals in the same serif at related sizes.

## 5. Hover reveals

The current hover popups on Running and Last Night show text over the content and are hard to read. Change to: on hover, a translucent white overlay (~85% opacity, subtle blur) fades in over the card in ~200ms, and the explanatory text sits centered in the middle of the card in navy. Fade out on leave. Keyboard-focusable too.
Apply the same reveal pattern where it helps elsewhere: the Professional Experiences logos (overlay shows the organisation name and a "Visit" arrow) and the Library grid covers (overlay shows title, author, and rating).

## 6. Professional Experiences

- Tagline: "Where I've been seen before".
- Cards show only the organisation logo. Remove the role line entirely ("Research Assistant", "Summer Analyst", "Intern"). Organisation names appear only in the hover overlay from block 5.
- Present as a clean logo band: equal-size tiles, logos optically balanced (adjust individual logo scale so they look the same visual weight), navy at rest, colour on hover, each linking out.
- Keep the small "Department of Economics" note only inside the hover overlay for the Yale card.

## 7. Section taglines

- Library: "What I've been reading recently"
- Interests: "Things I've recently watched"
- Awards: "What I've been up to recently"

## 8. Awards

Add at the top, in this order:
1. Team of the Year, American Parliamentary Debate Association (APDA), 2025–26
2. National Finalist, American Parliamentary Debate Association (APDA), 2025–26
Then the existing list. Reformat every award to one consistent pattern: **Title, Organisation or Context, Year** — one line each, same type size, same separator. Use "2x" and "3x" rather than "Two-time" / "Three-time": "2x Best Speaker in Thailand", "3x Thai National Debate Champion". Drop any award that cannot fit the pattern cleanly and tell Zander which.

## 9. Mobile

The phone layout is currently off. Treat mobile as its own design, not a squeezed desktop:
- Single column, generous spacing, headings scaled down proportionally.
- Health cards stack; rings shrink but stay circular.
- Logo band becomes a 2- or 3-column grid of logos.
- Library: hero book full width, then a 3-column cover grid.
- Interests: horizontal scroll strips with visible partial next card.
- The interests ticker and the map panel resize cleanly; the Connecticut inset and arc hide below 480px if they crowd the Thailand outline.
- Test at 375 and 430 widths and screenshot both for Zander. No horizontal overflow.

## 10. Copy rule

Use the Oxford comma everywhere on the site. Audit all copy for it.

## Before you stop
Run the overflow check at 375 / 430 / 768 / 1280, confirm Lighthouse is still ≥ 95 on all four scores, and list anything you chose to skip and why.
