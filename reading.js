/* ==========================================================================
   reading.js — the papers and news log, shared by the home page and /reading/.
   Entries are written by /admin into data/reading.json:
     { id, title, url, source, authors, kind: 'paper' | 'news', date: 'YYYY-MM-DD', note, hidden }
   ========================================================================== */

(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const KINDS = { paper: 'Paper', news: 'News' };

  /** YYYY-MM-DD as a local date, so an entry never lands on the day before. */
  function localDate(ymd) {
    const m = String(ymd || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  /** "Sep 12", with the year once it is no longer this one. */
  function shortDay(ymd) {
    const d = localDate(ymd);
    if (!d) return '';
    const opts = { month: 'short', day: 'numeric' };
    if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
    return d.toLocaleDateString('en-US', opts);
  }

  /** Only web links leave the page; anything else is dropped rather than trusted. */
  const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '');

  /** Everything meant to be seen, newest first. A missing file is just an empty log. */
  async function load(path) {
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) return [];
      const items = ((await res.json()).items || []).filter((it) => it && it.title && !it.hidden);
      // the file keeps the newest entry first, and a stable sort leaves same-day entries that way
      return items.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    } catch (err) {
      console.warn(`[data] could not load ${path}:`, err);
      return [];
    }
  }

  function row(it, i) {
    const url = safeUrl(it.url);
    const title = url
      ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(it.title)}</a>`
      : esc(it.title);
    // a middle dot, not a comma: the authors may be a comma list of their own
    const meta = [it.source, it.authors].filter(Boolean).map(esc).join(' <span class="read-dot" aria-hidden="true">\u00b7</span> ');

    return `
      <li class="read" data-reveal style="--i:${Math.min(i || 0, 6)}">
        <span class="read-when">${esc(shortDay(it.date))}</span>
        <div class="read-what">
          <h3 class="read-title">${title}</h3>
          <p class="read-meta">${meta}${meta && KINDS[it.kind] ? ' ' : ''}${KINDS[it.kind] ? `<span class="read-kind">${KINDS[it.kind]}</span>` : ''}</p>
          ${it.note ? `<p class="read-note">${esc(it.note)}</p>` : ''}
        </div>
      </li>`;
  }

  window.Reading = { load, row, esc, localDate };
})();
