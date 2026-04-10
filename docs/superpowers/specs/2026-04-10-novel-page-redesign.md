# Novel Page Redesign — Full Canvas Scatter

**Date:** 2026-04-10
**Status:** Approved

## Overview

Redesign the `/novel` page (`src/pages/novel/[...slug].astro`) to replace the two-panel navigator (left folder list + right shard grid) with a full-viewport freeform scatter canvas. Category navigation moves to filter tabs above the canvas. Clicking a shard expands it from its position to a full-screen reading view.

No new dependencies. All changes are in `src/pages/novel/[...slug].astro` and `src/styles/novel.css`.

---

## Layout & Structure

### Before
```
[title block]
[folder list | shard grid panel]
```

### After
```
[title block]
[category filter tabs]
[full-viewport scatter canvas]
```

The `.navigator` grid and `.folder-list` / `.shard-panel` elements are removed. A single `.scatter-canvas` element fills the remaining viewport below the tabs.

### Title Block
Unchanged: "Remember Rain" heading, waterline, reflection, eyebrow text. The rain canvas background (`#bg-canvas`) stays.

---

## Category Filter Tabs

A horizontal row of pills sits between the title block and the scatter canvas.

- One tab per top-level folder (Characters, Locations, Lore, Scenes, Themes), each showing the folder's shard count.
- Active tab: filled with category accent color at low opacity, border at full accent opacity, glow shadow.
- Inactive tabs: muted border, low-opacity text.
- Tab shape: `clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)` — a small corner cut consistent with the shard aesthetic.
- Shard count shown inline (e.g. `Characters · 6`).
- An "All" tab is **not** included — categories are always filtered to one at a time to keep the scatter legible.

**Accent colors** (unchanged from current `ACCENT_MAP`):
| Folder | RGB |
|---|---|
| characters | 255, 229, 44 |
| locations | 122, 184, 255 |
| lore | 255, 136, 34 |
| scenes | 255, 102, 102 |
| themes | 170, 170, 255 |

---

## Scatter Canvas

### Positioning
Each shard gets a deterministic position derived from its slug so it is stable across page visits and navigations.

**Algorithm:**
1. Hash the slug to a 32-bit integer using the existing `shapeIndex` helper (djb2-style hash).
2. Derive `x` from `hash % canvasWidth` and `y` from `(hash >> 8) % canvasHeight`, both clamped to a safe margin (60px from edges, 20px from top, 40px from bottom).
3. Rotation: `((hash >> 16) % 17) - 8` → range **−8° to +8°**.
4. Overlap between shards is intentional and allowed.

Shard sizes remain as currently defined (min-height 78px, variable widths from `SHARD_SHAPES`). Clip-path shapes are assigned per shard using the existing `shapeIndex` function.

### Shard appearance
Unchanged from current `memory-shard` CSS: frosted glass, light hotspot tracking (`--shard-gx/gy`), sweep shimmer on hover, category accent border color.

VanillaTilt is re-initialized on every scatter render (after DOM insertion), called on all `.memory-shard` elements inside `.scatter-canvas`. The mousemove hotspot delegation moves from `#shard-panel-list` to `.scatter-canvas`.

### Canvas sizing
The canvas fills from below the tabs to the viewport bottom. `position: absolute`, `overflow: hidden`. Shards are positioned absolutely inside it. The canvas itself does not scroll — if many shards exist in a category, they overlap more; this is acceptable and aesthetically intentional.

---

## Category Switch Animation

When a tab is clicked:

1. **Outgoing shards**: `opacity → 0`, `transform: translateY(12px)` over 180ms (`ease-in`). Remove from DOM after transition.
2. **Incoming shards**: inserted at their resting positions but offset `translateY(-20px)` and `opacity: 0`. Stagger: each shard delays `index * 30ms`. Animate to resting position + `opacity: 1` over 220ms (`cubic-bezier(0.16, 1, 0.3, 1)`).
3. Tab border and glow update immediately on click.
4. History API: `pushState` to `/novel/<folderSlug>` on tab switch.

On `prefers-reduced-motion`: skip translate animations, crossfade opacity only.

---

## Expand-to-Read Animation

When a shard is clicked:

1. Capture the shard's `getBoundingClientRect()`.
2. Apply a `clip-path: inset(top right bottom left)` on `.reading-overlay` (the wrapper, which has no existing clip-path), starting at values matching the shard's viewport rect. Transition to `inset(0)` over **280ms** `ease-out`. `.reading-shard`'s existing polygon clip-path is retained and applies on top at full size.
3. The reading overlay's background fades from transparent to `rgba(3, 6, 16, 0.97)` simultaneously.
4. Once expanded, the reading content (breadcrumb, title, date, body) fades in over 150ms.
5. **Back / close**: reverse — content fades out (100ms), then `clip-path` contracts back to the original shard rect (250ms), then overlay hides.

The reading overlay HTML structure is unchanged. Only its entry/exit animation changes.

On `prefers-reduced-motion`: skip clip-path animation, use a plain opacity fade.

---

## Reading View

Unchanged from current implementation: breadcrumb, title, date, body prose, image column, category accent color on title and left strip. Back button returns to the scatter canvas.

History API: `pushState` to `/novel/<folderSlug>/<fileSlug>` on open. Popstate handler restores scatter + reading state correctly.

---

## URL / State

Existing URL scheme preserved:
- `/novel` — novel index (defaults to first non-empty folder)
- `/novel/<folderSlug>` — folder open, no shard selected
- `/novel/<folderSlug>/<fileSlug>` — shard reading view

`history.replaceState` / `pushState` logic mirrors current implementation.

---

## Mobile (≤ 768px)

- Filter tabs wrap if needed; reduce padding.
- Scatter canvas height becomes `auto`; shards use a two-column CSS grid fallback instead of absolute positioning (freeform absolute placement is unreadable at narrow widths).
- Reading overlay remains full-screen; expand animation simplified to opacity fade.

---

## Files Changed

| File | Change |
|---|---|
| `src/pages/novel/[...slug].astro` | Remove `.navigator`, `.folder-list`, `.shard-panel` HTML. Add `.filter-tabs` and `.scatter-canvas`. Rewrite client JS: tab click handler, scatter positioning, expand animation. |
| `src/styles/novel.css` | Remove `.navigator`, `.folder-list`, `.folder-cluster`, `.shard-panel`, `.shard-panel-*` styles. Add `.filter-tabs`, `.filter-tab`, `.scatter-canvas` styles. Update `.memory-shard` positioning context. |

No other files change.
