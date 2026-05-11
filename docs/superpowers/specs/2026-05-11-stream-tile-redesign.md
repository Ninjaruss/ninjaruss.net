# Stream Tile Redesign

**Date:** 2026-05-11  
**Status:** Approved — ready for implementation

## Problem

The current stream tile (`bento-tile--span-1x2`) is too content-heavy: a three-section layout (header + large radar SVG + footer) overflows its natural height, stretching rows 2–3 of the bento grid and forcing Showcase and Notes tiles to grow with it.

## Solution

Replace the radar chart tile with a compact **1×1 donut chart tile** — a "playable character" card that shows stat distribution at a glance, the leading stat as an expressive adjective, and a hover phrase reveal.

---

## Grid Change

| | Before | After |
|---|---|---|
| Span | `bento-tile--span-1x2` (1 col × 2 rows) | 1×1 (no span class needed) |
| Row 3 col 6 | Occupied by stream tile | Auto-filled by CSS grid with next document-order tile |

The vacated cell in row 3 requires no special handling — the bento grid will reflow naturally.

---

## Layout

### Header (~28px)
- **Label**: `"Stream Log"` — small monospace uppercase, muted gold (`rgba(255,229,44,.4)`), matching the site-wide section label pattern
- **Name**: `"Ninjaruss"` — `~0.9rem`, `font-weight: 800`, white — large enough to read at a glance

### Body (~100px, centered)
- **Donut SVG** (~94×94px):
  - 5 arc segments rendered as stacked `<circle>` elements with `stroke-dasharray`/`stroke-dashoffset`
  - Each arc sized proportional to that stat's share of total session tag count (e.g. 4 of 11 sessions → 4/11 of ring circumference)
  - 3px visual gap between segments (`stroke-linecap: round` handles rounding)
  - Faint full-ring track underneath at `rgba(255,255,255,0.06)`
  - Arc colors match existing `STAT_COLORS` in `stream.ts`:
    - `Determination` → `#ff4040`
    - `Expression` → `#a855f7`
    - `Insight` → `#4ab0ff`
    - `Chaos` → `#2dd4bf`
    - `Sincerity` → `#ffe52c`
  - Arc order follows `STAT_ORDER` (clockwise from 12 o'clock via `rotate(-90, cx, cy)`)
- **Center circle**: small circle (`r≈14`) with the leading stat's emblem PNG (`/images/emblems/{stat}.png`) as an `<image>` element. Background fill at `rgba(statColor, 0.09)` with a faint border.
- **Tied leading stats**: if two or more stats share the highest count, the center icon crossfades between their emblem images on a CSS animation loop (~3s per cycle). Implemented as multiple `<image>` elements with staggered `opacity` keyframe animations.

### Below donut
- Leading stat rendered as its **adjective form** in that stat's color:
  - `Determination` → `"Determined"` (`#ff4040`)
  - `Insight` → `"Insightful"` (`#4ab0ff`)
  - `Chaos` → `"Chaotic"` (`#2dd4bf`)
  - `Sincerity` → `"Sincere"` (`#ffe52c`)
  - `Expression` → `"Expressive"` (`#a855f7`)
- Font: monospace, `~0.64rem`, `font-weight: 700`, `letter-spacing: .16em`, uppercase
- When stats are tied this element shows the first tied stat's adjective (same order as the cycling icons)

### Footer (~26px)
- **Left**: session count — `"04 sessions"` in monospace, muted (`#555`)
- **Right**: `"► load"` — muted gold monospace, quiet CTA

---

## Hover Interaction (H1 — Phrase Reveal)

Triggered on `:hover` via CSS only (no JS needed).

1. **Tile lift**: `transform: translate(-4px, -4px)`, gold border, `box-shadow: var(--shadow-hard)` — matches the site-wide interactive tile pattern
2. **Phrase fade-in**: the leading stat's phrase appears below the adjective with `opacity: 0 → 1` and `translateY(4px → 0)`, 300ms ease, 50ms delay
   - `Determined` → `"Pierce the heavens."`
   - `Insightful` → `"Clear Mind, Accel Synchro."`
   - `Chaotic` → `"Into the dark without a torch."`
   - `Sincere` → `"No mask."`
   - `Expressive` → `"So the world will not forget."`
3. **Arc glow**: the leading stat's arc gets `filter: drop-shadow(0 0 5px {statColor})` on hover

`prefers-reduced-motion`: phrase still fades in but without the `translateY` movement; no arc glow filter.

---

## Live State

No change from current behavior:
- Border turns `#ff4040`, red pulse animation
- `LIVE` badge appears in footer (right of `► load`)
- `is-live` class toggled by existing `applyLiveState()` in `index.astro`

---

## Data Wiring

### Reused from `src/utils/stream.ts`
- `tallyStats(sessions, 'all')` — stat counts
- `STAT_ORDER` — canonical stat ordering
- `STAT_COLORS` — hex + rgb per stat

### No longer needed in `index.astro`
- `buildRadarPoints()` — radar chart removed
- `buildGuidePoints()` — radar chart removed
- `STAT_VERTICES` — radar label geometry removed

### New in `index.astro` (or extracted to `stream.ts`)

**Donut arc geometry** — computed at build time, passed as SVG attributes:
```ts
function buildDonutArcs(tallies, statOrder, cx, cy, r, gapPx = 3) {
  const total = statOrder.reduce((s, k) => s + (tallies[k] ?? 0), 0);
  const circ = 2 * Math.PI * r;
  const available = circ - gapPx * statOrder.length;
  let offset = 0;
  return statOrder.map(stat => {
    const count = tallies[stat] ?? 0;
    const len = total > 0 ? (count / total) * available : 0;
    const dasharray = `${len} ${circ - len}`;
    const dashoffset = -offset;
    offset += len + gapPx;
    return { stat, dasharray, dashoffset };
  });
}
```

**Adjective + phrase maps** (new constants):
```ts
const STAT_ADJECTIVES = {
  Determination: 'Determined',
  Insight:       'Insightful',
  Chaos:         'Chaotic',
  Sincerity:     'Sincere',
  Expression:    'Expressive',
};

const STAT_PHRASES = {
  Determination: 'Pierce the heavens.',
  Insight:       'Clear Mind, Accel Synchro.',
  Chaos:         'Into the dark without a torch.',
  Sincerity:     'No mask.',
  Expression:    'So the world will not forget.',
};
```

**Tied stat detection**:
```ts
const maxTally = Math.max(...STAT_ORDER.map(s => streamTallies[s] ?? 0));
const leadingStats = STAT_ORDER.filter(s => (streamTallies[s] ?? 0) === maxTally && maxTally > 0);
// leadingStats.length > 1 → render cycling center icons
```

---

## Out of Scope

- The stream page (`/stream`) is unchanged — its full radar chart remains there
- No changes to `src/utils/stream.ts` exports (adjective/phrase maps live in `index.astro` unless a future need warrants moving them)
- No new routes or content collections
