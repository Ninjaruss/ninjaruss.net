# Bento Grid Redesign — Z-Flow Layout

**Date:** 2026-04-07  
**Status:** Approved

## Goal

Rearrange the homepage bento grid so that:

1. Everything fits within a single viewport — no scrolling required to see all tiles.
2. The Novel tile occupies the bottom-right corner as a distinctive 1×2 tile.
3. The layout is visually interesting — avoids the uniform two-equal-halves pattern that made it feel like a spreadsheet.

## Layout

6-column × 6-row grid. The column break zigzags (Z-Flow), creating diagonal visual tension.

```
Row 1–2:  Title (2×2)      | YouTube #1 (4×2)
Row 3–4:  Showcase (4×2)   | Notes (2×2)
Row 5:    Media (2×2 ↓)    | Latest (2×1)   | Now (1×1)   | Novel (1×2 ↓)
Row 6:    ↑ Media cont     | Favs (1×1)     | MAL (1×1)   | Spotify (1×1) | ↑ Novel cont
```

The "Z" reads: large tile top-right → large tile bottom-left → tail of small tiles bottom-right (capped by Novel).

## Changes

### HTML (`src/pages/index.astro`)

| Tile | Change |
|------|--------|
| YouTube #2 | Delete the entire tile block |
| Title | `bento-tile--span-3x2` → `bento-tile--span-2x2` |
| YouTube #1 | `bento-tile--span-3x2` → `bento-tile--span-4x2` |
| Showcase | `bento-tile--span-3x2` → `bento-tile--span-4x2` |
| Notes | `bento-tile--span-3x2` → `bento-tile--span-2x2` |
| Now | Remove `bento-tile--span-2x1` class (becomes default 1×1) |
| Novel | Move HTML position to appear **before** Favs/MAL/Spotify so CSS auto-placement lands it at col 6 rows 5–6 |

Novel keeps its existing inline style `grid-column: span 1; grid-row: span 2;`.

### CSS (`src/styles/bento.css`)

Add a new span class and corresponding responsive rules:

```css
/* New */
.bento-tile--span-4x2 {
  grid-column: span 4;
  grid-row: span 2;
}

/* At ≤1024px, collapse same as span-3x2 */
@media (max-width: 1024px) {
  .bento-tile--span-4x2 {
    grid-column: span 2;
    grid-row: span 2;
  }
}

/* At ≤768px, single row like other large spans */
@media (max-width: 768px) {
  .bento-tile--span-4x2 {
    grid-column: span 2;
    grid-row: span 1;
  }
}
```

## Why Each Decision

- **Title shrinks (3×2 → 2×2):** The title tile is primarily decorative text — it doesn't need 3 columns. Giving that space to YouTube makes the hero image more impactful.
- **YouTube expands (3×2 → 4×2):** Dominant visual anchor at top right. YouTube thumbnails have 16:9 aspect ratios that benefit from extra width.
- **Showcase expands (3×2 → 4×2):** Showcase is the primary content showcase — giving it more width at rows 3–4 mirrors the YouTube width from rows 1–2, creating the Z-pattern.
- **Notes shrinks (3×2 → 2×2):** Notes is text-heavy and doesn't need wide layout. Mirrors the Title width, reinforcing the diagonal pattern.
- **Now shrinks (2×1 → 1×1):** Required to leave col 6 free in row 5 for Novel to auto-place as 1×2. The Now tile's content (a date + dot) fits in a 1×1 square.
- **Novel reordered:** HTML order determines CSS grid auto-placement. Novel must come before Favs/MAL/Spotify so it claims col 6, rows 5–6 before those tiles fill row 6.
- **YouTube #2 removed:** Was the primary source of overflow. Removing it brings the grid from ~8 rows to 6 rows.

## Files Affected

- `src/pages/index.astro` — tile class changes, YouTube #2 removal, Novel reorder
- `src/styles/bento.css` — new `.bento-tile--span-4x2` class + responsive rules
