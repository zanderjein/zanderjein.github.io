# Critique of the current build (round 3)

Read against: redesign-existing-projects, high-end-visual-design, taste-skill v2 (all in full),
and joshwcomeau.com, shopify.design, rauno.me (measured in a browser, not remembered).
Dials for the rebuild: VARIANCE 8, MOTION 5, DENSITY 5.

## What the three references actually do (measured)

- **shopify.design** sets almost everything in one serif. Display runs 140 to 220px at a
  line-height of 0.70 to 0.90 and tracking of -0.04em, against 20px body: an 11:1 scale jump.
  Labels are a 14px uppercase mono. Six sizes in total.
- **rauno.me** uses four font sizes on the whole page (720, 85, 16, 13), no shadows at all,
  and stepped indents that line up to the pixel. Precision is a small vocabulary used exactly.
- **joshwcomeau.com** uses a five-layer shadow with real falloff (2.7px to 80px blur, 2% to 7%
  alpha), easing curves with a little overshoot, and every interactive thing answers the hand.

## Where the current build falls short of that

**Whole page**
1. I replaced "seven sections, one shape" with "eight sections, one other shape". Every section
   is a 200px rail label under a hairline with content to its right. In a thumbnail strip you
   cannot tell Work from Awards from Say hi. taste-skill calls this the section-layout-repetition
   fail, and the rail label plus serif one-liner (Work, Interests, Say hi) is its banned split header.
2. 28 distinct font sizes. Hierarchy made of many small steps is what generated pages look like.
   Outside the hero the largest type is 60px against 17px body, a 3.5:1 jump. Shopify's is 11:1.
3. Nothing overlaps anything. The only z-index users are the top bar and the grain. Depth is absent.
4. Shadows are one layer (`0 18px 40px`). No falloff, so covers look pasted on, not resting on paper.
5. 10 hairline rules and 6 uppercase tracked micro-labels (RIGHT NOW, LANGUAGES, MOST RECENTLY
   FINISHED, RUNNING, LAST NIGHT, PLACEHOLDER). The eyebrow ceiling for 8 sections is 3.
6. Inter. 26 em and en dashes in visible strings. No dark mode. One generic fade-up on everything,
   so motion decorates and never tells a story.

**Hero.** The name is right, but it floats: 9.5rem of top padding (cap is 6rem). "New Haven,
Connecticut" above it is a locale strip, a listed tell. Five text elements where four is the cap.
The right third under the name is empty and nothing is layered against the type.

**About.** Three unrelated beats stacked: a paragraph, a map drifting in dead air with nothing
beside it, then the teams as a hairline spec table. The map is the signature and it has no job.

**Work.** Split header, then a logo row trapped between two full-width hairlines, with a caption
under every logo (the logo-only rule) and a sentence that repeats what the logos already say.

**Library.** The strongest section, still flat: the lead cover sits beside an equal-weight grid,
nothing overlaps, and an eyebrow label announces what the size should already say.

**Health.** Big numerals on blank space, two columns split by a hairline: a dashboard widget.
The rings use a filled background track, which taste-skill lists as dashboard clutter.

**Interests.** The same strip twice, under another split header, with a credit line in the rail.

**Awards.** One lead, then eight hairline rows: the "worst default" for a list over five items.

**Say hi.** The smallest, quietest section closes the page. It ends by trailing off.

## The rebuild, one physical structure per section

| Section | Structure | The one huge thing |
|---|---|---|
| Hero | type poster, name bleeding past the measure, a map outline layered behind it | the surname |
| About | map pinned on one side, chapters scrolling past it on the other | the map |
| Work | one full-bleed band of marks, nothing else | the band itself |
| Library | a physical stack: lead cover overlapping a fanned shelf, layered shadows | the lead cover |
| Health | a numeral that bleeds off the edge with the rings on a raised sheet over it | miles this year |
| Interests | one offset poster wall, not two identical strips | the wall |
| Awards | lead award, then grouped clusters (debate, academic, music), no row rules | the lead award |
| Say hi | full-bleed navy close with the email set as display type | the email |

System changes: Geist replaces Inter (Geist Mono for figures and the few labels); a six-step type
scale; a five-layer navy-tinted shadow; a documented z-index scale with real layers; a navy dark
mode; hyphens in place of every em and en dash; eyebrow labels cut to three.
