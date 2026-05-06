# Stream Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/stream` Velvet Room page with 5 tab panels driven by markdown content, and update the homepage tile to link to it with Twitch live detection.

**Architecture:** Content (stream logs, social links) lives in Astro content collections fetched at build time; quest menu is a single markdown file read with `fs`; stat tallies and radar SVG paths computed at build time and embedded in the HTML; client-side JS handles tab switching, mode toggle, and log filtering with no framework.

**Tech Stack:** Astro 5, TypeScript, Zod (content schemas), Vitest (unit tests), vanilla CSS

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/content/config.ts` | Add `stream` + `social-links` collection schemas |
| Create | `src/content/stream/2026-05-06-building-the-stream-page.md` | Sample stream log entry |
| Create | `src/content/social-links/sample.md` | Sample bond entry |
| Create | `src/content/quest-menu.md` | Quest menu source (single file, not a collection) |
| Create | `src/utils/stream.ts` | `tallyStats`, `buildRadarPoints`, `buildGuidePoints`, `parseQuestMenu` |
| Create | `src/utils/twitchStatus.ts` | `parseTwitchLiveResponse` |
| Create | `src/tests/stream.test.ts` | Vitest unit tests for stream utils |
| Create | `src/styles/stream.css` | All stream page CSS |
| Create | `src/pages/stream/index.astro` | Full stream page with 5 panels |
| Create | `public/images/stream/portrait.png` | Placeholder — must be added manually |
| Modify | `src/pages/index.astro` | Rename KAIMA tile, switch to Twitch detection |

---

## Task 1: Content Schemas

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: Add `stream` and `social-links` schemas**

Replace the `export const collections` block with:

```typescript
import { defineCollection, z } from 'astro:content';

const sharedSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()).default([]),
  collections: z.array(z.string()).default([]),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  emblem: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

const media = defineCollection({
  type: 'content',
  schema: sharedSchema.extend({
    content_type: z.enum(['anime', 'manga', 'film', 'series', 'music', 'book', 'game', 'character', 'other']),
    isFavorite: z.boolean().default(false),
  }),
});

const notes = defineCollection({ type: 'content', schema: sharedSchema });
const showcase = defineCollection({ type: 'content', schema: sharedSchema });

const now = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().default('Now'),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const stream = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    stats: z.array(z.enum(['Determination', 'Insight', 'Expression', 'Sincerity', 'Chaos'])),
    summary: z.string(),
    memorable: z.string(),
    draft: z.boolean().default(false),
  }),
});

const socialLinks = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    arcana: z.string(),
    affinity: z.string(),
    rank: z.number().min(1).max(5),
    lastInteraction: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  media,
  notes,
  showcase,
  now,
  stream,
  'social-links': socialLinks,
};
```

- [ ] **Step 2: Create sample stream log entry**

Create `src/content/stream/2026-05-06-building-the-stream-page.md`:

```markdown
---
title: "Building the Stream Page"
publishedAt: 2026-05-06
stats: ["Determination", "Expression"]
summary: "Built the /stream Velvet Room page live from scratch, broke it three times."
memorable: "If it compiles it ships. It did not compile."
draft: false
---
```

- [ ] **Step 3: Create sample social-link entry**

Create `src/content/social-links/sample.md`:

```markdown
---
name: "Sample Bond"
arcana: "The Star"
affinity: "Curious"
rank: 3
lastInteraction: "May 2026"
draft: false
---
```

- [ ] **Step 4: Create quest menu**

Create `src/content/quest-menu.md`:

```markdown
## Active Quests

- Ship the stream page
- Write three stream log entries
- Add a bond entry for every real connection

## Horizon

- Write more notes
- Finish a showcase entry

## Completed

- Set up the site
```

- [ ] **Step 5: Verify schema compiles**

```bash
npm run build 2>&1 | grep -E "error|Error|warn" | head -20
```

Expected: no schema-related errors.

- [ ] **Step 6: Commit**

```bash
git add src/content/config.ts src/content/stream/ src/content/social-links/ src/content/quest-menu.md
git commit -m "feat: add stream and social-links content schemas with sample content"
```

---

## Task 2: Stream Utilities

**Files:**
- Create: `src/utils/stream.ts`
- Create: `src/tests/stream.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/tests/stream.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { tallyStats, buildRadarPoints, buildGuidePoints, parseQuestMenu, STAT_ORDER } from '../utils/stream';

const makeEntry = (publishedAt: string, stats: string[]) => ({
  data: { publishedAt: new Date(publishedAt), stats },
});

describe('STAT_ORDER', () => {
  it('has exactly 5 stats', () => {
    expect(STAT_ORDER).toHaveLength(5);
  });
});

describe('tallyStats', () => {
  it('counts all occurrences in all mode', () => {
    const entries = [
      makeEntry('2026-01-01', ['Determination', 'Insight']),
      makeEntry('2026-01-02', ['Determination']),
    ];
    const tally = tallyStats(entries, 'all');
    expect(tally['Determination']).toBe(2);
    expect(tally['Insight']).toBe(1);
    expect(tally['Expression']).toBeUndefined();
  });

  it('limits to 10 most recent in recent mode', () => {
    const entries = Array.from({ length: 12 }, (_, i) =>
      makeEntry(`2026-01-${String(i + 1).padStart(2, '0')}`, ['Determination'])
    );
    // Add an older entry with Insight
    entries.push(makeEntry('2025-06-01', ['Insight']));
    const tally = tallyStats(entries, 'recent');
    expect(tally['Determination']).toBe(10);
    expect(tally['Insight']).toBeUndefined();
  });

  it('returns empty object for empty entries', () => {
    expect(tallyStats([], 'all')).toEqual({});
  });
});

describe('buildRadarPoints', () => {
  it('returns a string of 5 coordinate pairs', () => {
    const tallies = { Determination: 2, Insight: 1 };
    const points = buildRadarPoints(tallies, 2, 150, 150, 120);
    const pairs = points.trim().split(' ');
    expect(pairs).toHaveLength(5);
    pairs.forEach(pair => {
      expect(pair).toMatch(/^-?\d+\.\d+,-?\d+\.\d+$/);
    });
  });

  it('returns center point for a stat with zero count', () => {
    const tallies: Record<string, number> = {};
    const points = buildRadarPoints(tallies, 1, 150, 150, 120);
    // All 5 points should be at center (150,150) when all values are 0
    points.trim().split(' ').forEach(pair => {
      const [x, y] = pair.split(',').map(Number);
      expect(x).toBeCloseTo(150, 0);
      expect(y).toBeCloseTo(150, 0);
    });
  });

  it('handles maxVal of 0 without dividing by zero', () => {
    expect(() => buildRadarPoints({}, 0, 150, 150, 120)).not.toThrow();
  });
});

describe('buildGuidePoints', () => {
  it('returns 5 coordinate pairs at given fraction', () => {
    const points = buildGuidePoints(0.5, 150, 150, 120);
    const pairs = points.trim().split(' ');
    expect(pairs).toHaveLength(5);
  });
});

describe('parseQuestMenu', () => {
  it('parses headings as categories', () => {
    const md = `## Active\n- Quest one\n- Quest two\n\n## Done\n- Quest three`;
    const result = parseQuestMenu(md);
    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('Active');
    expect(result[0].quests).toEqual(['Quest one', 'Quest two']);
    expect(result[1].category).toBe('Done');
    expect(result[1].quests).toEqual(['Quest three']);
  });

  it('returns empty array for empty string', () => {
    expect(parseQuestMenu('')).toEqual([]);
  });

  it('ignores lines that are not headings or list items', () => {
    const md = `## Active\nsome prose line\n- Valid quest`;
    const result = parseQuestMenu(md);
    expect(result[0].quests).toEqual(['Valid quest']);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test 2>&1 | tail -20
```

Expected: FAIL — `Cannot find module '../utils/stream'`

- [ ] **Step 3: Implement `src/utils/stream.ts`**

```typescript
export const STAT_ORDER = [
  'Determination',
  'Insight',
  'Chaos',
  'Sincerity',
  'Expression',
] as const;

export type StatName = (typeof STAT_ORDER)[number];
export type StatMode = 'recent' | 'all';

export function tallyStats(
  entries: { data: { publishedAt: Date; stats: string[] } }[],
  mode: StatMode
): Partial<Record<StatName, number>> {
  const sorted = [...entries].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
  const pool = mode === 'recent' ? sorted.slice(0, 10) : sorted;
  const tally: Partial<Record<StatName, number>> = {};
  for (const entry of pool) {
    for (const stat of entry.data.stats) {
      if (STAT_ORDER.includes(stat as StatName)) {
        const s = stat as StatName;
        tally[s] = (tally[s] ?? 0) + 1;
      }
    }
  }
  return tally;
}

export function buildRadarPoints(
  tallies: Partial<Record<string, number>>,
  maxVal: number,
  cx: number,
  cy: number,
  r: number
): string {
  return STAT_ORDER.map((stat, i) => {
    const angle = (-90 + i * 72) * (Math.PI / 180);
    const val = tallies[stat] ?? 0;
    const ratio = maxVal > 0 ? val / maxVal : 0;
    const x = cx + r * ratio * Math.cos(angle);
    const y = cy + r * ratio * Math.sin(angle);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

export function buildGuidePoints(
  fraction: number,
  cx: number,
  cy: number,
  r: number
): string {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (-90 + i * 72) * (Math.PI / 180);
    const x = cx + r * fraction * Math.cos(angle);
    const y = cy + r * fraction * Math.sin(angle);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

export function parseQuestMenu(markdown: string): { category: string; quests: string[] }[] {
  const lines = markdown.split('\n');
  const result: { category: string; quests: string[] }[] = [];
  let current: { category: string; quests: string[] } | null = null;

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      if (current) result.push(current);
      current = { category: heading[1].trim(), quests: [] };
      continue;
    }
    const item = line.match(/^[-*]\s+(.+)/);
    if (item && current) {
      current.quests.push(item[1].trim());
    }
  }
  if (current) result.push(current);
  return result;
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm run test 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/stream.ts src/tests/stream.test.ts
git commit -m "feat: add stream utility functions with tests"
```

---

## Task 3: Twitch Live Detection Utility

**Files:**
- Create: `src/utils/twitchStatus.ts`

- [ ] **Step 1: Write failing test**

Append to `src/tests/stream.test.ts`:

```typescript
import { parseTwitchLiveResponse } from '../utils/twitchStatus';

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

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm run test 2>&1 | grep "parseTwitchLiveResponse" | head -5
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/utils/twitchStatus.ts`**

```typescript
export function parseTwitchLiveResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as { data?: unknown };
  return Array.isArray(d.data) && d.data.length > 0;
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm run test 2>&1 | tail -10
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/twitchStatus.ts src/tests/stream.test.ts
git commit -m "feat: add Twitch live detection utility with tests"
```

---

## Task 4: Stream Page CSS

**Files:**
- Create: `src/styles/stream.css`

- [ ] **Step 1: Create `src/styles/stream.css`**

```css
/* ── Stream Page — Velvet Room ──────────────────────────── */

/* Stat color tokens */
:root {
  --stat-determination: #ff4040;
  --stat-insight:       #4ab0ff;
  --stat-expression:    #a855f7;
  --stat-sincerity:     #ffe52c;
  --stat-chaos:         #2dd4bf;
}

/* Shell — viewport-height, no scroll */
.stream-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #0a0a0c;
  color: #f0f0f0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Chrome bar ─────────────────────────────────────────── */
.s-chrome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: #111;
  border-bottom: 1px solid #1e1e1e;
  flex-shrink: 0;
}

.s-chrome-label {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #999;
}

.s-chrome-label strong {
  color: #ffe52c;
}

.s-tabs {
  display: flex;
  gap: 4px;
}

.s-tab {
  padding: 5px 14px;
  border-radius: 4px;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  cursor: pointer;
  color: #888;
  background: transparent;
  border: 1px solid transparent;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.s-tab:hover { color: #bbb; }

.s-tab.active {
  background: rgba(255, 229, 44, 0.08);
  color: #ffe52c;
  border-color: rgba(255, 229, 44, 0.2);
}

/* ── Header ─────────────────────────────────────────────── */
.s-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 12px 28px;
  border-bottom: 1px solid #141416;
  flex-shrink: 0;
}

.s-header-title {
  font-size: 1.9rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f0f0f0;
  line-height: 1;
}

.s-header-range {
  font-size: 0.75rem;
  color: #999;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  letter-spacing: 0.06em;
}

/* ── Grid shell: sprite + main ──────────────────────────── */
.s-shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  flex: 1;
  overflow: hidden;
}

/* ── VN Sprite column ───────────────────────────────────── */
.s-sprite {
  border-right: 1px solid #141416;
  overflow: hidden;
  position: relative;
  background: #0d0d10;
}

.s-sprite img {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: auto;
  object-fit: cover;
  object-position: top center;
  display: block;
}

/* ── Panel host ─────────────────────────────────────────── */
.s-main {
  position: relative;
  overflow: hidden;
}

.s-panel {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease;
  padding: 28px;
}

.s-panel.active {
  opacity: 1;
  pointer-events: auto;
}

/* ── Status panel ───────────────────────────────────────── */
.s-status-inner {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.s-radar-wrap {
  flex-shrink: 0;
}

.s-radar {
  width: 260px;
  height: 260px;
}

/* ── Stat list ──────────────────────────────────────────── */
.s-stat-block {
  flex: 1;
  min-width: 0;
}

.s-toggle {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}

.s-toggle-btn {
  padding: 4px 14px;
  border-radius: 100px;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  cursor: pointer;
  background: transparent;
  border: 1px solid #333;
  color: #999;
  transition: all 0.15s;
}

.s-toggle-btn:hover { color: #ccc; border-color: #555; }

.s-toggle-btn.active {
  background: rgba(255, 229, 44, 0.08);
  color: #ffe52c;
  border-color: rgba(255, 229, 44, 0.3);
}

.s-stat-list {
  display: flex;
  flex-direction: column;
}

.s-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #1a1a1a;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.12s;
}

.s-stat-item:last-child { border-bottom: none; }
.s-stat-item:hover { background: rgba(255, 255, 255, 0.03); }

.s-stat-num {
  font-size: 0.62rem;
  color: #555;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  width: 16px;
  flex-shrink: 0;
}

.s-stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.s-stat-info { flex: 1; }

.s-stat-name {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.s-stat-key {
  font-size: 0.62rem;
  color: #999;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  margin-top: 2px;
}

.s-stat-count {
  font-size: 2rem;
  font-weight: 900;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  flex-shrink: 0;
}

/* ── Quests panel ───────────────────────────────────────── */
.s-quest-section { margin-bottom: 32px; }

.s-quest-category {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #ffe52c;
  margin-bottom: 12px;
  border-bottom: 1px solid #1e1e1e;
  padding-bottom: 6px;
}

.s-quest-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.s-quest-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.92rem;
  color: #d0d0d0;
  line-height: 1.4;
}

.s-quest-item::before {
  content: '▸';
  color: #444;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Log panel ──────────────────────────────────────────── */
.s-log-filter {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.s-log-pill {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  cursor: pointer;
  background: transparent;
  border: 1px solid #333;
  color: #999;
  transition: all 0.15s;
}

.s-log-pill:hover { color: #ccc; border-color: #555; }

.s-log-pill.active {
  color: #f0f0f0;
  border-color: #666;
  background: rgba(255, 255, 255, 0.06);
}

.s-log-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.s-log-entry {
  padding: 16px;
  border: 1px solid #1e1e1e;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.15s;
}

.s-log-entry:hover { border-color: #333; }
.s-log-entry[hidden] { display: none; }

.s-log-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  margin-bottom: 4px;
}

.s-log-date {
  font-size: 0.62rem;
  color: #999;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.s-log-summary {
  font-size: 0.88rem;
  color: #bbb;
  line-height: 1.5;
  margin-bottom: 10px;
}

.s-log-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.s-log-chip {
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  border: 1px solid;
}

.s-log-memo {
  font-size: 0.82rem;
  color: #888;
  font-style: italic;
  line-height: 1.4;
}

.s-log-memo::before { content: '"'; }
.s-log-memo::after  { content: '"'; }

/* ── Bonds panel ────────────────────────────────────────── */
.s-bonds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.s-bond-card {
  padding: 16px;
  border: 1px solid #1e1e1e;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.15s;
}

.s-bond-card:hover { border-color: #333; }

.s-bond-name {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.s-bond-arcana {
  font-size: 0.62rem;
  color: #ffe52c;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  margin-bottom: 6px;
}

.s-bond-affinity {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 10px;
}

.s-bond-rank {
  display: flex;
  gap: 4px;
}

.s-bond-pip {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #333;
  border: 1px solid #444;
}

.s-bond-pip.filled {
  background: #ffe52c;
  border-color: #ffe52c;
  box-shadow: 0 0 4px rgba(255, 229, 44, 0.4);
}

/* ── Velvet panel ───────────────────────────────────────── */
.s-velvet {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 24px;
  text-align: center;
}

.s-velvet-title {
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(45, 212, 191, 0.6);
  line-height: 1;
}

.s-velvet-subtitle {
  font-size: 0.75rem;
  color: #999;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

.s-velvet-email {
  font-size: 1rem;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: rgba(45, 212, 191, 0.5);
  letter-spacing: 0.06em;
  padding: 12px 24px;
  border: 1px solid rgba(45, 212, 191, 0.15);
  border-radius: 5px;
  background: rgba(45, 212, 191, 0.04);
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}

.s-velvet-email:hover {
  border-color: rgba(45, 212, 191, 0.35);
  color: rgba(45, 212, 191, 0.8);
}

/* ── Radar SVG internals ────────────────────────────────── */
.s-radar-guide {
  fill: none;
  stroke: rgba(255, 255, 255, 0.06);
  stroke-width: 1;
}

.s-radar-axis {
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 1;
}

.s-radar-poly-all {
  fill: none;
  stroke: rgba(255, 255, 255, 0.18);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}

.s-radar-poly-recent {
  fill: rgba(255, 229, 44, 0.08);
  stroke: #ffe52c;
  stroke-width: 2;
}

/* When showing all-time mode: swap which is solid */
.s-radar-poly-all.is-primary {
  fill: rgba(255, 229, 44, 0.08);
  stroke: #ffe52c;
  stroke-width: 2;
  stroke-dasharray: none;
}

.s-radar-poly-recent.is-secondary {
  fill: none;
  stroke: rgba(255, 255, 255, 0.18);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}

.s-radar-label {
  font-size: 10px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  fill: #aaa;
  text-anchor: middle;
  dominant-baseline: middle;
}

/* ── Reduced motion ─────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .s-panel { transition: none; }
}

/* ── Mobile: collapse sprite, stack layout ──────────────── */
@media (max-width: 768px) {
  .s-shell { grid-template-columns: 1fr; }
  .s-sprite { display: none; }
  .s-status-inner { flex-direction: column; align-items: center; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/stream.css
git commit -m "feat: add stream page CSS"
```

---

## Task 5: Stream Page (`/stream`)

**Files:**
- Create: `src/pages/stream/index.astro`

> **Note:** Before first load, place a portrait image at `public/images/stream/portrait.png`. Any PNG will work as a placeholder. The sprite column gracefully shows a dark background without it.

- [ ] **Step 1: Create `src/pages/stream/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import { readFileSync } from 'fs';
import { join } from 'path';
import BaseLayout from '../../layouts/BaseLayout.astro';
import {
  tallyStats,
  buildRadarPoints,
  buildGuidePoints,
  parseQuestMenu,
  STAT_ORDER,
} from '../../utils/stream';

const STAT_META: Record<string, { color: string; tagline: string; cssVar: string }> = {
  Determination: { color: '#ff4040', tagline: 'The will to continue',       cssVar: 'var(--stat-determination)' },
  Insight:       { color: '#4ab0ff', tagline: 'Seeing through the noise',   cssVar: 'var(--stat-insight)' },
  Expression:    { color: '#a855f7', tagline: 'Making something from nothing', cssVar: 'var(--stat-expression)' },
  Sincerity:     { color: '#ffe52c', tagline: 'Meaning what you say',       cssVar: 'var(--stat-sincerity)' },
  Chaos:         { color: '#2dd4bf', tagline: 'Embracing the unexpected',   cssVar: 'var(--stat-chaos)' },
};

// Fetch content at build time
const streamEntries = await getCollection('stream', ({ data }) => !data.draft);
const socialLinks   = await getCollection('social-links', ({ data }) => !data.draft);
streamEntries.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
socialLinks.sort((a, b) => b.data.rank - a.data.rank);

// Stat tallies
const recentTallies = tallyStats(streamEntries, 'recent');
const allTallies    = tallyStats(streamEntries, 'all');

const recentMax = Math.max(0, ...Object.values(recentTallies).map(v => v ?? 0));
const allMax    = Math.max(0, ...Object.values(allTallies).map(v => v ?? 0));

// Radar paths
const CX = 150, CY = 150, R = 110;
const recentPoints = buildRadarPoints(recentTallies, recentMax || 1, CX, CY, R);
const allPoints    = buildRadarPoints(allTallies,    allMax    || 1, CX, CY, R);

// Guide ring points
const guides = [0.25, 0.5, 0.75, 1].map(f => buildGuidePoints(f, CX, CY, R));

// Axis endpoints (center → outer vertex)
const axes = STAT_ORDER.map((_, i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180);
  return {
    x2: (CX + R * Math.cos(angle)).toFixed(2),
    y2: (CY + R * Math.sin(angle)).toFixed(2),
  };
});

// Stat label positions (slightly outside outer ring)
const LABEL_R = R + 20;
const statLabels = STAT_ORDER.map((stat, i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180);
  return {
    stat,
    x: (CX + LABEL_R * Math.cos(angle)).toFixed(2),
    y: (CY + LABEL_R * Math.sin(angle)).toFixed(2),
  };
});

// Ranked stat list (recent by default; all-time as fallback data)
const rankedStats = [...STAT_ORDER].sort(
  (a, b) => (recentTallies[b] ?? 0) - (recentTallies[a] ?? 0)
);

// Quest menu
const questRaw = readFileSync(join(process.cwd(), 'src/content/quest-menu.md'), 'utf-8');
const questSections = parseQuestMenu(questRaw);

// Date range for header
const dates = streamEntries.map(e => e.data.publishedAt);
const earliest = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
const latest   = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
const fmtDate  = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const dateRange = earliest && latest
  ? earliest.getTime() === latest.getTime()
    ? fmtDate(latest)
    : `${fmtDate(earliest)} — ${fmtDate(latest)}`
  : 'No sessions yet';

// Serialize both tally sets for client-side toggle
const recentData = JSON.stringify(recentTallies);
const allData    = JSON.stringify(allTallies);
---

<BaseLayout title="Stream — ninjaruss_" description="Velvet Room session archive for the ninjaruss_ Twitch stream.">
  <link rel="stylesheet" href="/styles/stream.css" slot="head" />

  <div class="stream-page">

    <!-- Chrome bar -->
    <div class="s-chrome">
      <span class="s-chrome-label"><strong>NINJARUSS_</strong> — Session Archive</span>
      <div class="s-tabs" role="tablist">
        <button class="s-tab active" data-tab="status"  role="tab" aria-selected="true">Status</button>
        <button class="s-tab"        data-tab="quests"  role="tab" aria-selected="false">Quests</button>
        <button class="s-tab"        data-tab="log"     role="tab" aria-selected="false">Log</button>
        <button class="s-tab"        data-tab="bonds"   role="tab" aria-selected="false">Bonds</button>
        <button class="s-tab"        data-tab="velvet"  role="tab" aria-selected="false">Velvet</button>
      </div>
    </div>

    <!-- Header -->
    <div class="s-header">
      <div class="s-header-title">Session Archive</div>
      <div class="s-header-range">{dateRange}</div>
    </div>

    <!-- Shell -->
    <div class="s-shell">

      <!-- VN Sprite -->
      <div class="s-sprite" aria-hidden="true">
        <img src="/images/stream/portrait.png" alt="" />
      </div>

      <!-- Panel host -->
      <div class="s-main">

        <!-- ── STATUS ───────────────────────────────────── -->
        <div class="s-panel active" id="panel-status" role="tabpanel">
          <div class="s-status-inner">

            <!-- Radar chart -->
            <div class="s-radar-wrap">
              <svg
                class="s-radar"
                viewBox="0 0 300 300"
                aria-label="Stat radar chart"
                role="img"
              >
                <!-- Guide rings -->
                {guides.map(pts => (
                  <polygon class="s-radar-guide" points={pts} />
                ))}

                <!-- Axes -->
                {axes.map(ax => (
                  <line class="s-radar-axis" x1={CX} y1={CY} x2={ax.x2} y2={ax.y2} />
                ))}

                <!-- All-time polygon (dashed, behind) -->
                <polygon
                  id="radar-all"
                  class="s-radar-poly-all"
                  points={allPoints}
                />

                <!-- Recent polygon (solid, in front) -->
                <polygon
                  id="radar-recent"
                  class="s-radar-poly-recent"
                  points={recentPoints}
                />

                <!-- Stat labels -->
                {statLabels.map(({ stat, x, y }) => (
                  <text class="s-radar-label" x={x} y={y}>{stat}</text>
                ))}
              </svg>
            </div>

            <!-- Stat list -->
            <div class="s-stat-block">
              <div class="s-toggle">
                <button class="s-toggle-btn active" data-mode="recent">Recent (10)</button>
                <button class="s-toggle-btn"        data-mode="all">All Time</button>
              </div>

              <!-- Hidden data store -->
              <div
                id="stream-tally-data"
                data-recent={recentData}
                data-all={allData}
                hidden
              ></div>

              <div class="s-stat-list" id="stat-list">
                {rankedStats.map((stat, idx) => {
                  const meta  = STAT_META[stat];
                  const count = recentTallies[stat] ?? 0;
                  return (
                    <div
                      class="s-stat-item"
                      data-stat={stat}
                      style={`--item-color: ${meta.color}`}
                      tabindex="0"
                      role="button"
                      aria-label={`${stat} — navigate to log filtered by ${stat}`}
                    >
                      <span class="s-stat-num">{idx + 1}</span>
                      <span class="s-stat-dot" style={`background: ${meta.color}`}></span>
                      <div class="s-stat-info">
                        <div class="s-stat-name" style={`color: ${meta.color}`}>{stat}</div>
                        <div class="s-stat-key">{meta.tagline}</div>
                      </div>
                      <span class="s-stat-count" data-stat-count={stat} style={`color: ${meta.color}`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        <!-- ── QUESTS ─────────────────────────────────── -->
        <div class="s-panel" id="panel-quests" role="tabpanel">
          {questSections.map(({ category, quests }) => (
            <div class="s-quest-section">
              <div class="s-quest-category">{category}</div>
              <ul class="s-quest-list">
                {quests.map(q => (
                  <li class="s-quest-item">{q}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <!-- ── LOG ───────────────────────────────────── -->
        <div class="s-panel" id="panel-log" role="tabpanel">
          <div class="s-log-filter" id="log-filter">
            <button class="s-log-pill active" data-stat="all">All</button>
            {STAT_ORDER.map(stat => {
              const meta = STAT_META[stat];
              return (
                <button
                  class="s-log-pill"
                  data-stat={stat}
                  style={`--pill-color: ${meta.color}`}
                >
                  {stat}
                </button>
              );
            })}
          </div>

          <div class="s-log-list" id="log-list">
            {streamEntries.map(entry => {
              const dateStr = entry.data.publishedAt.toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
              });
              return (
                <div
                  class="s-log-entry"
                  data-stats={JSON.stringify(entry.data.stats)}
                >
                  <div class="s-log-title">{entry.data.title}</div>
                  <div class="s-log-date">{dateStr}</div>
                  <div class="s-log-summary">{entry.data.summary}</div>
                  <div class="s-log-chips">
                    {entry.data.stats.map(stat => {
                      const meta = STAT_META[stat];
                      return (
                        <span
                          class="s-log-chip"
                          style={`color: ${meta.color}; border-color: ${meta.color}40; background: ${meta.color}10`}
                        >
                          {stat}
                        </span>
                      );
                    })}
                  </div>
                  <div class="s-log-memo">{entry.data.memorable}</div>
                </div>
              );
            })}
          </div>
        </div>

        <!-- ── BONDS ─────────────────────────────────── -->
        <div class="s-panel" id="panel-bonds" role="tabpanel">
          <div class="s-bonds-grid">
            {socialLinks.map(link => (
              <div class="s-bond-card">
                <div class="s-bond-name">{link.data.name}</div>
                <div class="s-bond-arcana">{link.data.arcana}</div>
                <div class="s-bond-affinity">{link.data.affinity}</div>
                <div class="s-bond-rank" aria-label={`Rank ${link.data.rank} of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span class={`s-bond-pip${i < link.data.rank ? ' filled' : ''}`}></span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <!-- ── VELVET ─────────────────────────────────── -->
        <div class="s-panel" id="panel-velvet" role="tabpanel">
          <div class="s-velvet">
            <div class="s-velvet-title">Velvet Room</div>
            <div class="s-velvet-subtitle">A place that exists between mind and matter</div>
            <a href="mailto:russ081999@gmail.com" class="s-velvet-email">russ081999@gmail.com</a>
          </div>
        </div>

      </div><!-- /s-main -->
    </div><!-- /s-shell -->
  </div><!-- /stream-page -->
</BaseLayout>

<script>
  import { parseTwitchLiveResponse } from '../../utils/twitchStatus';

  /* ── Tab switching ──────────────────────────────────── */
  const tabs   = document.querySelectorAll<HTMLButtonElement>('.s-tab');
  const panels = document.querySelectorAll<HTMLElement>('.s-panel');

  function activateTab(tabName: string): void {
    tabs.forEach(t => {
      const active = t.dataset.tab === tabName;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    panels.forEach(p => {
      p.classList.toggle('active', p.id === `panel-${tabName}`);
    });
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab!));
  });

  /* ── Stat mode toggle (recent / all-time) ───────────── */
  const dataEl       = document.getElementById('stream-tally-data')!;
  const recentData   = JSON.parse(dataEl.dataset.recent ?? '{}') as Record<string, number>;
  const allData      = JSON.parse(dataEl.dataset.all    ?? '{}') as Record<string, number>;
  const radarRecent  = document.getElementById('radar-recent')!;
  const radarAll     = document.getElementById('radar-all')!;

  document.querySelectorAll<HTMLButtonElement>('.s-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.s-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode as 'recent' | 'all';

      const tally = mode === 'recent' ? recentData : allData;

      // Update count labels
      document.querySelectorAll<HTMLElement>('[data-stat-count]').forEach(el => {
        const stat = el.dataset.statCount!;
        el.textContent = String(tally[stat] ?? 0);
      });

      // Swap radar polygon styles
      if (mode === 'recent') {
        radarRecent.classList.remove('is-secondary');
        radarAll.classList.remove('is-primary');
      } else {
        radarRecent.classList.add('is-secondary');
        radarAll.classList.add('is-primary');
      }
    });
  });

  /* ── Stat click → Log tab with pre-filter ───────────── */
  document.querySelectorAll<HTMLElement>('.s-stat-item').forEach(item => {
    const activate = () => {
      const stat = item.dataset.stat!;
      activateTab('log');
      const pill = document.querySelector<HTMLButtonElement>(`.s-log-pill[data-stat="${stat}"]`);
      if (pill) filterLog(stat, pill);
    };
    item.addEventListener('click', activate);
    item.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });

  /* ── Log stat filter ────────────────────────────────── */
  function filterLog(stat: string, activePill: HTMLElement): void {
    document.querySelectorAll('.s-log-pill').forEach(p => p.classList.remove('active'));
    activePill.classList.add('active');

    document.querySelectorAll<HTMLElement>('.s-log-entry').forEach(entry => {
      if (stat === 'all') {
        entry.hidden = false;
      } else {
        const stats: string[] = JSON.parse(entry.dataset.stats ?? '[]');
        entry.hidden = !stats.includes(stat);
      }
    });
  }

  document.querySelectorAll<HTMLButtonElement>('.s-log-pill').forEach(pill => {
    pill.addEventListener('click', () => filterLog(pill.dataset.stat!, pill));
  });

  /* ── Twitch live detection ──────────────────────────── */
  const TWITCH_CLIENT_ID    = import.meta.env.PUBLIC_TWITCH_CLIENT_ID  as string | undefined;
  const TWITCH_ACCESS_TOKEN = import.meta.env.PUBLIC_TWITCH_ACCESS_TOKEN as string | undefined;

  async function checkTwitchLive(): Promise<void> {
    if (!TWITCH_CLIENT_ID || !TWITCH_ACCESS_TOKEN) return;
    try {
      const res = await fetch(
        'https://api.twitch.tv/helix/streams?user_login=ninjaruss_',
        {
          headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${TWITCH_ACCESS_TOKEN}`,
          },
        }
      );
      if (!res.ok) return;
      const data: unknown = await res.json();
      if (parseTwitchLiveResponse(data)) {
        document.title = '🔴 LIVE — ninjaruss_';
      }
    } catch {
      // silent — live badge is non-critical
    }
  }

  checkTwitchLive();
  setInterval(checkTwitchLive, 300_000);
</script>
```

- [ ] **Step 2: Verify build succeeds**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

Expected: clean build, no errors.

- [ ] **Step 3: Start dev server and verify page renders**

```bash
npm run dev
```

Open `http://localhost:4321/stream` and check:
- Chrome bar with 5 tab buttons visible
- Status panel visible by default with radar SVG and stat list
- Clicking each tab shows the correct panel
- Recent / All Time toggle updates stat counts
- Clicking a stat navigates to Log tab and filters entries

- [ ] **Step 4: Commit**

```bash
git add src/pages/stream/ src/styles/stream.css
git commit -m "feat: add /stream Velvet Room page with 5 tab panels"
```

---

## Task 6: Update Homepage Tile (KAIMA → Ninjaruss_ Stream)

**Files:**
- Modify: `src/pages/index.astro` (lines 186–211 for HTML, lines 1182–1254 for script)

- [ ] **Step 1: Update tile HTML**

In `src/pages/index.astro`, replace the tile at lines 186–211:

```astro
<a
  id="stream-tile"
  href="/stream"
  class="bento-tile bento-tile--full bento-tile--small bento-tile--dark bento-tile--interactive bento-tile--span-1x2 stream-tile"
>
  <div class="stream-tile__body">
    <div class="stream-tile__text">
      <div class="stream-tile__name">NINJARUSS_</div>
      <div class="stream-tile__desc">twitch · session log</div>
    </div>
    <div
      id="stream-watch-btn"
      class="stream-watch-btn"
      role="link"
      tabindex="-1"
      aria-label="Watch live on Twitch"
      data-href="https://twitch.tv/ninjaruss_"
      hidden
    >
      <span class="stream-watch-btn__dot"></span>
      Watch<br />Live
    </div>
  </div>
</a>
```

- [ ] **Step 2: Update CSS class names**

In `src/pages/index.astro`, find the `/* ─── KAIMA Tile ─────────────────────────────────────── */` CSS block (around line 765) and rename all occurrences of `.kaima-tile` → `.stream-tile` and `.kaima-watch-btn` → `.stream-watch-btn`. Also update the `@keyframes kaima-tile-pulse` → `kaima-tile-pulse` can stay as-is since it's an animation name, or rename to `stream-tile-pulse` for consistency.

The full CSS block replacement (find the existing block and replace):

```css
/* ─── Stream Tile ─────────────────────────────────────── */
.stream-tile {
  position: relative;
  overflow: hidden;
}

.stream-tile:not(.is-live):hover {
  border-color: rgba(255, 229, 44, 0.4);
}

.stream-tile.is-live {
  border-color: rgba(255, 80, 80, 0.5);
  animation: stream-tile-pulse 2.5s ease-in-out infinite;
}

@keyframes stream-tile-pulse {
  0%, 100% { box-shadow: var(--shadow-hard); }
  50%       { box-shadow: var(--shadow-hard), 0 0 24px rgba(255, 80, 80, 0.25); }
}

.stream-tile__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
  padding: var(--space-md);
  gap: var(--space-sm);
}

.stream-tile__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stream-tile__name {
  font-size: var(--text-lg);
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text);
  line-height: 1.1;
}

.stream-tile.is-live .stream-tile__name {
  color: #ff5050;
}

.stream-tile__desc {
  font-size: var(--text-xs);
  color: #999;
  letter-spacing: 0.06em;
  text-transform: lowercase;
  font-family: 'JetBrains Mono', monospace;
}

.stream-tile.is-live .stream-tile__desc {
  color: rgba(255, 80, 80, 0.7);
}

.stream-watch-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  background: rgba(255, 80, 80, 0.15);
  border: 1px solid rgba(255, 80, 80, 0.35);
  color: #ff5050;
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.2;
  text-align: center;
  animation: stream-btn-breathe 1.5s ease-in-out infinite;
  cursor: pointer;
}

@keyframes stream-btn-breathe {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.7; }
}

.stream-watch-btn__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  animation: stream-dot-flash 1s ease-in-out infinite;
}

@keyframes stream-dot-flash {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
```

- [ ] **Step 3: Update the `prefers-reduced-motion` block**

Find the reduced-motion block (around line 1117) and rename the kaima references:

```css
@media (prefers-reduced-motion: reduce) {
  .stream-tile.is-live    { animation: none; }
  .stream-watch-btn       { animation: none; }
  .stream-watch-btn__dot  { animation: none; }
}
```

- [ ] **Step 4: Update the client script**

Replace the script block starting at line 1182 (the `checkYouTubeLive` section). Remove the import of `parseYouTubeLiveResponse` and replace the entire live detection section:

```typescript
import { parseTwitchLiveResponse } from '../utils/twitchStatus';

const TWITCH_CLIENT_ID    = import.meta.env.PUBLIC_TWITCH_CLIENT_ID  as string | undefined;
const TWITCH_ACCESS_TOKEN = import.meta.env.PUBLIC_TWITCH_ACCESS_TOKEN as string | undefined;

let liveInterval: ReturnType<typeof setInterval> | undefined;

async function checkTwitchLive(): Promise<void> {
  if (!TWITCH_CLIENT_ID || !TWITCH_ACCESS_TOKEN) return;
  try {
    const res = await fetch(
      'https://api.twitch.tv/helix/streams?user_login=ninjaruss_',
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${TWITCH_ACCESS_TOKEN}`,
        },
      }
    );
    if (!res.ok) { applyLiveState(false); return; }
    const data: unknown = await res.json();
    applyLiveState(parseTwitchLiveResponse(data));
  } catch {
    applyLiveState(false);
  }
}

function applyLiveState(isLive: boolean): void {
  const tile     = document.getElementById('stream-tile') as HTMLAnchorElement | null;
  const watchBtn = document.getElementById('stream-watch-btn') as HTMLElement | null;
  if (!tile) return;
  tile.classList.toggle('is-live', isLive);
  if (watchBtn) watchBtn.hidden = !isLive;
}

function startLivePolling(): void {
  stopLivePolling();
  checkTwitchLive();
  liveInterval = setInterval(checkTwitchLive, 300_000);
}

function stopLivePolling(): void {
  if (liveInterval !== undefined) {
    clearInterval(liveInterval);
    liveInterval = undefined;
  }
}
```

- [ ] **Step 5: Update the watch-button click handler**

Find the `kaimaWatchBtnHandler` section (around line 1329) and update the element ID and handler name:

```typescript
let streamWatchBtnHandler: ((e: Event) => void) | null = null;

function initStreamWatchBtn(): void {
  const btn = document.getElementById('stream-watch-btn');
  if (!btn) return;
  if (streamWatchBtnHandler) {
    btn.removeEventListener('click', streamWatchBtnHandler);
  }
  streamWatchBtnHandler = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const href = btn.dataset.href ?? 'https://twitch.tv/ninjaruss_';
    window.open(href, '_blank', 'noopener,noreferrer');
  };
  btn.addEventListener('click', streamWatchBtnHandler);
}
```

Update the view-transition lifecycle hooks (wherever `initializeKaimaWatchBtn` or similar is called) to call `initStreamWatchBtn()` and `startLivePolling()` instead.

- [ ] **Step 6: Build and verify**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

Expected: clean build.

Open `http://localhost:4321/` and verify:
- Tile shows "NINJARUSS_" and "twitch · session log"
- Tile links to `/stream` (not external YouTube)
- Watch Live button is hidden by default (no env vars set in dev)

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro src/utils/twitchStatus.ts
git commit -m "feat: update stream tile to link to /stream with Twitch live detection"
```

---

## Self-Review

**Spec coverage check:**
- ✅ `/stream` route with 5 tab panels (Status, Quests, Log, Bonds, Velvet)
- ✅ VN sprite column (220px) — Task 5
- ✅ Pentagram radar chart — Task 5 (SVG built at render time)
- ✅ Per-stat colors + taglines — Task 5 `STAT_META`
- ✅ Recent (10) / All-time toggle — Task 5 + client script
- ✅ All-time dashed polygon overlay — Task 4 CSS + Task 5 SVG
- ✅ Stat click → Log tab filtered — Task 5 client script
- ✅ Quest menu from single markdown file — Task 1 + 2 + 5
- ✅ Log with filter bar — Task 5
- ✅ Bonds card grid — Task 5
- ✅ Velvet panel with email — Task 5
- ✅ Twitch live detection utility — Task 3
- ✅ Homepage tile rename + Twitch switch — Task 6
- ✅ All subtext ≥ `#999` (enforced in Task 4 CSS; `#888` minimum used for secondary text)
- ✅ Viewport-height, no body scroll — Task 4 CSS
- ✅ `prefers-reduced-motion` respected — Task 4 CSS + Task 6 CSS
- ✅ Content collections with Zod schemas — Task 1
- ✅ Unit tests for all utilities — Tasks 2 and 3

**No TBDs or placeholders found.**

**Type consistency:** `STAT_ORDER` exported from `stream.ts` and consumed in `index.astro`; `parseTwitchLiveResponse` used in both `stream/index.astro` and `index.astro` scripts; `data-stat-count` attribute matches the selector in the client script.

**Note on `public/images/stream/portrait.png`:** Must be added manually before first deploy. The sprite column renders a dark background without it — no broken-image flash.

**Note on CSS import in Astro:** `stream.css` is referenced via `<link rel="stylesheet" href="/styles/stream.css" slot="head" />`. Ensure `src/styles/stream.css` is copied to `public/styles/stream.css` OR use Astro's CSS import in the frontmatter (`import '../../styles/stream.css'`). If the link approach doesn't work during build, switch the page to use `<style is:global>` with the contents of `stream.css` inlined, or add it to BaseLayout.
