# Bento Tile Content Improvements

**Date:** 2026-04-07  
**Status:** Approved

## Problem

Several homepage bento tiles leave dead space because `.bento-tile--full` uses `justify-content: space-between`, which pins the header to the top and footer to the bottom. With sparse content this creates a visible empty gap — especially pronounced on tall tiles (1×2, 2×2). Separately, emblem thumbnails are too small and cluster at the bottom-left.

## Approved Changes

### 1. Media tile (2×2) — emblems centered and scaled up

**Problem:** Footer is pushed to bottom by `space-between`, leaving empty gap between description and emblems.  
**Fix:** Make `.bento-tile__footer:has(.tile-emblems)` use `flex: 1` so it grows to fill remaining space and centers its content vertically and horizontally.  
**Emblem size:** Scale from 80px → 96px via `.media-tile .tile-emblem` override.

### 2. Showcase tile (3×2) — emblems centered and scaled up

Same fix as Media.  
**Emblem size:** Scale from 72px → 80px via `.showcase-tile .tile-emblem` override.

### 3. Notes tile (2×2) — recent fragment titles

**Problem:** No slot content; lower half of the 2×2 tile is empty.  
**Fix:** Add a `recentNotes` variable in `index.astro` (top 3 by `effectiveDate`, same pattern as `recentShowcase`/`recentMedia`). Render a fragment titles list in the tile's slot. Each title links directly to the note.

**Interactivity:** The Notes tile is itself an `<a>` tag, so nested `<a>` tags are invalid. Use the existing `data-href` + `role="link"` + `tabindex="0"` pattern (same as `.tile-emblem`). Extend or reuse the existing `initializeEmblemLinks` JS function to handle `.tile-note-link[data-href]` elements.

**Data needed:** `recentNotes` — top 3 notes sorted by `effectiveDate`, mapped to `{ href, title }`.

### 4. Favorites tile (1×2) — entry count

**Problem:** No slot content; lower half empty.  
**Fix:** Compute `favoritesCount` in `index.astro` (`media.filter(e => e.data.isFavorite).length`). Render a count display in the slot: large muted number + small label ("curated entries").

### 5. Novel tile (1×2) — vertically centered

**Problem:** `space-between` with only a title (top) and date (bottom) creates obvious dead space.  
**Fix:** Override `justify-content` to `center` with a `gap` on `.novel-tile`, removing the stretched space-between layout. No new content added.

### 6. Latest tile (2×1) — emblem fills full height

**Problem:** Emblem is a fixed 52×52px box centered in a 52px-wide wrapper. On a ~100px tall tile, there's padding above and below the emblem.  
**Fix:** Change `.latest-tile__emblem-wrap` to use `align-items: stretch` (already set on parent) and make `.latest-tile__emblem` `height: 100%` so it fills the full tile height.

## Implementation Notes

- **No new HTML structure** except Notes tile (new `recentNotes` list) and Favorites tile (new count element).
- **CSS approach for emblem footer fix:** Use `:has(.tile-emblems)` selector on `.bento-tile__footer` — supported in all modern browsers. Keeps the fix contained without touching other tiles that use the footer for dates or other small elements.
- **JS pattern for clickable note titles:** Identical to existing `.tile-emblem[data-href]` handler. Either extend `initializeEmblemLinks` to query a broader selector, or add a parallel `initializeNoteLinks` function.
- **Novel tile override:** Scoped to `.novel-tile` class, does not affect other tiles.

## Files Affected

- `src/styles/bento.css` — add `:has(.tile-emblems)` footer rule
- `src/pages/index.astro` — add `recentNotes`, `favoritesCount` variables; update Notes tile slot, Favorites tile slot; update `.media-tile`, `.showcase-tile`, `.novel-tile`, `.latest-tile__emblem` CSS; extend JS link handler
