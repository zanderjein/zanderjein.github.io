/* ==========================================================================
   zanderjein.com — main.js
   Vanilla JS, no dependencies, no build step.
   ========================================================================== */

/* ==========================================================================
   EDIT ME — everything you are likely to change lives in this one block.
   Add a movie, an award or a job by editing a line here. Nothing else to touch.
   ========================================================================== */

const SITE = {

  /* The race countdown. After race day the card switches to a "ran it" state. */
  race: {
    date: '2026-11-08',                       // YYYY-MM-DD, local time
    name: 'the Boston Half',
    longName: 'the B.A.A. Boston Half Marathon',
    where: 'Franklin Park, 8:00 a.m.'
  },

  /* Hero rotating line. Each entry cross-fades every four seconds.
     Use {book} to drop in the most recently finished book from Goodreads. */
  currently: [
    'Just finished <b>{book}</b>',
    'Currently training for <b>the Boston Half</b>',
    'Currently assistant stage managing <b>Come From Away</b> at the Yale Dramat'
  ],

  /* About — the slow scrolling line of interests. Add or remove freely. */
  tickerWords: [
    'competitive debating', 'orchestral music', 'philosophy', 'reading',
    'studying Mandarin', 'running', 'musicals', 'movies', 'traveling'
  ],

  /* Professional experiences. Omit `url` and the card renders without a link.
     `logo` is the organisation's own file in assets/logos (see SOURCES.md there).
     `logoHover`: 'file' shows the published artwork on hover; a hex recolours the
     mark instead, for files that are drawn in white for dark headers. */
  works: [
    {
      org: 'Yale Health Care Affordability Lab',
      role: 'Research Assistant',
      url: 'https://www.healthcareaffordabilitylab.org',
      logo: 'assets/logos/health-care-affordability-lab.svg',
      logoHover: '#00356B'
    },
    {
      org: 'Yale Department of Economics',
      logoNote: 'Department of Economics',   // the Yale wordmark alone doesn't say which unit
      role: 'Research Assistant',
      url: 'https://economics.yale.edu',
      logo: 'assets/logos/yale.svg',
      logoHover: '#00356B'
    },
    {
      org: 'Council on Foreign Relations',
      role: 'Research Assistant',
      url: 'https://www.thinkglobalhealth.org',
      logo: 'assets/logos/council-on-foreign-relations.svg',
      logoHover: 'file'
    },
    {
      org: 'Yale School of Management',
      role: 'Research Assistant',
      url: 'https://som.yale.edu',
      logo: 'assets/logos/yale-school-of-management.svg',
      logoHover: '#00356B'
    },
    {
      org: 'Bank of Thailand',
      role: 'Summer Analyst',
      url: 'https://www.bot.or.th/en/home.html',
      logo: 'assets/logos/bank-of-thailand.png',
      logoHover: 'file'
    },
    {
      org: 'Yale Law Journal',
      role: 'Intern',
      url: 'https://yalelawjournal.org',
      logo: 'assets/logos/yale-law-journal.svg',
      logoHover: '#00356B'
    }
  ],

  /* Interests — two shelves. First eight show; the rest sit behind "Show all". */
  interests: [
    {
      name: 'Musicals',
      items: ['Ragtime', 'Merrily We Roll Along', 'Hamilton', 'West Side Story', 'Hadestown',
              'The Sound of Music', 'Into the Woods', 'Sweeney Todd', 'Fiddler on the Roof']
    },
    {
      name: 'Movies',
      items: ['Crazy Rich Asians', 'Top Gun: Maverick', 'The Meg', 'Spider-Man: Brand New Day',
              'The Intern', 'Ratatouille', 'Jurassic Park', 'Hoppers', 'The Farewell', 'Barbie',
              'The Dark Knight', 'Oppenheimer', 'Memento', 'Better Off Dead']
    }
  ],

  /* Awards — in your order. `note` is the small grey line underneath. */
  awards: [
    { name: '#1 Collegiate Debate Team in the U.S., 2025–26' },
    { name: 'Finalist, Bridgewater’s Forecasting the Future Macroeconomics Challenge', note: 'Top 40 of 10,000+ participants' },
    { name: 'Bronze Medal, International Philosophy Olympiad 2024', note: 'Second person in Thailand’s history to medal' },
    { name: 'Richard U. Light Fellowship', note: 'Full scholarship for intensive Chinese study at Princeton in Beijing, Summer 2025' },
    { name: 'Two-time Best Speaker in Thailand' },
    { name: 'Three-time Thai National Debate Champion' },
    { name: 'First Prize, 9th Hong Kong International Youth Performance Arts Festival' },
    { name: 'Fourth Prize, London Classical Music Competition 2021' }
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

/* ------------------------------------------------------------ hero ticker -- */

function startTicker(firstBook) {
  const el = $('ticker');
  if (!el) return;

  const lines = SITE.currently.map((line) =>
    line.replace('{book}', esc(firstBook || 'something on the shelf')));

  let i = 0;
  el.innerHTML = lines[0];
  if (lines.length < 2) return;

  let paused = false;
  const host = el.closest('.ticker');
  if (host) {
    host.addEventListener('mouseenter', () => { paused = true; });
    host.addEventListener('mouseleave', () => { paused = false; });
    host.addEventListener('focusin', () => { paused = true; });
    host.addEventListener('focusout', () => { paused = false; });
  }

  setInterval(() => {
    if (paused || document.hidden) return;
    i = (i + 1) % lines.length;
    if (REDUCED.matches) { el.innerHTML = lines[i]; return; }
    el.classList.add('is-out');
    setTimeout(() => {
      el.innerHTML = lines[i];
      el.classList.remove('is-out');
    }, 280);
  }, 4000);
}

/* -------------------------------------------------------------- now cards -- */

function renderRunning(data) {
  const body = $('card-running');
  const foot = $('foot-running');
  const yearTag = $('run-year');

  if (!data || data.miles == null) {
    body.innerHTML = '<p class="is-empty">No runs logged yet.</p>';
    foot.textContent = '—';
    return;
  }

  if (yearTag) yearTag.textContent = data.year ? `· ${data.year}` : '';

  const miles = Number(data.miles).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const last = data.lastRun;

  body.innerHTML = `
    <div class="figures">
      <div class="figure">
        <p class="figure-num">${miles}<span class="figure-unit">mi</span></p>
        <p class="figure-cap">this year</p>
      </div>
      <div class="figure figure-sm">
        <p class="figure-num">${esc(data.runs ?? '—')}</p>
        <p class="figure-cap">runs</p>
      </div>
    </div>
    ${last ? revealLine(`Last run: ${esc(longDay(last.date))} · ${Number(last.miles).toFixed(1)} mi`) : ''}`;

  foot.textContent = updatedAgo(data.updated);
}

function renderGoal() {
  const strip = $('card-goal');
  if (!strip) return;
  const race = localDate(SITE.race.date);
  if (!race) { strip.innerHTML = ''; return; }

  const days = Math.round((midnight(race) - midnight(new Date())) / 86400000);
  const when = race.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (days > 0) {
    strip.innerHTML = `
      <span class="goal-days">${days}</span>
      <span class="goal-copy">
        <b>${days === 1 ? 'day' : 'days'} to ${esc(SITE.race.name)}</b>
        <span>${esc(when)} · ${esc(SITE.race.where)}</span>
      </span>`;
  } else if (days === 0) {
    strip.innerHTML = `
      <span class="goal-days">Today</span>
      <span class="goal-copy">
        <b>${esc(SITE.race.longName)}</b>
        <span>${esc(SITE.race.where)}</span>
      </span>`;
  } else {
    strip.innerHTML = `
      <span class="goal-days">Ran it</span>
      <span class="goal-copy">
        <b>Ran ${esc(SITE.race.name)}</b>
        <span>${esc(when)} · next one to be decided</span>
      </span>`;
  }
}

function renderSleep(data) {
  const body = $('card-sleep');
  const foot = $('foot-sleep');

  if (!data || (data.sleepScore == null && data.recoveryScore == null)) {
    body.innerHTML = '<p class="is-empty">No recent data.</p>';
    foot.textContent = '—';
    return;
  }

  const meter = (name, value) => `
    <div class="meter">
      <div class="meter-head">
        <span class="meter-name">${name}</span>
        <span class="meter-value">${value == null ? '—' : esc(value) + '<span class="pct">%</span>'}</span>
      </div>
      <div class="meter-track"><div class="meter-fill" data-fill="${value == null ? 0 : Number(value)}"></div></div>
    </div>`;

  body.innerHTML = `
    <div class="meter-list">
      ${meter('Sleep', data.sleepScore)}
      ${meter('Recovery', data.recoveryScore)}
    </div>
    ${data.date ? revealLine(`Measured ${esc(longDay(data.date))}`) : ''}`;

  requestAnimationFrame(() => {
    body.querySelectorAll('.meter-fill').forEach((el) => {
      el.style.width = Math.max(0, Math.min(100, Number(el.dataset.fill))) + '%';
    });
  });

  foot.textContent = updatedAgo(data.updated);
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
        <p class="lead-kicker">Most recently finished</p>
        <h3 class="lead-title">${esc(first.title)}</h3>
        <p class="lead-author">${esc(first.author)}</p>
        ${stars(first.rating)}
        <p class="lead-date">${esc(longDay(first.readAt))}${firstYear ? ', ' + firstYear : ''}</p>
        <span class="lead-cue">View on Goodreads ${ARROW}</span>
      </div>
    </a>`;

  mini.innerHTML = rest.slice(0, 8).map((b) => `
    <a class="mini" href="${esc(b.link || '#')}" target="_blank" rel="noopener noreferrer">
      <div class="book-cover mini-cover">
        ${b.cover ? `<img src="${esc(coverAt(b.cover, 360))}" alt="Cover of ${esc(b.title)}" loading="lazy" decoding="async" />` : ''}
        <span class="mini-title"><span>${esc(b.title)}</span></span>
      </div>
    </a>`).join('');

  if (count) count.textContent = `${books.length} book${books.length === 1 ? '' : 's'} · ${updatedAgo(data.updated)}`;

  setupTilt();
}

/* --------------------------------------------------------- static sections -- */

function renderMarquee() {
  const track = $('marquee-track');
  if (!track) return;

  const run = SITE.tickerWords
    .map((w) => `<span class="marquee-word">${esc(w)}</span>`)
    .join('<span class="marquee-dot" aria-hidden="true">·</span>');

  // the run is duplicated so the loop can hand off seamlessly at -50%
  track.innerHTML =
    `<span class="marquee-run">${run}</span>` +
    `<span class="marquee-run" aria-hidden="true">${run}</span>`;
}

function renderPlace(maps) {
  const host = $('place');
  if (!host) return;
  const big = maps && maps.thailand;
  const small = maps && maps.connecticut;
  if (!big) { host.innerHTML = ''; return; }

  const pct = (m) => {
    const [w, h] = m.viewBox.split(' ').slice(2).map(Number);
    return { left: ((m.dot[0] / w) * 100).toFixed(2), top: ((m.dot[1] / h) * 100).toFixed(2) };
  };

  const pin = (m, cls) => {
    const p = pct(m);
    return `<span class="pin ${cls}" style="left:${p.left}%; top:${p.top}%">
      <span class="pin-ring" aria-hidden="true"></span>
      <span class="pin-dot" aria-hidden="true"></span>
      <span class="pin-label">${esc(m.label)}</span>
    </span>`;
  };

  host.innerHTML = `
    <div class="map-main">
      <span class="map-shape">
        <svg viewBox="${esc(big.viewBox)}" role="img" aria-label="Outline map of Thailand with Bangkok marked">
          <path d="${esc(big.path)}" />
        </svg>
        ${pin(big, 'pin-home')}
      </span>
    </div>
    ${small ? `
    <div class="map-inset">
      <svg viewBox="${esc(small.viewBox)}" role="img" aria-label="Outline map of Connecticut with New Haven marked">
        <path d="${esc(small.path)}" />
      </svg>
      ${pin(small, 'pin-away')}
    </div>` : ''}
    <svg class="map-arc" aria-hidden="true"><path id="arc-path" /></svg>`;

  drawArc();
  window.addEventListener('resize', drawArc, { passive: true });
}

/** The arc is drawn in panel coordinates, so it has to be measured, not authored. */
function drawArc() {
  const host = $('place');
  const arc = host && host.querySelector('.map-arc');
  const from = host && host.querySelector('.pin-home');
  const to = host && host.querySelector('.pin-away');
  const p = $('arc-path');
  if (!host || !arc || !from || !to || !p) return;

  const box = host.getBoundingClientRect();
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const ax = a.left - box.left, ay = a.top - box.top;
  const bx = b.left - box.left, by = b.top - box.top;

  // bow the curve away from the straight line by a fraction of its length
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const lift = Math.hypot(bx - ax, by - ay) * 0.22;

  arc.setAttribute('viewBox', `0 0 ${Math.round(box.width)} ${Math.round(box.height)}`);
  p.setAttribute('d', `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${(my - lift).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);
}

function renderWorks() {
  const grid = $('work-grid');
  if (!grid) return;

  grid.innerHTML = SITE.works.map((w, i) => {
    const hoverFile = w.logoHover === 'file';
    const mark = w.logo
      ? `<div class="work-logo${hoverFile ? ' hover-file' : ''}">
           <span class="mono" style="-webkit-mask-image:url('${esc(w.logo)}');mask-image:url('${esc(w.logo)}')"></span>
           ${hoverFile
             ? `<img src="${esc(w.logo)}" alt="" loading="lazy" decoding="async" />`
             : `<span class="mono tint" style="-webkit-mask-image:url('${esc(w.logo)}');mask-image:url('${esc(w.logo)}');background:${esc(w.logoHover || '#00356B')}"></span>`}
         </div>`
      : `<span class="work-wordmark">${esc(w.org)}</span>`;

    const inner = `
      <div class="work-mark">
        ${mark}
        ${w.logoNote ? `<span class="work-note">${esc(w.logoNote)}</span>` : ''}
      </div>
      <div class="work-body">
        <h3 class="work-role">${esc(w.role)}</h3>
        ${w.url ? `<span class="work-cue">Visit ${ARROW}</span>` : ''}
      </div>`;

    return w.url
      ? `<a class="work" href="${esc(w.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(w.role)}, ${esc(w.org)}" data-reveal style="--i:${i % 4}">${inner}</a>`
      : `<article class="work" data-reveal style="--i:${i % 4}">${inner}</article>`;
  }).join('');
}

function renderInterests(posters) {
  const host = $('shelves');
  if (!host) return;
  const SHOWN = 8;
  const map = (posters && posters.posters) || {};

  host.innerHTML = SITE.interests.map((shelf, s) => {
    const kicker = shelf.name.replace(/s$/, '');

    const tiles = shelf.items.map((title, i) => {
      const src = map[title];
      const art = src
        ? `<img src="${esc(src)}" alt="Poster for ${esc(title)}" loading="lazy" decoding="async" />`
        : `<div class="poster-set">
             <span class="set-mark" aria-hidden="true">${TILE_MARKS[(i + s) % TILE_MARKS.length]}</span>
             <span class="set-kicker">${esc(kicker)}</span>
             <span class="set-title">${esc(title)}</span>
           </div>`;

      return `
        <div class="tile${i >= SHOWN ? ' is-hidden' : ''}">
          <div class="poster">${art}</div>
          <p class="tile-meta">
            <span class="tile-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="tile-title">${esc(title)}</span>
          </p>
        </div>`;
    }).join('');

    const extra = shelf.items.length - SHOWN;
    return `
      <div class="shelf-block" data-reveal style="--i:${s}">
        <div class="shelf-head">
          <span class="shelf-name">${esc(shelf.name)}</span>
          ${extra > 0 ? `<button class="shelf-toggle" type="button" data-shelf="${s}" aria-expanded="false">Show all ${shelf.items.length}</button>` : ''}
        </div>
        <div class="tiles" id="tiles-${s}">${tiles}</div>
      </div>`;
  }).join('');

  host.querySelectorAll('.shelf-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const s = btn.dataset.shelf;
      const open = btn.getAttribute('aria-expanded') === 'true';
      $(`tiles-${s}`).querySelectorAll('.tile').forEach((t, i) => t.classList.toggle('is-hidden', open && i >= SHOWN));
      btn.setAttribute('aria-expanded', String(!open));
      btn.textContent = open ? `Show all ${SITE.interests[s].items.length}` : 'Show fewer';
    });
  });

  setupReveal(host);
}

function renderAwards() {
  const list = $('award-list');
  if (!list) return;

  list.innerHTML = SITE.awards.map((a, i) => `
    <li class="award" data-reveal style="--i:${i % 4}">
      <span class="award-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="award-name">${esc(a.name)}</span>
      ${a.note ? `<span class="award-note">${esc(a.note)}</span>` : ''}
    </li>`).join('');
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

function setupProgress() {
  const bar = $('progress-bar');
  if (!bar) return;
  let ticking = false;

  const update = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    bar.style.width = (pct * 100).toFixed(2) + '%';
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
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
      document.querySelectorAll('.section-num').forEach((n) => { n.style.color = ''; });
      const num = entry.target.querySelector('.section-num');
      if (num) num.style.color = 'var(--ink-link)';
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach((s) => io.observe(s));
}

/** Small tilt on book covers — max 3°, pointer only, off for reduced motion. */
function setupTilt() {
  if (REDUCED.matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const MAX = 3;
  document.querySelectorAll('.book-lead, .mini').forEach((link) => {
    const cover = link.querySelector('.book-cover');
    if (!cover || cover.dataset.tilt) return;
    cover.dataset.tilt = '1';

    let frame = null;
    link.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const r = cover.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        cover.style.setProperty('--ry', (x * MAX * 2).toFixed(2) + 'deg');
        cover.style.setProperty('--rx', (-y * MAX * 2).toFixed(2) + 'deg');
      });
    });
    link.addEventListener('pointerleave', () => {
      cover.style.setProperty('--ry', '0deg');
      cover.style.setProperty('--rx', '0deg');
    });
  });
}

/* ------------------------------------------------------------------- boot -- */

(async function init() {
  const yr = $('year');
  if (yr) yr.textContent = new Date().getFullYear();

  renderMarquee();
  renderWorks();
  renderAwards();
  renderGoal();

  setupReveal();
  setupProgress();
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
  renderPlace(maps);

  // one sort for everything downstream: newest read date first
  if (books && Array.isArray(books.books)) {
    books.books.sort((a, b) => (localDate(b.readAt) || 0) - (localDate(a.readAt) || 0));
  }

  renderRunning(strava);
  renderSleep(whoop);
  renderLibrary(books);
  const latest = books && Array.isArray(books.books) ? books.books[0] : null;
  startTicker(latest && latest.title);
})();
