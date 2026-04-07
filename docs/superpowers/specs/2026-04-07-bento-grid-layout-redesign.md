# Bento Grid Layout Redesign

**Date:** 2026-04-07  
**Status:** Approved

## Goal

Rework the homepage bento grid so that:
- Everything fits within a normal 1080p screen without scrolling ("reasonably compact")
- No needless empty space inside tiles (specifically Showcase and Novel)
- YouTube stays 1×1
- Empty/decorative tiles are acceptable if they serve visual flow

## Approved Layout — Option B: Wide Title Banner

6-column grid, 5 rows.

```
Row 1: [  TITLE  4×1  ] [YT] [NOW]
Row 2: [ SHOWCASE 3×2 ] [NOTES 2×2] [FAVS]
Row 3: [     cont     ] [   cont   ] [1×2]
Row 4: [MEDIA] [LATEST 2×1] [NOVEL] [MAL]
Row 5: [2×2 ] [decor][decor] [1×2 ] [SPOTIFY]
```

### Tile-by-tile placement

| Tile | Size | Position |
|---|---|---|
| Title | 4×1 | Row 1, cols 1–4 |
| YouTube | 1×1 | Row 1, col 5 |
| Now | 1×1 | Row 1, col 6 |
| Showcase | 3×2 | Rows 2–3, cols 1–3 |
| Notes | 2×2 | Rows 2–3, cols 4–5 |
| Favorites | 1×2 | Rows 2–3, col 6 |
| Media | 2×2 | Rows 4–5, cols 1–2 |
| Latest | 2×1 | Row 4, cols 3–4 |
| Novel | 1×2 | Rows 4–5, col 5 |
| MAL | 1×1 | Row 4, col 6 |
| Decorative ×2 | 1×1 each | Row 5, cols 3–4 |
| Spotify | 1×1 | Row 5, col 6 |

All 30 cells accounted for (28 content + 2 decorative).

## Changes Required

### 1. `src/styles/bento.css`

- Change `grid-auto-rows` from `minmax(80px, auto)` to `minmax(100px, auto)` for tighter baseline row height.
- Add new span class:
  ```css
  .bento-tile--span-1x2 {
    grid-column: span 1;
    grid-row: span 2;
  }
  ```

### 2. `src/pages/index.astro` — HTML reorder

DOM order must change so CSS auto-placement puts tiles in the right positions.

**Current order:** title → youtube → showcase → notes → media → latest → now → novel → favorites → mal → spotify

**New order:** title → youtube → now → showcase → notes → favorites → media → latest → novel → mal → [decor×2] → spotify

Key moves:
- `Now` moves from position 7 → position 3 (directly after YouTube)
- `Favorites` moves from position 9 → position 6 (directly after Notes)
- Two new decorative `bento-tile--static` tiles inserted between MAL and Spotify

### 3. `src/pages/index.astro` — scoped CSS changes

- `.title-tile`: change `grid-column: span 2` → `grid-column: span 4`
- `.title-tile` responsive breakpoints:
  - `@media (max-width: 768px)`: keep `grid-column: span 2` (unchanged)
  - `@media (max-width: 480px)`: keep `grid-column: span 1` (unchanged)

### 4. `src/pages/index.astro` — tile class changes

| Tile | Old class/span | New class/span |
|---|---|---|
| Showcase | `bento-tile--span-4x2` | `bento-tile--span-3x2` |
| Favorites | (none / 1×1 default) | add `bento-tile--span-1x2` |
| Latest | `bento-tile--span-2x1` | unchanged |
| Novel | inline `grid-column: span 1; grid-row: span 2` | unchanged |

### 5. New decorative tiles

Insert two `bento-tile--static` tiles after MAL, before Spotify. These are empty decorative placeholders that fill row 5 cols 3–4:

```astro
<div class="bento-tile bento-tile--static" aria-hidden="true"></div>
<div class="bento-tile bento-tile--static" aria-hidden="true"></div>
```

## What This Fixes

| Problem | Fix |
|---|---|
| Row 1 had 3 empty cells (title+YT only filled cols 1–3) | Title expands to 4 cols; Now fills col 6 |
| Showcase (4×2) had too much empty internal space | Reduced to 3×2 — less horizontal waste |
| Novel (1×2) had a visual gap | Surrounded by Media (2×2) and Latest — denser context |
| Grid taller than viewport | Row min-height raised to 100px; 5-row layout with no runaway `auto` rows |

## Out of Scope

- Changing tile content (what's displayed inside each tile)
- Changing the Latest tile from 2×1 to 2×2 (kept at 2×1 to avoid content redesign)
- Any mobile layout changes beyond the title breakpoint fix
