# Mirror Strip (Button-Based Loop) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Operate the mirror loop from the browser — capture + celebration on live ninjaruss.net/status (localStorage, phone-friendly), full file-writing loop on localhost:4321/status via dev-only API routes, plus a double-clickable launcher.

**Architecture:** A self-contained `MirrorStrip.astro` component renders on /status everywhere; base buttons write log lines to localStorage on the live site, or POST to dev-only API routes locally. Export/import/append file operations are extracted from the CLI scripts into a shared `src/utils/mirror/fsOps.ts` so scripts and routes stay one source of truth. API routes are `prerender = false` and return 404 unless `import.meta.env.DEV`.

**Tech Stack:** Astro 5 API routes, vanilla TS client scripts (Astro-bundled `<script>` importing pure utils), WebAudio (no sound asset), vitest.

**Spec:** Addendum in `docs/superpowers/specs/2026-07-29-status-pause-menu-design.md`.

**Out of scope:** No backend/auth/sync service; no Phase 2 UI; no changes to CLI behavior beyond the fsOps extraction; no page redesign — the strip is added to the existing Status tab.

---

### Task 1: Extract shared fsOps + pure merge helper (TDD)

**Files:**
- Create: `src/utils/mirror/fsOps.ts`
- Modify: `src/utils/mirror/log.ts` (add `mergeLogLines`)
- Modify: `scripts/mirror/export.ts`, `scripts/mirror/import.ts`, `scripts/mirror/cli.ts` (become thin wrappers)
- Delete: `scripts/mirror/io.ts` (constants move to fsOps; the small `report` helper is inlined into import.ts — see Step 6)
- Test: `src/tests/mirror.test.ts` (append)

- [ ] **Step 1: Write failing test for `mergeLogLines`** — append to `src/tests/mirror.test.ts`:

```ts
import { mergeLogLines } from '../utils/mirror/log';

describe('mergeLogLines', () => {
  it('appends only lines not already present, preserving order', () => {
    const existing = '- 2026-07-29 13:00 | done | already here\n';
    const pasted = [
      '- 2026-07-29 13:00 | done | already here',
      '- 2026-07-29 14:00 | start | new from phone',
      'junk line',
    ].join('\n');
    expect(mergeLogLines(existing, pasted)).toBe(
      '- 2026-07-29 13:00 | done | already here\n- 2026-07-29 14:00 | start | new from phone\n'
    );
  });

  it('returns existing unchanged when paste has nothing new', () => {
    const existing = '- 2026-07-29 13:00 | done | a\n';
    expect(mergeLogLines(existing, '- 2026-07-29 13:00 | done | a')).toBe(existing);
  });
});
```

- [ ] **Step 2: Run `npm run test`** — expect FAIL.

- [ ] **Step 3: Implement `mergeLogLines` in `src/utils/mirror/log.ts`**:

```ts
/** Merge pasted log text into existing log content. Valid new lines are
 *  appended in pasted order; exact-duplicate lines and junk are dropped. */
export function mergeLogLines(existing: string, pasted: string): string {
  const have = new Set(
    parseLogLines(existing).map(l => `- ${l.ts} | ${l.kind} | ${l.text}`)
  );
  const fresh = parseLogLines(pasted)
    .map(l => `- ${l.ts} | ${l.kind} | ${l.text}`)
    .filter(line => !have.has(line));
  if (fresh.length === 0) return existing;
  const base = existing.endsWith('\n') || existing === '' ? existing : existing + '\n';
  return base + fresh.join('\n') + '\n';
}
```

- [ ] **Step 4: Run `npm run test`** — expect PASS.

- [ ] **Step 5: Create `src/utils/mirror/fsOps.ts`** (node-only; imported by scripts and API routes, never by client code):

```ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { formatLogLine, parseLogLines, linesAfter, mergeLogLines, LOG_FILE_NAME, type LogKind } from './log';
import { buildMirrorPrompt } from './prompt';
import { validateMirrorResponse } from './schema';
import { slugify } from '../novel';

export const LOG_FILE = path.resolve(LOG_FILE_NAME);
export const PROMPT_FILE = path.resolve('mirror-prompt.txt');
export const RESPONSE_FILE = path.resolve('mirror-response.json');
export const EXPORTED_MARK_FILE = path.resolve('mirror-exported.txt');
export const SESSIONS_DIR = path.resolve('src/content/sessions');
export const QUESTS_FILE = path.resolve('src/content/sessions/_quests.md');

export function appendLog(kind: LogKind, text: string, at: Date = new Date()): string {
  const line = formatLogLine(kind, text, at);
  fs.appendFileSync(LOG_FILE, line + '\n');
  return line;
}

export function mergePastedLog(pasted: string): { added: number } {
  const existing = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '';
  const merged = mergeLogLines(existing, pasted);
  const added = parseLogLines(merged).length - parseLogLines(existing).length;
  if (added > 0) fs.writeFileSync(LOG_FILE, merged);
  return { added };
}

export function runExport(): { ok: true; prompt: string; lineCount: number } | { ok: false; error: string } {
  if (!fs.existsSync(LOG_FILE)) {
    return { ok: false, error: 'mirror-log.md not found. Log a session first.' };
  }
  const lines = parseLogLines(fs.readFileSync(LOG_FILE, 'utf-8'));
  if (lines.filter(l => l.kind === 'done').length === 0) {
    return { ok: false, error: 'No completed sessions in mirror-log.md yet.' };
  }
  const quests = fs.existsSync(QUESTS_FILE) ? fs.readFileSync(QUESTS_FILE, 'utf-8') : '';
  const prompt = buildMirrorPrompt(lines, quests);
  fs.writeFileSync(PROMPT_FILE, prompt);
  const maxTs = lines.reduce((m, l) => (l.ts > m ? l.ts : m), '');
  fs.writeFileSync(EXPORTED_MARK_FILE, maxTs);
  return { ok: true, prompt, lineCount: lines.length };
}

export interface ImportOutcome {
  ok: boolean;
  written: string[];
  warnings: string[];
  errors: string[];
}

/** Validate a model response and write session entries. Pass raw response text. */
export function runImport(responseText: string): ImportOutcome {
  const result = validateMirrorResponse(responseText);
  if (!result.data) {
    return { ok: false, written: [], warnings: result.warnings, errors: result.errors };
  }
  const written: string[] = [];
  for (const s of result.data) {
    let file = path.join(SESSIONS_DIR, `${s.date}-${slugify(s.title)}.md`);
    let n = 2;
    while (fs.existsSync(file)) {
      file = path.join(SESSIONS_DIR, `${s.date}-${slugify(s.title)}-${n++}.md`);
    }
    const frontmatter: Record<string, unknown> = {
      title: s.title,
      publishedAt: s.date,
      stats: s.stats,
      summary: s.summary,
      ...(s.memorable ? { memorable: s.memorable } : {}),
      ...(s.quest ? { quest: s.quest } : {}),
      nextStep: s.nextStep,
      reflection: s.reflection,
      streamed: s.streamed,
      draft: false,
    };
    fs.writeFileSync(file, matter.stringify('', frontmatter));
    written.push(path.basename(file));
  }
  consumeLog();
  return { ok: true, written, warnings: result.warnings, errors: [] };
}

/** After a successful import: keep only log lines newer than the exported mark. */
function consumeLog(): void {
  if (fs.existsSync(EXPORTED_MARK_FILE)) {
    const mark = fs.readFileSync(EXPORTED_MARK_FILE, 'utf-8').trim();
    const log = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '';
    const keep = linesAfter(log, mark)
      .map(l => `- ${l.ts} | ${l.kind} | ${l.text}`)
      .join('\n');
    fs.writeFileSync(LOG_FILE, keep ? keep + '\n' : '');
    fs.unlinkSync(EXPORTED_MARK_FILE);
  } else if (fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '');
  }
}
```

Note for the implementer: this consolidates logic currently living in `scripts/mirror/export.ts` and `scripts/mirror/import.ts` — read them first; behavior must be identical (including `nextStep`/`reflection` now written unconditionally, which validation already guarantees non-empty — this also resolves a prior review nit).

- [ ] **Step 6: Rewrite the three scripts as thin wrappers.**

`scripts/mirror/cli.ts` — keep argv parsing, usage, flourish; replace the appendFileSync block with `appendLog(command as LogKind, text)` imported from fsOps.

`scripts/mirror/export.ts`:

```ts
import { runExport, PROMPT_FILE } from '../../src/utils/mirror/fsOps';

const r = runExport();
if (!r.ok) {
  console.error(`✗ ${r.error}`);
  process.exit(1);
}
console.log(`Wrote ${PROMPT_FILE} (${r.lineCount} log lines).`);
console.log('');
console.log('Next steps:');
console.log('  1. Paste the contents of mirror-prompt.txt into DeepSeek chat (or any chatbot).');
console.log('  2. Save its reply as mirror-response.json in the project root.');
console.log('  3. Run: npm run mirror:import');
```

`scripts/mirror/import.ts`:

```ts
import fs from 'node:fs';
import { runImport, RESPONSE_FILE } from '../../src/utils/mirror/fsOps';

if (!fs.existsSync(RESPONSE_FILE)) {
  console.error(`✗ ${RESPONSE_FILE} not found.`);
  console.error('  Run `npm run mirror:export`, paste mirror-prompt.txt into DeepSeek chat,');
  console.error('  and save the reply as mirror-response.json first.');
  process.exit(1);
}

const outcome = runImport(fs.readFileSync(RESPONSE_FILE, 'utf-8'));
for (const w of outcome.warnings) console.warn(`⚠ ${w}`);
for (const e of outcome.errors) console.error(`✗ ${e}`);

if (!outcome.ok) {
  console.error('\nNothing was written. Fix the response (or re-paste) and retry.');
  process.exit(1);
}

fs.unlinkSync(RESPONSE_FILE);
console.log(`✓ Wrote ${outcome.written.length} session(s):`);
for (const f of outcome.written) console.log(`  src/content/sessions/${f}`);
console.log('  Review with `git diff src/content/sessions/`, then commit.');
```

Delete `scripts/mirror/io.ts` (RESPONSE_FILE now comes from fsOps; `report` is inlined above).

Note: response-file deletion stays in the script (the API route in Task 2 receives pasted text and has no response file). `consumeLog` runs inside `runImport` in both paths.

- [ ] **Step 7: Re-verify the CLI flow end-to-end** (same smoke test as the Phase 1 plan Task 7 Step 7 — done/export/hand-written response/import/build; clean up scratch files and the smoke session entry afterward). All 179 tests + build must pass.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "refactor: extract mirror fsOps core shared by CLI and upcoming API routes"
```

---

### Task 2: Dev-only API routes

**Files:**
- Create: `src/pages/api/mirror/log.ts`
- Create: `src/pages/api/mirror/export.ts`
- Create: `src/pages/api/mirror/import.ts`

All three share the same guard shape (follow `src/pages/api/twitch-live.ts` style):

- [ ] **Step 1: Create `src/pages/api/mirror/log.ts`**:

```ts
export const prerender = false;

import type { APIRoute } from 'astro';
import { appendLog, mergePastedLog } from '../../../utils/mirror/fsOps';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return json({ error: 'Not found' }, 404);
  const body = (await request.json().catch(() => null)) as
    | { kind?: string; text?: string; paste?: string }
    | null;
  if (!body) return json({ error: 'Invalid JSON body' }, 400);

  if (typeof body.paste === 'string') {
    const { added } = mergePastedLog(body.paste);
    return json({ added });
  }
  if ((body.kind === 'start' || body.kind === 'done') && typeof body.text === 'string' && body.text.trim()) {
    const line = appendLog(body.kind, body.text.trim());
    return json({ line });
  }
  return json({ error: 'Expected {kind, text} or {paste}' }, 400);
};
```

- [ ] **Step 2: Create `src/pages/api/mirror/export.ts`**:

```ts
export const prerender = false;

import type { APIRoute } from 'astro';
import { runExport } from '../../../utils/mirror/fsOps';

export const GET: APIRoute = async () => {
  if (!import.meta.env.DEV) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  const r = runExport();
  const status = r.ok ? 200 : 400;
  return new Response(JSON.stringify(r), { status, headers: { 'Content-Type': 'application/json' } });
};
```

- [ ] **Step 3: Create `src/pages/api/mirror/import.ts`**:

```ts
export const prerender = false;

import type { APIRoute } from 'astro';
import { runImport } from '../../../utils/mirror/fsOps';

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  const text = await request.text();
  const outcome = runImport(text);
  return new Response(JSON.stringify(outcome), {
    status: outcome.ok ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 4: Verify by hand against the dev server** (start `npm run dev` in background or use curl against it):

```bash
curl -s -X POST localhost:4321/api/mirror/log -d '{"kind":"done","text":"api smoke"}' -H 'Content-Type: application/json'
curl -s localhost:4321/api/mirror/export | head -c 200
curl -s -X POST localhost:4321/api/mirror/import -d '{"sessions":[{"date":"2026-07-29","title":"API Smoke","summary":"API route check.","stats":["Chaos"],"reflection":"It works.","nextStep":"Clean up.","streamed":false}]}'
```

Expected: `{"line":"- ... | done | api smoke"}`, `{"ok":true,"prompt":"You are a mirror...`, `{"ok":true,"written":["2026-07-29-api-smoke.md"],...}`. Then verify the prod build does NOT expose them meaningfully: `npm run build` must pass (routes compile; the DEV guard makes them 404 at runtime in prod). Clean up: `rm src/content/sessions/2026-07-29-api-smoke.md mirror-prompt.txt` and `rm -f mirror-log.md mirror-exported.txt mirror-response.json`; stop the dev server.

- [ ] **Step 5: Run `npm run test`, commit**

```bash
git add -A && git commit -m "feat: dev-only mirror API routes (log/export/import)"
```

---

### Task 3: MirrorStrip component on /status

**Files:**
- Create: `src/components/MirrorStrip.astro`
- Modify: `src/pages/status/index.astro` (import + render the strip inside the Status tab panel, near the objective panel; exact placement: directly under the objective/`s-obj` block so it reads as part of the Status screen)

- [ ] **Step 1: Create `src/components/MirrorStrip.astro`** — self-contained (markup + scoped styles + bundled script). Requirements:

**Frontmatter:** `const dev = import.meta.env.DEV;` — dev-only blocks are conditionally rendered server-side (`{dev && (...)}`), so production HTML contains no dev panel at all.

**Markup (base, always rendered):**
- Container `section.mirror-strip` with a `p4g-tab`-style kicker label `MIRROR`.
- Three buttons: `#mirror-start` (`▶ set intention`), `#mirror-done` (`★ session complete`), `#mirror-copy` (`⧉ copy log`), plus a status line `#mirror-msg` (aria-live="polite") and a hidden-by-default `#mirror-clear` (`clear log`) button shown only after a successful copy.
- A full-strip overlay `#mirror-sweep` for the gold sweep (skewed gold panel, same visual family as `.latest-tile__sweep`; static/no-op under `prefers-reduced-motion`).

**Markup (dev-only, inside `{dev && ...}`):**
- `details.mirror-dev` panel labeled "local mirror (dev)": textarea `#mirror-paste-log` + button `#mirror-merge` ("merge pasted log"), button `#mirror-prompt` ("⧉ copy DeepSeek prompt"), textarea `#mirror-reply` + button `#mirror-import` ("import reply"), results list `#mirror-results`.

**Client script (one `<script>` tag; Astro bundles it; may import pure utils):**

```ts
import { formatLogLine } from '../utils/mirror/log';
```

- `const IS_DEV = import.meta.env.DEV;` (statically replaced by Vite in the bundle).
- Storage: key `mirror-log`; `readLog()`/`writeLog()` wrap localStorage with try/catch (Safari private mode).
- `logLine(kind)`: `window.prompt(...)` for the rough text (empty/cancel → no-op). Build the line with `formatLogLine(kind, text, new Date())`. If `IS_DEV`: `fetch('/api/mirror/log', {method:'POST', body: JSON.stringify({kind, text}), headers})` and on failure fall back to localStorage with a message. Else: append to localStorage.
- On `done`: fire the flourish — `playFlourish()` (WebAudio: short rising three-note arpeggio, ~0.4s, created lazily on user gesture; wrap all WebAudio in try/catch) + add `is-sweeping` class to the strip for the gold sweep animation (remove on `animationend`); set `#mirror-msg` to `★ recorded. celebrate for real.` Under `prefers-reduced-motion` (matchMedia check) skip the sweep class, keep the sound.
- On `start`: message `▶ intention set. go.`
- `copyLog`: `navigator.clipboard.writeText(readLog())` (message shows line count; on empty log say so); then reveal `#mirror-clear`, which confirms via `window.confirm` before clearing localStorage.
- Dev-only handlers (guard `if (IS_DEV)` around binding): merge → POST `{paste}` to `/api/mirror/log`, show `merged N new line(s)`; prompt → GET `/api/mirror/export`, copy `r.prompt` to clipboard, message `prompt on clipboard (N lines) — paste into DeepSeek`; import → POST textarea text to `/api/mirror/import`, render `outcome.written` as list items (or errors joined, styled red via `.is-error` class).
- All fetch handlers: try/catch with failure message in `#mirror-msg`.
- Wrap init in the shared view-transition-safe pattern: run on `astro:page-load` as well as direct load (see how other page scripts in this repo bind — follow `src/pages/status/index.astro`'s existing script conventions), and guard against double-binding.

**Styles (scoped):** P4G vocabulary — dark panel, gold hairline border, angular corners (`--radius-sm`), `.p4g-tab`-style MIRROR kicker (reuse the global utility class where possible rather than duplicating), buttons as angular gold-outline buttons with `.p4g-sweep`-family hover (gold fill, black text) and `:focus-visible` parity, 44px touch targets, strip stacks vertically ≤480px. Sweep overlay: absolutely-positioned skewed gold panel translating across on `.is-sweeping` (~600ms, `--animation-easing`).

- [ ] **Step 2: Render it in `src/pages/status/index.astro`** — add `import MirrorStrip from '../../components/MirrorStrip.astro';` and place `<MirrorStrip />` directly after the objective panel markup inside the Status tab (find the `s-obj` block; if ambiguous, directly before the Status tab panel's closing container).

- [ ] **Step 3: Verify in the browser (dev)** — with the dev server running, on /status: click all three base buttons (intention → message; done → sound + sweep + message; copy → clipboard + clear appears), then the dev panel end-to-end (merge a pasted line, copy prompt, import a valid hand-written reply → file appears; delete it after). Check reduced-motion (emulate) skips the sweep. Check mobile width (375px) — buttons wrap, 44px targets.

- [ ] **Step 4: Verify production shape** — `npm run build`, then inspect `dist/client/status/index.html` (or `.vercel/output/static/status/index.html`): the strip markup is present, the dev panel markup is ABSENT (no `mirror-dev`, no `mirror-paste-log`).

- [ ] **Step 5: Run `npm run test`, commit**

```bash
git add -A && git commit -m "feat: MirrorStrip on /status — localStorage capture + flourish live, file-writing panel in dev"
```

---

### Task 4: Launcher + docs

**Files:**
- Create: `scripts/mirror/Mirror.command` (committed, executable)
- Copy to: `~/Desktop/Mirror.command`
- Modify: `CLAUDE.md` (Mirror Loop section)

- [ ] **Step 1: Create `scripts/mirror/Mirror.command`**:

```bash
#!/bin/zsh
# Mirror launcher — starts the ninjaruss.net dev server if needed, opens /status.
cd "/Users/ninjaruss/Documents/GitHub/ninjaruss.net"
if ! curl -s -o /dev/null --max-time 1 http://localhost:4321/status; then
  echo "Starting dev server…"
  nohup npm run dev > /tmp/ninjaruss-dev.log 2>&1 &
  for i in {1..60}; do
    sleep 1
    curl -s -o /dev/null --max-time 1 http://localhost:4321/status && break
  done
fi
open "http://localhost:4321/status"
```

```bash
chmod +x scripts/mirror/Mirror.command
cp scripts/mirror/Mirror.command ~/Desktop/Mirror.command
```

- [ ] **Step 2: Verify** — run `~/Desktop/Mirror.command` once: dev server starts (or is reused), browser opens /status. Leave the server running or stop it; either is fine, but say which in the report.

- [ ] **Step 3: Update CLAUDE.md** — in the "Mirror Loop (sessions + /status)" section, append:

```markdown
Button mode: /status carries a MirrorStrip (self-contained `MirrorStrip.astro`) —
on the live site it logs start/done lines to localStorage (exact mirror-log.md
format; ⧉ copy log hands them off) and fires the flourish (WebAudio, no asset);
on `npm run dev` the strip writes straight to mirror-log.md and a dev-only panel
does merge-paste / copy-prompt / import-reply via `src/pages/api/mirror/*`
(prerender=false, 404 unless import.meta.env.DEV; shared core in
`src/utils/mirror/fsOps.ts` — scripts are thin wrappers over the same functions).
`scripts/mirror/Mirror.command` (copy on Desktop) starts dev + opens /status.
```

- [ ] **Step 4: Final verification** — `npm run build && npm run test`, `git status --short` clean except intended files.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: Mirror.command launcher + docs for button-based loop"
```
