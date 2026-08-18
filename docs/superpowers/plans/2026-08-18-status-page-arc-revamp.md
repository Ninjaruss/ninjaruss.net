# /status Arc Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kill the session-log-driven `/status` pause menu and replace it with a small, low-maintenance, viewer-facing page built around one editorial "current arc" headline card, plus a matching simplification of the homepage's Stream tile.

**Architecture:** Two new pure/testable utility modules (`utils/level.ts` for the word-count-based level number, `utils/currentArc.ts` for parsing the new `_quests.md` section) feed a rewritten `/status` page and a simplified homepage tile. All session-tally math (radar, donut, per-session log rendering, quest board, bonds panel) is deleted from `utils/sessions.ts`, `status.css`, and both `.astro` pages once nothing references it.

**Tech Stack:** Astro 5 content collections, vanilla CSS (P4G design tokens already in `global.css`), vitest for pure-module unit tests.

**Spec:** `docs/superpowers/specs/2026-08-18-status-page-arc-revamp-design.md`

---

## Task 1: Word-count level utility

**Files:**
- Create: `src/utils/level.ts`
- Test: `src/tests/level.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/level.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { LEVEL_WORD_UNIT, countMarkdownWords, computeSiteWordCount, computeSiteLevel } from '../utils/level';

describe('countMarkdownWords', () => {
  it('returns 0 for an empty string', () => {
    expect(countMarkdownWords('')).toBe(0);
  });

  it('strips markdown syntax before counting', () => {
    expect(countMarkdownWords('Hello **world**, this is *great*.')).toBe(5);
  });

  it('strips headings and collapses whitespace across lines', () => {
    const md = '# Heading\n\nSome words here.';
    expect(countMarkdownWords(md)).toBe(3);
  });
});

describe('computeSiteWordCount', () => {
  it('sums story words and every journal body', () => {
    const total = computeSiteWordCount(1000, [
      '# Heading\nSome words here.',
      'More content in second body.',
    ]);
    expect(total).toBe(1008);
  });

  it('returns just the story words when there are no journal bodies', () => {
    expect(computeSiteWordCount(500, [])).toBe(500);
  });
});

describe('computeSiteLevel', () => {
  it('floors at level 1 for zero words', () => {
    expect(computeSiteLevel(0)).toBe(1);
  });

  it('floors at level 1 for any total under one word-unit', () => {
    expect(computeSiteLevel(LEVEL_WORD_UNIT - 1)).toBe(1);
  });

  it('reaches level 2 at 4 word-units (sqrt(4)=2)', () => {
    expect(computeSiteLevel(LEVEL_WORD_UNIT * 4)).toBe(2);
  });

  it('reaches level 3 at 9 word-units (sqrt(9)=3)', () => {
    expect(computeSiteLevel(LEVEL_WORD_UNIT * 9)).toBe(3);
  });

  it('matches the site\'s current pace: ~21k combined words is around level 8', () => {
    expect(computeSiteLevel(21000)).toBe(8);
  });

  it('is monotonic and never decays as words increase', () => {
    let prev = 0;
    for (let words = 0; words <= 200_000; words += 137) {
      const level = computeSiteLevel(words);
      expect(level).toBeGreaterThanOrEqual(prev);
      prev = level;
    }
  });

  it('never returns a level below 1 for negative input', () => {
    expect(computeSiteLevel(-50)).toBe(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/tests/level.test.ts`
Expected: FAIL — `Cannot find module '../utils/level'`

- [ ] **Step 3: Write the implementation**

Create `src/utils/level.ts`:

```typescript
import { stripMarkdown } from './content';

/**
 * Word-count "unit" the level curve is scaled against. Tuned so today's
 * combined novel-manuscript + journal word count (~21k) lands around level 8,
 * matching the pace of the old session-count curve (`level = floor(sqrt(4n))`)
 * it replaces. Adjust freely if the pace ever feels off — it's cosmetic.
 */
export const LEVEL_WORD_UNIT = 300;

/** Word count of a raw markdown string, ignoring markdown syntax. */
export function countMarkdownWords(markdown: string): number {
  const stripped = stripMarkdown(markdown);
  return stripped ? stripped.split(/\s+/).length : 0;
}

/**
 * Total word count that feeds the level number: the novel manuscript's story
 * words (finished prose, not outline/planning docs) plus every journal
 * (notes + showcase) entry body. This only grows as a side effect of writing
 * already happening for the site — no new authoring, no decay.
 */
export function computeSiteWordCount(storyWords: number, journalBodies: string[]): number {
  const journalWords = journalBodies.reduce((sum, body) => sum + countMarkdownWords(body), 0);
  return storyWords + journalWords;
}

/** RPG curve: level = floor(sqrt(totalWords / LEVEL_WORD_UNIT)), min 1, monotonic. */
export function computeSiteLevel(totalWords: number): number {
  const words = Math.max(0, totalWords);
  return Math.max(1, Math.floor(Math.sqrt(words / LEVEL_WORD_UNIT)));
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/tests/level.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/level.ts src/tests/level.test.ts
git commit -m "feat: add word-count-based site level utility"
```

---

## Task 2: Current-arc parser

**Files:**
- Create: `src/utils/currentArc.ts`
- Test: `src/tests/currentArc.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/currentArc.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseCurrentArc } from '../utils/currentArc';

const wellFormed = [
  '## The Question',
  '',
  'Some other section content that must not leak in.',
  '',
  '## Current Arc',
  '',
  '**Arc:** Arc II — Learning to Speak',
  '**Stat:** Insight',
  '**Updated:** August 2026',
  '',
  'Chat\'s split on whether Rain confronts Vesper directly or keeps stalling.',
  'Leaning confront, after two streams of leaning that way.',
  '',
  '## Active',
  '',
  '- Some quest that must not leak in either',
].join('\n');

describe('parseCurrentArc', () => {
  it('returns null for an empty string', () => {
    expect(parseCurrentArc('')).toBeNull();
  });

  it('returns null when there is no Current Arc section', () => {
    const md = '## The Question\n\nWhat is the goal?\n';
    expect(parseCurrentArc(md)).toBeNull();
  });

  it('parses arc, stat, updated, and decision from a well-formed section', () => {
    const result = parseCurrentArc(wellFormed);
    expect(result).toEqual({
      arc: 'Arc II — Learning to Speak',
      stat: 'Insight',
      updated: 'August 2026',
      decision:
        "Chat's split on whether Rain confronts Vesper directly or keeps stalling. Leaning confront, after two streams of leaning that way.",
    });
  });

  it('does not leak content from sections before or after Current Arc', () => {
    const result = parseCurrentArc(wellFormed);
    expect(result?.decision).not.toContain('must not leak');
  });

  it('matches the stat case-insensitively', () => {
    const md = [
      '## Current Arc',
      '**Arc:** Arc I',
      '**Stat:** insight',
      '**Updated:** August 2026',
      '',
      'Deciding something.',
    ].join('\n');
    expect(parseCurrentArc(md)?.stat).toBe('Insight');
  });

  it('falls back to a null stat for an unrecognized value, but keeps the rest', () => {
    const md = [
      '## Current Arc',
      '**Arc:** Arc I',
      '**Stat:** Wisdom',
      '**Updated:** August 2026',
      '',
      'Deciding something.',
    ].join('\n');
    const result = parseCurrentArc(md);
    expect(result?.stat).toBeNull();
    expect(result?.arc).toBe('Arc I');
    expect(result?.decision).toBe('Deciding something.');
  });

  it('returns null when Arc is missing', () => {
    const md = ['## Current Arc', '**Stat:** Insight', '', 'Deciding something.'].join('\n');
    expect(parseCurrentArc(md)).toBeNull();
  });

  it('returns null when there is no decision paragraph', () => {
    const md = ['## Current Arc', '**Arc:** Arc I', '**Stat:** Insight'].join('\n');
    expect(parseCurrentArc(md)).toBeNull();
  });

  it('works when Stat and Updated are omitted but Arc and decision are present', () => {
    const md = ['## Current Arc', '**Arc:** Arc I', '', 'Deciding something.'].join('\n');
    const result = parseCurrentArc(md);
    expect(result).toEqual({ arc: 'Arc I', stat: null, updated: '', decision: 'Deciding something.' });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/tests/currentArc.test.ts`
Expected: FAIL — `Cannot find module '../utils/currentArc'`

- [ ] **Step 3: Write the implementation**

Create `src/utils/currentArc.ts`:

```typescript
import { STAT_ORDER, type StatName } from './sessions';

export interface CurrentArc {
  arc: string;
  stat: StatName | null;
  updated: string;
  decision: string;
}

/**
 * Parses the "## Current Arc" section of `_quests.md`:
 *
 * ## Current Arc
 *
 * **Arc:** Arc II — Learning to Speak
 * **Stat:** Insight
 * **Updated:** August 2026
 *
 * Chat's split on whether Rain confronts Vesper directly or keeps stalling.
 *
 * Returns null if the section is absent, or if it's missing the Arc title or
 * the decision paragraph — a half-filled card would read as broken, so an
 * incomplete section hides the whole card rather than rendering blanks.
 * An unrecognized/missing `Stat` value degrades to `stat: null` (neutral
 * styling) rather than failing the parse — this file is hand-edited and a
 * typo shouldn't be able to break the build.
 */
export function parseCurrentArc(markdown: string): CurrentArc | null {
  const lines = markdown.split(/\r?\n/);
  let inSection = false;
  let arc = '';
  let statRaw = '';
  let updated = '';
  const decisionLines: string[] = [];

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      if (inSection) break; // hit the next section — stop collecting
      inSection = heading[1].trim().toLowerCase() === 'current arc';
      continue;
    }
    if (!inSection) continue;

    const arcMatch = line.match(/^\*\*Arc:\*\*\s*(.+)/i);
    if (arcMatch) { arc = arcMatch[1].trim(); continue; }

    const statMatch = line.match(/^\*\*Stat:\*\*\s*(.+)/i);
    if (statMatch) { statRaw = statMatch[1].trim(); continue; }

    const updatedMatch = line.match(/^\*\*Updated:\*\*\s*(.+)/i);
    if (updatedMatch) { updated = updatedMatch[1].trim(); continue; }

    const text = line.trim();
    if (text) decisionLines.push(text);
  }

  if (!arc || decisionLines.length === 0) return null;

  const stat = (STAT_ORDER as readonly string[]).find(
    s => s.toLowerCase() === statRaw.toLowerCase()
  ) as StatName | undefined;

  return {
    arc,
    stat: stat ?? null,
    updated,
    decision: decisionLines.join(' '),
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/tests/currentArc.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/currentArc.ts src/tests/currentArc.test.ts
git commit -m "feat: add _quests.md Current Arc section parser"
```

---

## Task 3: Seed the Current Arc section in `_quests.md`

**Files:**
- Modify: `src/content/sessions/_quests.md`

- [ ] **Step 1: Add the section**

Prepend a new section to the top of `src/content/sessions/_quests.md` (before `## The Question`), so the file reads:

```markdown
## Current Arc

**Arc:** Arc I — Integration
**Stat:** Expression
**Updated:** August 2026

Posting live "shut up and yap" videos to make the old self and the new self
legible to each other in public, out loud, instead of privately.

## The Question

How can I effectively make my old self integrate into my new self?

## Active

- [Expression] Posting live shut up and yaps

## Ideas — Determination

## Ideas — Insight

- Playing Dead by Daylight in only Japanese

## Ideas — Expression

- Posting a checkpoint video of the story structure for Remember Rain so far

## Ideas — Sincerity

- Post a Shut up and YAP on backsliding and/or the pessimism of strength (in spite of it all philosophy)

## Ideas — Chaos

- Walk and talk live stream

## Completed
```

This is starter content for Russ to rewrite in his own words once the page is live — it exists so the page and its tests have something real to render rather than an empty state. The rest of the file (Question/Active/Ideas/Completed) is unchanged and stays as private planning scaffold, not rendered on `/status` after Task 5.

- [ ] **Step 2: Commit**

```bash
git add src/content/sessions/_quests.md
git commit -m "content: seed the Current Arc section for the new /status page"
```

---

## Task 4: Rewrite `status.css`

**Files:**
- Modify: `src/styles/status.css` (full rewrite)

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/styles/status.css` with:

```css
/* ============================================================
   Status Page — Persona Arc Card
   One flat screen: identity header, arc headline card, a level
   chip + find-me-elsewhere links row, and a mailbox strip.
   Supersedes the pause-menu design (Log/Quests/Bonds screens,
   stat radar/donut) — see docs/superpowers/specs/
   2026-08-18-status-page-arc-revamp-design.md.
   ============================================================ */

.status-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 4rem 1.5rem calc(var(--nav-clearance, 96px) + 3rem);
}

/* ── Identity header ─────────────────────────────────────── */
.sheet {
  display: flex;
  gap: var(--space-lg);
  border: 1px solid rgba(var(--color-gold-rgb), 0.2);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  background: rgba(255, 255, 255, 0.02);
}
.sheet-portrait { flex: 0 0 120px; }
.sheet-portrait img,
.sheet-portrait-empty {
  width: 120px;
  height: 150px;
  object-fit: cover;
  border: 1.5px solid var(--color-gold);
  background: var(--color-surface-2);
  display: block;
}
.sheet-id { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
.sheet-name { font-size: 1.6rem; margin: 0; color: var(--color-text); }
.sheet-epithet { margin: 2px 0 0; font-style: italic; color: var(--color-text-subtle); font-size: 0.9rem; }

/* ── Arc card ─────────────────────────────────────────────── */
.arc-card {
  border: 2px solid var(--arc-color, var(--color-gold));
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  background: rgba(255, 255, 255, 0.02);
}
.arc-card__top {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--arc-color-dim, rgba(var(--color-gold-rgb), 0.25));
}
.arc-badge {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-surface-1);
  border: 2px solid var(--arc-color, var(--color-gold));
  box-shadow: 0 0 16px var(--arc-color-dim, rgba(var(--color-gold-rgb), 0.35));
  display: flex;
  align-items: center;
  justify-content: center;
}
.arc-badge img { width: 44px; height: 44px; object-fit: contain; }
.arc-kicker {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--arc-color, var(--color-gold));
  margin-bottom: 4px;
}
.arc-title {
  margin: 0;
  font-size: var(--text-panel-title);
  color: var(--color-text);
}
.arc-decision-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin-bottom: 6px;
}
.arc-decision-text {
  margin: 0 0 var(--space-sm);
  color: var(--color-text);
  line-height: 1.65;
}
.arc-updated {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: var(--arc-color, var(--color-gold));
}

/* ── Supporting row: level chip + find-me links ──────────── */
.status-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}
.sheet-level {
  background: var(--color-gold);
  color: var(--color-black);
  font-weight: 900;
  padding: 4px 16px;
  font-size: 0.95rem;
  white-space: nowrap;
}
.status-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.status-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--color-surface-3);
  color: var(--color-text);
  font-size: 0.85rem;
  text-decoration: none;
}

/* ── Mailbox strip (carried over unchanged) ─────────────── */
.s-mail-strip {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin: 20px 0 0;
  padding: 14px 18px;
  border: 1px solid rgba(var(--color-gold-rgb), 0.14);
  border-left: 3px solid var(--color-gold);
  background: rgba(var(--color-gold-rgb), 0.03);
}
.s-mail-label {
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-gold);
  font-family: var(--font-display, system-ui, sans-serif);
}
.s-mail-sub {
  font-size: 0.72rem;
  color: var(--color-text-subtle);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.mail-address {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-left: auto;
  color: var(--color-gold-dim);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-decoration: none;
  border-bottom: 1px solid rgba(var(--color-gold-rgb), 0.25);
  transition: border-color 0.15s, color 0.15s;
}
.mail-address:hover,
.mail-address:focus-visible {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

/* ── Mobile ───────────────────────────────────────────────── */
@media (max-width: 768px) {
  .status-page { padding: 2.5rem 1.25rem calc(var(--nav-clearance, 96px) + 2rem); }
  .sheet { flex-direction: column; }
  .sheet-portrait { flex-basis: auto; }
  .arc-card__top { flex-wrap: wrap; }
  .s-mail-strip { flex-direction: column; align-items: flex-start; }
  .mail-address { margin-left: 0; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/status.css
git commit -m "style: rewrite status.css for the arc-card page, drop pause-menu chrome"
```

---

## Task 5: Rewrite `/status`

**Files:**
- Modify: `src/pages/status/index.astro` (full rewrite)

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/pages/status/index.astro` with:

```astro
---
import { getCollection } from 'astro:content';
import { readFileSync } from 'fs';
import { join } from 'path';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NavPill from '../../components/NavPill.astro';
import { parseProtagonist, DEFAULT_PROTAGONIST } from '../../utils/protagonist';
import { parseCurrentArc } from '../../utils/currentArc';
import { STAT_COLORS, hexToRgbTriplet } from '../../utils/sessions';
import { buildNovelTree, computeNovelStats } from '../../utils/novel';
import { getAllCollections } from '../../utils/collections';
import { computeSiteWordCount, computeSiteLevel } from '../../utils/level';
import { pickProfile } from '../../utils/profile';
import '../../styles/status.css';

let protagonist = DEFAULT_PROTAGONIST;
try {
  const raw = readFileSync(join(process.cwd(), 'src/content/sessions/_protagonist.md'), 'utf-8');
  protagonist = parseProtagonist(raw);
} catch { /* missing file → defaults */ }

let questsRaw = '';
try {
  questsRaw = readFileSync(join(process.cwd(), 'src/content/sessions/_quests.md'), 'utf-8');
} catch { /* missing file → no arc card */ }
const currentArc = parseCurrentArc(questsRaw);

function colorBg(hex: string, a: number): string {
  return `rgba(${hexToRgbTriplet(hex).join(',')},${a})`;
}

const arcColor = currentArc?.stat ? STAT_COLORS[currentArc.stat] : null;
const arcEmblem = currentArc?.stat
  ? `/images/emblems/${currentArc.stat.toLowerCase()}.png`
  : '/images/emblems/default.svg';
const arcCardStyle = arcColor
  ? `--arc-color:${arcColor};--arc-color-dim:${colorBg(arcColor, 0.35)}`
  : '';

const novelDir = join(process.cwd(), 'src/content/novel');
const novelTree = await buildNovelTree(novelDir);
const { storyWords } = computeNovelStats(novelTree);
const { allNotes, allShowcase } = await getAllCollections();
const journalBodies = [...allNotes, ...allShowcase].map(e => e.body ?? '');
const totalWords = computeSiteWordCount(storyWords, journalBodies);
const level = computeSiteLevel(totalWords);

const profileEntries = await getCollection('profile');
const profile = pickProfile(profileEntries)?.data ?? null;
const isExternal = (href: string) => /^https?:\/\//i.test(href);
const elsewhereLinks = (profile?.links ?? []).filter(l => isExternal(l.href));
---

<BaseLayout title="Status" description="What chapter of the story this is, and what's currently being decided.">
  <NavPill />

  <div class="status-page p3r-animate">
    <div class="sheet">
      <div class="sheet-portrait">
        {protagonist.portrait
          ? <img src={protagonist.portrait} alt="" />
          : <div class="sheet-portrait-empty" aria-hidden="true"></div>}
      </div>
      <div class="sheet-id">
        <p class="sheet-name p4g-heading">{protagonist.name}</p>
        {protagonist.epithet && <p class="sheet-epithet">{protagonist.epithet}</p>}
      </div>
    </div>

    {currentArc && (
      <section class="arc-card" style={arcCardStyle} aria-label="Current arc">
        <div class="arc-card__top">
          <div class="arc-badge">
            <img src={arcEmblem} alt="" />
          </div>
          <div>
            <span class="arc-kicker">Current arc{currentArc.stat ? ` · ${currentArc.stat}` : ''}</span>
            <h2 class="arc-title">{currentArc.arc}</h2>
          </div>
        </div>
        <span class="arc-decision-label">Active decision</span>
        <p class="arc-decision-text">{currentArc.decision}</p>
        {currentArc.updated && <span class="arc-updated">updated {currentArc.updated}</span>}
      </section>
    )}

    <div class="status-row">
      <span class="sheet-level p4g-cut">LV {level}</span>
      {elsewhereLinks.length > 0 && (
        <nav class="status-links" aria-label="Find me elsewhere">
          {elsewhereLinks.map(link => (
            <a class="status-link p4g-sweep" href={link.href} target="_blank" rel="noopener noreferrer">
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      )}
    </div>

    <div class="s-mail-strip">
      <div class="s-mail-label">Mailbox</div>
      <div class="s-mail-sub">Send mail to be read on stream</div>
      {/* Address + href injected client-side so it never sits in the served HTML */}
      <a href="#mailbox" class="mail-address" id="mail-address"></a>
      <noscript>
        <p class="mail-address">mailbox [at] ninjaruss [dot] net</p>
      </noscript>
    </div>
  </div>
</BaseLayout>

<script>
  /* Mailbox address — assembled at runtime so scrapers reading the served
     HTML never see a mailto or full address. Same pattern as the homepage
     Email tile (#mail-tile), whose no-JS fallback links here. */
  function initMailAddress(): void {
    const el = document.getElementById('mail-address') as HTMLAnchorElement | null;
    if (!el || el.textContent) return;
    const addr = ['mailbox', ['ninjaruss', 'net'].join('.')].join('@');
    el.textContent = addr;
    el.href = 'mailto:' + addr;
  }
  initMailAddress();
  document.addEventListener('astro:page-load', initMailAddress);
</script>
```

- [ ] **Step 2: Verify the page builds**

Run: `npm run build`
Expected: build succeeds, `dist/status/index.html` is generated, no errors about missing exports from `utils/sessions`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/status/index.astro
git commit -m "feat: rebuild /status as a single-screen Persona arc card"
```

---

## Task 6: Simplify the homepage Stream tile

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the tile's data section**

In `src/pages/index.astro`, replace the block from the `// Stream tile data` comment through the `const donutArcs = buildDonutArcs(streamTallies, 32);` line (originally lines 93–131) with:

```typescript
// Stream tile data — current arc teaser, read the same way /status reads it.
let questsRaw = '';
try {
  questsRaw = readFileSync(join(process.cwd(), 'src/content/sessions/_quests.md'), 'utf-8');
} catch { /* missing file → no teaser */ }
const currentArc = parseCurrentArc(questsRaw);
const arcColor = currentArc?.stat ? STAT_COLORS[currentArc.stat] : '#ffe52c';
```

- [ ] **Step 2: Update the imports**

Replace this line near the top of the file:

```typescript
import { tallyStats, buildDonutArcs, hexToRgbTriplet, STAT_COLORS, STAT_ORDER } from '../utils/sessions';
```

with:

```typescript
import { STAT_COLORS } from '../utils/sessions';
import { parseCurrentArc } from '../utils/currentArc';
```

Also add these two imports (needed for reading `_quests.md` from the filesystem, same as `/status`):

```typescript
import { readFileSync } from 'fs';
```

(`join` from `'path'` is already imported at the top of this file for the novel tree — reuse it, don't add a duplicate import.)

- [ ] **Step 3: Replace the tile markup**

Replace the `<a id="stream-tile" ...>...</a>` block (originally lines 306–409) with:

```astro
      <a
        id="stream-tile"
        href="/status"
        class="bento-tile bento-tile--dark bento-tile--interactive stream-tile"
        style={`--st-lead: ${arcColor};`}
      >
        <div class="bento-tile__header">
          <span class="bento-tile__label">Status</span>
          <h3 class="bento-tile__title">{currentArc ? currentArc.arc : 'Status'}</h3>
        </div>

        <div class="st-body">
          {currentArc ? (
            <p class="st-teaser">{currentArc.decision}</p>
          ) : (
            <p class="st-teaser st-teaser--empty">The story hasn't started yet.</p>
          )}
        </div>

        <div class="st-footer">
          <span class="st-cta">► load</span>
          <span id="st-live-badge" class="st-live-badge" hidden>LIVE</span>
        </div>
        <span class="bento-tile__corner" aria-hidden="true"></span>
      </a>
```

- [ ] **Step 4: Replace the tile's CSS**

Replace the CSS block from `/* ─── Stream Tile ────────────────────────────────────── */` through the `@keyframes st-cycle-secondary { ... }` block (originally lines 1169–1358) with:

```css
  /* ─── Stream Tile ────────────────────────────────────── */
  .stream-tile {
    grid-row: span 2;
    display: flex;
    flex-direction: column;
    text-decoration: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }

  .stream-tile:hover,
  .stream-tile:focus-visible {
    border-color: var(--color-gold);
    box-shadow: var(--shadow-hard);
    transform: translate(-4px, -4px);
  }

  .stream-tile.is-live {
    border-color: var(--color-live);
    background: #181212;
    box-shadow: 4px 4px 0 rgba(var(--color-live-rgb), .35), 0 0 28px rgba(var(--color-live-rgb), .12);
    animation: stream-tile-pulse 2.5s ease-in-out infinite;
  }

  @keyframes stream-tile-pulse {
    0%, 100% { box-shadow: 4px 4px 0 rgba(var(--color-live-rgb), .35), 0 0 24px rgba(var(--color-live-rgb), .12); }
    50%       { box-shadow: 4px 4px 0 rgba(var(--color-live-rgb), .5),  0 0 40px rgba(var(--color-live-rgb), .22); }
  }

  /* CRT inset glow — always present, warms to red when live */
  .stream-tile::after {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 22px rgba(var(--color-gold-rgb), 0.04);
    pointer-events: none;
    z-index: 2;
    border-radius: inherit;
    transition: box-shadow 300ms;
  }

  .stream-tile:hover::after,
  .stream-tile:focus-visible::after {
    box-shadow: inset 0 0 28px rgba(var(--color-gold-rgb), 0.08);
  }

  .stream-tile.is-live::after {
    box-shadow: inset 0 0 22px rgba(var(--color-live-rgb), 0.1);
  }

  .st-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 14px 14px 8px;
  }

  .st-teaser {
    margin: 0;
    text-align: center;
    font-size: var(--text-xs);
    line-height: 1.5;
    color: var(--st-lead);
    font-family: var(--font-mono);
    letter-spacing: 0.02em;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
  }

  .st-teaser--empty {
    color: var(--color-text-subtle);
    font-style: italic;
  }

  .st-footer {
    padding: 7px 11px;
    border-top: 1px solid #181826;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    background: #09090f;
  }

  .st-cta {
    margin-left: auto;
    font-size: var(--text-floor);
    letter-spacing: .16em;
    text-transform: uppercase;
    color: rgba(var(--color-gold-rgb), .4);
    font-family: var(--font-mono);
    transition: color var(--transition-fast);
  }

  .stream-tile:hover .st-cta,
  .stream-tile:focus-visible .st-cta {
    color: rgba(var(--color-gold-rgb), .75);
  }

  .st-live-badge {
    font-size: var(--text-floor);
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--color-live);
    border: 1px solid rgba(var(--color-live-rgb), .4);
    border-radius: 3px;
    padding: 2px 5px;
    animation: st-badge-breathe 1.5s ease-in-out infinite;
  }

  .st-live-badge[hidden] { display: none; }

  @keyframes st-badge-breathe {
    0%, 100% { opacity: 1; }
    50%       { opacity: .45; }
  }
```

- [ ] **Step 5: Update the reduced-motion block**

Find this block (originally around line 1839):

```css
    .stream-tile.is-live    { animation: none; }
    .stream-tile::after     { transition: none; }
    .st-live-badge          { animation: none; }
    .st-icon-primary        { animation: none; opacity: 1; }
    .st-icon-secondary      { animation: none; opacity: 0; }
```

Replace it with (dropping the two `.st-icon-*` lines — those classes no longer exist):

```css
    .stream-tile.is-live    { animation: none; }
    .stream-tile::after     { transition: none; }
    .st-live-badge          { animation: none; }
```

- [ ] **Step 6: Verify the page builds and the live-indicator script still works**

Run: `npm run build`
Expected: build succeeds. `#stream-tile` and `#st-live-badge` element IDs are unchanged, so `applyLiveState()` (further down in the same file's `<script>` block) needs no changes — confirm by grepping:

Run: `grep -n "getElementById('stream-tile')\|getElementById('st-live-badge')" src/pages/index.astro`
Expected: both still present, referring to the elements you just rewrote.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: replace homepage Stream tile donut with a current-arc teaser"
```

---

## Task 7: Trim `utils/sessions.ts` and its tests

**Files:**
- Modify: `src/utils/sessions.ts`
- Modify: `src/tests/sessions.test.ts`
- Delete: `src/tests/streamTile.test.ts`

By this point, nothing outside `utils/sessions.ts` and its tests references the functions being removed — confirmed by Tasks 5 and 6 replacing their only two call sites.

- [ ] **Step 1: Confirm no remaining references**

Run:
```bash
grep -rn "tallyStats\|buildRadarPoints\|buildGuidePoints\|applyLogScale\|scaleAllTallies\|parseStreamIdeas\|parseQuestFile\|parseQuestMenu\|buildDonutArcs\|computeLevel\|STAT_CEILING" src/pages src/components
```
Expected: no output (nothing in pages/components references these anymore).

- [ ] **Step 2: Trim the implementation**

Replace the full contents of `src/utils/sessions.ts` with:

```typescript
export const STAT_ORDER = [
  'Determination',
  'Insight',
  'Expression',
  'Sincerity',
  'Chaos',
] as const;

export type StatName = (typeof STAT_ORDER)[number];

/** The one stat-colour table. Anything that paints a stat (the arc card, the
 *  homepage tile teaser, the page-transition card) reads from here — do not
 *  re-declare these hexes anywhere else. */
export const STAT_COLORS: Record<StatName, string> = {
  Determination: '#ff4040',
  Insight:       '#4ab0ff',
  Expression:    '#a855f7',
  Sincerity:     '#ffe52c',
  Chaos:         '#2dd4bf',
};

/** `#ff4040` → `255,64,64` — for building rgba()/feColorMatrix values from
 *  a STAT_COLORS entry without restating the channels. */
export function hexToRgbTriplet(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
```

- [ ] **Step 3: Trim the tests**

Replace the full contents of `src/tests/sessions.test.ts` with:

```typescript
import { describe, it, expect } from 'vitest';
import { STAT_ORDER, hexToRgbTriplet, STAT_COLORS } from '../utils/sessions';
import { parseTwitchLiveResponse } from '../utils/twitchStatus';

describe('STAT_ORDER', () => {
  it('has exactly 5 stats', () => {
    expect(STAT_ORDER).toHaveLength(5);
  });
});

describe('STAT_COLORS', () => {
  it('covers STAT_ORDER exactly — no missing stat, no stray key', () => {
    expect(Object.keys(STAT_COLORS).sort()).toEqual([...STAT_ORDER].sort());
  });

  it('is a 6-digit hex per stat', () => {
    for (const stat of STAT_ORDER) {
      expect(STAT_COLORS[stat]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('hexToRgbTriplet', () => {
  it('splits a hex into its channels', () => {
    expect(hexToRgbTriplet('#ff4040')).toEqual([255, 64, 64]);
    expect(hexToRgbTriplet('#2dd4bf')).toEqual([45, 212, 191]);
    expect(hexToRgbTriplet('#000000')).toEqual([0, 0, 0]);
  });
});

describe('parseTwitchLiveResponse', () => {
  it('returns true when data array is non-empty', () => {
    expect(parseTwitchLiveResponse({ data: [{ type: 'live' }] })).toBe(true);
  });

  it('returns false when data array is empty', () => {
    expect(parseTwitchLiveResponse({ data: [] })).toBe(false);
  });

  it('returns false for null input', () => {
    expect(parseTwitchLiveResponse(null)).toBe(false);
  });

  it('returns false for malformed response', () => {
    expect(parseTwitchLiveResponse({ items: ['something'] })).toBe(false);
  });
});
```

- [ ] **Step 4: Delete the now-obsolete donut test file**

```bash
rm src/tests/streamTile.test.ts
```

- [ ] **Step 5: Run the full test suite**

Run: `npm run test`
Expected: all remaining tests pass; no references to deleted exports remain.

- [ ] **Step 6: Run the build**

Run: `npm run build`
Expected: succeeds — this is the final confirmation that nothing anywhere still imports a deleted export.

- [ ] **Step 7: Commit**

```bash
git add src/utils/sessions.ts src/tests/sessions.test.ts
git rm src/tests/streamTile.test.ts
git commit -m "refactor: trim utils/sessions.ts to STAT_COLORS/STAT_ORDER/hexToRgbTriplet"
```

---

## Task 8: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace the "Sessions & /status" section**

Find the section starting with `## Sessions & /status (protagonist pause menu)` and ending right before `## Utility Modules`. Replace its entire contents with:

```markdown
## Sessions & /status (Persona arc card)

The `sessions` collection logs work sessions (Japanese, writing, streams) as
hand-written markdown — create a `.md` in `src/content/sessions/` (VS Code
snippet: type `session` + Tab). These files are currently an inert historical
archive: nothing on `/status` reads them anymore (see below), so creating new
ones is optional bookkeeping, not something the page depends on.

`/status` (spec: docs/superpowers/specs/2026-08-18-status-page-arc-revamp-design.md)
was rebuilt 2026-08 from a four-screen session-log pause menu into a single flat
screen, because the log required per-stream maintenance that competed with the
actual writing/Japanese-learning work it was meant to reflect. The page is
viewer-facing, not a personal tracker: its job is "what chapter of the story is
this, and what's currently being decided" — not "how many sessions has Russ
logged." Top to bottom:

- **Identity header** — portrait/name/epithet from `_protagonist.md` (shared
  with `/about`), parsed by `parseProtagonist()` (`src/utils/protagonist.ts`);
  missing file/fields degrade to defaults.
- **Arc card** (`.arc-card`) — the page's one piece of content. Whole-card
  accent-colored by the arc's stat (border/kicker/updated stamp use
  `STAT_COLORS`), with a stat emblem badge (`/images/emblems/<stat>.png`) on a
  dark circular plate for contrast (the emblem PNGs are opaque-white-background
  line art and wash out if dropped directly on a pale accent color like
  Insight). Sourced from a `## Current Arc` section in `_quests.md`
  (`**Arc:**`/`**Stat:**`/`**Updated:**` fields + a decision paragraph),
  parsed by `parseCurrentArc()` (`src/utils/currentArc.ts`). An absent or
  incomplete section hides the card entirely rather than rendering blanks; an
  unrecognized `Stat` value degrades to a neutral gold accent rather than
  failing the build. Hand-edited, expected to change every few weeks/months —
  not per-stream. The rest of `_quests.md` (The Question / Active / Ideas —
  `<Stat>` / Completed) is Russ's private planning scaffold and is **not**
  rendered anywhere on the page.
- **Supporting row** — a plain `LV n` chip (`.sheet-level`, no stat coloring)
  computed at build time by `computeSiteLevel()` (`src/utils/level.ts`) from
  the total word count across the novel manuscript's story words
  (`computeNovelStats().storyWords` — outline/planning docs don't count) plus
  every non-draft `notes`/`showcase` entry body
  (`computeSiteWordCount()`/`countMarkdownWords()`); monotonic, no decay, no
  new authoring — it's a byproduct of writing already happening. Beside it, a
  "find me elsewhere" links strip reusing `profile.links` (the same data
  `/about` renders, filtered to external URLs) — **not** the `social-links`
  collection, which models Bonds/confidants (`arcana`/`affinity`/`rank`/`lore`)
  and has no real entries.
- **Mailbox strip** — carried over unchanged: address assembled client-side
  into `#mail-address` (never in served HTML), `<noscript>` obfuscated-text
  fallback. Kept because the homepage's `#mail-tile` links to `/status` as its
  no-JS fallback.

`STAT_COLORS`/`STAT_ORDER`/`StatName`/`hexToRgbTriplet` are all that remain in
`src/utils/sessions.ts` — everything else (tallying, radar/donut geometry,
quest-file parsing, the log-scale level curve) was deleted with the pause menu.
`STAT_COLORS` is still consumed by `scripts/transition.ts`'s per-route
page-transition card effect (a static route→stat color mapping, unrelated to
session tallies) and by the arc card above.

The homepage's Stream tile (`#stream-tile`, dark 1×2, links to `/status`) no
longer shows a stat-tally donut; it shows the same live-now indicator as
before (`/api/live-status.ts`, unchanged) plus a one-line teaser of the current
arc's decision text, read from the same `_quests.md` section.

The `social-links` collection/schema is unused by any page as of 2026-08 (it
has one `draft: true` sample entry) — a future Bonds/confidants feature is a
separate decision, not part of this page.
```

- [ ] **Step 2: Update the "Homepage Stream tile" line in the Bento Tile Hierarchy section**

Find this line (in the Bento Tile Hierarchy section):

```
- **Stream tile** (`.stream-tile`, `#stream-tile` — ids/classes unchanged; the visible label reads "Status" / "Status Log"): Dark 1×2 tile linking to `/status`; shows live stat donut chart (session stats from the `sessions` collection) with leading stat emblem and session count. Pulsing red border (`--color-live`) when live (live-streaming state, unrelated to the sessions rename).
```

Replace it with:

```
- **Stream tile** (`.stream-tile`, `#stream-tile`): Dark 1×2 tile linking to `/status`; shows a one-line teaser of the current arc's decision text (read from `_quests.md`'s `## Current Arc` section, same source `/status`'s arc card uses) instead of the retired stat-tally donut. Pulsing red border (`--color-live`) when live, via the unchanged `/api/live-status.ts` polling.
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: describe the rebuilt /status arc card and homepage teaser"
```

---

## Task 9: Manual verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: all tests pass.

- [ ] **Step 2: Run the build**

Run: `npm run build`
Expected: succeeds, no warnings about unresolved imports.

- [ ] **Step 3: Start the dev server and check `/status`**

Run: `npm run dev`, open `http://localhost:4321/status`.

Check:
- Identity header shows portrait/name/epithet.
- Arc card shows "Arc I — Integration" with the Expression purple accent
  (`#a855f7`) and the Expression emblem icon on its dark plate.
- `LV n` chip renders a plausible level (should be > 1 given the site's
  current word count).
- "Find me elsewhere" strip shows the external `profile.links` (YouTube,
  Twitch, MyAnimeList, Spotify — not "Read the journal", which is internal).
- Mailbox strip: click/hover the address, confirm it fills in as
  `mailbox@ninjaruss.net` with a working `mailto:` href.
- No pause-menu chrome, tabs, radar, or log list anywhere on the page.

- [ ] **Step 4: Check the homepage Stream tile**

Open `http://localhost:4321/`.

Check:
- The tile shows the current arc's decision text as a teaser, not a donut
  chart.
- Tile still links to `/status`.
- (If a Twitch/YouTube live check is reachable) the pulsing live-red border
  and `LIVE` badge still work when live; otherwise confirm the class toggle
  logic is unchanged by inspecting `applyLiveState()` in the page source.

- [ ] **Step 5: Check the page-transition card effect (regression check)**

`scripts/transition.ts` imports `STAT_COLORS` from `utils/sessions.ts` — the
same module Task 7 trimmed — for its per-route card-flip transition (unrelated
to session tallies, a static route→stat color mapping). Confirm it still
works: with JS enabled and `prefers-reduced-motion` off, click a NavPill link
to navigate between two pages (e.g. `/` → `/novel`). Expect the existing
sweep/card-flip transition animation to play, not a broken or blank
transition.

- [ ] **Step 6: Check the empty-state fallback**

Temporarily rename `src/content/sessions/_quests.md`'s `## Current Arc` heading
to `## Current Arc Draft` (so `parseCurrentArc` returns null), rebuild, and
confirm:
- `/status` renders with no arc card (identity header, level/links row, and
  mailbox strip still present).
- The homepage tile falls back to "The story hasn't started yet."

Then revert the rename.

- [ ] **Step 7: Check mobile layout**

Resize to ~375px width (or use browser dev tools device mode) for both
`/status` and `/`. Confirm the identity header stacks, the arc card wraps
without overflow, and the mail strip stacks with the address on its own line.

This task has no commit — it's a verification checkpoint. If any check fails,
fix the relevant task's code and re-run this task's checks.
