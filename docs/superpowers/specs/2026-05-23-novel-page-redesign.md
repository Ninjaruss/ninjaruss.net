# Novel Page Redesign — Remember Rain

**Date:** 2026-05-23
**Status:** Approved

## Problem

The current novel page uses a scatter canvas: each note is an absolutely-positioned "memory shard" card placed by a hash-based layout algorithm with an overlap resolver. As content has grown (19 files in Characters, 10 in Lore), the resolver cannot find non-overlapping positions within the viewport bounds and cards collide regardless of how many iterations it runs. The design also has no subfolder navigation — all files in a folder are dumped into one flat scatter.

## Solution

Replace the scatter canvas with a two-panel navigator:

- **Left sidebar** (180px): collapsible subfolder groups with file names listed underneath. Category tabs at the top switch the sidebar tree.
- **Right content panel**: selected file renders inline — no fullscreen overlay, no extra click.

The rain canvas background, title block (with water reflection), and category tabs are preserved. The glass/accent color system per category is preserved.

## Layout Structure

```
.novel-page (flex column, full viewport height)
  ├── #bg-canvas            — rain animation (unchanged)
  ├── .title-block          — "Remember Rain" + reflection (unchanged)
  ├── .filter-tabs          — Characters / Lore / Themes / Locations / Scenes (unchanged)
  └── .novel-panels (CSS grid: 180px 1fr)
       ├── .novel-sidebar   — collapsible tree
       └── .novel-content   — inline file content
```

## Sidebar Behavior

- Switching a category tab rebuilds the sidebar with that folder's subfolder groups and files.
- Each subfolder (Rain, Vesper, Magic System, etc.) is a collapsible `<button>` group with a `▶` arrow that rotates to `▼` when open.
- Files listed under each group are `<button>` elements. Clicking loads the file's content into the right panel.
- Active file gets: gold text, gold left-border accent, subtle gold background tint.
- Groups are expanded by default on first load. State is not persisted across tab switches (each tab switch resets to all-expanded).
- Folders with no subfolders (Themes, Locations) list their files directly without a group wrapper.

## Content Panel Behavior

- On tab switch with no file selected: show a centered "select a file to read" placeholder in the category's accent color.
- On file select: render breadcrumb (e.g. `Characters / Rain`), title (large, gold-tinted), date (if available), a gradient divider, then the markdown-rendered body prose.
- The panel is scrollable. The sidebar is independently scrollable.
- Prose styles reuse the existing `.reading-body` rules (already handles `p`, `strong`, `em`, `h2`, `h3`, `ul`, `ol`, `table`).

## URL Routing

- Category tab: `/novel/characters`
- File open: `/novel/characters/rain/artifact`
- History API `pushState` on every tab switch and file selection (same as current).
- Initial page load reads `data-initial-folder` and `data-initial-subpath` from the `<main>` element to restore state from the URL (same pattern as current `[...slug].astro`).

## What Is Removed

| Removed | Notes |
|---------|-------|
| `.scatter-canvas` / `#scatter-canvas` | All absolute-positioned shard layout |
| `.memory-shard` and all shard CSS | Glass card tiles, clip-path shapes |
| VanillaTilt import and initialization | No more 3D tilt on cards |
| `shardPosition()` | Hash-based position calculator |
| `resolveOverlaps()` | Overlap push algorithm |
| `renderScatter()` | DOM builder for shard tiles |
| `animateIn()` / `animateOut()` | Shard transition animations |
| `.reading-overlay` / `.reading-shard` | Full-screen reading modal |
| `openShard()` / `closeReading()` | Overlay open/close logic |
| `getGroupedFiles()` | Now handled by sidebar render |
| `SHARD_SHAPES` constant | Clip-path polygon list |
| `hashSlug()` / `shapeIndex()` | Shard shape selectors |
| `initHotspot()` | Mouse-tracking light effect |

## What Is Kept

| Kept | Notes |
|------|-------|
| Rain canvas animation | `#bg-canvas` + full draw loop |
| `.title-block` | Title, eyebrow, waterline, reflection |
| `.filter-tabs` / `.filter-tab` | Category switching, accent colors per folder |
| `ACCENT_MAP` | RGB values per folder slug |
| `buildNovelTree()` / `getStaticPaths()` | Server-side data unchanged |
| Inline `<script type="application/json">` | Tree data injected at build time |
| History API routing | `pushState` on tab/file change |
| `popstate` handler | Browser back/forward |
| `decodeShard` → rename to `decodeFile` | Data decode utility |
| Escape key handler | Remove — no overlay to close |
| `astro:before-swap` cleanup | Existing cleanup pattern |

## CSS Changes

**Remove:** All `.scatter-canvas`, `.memory-shard`, `.shard-title`, `.shard-subfolder`, `.reading-overlay`, `.reading-shard`, `.reading-content`, `.reading-back`, `.reading-inner`, `.reading-breadcrumb`, `.reading-title`, `.reading-date`, `.reading-body`, `.reading-images`, `@keyframes shard-sweep` rules.

**Add:**
```css
.novel-panels        — grid: 180px 1fr, flex:1, border
.novel-sidebar       — overflow-y:auto, scrollable tree container
.sidebar-group       — wrapper per subfolder
.sidebar-group-btn   — collapsible header button, gold accent
.sidebar-files       — file list container (display:none / block)
.sidebar-file        — individual file button, active state = gold border-left
.novel-content       — padding, overflow-y:auto, content display area
.content-breadcrumb  — small mono uppercase label
.content-title       — large Archivo Black, category accent color
.content-date        — small mono, muted accent
.content-divider     — gradient horizontal rule
.content-body        — prose styles (reuse .reading-body rules)
.content-placeholder — centered empty state
```

**Modify:** `.novel-page` — keep flex column, remove `overflow:hidden` (content panel scrolls independently).

**Mobile (≤768px):** Stack panels vertically. Sidebar becomes full-width accordion above content panel. Sidebar height auto, content panel below.

## JS Changes (inline script in `[...slug].astro`)

**Remove:** `renderScatter`, `resolveOverlaps`, `shardPosition`, `hashSlug`, `shapeIndex`, `getGroupedFiles`, `animateIn`, `animateOut`, `openShard`, `closeReading`, `initHotspot`, VanillaTilt import, `SHARD_SHAPES`.

**Add:**
- `renderSidebar(folderKey, tree, sidebar)` — builds group/file DOM for a folder
- `selectFile(folderKey, file, breadcrumb, subPath, pushState)` — renders content panel and calls `pushState`
- `toggleGroup(groupEl)` — expand/collapse sidebar group

**Modify:**
- `switchFolder` — now calls `renderSidebar` instead of `renderScatter`; clears content panel on switch
- `popstate` handler — restore sidebar tree + re-select file if `fileSubPath` in state
- `init` — wire sidebar click delegation instead of canvas delegation

## File Changes

| File | Change |
|------|--------|
| `src/pages/novel/[...slug].astro` | Replace scatter JS with sidebar/content JS; update HTML structure |
| `src/styles/novel.css` | Remove shard/overlay CSS; add panel/sidebar/content CSS |
| `package.json` | Remove `vanilla-tilt` dependency (only used in novel page) |

## Testing

- Build passes: `npm run build`
- All existing `getStaticPaths` routes still resolve
- Novel unit tests unchanged: `src/tests/novel.test.ts` (covers `buildNovelTree`, not UI)
- Manual: characters (19 files), lore (10 files), themes (4 files), locations (1 file) all navigate without overlap
- Mobile: sidebar stacks above content, all files reachable
- Browser back/forward restores correct folder + file selection
