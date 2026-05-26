---
name: card-transition-emblems
description: Replace hardcoded star/THE FOOL on transition card with per-route stat emblems and names from the stream stat system
metadata:
  type: project
---

# Card Transition Emblems — Design Spec

## Overview

The page transition card currently displays a hardcoded `☆` symbol and the placeholder text `THE FOOL`. This spec replaces those with per-route stat emblems (PNG images) and stat names drawn from the existing stream stat system (Determination, Insight, Expression, Sincerity, Chaos). Visual style: solid emblem at full opacity, white name text with drop shadow, no shine overlay.

---

## Section 1 — Route → Stat Mapping

`statForPath(pathname)` matches the destination pathname by prefix and returns the corresponding stat. The fallback for unmatched routes is Determination.

| Route prefix | Stat | Color |
|---|---|---|
| `/notes` | INSIGHT | `#4ab0ff` |
| `/novel` | EXPRESSION | `#a855f7` |
| `/shelf` | SINCERITY | `#ffe52c` |
| `/stream` | CHAOS | `#2dd4bf` |
| `/showcase` | DETERMINATION | `#ff4040` |
| `/now` | SINCERITY | `#ffe52c` |
| `/` | SINCERITY | `#ffe52c` |
| Everything else | DETERMINATION | `#ff4040` |

Sub-routes (e.g. `/notes/slug`, `/shelf/slug`) inherit the parent prefix's stat automatically via prefix matching.

---

## Section 2 — Implementation

All changes are confined to `src/scripts/transition.ts`.

### New data structures

```ts
type StatName = 'Determination' | 'Insight' | 'Expression' | 'Sincerity' | 'Chaos';

interface StatCard {
  color: string;
  name: string;
  emblemPath: string;
}

const STAT_CARDS: Record<StatName, StatCard> = {
  Determination: { color: '#ff4040', name: 'DETERMINATION', emblemPath: '/images/emblems/determination.png' },
  Insight:       { color: '#4ab0ff', name: 'INSIGHT',       emblemPath: '/images/emblems/insight.png'       },
  Expression:    { color: '#a855f7', name: 'EXPRESSION',    emblemPath: '/images/emblems/expression.png'    },
  Sincerity:     { color: '#ffe52c', name: 'SINCERITY',     emblemPath: '/images/emblems/sincerity.png'     },
  Chaos:         { color: '#2dd4bf', name: 'CHAOS',         emblemPath: '/images/emblems/chaos.png'         },
};

const ROUTE_STATS: [string, StatName][] = [
  ['/notes',    'Insight'],
  ['/novel',    'Expression'],
  ['/shelf',    'Sincerity'],
  ['/stream',   'Chaos'],
  ['/showcase', 'Determination'],
  ['/now',      'Sincerity'],
  ['/',         'Sincerity'],
];
```

### `statForPath(pathname)` replaces `accentColor(pathname)`

Returns `{ color, name, img }` where `img` is the pre-loaded `HTMLImageElement | null`. The existing `accentColor` export is removed. Call sites in `cardPhase()` and `startWipe()` destructure `color` from the result.

```ts
export function statForPath(pathname: string): StatCard & { img: HTMLImageElement | null } {
  const key = ROUTE_STATS.find(([prefix]) =>
    prefix === '/'
      ? pathname === '/'
      : pathname === prefix || pathname.startsWith(prefix + '/')
  )?.[1] ?? 'Determination';
  return { ...STAT_CARDS[key], img: loadedImages[key] ?? null };
}
```

### Image pre-loading

Added to `init()`. One `HTMLImageElement` per stat is created immediately on page load. By the time a navigation fires (~T_IN + T_HOLD = 860ms minimum), images will have loaded on any reasonable connection.

```ts
const loadedImages: Partial<Record<StatName, HTMLImageElement>> = {};

function preloadImages(): void {
  for (const [stat, meta] of Object.entries(STAT_CARDS) as [StatName, StatCard][]) {
    const img = new Image();
    img.src = meta.emblemPath;
    img.onload = () => { loadedImages[stat] = img; };
  }
}
```

### `drawCard()` changes

Signature extended to `drawCard(cx, cy, cw, ch, rot, color, alpha, name, img)`.

- Removes hardcoded `☆` fillText and `THE FOOL` fillText
- Draws emblem via `ctx.drawImage(img, ...)` at full opacity, centered at `(0, -ch * 0.06)`; emblem size `cw * 0.38`. Skipped gracefully if `img` is null.
- Draws name using `computeTextFit()` to determine font size, then renders in white with drop shadow:
  ```ts
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.letterSpacing = '1.5px';
  ctx.fillText(name, 0, ch * 0.34);
  ```
- No shine overlay

### `computeTextFit()` — new pure export

```ts
export function computeTextFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  basePx: number
): number {
  let size = basePx;
  ctx.font = `bold ${size}px monospace`;
  while (ctx.measureText(text).width > maxWidth && size > 5) size -= 0.5;
  return size;
}
```

`maxWidth` = `cw - 2 * (5 + 8)` (card width minus border inset of 5px and padding of 8px on each side).

---

## Section 3 — Error Handling & Testing

### Error handling

- If an emblem image fails to load, `img` is `null` and `drawCard()` skips the emblem draw. The card still animates with gradient and name — no crash.
- `statForPath()` always returns a value (fallback to Determination). No undefined state reaches `drawCard()`.
- Existing canvas guards (`if (!ctx || alpha <= 0) return`) are unchanged.

### Tests (`src/tests/transition.test.ts`)

- Remove all `accentColor` tests
- Add `statForPath` tests: one assertion per route prefix (exact match and sub-route), plus the fallback for an unmapped path
- Add `computeTextFit` tests:
  - Returns `basePx` when short text fits within `maxWidth`
  - Returns a reduced size when `DETERMINATION` at base size would exceed `maxWidth`
  - Never returns below 5

---

## Files Changed

| File | Change |
|---|---|
| `src/scripts/transition.ts` | All changes — data table, `statForPath`, image preload, `drawCard`, `computeTextFit` |
| `src/tests/transition.test.ts` | Replace `accentColor` tests, add `statForPath` and `computeTextFit` tests |
