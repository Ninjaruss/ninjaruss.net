# Novel Page Redesign — "The Writer's Desk"

**Date:** 2026-07-10
**Route:** `/novel`, `/novel/[folder]`, `/novel/[folder]/[...file]` (URL scheme unchanged)
**Status:** Approved design, pending implementation plan

## Goal

Reframe `/novel` from a blue-toned file navigator into a "writer's desk": the page
presents a manuscript being written. Prose lands first (never an empty placeholder),
the archive reads as a story bible, and the palette shifts to gold/black/brown.
Structurally, the client-rendered SPA becomes real static pages.

## Framing principles

- **A writer's desk, not a product page.** The visitor peeks into an active
  manuscript: the freshest page sits open, notes and reference material surround it.
- **Story vs. outline made visual.** Scenes (the manuscript itself) render on cream
  paper; everything else (characters, lore, themes, locations) renders in ink on
  dark. This mirrors the story-words/outline-words split the homepage rain gauge
  already makes.
- **No-shame invariant.** Dates are stated as facts ("edited jun 28"), never as
  time-since-absence. Word counts frame accumulation ("14,200 story words ·
  21,800 outline words"). Same rule as the rain-gauge tile.

## Palette

New CSS custom properties at the top of `novel.css` (replacing the blue-rain values):

| Token | Value | Use |
|---|---|---|
| `--novel-bg` | `#141110` | page base (near-black, warm) |
| `--novel-panel` | `#241c12` | archive cards, furniture panels |
| `--novel-panel-deep` | `#1c1712` | list rows, recent strips |
| `--novel-border` | `#4a3a24` | default panel borders |
| `--novel-border-strong` | `#5a4632` | emphasized borders (Scenes card, binder edges) |
| `--novel-paper` | `#e8dcc3` | manuscript paper background |
| `--novel-paper-ink` | `#2c2216` | titles on paper |
| `--novel-paper-text` | `#3c3020` | prose on paper |
| `--novel-paper-rule` | `#c4b494` | hairlines on paper |
| `--novel-parchment` | `#d8cbb0` | prose text in ink treatment |
| `--novel-warm-muted` | `#a8905f` | metadata, dates |
| `--novel-warm-dim` | `#8a7355` | kickers, labels |
| `--novel-warm-faint` | `#6b5a42` | flavor lines, lowest-emphasis text |

Gold stays `--color-gold` (`#ffe52c`) from `global.css` — used for the NOVEL tab,
skewed underline, active/hover states, the Scenes archive card marker, and ink-page
titles. P4G vocabulary utilities (`.p4g-tab`, `.p4g-underline`, skew tokens, corner
cuts) are reused rather than re-implemented. The per-folder accent-color map
(characters=gold, locations=blue, etc.) is removed.

## Views

All three views render from the existing `src/pages/novel/[...slug].astro` route,
branching on the resolved slug: no segments → desk; one segment matching a top-level
folder → folder page; deeper → reading page.

### 1. `/novel` — the desk (landing)

- **Header:** gold `p4g-tab` "NOVEL" kicker, "Remember Rain" display title, skewed
  gold `p4g-underline`. Right-aligned status line: story/outline word counts from
  `computeNovelStats()` — no decorative subline. The old reflected-title/waterline
  motif is retired.

  **Copy restraint:** flavor text is kept to a minimum across all views. The only
  framing label is the "where the pen left off" kicker on the open sheet; everything
  else is functional (titles, counts, dates).
- **The open sheet (left, ~60%):** the most recently modified file in `Scenes/`
  rendered as a cream paper panel — corner-cut top-right, hard brown drop shadow
  (via `filter: drop-shadow` wrapper, since clip-path clips box-shadow). Contains:
  "WHERE THE PEN LEFT OFF" kicker, scene metadata (word count), scene title, a
  ~300-character plain-text excerpt (via `stripMarkdown()` on the raw body), and a
  "keep reading" link (dark skewed chip) to the scene's reading page.
- **Also on the desk:** below the sheet, up to 2 most recently modified non-scene
  files as small ink rows (title + edited date), linking to their reading pages.
- **The archive (right, ~40%):** five folder cards ("ARCHIVE" kicker above),
  each a corner-cut panel with folder title and file count only — no flavor
  descriptions. The Scenes card is gold-marked (gold title + strong border).
  Cards link to folder pages.
- **Mobile (≤768px):** stacks vertically — sheet, recent strip, archive cards.

### 2. `/novel/[folder]` — folder page

- Breadcrumb link back to the desk, folder title in the P4G header pattern,
  file count.
- Files listed as ink rows (title + edited date), grouped under subfolder headers
  where subfolders exist (Characters → Rain, Claire, Shiori, …). Flat folders
  (Themes, Scenes, Locations) render one list.
- Rows link to reading pages. Hover/focus: gold left edge + text lift, with
  `:focus-visible` parity.

### 3. `/novel/[folder]/[...file]` — reading page

- Focused single column, `max-width: 65ch`, no sidebar.
- Breadcrumb ("Desk / Characters / Rain") at top; title, edited date, hairline.
- **Paper treatment** (files under `Scenes/`): cream paper panel, dark ink serif
  prose, brown hairlines. All markdown elements (tables, lists, headings, images)
  restyled for the light surface.
- **Ink treatment** (everything else): dark page, gold title, warm parchment serif
  prose, brown hairlines; existing `content-body` markdown styles recolored.
- **Page-turn nav** at the bottom: prev/next links to sibling files in tree order
  within the same top-level folder (flattened across subfolders), styled as
  "← previous page / next page →".
- Bottom padding clears the fixed NavPill (keeps the uncommitted 72px clearance fix).

## Architecture

**From client-rendered SPA to static pages.** Today the route ships the entire novel
tree as a JSON blob and renders sidebar/content client-side with pushState/popstate
machinery and localStorage-persisted sidebar collapse. The redesign deletes all of
it:

- `getStaticPaths()` (already enumerating every path) passes each page enough props
  to render its view server-side. Three template branches in the one route file.
- Navigation is ordinary `<a>` links; Astro's ClientRouter view transitions handle
  motion between pages.
- Removed: the `#novel-tree` JSON script, sidebar/content client renderers,
  history/popstate handling, sidebar collapse tab + localStorage key, filter tabs,
  the `select a file to read` placeholder state.
- The only remaining client script is the rain canvas.

**Data layer (`src/utils/novel.ts`)** — `buildNovelTree()`, `computeNovelStats()`,
`countWords()` unchanged. Two new pure helpers, unit-tested in
`src/tests/novel.test.ts`:

- `flattenFolderFiles(folder)` — depth-first file list for a top-level folder
  (tree order), used for folder listings and prev/next siblings.
- `findRecentFiles(tree, { scenes: boolean, limit })` — most recently modified
  files (sidecar `Modified:` preferred, `mtime` fallback, UTC), used for the open
  sheet and "also on the desk."

Excerpts use the existing `stripMarkdown()` from `src/utils/content.ts` on raw file
content (a `raw` body or equivalent must be available at build time — `NovelFile`
already carries rendered HTML; the helper can strip from the rendered HTML string
since `stripMarkdown` also handles raw HTML/entities).

## Atmosphere

The rain canvas stays, recolored to sepia — "rain through a lamplit window":

- Radial glow: warm amber-brown (deeper than the current subtle orange).
- Skyline towers and struts: warm brown-grey instead of blue.
- Raindrops: pale amber (`rgba` warm tones) instead of blue.
- **New:** `prefers-reduced-motion: reduce` renders one static frame (skyline +
  glow, no drops loop) instead of animating — the current implementation ignores
  the preference.

## Accessibility

- Every hover treatment gets `:focus-visible` parity (comma-paired selectors).
- Paper surfaces: ink-on-cream text meets AA (`#3c3020` on `#e8dcc3` ≈ 9:1).
- Semantic landmarks: desk/folder/file views are real documents with `h1`s; the
  page-turn nav is a `<nav aria-label="…">`.
- 44px minimum touch targets on links/cards.

## Testing

- `src/tests/novel.test.ts` extended: `flattenFolderFiles` ordering,
  `findRecentFiles` scene/non-scene filtering and date-source preference.
- Existing novel tests must keep passing (no changes to tree building or stats).
- `npm run build` validates all routes still generate.

## Out of scope

- Scene narrative ordering (stays tree order — content problem for later).
- Homepage novel tile and rain-gauge logic — untouched.
- Novel content edits.
- The `/novel` entry in NavPill — unchanged.

## Risks / notes

- Deleting the SPA machinery changes back/forward behavior from pushState to real
  navigations — strictly simpler, but worth verifying view transitions feel right
  between desk → folder → file.
- Paper-treatment markdown restyle is the largest CSS surface (character layer
  tables never render on paper — only scenes do, and scenes are mostly plain
  prose — but the styles must still handle any markdown defensively).
- The old localStorage key `novel-sidebar-collapsed` becomes orphaned; harmless.
