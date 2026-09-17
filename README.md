# zanderjein.com

Static site, no build step. Plain HTML / CSS / vanilla JS, served by GitHub Pages.

```
index.html      the whole site — one scrolling page, sections 01–08
styles.css      design tokens + all styling
main.js         the SITE edit block, data fetching, motion
404.html        soft landing for dead URLs
data/*.json     books / strava / whoop — refreshed by a GitHub Action (Phases 2–3)
CNAME           custom domain — do not remove
```

## Editing content

Almost everything you'd want to change lives in one block at the top of `main.js`,
marked `EDIT ME`: the race countdown, the hero's rotating line, the affiliation
wall, Works, Interests (musicals and movies) and Awards. Add a movie by adding a
string to a list; nothing else to touch.

## Preview locally

```
python3 -m http.server     # then open http://localhost:8000
```

## Deploy

```
git add . && git commit -m "…" && git push
```
