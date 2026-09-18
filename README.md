# zanderjein.com

Static site, no build step. Plain HTML / CSS / vanilla JS, served by GitHub Pages.

```
index.html      the whole site — one scrolling page, sections 01–08
styles.css      design tokens + all styling
main.js         the SITE edit block, data fetching, motion
reading.js      the papers-and-news log, shared by the home page and /reading/
admin/          zanderjein.com/admin — logs reading, movies, and musicals (needs a GitHub token)
reading/        the full reading log
404.html        soft landing for dead URLs
data/*.json     books / strava / whoop — refreshed by .github/workflows/refresh-data.yml
                reading / watching — written by /admin; posters — .github/workflows/posters.yml
CNAME           custom domain — do not remove
```

## Editing content

Almost everything you'd want to change lives in one block at the top of `main.js`,
marked `EDIT ME`: the most recent race, the hero's rotating line, the
Professional Experiences logos, and Awards.

Reading (papers and news), movies, and musicals are logged at zanderjein.com/admin instead.
It saves by committing to `data/reading.json` and `data/watching.json` with a fine-grained
GitHub token (this repo only, Contents: read and write) kept in that browser. Posters for new
titles are fetched by `.github/workflows/posters.yml`, which needs the `TMDB_API_KEY` secret.
To try the admin page locally without a token: `http://localhost:8000/admin/?preview`.

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
