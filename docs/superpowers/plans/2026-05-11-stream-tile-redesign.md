# Stream Tile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 1×2 radar-chart stream tile on the homepage with a compact 1×1 donut-chart "playable character" card that shows stat distribution at a glance with a phrase-reveal hover interaction.

**Architecture:** All changes are confined to `src/pages/index.astro` (HTML + CSS + existing JS) and `src/utils/stream.ts` (new `buildDonutArcs` export). No new routes, components, or content collections. The stream page (`/stream`) is untouched.

**Tech Stack:** Astro 5, vanilla CSS, SVG, TypeScript, Vitest

---

## File Map

| File | Change |
|---|---|
| `src/utils/stream.ts` | Add `buildDonutArcs` export |
| `src/tests/streamTile.test.ts` | New — unit tests for `buildDonutArcs` |
| `src/pages/index.astro` | Frontmatter: swap old stream vars for new; HTML: replace tile markup; CSS: replace all `.st-*` rules |

---

## Task 1: Add `buildDonutArcs` to `stream.ts`

**Files:**
- Modify: `src/utils/stream.ts`
- Create: `src/tests/streamTile.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/tests/streamTile.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildDonutArcs, STAT_ORDER } from '../utils/stream';

describe('buildDonutArcs', () => {
  it('returns one arc per stat in STAT_ORDER', () => {
    const arcs = buildDonutArcs({ Determination: 1 }, 10);
    expect(arcs).toHaveLength(STAT_ORDER.length);
    expect(arcs.map(a => a.stat)).toEqual([...STAT_ORDER]);
  });

  it('gives zero-length arcs when all tallies are 0', () => {
    const arcs = buildDonutArcs({}, 10);
    arcs.forEach(arc => expect(arc.dasharray).toMatch(/^0\.00 /));
  });

  it('first arc starts at dashoffset 0', () => {
    const arcs = buildDonutArcs({ Determination: 4, Insight: 2 }, 10);
    expect(arcs[0].dashoffset).toBe(0);
  });

  it('later arcs have negative dashoffsets', () => {
    const arcs = buildDonutArcs({ Determination: 1, Insight: 1 }, 10, 3);
    expect(arcs[1].dashoffset).toBeLessThan(0);
  });

  it('proportions arcs to tally share', () => {
    // Determination=2, Insight=2, rest=0 — DET and INS get equal arc lengths
    const arcs = buildDonutArcs({ Determination: 2, Insight: 2 }, 10, 0);
    const detLen = parseFloat(arcs[0].dasharray.split(' ')[0]);
    const insLen = parseFloat(arcs[1].dasharray.split(' ')[0]);
    expect(detLen).toBeCloseTo(insLen, 1);
  });

  it('zero-count arcs do not consume gap space', () => {
    // Expression has 0 count — its dashoffset should equal Insight's
    const arcs = buildDonutArcs({ Determination: 1, Insight: 1 }, 10, 3);
    // Expression (index 2) has 0 count, so offsets for index 2, 3, 4 are all equal
    expect(arcs[2].dashoffset).toBe(arcs[3].dashoffset);
    expect(arcs[3].dashoffset).toBe(arcs[4].dashoffset);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- --reporter=verbose
```

Expected: 5+ failures with "buildDonutArcs is not a function" or similar.

- [ ] **Step 3: Add `buildDonutArcs` to `src/utils/stream.ts`**

Append after the last export in the file (after `parseQuestMenu`):

```typescript
export function buildDonutArcs(
  tallies: Partial<Record<StatName, number>>,
  r: number,
  gapPx = 3
): { stat: StatName; dasharray: string; dashoffset: number }[] {
  const total = STAT_ORDER.reduce((s, k) => s + (tallies[k] ?? 0), 0);
  const circ = 2 * Math.PI * r;
  const available = total > 0 ? circ - gapPx * STAT_ORDER.length : 0;
  let offset = 0;
  return STAT_ORDER.map(stat => {
    const count = tallies[stat] ?? 0;
    const len = total > 0 ? (count / total) * available : 0;
    const dasharray = `${len.toFixed(2)} ${(circ - len).toFixed(2)}`;
    const dashoffset = -offset;
    offset += len > 0 ? len + gapPx : 0;
    return { stat, dasharray, dashoffset };
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- --reporter=verbose
```

Expected: all `buildDonutArcs` tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/utils/stream.ts src/tests/streamTile.test.ts
git commit -m "feat(stream): add buildDonutArcs utility"
```

---

## Task 2: Update `index.astro` Frontmatter

**Files:**
- Modify: `src/pages/index.astro` (lines 1–126)

- [ ] **Step 1: Replace the stream data block**

In `src/pages/index.astro`, find the block starting at `// Stream tile data` (around line 88) and replace everything from that comment through the end of the frontmatter `---` with:

```typescript
// Stream tile data
const streamSessions = await getCollection('stream', ({ data }) => !data.draft);
const streamTallies = tallyStats(streamSessions, 'all');
const streamSessionCount = streamSessions.length;

const STAT_COLORS = {
  Determination: { hex: '#ff4040', rgb: '255,64,64'   },
  Insight:       { hex: '#4ab0ff', rgb: '74,176,255'  },
  Expression:    { hex: '#a855f7', rgb: '168,85,247'  },
  Sincerity:     { hex: '#ffe52c', rgb: '255,229,44'  },
  Chaos:         { hex: '#2dd4bf', rgb: '45,212,191'  },
} as const;

const STAT_ADJECTIVES: Record<string, string> = {
  Determination: 'Determined',
  Insight:       'Insightful',
  Expression:    'Expressive',
  Sincerity:     'Sincere',
  Chaos:         'Chaotic',
};

const STAT_PHRASES: Record<string, string> = {
  Determination: 'Pierce the heavens.',
  Insight:       'Clear Mind, Accel Synchro.',
  Expression:    'So the world will not forget.',
  Sincerity:     'No mask.',
  Chaos:         'Into the dark without a torch.',
};

const maxTally = Math.max(0, ...STAT_ORDER.map(s => streamTallies[s] ?? 0));
const leadingStats = maxTally > 0
  ? [...STAT_ORDER.filter(s => (streamTallies[s] ?? 0) === maxTally)]
  : [];
const primaryLeadingStat = leadingStats[0] ?? 'Determination';
const leadingColor = STAT_COLORS[primaryLeadingStat as keyof typeof STAT_COLORS];

// tiedPair: exactly 2 tied leaders → cycling icons; otherwise use singleIcon
const tiedPair = leadingStats.length === 2 ? leadingStats : null;
const singleIcon = leadingStats.length !== 2 && leadingStats.length > 0
  ? leadingStats[0]
  : null;

const donutArcs = buildDonutArcs(streamTallies, 32);

// Prepare data for client-side randomization
```

> Note: `// Prepare data for client-side randomization` is already in the file — keep everything after it unchanged.

- [ ] **Step 2: Update the import line at the top of the frontmatter**

Find (around line 8):
```typescript
import { tallyStats, buildRadarPoints, STAT_ORDER } from '../utils/stream';
```

Replace with:
```typescript
import { tallyStats, buildDonutArcs, STAT_ORDER } from '../utils/stream';
```

- [ ] **Step 3: Verify the build compiles**

```bash
npm run build 2>&1 | head -40
```

Expected: build completes with no TypeScript errors. (There will be an "unused variable" warning for `streamDataPoints` if you haven't replaced the HTML yet — that's fine for now.)

---

## Task 3: Replace Stream Tile HTML

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the entire stream tile `<a>` block**

Find the block starting with:
```html
<a
  id="stream-tile"
  href="/stream"
  class="bento-tile bento-tile--dark bento-tile--interactive bento-tile--span-1x2 stream-tile"
```

…and ending with the closing `</a>` (around line 343 in the original). Replace the entire block with:

```astro
<a
  id="stream-tile"
  href="/stream"
  class="bento-tile bento-tile--dark bento-tile--interactive stream-tile"
  style={`--st-lead: ${leadingColor.hex};`}
>
  <div class="st-header">
    <span class="st-label">Stream Log</span>
    <span class="st-name">Ninjaruss</span>
  </div>

  <div class="st-body">
    <svg viewBox="0 0 80 80" width="94" height="94" class="st-donut" aria-hidden="true">
      <!-- background track -->
      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="7"/>
      <!-- stat arcs, clockwise from 12 o'clock -->
      <g transform="rotate(-90,40,40)">
        {donutArcs.map(arc => (
          <circle
            cx="40" cy="40" r="32"
            fill="none"
            stroke={STAT_COLORS[arc.stat as keyof typeof STAT_COLORS]?.hex ?? '#777'}
            stroke-width="7"
            stroke-dasharray={arc.dasharray}
            stroke-dashoffset={arc.dashoffset}
            stroke-linecap="round"
            class={leadingStats.includes(arc.stat) ? 'st-lead-arc' : undefined}
          />
        ))}
      </g>
      <!-- center: tinted circle behind emblem -->
      <circle cx="40" cy="40" r="14"
        fill={`rgba(${leadingColor.rgb},.09)`}
        stroke={`rgba(${leadingColor.rgb},.2)`}
        stroke-width="1"
      />
      <!-- single leading stat emblem -->
      {singleIcon && (
        <image
          href={`/images/emblems/${singleIcon.toLowerCase()}.png`}
          x="27" y="27" width="26" height="26"
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      <!-- tied leading stats: two icons crossfade -->
      {tiedPair && (
        <image
          class="st-icon-primary"
          href={`/images/emblems/${tiedPair[0].toLowerCase()}.png`}
          x="27" y="27" width="26" height="26"
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      {tiedPair && (
        <image
          class="st-icon-secondary"
          href={`/images/emblems/${tiedPair[1].toLowerCase()}.png`}
          x="27" y="27" width="26" height="26"
          preserveAspectRatio="xMidYMid meet"
        />
      )}
    </svg>

    <div class="st-stat-label">
      <span class="st-adjective" style={`color: ${leadingColor.hex}`}>
        {streamSessionCount > 0 ? STAT_ADJECTIVES[primaryLeadingStat] : 'Unwritten'}
      </span>
      <span class="st-phrase" style={`color: rgba(${leadingColor.rgb},.4)`}>
        {streamSessionCount > 0 ? STAT_PHRASES[primaryLeadingStat] : 'The story begins.'}
      </span>
    </div>
  </div>

  <div class="st-footer">
    <span class="st-sessions">{streamSessionCount} session{streamSessionCount !== 1 ? 's' : ''}</span>
    <span class="st-cta">► load</span>
    <span id="st-live-badge" class="st-live-badge" hidden>LIVE</span>
  </div>
</a>
```

- [ ] **Step 2: Verify the build compiles**

```bash
npm run build 2>&1 | head -40
```

Expected: no errors.

---

## Task 4: Replace Stream Tile CSS

**Files:**
- Modify: `src/pages/index.astro` (`<style>` block)

- [ ] **Step 1: Remove all old `.st-*` rules**

In the `<style>` block, find and delete the entire section marked `/* ─── Stream Tile ────────────────────────────────────── */` and everything under it until (but not including) `/* ─── YouTube / Live Tile ────────────────────────────── */`. This removes these selectors:
`.stream-tile`, `.stream-tile:not(.is-live):hover`, `.stream-tile.is-live`, `@keyframes stream-tile-pulse`, `.st-header`, `.st-label`, `.st-title`, `.st-sub`, `.st-top-stat`, `.st-top-stat-tri`, `.st-top-stat-name`, `.st-radar-wrap`, `.st-radar-wrap::after`, `.st-radar-wrap svg`, `.st-footer`, `.st-footer-icon`, `.st-footer-label`, `.st-live-badge`, `@keyframes st-badge-breathe`.

Also remove the `.st-data-poly` and `.st-active-dot` animation entries inside `@media (prefers-reduced-motion: no-preference)`, and their `@keyframes st-data-breathe` and `@keyframes st-dot-pulse` definitions.

- [ ] **Step 2: Insert new `.st-*` CSS**

In place of what was removed (just before `/* ─── YouTube / Live Tile ────────────────────────────── */`), insert:

```css
/* ─── Stream Tile ────────────────────────────────────── */
.stream-tile {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.stream-tile:hover {
  border-color: var(--color-gold);
  box-shadow: var(--shadow-hard);
  transform: translate(-4px, -4px);
}

.stream-tile.is-live {
  border-color: #ff4040;
  background: #181212;
  box-shadow: 4px 4px 0 rgba(255,64,64,.35), 0 0 28px rgba(255,64,64,.12);
  animation: stream-tile-pulse 2.5s ease-in-out infinite;
}

@keyframes stream-tile-pulse {
  0%, 100% { box-shadow: 4px 4px 0 rgba(255,64,64,.35), 0 0 24px rgba(255,64,64,.12); }
  50%       { box-shadow: 4px 4px 0 rgba(255,64,64,.5),  0 0 40px rgba(255,64,64,.22); }
}

.st-header {
  padding: 8px 11px 7px;
  background: #0d0d1a;
  border-bottom: 1px solid #181826;
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex-shrink: 0;
}

.st-label {
  font-size: .52rem;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: rgba(255,229,44,.4);
  font-family: var(--font-mono);
}

.st-name {
  font-size: .92rem;
  font-weight: 800;
  color: #f0f0f0;
  letter-spacing: .02em;
  line-height: 1.1;
}

.st-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 10px 8px;
  gap: 7px;
}

.st-donut { display: block; }

.stream-tile:hover .st-lead-arc {
  filter: drop-shadow(0 0 6px var(--st-lead));
}

.st-stat-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-height: 32px;
}

.st-adjective {
  font-size: .64rem;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
  font-family: var(--font-mono);
}

.st-phrase {
  font-size: .56rem;
  letter-spacing: .06em;
  font-style: italic;
  font-family: var(--font-mono);
  /* color set via inline style (rgba(statColor, .4)) */
  opacity: 0;
  transform: translateY(4px);
  transition: opacity .3s .05s, transform .3s .05s;
  white-space: nowrap;
}

.stream-tile:hover .st-phrase {
  opacity: 1;
  transform: translateY(0);
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

.st-sessions {
  font-size: .58rem;
  letter-spacing: .1em;
  color: #555;
  font-family: var(--font-mono);
}

.st-cta {
  margin-left: auto;
  font-size: .58rem;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgba(255,229,44,.4);
  font-family: var(--font-mono);
  transition: color var(--transition-fast);
}

.stream-tile:hover .st-cta {
  color: rgba(255,229,44,.75);
}

.st-live-badge {
  font-size: .5rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #ff4040;
  border: 1px solid rgba(255,64,64,.4);
  border-radius: 3px;
  padding: 2px 5px;
  animation: st-badge-breathe 1.5s ease-in-out infinite;
}

.st-live-badge[hidden] { display: none; }

@keyframes st-badge-breathe {
  0%, 100% { opacity: 1; }
  50%       { opacity: .45; }
}

/* Tied stat cycling: primary and secondary icons crossfade on a 6s loop */
.st-icon-primary {
  animation: st-cycle-primary 6s ease-in-out infinite;
}

.st-icon-secondary {
  animation: st-cycle-secondary 6s ease-in-out infinite;
}

@keyframes st-cycle-primary {
  0%, 42%  { opacity: 1; }
  50%, 92% { opacity: 0; }
  100%     { opacity: 1; }
}

@keyframes st-cycle-secondary {
  0%, 42%  { opacity: 0; }
  50%, 92% { opacity: 1; }
  100%     { opacity: 0; }
}
```

- [ ] **Step 3: Update `prefers-reduced-motion: reduce` block**

Find the `@media (prefers-reduced-motion: reduce)` block and replace the stream-tile-related lines:

Remove:
```css
.stream-tile.is-live  { animation: none; }
.st-live-badge        { animation: none; }
.container.is-live::before   { animation: none; background-position: 0% 0%; }
```

Replace with:
```css
.stream-tile.is-live    { animation: none; }
.st-live-badge          { animation: none; }
.st-phrase              { transition: none; }
.st-icon-primary        { animation: none; opacity: 1; }
.st-icon-secondary      { animation: none; opacity: 0; }
.container.is-live::before  { animation: none; background-position: 0% 0%; }
```

- [ ] **Step 4: Verify build still compiles**

```bash
npm run build 2>&1 | head -40
```

Expected: no errors.

---

## Task 5: Smoke Test and Final Commit

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

Open `http://localhost:4321` in a browser.

- [ ] **Step 2: Verify the tile visually**

Check:
- [ ] Stream tile appears as a compact 1×1 cell (no longer tall)
- [ ] Donut chart renders with colored arcs
- [ ] Leading stat emblem visible in the center circle
- [ ] Adjective text visible below the chart (e.g. "Determined")
- [ ] Hover: tile lifts, leading arc glows, phrase fades in below the adjective
- [ ] `► load` CTA brightens on hover
- [ ] Showcase and Notes tiles are no longer stretched tall by the stream tile
- [ ] Grid reflows cleanly — no broken layout

- [ ] **Step 3: Run the full test suite**

```bash
npm run test
```

Expected: all tests pass, including the new `buildDonutArcs` tests.

- [ ] **Step 4: Run a production build**

```bash
npm run build
```

Expected: exits 0, no TypeScript or Astro errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/utils/stream.ts src/tests/streamTile.test.ts
git commit -m "feat(home): replace stream radar tile with compact donut character card"
```
