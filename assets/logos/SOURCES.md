# Logo sources

Every file here is the organisation's own artwork, downloaded from the organisation's
own website and stored unmodified apart from an added `xmlns` attribute where the
mark was published as inline SVG (needed only so the file renders standalone).
Nothing here is redrawn, traced or approximated.

| File | Organisation | Source |
|---|---|---|
| `council-on-foreign-relations.svg` | Council on Foreign Relations | header wordmark, https://www.cfr.org |
| `yale-law-journal.svg` | The Yale Law Journal | header shield and wordmark, https://yalelawjournal.org. The site publishes them as two inline SVGs; this file stacks the shield above the wordmark, as the site's desktop header does. The shield is set larger against the wordmark than in that header (about 4.5:1 instead of 2.3:1) so it stays legible at the size of the logo strip. Neither drawing is altered. |
| `health-care-affordability-lab.svg` | Yale Health Care Affordability Lab | site logo, https://www.healthcareaffordabilitylab.org |
| `yale-school-of-management.svg` | Yale School of Management | header lockup, https://som.yale.edu |
| `yale.svg` | Yale University | `yale_university_logo.svg`, https://som.yale.edu |
| `bank-of-thailand.png` | Bank of Thailand | `logo-top-blue.png`, https://www.bot.or.th |

The Yale Department of Economics publishes no departmental lockup, so its card uses
the Yale University wordmark with the department named on the card.

Several of these files are drawn with white fills because they are built for dark
headers. The site therefore renders every mark as a navy silhouette (CSS mask) at
rest. On hover, marks whose file carries real colour (Bank of Thailand, CFR) show
the file as published; the white-fill Yale marks shift to Yale Blue #00356B rather
than rendering invisible on a white page.

`yale-school-of-management.svg` additionally had a `clip-path="url(#yalesom-logo-h-text-clip)"`
attribute pointing at a clipPath that is not defined anywhere on som.yale.edu — a dangling
reference in their own markup that stops the file rendering on its own. The attribute was
removed. No path data was touched.

The SOM artwork is drawn into the right-hand two-thirds of its own canvas, which left
the mark visibly off-centre in its tile; its `viewBox` was cropped to the drawing's own
bounds (`85 6 407 31`). No path data was touched.

The SOM file also carried a duplicated `xmlns` attribute (a fatal XML parse error that
stops any standalone SVG from loading); the duplicate was removed.
