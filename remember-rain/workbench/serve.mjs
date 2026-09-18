#!/usr/bin/env node
// Remember Rain workbench — zero-dependency local server.
// Serves the tabbed story bible, a live drift scan, and a chat queue that the
// agent (in the harness) polls and answers.
// Reads the repo on every request; refresh the page to re-read files.

import { createServer } from 'node:http';
import { readFileSync, readdirSync, statSync, existsSync, appendFileSync } from 'node:fs';
import { join, extname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const NOVEL_DIR = join(REPO_ROOT, 'src', 'content', 'novel');

const PORT = Number(process.env.PORT || 4242);
const CHAT_FILE = join(__dirname, 'chat.jsonl');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

// --- Scrivener markdown unescape (identical to src/utils/novel.ts) ---
function unescapeScrivenerMarkdown(md) {
  return md.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~])/g, '$1');
}

// --- compact markdown -> HTML ---
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(text) {
  let out = escapeHtml(text);
  const codes = [];
  out = out.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
  return out;
}

function isBlockStart(l) {
  return /^\s*$/.test(l) || /^#{1,6}\s/.test(l) || /^\s*```/.test(l)
    || /^\s*([-*_])(\s*\1){2,}\s*$/.test(l) || /^\s*>\s?/.test(l)
    || /^\s*\|/.test(l) || /^\s*[-*+]\s+/.test(l) || /^\s*\d+[.)]\s+/.test(l);
}

function parseTableRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function renderMarkdown(src) {
  const lines = src.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*<!--/.test(line)) {
      while (i < lines.length && !/-->/.test(lines[i])) i++;
      i++;
      continue;
    }

    if (/^\s*$/.test(line)) { i++; continue; }

    if (/^\s*```/.test(line)) {
      const buf = [line];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(lines[i]); i++; }
      if (i < lines.length) { buf.push(lines[i]); i++; }
      out.push('<pre><code>' + escapeHtml(buf.join('\n')) + '</code></pre>');
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    if (/^\s*>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      out.push('<blockquote>' + renderMarkdown(buf.join('\n')) + '</blockquote>');
      continue;
    }

    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const rows = [parseTableRow(line)];
      i += 2;
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(parseTableRow(lines[i])); i++; }
      const [head, ...body] = rows;
      out.push('<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'
        + body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }

    const isOL = /^\s*\d+[.)]\s+/.test(line);
    const isUL = /^\s*[-*+]\s+/.test(line);
    if (isOL || isUL) {
      const tag = isOL ? 'ol' : 'ul';
      const items = [];
      while (i < lines.length) {
        const li = lines[i];
        if (isOL && /^\s*\d+[.)]\s+/.test(li)) { items.push(li.replace(/^\s*\d+[.)]\s+/, '')); i++; }
        else if (isUL && /^\s*[-*+]\s+/.test(li)) { items.push(li.replace(/^\s*[-*+]\s+/, '')); i++; }
        else break;
      }
      out.push(`<${tag}>` + items.map((it) => `<li>${inline(it)}</li>`).join('') + `</${tag}>`);
      continue;
    }

    const buf = [line];
    i++;
    while (i < lines.length && !isBlockStart(lines[i])) { buf.push(lines[i]); i++; }
    out.push('<p>' + inline(buf.join(' ')) + '</p>');
  }
  return out.join('\n');
}

// --- file helpers ---
function collectMd(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir).sort()) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...collectMd(p));
    else if (entry.endsWith('.md')) out.push(p);
  }
  return out;
}

function readDoc(relPath) {
  const abs = join(REPO_ROOT, relPath);
  if (!existsSync(abs)) return null;
  const raw = readFileSync(abs, 'utf-8');
  const md = unescapeScrivenerMarkdown(raw);
  const html = renderMarkdown(md);
  const words = md.replace(/[#*>`|\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
  return { path: relPath, title: basename(abs, '.md'), html, words };
}

// --- tab definitions ---
const TABS = [
  { id: 'outline', title: 'Outline', docs: [
    { path: 'remember-rain/outline.md', label: 'Refined outline', badge: 'refined' },
    { path: 'src/content/novel/Story Plan/1 The Spine.md', label: 'Spine (source)', badge: 'source' },
    { path: 'src/content/novel/Story Plan/Arc Structure.md', label: 'Arc structure (source)', badge: 'source' },
    { path: 'src/content/novel/Story Plan/Choice Points.md', label: 'Choice points (source)', badge: 'source' },
  ]},
  { id: 'characters', title: 'Characters', docs: collectMd(join(NOVEL_DIR, 'Characters')).map((p) => ({ path: relative(REPO_ROOT, p), label: basename(p, '.md') })) },
  { id: 'setting', title: 'Setting', docs: [
    { path: 'src/content/novel/World/History.md', label: 'History' },
    { path: 'src/content/novel/World/Locations.md', label: 'Locations' },
  ]},
  { id: 'magic', title: 'Magic System', docs: [
    { path: 'src/content/novel/World/Magic System.md', label: 'Magic System' },
  ]},
  { id: 'philosophy', title: 'Philosophy', docs: [
    { path: 'src/content/novel/Story Plan/0 What is Remember Rain.md', label: 'What is Remember Rain' },
    { path: 'src/content/novel/Story Plan/2 Pessimism of Strength.md', label: 'Pessimism of Strength' },
    { path: 'src/content/novel/Story Plan/Themes and Motifs.md', label: 'Themes & Motifs' },
    { path: 'src/content/novel/Story Plan/What does it mean to fall.md', label: 'What does it mean to fall' },
  ]},
  { id: 'findings', title: 'Findings', docs: [
    { path: 'remember-rain/findings.md', label: 'Findings register' },
  ]},
  { id: 'decisions', title: 'Decisions', docs: [
    { path: 'remember-rain/decisions.md', label: 'Decision log' },
  ]},
];

// --- drift scan ---
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadDriftConfig() {
  const p = join(__dirname, 'drift-terms.json');
  if (!existsSync(p)) return { groups: [], watch: [], verified: [] };
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function driftScan() {
  const config = loadDriftConfig();
  const corpus = collectMd(NOVEL_DIR).map((f) => ({
    path: relative(NOVEL_DIR, f),
    text: unescapeScrivenerMarkdown(readFileSync(f, 'utf-8')),
  }));

  const scanVariant = (variant) => {
    const term = typeof variant === 'string' ? variant : variant.term;
    const caseSensitive = typeof variant === 'string' ? false : !!variant.caseSensitive;
    const re = new RegExp('\\b' + escapeRegex(term) + '\\b', caseSensitive ? 'g' : 'gi');
    const hits = [];
    for (const doc of corpus) {
      const lines = doc.text.split('\n');
      for (let n = 0; n < lines.length; n++) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(lines[n])) !== null) {
          hits.push({
            file: doc.path,
            line: n + 1,
            layer: doc.path.startsWith('Manuscript') ? 'prose' : 'plan',
            snippet: lines[n].trim().slice(0, 160),
          });
          if (re.lastIndex === m.index) re.lastIndex++;
        }
      }
    }
    const prose = hits.filter((h) => h.layer === 'prose').length;
    const plan = hits.filter((h) => h.layer === 'plan').length;
    return { term, caseSensitive, hits, prose, plan, total: hits.length };
  };

  const groups = config.groups.map((g) => ({
    id: g.id, label: g.label, note: g.note,
    variants: g.variants.map(scanVariant),
  }));
  const watch = config.watch.map((w) => ({ id: w.id, term: w.term, note: w.note, ...scanVariant(w.term) }));
  return { groups, watch, verified: config.verified };
}

// --- chat queue ---
function readChat() {
  if (!existsSync(CHAT_FILE)) return [];
  return readFileSync(CHAT_FILE, 'utf-8').split('\n').filter(Boolean)
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);
}

function appendChat(role, text) {
  const entry = { role, ts: new Date().toISOString(), text };
  appendFileSync(CHAT_FILE, JSON.stringify(entry) + '\n');
  return entry;
}

function chatPayload() {
  return readChat().map((m) => ({ ...m, html: renderMarkdown(m.text) }));
}

// --- server ---
const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/chat') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => {
        let text = '';
        try { text = String((JSON.parse(body) || {}).text || '').trim(); } catch { text = ''; }
        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: false, error: 'empty message' }));
          return;
        }
        const entry = appendChat('user', text);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, entry }));
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ chat: chatPayload(), generatedAt: new Date().toISOString() }));
    return;
  }

  if (url.pathname === '/api/bible') {
    const tabs = TABS.map((t) => ({
      id: t.id, title: t.title,
      docs: t.docs.map((d) => readDoc(d.path)).filter(Boolean),
    }));
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ tabs, drift: driftScan(), chat: chatPayload(), generatedAt: new Date().toISOString() }));
    return;
  }

  const rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const file = join(__dirname, rel);
  if (!existsSync(file) || statSync(file).isDirectory() || rel === '/chat.jsonl') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream' });
  res.end(readFileSync(file));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Remember Rain workbench → http://127.0.0.1:${PORT}`);
});
