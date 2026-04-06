# Novel Page Redesign — Remember Rain

**Date:** 2026-04-06  
**Status:** Approved  
**Supersedes:** `2026-04-05-novel-page-design.md`

---

## Overview

A full redesign of the `/novel` page and its navigation UX for *Remember Rain*. The design is story-canonical: it draws directly from two key mechanics — Vesper's ability to extract memories as **glass shards**, and Rain's passive ability to project a **ghostly afterimage** of himself. These become the frosted glass cluster aesthetic and the title reflection motif respectively. The setting is rainpunk (a city powered by Flare-charged volcanic water), expressed through a persistent canvas rain backdrop, volcanic glow, and blue-tinted glass surfaces.

The experience should feel surreal and immersive — not like a website. Navigation reveals layers rather than navigating pages.

---

## Architecture & Data

Unchanged from the previous spec. No new data concerns.

- Build-time tree via `src/utils/novel.ts` using Node `fs`
- MetaData.txt sidecars parsed for `Created:` and `Modified:` dates
- Full tree serialized as JSON into an inline `<script>` tag — no client fetches
- `getStaticPaths()` generates paths for every folder, subfolder, and file
- Client navigation uses `history.pushState()` + `popstate` listener

### Top-Level Folders and Accent Colors

| Folder | Accent | Rationale |
|---|---|---|
| Characters | `#ffe52c` gold | identity, the protagonist |
| Locations | `#7ab8ff` blue | rain, water, the city |
| Lore | `#ff8822` orange | the Flare, magic, fire |
| Scenes | `#ff6666` red | action, tension, drama |
| Themes | `#aaaaff` purple | philosophy, memory, abstraction |

Empty folders (e.g. Scenes with no files) render with 38% opacity label, "no shards yet" in italic, and a `default:cursor` — not clickable.

---

## Page Layout

The page uses a two-row grid:

```
┌─────────────────────────────────────────┐
│  Title block (fixed height)             │
├───────────────┬─────────────────────────┤
│ Folder list   │ Shard panel             │
│ (260px fixed) │ (1fr, flexible)         │
└───────────────┴─────────────────────────┘
```

```css
.novel-page {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 3rem 4rem;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
  overflow: hidden;
}
.navigator {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 4px;
  min-height: 0;
  overflow: hidden;
}
```

### Background

A `<canvas>` element behind the page renders a continuous rain animation:
- Vertical rain streaks at varying opacity and speed
- City silhouette at the bottom (jagged dark skyline)
- Volcanic glow: warm amber radial gradient rising from horizon
- The canvas is purely decorative — `pointer-events: none`, `position: fixed`, `z-index: -1`

---

## Title Block

Left-aligned, vertically anchored. Contains:

1. **Title group** — stacked vertically:
   - `REMEMBER RAIN` in Archivo Black, large (`clamp(2rem, 5vw, 3.2rem)`), uppercase, light
   - Directly below: a **waterline** — a 1px horizontal gradient line (transparent → blue-tint → transparent) acting as the water surface
   - Below the waterline: the **title reflection** — same text, `scaleY(-1)`, 13% opacity, blurred 0.8px, masked with a gradient fade-out so it disappears downward. Conveys Rain's ghostly afterimage passive ability.

2. **Eyebrow subtitle** — "a novel in progress · memory shards" in JetBrains Mono, small (`0.65rem`), 55% opacity, `0.22em` letter-spacing, positioned to the right of the title group aligned to baseline.

---

## Left Panel — Folder Clusters

A vertical list of folder clusters. Each cluster is a frosted glass panel:

- `backdrop-filter: blur(8px)` + semi-transparent dark fill
- Border in the folder's accent color at 20% opacity (idle), 45% (hover), 70% (open)
- Slightly skewed via `clip-path: polygon()` — irregular, glass-fragment feel
- A faint `::before` pseudo-element gloss stripe for the frosted glass look

Each cluster row contains:
- **Folder name** — JetBrains Mono, uppercase, `0.78rem`, in the folder's accent color
- **Shard count** — e.g. "2 shards" — same font, `0.68rem`, 50% opacity

**Interaction states:**
- Hover: background lightens to 6% accent fill, border brightens, meta opacity → 55%
- Open: background → 9% accent fill, border → 70% opacity, clip-path skew slightly adjusted
- When any folder is open: all other non-open non-empty clusters drop to 45% opacity

Clicking an open cluster again does not close it (selection is always active once made).

---

## Right Panel — Shard Panel

Appears and fills the right column when a folder cluster is clicked.

**Header:**
- Folder name (large, accent color, `0.78rem`, `0.18em` letter-spacing, uppercase)
- Shard count ("2 shards", `0.65rem`, 50% opacity)
- Separated from list by a 1px border in 10% blue

**Shard list:**
- Scrollable, `overflow-y: auto`, thin scrollbar
- One row per file in the folder
- Each row contains:
  - `◇` diamond glyph at left (30% opacity; rotates to 45° and brightens on hover)
  - **Title** — JetBrains Mono, uppercase, `0.78rem`, accent color
  - **Date** — single line, simplified (e.g. "Dec 2025 · edited Apr 2026"), `0.65rem`, 50% opacity, right-aligned
- Hover: light accent background (8% opacity)
- Click: opens reading overlay

**Empty state** (panel has never been opened): a centered message "click a cluster to surface its shards" in muted italic.

---

## Reading Overlay (Full-Screen)

Triggered by clicking any shard row. A full-screen fixed overlay that covers the entire page.

**Background:** `rgba(3, 6, 16, 0.92)` — near-opaque dark dim. The rain canvas is still visible but heavily suppressed.

**Content frame:**
- Centered column, max-width `680px`
- Inherits the folder's accent color for all decorative elements
- Clicking anywhere outside the content column dismisses the overlay
- Clicking inside the column does not dismiss (prevents accidental close mid-read)

**Content structure (top to bottom):**
1. `← return shard` — small button, top-left of frame, accent color at 50% opacity; click dismisses overlay
2. **Breadcrumb** — folder path (e.g. "Lore / Magic System"), `0.7rem`, `0.16em` letter-spacing, 60% opacity
3. **Title** — Archivo Black, `clamp(1.8rem, 4vw, 2.8rem)`, full accent color
4. **Date** — single line (e.g. "Created Dec 18, 2025 · edited Apr 5, 2026"), `0.72rem`, 55% opacity
5. **Body** — Inter, `1rem`, `1.85` line-height, `rgba(200,215,235,0.85)`

**Images:** If Scrivener exports images embedded in markdown, they appear in a right-side column beside the text (`width: ~200px`, flex layout). When no image is present the right side is empty — this empty space is intentionally part of the clickable dismiss area.

---

## Interaction & Animation

All animations respect `prefers-reduced-motion`.

| Transition | Duration | Easing |
|---|---|---|
| Folder cluster open (border + bg) | 300ms | ease |
| Shard panel appear | 250ms fade + 8px translateX | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Non-open cluster dim | 350ms | ease |
| Reading overlay appear | 200ms fade-in | ease |
| Reading content appear | 250ms (delayed 80ms after overlay) | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Overlay dismiss | 180ms fade-out | ease |

Browser back/forward: `popstate` restores state from URL. If a file URL is loaded directly, the page opens with the correct folder selected and reading overlay open.

---

## Mobile (below 768px)

- Two-panel grid collapses to single column
- Folder cluster list renders full-width, stacked vertically
- Shard panel renders below the cluster list (not side by side)
- Reading overlay: same full-screen behavior, content column uses full width with reduced padding
- Hover tilt effects disabled

---

## File Structure

```
src/
├── pages/
│   └── novel/
│       └── [...slug].astro      # single catch-all route, all states
├── utils/
│   └── novel.ts                 # fs tree builder (unchanged)
└── styles/
    └── novel.css                # complete replacement — all shard/layout/overlay styles
```

No new components required. `DateDisplay` not used — date is rendered inline as a single formatted string.

---

## Out of Scope

- Draft/publish filtering
- Search within novel content
- Cross-linking between novel entries
- Editing content from the browser
- Subfolder navigation UI (subfolders flatten their files into the parent panel for now)
