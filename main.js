/* ==========================================================================
   zanderjein.com, main.js
   Vanilla JS, no dependencies, no build step.
   ========================================================================== */

/* ==========================================================================
   EDIT ME — everything you are likely to change lives in this one block.
   Add a movie, an award or a job by editing a line here. Nothing else to touch.
   ========================================================================== */

const SITE = {

  /* The words on the page. Each section has a `sub` (the line under its name) and a
     `text` (one string per paragraph). Leave either as '' or [] and it simply doesn't render. */
  about: {
    sub: 'Bachelor\u2019s in Economics & Math, Minor in Chinese',
    text: [
      'I\u2019m most interested in applying economics to health care and understanding what policy choices mean for patients. I\u2019m especially drawn to questions about access, affordability, and how policy interventions can improve the way care is delivered and paid for. I\u2019m also a big Health Affairs fan. Outside of academics, I debate, run, and make music!'
    ]
  },
  work: {
    sub: 'Health care systems, global health, and inequality.',
    text: [
      'I\u2019m most proud of my work with the Health Care Affordability Lab, where I contribute to health policy research and study how different systems and policies shape spending, coverage, and the way care is financed. At the Council on Foreign Relations, I\u2019ve also worked on U.S. global health interventions, including foreign aid programs, bilateral health agreements, and vaccine rollouts. I also research income and consumption inequality in the United States using household data to understand how economic well-being has changed across groups and over time.'
    ]
  },
  watching: {
    sub: 'Movies, musicals, and new favorites.',
    text: [
      'I picked movies and musicals back up in summer 2026 and have been enjoying them ever since. Always excited for recommendations!'
    ]
  },

  /* About, the journey: two places, each with a list beside it. The map is pinned while
     the chapters scroll past; on phones it becomes map, list, map, list.
     Every entry is `when`, `name`, and `details` (one string per line underneath).
     Leave `when` as '' or `details` as [] and that part simply doesn't render.
     A chapter's `note` is the sentence under the place name; '' removes it. `at` is [latitude, longitude]
     and is only used to work out the distance printed on the arc. */
  journey: [
    {
      place: 'bangkok',
      title: 'Bangkok',
      note: 'Previously represented Thailand on three national teams',
      at: [13.7563, 100.5018],
      items: [
        { when: '2022-23', name: 'Thai National Debate Team',
          details: ['Captain, WSDC Vietnam, 2023', 'Member, WSDC Netherlands, 2022'] },
        { when: '2018-23', name: 'Thai National Youth Orchestra',
          details: ['Flute & Piccolo', 'Festival Internacional de J\u00f3venes Orquestas (FIJO), Spain, 2019'] },
        { when: '2024', name: 'Thai Philosophy Olympiad Team',
          details: ['1 of 2 delegates from Thailand', 'Top 10 in the World, Helsinki, Finland'] }
      ]
    },
    {
      place: 'newhaven',
      title: 'New Haven',
      note: '',
      at: [41.3083, -72.9279],
      items: [
        { when: 'Since 2024', name: 'Yale Debate Association', details: ['Director of Membership'] },
        { when: 'Since 2025', name: 'Yale Undergraduate Consulting Group', details: [] },
        { when: 'Since 2024', name: 'Yale Foreign Policy Initiative', details: [] }
      ]
    }
  ],

  /* The short lines in Work, Health, and Say hi. '' removes one. */
  lines: {
    worked: 'Where I\u2019ve worked',          // the label inside the strip of logos
    health: 'Strava and Whoop enthusiast',
    connect: 'The easiest way to reach me is via email.'
  },

  /* The race countdown. After race day the card switches to a "ran it" state. */
  race: {
    date: '2026-11-08',                       // YYYY-MM-DD, local time
    name: 'the Boston Half',
    longName: 'the B.A.A. Boston Half Marathon',
    where: 'Franklin Park, 8:00\u00a0a.m.'   // the time holds together when the line wraps
  },


  /* About — the slow scrolling line of interests. Add or remove freely. */
  tickerWords: [
    'competitive debating', 'orchestral music', 'philosophy', 'reading',
    'studying mandarin', 'running', 'musicals', 'movies', 'traveling'
  ],

  /* Professional experiences — logos only, no roles. Omit `url` and the tile renders without a link.
     `logo` is the organisation's own file in assets/logos (see SOURCES.md there).
     `logoAsPublished` shows the file exactly as the organisation drew it, for marks
     whose detail is lost in silhouette; every other mark is a navy silhouette that
     turns `logoHover` on hover (the white-drawn files would vanish on white).
     `size` is the logo's width as a share of its tile, tuned by eye so every mark
     carries the same visual weight. `wide` lets a long, thin wordmark take a full
     row on phones, where half a row would shrink it past legibility. */
  works: [
    {
      org: 'Yale Health Care Affordability Lab',
      url: 'https://www.healthcareaffordabilitylab.org',
      logo: 'assets/logos/health-care-affordability-lab.svg',
      logoHover: '#00356B',
      size: 0.56
    },
    {
      org: 'Yale University',
      logoNote: 'Department of Economics',   // the Yale wordmark alone doesn't say which unit
      url: 'https://economics.yale.edu',
      logo: 'assets/logos/yale.svg',
      logoHover: '#00356B',
      size: 0.27
    },
    {
      org: 'Council on Foreign Relations',
      url: 'https://www.thinkglobalhealth.org',
      logo: 'assets/logos/council-on-foreign-relations.svg',
      logoAsPublished: true,
      size: 0.84,
      wide: true
    },
    {
      org: 'Yale School of Management',
      url: 'https://som.yale.edu',
      logo: 'assets/logos/yale-school-of-management.svg',
      logoHover: '#00356B',
      size: 0.84
    },
    {
      org: 'Bank of Thailand',
      url: 'https://www.bot.or.th/en/home.html',
      logo: 'assets/logos/bank-of-thailand.png',
      logoAsPublished: true,           // the emblem inside the roundel is lost in silhouette
      size: 0.68
    },
    {
      org: 'The Yale Law Journal',
      url: 'https://yalelawjournal.org',
      logo: 'assets/logos/yale-law-journal.svg',
      logoHover: '#00356B',
      size: 0.64,
      wide: true
    }
  ],

  /* Interests: two poster walls side by side, three rows deep (strips you push sideways
     on a phone). Order here is order on the page, left to right, top to bottom. */
  interests: [
    {
      name: 'Musicals',
      items: ['Ragtime', 'Merrily We Roll Along', 'Hamilton', 'West Side Story', 'Hadestown',
              'The Sound of Music', 'Into the Woods', 'Sweeney Todd', 'Fiddler on the Roof']
    },
    {
      name: 'Movies',
      items: ['Crazy Rich Asians', 'Top Gun: Maverick', 'The Meg', 'Spider-Man: Brand New Day',
              'The Intern', 'Ratatouille', 'Jurassic Park', 'The Odyssey', 'Hoppers', 'The Farewell',
              'Barbie',
              'The Dark Knight', 'Oppenheimer', 'Memento', 'Better Off Dead']
    }
  ],

  /* Awards. The first entry is set large on its own. The rest are gathered under their
     `group` heading, groups in the order they first appear, entries in the order written here.
     Every entry: `title`, `context` (the organisation or where it happened), `year`, `group`. */
  awards: [
    { title: 'Team of the Year', context: 'American Parliamentary Debate Association (APDA)', year: '2025-26', group: 'Debate' },
    { title: 'National Finalist', context: 'American Parliamentary Debate Association (APDA)', year: '2026', group: 'Debate' },
    { title: 'Finalist, Top 40 of 10,000+', context: 'Bridgewater\u2019s Forecasting the Future Macroeconomics Challenge', year: '2025', group: 'Academic' },
    { title: 'Bronze Medal', context: 'International Philosophy Olympiad, second medalist in Thailand\u2019s history', year: '2024', group: 'Academic' },
    { title: 'Richard U. Light Fellowship', context: 'Intensive Chinese study at Princeton in Beijing, full scholarship', year: '2025', group: 'Academic' },
    { title: '2x Best Speaker in Thailand', context: 'THSDC and TNTC', year: '2021-23', group: 'Debate' },
    { title: '3x Thai National Debate Champion', context: 'TWSDC, TNTC, and THSDC', year: '2021-23', group: 'Debate' },
    { title: 'First Prize', context: '9th Hong Kong International Youth Performance Arts Festival', year: '2021', group: 'Music' },
    { title: 'Fourth Prize', context: 'London Classical Music Competition', year: '2021', group: 'Music' }
  ]

};

/* ==========================================================================
   END EDIT BLOCK — below here is machinery.
   ========================================================================== */

const $ = (id) => document.getElementById(id);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------- original line-art --
   Abstract navy marks drawn for this site. Cycled by card index.             */

const TILE_MARKS = [
  '<svg width="74" height="74" viewBox="0 0 74 74" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="16" y="16" width="42" height="42" transform="rotate(45 37 37)"/></svg>',
  '<svg width="74" height="74" viewBox="0 0 74 74" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="37" cy="37" r="24"/><circle cx="37" cy="37" r="13"/></svg>',
  '<svg width="74" height="74" viewBox="0 0 74 74" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M20 22l17 15-17 15M40 22l17 15-17 15"/></svg>',
  '<svg width="74" height="74" viewBox="0 0 74 74" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M37 14v46M17 26l40 22M57 26L17 48"/></svg>'
];

const ARROW = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9L9 3M9 3H4M9 3v5"/></svg>';

/* ------------------------------------------------------------- utilities -- */

/** Parse YYYY-MM-DD as a local date, not UTC (avoids off-by-one days). */
function localDate(ymd) {
  if (!ymd) return null;
  const m = String(ymd).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) { const d = new Date(ymd); return isNaN(d) ? null : d; }
  return new Date(+m[1], +m[2] - 1, +m[3]);
}

const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function monthYear(ymd) {
  const d = localDate(ymd);
  return d ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
}

function longDay(ymd) {
  const d = localDate(ymd);
  return d ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '';
}

function updatedAgo(iso) {
  const d = iso ? new Date(iso) : null;
  if (!d || isNaN(d)) return 'Updated recently';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 2) return 'Updated just now';
  if (mins < 60) return `Updated ${mins} minutes ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Updated ${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
  return `Updated ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

/** Ask Goodreads' image server for a cover at a given pixel height. */
const coverAt = (url, height) => (url || '').replace(/\._S[XY]\d+_(?=\.jpg$)/, `._SY${height}_`);

function stars(n) {
  const filled = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
  if (!filled) return '';
  return `<span class="stars" aria-label="${filled} out of 5 stars">`
    + '★'.repeat(filled)
    + (filled < 5 ? `<span class="off">${'★'.repeat(5 - filled)}</span>` : '')
    + '</span>';
}

const revealLine = (html) => `<p class="reveal-line"><span>${html}</span></p>`;

/** Never throw, never show an error — a missing file just means a quiet card. */
async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[data] could not load ${path}:`, err);
    return null;
  }
}


/* -------------------------------------------------------------- now cards -- */

/** The race countdown: one line beside the run count. */
function renderGoal() {
  const line = $('card-goal');
  if (!line) return;
  const race = localDate(SITE.race.date);
  if (!race) { line.remove(); return; }

  const days = Math.round((midnight(race) - midnight(new Date())) / 86400000);
  const when = race.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  line.innerHTML = days > 0
    ? `<b>${days}</b> ${days === 1 ? 'day' : 'days'} to ${esc(SITE.race.name)}, ${esc(when)}`
    : days === 0
      ? `<b>Today:</b> ${esc(SITE.race.longName)}`
      : `Ran ${esc(SITE.race.name)}, ${esc(when)}`;
}

function renderRunning(data) {
  const body = $('card-running');
  const foot = $('foot-running');

  if (!data || data.miles == null) {
    body.innerHTML = '<p class="is-empty">No runs logged yet.</p>';
    foot.textContent = '';
    return;
  }

  const miles = Number(data.miles).toLocaleString('en-US', { maximumFractionDigits: 0 });
  // three digits share the width two digits get, so the number never leaves the infield
  $('track').style.setProperty('--digits', Math.max(2, miles.replace(/\D/g, '').length));

  body.innerHTML = `
    <p class="run-miles"><span class="run-num">${miles}</span><span class="run-cap">miles run${data.year ? ' in ' + esc(data.year) : ' this year'}</span></p>`;
  const runs = $('run-runs');
  if (runs) runs.innerHTML = `<b>${esc(data.runs ?? 0)}</b> runs`;

  foot.textContent = `Running ${updatedAgo(data.updated).toLowerCase()}`;
}

/* A stadium oval, run anticlockwise from the start line on the home straight.
   Lane 0 is the outside lane; each lane in is inset a little further. */
const lanePath = (lane) => {
  const inset = 8 + lane * 24;
  const x0 = inset, x1 = 1000 - inset, y0 = inset, y1 = 470 - inset, r = (y1 - y0) / 2;
  return `M600 ${y1} L${x1 - r} ${y1} A${r} ${r} 0 0 0 ${x1 - r} ${y0} L${x0 + r} ${y0} A${r} ${r} 0 0 0 ${x0 + r} ${y1} Z`;
};

/* the little glyph in the legend: the same two lanes, with one of them picked out */
const lapGlyph = (lane) => `
  <svg class="lap-glyph" viewBox="0 0 32 16" aria-hidden="true">
    <path class="${lane === 0 ? 'on' : ''}" d="M8 1.5 H24 A6.5 6.5 0 0 1 24 14.5 H8 A6.5 6.5 0 0 1 8 1.5 Z" />
    <path class="${lane === 1 ? 'on' : ''}" d="M9 5 H23 A3 3 0 0 1 23 11 H9 A3 3 0 0 1 9 5 Z" />
  </svg>`;

function renderSleep(data) {
  const track = $('track');
  const foot = $('foot-sleep');
  const legends = [$('card-sleep'), $('card-sleep-below')];

  track.querySelectorAll('[data-lane]').forEach((p) => p.setAttribute('d', lanePath(Number(p.dataset.lane))));

  if (!data || (data.sleepScore == null && data.recoveryScore == null)) {
    legends.forEach((el) => { el.innerHTML = '<p class="is-empty">No recent data.</p>'; });
    foot.textContent = '';
    return;
  }

  const lap = (lane, name, value) => `
    <p class="lap">${lapGlyph(lane)}<b>${value == null ? 'n/a' : esc(value) + '<span class="pct">%</span>'}</b> ${name}</p>`;
  const html = `
    <h3 class="lap-title">Last night</h3>
    ${lap(0, 'Sleep', data.sleepScore)}
    ${lap(1, 'Recovery', data.recoveryScore)}`;
  legends.forEach((el) => { el.innerHTML = html; });

  runLanes(track, data);
  foot.textContent = `Last night ${updatedAgo(data.updated).toLowerCase()}`;
}

/** Each lane runs from the start line round to its score once the track scrolls into view.
    pathLength="100" lets the dash offset be the percentage itself. */
function runLanes(track, data) {
  const lanes = [...track.querySelectorAll('.lane-fill')];
  const run = () => lanes.forEach((el) => {
    const v = Math.max(0, Math.min(100, Number(data[el.dataset.score]) || 0));
    el.style.strokeDashoffset = String(100 - v);
  });
  if (REDUCED.matches || !('IntersectionObserver' in window)) { run(); return; }

  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    // one frame at the start line first, so the transition has somewhere to run from
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, { threshold: 0.35 });
  io.observe(track);
}

/* ---------------------------------------------------------------- library -- */

function renderLibrary(data) {
  const feature = $('book-feature');
  const mini = $('book-mini');
  const count = $('shelf-count');
  const books = data && Array.isArray(data.books) ? data.books : [];

  if (!books.length) {
    feature.innerHTML = '<p class="is-empty">The shelf will show up here shortly.</p>';
    mini.innerHTML = '';
    if (count) count.textContent = '';
    return;
  }

  const [first, ...rest] = books;
  const firstYear = localDate(first.readAt) ? localDate(first.readAt).getFullYear() : '';

  feature.innerHTML = `
    <a class="book-lead" href="${esc(first.link || '#')}" target="_blank" rel="noopener noreferrer">
      <div class="book-cover lead-cover">
        ${first.cover ? `<img src="${esc(coverAt(first.cover, 720))}" alt="Cover of ${esc(first.title)}" loading="lazy" decoding="async" />` : ''}
      </div>
      <div class="lead-meta">
        <h3 class="lead-title">${esc(first.title)}</h3>
        <p class="lead-author">${esc(first.author)}</p>
        ${stars(first.rating)}
        <p class="lead-date">Finished ${esc(longDay(first.readAt))}${firstYear ? ', ' + firstYear : ''}</p>
        <span class="lead-cue">View on Goodreads ${ARROW}</span>
      </div>
    </a>`;

  // nine covers: phones show a 3 by 3 grid, wider screens hide the ninth for 4 by 2
  mini.innerHTML = rest.slice(0, 9).map((b, i) => `
    <a class="mini${i === 8 ? ' mini-ninth' : ''}" data-reveal style="--i:${i}" href="${esc(b.link || '#')}" target="_blank" rel="noopener noreferrer">
      <div class="book-cover mini-cover">
        ${b.cover ? `<img src="${esc(coverAt(b.cover, 360))}" alt="Cover of ${esc(b.title)}" loading="lazy" decoding="async" />` : ''}
      </div>
      <span class="mini-title">${esc(b.title)}</span>
      <span class="mini-author">${esc(b.author)}</span>
    </a>`).join('');

  if (count) count.textContent = `${books.length} book${books.length === 1 ? '' : 's'} read. `;
  setupReveal(mini);
}

/* --------------------------------------------------------- static sections -- */

/** A section's own words: the line under its name, then its paragraphs. */
function renderCopy(id, copy) {
  const host = $(id);
  if (!host) return;
  const c = copy || {};
  const paras = (c.text || []).filter(Boolean);
  if (!c.sub && !paras.length) { host.remove(); return; }
  host.innerHTML =
    (c.sub ? `<p class="sub">${esc(c.sub)}</p>` : '') +
    paras.map((p) => `<p class="blurb">${esc(p)}</p>`).join('');
}

function renderMarquee() {
  const track = $('marquee-track');
  if (!track) return;

  const run = SITE.tickerWords
    .map((w) => `<span class="marquee-word">${esc(w)}</span>`)
    .join('<span class="marquee-gap" aria-hidden="true"></span>');

  // the run is duplicated so the loop can hand off seamlessly at -50%
  track.innerHTML =
    `<span class="marquee-run">${run}</span>` +
    `<span class="marquee-run" aria-hidden="true">${run}</span>`;
}

/* ---------------------------------------------------------------- journey --
   Two modes, chosen by media query and re-chosen if either one changes:
     pinned   wide screens, motion allowed. One map stage sticks; the chapters scroll
              past it and an IntersectionObserver swaps the stage between places.
     stacked  phones and reduced motion. Each chapter carries its own still map.
   Nothing listens to the scroll event, and nothing takes the scroll wheel away.
   ------------------------------------------------------------------------ */

const WIDE = window.matchMedia('(min-width: 48rem)');
const MAP_KEY = { bangkok: 'thailand', newhaven: 'connecticut' };

function landMarkup(m, cls) {
  const [w, h] = m.viewBox.split(' ').slice(2).map(Number);
  const left = ((m.dot[0] / w) * 100).toFixed(2);
  const top = ((m.dot[1] / h) * 100).toFixed(2);
  return `
    <div class="land ${cls}" style="aspect-ratio:${w} / ${h}">
      <svg viewBox="${esc(m.viewBox)}" aria-hidden="true"><path d="${esc(m.path)}" /></svg>
      <span class="pin" style="left:${left}%; top:${top}%">
        <span class="pin-ring" aria-hidden="true"></span>
        <span class="pin-dot" aria-hidden="true"></span>
        <span class="pin-label">${esc(m.label)}</span>
      </span>
    </div>`;
}

/** The chapters and their lists. Drawn before the map data arrives, so the words never wait on it. */
function renderChapters() {
  const host = $('chapters');
  if (!host) return;

  host.innerHTML = (SITE.journey || []).map((c) => `
    <article class="chapter" data-place="${esc(c.place)}">
      <figure class="chapter-map" data-map="${esc(c.place)}"></figure>
      <header class="chapter-head">
        <h3 class="chapter-title">${esc(c.title)}</h3>
        ${c.note ? `<p class="chapter-note">${esc(c.note)}</p>` : ''}
      </header>
      <ol class="marks">
        ${c.items.map((it) => `
        <li class="mark">
          <span class="mark-when">${esc(it.when)}</span>
          <span class="mark-what">
            <span class="mark-name">${esc(it.name)}</span>
            ${(it.details || []).length ? `<ul class="mark-details">${it.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
          </span>
        </li>`).join('')}
      </ol>
    </article>`).join('');

  // each line arrives as you reach it, a little above the fold rather than at its edge
  const marks = host.querySelectorAll('.mark, .chapter-head');
  if (!('IntersectionObserver' in window)) { marks.forEach((m) => m.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -18% 0px', threshold: 0.4 });
  marks.forEach((m) => io.observe(m));
}

/** Great-circle distance in miles between two [lat, lon] pairs. */
function milesBetween(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(s));
}

function renderJourney(maps) {
  const journey = $('journey');
  const stage = $('stage');
  if (!journey || !stage) return;

  const th = maps && maps.thailand;
  const ct = maps && maps.connecticut;

  // the still maps, one per chapter, for the stacked mode
  journey.querySelectorAll('.chapter-map').forEach((fig) => {
    const m = maps && maps[MAP_KEY[fig.dataset.map]];
    fig.innerHTML = m ? landMarkup(m, 'land-still') : '';
    if (m) fig.setAttribute('aria-label', `Outline map with ${m.label} marked`), fig.setAttribute('role', 'img');
  });

  if (!th || !ct) { journey.dataset.mode = 'stacked'; return; }

  const [from, to] = SITE.journey;
  const miles = from && to && from.at && to.at ? Math.round(milesBetween(from.at, to.at) / 10) * 10 : null;

  stage.innerHTML = `
    ${landMarkup(th, 'stage-th')}
    ${landMarkup(ct, 'stage-ct')}
    <svg class="stage-arc" aria-hidden="true">
      <defs>
        <mask id="arc-mask" maskUnits="userSpaceOnUse">
          <path class="arc-draw" id="arc-draw" pathLength="1" />
        </mask>
      </defs>
      <path class="arc-dots" id="arc-dots" mask="url(#arc-mask)" />
    </svg>
    <span class="stage-flight" id="stage-flight" aria-hidden="true"></span>
    <span class="stage-from" id="stage-from" aria-hidden="true">${esc(th.label)}</span>
    ${miles ? `<span class="stage-miles" id="stage-miles" aria-hidden="true">${miles.toLocaleString('en-US')} miles</span>` : ''}`;

  /** The arc joins the two pins where they come to rest, so it is measured, not authored. */
  const layoutArc = () => {
    if (journey.dataset.mode !== 'pinned') return;
    const was = stage.dataset.place;
    stage.classList.add('is-measuring');
    stage.dataset.place = 'newhaven';

    const box = stage.getBoundingClientRect();
    const a = stage.querySelector('.stage-th .pin').getBoundingClientRect();
    const b = stage.querySelector('.stage-ct .pin').getBoundingClientRect();
    const ax = a.left - box.left, ay = a.top - box.top;
    const bx = b.left - box.left, by = b.top - box.top;

    stage.dataset.place = was;
    void stage.offsetWidth;                 // settle before transitions come back on
    stage.classList.remove('is-measuring');

    // bow the curve upward, away from the straight line, by a share of its length
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let nx = -(by - ay) / len, ny = (bx - ax) / len;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const lift = len * 0.34;
    const cx = (ax + bx) / 2 + nx * lift, cy = (ay + by) / 2 + ny * lift;
    const d = `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;

    const svg = stage.querySelector('.stage-arc');
    svg.setAttribute('viewBox', `0 0 ${box.width.toFixed(0)} ${box.height.toFixed(0)}`);
    const mask = svg.querySelector('mask');
    // the mask region is generous, so a curve that swings outside the stage isn't cut off
    mask.setAttribute('x', -200); mask.setAttribute('y', -200);
    mask.setAttribute('width', (box.width + 400).toFixed(0)); mask.setAttribute('height', (box.height + 400).toFixed(0));
    $('arc-draw').setAttribute('d', d);
    $('arc-dots').setAttribute('d', d);
    $('stage-flight').style.offsetPath = `path("${d}")`;

    const fromLabel = $('stage-from');
    fromLabel.style.transform = `translate(${(ax + 10).toFixed(1)}px, ${(ay + 8).toFixed(1)}px)`;

    const milesLabel = $('stage-miles');
    if (milesLabel) {
      // the top of a quadratic curve sits halfway between the chord and the control point
      const px = 0.25 * ax + 0.5 * cx + 0.25 * bx, py = 0.25 * ay + 0.5 * cy + 0.25 * by;
      // step off the curve along its normal, and hang the words from the side facing away from it
      const lx = px + nx * 12, ly = py + ny * 12;
      milesLabel.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) translate(${nx < 0 ? '-100%' : '0'}, -100%)`;
    }
  };

  const setMode = () => {
    const pinned = WIDE.matches && !REDUCED.matches && 'IntersectionObserver' in window;
    journey.dataset.mode = pinned ? 'pinned' : 'stacked';
    if (pinned) layoutArc();
  };
  WIDE.addEventListener('change', setMode);
  REDUCED.addEventListener('change', setMode);
  setMode();

  if ('ResizeObserver' in window) new ResizeObserver(layoutArc).observe(stage);

  // A place takes the stage once its name has risen past a line 72% of the way down the
  // window, and gives it back when the name drops below that line again.
  if ('IntersectionObserver' in window) {
    const heads = [...journey.querySelectorAll('.chapter-head')];
    const passed = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const line = e.rootBounds ? e.rootBounds.bottom : window.innerHeight * 0.72;
        passed.set(e.target, e.isIntersecting || e.boundingClientRect.top < line);
      });
      const current = heads.filter((h) => passed.get(h)).pop() || heads[0];
      if (current) stage.dataset.place = current.closest('.chapter').dataset.place;
    }, { rootMargin: '0px 0px -28% 0px', threshold: 0 });
    heads.forEach((h) => io.observe(h));
  }
}

function renderWorks() {
  const band = $('work-grid');
  if (!band) return;

  band.innerHTML = SITE.works.map((w, i) => {
    const mask = `-webkit-mask-image:url('${esc(w.logo)}');mask-image:url('${esc(w.logo)}')`;
    const logo = w.logoAsPublished
      ? `<div class="work-logo as-published" style="--logo-w:${Number(w.size) || 0.6}">
           <img src="${esc(w.logo)}" alt="" loading="lazy" decoding="async" />
         </div>`
      : `<div class="work-logo" style="--logo-w:${Number(w.size) || 0.6}">
           <span class="mono" style="${mask}"></span>
           <span class="mono tint" style="${mask};background:${esc(w.logoHover || '#00356B')}"></span>
         </div>`;

    // every mark here is a wordmark, so it already says the name; a caption is only for what it leaves out
    const name = w.logoNote ? `<span class="work-note">${esc(w.logoNote)}</span>` : '';

    const label = [w.org, w.logoNote].filter(Boolean).join(', ');
    return w.url
      ? `<a class="work" style="--i:${i}" href="${esc(w.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label)}">${logo}${name}</a>`
      : `<div class="work" style="--i:${i}" role="img" aria-label="${esc(label)}">${logo}${name}</div>`;
  }).join('');
}

function renderInterests(posters) {
  const host = $('shelves');
  if (!host) return;
  const map = (posters && posters.posters) || {};
  const ROWS = 3;

  host.innerHTML = SITE.interests.map((shelf, s) => {
    const kicker = shelf.name.replace(/s$/, '');
    const cols = Math.max(1, Math.ceil(shelf.items.length / ROWS));

    const tiles = shelf.items.map((title, i) => {
      const src = map[title];
      const art = src
        ? `<img src="${esc(src)}" alt="Poster for ${esc(title)}" loading="lazy" decoding="async" />`
        : `<div class="poster-set">
             <span class="set-mark" aria-hidden="true">${TILE_MARKS[(i + s) % TILE_MARKS.length]}</span>
             <span class="set-kicker">${esc(kicker)}</span>
             <span class="set-title">${esc(title)}</span>
           </div>`;

      // every other column hangs lower, so the wall never reads as a spreadsheet
      const col = i % cols;
      return `
        <li class="tile${col % 2 ? ' is-low' : ''}" style="--i:${col}">
          <div class="poster">${art}</div>
          <p class="tile-title">${esc(title)}</p>
        </li>`;
    }).join('');

    return `
      <div class="wall" style="--cols:${cols}" data-reveal>
        <h3 class="wall-name">${esc(shelf.name)}</h3>
        <ul class="tiles" tabindex="0" aria-label="${esc(shelf.name)}">${tiles}</ul>
      </div>`;
  }).join('');

  setupReveal(host);
}

/** The short lines. An empty string removes the line rather than leaving a gap. */
function renderLines() {
  Object.entries(SITE.lines || {}).forEach(([key, text]) => {
    const el = $(`line-${key}`);
    if (!el) return;
    if (text) el.textContent = text; else el.remove();
  });
}

function renderAwards() {
  const lead = $('award-lead');
  const host = $('award-groups');
  if (!host) return;

  const [first, ...rest] = SITE.awards;

  if (lead && first) {
    lead.innerHTML = `
      <p class="award-lead-name">${esc(first.title)}</p>
      <p class="award-lead-context">${esc(first.context)}, ${esc(first.year)}</p>`;
  }

  const groups = [];
  rest.forEach((a) => {
    const name = a.group || '';
    let g = groups.find((x) => x.name === name);
    if (!g) { g = { name, items: [] }; groups.push(g); }
    g.items.push(a);
  });

  host.innerHTML = groups.map((g, i) => `
    <section class="award-group" data-reveal style="--i:${i}">
      ${g.name ? `<h3 class="award-group-name">${esc(g.name)}</h3>` : ''}
      <ul class="award-list">
        ${g.items.map((a) => `
        <li class="award">
          <span class="award-name">${esc(a.title)}</span>
          <span class="award-context">${esc(a.context)}</span>
          <span class="award-year">${esc(a.year)}</span>
        </li>`).join('')}
      </ul>
    </section>`).join('');

  setupReveal(host);
}

/* ----------------------------------------------------------------- motion -- */

function setupReveal(scope) {
  const items = (scope || document).querySelectorAll('[data-reveal]:not(.is-in)');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  items.forEach((el) => io.observe(el));
}

function setupTopbar() {
  const bar = $('topbar');
  const hero = document.querySelector('.hero');
  if (!bar || !hero) return;
  const io = new IntersectionObserver(([entry]) => {
    bar.classList.toggle('is-visible', !entry.isIntersecting);
  }, { rootMargin: '-40% 0px 0px 0px' });
  io.observe(hero);
}

function setupActiveSection() {
  const links = [...document.querySelectorAll('.topbar-nav a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === id)));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach((s) => io.observe(s));
}


/* ------------------------------------------------------------------- boot -- */

(async function init() {
  const yr = $('year');
  if (yr) yr.textContent = new Date().getFullYear();

  renderCopy('copy-about', SITE.about);
  renderCopy('copy-work', SITE.work);
  renderCopy('copy-interests', SITE.watching);
  renderChapters();
  renderLines();
  renderMarquee();
  renderWorks();
  renderAwards();
  renderGoal();

  setupReveal();
  setupTopbar();
  setupActiveSection();

  const [books, strava, whoop, posters, maps] = await Promise.all([
    loadJSON('data/books.json'),
    loadJSON('data/strava.json'),
    loadJSON('data/whoop.json'),
    loadJSON('data/posters.json'),
    loadJSON('data/maps.json')
  ]);

  renderInterests(posters);
  renderJourney(maps);

  // one sort for everything downstream: newest read date first
  if (books && Array.isArray(books.books)) {
    books.books.sort((a, b) => (localDate(b.readAt) || 0) - (localDate(a.readAt) || 0));
  }

  renderRunning(strava);
  renderSleep(whoop);
  renderLibrary(books);
})();
