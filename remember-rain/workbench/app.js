const state = { bible: null, active: 'outline', chat: [] };

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function init() {
  state.bible = await fetchJSON('/api/bible');
  state.chat = state.bible.chat || [];
  buildTabs();
  const stamp = state.bible.generatedAt ? new Date(state.bible.generatedAt) : null;
  document.getElementById('meta').textContent = stamp
    ? `refreshed ${stamp.toLocaleTimeString()} · refresh the page to re-read files`
    : 'refresh the page to re-read files';
  renderActive();
  renderChat();
  setInterval(pollChat, 4000);
}

function buildTabs() {
  const nav = document.getElementById('tabs');
  nav.innerHTML = '';
  for (const tab of state.bible.tabs) {
    const b = document.createElement('button');
    b.className = 'tab' + (tab.id === state.active ? ' active' : '');
    b.textContent = tab.title;
    if (tab.id === 'findings') {
      const groups = state.bible.drift.groups.filter((g) => g.variants.some((v) => v.total > 0));
      b.textContent += ` · ${groups.length} drift`;
    }
    b.onclick = () => { state.active = tab.id; buildTabs(); renderActive(); };
    nav.appendChild(b);
  }
}

function renderActive() {
  const tab = state.bible.tabs.find((t) => t.id === state.active);
  const main = document.getElementById('main');
  main.innerHTML = '';
  for (const doc of tab.docs) {
    const sec = document.createElement('section');
    sec.className = 'doc';

    const head = document.createElement('div');
    head.className = 'doc-head';
    const title = document.createElement('h2');
    title.textContent = doc.label;
    head.appendChild(title);
    if (doc.badge) {
      const badge = document.createElement('span');
      badge.className = 'badge badge-' + doc.badge;
      badge.textContent = doc.badge;
      head.appendChild(badge);
    }
    const wc = document.createElement('span');
    wc.className = 'wc';
    wc.textContent = `${doc.words} words`;
    head.appendChild(wc);
    sec.appendChild(head);

    const body = document.createElement('div');
    body.className = 'doc-body';
    body.innerHTML = doc.html;
    sec.appendChild(body);
    main.appendChild(sec);
  }
  if (tab.id === 'findings') main.appendChild(renderDrift());
}

function renderDrift() {
  const drift = state.bible.drift;
  const wrap = document.createElement('section');
  wrap.className = 'drift';

  const h = document.createElement('h2');
  h.textContent = 'Live drift scan (auto-check)';
  wrap.appendChild(h);

  const groups = drift.groups.filter((g) => g.variants.some((v) => v.total > 0));
  if (groups.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No configured term group appears in the corpus.';
    wrap.appendChild(p);
  }

  for (const g of groups) {
    const card = document.createElement('div');
    card.className = 'drift-card';

    const ghead = document.createElement('div');
    ghead.className = 'drift-head';
    const label = document.createElement('strong');
    label.textContent = g.label;
    ghead.appendChild(label);
    if (g.id) {
      const id = document.createElement('span');
      id.className = 'dim';
      id.textContent = ' ' + g.id;
      ghead.appendChild(id);
    }
    card.appendChild(ghead);

    if (g.note) {
      const note = document.createElement('div');
      note.className = 'drift-note';
      note.textContent = g.note;
      card.appendChild(note);
    }

    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Variant</th><th>Plan</th><th>Prose</th><th>Total</th></tr></thead><tbody>'
      + g.variants.map((v) => `<tr><td><code>${escapeHtml(v.term)}</code></td><td>${v.plan}</td><td>${v.prose}</td><td>${v.total}</td></tr>`).join('')
      + '</tbody></table>';
    card.appendChild(table);

    for (const v of g.variants) {
      if (v.hits.length === 0) continue;
      const det = document.createElement('details');
      const sum = document.createElement('summary');
      sum.textContent = `${v.term} — ${v.hits.length} hit(s)`;
      det.appendChild(sum);
      const ul = document.createElement('ul');
      for (const hit of v.hits.slice(0, 50)) {
        const li = document.createElement('li');
        li.className = 'hit';
        li.innerHTML = `<code>${escapeHtml(hit.file)}:${hit.line}</code>`
          + ` <span class="layer layer-${hit.layer}">${hit.layer}</span>`
          + ` <span class="snippet">${escapeHtml(hit.snippet)}</span>`;
        ul.appendChild(li);
      }
      if (v.hits.length > 50) {
        const li = document.createElement('li');
        li.textContent = `… ${v.hits.length - 50} more`;
        ul.appendChild(li);
      }
      det.appendChild(ul);
      card.appendChild(det);
    }
    wrap.appendChild(card);
  }

  if (drift.watch && drift.watch.length) {
    const wh = document.createElement('h3');
    wh.textContent = 'Undefined / watch terms';
    wrap.appendChild(wh);
    const wt = document.createElement('table');
    wt.innerHTML = '<thead><tr><th>Term</th><th>Occurrences</th><th>Note</th></tr></thead><tbody>'
      + drift.watch.map((w) => `<tr><td><code>${escapeHtml(w.term)}</code></td><td>${w.total}</td><td>${escapeHtml(w.note)}</td></tr>`).join('')
      + '</tbody></table>';
    wrap.appendChild(wt);
  }

  if (drift.verified && drift.verified.length) {
    const vh = document.createElement('h3');
    vh.textContent = 'Verified consistent (holds)';
    wrap.appendChild(vh);
    const ul = document.createElement('ul');
    for (const v of drift.verified) {
      const li = document.createElement('li');
      li.textContent = v;
      ul.appendChild(li);
    }
    wrap.appendChild(ul);
  }

  return wrap;
}

// --- chat ---
function renderChat() {
  const log = document.getElementById('chat-log');
  log.innerHTML = '';
  if (state.chat.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'chat-empty';
    empty.textContent = 'Ask me about the story, or instruct me — e.g. "focus-pass Arc 2 scene 2" or "what does the Split do?".';
    log.appendChild(empty);
  }
  for (const m of state.chat) {
    const row = document.createElement('div');
    row.className = 'msg msg-' + m.role;
    const who = document.createElement('div');
    who.className = 'msg-who';
    who.textContent = m.role === 'user' ? 'You' : 'Model';
    row.appendChild(who);
    const body = document.createElement('div');
    body.className = 'msg-body';
    body.innerHTML = m.html || escapeHtml(m.text);
    row.appendChild(body);
    log.appendChild(row);
  }
  log.scrollTop = log.scrollHeight;
}

async function pollChat() {
  try {
    const data = await fetchJSON('/api/chat');
    const next = data.chat || [];
    if (next.length !== state.chat.length) {
      state.chat = next;
      renderChat();
    }
  } catch { /* server may be briefly down */ }
}

function sendChat(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  fetchJSON('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    .then(() => pollChat())
    .catch(() => { input.value = text; });
}

document.getElementById('chat-form').addEventListener('submit', sendChat);
init();
