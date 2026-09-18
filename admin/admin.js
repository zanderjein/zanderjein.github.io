/* ==========================================================================
   /admin — logs reading, movies, and musicals by committing to the site's repo.

   There is no server. Saving is a commit to data/reading.json or data/watching.json
   through the GitHub API, made with a fine-grained token that lives only in this
   browser (localStorage). Anyone can open this page; without the token it can't save.

   On localhost, /admin/?preview opens the desk without a token and saves nothing.
   ========================================================================== */

const REPO = 'zanderjein/zanderjein.github.io';
const BRANCH = 'main';
const FILES = { reading: 'data/reading.json', watching: 'data/watching.json' };
const TOKEN_KEY = 'zj-admin-token';
const PREVIEW = ['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).has('preview');

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

let token = '';
try { token = localStorage.getItem(TOKEN_KEY) || ''; } catch { /* private window: ask every time */ }

const docs = { reading: { items: [] }, watching: { shelves: [] } };
let editingId = null;

/* ----------------------------------------------------------------- github -- */

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {})
    }
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new ApiError(res.status, detail.message || `GitHub answered ${res.status}`);
  }
  return res.json();
}

const fromBase64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
const toBase64 = (text) => {
  let bin = '';
  new TextEncoder().encode(text).forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
};

/** The file as it is on GitHub right now, never as the site last served it. */
async function readFile(key) {
  if (PREVIEW) return { data: await (await fetch(`/${FILES[key]}`, { cache: 'no-store' })).json(), sha: null };
  try {
    const file = await gh(`/contents/${FILES[key]}?ref=${BRANCH}`);
    return { data: JSON.parse(fromBase64(file.content)), sha: file.sha };
  } catch (err) {
    if (err.status === 404) return { data: null, sha: null };
    throw err;
  }
}

/** Every save starts from a fresh read, so a phone and a laptop can't overwrite each other. */
async function mutate(key, change, message) {
  for (let attempt = 0; ; attempt++) {
    const { data, sha } = await readFile(key);
    const next = change(data || structuredClone(docs[key]));
    if (PREVIEW) return next;
    try {
      await gh(`/contents/${FILES[key]}`, {
        method: 'PUT',
        body: JSON.stringify({
          message,
          branch: BRANCH,
          content: toBase64(JSON.stringify(next, null, 2) + '\n'),
          ...(sha ? { sha } : {})
        })
      });
      return next;
    } catch (err) {
      // 409: the file moved between the read and the write. Read it again, once.
      if (err.status === 409 && attempt === 0) continue;
      throw err;
    }
  }
}

/* ----------------------------------------------------------------- status -- */

function say(text, bad) {
  const el = $('status');
  el.textContent = text;
  el.classList.toggle('is-bad', Boolean(bad));
}

function explain(err) {
  if (err.status === 401) return 'GitHub rejected the token. It may have expired: forget this device and paste a new one.';
  if (err.status === 403 || err.status === 404) return 'The token can’t write to the site’s repository. It needs Contents: Read and write on zanderjein.github.io.';
  return `Not saved: ${err.message}`;
}

/** Run one save with the buttons held, and say how it went. */
async function save(key, change, message, done) {
  const buttons = [...document.querySelectorAll('#desk button')].filter((b) => !b.disabled);
  buttons.forEach((b) => { b.disabled = true; });
  say('Saving…');
  try {
    docs[key] = await mutate(key, change, message);
    say(PREVIEW ? 'Preview only: nothing was saved.' : `${done} The site catches up in about a minute.`);
    return true;
  } catch (err) {
    say(explain(err), true);
    return false;
  } finally {
    buttons.forEach((b) => { b.disabled = false; });
    render();
  }
}

/* ---------------------------------------------------------------- reading -- */

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const kindOf = () => document.querySelector('input[name="r-kind"]:checked').value;

function resetReadForm() {
  editingId = null;
  $('read-form').reset();
  $('r-date').value = today();
  $('read-form-title').textContent = 'Log something you read';
  $('read-save').textContent = 'Save';
  $('read-cancel').hidden = true;
  $('r-url-hint').textContent = 'Paste a journal link and the rest fills itself in when it can.';
}

function editRead(id) {
  const it = docs.reading.items.find((x) => x.id === id);
  if (!it) return;
  editingId = id;
  $('r-url').value = it.url || '';
  $('r-title').value = it.title || '';
  $('r-source').value = it.source || '';
  $('r-authors').value = it.authors || '';
  $('r-date').value = it.date || today();
  $('r-note').value = it.note || '';
  $('r-hidden').checked = Boolean(it.hidden);
  document.querySelector(`input[name="r-kind"][value="${it.kind === 'news' ? 'news' : 'paper'}"]`).checked = true;
  $('read-form-title').textContent = 'Editing';
  $('read-save').textContent = 'Save changes';
  $('read-cancel').hidden = false;
  $('read-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function readFromForm() {
  const entry = {
    id: editingId || Date.now().toString(36),
    title: $('r-title').value.trim(),
    url: $('r-url').value.trim(),
    source: $('r-source').value.trim(),
    authors: $('r-authors').value.trim(),
    kind: kindOf(),
    date: $('r-date').value || today(),
    note: $('r-note').value.trim()
  };
  if ($('r-hidden').checked) entry.hidden = true;
  return entry;
}

async function submitRead(event) {
  event.preventDefault();
  const entry = readFromForm();
  if (!entry.title) return;
  const wasEditing = Boolean(editingId);

  const ok = await save('reading', (doc) => {
    const items = (doc.items || []).filter((x) => x.id !== entry.id);
    if (wasEditing) {
      const at = (doc.items || []).findIndex((x) => x.id === entry.id);
      items.splice(at < 0 ? 0 : at, 0, entry);
    } else {
      items.unshift(entry);                   // newest first
    }
    return { ...doc, items };
  }, `${wasEditing ? 'Edit' : 'Log'}: ${entry.title}`, wasEditing ? 'Changed.' : 'Logged.');

  if (ok) resetReadForm();
}

const changeRead = (id, change, message, done) => save('reading', (doc) => ({
  ...doc,
  items: (doc.items || []).flatMap((x) => (x.id === id ? change(x) : [x]))
}), message, done);

/** A journal link usually carries a DOI, and Crossref will say what a DOI is. */
async function fillFromDoi() {
  let url = $('r-url').value.trim();
  try { url = decodeURIComponent(url); } catch { /* leave it as typed */ }
  const doi = (url.match(/10\.\d{4,9}\/[^\s?#]+/) || [])[0];
  if (!doi || $('r-title').value.trim()) return;

  const hint = $('r-url-hint');
  hint.textContent = 'Looking it up…';
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    if (!res.ok) throw new Error(String(res.status));
    const work = (await res.json()).message || {};
    const plain = (s) => new DOMParser().parseFromString(String(s || ''), 'text/html').body.textContent.replace(/\s+/g, ' ').trim();
    const names = (work.author || []).map((a) => a.family || a.name).filter(Boolean);
    const authors = names.length > 2 ? `${names[0]} et al.` : names.join(' and ');

    if (!$('r-title').value.trim()) $('r-title').value = plain((work.title || [])[0]);
    if (!$('r-source').value.trim()) $('r-source').value = plain((work['container-title'] || [])[0]);
    if (!$('r-authors').value.trim()) $('r-authors').value = authors;
    document.querySelector('input[name="r-kind"][value="paper"]').checked = true;
    hint.textContent = 'Filled in from the DOI. Check it over.';
  } catch {
    hint.textContent = 'Couldn’t look that one up. Fill it in by hand.';
  }
}

function renderReading() {
  const items = docs.reading.items || [];
  $('read-count').textContent = items.length ? `${items.length} logged` : 'Nothing logged yet';
  $('sources').innerHTML = [...new Set(items.map((x) => x.source).filter(Boolean))].map((s) => `<option value="${esc(s)}"></option>`).join('');

  $('read-list').innerHTML = items.map((it) => `
    <li class="log-row${it.hidden ? ' is-hidden' : ''}" data-id="${esc(it.id)}">
      <div>
        <p class="log-title">${esc(it.title)}</p>
        <p class="log-meta">${esc([it.date, it.source, it.kind === 'news' ? 'News' : 'Paper', it.hidden ? 'off the site' : ''].filter(Boolean).join(' · '))}</p>
      </div>
      <div class="log-verbs">
        <button class="quiet" type="button" data-do="edit">Edit</button>
        <button class="quiet" type="button" data-do="hide">${it.hidden ? 'Show' : 'Hide'}</button>
        <button class="quiet" type="button" data-do="delete">Delete</button>
      </div>
    </li>`).join('');
}

function onReadListClick(event) {
  const button = event.target.closest('button[data-do]');
  if (!button) return;
  const id = button.closest('[data-id]').dataset.id;
  const it = docs.reading.items.find((x) => x.id === id);
  if (!it) return;

  if (button.dataset.do === 'edit') editRead(id);
  if (button.dataset.do === 'hide') {
    changeRead(id, (x) => { const { hidden, ...rest } = x; return [hidden ? rest : { ...rest, hidden: true }]; },
      `${it.hidden ? 'Show' : 'Hide'}: ${it.title}`, it.hidden ? 'Back on the site.' : 'Off the site.');
  }
  if (button.dataset.do === 'delete' && confirm(`Delete “${it.title}”?`)) {
    if (editingId === id) resetReadForm();
    changeRead(id, () => [], `Remove: ${it.title}`, 'Deleted.');
  }
}

/* --------------------------------------------------------------- watching -- */

const titleOf = (it) => (typeof it === 'string' ? it : it.title);

function renderWatching() {
  $('shelves-admin').innerHTML = (docs.watching.shelves || []).map((shelf, s) => `
    <section class="shelf-admin" data-shelf="${s}">
      <h2 class="form-title">${esc(shelf.name)}</h2>
      <form class="shelf-add" autocomplete="off">
        <label class="field">
          <span class="field-name">Title</span>
          <input name="title" type="text" required />
        </label>
        <label class="field">
          <span class="field-name">TMDB link</span>
          <input name="tmdb" type="url" inputmode="url" placeholder="optional" spellcheck="false" />
        </label>
        <button class="solid" type="submit">Add</button>
      </form>
      <ol class="log">
        ${(shelf.items || []).map((it, i) => `
        <li class="log-row" data-index="${i}">
          <p class="log-title">${esc(titleOf(it))}</p>
          <div class="log-verbs">
            <button class="quiet" type="button" data-do="up" aria-label="Move ${esc(titleOf(it))} earlier"${i === 0 ? ' disabled' : ''}>Earlier</button>
            <button class="quiet" type="button" data-do="down" aria-label="Move ${esc(titleOf(it))} later"${i === shelf.items.length - 1 ? ' disabled' : ''}>Later</button>
            <button class="quiet" type="button" data-do="remove">Remove</button>
          </div>
        </li>`).join('')}
      </ol>
    </section>`).join('');
}

/** Change one shelf, found by name so a fresh read can't shift it. */
const changeShelf = (name, change, message, done) => save('watching', (doc) => ({
  ...doc,
  shelves: (doc.shelves || []).map((sh) => (sh.name === name ? { ...sh, items: change([...(sh.items || [])]) } : sh))
}), message, done);

function onShelfSubmit(event) {
  const form = event.target.closest('.shelf-add');
  if (!form) return;
  event.preventDefault();
  const shelf = docs.watching.shelves[Number(form.closest('[data-shelf]').dataset.shelf)];
  const title = form.elements.title.value.trim();
  if (!title) return;

  const [, kind, id] = form.elements.tmdb.value.match(/themoviedb\.org\/(movie|tv)\/(\d+)/) || [];
  if (form.elements.tmdb.value.trim() && !id) { say('That TMDB link should look like themoviedb.org/movie/12345.', true); return; }
  if ((shelf.items || []).some((it) => titleOf(it).toLowerCase() === title.toLowerCase())) { say(`${title} is already there.`, true); return; }

  const item = id ? { title, tmdb: `${kind}/${id}` } : title;
  changeShelf(shelf.name, (items) => [item, ...items.filter((it) => titleOf(it).toLowerCase() !== title.toLowerCase())],
    `Watched: ${title}`, 'Added.');
}

function onShelfClick(event) {
  const button = event.target.closest('button[data-do]');
  if (!button) return;
  const shelf = docs.watching.shelves[Number(button.closest('[data-shelf]').dataset.shelf)];
  const title = titleOf(shelf.items[Number(button.closest('[data-index]').dataset.index)]);
  // by title, not by position: the fresh copy of the list may have moved
  const move = (step) => (items) => {
    const i = items.findIndex((it) => titleOf(it) === title);
    const j = i + step;
    if (i < 0 || j < 0 || j >= items.length) return items;
    [items[i], items[j]] = [items[j], items[i]];
    return items;
  };

  if (button.dataset.do === 'up') changeShelf(shelf.name, move(-1), `Reorder: ${title}`, 'Moved.');
  if (button.dataset.do === 'down') changeShelf(shelf.name, move(1), `Reorder: ${title}`, 'Moved.');
  if (button.dataset.do === 'remove' && confirm(`Remove “${title}”?`)) {
    changeShelf(shelf.name, (items) => items.filter((it) => titleOf(it) !== title), `Remove: ${title}`, 'Removed.');
  }
}

/* ------------------------------------------------------------------- desk -- */

function render() {
  renderReading();
  renderWatching();
}

function showTab(name) {
  ['reading', 'watching'].forEach((key) => {
    $(`tab-${key}`).setAttribute('aria-selected', String(key === name));
    $(`panel-${key}`).hidden = key !== name;
  });
  say('');
}

async function openDesk() {
  $('gate').hidden = true;
  $('desk').hidden = false;
  $('sign-out').hidden = PREVIEW;
  resetReadForm();
  say('Loading…');
  try {
    const [reading, watching] = await Promise.all([readFile('reading'), readFile('watching')]);
    if (reading.data) docs.reading = reading.data;
    if (watching.data) docs.watching = watching.data;
    say(PREVIEW ? 'Preview: nothing you do here is saved.' : '');
  } catch (err) {
    say(explain(err), true);
  }
  render();
}

function showGate(message) {
  $('desk').hidden = true;
  $('sign-out').hidden = true;
  $('gate').hidden = false;
  $('gate-status').textContent = message || '';
}

async function unlock(event) {
  event.preventDefault();
  token = $('token').value.trim();
  $('gate-status').textContent = 'Checking…';
  try {
    const repo = await gh('');
    if (!repo.permissions || !repo.permissions.push) throw new ApiError(403, 'read-only');
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* fine: it lasts until the tab closes */ }
    $('token').value = '';
    openDesk();
  } catch (err) {
    token = '';
    $('gate-status').textContent = err.status === 401
      ? 'GitHub doesn’t recognise that token.'
      : 'That token can’t write to zanderjein.github.io. Check steps 2 and 3.';
  }
}

function signOut() {
  token = '';
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* nothing stored */ }
  showGate('Forgotten. Paste a token to come back.');
}

$('gate-form').addEventListener('submit', unlock);
$('sign-out').addEventListener('click', signOut);
$('tab-reading').addEventListener('click', () => showTab('reading'));
$('tab-watching').addEventListener('click', () => showTab('watching'));
$('read-form').addEventListener('submit', submitRead);
$('read-cancel').addEventListener('click', resetReadForm);
$('r-url').addEventListener('change', fillFromDoi);
$('read-list').addEventListener('click', onReadListClick);
$('shelves-admin').addEventListener('submit', onShelfSubmit);
$('shelves-admin').addEventListener('click', onShelfClick);

if (token || PREVIEW) openDesk(); else showGate();
