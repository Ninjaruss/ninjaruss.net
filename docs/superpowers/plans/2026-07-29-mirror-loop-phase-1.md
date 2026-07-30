# Mirror Loop (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the session momentum loop — a one-keystroke local logger with a completion flourish, a DeepSeek-chat export/import workflow (codex-style manual mode), and the `stream` → `sessions` / `/stream` → `/status` rename.

**Architecture:** Sessions are markdown entries in a renamed `sessions` collection. A tiny CLI appends raw intention/completion lines to a gitignored `mirror-log.md` and plays a rank-up flourish. `mirror:export` assembles a prompt (raw lines + quest menu + strict JSON output contract with anti-rumination rules); the user pastes it into DeepSeek chat and saves the reply; `mirror:import` validates strictly and writes proper session entries. Same trust model as the existing codex manual mode (`scripts/codex/`).

**Tech Stack:** Astro 5 content collections (zod), tsx scripts, gray-matter, vitest. No API keys, no local model.

**Spec:** `docs/superpowers/specs/2026-07-29-status-pause-menu-design.md`. This plan is Phase 1 ONLY — the `/status` visual rebuild (Phase 2) is gated behind two weeks of real use and gets its own plan.

**Out of scope (do not build):** rank names/`ranks.json`, the status-screen layout (epigraph strip, portrait row, quest cards), homepage tile changes beyond what the rename forces, XP/streaks/decay of any kind.

---

### Task 1: Rename the `stream` collection to `sessions`

The content directory, the zod schema (with four new optional fields), the backfill of `streamed: true` on existing entries, and every `getCollection('stream')` call site. The site must build at the end of this task.

**Files:**
- Modify: `src/content/config.ts:48-59` (schema) and `:79-86` (collections export)
- Move: `src/content/stream/` → `src/content/sessions/` (includes `_quests.md`)
- Modify: `src/pages/index.astro:93`
- Modify: `src/pages/stream/index.astro:47` and the `readFileSync` quest path (search for `_quests`)

- [ ] **Step 1: Move the content directory**

```bash
git mv src/content/stream src/content/sessions
```

- [ ] **Step 2: Backfill `streamed: true` on existing entries**

All existing entries were literal streams. Insert the field before the closing frontmatter fence (`_quests.md` has no frontmatter and is excluded by the glob):

```bash
for f in src/content/sessions/2026-*.md; do
  awk 'BEGIN{n=0} /^---$/{n++; if(n==2){print "streamed: true"}} {print}' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done
grep -c "streamed: true" src/content/sessions/2026-*.md | grep -v ":1$" || echo "all files have exactly one streamed field"
```

Expected: the final grep prints `all files have exactly one streamed field`.

- [ ] **Step 3: Update the schema in `src/content/config.ts`**

Replace the `stream` collection definition (lines 48–59) with:

```ts
// Sessions collection — logged work sessions (Japanese, writing, streams, …)
const sessions = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    stats: z.array(z.enum(['Determination', 'Insight', 'Expression', 'Sincerity', 'Chaos'])),
    summary: z.string(),
    memorable: z.string().optional(),
    streamed: z.boolean().default(false),
    reflection: z.string().optional(), // bounded mirror synthesis (2-3 sentences)
    nextStep: z.string().optional(),   // the one forward-pointing action
    quest: z.string().optional(),      // active-quest text this session advanced
    draft: z.boolean().default(false),
  }),
});
```

And in the `collections` export, replace `stream,` with `sessions,`.

- [ ] **Step 4: Update call sites**

In `src/pages/index.astro:93`:

```ts
const streamSessions = await getCollection('sessions', ({ data }) => !data.draft);
```

In `src/pages/stream/index.astro:47`:

```ts
const streamEntries = await getCollection('sessions', ({ data }) => !data.draft);
```

In `src/pages/stream/index.astro`, find the `readFileSync` line referencing `src/content/stream/_quests.md` and change the path to `src/content/sessions/_quests.md`.

```bash
grep -rn "content/stream" src/ && echo "STALE REFS FOUND — fix them" || echo "clean"
```

Expected: `clean`.

- [ ] **Step 5: Build and test**

```bash
rm -rf .astro && npm run build && npm run test
```

Expected: build succeeds, all existing tests pass. (Stale-cache glob warnings are expected after a content move — the `rm -rf .astro` handles them.)

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "refactor: rename stream collection to sessions with streamed/reflection/nextStep/quest fields"
```

---

### Task 2: Rename `utils/stream.ts` → `utils/sessions.ts` and retarget tests

Pure mechanical rename; tests are the safety net.

**Files:**
- Move: `src/utils/stream.ts` → `src/utils/sessions.ts`
- Move: `src/tests/stream.test.ts` → `src/tests/sessions.test.ts`
- Modify imports in: `src/pages/index.astro:8`, `src/pages/stream/index.astro:7-16`, `src/tests/sessions.test.ts:6`, `src/tests/streamTile.test.ts`

- [ ] **Step 1: Move files**

```bash
git mv src/utils/stream.ts src/utils/sessions.ts
git mv src/tests/stream.test.ts src/tests/sessions.test.ts
```

- [ ] **Step 2: Update imports**

In each file that imports from `utils/stream`, change the specifier:
- `src/pages/index.astro:8`: `from '../utils/sessions'`
- `src/pages/stream/index.astro` (import block ending line 16): `from '../../utils/sessions'`
- `src/tests/sessions.test.ts`: `from '../utils/sessions'`
- `src/tests/streamTile.test.ts`: check with grep and update any `utils/stream` import to `utils/sessions`

```bash
grep -rn "utils/stream" src/ && echo "STALE REFS" || echo "clean"
```

Expected: `clean`.

- [ ] **Step 3: Build, test, commit**

```bash
npm run build && npm run test
git add -A && git commit -m "refactor: rename utils/stream to utils/sessions"
```

---

### Task 3: Move `/stream` → `/status` with a 301 redirect

**Files:**
- Move: `src/pages/stream/` → `src/pages/status/`
- Modify: `astro.config.mjs:12-15` (redirects)
- Modify: `src/components/NavPill.astro:16`

- [ ] **Step 1: Move the page directory**

```bash
git mv src/pages/stream src/pages/status
```

- [ ] **Step 2: Add the redirect in `astro.config.mjs`**

```js
  redirects: {
    '/media': '/shelf',
    '/media/[...slug]': '/shelf/[...slug]',
    '/stream': '/status',
  },
```

- [ ] **Step 3: Update NavPill**

`src/components/NavPill.astro:16`:

```ts
  { href: '/status', label: 'Status', match: ['/status'] },
```

- [ ] **Step 4: Update internal links to `/stream`**

```bash
grep -rn '"/stream"' src/ --include="*.astro" --include="*.ts"
```

Update each hit (known: `src/pages/index.astro:300` stream-tile `href`, `:494` mail-tile `href`; there may be others — fix all) to `"/status"`. Re-run the grep; expected: no hits.

- [ ] **Step 5: Build, verify redirect, test, commit**

```bash
npm run build && npm run test
grep -rn "stream" dist/client/status/index.html >/dev/null && echo "status page built"
```

Expected: build passes, `status page built`.

```bash
git add -A && git commit -m "refactor: move /stream to /status with 301 redirect"
```

---

### Task 4: Restructure `_quests.md` and add `parseQuestFile`

New structure: `## The Question` (epigraph), `## Active` (max 3, optional `[Stat]` prefix), `## Ideas — <Stat>` (unchanged), `## Completed` (append-only, `YYYY-MM-DD — [Stat] text`). The old `parseQuestMenu` stays for the Phase 1 page render (the page will show the new sections as plain categories — cosmetically imperfect, fixed in Phase 2 by design).

**Files:**
- Modify: `src/content/sessions/_quests.md`
- Modify: `src/utils/sessions.ts` (add types + `parseQuestFile`)
- Test: `src/tests/sessions.test.ts`

- [ ] **Step 1: Restructure the quest file**

Replace the full contents of `src/content/sessions/_quests.md` with (preserving the user's existing quest text):

```markdown
## The Question

Truly identify the overarching singular goal for my life.

## Active

- [Expression] Posting live shut up and yaps

## Ideas — Determination

## Ideas — Insight

- Play Persona 4 Golden / Trails in the Sky the 1st / Wagotabi to learn more vocab
- Watch a children's show in Japanese (Doraemon?)

## Ideas — Expression

- Sing COLORS by FLOW karaoke (with proper singing voice)
- Draw/design a new profile asset

## Ideas — Sincerity

- Search for simple ways to interact with Japanese people

## Ideas — Chaos

- Motorcycle scuffed stream

## Completed
```

(The old "Truly identify…" active quest becomes the epigraph per spec; "Posting live shut up and yaps" is promoted from Ideas to Active since it passes the 48-hour test. The user curates from here.)

- [ ] **Step 2: Write failing tests for `parseQuestFile`**

Append to `src/tests/sessions.test.ts`:

```ts
import { parseQuestFile } from '../utils/sessions';

describe('parseQuestFile', () => {
  const md = [
    '## The Question', '', 'What is the goal?', '',
    '## Active', '', '- [Insight] Read Wagotabi 20 min', '- Untagged quest', '',
    '## Ideas — Chaos', '', '- Motorcycle stream', '',
    '## Completed', '', '- 2026-05-20 — [Sincerity] VRChat quests', '- Old undated quest',
  ].join('\n');

  it('extracts the epigraph question', () => {
    expect(parseQuestFile(md).question).toBe('What is the goal?');
  });

  it('parses active quests with optional stat tags', () => {
    const { active } = parseQuestFile(md);
    expect(active).toEqual([
      { text: 'Read Wagotabi 20 min', stat: 'Insight' },
      { text: 'Untagged quest' },
    ]);
  });

  it('parses ideas per stat', () => {
    expect(parseQuestFile(md).ideas['Chaos']).toEqual(['Motorcycle stream']);
  });

  it('parses completed quests with optional dates', () => {
    const { completed } = parseQuestFile(md);
    expect(completed[0]).toEqual({ date: '2026-05-20', text: 'VRChat quests', stat: 'Sincerity' });
    expect(completed[1]).toEqual({ text: 'Old undated quest' });
  });

  it('tolerates missing sections', () => {
    const empty = parseQuestFile('## Active\n- Solo quest');
    expect(empty.question).toBe('');
    expect(empty.completed).toEqual([]);
    expect(empty.active).toEqual([{ text: 'Solo quest' }]);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `parseQuestFile` is not exported.

- [ ] **Step 4: Implement `parseQuestFile` in `src/utils/sessions.ts`**

```ts
export interface QuestItem {
  text: string;
  stat?: StatName;
}

export interface CompletedQuest extends QuestItem {
  date?: string;
}

export interface QuestFile {
  question: string;
  active: QuestItem[];
  ideas: Partial<Record<StatName, string[]>>;
  completed: CompletedQuest[];
}

function parseStatTag(text: string): QuestItem {
  const m = text.match(/^\[([^\]]+)\]\s*(.+)/);
  if (m && (STAT_ORDER as readonly string[]).includes(m[1])) {
    return { text: m[2].trim(), stat: m[1] as StatName };
  }
  return { text: text.trim() };
}

export function parseQuestFile(markdown: string): QuestFile {
  const result: QuestFile = { question: '', active: [], ideas: {}, completed: [] };
  let section: 'question' | 'active' | 'ideas' | 'completed' | null = null;
  let currentStat: StatName | null = null;

  for (const line of markdown.split('\n')) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      const h = heading[1].trim();
      const ideas = h.match(/^Ideas\s+—\s+(.+)/);
      if (h === 'The Question') section = 'question';
      else if (h === 'Active' || h === 'Active Quests') section = 'active';
      else if (h === 'Completed') section = 'completed';
      else if (ideas && (STAT_ORDER as readonly string[]).includes(ideas[1].trim())) {
        section = 'ideas';
        currentStat = ideas[1].trim() as StatName;
        result.ideas[currentStat] = [];
      } else {
        section = null;
      }
      continue;
    }
    if (section === 'question') {
      const text = line.trim();
      if (text && !result.question) result.question = text;
      continue;
    }
    const item = line.match(/^[-*]\s+(.+)/);
    if (!item) continue;
    if (section === 'active') {
      result.active.push(parseStatTag(item[1]));
    } else if (section === 'ideas' && currentStat) {
      result.ideas[currentStat]!.push(item[1].trim());
    } else if (section === 'completed') {
      const dm = item[1].match(/^(\d{4}-\d{2}-\d{2})\s+—\s+(.+)/);
      if (dm) result.completed.push({ date: dm[1], ...parseStatTag(dm[2]) });
      else result.completed.push(parseStatTag(item[1]));
    }
  }
  return result;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (all suites — including the untouched `parseQuestMenu` tests).

- [ ] **Step 6: Build (the /status page still renders the restructured file via `parseQuestMenu`) and commit**

```bash
npm run build
git add -A && git commit -m "feat: structured quest file (question/active/ideas/completed) + parseQuestFile"
```

---

### Task 5: The `mirror` CLI — one-keystroke session logging with flourish

`npm run mirror -- start "intention"` / `npm run mirror -- done "what happened"`. Appends to gitignored `mirror-log.md`; `done` plays the rank-up flourish (cue for the physical celebration — the sound is the echo, not the reward).

**Files:**
- Create: `src/utils/mirror/log.ts` (pure, testable)
- Create: `scripts/mirror/cli.ts`
- Test: `src/tests/mirror.test.ts`
- Modify: `.gitignore`, `package.json`

- [ ] **Step 1: Write failing tests**

Create `src/tests/mirror.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatLogLine, parseLogLines } from '../utils/mirror/log';

describe('formatLogLine', () => {
  it('formats a done line with local timestamp', () => {
    const at = new Date(2026, 6, 29, 21, 4); // local time
    expect(formatLogLine('done', 'kanji reps, fog, pushed through', at))
      .toBe('- 2026-07-29 21:04 | done | kanji reps, fog, pushed through');
  });

  it('flattens newlines in the text', () => {
    const at = new Date(2026, 6, 29, 9, 0);
    expect(formatLogLine('start', 'line one\nline two', at))
      .toBe('- 2026-07-29 09:00 | start | line one line two');
  });
});

describe('parseLogLines', () => {
  it('round-trips formatted lines and skips junk', () => {
    const md = [
      formatLogLine('start', 'read Wagotabi', new Date(2026, 6, 29, 13, 0)),
      'not a log line',
      formatLogLine('done', 'finished a chapter', new Date(2026, 6, 29, 13, 40)),
    ].join('\n');
    expect(parseLogLines(md)).toEqual([
      { ts: '2026-07-29 13:00', kind: 'start', text: 'read Wagotabi' },
      { ts: '2026-07-29 13:40', kind: 'done', text: 'finished a chapter' },
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — cannot resolve `../utils/mirror/log`.

- [ ] **Step 3: Implement `src/utils/mirror/log.ts`**

```ts
export const LOG_FILE_NAME = 'mirror-log.md';

export type LogKind = 'start' | 'done';

export interface LogLine {
  ts: string;
  kind: LogKind;
  text: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local time on purpose — sessions happen in Russ's day, not UTC's. */
export function formatLogLine(kind: LogKind, text: string, at: Date): string {
  const ts = `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())} ${pad(at.getHours())}:${pad(at.getMinutes())}`;
  return `- ${ts} | ${kind} | ${text.replace(/\s*\n\s*/g, ' ').trim()}`;
}

export function parseLogLines(markdown: string): LogLine[] {
  const out: LogLine[] = [];
  for (const line of markdown.split('\n')) {
    const m = line.match(/^-\s+(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\s+\|\s+(start|done)\s+\|\s+(.+)/);
    if (m) out.push({ ts: m[1], kind: m[2] as LogKind, text: m[3].trim() });
  }
  return out;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Create `scripts/mirror/cli.ts`**

```ts
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { formatLogLine, LOG_FILE_NAME, type LogKind } from '../../src/utils/mirror/log';

const [, , command, ...rest] = process.argv;
const text = rest.join(' ').trim();

if ((command !== 'start' && command !== 'done') || !text) {
  console.error('Usage:');
  console.error('  npm run mirror -- start "after lunch, read Wagotabi 20 min at my desk"');
  console.error('  npm run mirror -- done  "read a chapter, brain fog, pushed through"');
  process.exit(1);
}

const logFile = path.resolve(LOG_FILE_NAME);
fs.appendFileSync(logFile, formatLogLine(command as LogKind, text, new Date()) + '\n');

const gold = (s: string) => `\x1b[1;33m${s}\x1b[0m`;

if (command === 'done') {
  // The flourish is the CUE — celebrate for real (Fogg's Shine). This just marks the moment.
  console.log(gold('★ SESSION COMPLETE ★  recorded.'));
  if (process.platform === 'darwin') {
    execFile('afplay', ['/System/Library/Sounds/Hero.aiff'], () => {});
  } else {
    process.stdout.write('\x07');
  }
} else {
  console.log(gold('▶ intention set. go.'));
}
```

- [ ] **Step 6: Wire up `package.json` and `.gitignore`**

Add to `package.json` scripts:

```json
    "mirror": "tsx scripts/mirror/cli.ts",
```

Append to `.gitignore`:

```
# mirror loop scratch files (like codex-prompt.txt / codex-response.json)
mirror-log.md
mirror-prompt.txt
mirror-response.json
```

- [ ] **Step 7: Smoke-test the CLI**

```bash
npm run mirror -- start "test intention" && npm run mirror -- done "test completion" && cat mirror-log.md && rm mirror-log.md
```

Expected: gold `▶ intention set. go.`, then `★ SESSION COMPLETE ★` with the Hero sound, and two well-formed lines in the log.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: mirror CLI — one-keystroke session logging with completion flourish"
```

---

### Task 6: `mirror:export` — assemble the DeepSeek prompt

**Files:**
- Create: `src/utils/mirror/prompt.ts` (pure)
- Create: `scripts/mirror/io.ts`
- Create: `scripts/mirror/export.ts`
- Test: `src/tests/mirror.test.ts` (append)

- [ ] **Step 1: Write failing tests**

Append to `src/tests/mirror.test.ts`:

```ts
import { buildMirrorPrompt } from '../utils/mirror/prompt';

describe('buildMirrorPrompt', () => {
  const lines = [
    { ts: '2026-07-29 13:00', kind: 'start' as const, text: 'read Wagotabi' },
    { ts: '2026-07-29 13:40', kind: 'done' as const, text: 'finished a chapter' },
  ];

  it('includes raw log lines and quest file', () => {
    const p = buildMirrorPrompt(lines, '## Active\n- [Insight] Read Wagotabi');
    expect(p).toContain('finished a chapter');
    expect(p).toContain('Read Wagotabi');
  });

  it('includes the output contract and anti-rumination rules', () => {
    const p = buildMirrorPrompt(lines, '');
    expect(p).toContain('"sessions"');
    expect(p).toContain('exactly one next step');
    expect(p).toContain('ONLY the JSON');
  });

  it('lists the five valid stats', () => {
    const p = buildMirrorPrompt(lines, '');
    for (const s of ['Determination', 'Insight', 'Expression', 'Sincerity', 'Chaos']) {
      expect(p).toContain(s);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — cannot resolve `../utils/mirror/prompt`.

- [ ] **Step 3: Implement `src/utils/mirror/prompt.ts`**

```ts
import { STAT_ORDER } from '../sessions';
import type { LogLine } from './log';

export function buildMirrorPrompt(lines: LogLine[], questFileRaw: string): string {
  const log = lines.map(l => `- ${l.ts} | ${l.kind} | ${l.text}`).join('\n');
  return `You are a mirror, not a coach. You reflect what was already done — you never
scold, never mention gaps or missed days, never invent tasks that are not in the
quest menu below.

Here are raw session log lines (start = a stated intention, done = a completed
session, in the author's own rough words):

${log}

Here is the author's quest menu (their own words — the only source of quests):

${questFileRaw}

Group the log lines into sessions (a "done" line is a session; pair it with the
preceding "start" line when they clearly belong together). For each session
output:

- date: "YYYY-MM-DD" from the done line's timestamp
- title: a short evocative title in the author's register (≤ 60 chars)
- summary: one factual sentence about what was done
- stats: 1-2 of exactly these names: ${STAT_ORDER.join(', ')}
- memorable: (optional) a striking phrase lifted from the author's own words
- reflection: 2-3 sentences MAX. Bounded and forward-pointing: name what the
  action says about who the author is becoming, then stop. No open questions,
  no doubts, no "you should have". It must resolve, not loop.
- nextStep: exactly one next step — concrete, startable within 48 hours,
  drawn from or consistent with the quest menu. One sentence.
- quest: (optional) the exact text of the Active quest this session advanced,
  verbatim from the menu, if any
- streamed: true only if the author's words say it was streamed/live

Reply with ONLY the JSON, no prose, no code fences:

{"sessions": [{"date": "...", "title": "...", "summary": "...", "stats": ["..."], "memorable": "...", "reflection": "...", "nextStep": "...", "quest": "...", "streamed": false}]}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Create `scripts/mirror/io.ts`**

```ts
import path from 'node:path';

export const LOG_FILE = path.resolve('mirror-log.md');
export const PROMPT_FILE = path.resolve('mirror-prompt.txt');
export const RESPONSE_FILE = path.resolve('mirror-response.json');
export const SESSIONS_DIR = path.resolve('src/content/sessions');
export const QUESTS_FILE = path.resolve('src/content/sessions/_quests.md');

export function report(warnings: string[], errors: string[]): void {
  for (const w of warnings) console.warn(`⚠ ${w}`);
  for (const e of errors) console.error(`✗ ${e}`);
}
```

- [ ] **Step 6: Create `scripts/mirror/export.ts`**

```ts
import fs from 'node:fs';
import { parseLogLines } from '../../src/utils/mirror/log';
import { buildMirrorPrompt } from '../../src/utils/mirror/prompt';
import { LOG_FILE, PROMPT_FILE, QUESTS_FILE } from './io';

if (!fs.existsSync(LOG_FILE)) {
  console.error('✗ mirror-log.md not found. Log a session first: npm run mirror -- done "..."');
  process.exit(1);
}

const lines = parseLogLines(fs.readFileSync(LOG_FILE, 'utf-8'));
if (lines.filter(l => l.kind === 'done').length === 0) {
  console.error('✗ No completed sessions in mirror-log.md yet.');
  process.exit(1);
}

const quests = fs.existsSync(QUESTS_FILE) ? fs.readFileSync(QUESTS_FILE, 'utf-8') : '';
fs.writeFileSync(PROMPT_FILE, buildMirrorPrompt(lines, quests));

console.log(`Wrote ${PROMPT_FILE} (${lines.length} log lines).`);
console.log('');
console.log('Next steps:');
console.log('  1. Paste the contents of mirror-prompt.txt into DeepSeek chat (or any chatbot).');
console.log('  2. Save its reply as mirror-response.json in the project root.');
console.log('  3. Run: npm run mirror:import');
```

- [ ] **Step 7: Add the script to `package.json`**

```json
    "mirror:export": "tsx scripts/mirror/export.ts",
```

- [ ] **Step 8: Smoke-test and commit**

```bash
npm run mirror -- done "smoke test session" && npm run mirror:export && head -5 mirror-prompt.txt && rm mirror-log.md mirror-prompt.txt
git add -A && git commit -m "feat: mirror:export — assemble DeepSeek prompt from session log + quest menu"
```

---

### Task 7: `mirror:import` — validate strictly, write session entries

Reject-all-on-error (spec: nothing written on failure). Unknown stat names are dropped with a warning (matching `tallyStats` tolerance); a session left with zero valid stats is an error.

**Files:**
- Create: `src/utils/mirror/schema.ts` (pure validation)
- Create: `scripts/mirror/import.ts`
- Test: `src/tests/mirror.test.ts` (append)

- [ ] **Step 1: Write failing tests**

Append to `src/tests/mirror.test.ts`:

```ts
import { validateMirrorResponse } from '../utils/mirror/schema';

const validSession = {
  date: '2026-07-29',
  title: 'Wagotabi at the desk',
  summary: 'Read a chapter of Wagotabi.',
  stats: ['Insight'],
  reflection: 'You chose the slow road and walked it anyway. That is the whole method.',
  nextStep: 'Tomorrow after lunch, open Wagotabi for 20 minutes.',
  streamed: false,
};

describe('validateMirrorResponse', () => {
  it('accepts a valid response', () => {
    const r = validateMirrorResponse(JSON.stringify({ sessions: [validSession] }));
    expect(r.errors).toEqual([]);
    expect(r.data).toHaveLength(1);
    expect(r.data![0].title).toBe('Wagotabi at the desk');
  });

  it('strips code fences before parsing', () => {
    const wrapped = '```json\n' + JSON.stringify({ sessions: [validSession] }) + '\n```';
    expect(validateMirrorResponse(wrapped).data).toHaveLength(1);
  });

  it('rejects malformed JSON with nothing written', () => {
    const r = validateMirrorResponse('not json');
    expect(r.data).toBeNull();
    expect(r.errors.length).toBeGreaterThan(0);
  });

  it('rejects a bad date', () => {
    const r = validateMirrorResponse(JSON.stringify({ sessions: [{ ...validSession, date: '29/07/2026' }] }));
    expect(r.data).toBeNull();
  });

  it('drops unknown stats with a warning, errors if none remain', () => {
    const one = validateMirrorResponse(JSON.stringify({ sessions: [{ ...validSession, stats: ['Insight', 'Luck'] }] }));
    expect(one.data![0].stats).toEqual(['Insight']);
    expect(one.warnings.length).toBeGreaterThan(0);

    const none = validateMirrorResponse(JSON.stringify({ sessions: [{ ...validSession, stats: ['Luck'] }] }));
    expect(none.data).toBeNull();
  });

  it('rejects an overlong reflection (rumination guard)', () => {
    const r = validateMirrorResponse(JSON.stringify({ sessions: [{ ...validSession, reflection: 'x'.repeat(601) }] }));
    expect(r.data).toBeNull();
  });

  it('rejects a missing nextStep', () => {
    const r = validateMirrorResponse(JSON.stringify({ sessions: [{ ...validSession, nextStep: '' }] }));
    expect(r.data).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — cannot resolve `../utils/mirror/schema`.

- [ ] **Step 3: Implement `src/utils/mirror/schema.ts`**

```ts
import { STAT_ORDER } from '../sessions';

export interface MirrorSession {
  date: string;
  title: string;
  summary: string;
  stats: string[];
  memorable?: string;
  reflection: string;
  nextStep: string;
  quest?: string;
  streamed: boolean;
}

export interface MirrorResult {
  data: MirrorSession[] | null;
  warnings: string[];
  errors: string[];
}

const MAX_REFLECTION = 600; // chars — the rumination guard, spec invariant
const MAX_NEXT_STEP = 200;

export function validateMirrorResponse(text: string): MirrorResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const fail = (): MirrorResult => ({ data: null, warnings, errors });

  const stripped = text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    errors.push('Response is not valid JSON.');
    return fail();
  }

  const sessions = (parsed as { sessions?: unknown }).sessions;
  if (!Array.isArray(sessions) || sessions.length === 0) {
    errors.push('Expected a non-empty "sessions" array.');
    return fail();
  }

  const out: MirrorSession[] = [];
  sessions.forEach((raw, i) => {
    const s = raw as Record<string, unknown>;
    const at = `sessions[${i}]`;
    const str = (k: string) => (typeof s[k] === 'string' ? (s[k] as string).trim() : '');

    const date = str('date');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
      errors.push(`${at}: invalid date "${date}".`);
    }
    if (!str('title')) errors.push(`${at}: missing title.`);
    if (!str('summary')) errors.push(`${at}: missing summary.`);

    const rawStats = Array.isArray(s.stats) ? (s.stats as unknown[]).map(String) : [];
    const stats = rawStats.filter(st => (STAT_ORDER as readonly string[]).includes(st));
    for (const st of rawStats.filter(st => !(STAT_ORDER as readonly string[]).includes(st))) {
      warnings.push(`${at}: dropped unknown stat "${st}".`);
    }
    if (stats.length === 0) errors.push(`${at}: no valid stats.`);

    const reflection = str('reflection');
    if (!reflection) errors.push(`${at}: missing reflection.`);
    if (reflection.length > MAX_REFLECTION) {
      errors.push(`${at}: reflection over ${MAX_REFLECTION} chars — too long to stay bounded.`);
    }

    const nextStep = str('nextStep');
    if (!nextStep || nextStep.length > MAX_NEXT_STEP) {
      errors.push(`${at}: nextStep must be one short sentence.`);
    }

    out.push({
      date,
      title: str('title'),
      summary: str('summary'),
      stats,
      memorable: str('memorable') || undefined,
      reflection,
      nextStep,
      quest: str('quest') || undefined,
      streamed: s.streamed === true,
    });
  });

  return errors.length > 0 ? fail() : { data: out, warnings, errors };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Create `scripts/mirror/import.ts`**

Reuses `slugify` from `src/utils/novel.ts` (already exported and tested).

```ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { validateMirrorResponse } from '../../src/utils/mirror/schema';
import { slugify } from '../../src/utils/novel';
import { LOG_FILE, RESPONSE_FILE, SESSIONS_DIR, report } from './io';

if (!fs.existsSync(RESPONSE_FILE)) {
  console.error(`✗ ${RESPONSE_FILE} not found.`);
  console.error('  Run `npm run mirror:export`, paste mirror-prompt.txt into DeepSeek chat,');
  console.error('  and save the reply as mirror-response.json first.');
  process.exit(1);
}

const result = validateMirrorResponse(fs.readFileSync(RESPONSE_FILE, 'utf-8'));
report(result.warnings, result.errors);

if (!result.data) {
  console.error('\nNothing was written. Fix the response (or re-paste) and retry.');
  process.exit(1);
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
    ...(s.nextStep ? { nextStep: s.nextStep } : {}),
    ...(s.reflection ? { reflection: s.reflection } : {}),
    streamed: s.streamed,
    draft: false,
  };
  fs.writeFileSync(file, matter.stringify('', frontmatter));
  written.push(path.basename(file));
}

fs.unlinkSync(RESPONSE_FILE);
if (fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, ''); // consumed — sessions now live in content

console.log(`✓ Wrote ${written.length} session(s):`);
for (const f of written) console.log(`  src/content/sessions/${f}`);
console.log('  Review with `git diff src/content/sessions/`, then commit.');
```

- [ ] **Step 6: Add the script to `package.json`**

```json
    "mirror:import": "tsx scripts/mirror/import.ts",
```

- [ ] **Step 7: End-to-end smoke test**

```bash
npm run mirror -- done "smoke: read one Wagotabi chapter"
npm run mirror:export
cat > mirror-response.json << 'EOF'
{"sessions": [{"date": "2026-07-29", "title": "Smoke Test Session", "summary": "End-to-end pipeline check.", "stats": ["Insight"], "reflection": "The loop exists now. That is enough.", "nextStep": "Delete this smoke-test entry.", "streamed": false}]}
EOF
npm run mirror:import
npm run build
git status --short src/content/sessions/
rm src/content/sessions/2026-07-29-smoke-test-session.md mirror-prompt.txt mirror-log.md
```

Expected: import writes the file, `npm run build` validates it against the sessions schema and passes, then the smoke entry is removed.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: mirror:import — strict validation, writes session entries from model response"
```

---

### Task 8: Documentation

**Files:**
- Modify: `CLAUDE.md` (Project Overview area + a new Mirror Loop section; update stream references)

- [ ] **Step 1: Update CLAUDE.md**

1. In the Build & Development Commands block, add after the codex lines:

```
npm run mirror -- start "..."   # log a session intention (appends to gitignored mirror-log.md)
npm run mirror -- done "..."    # log a completed session + rank-up flourish
npm run mirror:export           # manual mode: write mirror-prompt.txt for DeepSeek chat / any chatbot
npm run mirror:import           # validate mirror-response.json → session entries in src/content/sessions/
```

2. Global reference sweep: replace mentions of the `stream` collection with `sessions`, `/stream` with `/status` (noting the 301), `utils/stream.ts` with `utils/sessions.ts`, NavPill "Stream" with "Status". Search: `grep -n "stream" CLAUDE.md` and update each hit that describes renamed things (leave "live-stream"/Twitch behavior descriptions intact — streaming still exists as a session flavor).

3. Add a new section after the Codex System section:

```markdown
## Mirror Loop (sessions + /status)

The sessions collection logs work sessions (Japanese, writing, streams). The loop:
`npm run mirror -- start/done` appends rough lines to gitignored `mirror-log.md`
(the `done` flourish is a cue — the celebration itself is physical, per the design
spec). Every few days: `mirror:export` → paste `mirror-prompt.txt` into DeepSeek
chat → save reply as `mirror-response.json` → `mirror:import` writes validated
session entries (git diff review, then commit — same trust model as codex manual
mode). Design invariants (docs/superpowers/specs/2026-07-29-status-pause-menu-design.md):
stats never decay, no streaks/shame states, reflections are bounded (≤600 chars,
must end in exactly one next step), quests only ever come from the user's own
`src/content/sessions/_quests.md` (sections: The Question / Active / Ideas — <Stat> /
Completed; parsed by `parseQuestFile`). Phase 2 (the /status pause-menu UI) is
gated on two weeks of real use.
```

- [ ] **Step 2: Final verification**

```bash
npm run build && npm run test && git status --short
```

Expected: clean build, all tests pass, only CLAUDE.md modified.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md && git commit -m "docs: document mirror loop, sessions collection, /status rename"
```
