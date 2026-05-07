# Stream Status Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing `/stream` page with logarithmic stat scaling, emblem-vertex radar hover effects, an objective strip, and a slide-in bond detail panel.

**Architecture:** Four independent changes to the existing `stream/index.astro` page: (1) a pure utility function for log scaling in `stream.ts`, (2) a schema extension for richer bond data in `config.ts`, (3) radar SVG upgrade with SVG filter silhouettes and vertex hover groups, (4) bonds panel rebuilt as a list + slide-in detail column. The page already renders via Astro SSG; all new interactivity is vanilla JS in the existing `astro:page-load` listener.

**Tech Stack:** Astro 5, TypeScript, vanilla SVG/CSS/JS, Vitest, Zod schemas

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `src/utils/stream.ts` | Modify | Add `STAT_CEILING`, `applyLogScale`, `scaleAllTallies` |
| `src/tests/stream.test.ts` | Modify | Add tests for new log-scale functions |
| `src/content/config.ts` | Modify | Extend `social-links` schema with `stat`, `reachedDate`, `lore`, `lastSession`, `img` |
| `src/content/social-links/sample.md` | Modify | Add new optional fields |
| `src/pages/stream/index.astro` | Modify | Frontmatter: log scaling, vertex data, bond serialization. HTML: objective strip, SVG vertex groups, bonds panel. Script: vertex count toggle, bond detail JS |
| `src/styles/stream.css` | Modify | Add vertex hover CSS, objective strip CSS, bonds list/detail CSS. Remove unused `.s-radar-label` |

---

## Task 1: Add log scaling to stream utilities

**Files:**
- Modify: `src/utils/stream.ts`
- Modify: `src/tests/stream.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `src/tests/stream.test.ts`. Update the import line first:

```typescript
import {
  tallyStats, buildRadarPoints, buildGuidePoints, parseQuestMenu, STAT_ORDER,
  applyLogScale, scaleAllTallies, STAT_CEILING,
  type StatName,
} from '../utils/stream';
```

Then add these two `describe` blocks after the existing ones:

```typescript
describe('applyLogScale', () => {
  it('returns 0 for 0 raw sessions', () => {
    expect(applyLogScale(0)).toBe(0);
  });
  it('returns below ceiling for 49 raw sessions', () => {
    expect(applyLogScale(49)).toBeLessThan(STAT_CEILING);
  });
  it('caps at STAT_CEILING for 1000 raw sessions', () => {
    expect(applyLogScale(1000)).toBe(STAT_CEILING);
  });
  it('early gains are larger than late gains', () => {
    const earlyGain = applyLogScale(5) - applyLogScale(0);
    const lateGain  = applyLogScale(30) - applyLogScale(25);
    expect(earlyGain).toBeGreaterThan(lateGain);
  });
});

describe('scaleAllTallies', () => {
  it('applies log scale to each stat', () => {
    const tallies: Partial<Record<StatName, number>> = { Determination: 1, Insight: 5 };
    const scaled = scaleAllTallies(tallies);
    expect(scaled.Determination).toBeCloseTo(applyLogScale(1), 5);
    expect(scaled.Insight).toBeCloseTo(applyLogScale(5), 5);
  });
  it('treats missing stats as 0', () => {
    const scaled = scaleAllTallies({});
    for (const stat of STAT_ORDER) {
      expect(scaled[stat]).toBe(0);
    }
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm run test -- --reporter=verbose 2>&1 | grep -E "FAIL|applyLogScale|scaleAllTallies"
```

Expected: `ReferenceError: applyLogScale is not defined` (or similar import error)

- [ ] **Step 3: Implement log scaling in `src/utils/stream.ts`**

Add after the existing `buildGuidePoints` function (before `parseQuestMenu`):

```typescript
export const STAT_CEILING = 100;

// Scale factor tuned so 50 raw sessions → display value ≈ 100
const LOG_SCALE_FACTOR = STAT_CEILING / Math.log(1 + 50);

export function applyLogScale(raw: number): number {
  return Math.min(STAT_CEILING, Math.log(1 + raw) * LOG_SCALE_FACTOR);
}

export function scaleAllTallies(
  tallies: Partial<Record<StatName, number>>
): Partial<Record<StatName, number>> {
  const result: Partial<Record<StatName, number>> = {};
  for (const stat of STAT_ORDER) {
    result[stat] = applyLogScale(tallies[stat] ?? 0);
  }
  return result;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test -- --reporter=verbose 2>&1 | grep -E "PASS|FAIL|applyLogScale|scaleAllTallies"
```

Expected: all `applyLogScale` and `scaleAllTallies` tests show ✓

- [ ] **Step 5: Commit**

```bash
git add src/utils/stream.ts src/tests/stream.test.ts
git commit -m "feat(stream): add logarithmic stat scaling utility"
```

---

## Task 2: Extend social-links schema for bond detail panel

**Files:**
- Modify: `src/content/config.ts`
- Modify: `src/content/social-links/sample.md`

- [ ] **Step 1: Update `social-links` schema in `src/content/config.ts`**

Find the `socialLinks` collection definition and replace it with:

```typescript
const socialLinks = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    arcana: z.string(),
    affinity: z.string(),
    rank: z.number().min(0).max(5).default(0),
    stat: z.enum(['Determination', 'Insight', 'Expression', 'Sincerity', 'Chaos']).optional(),
    reachedDate: z.string().optional(),
    lore: z.string().optional(),
    lastSession: z.string().optional(),
    lastInteraction: z.string().optional(),
    img: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});
```

- [ ] **Step 2: Update `src/content/social-links/sample.md` frontmatter**

Replace the existing frontmatter:

```yaml
---
name: "Sample Bond"
arcana: "The Star"
affinity: "Curious"
rank: 3
stat: "Insight"
reachedDate: "March 2026"
lore: "A brief lore description of this bond and what it represents."
lastSession: "Talked through something interesting together."
lastInteraction: "May 2026"
draft: true
---
```

- [ ] **Step 3: Verify build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: no Zod schema errors, build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/social-links/sample.md
git commit -m "feat(stream): extend social-links schema with bond detail fields"
```

---

## Task 3: Apply log scaling to all-time radar polygon

**Files:**
- Modify: `src/pages/stream/index.astro` (frontmatter `---` section only)

- [ ] **Step 1: Update imports in frontmatter**

Find this line near the top of the `---` block:

```typescript
import {
  tallyStats,
  buildRadarPoints,
  buildGuidePoints,
  parseQuestMenu,
  STAT_ORDER,
} from '../../utils/stream';
```

Replace with:

```typescript
import {
  tallyStats,
  buildRadarPoints,
  buildGuidePoints,
  parseQuestMenu,
  STAT_ORDER,
  scaleAllTallies,
  STAT_CEILING,
} from '../../utils/stream';
```

- [ ] **Step 2: Update tally computation in frontmatter**

Find these lines:

```typescript
const recentMax = Math.max(1, ...Object.values(recentTallies).map(v => v ?? 0));
const allMax    = Math.max(1, ...Object.values(allTallies).map(v => v ?? 0));

const recentPoints = buildRadarPoints(recentTallies, recentMax, CX, CY, R);
const allPoints    = buildRadarPoints(allTallies,    allMax,    CX, CY, R);
```

Replace with:

```typescript
const recentMax  = Math.max(1, ...Object.values(recentTallies).map(v => v ?? 0));
const allScaled  = scaleAllTallies(allTallies);

const recentPoints = buildRadarPoints(recentTallies, recentMax,    CX, CY, R);
const allPoints    = buildRadarPoints(allScaled,     STAT_CEILING, CX, CY, R);
```

- [ ] **Step 3: Verify build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds with no TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/stream/index.astro
git commit -m "feat(stream): apply logarithmic scaling to all-time radar polygon"
```

---

## Task 4: Add objective strip and emblem-vertex radar hover

**Files:**
- Modify: `src/pages/stream/index.astro` (frontmatter + status panel HTML)
- Modify: `src/styles/stream.css`

- [ ] **Step 1: Add CSS to `src/styles/stream.css`**

Replace the `.s-radar-label` block:

```css
/* REMOVE this block entirely: */
.s-radar-label { ... }
```

Add these new blocks after `.s-radar-poly-recent.is-secondary { ... }`:

```css
/* ── Radar column wrapper ───────────────────────────────── */
.s-radar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

/* ── Objective strip ────────────────────────────────────── */
.s-objective-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-left: 2px solid #ffe52c;
  background: rgba(255, 229, 44, 0.04);
  margin-bottom: 12px;
  width: 100%;
  max-width: 300px;
  overflow: hidden;
}

.s-obj-label {
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #ffe52c;
  flex-shrink: 0;
}

.s-obj-text {
  font-size: 0.7rem;
  color: #ccc;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Radar vertex hover ─────────────────────────────────── */
.radar-vertex { cursor: default; }

.rv-dot {
  transition: opacity 0.18s 0.05s;
}
.radar-vertex:hover .rv-dot { opacity: 0; }

.rv-emblem {
  opacity: 0;
  transition: opacity 0.28s;
  pointer-events: none;
}
.radar-vertex:hover .rv-emblem { opacity: 1; }

.rv-count {
  font-size: 18px;
  font-weight: 900;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  paint-order: stroke fill;
  stroke: #0a0a0c;
  stroke-width: 5px;
}

.rv-name {
  font-size: 10px;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  fill: #e0e0e0;
  paint-order: stroke fill;
  stroke: #0a0a0c;
  stroke-width: 4px;
}

.rv-tag {
  font-size: 8.5px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  letter-spacing: 0.06em;
  fill: #777;
  paint-order: stroke fill;
  stroke: #0a0a0c;
  stroke-width: 4px;
  transition: opacity 0.18s;
}
.radar-vertex:hover .rv-tag { opacity: 0; }
```

Also update the mobile breakpoint to replace the `.s-sprite` mention and ensure `.s-radar-col` doesn't break layout. In the `@media (max-width: 768px)` block, `.s-radar-col` needs no additional rules (inherits flex column from parent).

- [ ] **Step 2: Update `src/pages/stream/index.astro` frontmatter — add vertex helpers**

Add this helper function and update `STAT_META` in the frontmatter (`---` block). Find the existing `STAT_META` declaration and replace it:

```typescript
function hexToRgbNorm(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

const STAT_META: Record<string, { color: string; tagline: string; emblem: string }> = {
  Determination: { color: '#ff4040', tagline: 'The will to continue',         emblem: '/images/emblems/determination.png' },
  Insight:       { color: '#4ab0ff', tagline: 'Seeing through the noise',     emblem: '/images/emblems/insight.png'       },
  Chaos:         { color: '#2dd4bf', tagline: 'Embracing the unexpected',     emblem: '/images/emblems/chaos.png'         },
  Sincerity:     { color: '#ffe52c', tagline: 'Meaning what you say',         emblem: '/images/emblems/sincerity.png'     },
  Expression:    { color: '#a855f7', tagline: 'Making something from nothing', emblem: '/images/emblems/expression.png'   },
};
```

- [ ] **Step 3: Update frontmatter — compute vertex data and remove old label code**

Find and remove these lines:

```typescript
// Labels placed just outside the outer ring
const LABEL_R = R + 36;
const statLabels = STAT_ORDER.map((stat, i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180);
  return {
    stat,
    x: (CX + LABEL_R * Math.cos(angle)).toFixed(2),
    y: (CY + LABEL_R * Math.sin(angle)).toFixed(2),
  };
});
```

Replace with:

```typescript
const TEXT_R = R + 42; // label text distance from center

const statVertices = STAT_ORDER.map((stat, i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180);
  const vx = +(CX + R * Math.cos(angle)).toFixed(2);
  const vy = +(CY + R * Math.sin(angle)).toFixed(2);
  const tx = +(CX + TEXT_R * Math.cos(angle)).toFixed(2);
  const ty = +(CY + TEXT_R * Math.sin(angle)).toFixed(2);
  const meta = STAT_META[stat];
  const [nr, ng, nb] = hexToRgbNorm(meta.color);
  const anchor = vx < CX - 10 ? 'end' : vx > CX + 10 ? 'start' : 'middle';
  const filterId = `sil-${stat.toLowerCase()}`;
  const clipId   = `clip-${stat.toLowerCase()}`;
  const filterMatrix = `0 0 0 0 ${nr.toFixed(3)}  0 0 0 0 ${ng.toFixed(3)}  0 0 0 0 ${nb.toFixed(3)}  -2 0 0 0 1.5`;
  return { stat, vx, vy, tx, ty, meta, anchor, filterId, clipId, filterMatrix };
});

const currentObjective = questSections.find(s => s.category === 'Active Quests')?.quests[0] ?? null;
```

- [ ] **Step 4: Update the status panel HTML**

Find the status panel section `<div class="s-panel active" id="panel-status" ...>`. Replace its entire contents with:

```astro
<div class="s-panel active" id="panel-status" role="tabpanel">
  <div class="s-status-inner">

    <div class="s-radar-col">
      {currentObjective && (
        <div class="s-objective-strip">
          <span class="s-obj-label">Objective</span>
          <span class="s-obj-text">{currentObjective}</span>
        </div>
      )}

      <div class="s-radar-wrap">
        <svg class="s-radar" viewBox="-20 -20 340 340" aria-label="Stat radar chart" role="img">
          <defs>
            <filter id="vglow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {statVertices.map(({ filterId, filterMatrix }) => (
              <filter id={filterId} color-interpolation-filters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
                <feColorMatrix type="saturate" values="0" result="g"/>
                <feColorMatrix in="g" type="matrix" values={filterMatrix}/>
              </filter>
            ))}
            {statVertices.map(({ clipId, vx, vy }) => (
              <clipPath id={clipId}>
                <circle cx={vx} cy={vy} r="18"/>
              </clipPath>
            ))}
          </defs>

          {guides.map(pts => (
            <polygon class="s-radar-guide" points={pts} />
          ))}
          {axes.map(ax => (
            <line class="s-radar-axis" x1={CX} y1={CY} x2={ax.x2} y2={ax.y2} />
          ))}
          <polygon id="radar-all"    class="s-radar-poly-all"    points={allPoints} />
          <polygon id="radar-recent" class="s-radar-poly-recent" points={recentPoints} />

          {statVertices.map(({ stat, vx, vy, tx, ty, meta, anchor, filterId, clipId }) => {
            const count = recentTallies[stat as (typeof STAT_ORDER)[number]] ?? 0;
            return (
              <g class="radar-vertex">
                <circle class="rv-dot" cx={vx} cy={vy} r="7" fill={meta.color} filter="url(#vglow)"/>
                <g class="rv-emblem">
                  <circle cx={vx} cy={vy} r="20" fill={`${meta.color}15`} stroke={meta.color} stroke-width="1.5" filter="url(#vglow)"/>
                  <image href={meta.emblem} x={vx - 18} y={vy - 18} width="36" height="36"
                         clip-path={`url(#${clipId})`} filter={`url(#${filterId})`}
                         preserveAspectRatio="xMidYMid slice"/>
                </g>
                <text class="rv-count" x={tx} y={ty - 18} text-anchor={anchor} fill={meta.color} data-vertex-count={stat}>{count}</text>
                <text class="rv-name"  x={tx} y={ty}      text-anchor={anchor}>{stat}</text>
                <text class="rv-tag"   x={tx} y={ty + 14} text-anchor={anchor}>{meta.tagline}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>

    <div class="s-stat-block">
      <div class="s-toggle">
        <button class="s-toggle-btn active" data-mode="recent">Recent (10)</button>
        <button class="s-toggle-btn"        data-mode="all">All Time</button>
      </div>

      <div id="stream-tally-data" data-recent={recentData} data-all={allData} hidden></div>

      <div class="s-stat-list" id="stat-list">
        {rankedStats.map((stat, idx) => {
          const meta  = STAT_META[stat];
          const count = recentTallies[stat] ?? 0;
          return (
            <div
              class="s-stat-item"
              data-stat={stat}
              tabindex="0"
              role="button"
              aria-label={`${stat} — go to log filtered by ${stat}`}
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
```

- [ ] **Step 5: Update the toggle JS in the `<script>` block**

Find this section inside the `astro:page-load` listener:

```typescript
document.querySelectorAll<HTMLElement>('[data-stat-count]').forEach(el => {
  el.textContent = String(tally[el.dataset.statCount!] ?? 0);
});
```

Add the vertex count update immediately after it:

```typescript
document.querySelectorAll<SVGTextElement>('[data-vertex-count]').forEach(el => {
  el.textContent = String(tally[el.dataset.vertexCount!] ?? 0);
});
```

- [ ] **Step 6: Verify build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds, no TypeScript or Astro template errors

- [ ] **Step 7: Commit**

```bash
git add src/pages/stream/index.astro src/styles/stream.css
git commit -m "feat(stream): add objective strip and emblem-vertex radar hover"
```

---

## Task 5: Redesign bonds panel with slide-in detail

**Files:**
- Modify: `src/pages/stream/index.astro` (frontmatter + bonds panel HTML + script)
- Modify: `src/styles/stream.css`

- [ ] **Step 1: Add bonds CSS to `src/styles/stream.css`**

Replace the entire `/* ── Bonds panel ── */` block (`.s-bonds-grid`, `.s-bond-card`, `.s-bond-name`, `.s-bond-arcana`, `.s-bond-affinity`, `.s-bond-rank`, `.s-bond-pip`) with:

```css
/* ── Bonds panel ───────────────────────────────────────── */
#panel-bonds {
  padding: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.bonds-list-col {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.bonds-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px 10px;
  border-bottom: 1px solid #1a1a1a;
  flex-shrink: 0;
}

.bonds-header-title {
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #555;
}

.bonds-header-count {
  font-size: 0.62rem;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #333;
}

.bonds-list {
  flex: 1;
  overflow-y: auto;
}

.bond-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid #111;
  cursor: pointer;
  transition: background 0.12s;
}

.bond-row:hover { background: rgba(255, 255, 255, 0.03); }

.bond-row.bd-active {
  background: rgba(255, 255, 255, 0.03);
  box-shadow: inset 3px 0 0 var(--bond-color, #888);
}

.bond-row-name {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--bond-color, #f0f0f0);
  margin-bottom: 2px;
}

.bond-row-arcana {
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #ffe52c;
  margin-bottom: 2px;
}

.bond-row-affinity {
  font-size: 0.72rem;
  color: #666;
}

.bond-row-pips {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.bond-pip {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #222;
  border: 1px solid #444;
}

.bond-pip.filled {
  background: #ffe52c;
  border-color: #ffe52c;
  box-shadow: 0 0 4px rgba(255, 229, 44, 0.4);
}

/* ── Bond detail panel ─────────────────────────────────── */
.bond-detail {
  width: 0;
  overflow: hidden;
  flex-shrink: 0;
  border-left: 1px solid #1a1a1a;
  transition: width 0.38s cubic-bezier(0.16, 1, 0.3, 1);
}

.bond-detail.open { width: 300px; }

.bond-detail-inner {
  width: 300px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

.bond-detail-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1;
  padding: 4px;
  transition: color 0.12s;
}
.bond-detail-close:hover { color: #f0f0f0; }

.bd-emblem {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  border: 1.5px solid #333;
  overflow: hidden;
  flex-shrink: 0;
}

.bd-emblem img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bd-arcana {
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #ffe52c;
  margin-bottom: 4px;
}

.bd-name {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #f0f0f0;
  margin-bottom: 2px;
}

.bd-affinity {
  font-size: 0.75rem;
  color: #777;
  margin-bottom: 12px;
  font-style: italic;
}

.bd-stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 8px;
  border: 1px solid #333;
  border-radius: 100px;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #aaa;
  margin-bottom: 14px;
}

.bd-stat-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #888;
  flex-shrink: 0;
}

.bd-rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.bd-rank-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-weight: 700;
  color: #888;
}

.bd-pips {
  display: flex;
  gap: 4px;
}

.bd-pip {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #222;
  border: 1px solid #444;
}

.bd-rank-date {
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #555;
  margin-bottom: 20px;
}

.bd-section { margin-bottom: 16px; }

.bd-section-label {
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #555;
  margin-bottom: 6px;
}

.bd-lore,
.bd-memory {
  font-size: 0.8rem;
  color: #bbb;
  line-height: 1.55;
}

.bd-when {
  font-size: 0.62rem;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: #555;
  margin-top: 4px;
  letter-spacing: 0.06em;
}
```

- [ ] **Step 2: Add bond serialization to frontmatter in `src/pages/stream/index.astro`**

Add this after the `socialLinks` sort line (`socialLinks.sort(...)`):

```typescript
const bondsJson = JSON.stringify(
  socialLinks.map(link => ({
    name:            link.data.name,
    arcana:          link.data.arcana,
    affinity:        link.data.affinity,
    rank:            link.data.rank,
    stat:            link.data.stat ?? null,
    statColor:       link.data.stat ? (STAT_META[link.data.stat]?.color ?? null) : null,
    reachedDate:     link.data.reachedDate ?? null,
    lore:            link.data.lore ?? null,
    lastSession:     link.data.lastSession ?? null,
    lastInteraction: link.data.lastInteraction ?? null,
    img:             link.data.img ?? null,
  }))
);
```

- [ ] **Step 3: Replace bonds panel HTML**

Find the bonds panel section (currently `<div class="s-panel" id="panel-bonds" ...>`) and replace its entire contents:

```astro
<div class="s-panel" id="panel-bonds" role="tabpanel">

  <div class="bonds-list-col">
    <div class="bonds-header">
      <span class="bonds-header-title">Bonds</span>
      <span class="bonds-header-count">{socialLinks.length}</span>
    </div>
    <div class="bonds-list">
      {socialLinks.map(link => {
        const statColor = link.data.stat ? STAT_META[link.data.stat]?.color : null;
        return (
          <div
            class="bond-row"
            data-bond={link.data.name}
            style={statColor ? `--bond-color: ${statColor}` : ''}
          >
            <div class="bond-row-left">
              <div class="bond-row-name">{link.data.name}</div>
              <div class="bond-row-arcana">{link.data.arcana}</div>
              <div class="bond-row-affinity">{link.data.affinity}</div>
            </div>
            <div class="bond-row-pips">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  class={`bond-pip${i < link.data.rank ? ' filled' : ''}`}
                  style={i < link.data.rank && statColor
                    ? `background:${statColor};border-color:${statColor};box-shadow:0 0 4px ${statColor}66`
                    : ''}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>

  <div class="bond-detail" id="bond-detail">
    <div class="bond-detail-inner">
      <button class="bond-detail-close" id="bond-detail-close" aria-label="Close">✕</button>
      <div class="bd-emblem" id="bd-emblem">
        <img id="bd-img" src="" alt="" />
      </div>
      <div class="bd-arcana"   id="bd-arcana"></div>
      <div class="bd-name"     id="bd-name"></div>
      <div class="bd-affinity" id="bd-affinity"></div>
      <div class="bd-stat-badge" id="bd-stat-badge">
        <span class="bd-stat-dot"  id="bd-stat-dot"></span>
        <span class="bd-stat-text" id="bd-stat-text"></span>
      </div>
      <div class="bd-rank-row">
        <span class="bd-rank-label" id="bd-rank-label"></span>
        <div class="bd-pips" id="bd-pips">
          {Array.from({ length: 5 }, () => <span class="bd-pip"></span>)}
        </div>
      </div>
      <div class="bd-rank-date" id="bd-rank-date"></div>
      <div class="bd-section">
        <div class="bd-section-label">About</div>
        <div class="bd-lore" id="bd-lore"></div>
      </div>
      <div class="bd-section">
        <div class="bd-section-label">Last Session</div>
        <div class="bd-memory" id="bd-memory"></div>
        <div class="bd-when"   id="bd-when"></div>
      </div>
    </div>
  </div>

  <div id="bonds-data" data-bonds={bondsJson} hidden></div>
</div>
```

- [ ] **Step 4: Add bond panel JS to the `<script>` block**

Add this block inside the `astro:page-load` listener, after the existing stat-click handler (`item.addEventListener('keydown', ...)`):

```typescript
/* ── Bond detail panel ──────────────────────────────────── */
interface BondData {
  name: string; arcana: string; affinity: string; rank: number;
  stat: string | null; statColor: string | null;
  reachedDate: string | null; lore: string | null;
  lastSession: string | null; lastInteraction: string | null;
  img: string | null;
}

const bondsDataEl = document.getElementById('bonds-data');
if (bondsDataEl) {
  const allBonds: BondData[] = JSON.parse(bondsDataEl.dataset.bonds ?? '[]');
  const bondMap = Object.fromEntries(allBonds.map(b => [b.name, b]));
  const detailEl = document.getElementById('bond-detail')!;
  let activeBondRow: HTMLElement | null = null;

  function openBondDetail(row: HTMLElement): void {
    const d = bondMap[row.dataset.bond!];
    if (!d) return;

    const color = d.statColor ?? '#888';

    const emblemEl = document.getElementById('bd-emblem')!;
    emblemEl.style.cssText = d.statColor
      ? `border-color:${d.statColor}4d;background:${d.statColor}10`
      : 'border-color:#333;background:transparent';
    const imgEl = document.getElementById('bd-img') as HTMLImageElement;
    if (d.img) { imgEl.src = d.img; imgEl.style.display = ''; }
    else { imgEl.style.display = 'none'; }

    document.getElementById('bd-arcana')!.textContent   = d.arcana;
    const nameEl = document.getElementById('bd-name')!;
    nameEl.textContent = d.name;
    nameEl.style.color = color;
    document.getElementById('bd-affinity')!.textContent = d.affinity;

    const badge = document.getElementById('bd-stat-badge')!;
    if (d.stat) {
      badge.style.display = 'inline-flex';
      document.getElementById('bd-stat-dot')!.style.background = color;
      document.getElementById('bd-stat-text')!.textContent = d.stat;
    } else {
      badge.style.display = 'none';
    }

    const numerals = ['I', 'II', 'III', 'IV', 'V'];
    const rankLabelEl = document.getElementById('bd-rank-label')!;
    rankLabelEl.textContent = 'RANK ' + (numerals[d.rank - 1] ?? d.rank);
    rankLabelEl.style.color = color;
    document.querySelectorAll('#bd-pips .bd-pip').forEach((pip, i) => {
      const filled = i < d.rank;
      (pip as HTMLElement).style.background   = filled ? color : '';
      (pip as HTMLElement).style.borderColor  = filled ? color : '';
      (pip as HTMLElement).style.boxShadow    = filled ? `0 0 4px ${color}66` : '';
    });
    document.getElementById('bd-rank-date')!.textContent =
      d.reachedDate ? 'Reached · ' + d.reachedDate : '';

    document.getElementById('bd-lore')!.textContent   = d.lore ?? '';
    document.getElementById('bd-memory')!.textContent = d.lastSession ?? '';
    document.getElementById('bd-when')!.textContent   = d.lastInteraction ?? '';

    document.querySelectorAll('.bond-row').forEach(r => r.classList.remove('bd-active'));
    row.classList.add('bd-active');
    activeBondRow = row;
    detailEl.classList.add('open');
  }

  function closeBondDetail(): void {
    detailEl.classList.remove('open');
    document.querySelectorAll('.bond-row').forEach(r => r.classList.remove('bd-active'));
    activeBondRow = null;
  }

  document.querySelectorAll<HTMLElement>('.bond-row').forEach(row => {
    row.addEventListener('click', () => {
      if (row === activeBondRow) closeBondDetail();
      else openBondDetail(row);
    });
  });

  document.getElementById('bond-detail-close')!.addEventListener('click', closeBondDetail);
}
```

- [ ] **Step 5: Verify build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds with no errors

- [ ] **Step 6: Run full test suite**

```bash
npm run test 2>&1 | tail -20
```

Expected: all tests pass

- [ ] **Step 7: Commit**

```bash
git add src/pages/stream/index.astro src/styles/stream.css
git commit -m "feat(stream): redesign bonds panel with slide-in detail view"
```

---

## Self-Review Checklist

- **Spec coverage:**
  - ✅ Logarithmic soft cap scaling — Task 1 + Task 3
  - ✅ Radar emblem vertices with hover expand — Task 4
  - ✅ Objective strip above radar — Task 4
  - ✅ Bonds list with rank pips + stat accent color — Task 5
  - ✅ Slide-in detail panel with emblem, arcana, name, stat badge, rank, reached date, lore, last session — Task 5
  - ✅ Manual milestone ranks (I–V) — represented in schema + JS (no auto-increment logic)
  - ✅ "Reached · Month Year" date display — Task 5

- **Placeholder scan:** No TBD/TODO/placeholder language present. All code blocks complete.

- **Type consistency:**
  - `scaleAllTallies` returns `Partial<Record<StatName, number>>` — matches `buildRadarPoints` first arg type ✓
  - `bondsJson` serializes `socialLinks` from Zod schema that now includes `stat`, `reachedDate`, etc. ✓
  - `BondData` interface in script matches the serialized JSON shape ✓
  - `data-vertex-count` attribute updated by toggle handler using same `tally` object as `data-stat-count` ✓

- **Scope:** Tasks 1–5 are fully independent and each produces a working, committed state. Quests panel unchanged (follow-up spec).
