# zanderjein.com

Static site, no build step. Plain HTML / CSS / vanilla JS, served by GitHub Pages.

```
index.html      the whole site — one scrolling page, sections 01–08
styles.css      design tokens + all styling
main.js         the SITE edit block, data fetching, motion
404.html        soft landing for dead URLs
data/*.json     books / strava / whoop — refreshed by .github/workflows/refresh-data.yml
CNAME           custom domain — do not remove
```

## Editing content

Almost everything you'd want to change lives in one block at the top of `main.js`,
marked `EDIT ME`: the race countdown, the hero's rotating line, the
Professional Experiences logos, Interests (musicals and movies), and Awards. Add a movie by adding a
string to a list; nothing else to touch.

## Live data

`.github/workflows/refresh-data.yml` runs at 06:00 and 18:00 UTC. It runs each
fetch script, commits `data/` only if something changed, then asks GitHub Pages
to rebuild (pushes made by the workflow's own token don't trigger a build on
their own).

Run it by hand: GitHub → Actions → Refresh data → Run workflow, or
`gh workflow run refresh-data.yml`. Run a script locally with
`node scripts/fetch-goodreads.js`.

## Preview locally

```
python3 -m http.server     # then open http://localhost:8000
```

## Deploy

```
git add . && git commit -m "…" && git push
```
