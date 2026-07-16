# CLAUDE.md

This file provides guidance for Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

**ninjaruss.net** is a personal website built with Astro 5, featuring a Persona 4 Golden-inspired dark UI aesthetic. It's a static site for fragments, media, and experiments—organized around philosophical notes, media consumption logs, and inquiry-driven projects.

## Build & Development Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build static site to ./dist/
npm run preview   # Preview production build locally
npm run test      # Run vitest unit tests
npm run astro     # Direct Astro CLI access
npm run codex         # AI-condense site content into src/data/codex.json (claude CLI)
npm run codex:export  # manual mode: write codex-prompt.txt for any chatbot
npm run codex:import  # manual mode: validate codex-response.json → codex.json
```

## Architecture

### Directory Structure

```
src/
├── components/       # Reusable Astro components
├── content/          # Content collections (Markdown/MDX)
│   ├── config.ts     # Zod schema definitions
│   ├── shelf/        # Anime, manga, films, series, characters, music, etc.
│   ├── notes/        # Philosophical fragments
│   ├── novel/        # "Remember Rain" novel (Scrivener export — Characters, Manuscript, Story Plan, World)
│   ├── now/          # "Now" page snapshots (current focus)
│   └── showcase/     # Projects as inquiries
├── layouts/          # Page layout templates
├── pages/            # File-based routing
├── styles/           # Global CSS (no frameworks)
├── tests/            # Vitest unit tests (novel, content, journal, shelf, stream, ...)
└── utils/            # Shared utilities (content, collections, journal, dates, novel, splitView/)
```

### Key Patterns

- **Content Collections**: All content uses Zod-validated schemas in `src/content/config.ts`
- **Split-View Layout**: List/detail pattern with client-side content fetching
- **Static Generation**: All routes pre-rendered at build time
- **Vanilla CSS**: Design system via CSS custom properties, no utility frameworks

## Content Collections Schema

All collections share a base schema (defined in `sharedSchema`):
- `title` (required string)
- `tags` (string array, defaults to [])
- `collections` (string array for cross-referencing, defaults to [])
- `publishedAt` (optional date)
- `updatedAt` (optional date)
- `draft` (boolean, defaults to false, filters from production)
- `emblem` (optional string, path to page-specific emblem image)
- `description` (optional string, used for meta/OG description)
- `image` (optional string, path to social share image)

Collection-specific extensions:
- **shelf**: adds `content_type: 'anime' | 'manga' | 'film' | 'series' | 'music' | 'book' | 'game' | 'character' | 'other'` and `isFavorite: boolean` (defaults to false)
- **notes**: uses sharedSchema without extensions
- **showcase**: uses sharedSchema without extensions
- **now**: simplified schema with `title` (defaults to 'Now'), `publishedAt` (required), `updatedAt`, `draft`

## Layouts

| Layout | Purpose |
|--------|---------|
| `BaseLayout.astro` | Foundation wrapper with meta, styles, view transitions |
| `SplitViewLayout.astro` | Three-panel list/detail/emblem interface with client-side navigation and emblem card sidebar. Optional `kicker` prop; renders the unified P4G section header (`p4g-tab` + `p4g-heading` + `p4g-underline`) — the same header pattern is replicated on the Now, Now-archive, and Novel pages; optional `placeholderStats` prop renders a build-time stats `<dl>` in the no-selection placeholder (journal: notes/showcases/newest; codex: concepts/source entries) |

## Component Inventory

### Structural
- `BentoGrid.astro` / `BentoTile.astro` — Homepage grid system with visual hierarchy
- `NavPill.astro` — Fixed bottom-left P4G angled nav bar (`.nav-bar`, corner-cut clip-path, hard gold shadow via `drop-shadow` wrapper). Links Home/Journal/Novel/Shelf/Stream/Now/Codex with solid-gold active-page highlight (`.nav-bar__item--active` + `aria-current="page"`; `/notes/*` and `/showcase/*` paths highlight Journal via each section's `match` array); optional `backLink`/`backLabel` props append a back link. Hidden on the homepage; rendered on /stream. (No longer the centered floating Home pill.) ≤768px: items wrap into two rows (4+3, 44px targets, hairlines via gap + gold-tinted inner background); a small script publishes the nav's measured height as `--nav-clearance` on <html> (re-set on astro:page-load/resize), consumed by page bottom paddings (now pages, SplitViewLayout detail panel, novel.css) so the bar never covers content.

### Bento Tile Hierarchy
The homepage uses a visual hierarchy pattern:
- **Journal tile** (`.journal-tile`, 4×2, core, slash split): gold notes field / black showcases field separated by a diagonal `clip-path` seam (`::before` overlay; shifts ~2% left on hover, static under reduced motion; notes rows carry `padding-right` so dates clear the hovered seam). Root is a `div` (no nested anchors). Whole-tile navigation is JS (`initializeJournalTileNav`, `data-tile-href="/journal"`): a click handler on the tile routes any non-`<a>` click to the journal via `window.location.href` (a plain assignment on purpose — the view-transition router's trusted-event gating makes a stretched-link/`navigate()` approach unverifiable and it silently failed in testing); entry links keep their own view-transition nav. Left: JOURNAL tab + "Notes" heading linking to `/journal?types=note`, seven deep-link rows with right-aligned dates. Right: gold SHOWCASES tab linking to `/journal?types=showcase`, three showcase rows (42px emblem + visible title; gold border marks the most recent); the showcases column has `padding-left` so its content clears the seam and never straddles the diagonal. Corner hover triangle is gold (overrides the highlight-tile black — it sits on the black field). Below 1024px the fields stack and the black field is painted by `.journal-tile__showcases` itself (negative-margin bleed + 16px diagonal top clip) — tile-relative percentage seams can't track auto-sized content.
- **Core tiles** (`.bento-tile--core`): Journal and Shelf (Media Log) with elevated gold glow and larger typography. The homepage Shelf tile's 8-cover collage tucks under a diagonal top edge (`.tile-poster-strip` clip) — one cut, no new colors.
- **Signal tiles**: Current activity indicators (Now, Latest) — Now shows the latest now-entry's title; Latest is 2×2 with a stripped-markdown excerpt and cycles client-side through the latest 2 notes + latest 1 showcase (interleaved note/showcase/note, 7s interval; each swap is a P4G gold sweep — a skewed gold panel (`.latest-tile__sweep`, `skewX(--skew-accent)`, the same move as the journal-entry hover `.list-item::before`) sweeps across via the `latest-sweep` keyframes on `#latest-tile.is-cycling`: in to cover, entry swapped behind it at the midpoint, out to reveal; cycling is skipped entirely under `prefers-reduced-motion`, which also sets the sweep `animation: none`). The emblem sits on a deeper-black angled field (`.latest-tile__emblem-wrap`, `clip-path` + negative-margin bleed) traced by a gold hairline (`::before`, skewX(-4deg) measured against the clip edge); ≤768px the field flattens to the tile's bottom edge and the hairline hides.
- **Novel tile** (`.novel-tile`, 1×2, rows 2-3): "rain gauge" — story words (Manuscript/ folder, big gold) vs outline words (other folders, small grey) from `computeNovelStats()`. Client script (`initializeNovelRain`) reads `data-scene-modified`/`data-outline-modified` and sets `is-raining` (scene work ≤14 days, CSS rain animation scaled by `--rain-strength`), `is-misting` (outline-only work ≤14 days, sparse slow drizzle), or `is-waiting` (static "the rain waits." line); the rain spans the full tile (14 drops with varied lengths via `--len`, spread across the width). Design invariant: never red, never displays a count of absent days — the tile rewards accumulation, it does not shame absence.
- **Stream tile**: Dark 1×2 tile linking to `/stream`; shows live stat donut chart with leading stat emblem and session count. Pulsing red border (`--color-live`) when live.
- **Logo tiles** (`.logo-tile`): External service links (MyAnimeList, Spotify) and an Email tile (2×1, `#mail-tile`) with 48x48px logos/icons and hover effects. The email address (mailbox@ninjaruss.net) is never in the served HTML — `initializeMailTile()` assembles the `mailto:` on first pointerenter/focus/touch/click (bot-scrape mitigation; same pattern fills `#mail-address` on `/stream`'s Mailbox tab). Angled gold kicker chips name each tile's role (WATCHLIST / LISTENING / CONTACT), corner-cut clip-path (no hover shadow — clip-path would clip it, same reason there's no focus outline ring — hover/focus feedback is the gold sweep + lift instead), brand-colored hovers replaced by the shared `.p4g-sweep` gold wash with black text.
- **YouTube tile**: Full-bleed channel avatar with an angled gold "YouTube" kicker chip (`.yt-tile__chip`); switches to Twitch live preview when streaming (live overlay covers the chip)

Tile variants: `interactive` (default), `highlight` (gold bg), `dark`, `static`
Sizes: `dominant` (2x2), `medium-wide` (2x1), `medium-tall` (1x2), `small` (1x1)

**Hover signature**: the corner-cut triangle (`.bento-tile__corner` — gold triangle slides into the top-right on hover/focus) is the single hover signature for every interactive bento tile. Gold-background (`highlight`) tiles use a black triangle for contrast; `static` tiles hide it. Shelf cards have a matching `.shelf-card__corner`. BentoTile has no `accent` prop — the old `.bento-tile--accent` dot, corner-bracket `::after` decorations, and `.bento-tile--cyan` variant were all removed.
Span classes: `.bento-tile--span-4x2`, `.bento-tile--span-3x2`, `.bento-tile--span-2x2`, `.bento-tile--span-2x1`, `.bento-tile--span-1x2`

**Current Homepage Grid Pattern:**
- Row 1: Title (4×1) + YouTube (1×1) + Now (1×1)
- Rows 2-3: Journal (4×2, core) + Novel (1×2, rain gauge) + Stream (1×2)
- Rows 4-5: Shelf/Media Log (2×2, core) + Latest (2×2) + MAL (1×1, row 4) + Spotify (1×1, row 4) + Email (2×1, row 5)
- Row 6: Codex (2×1, cycling synthesis line)

Note: Title grid placement is controlled by scoped CSS in `index.astro` (`.title-tile { grid-column: span 4 }`), not a span class.

### List/Detail
- `ListItem.astro` — Left panel items in SplitViewLayout
- `EntryHeader.astro` — Entry title, tags, dates, emblem trigger (`data-page-emblem` attr signals SplitView to flip card)
- `EntryBody.astro` — Wraps entry prose in `.entry__content.prose`; renders nothing if `hasContent` is false

### Content
- `TagList.astro` — Tag pills display
- `DateDisplay.astro` — Published/updated date display with optional size variants
- `EmblemCard.astro` — 3D flippable card component with mouse-tracking tilt effect (Yu-Gi-Oh card backing style, aspect ratio 63:88)
- `MediaLightbox.astro` — Fullscreen media popup
- `RelatedContent.astro` — Cross-referenced entries via collections field, relevance-scored card grid (max 6 items)

## Design System

### CSS Files
- `global.css` — Design tokens, colors, spacing, shadows
- `typography.css` — Fonts (Archivo Black, Inter, JetBrains Mono), type scale
- `bento.css` — Grid system and tile variants
- `transitions.css` — P4G-style animations and view transitions
- `novel.css` — Novel writer's-desk UI (gold/black/brown; desk landing, folder pages, paper/ink reading pages, sepia rain canvas)

### Key CSS Variables
```css
/* Colors */
--color-gold: #ffe52c;           /* Primary accent (P4G yellow) */
--color-bg-base: #111111;        /* Main background */
--color-text: #f5f5f5;           /* Primary text */
--color-live: #ff4040;           /* Live/stream red (badges, borders) */
--color-live-rgb: 255, 64, 64;   /* For rgba() alpha variants */

/* Radii — deliberately angular (P4G cuts corners, doesn't round them) */
--radius-xs: 2px;
--radius-sm: 3px;
--radius-md: 4px;
--radius-lg: 6px;

/* Shadows (gold glow effect) */
--shadow-hard: 4px 4px 0 rgba(255, 229, 44, 0.3);
--shadow-glow: 0 0 20px rgba(255, 229, 44, 0.15);

/* Animation */
--animation-easing: cubic-bezier(0.16, 1, 0.3, 1);
--animation-base: 400ms;
```

### P4G Vocabulary Utilities (global.css)
Reusable menu-screen moves — prefer these over bespoke CSS for new surfaces:
- `.p4g-heading` — slanted uppercase display type (`--skew-display`)
- `.p4g-tab` — angled black-on-gold kicker label bar
- `.p4g-underline` — skewed gold underline, sweeps in on entrance
- `.p4g-sweep` — diagonal gold fill on hover/focus (children auto-lifted above panel)
- `.p4g-cut` — parallelogram silhouette via clip-path
- Tokens: `--skew-display: -6deg`, `--skew-accent: -12deg`, `--skew-rule: -30deg`, `--cut-sm: 6px`, `--cut-md: 12px`
- Caveat: `clip-path` clips `box-shadow` — cut elements needing the hard gold shadow use `filter: drop-shadow()` on a wrapper
- Convention: every `:hover` treatment gets `:focus-visible` parity (comma-paired selectors)
- Diagonal-language rule: full slash/seam treatments are reserved for tiles with two real content zones (Journal, Latest, Shelf collage). Single-zone tiles carry the motif only via the corner-cut hover triangle — don't add decorative slashes.

### Animation Classes
- `.p3r-animate` — Standard entrance (translateY + fade)
- `.p3r-animate-left` — Left entrance
- `.p3r-animate-wipe` — Diagonal wipe reveal
- Use `--stagger-delay` for sequencing
- (The `p3r-entrance-scale` keyframe is still used directly by `.entry-grid`/`.bento-grid` children)

## Responsive Breakpoints

- `480px` — Mobile
- `768px` — Tablet
- `900px` — SplitView collapse point
- `1024px` — Small desktop
- `1200px` — Desktop

## Pages & Routes

### Content Collection Pages
- `/journal` — SplitViewLayout merging the `notes` + `showcase` collections into one date-sorted list ("notes & showcases" kicker). Filters are inline (no dropdowns): a segmented type control (All / note / showcase, single-select with per-type counts, `?types=` URL param) and a wrapping tag pill row (multi-select with per-tag counts, `?tags=`), plus a "visible / total" count and a compact ✕ clear-all beside search. Unknown `?types=` values — including the legacy `fragment`/`inquiry` — are dropped (fall back to All, enforced in `filterUI.populateTypes` + `filterEngine.applyFilters`). (The old featured strip linking `/novel` and `/stream` was removed; those live in the NavPill now.)
- `/notes/[slug]` — Individual note detail pages (left panel shows the merged journal list, `section="journal"`)
- `/showcase/[slug]` — Individual project detail pages (same merged list)
- `/shelf` — Full-width emblem card grid grouped by content type, with a sticky jump bar (section anchor links) and inline quick-view panel. Progressive enhancement: cards link to `/shelf/[slug]` without JS; JS intercepts clicks to push `/shelf/[slug]` into history and open the panel instead (`?open=slug` supported for legacy links only).
- `/shelf/[slug]` — Individual shelf detail pages

### Legacy Routes (301 Redirects)
- `/notes` → redirects to `/journal?types=note` (list page only; detail routes live)
- `/showcase` → redirects to `/journal?types=showcase` (list page only; detail routes live)
- `/favorites` → redirects to `/shelf` (the `?fav=1` filter no longer exists)
- `/favorites/[slug]` → redirects to `/shelf/[slug]`
- `/media` → redirects to `/shelf` (via `astro.config.mjs` redirects)
- `/media/[...slug]` → redirects to `/shelf/[...slug]`

### Novel Pages
- `/novel` — "Remember Rain" writer's desk (latest scene excerpt + full file index, anchors per folder)
- `/novel/[folder]/.../[file]` — Focused reading pages; folder-only URLs (e.g. `/novel/characters`) 301-redirect to the matching desk anchor (`/novel#characters`)

### Utility Pages
- `/` — Homepage with BentoGrid tiles
- `/now` — Latest "Now" entry (current focus)
- `/now/archive` — Historical "Now" entries list

### Shelf Page Features (`/shelf`)
- Entries are grouped by `content_type` into sections (anime, manga, film, series, music, book, game, character, other), each rendered server-side with a `shelf-section` header and `shelf-grid` of cards.
- **Jump bar** (`.shelf-jumpbar`): sticky (`position: sticky; top: 0`) row of section anchor links (`#section-[type]`) below the page header. Active section gets a solid gold angled tab (`.is-active` / `[aria-current="true"]` — skewed parallelogram, black text; section headers are flat gold skewed display type, shimmer gradient removed; `.shelf-section` has `scroll-margin-top: 72px`), tracked via scroll position in client JS.
- **Character section**: renders an additional `shelf-hero` carousel (prev/next through character entries) above the character `shelf-grid`.
- **Quick-view panel**: clicking a `.shelf-card` intercepts navigation, pushes `/shelf/[slug]` into history, and slides in a panel from the right. Panel shows emblem, type, title, tags, excerpt, and link to full entry. ESC/✕/backdrop-click closes. `?open=[slug]` query param still opens the panel on load for legacy links, but is not written by current interactions.
- Cards are `<a>` tags linking to `/shelf/[slug]` (works without JS) — the standalone detail page itself redirects (`window.location.replace`) back to `/shelf?open=slug` when JS is available, so the quick-view panel is the JS-enabled experience.
- Entry data pre-rendered as JSON in `data-entries` attribute — no client fetch needed.
- **Content indicator**: favorites get a gold star badge (`.shelf-card__bar--fav`, `.shelf-card__star`) and gold title (`.shelf-card__title--fav`); entries that are neither a favorite nor have written content dim via `.shelf-card--dim` (`filter: opacity(0.52)`, not `opacity` — see Code Style Notes).
- No client-side type/favorites filter pills exist on this page (the `★ favorites` filter and `?type=/&fav=` URL params described elsewhere in this doc were removed; `src/utils/mediaGrid/filterEngine.ts` no longer exists). The `/favorites` route 301-redirects to `/shelf` (the old `?fav=1` query param was dropped once the filter was removed).

## Novel System ("Remember Rain")

The `/novel` route serves a standalone in-progress novel with its own UI, separate from content collections.

- **Content location**: `src/content/novel/` — Scrivener export structure with top-level folders (`Characters`, `Manuscript`, `Story Plan`, `World`). The manuscript prose (the story) lives under `Manuscript/` (arc subfolders); everything else is outline. The story-folder slug is defined once as `STORY_FOLDER_SLUG` in `src/utils/novel.ts`. Each `.md` file may have a sidecar `<Title> MetaData.txt` with Scrivener-format `Created:` / `Modified:` dates.
- **Build utility**: `src/utils/novel.ts` — `buildNovelTree()` reads the directory at build time and returns a `NovelTree` (recursive `NovelFolder`/`NovelFile` types). Files are slugified and markdown is pre-rendered to HTML via `marked`.
- **Routing**: `src/pages/novel/[...slug].astro` renders two static views from `getStaticPaths()`: `/novel` (desk landing: latest scene as a cream paper sheet with excerpt, plus the full file index — every file grouped by folder/subfolder in a 2-column `.desk-index`, one click from landing) and `/novel/[folder]/.../[file]` (focused reading page — paper treatment for Manuscript scenes, ink for everything else, prev/next page-turn links in tree order). Folder and intermediate subfolder URLs 301-redirect (`Astro.redirect`) to the matching desk anchor (`/novel#characters`); reading-page breadcrumbs and the NavPill back link point at those anchors. No client-side rendering — plain links + view transitions; the only script is the sepia rain canvas (static frame under reduced motion).
- **UI**: "Writer's desk" — gold/black/brown palette (`--novel-*` tokens in `novel.css`), P4G header pattern, dates always shown as facts ("edited …", never time-since — no-shame invariant). Story vs. outline split is visual: Manuscript scenes render on paper, outline docs in ink. Flat by design: two layers only (desk → reading page), no folder pages, no decorative copy (the sheet kicker is the functional "latest scene").
- **Homepage stats**: `computeNovelStats(tree)` returns `{ storyWords, outlineWords, lastSceneModified, lastOutlineModified }` for the rain-gauge tile — story = top-level `Manuscript` folder (`STORY_FOLDER_SLUG`), outline = everything else; sidecar `Modified:` dates preferred, filesystem `mtime` fallback (`NovelFile.mtime`), all anchored to UTC.
- **Testing**: `src/tests/novel.test.ts` covers `slugify`, `parseMetaData`, `buildNovelTree`, `countWords`, `computeNovelStats`, `flattenFolderFiles`, and `findRecentFiles` via vitest.
- **Ordering (binder order)**: The Scrivener export carries no binder-order data (no `.scrivx`, no order field in the sidecars), so `buildNovelTree` orders siblings by a **leading numeric filename prefix** (`parseOrderPrefix`): `1 Rain intro.md`, `2 Claire and Roxana save Rain.md`, … render in that order, and the number is stripped from both the display title and the URL slug (→ "Rain intro", `/novel/manuscript/arc-1-fugitive/rain-intro`). Works on files and folders at every level. A 1–3 digit prefix + separator (space/`.`/`-`/`_`/`)`) is treated as order; 4-digit years stay part of the title. Un-prefixed siblings fall back to natural (numeric-aware) alphabetical order, so `Arc 2` precedes `Arc 10` without prefixes. Number the exported files to reproduce the Scrivener binder order.
- **Adding content**: Drop `.md` files into the appropriate `src/content/novel/` subfolder. Scrivener MetaData.txt sidecars are auto-read if present (numbered sidecars like `1 Rain intro MetaData.txt` and prefix-stripped names both resolve); other `.txt` files are silently skipped.

## Codex System (/codex second brain)

`/codex` is an AI-condensed encyclopedia of the site's content. `src/data/codex.json`
(committed, reviewed via git diff before commit) holds the interpretation: 6-12
concepts, each with a second-person synthesis and entry refs like `notes/<slug>` /
`novel/world/<slug>`. The build resolves all facts (titles, dates, excerpts, links)
live from collections + the novel tree (`src/utils/codexContent.ts` → pure logic in
`src/utils/codex/`), so a stale codex.json can never show wrong facts — staleness only
means new entries sit in the "loose threads" tray on /codex (accumulation framing;
never shows time-since-last-run — same no-shame invariant as the novel rain gauge).
Missing/invalid codex.json → the build still succeeds and /codex renders an empty state.
Concepts whose synthesis is empty render sources-only. Pages: /codex (SplitViewLayout,
kicker "second brain") + /codex/[slug]. NavPill has a Codex item (7 items). Homepage
has a 2×1 Codex tile cycling synthesis first-sentences with the latest-sweep pattern.
Scripts live in scripts/codex/ (tsx); manual mode scratch files codex-prompt.txt /
codex-response.json are gitignored. Tests: src/tests/codex.test.ts (pure modules only).

## Utility Modules

| File | Exports | Purpose |
|------|---------|---------|
| `src/utils/content.ts` | `stripMarkdown()`, `hasMinimalContent()` | Strip markdown AND raw HTML/entities for excerpts + client-side search; detect empty entries |
| `src/utils/collections.ts` | `getAllCollections()` → `{ allShelf, allNotes, allShowcase }` | Fetch all non-draft entries; `SectionName = 'shelf' \| 'notes' \| 'showcase'` |
| `src/utils/journal.ts` | `getJournalItems()`, `mergeJournalEntries()`, `JournalItem`, `JournalType` | Merge notes (`note`) + showcase (`showcase`) into one date-sorted list |
| `src/utils/journalMerge.ts` | pure merge/sort logic (no astro imports) | Unit-testable core of journal.ts (vitest can't resolve `astro:content`) |
| `src/utils/dates.ts` | `formatDate()`, `shouldShowUpdatedDate()` | Date formatting and update-date display logic |
| `src/utils/novel.ts` | `buildNovelTree()`, `slugify()`, `parseMetaData()`, `countWords()`, `computeNovelStats()`, `flattenFolderFiles()`, `findRecentFiles()` | Scrivener-backed novel content loader + rain-gauge stats + desk recency helpers |
| `src/utils/codexContent.ts` + `src/utils/codex/` | `getCodexPageData()`, `getCodexTileData()`; pure modules: schema, json, stabilize, resolve, corpus, prompt, pipeline | /codex data layer — see Codex System section |
| `src/utils/splitView/` | (10 modules) | Modular SplitViewLayout client JS — see `index.ts` for entry point |

The `splitView/` directory is modular: `contentLoader`, `emblemAnimation`, `eventBindings`, `filterEngine`, `filterUI`, `idleManager`, `mediaHandlers`, `proseImageTilt`, `types`, `urlState`.

## Astro Integrations

- `@astrojs/mdx` — MDX support (`.mdx` files work in all content collections)
- `@astrojs/sitemap` — Auto-generates `/sitemap-index.xml` at build time
- Site URL: `https://ninjaruss.net` (set in `astro.config.mjs`)

## Important Implementation Details

1. **SplitViewLayout JavaScript**: Three-panel layout (list/detail/emblem) with client-side fetch for detail content, History API for navigation, search/tag/type filtering (Cmd/Ctrl+K to focus search), emblem card flipping on content selection, falls back gracefully without JS. `contentLoader.loadContent` fetches by each list item's own `href` (not the page section), so mixed-collection lists like `/journal` work. On load with no slug in the URL, auto-opens the newest visible entry — desktop layout only (detected via the applied grid columns, not viewport width) and without pushing history or moving focus; detection retries on a 75ms setTimeout loop (up to 20 attempts) because styles can land after init and rAF is suspended in background tabs, with a `splitView.isConnected` guard stopping stale timers after view-transition swaps (`src/utils/splitView/index.ts`; `loadContent` accepts `{ pushHistory, focusHeading }` options)

2. **View Transitions**: Uses Astro's ClientRouter with custom P4G-style slide animations

3. **Draft Filtering**: All collection queries should filter `draft !== true`

4. **Accessibility**: Focus-visible gold rings, prefers-reduced-motion respected, 44px minimum touch targets

5. **Now Page**: Dynamically renders the latest entry from the `now` collection. To update, add a new markdown file to `src/content/now/` with `publishedAt` frontmatter. Archive available at `/now/archive`. The homepage Now tile shows the latest entry's title.

6. **Latest Tile**: Homepage 2×2 tile with "X days ago" indicator and excerpt; cycles client-side through the latest 2 notes and latest 1 showcase (interleaved note/showcase/note, 7s interval; each swap is a P4G gold sweep — a skewed gold panel (`.latest-tile__sweep`) sweeps across via the `latest-sweep` keyframes on `#latest-tile.is-cycling`, matching the journal-entry hover, with the entry swapped behind it mid-sweep; cycling skipped under `prefers-reduced-motion`). The emblem sits on a deeper-black angled field (`.latest-tile__emblem-wrap`, `clip-path` + negative-margin bleed) traced by a gold hairline (`::before`, skewX(-4deg) measured against the clip edge); ≤768px the field flattens to the tile's bottom edge and the hairline hides.

6b. **NavPill**: 7 items — Home / Journal / Novel / Shelf / Stream / Now / Codex — rendered on every non-home page including `/stream` (whose sidebar "Ninjaruss" logo badge was removed). `/notes/*` and `/showcase/*` paths highlight Journal via each section's `match` array.

7. **Shelf Page Grid**: `/shelf` is a full emblem card grid grouped by content type (not SplitViewLayout), with a sticky jump bar for section navigation. `isFavorite: true` entries get a gold star badge and gold title on their card (no separate favorites filter exists anymore). Quick-view panel opens on card click without navigating away, pushing `/shelf/[slug]` into history. Cards that are neither a favorite nor have written content dim with `.shelf-card--dim` (`filter: opacity(0.52)`, not `opacity` — see Code Style Notes).

8. **Related Content System**: Uses `collections` field in frontmatter for cross-referencing. Calculates relevance scores based on matching collections, displays up to 6 related entries in card grid at bottom of detail pages. Shows emblem thumbnail, section badge, and title.

9. **EmblemCard 3D Tilt**: Interactive mouse-tracking tilt effect with `requestAnimationFrame` for smooth performance. Max 15-degree tilt, scale 1.03 on hover. Only activates on `(hover: hover)` devices. Respects `prefers-reduced-motion`. 3D flip animation reveals Yu-Gi-Oh card backing.

10. **Date Display**: Uses `updatedAt` from frontmatter if present. `shouldShowUpdatedDate()` only renders "Last Edited" when `updatedAt > publishedAt`. `formatDate()` always uses UTC to avoid timezone drift.

11. **Content Search**: Uses `stripMarkdown()` function to remove code blocks, links, headings, formatting, raw HTML tags, and HTML entities for client-side search (prose comparisons like `a < b` are preserved — the tag regex requires a letter or `/` after `<`). Truncates to 500 chars for search index.

## Image Assets

### Logos (`/public/images/logos/`)
- `myanimelist.svg` — MyAnimeList logo for external link tile
- `spotify.svg` — Spotify logo for external link tile

### Emblems (`/public/images/emblems/`)
- `default.svg` — Fallback emblem
- `eye.svg` — Vision/perception themed
- `lightbulb.svg` — Ideas/insight themed
- `coin.svg` — Value/exchange themed
- Content-specific emblems stored per entry

### Card Assets
- `/public/images/ygo-card-backing.png` — Yu-Gi-Oh style card backing texture for EmblemCard reverse

## Adding New Content

1. Create `.md` file in appropriate `src/content/` subdirectory (shelf, notes, showcase, now)
2. Include required frontmatter matching collection schema
3. Add `emblem: '/images/emblems/your-emblem.svg'` for custom emblem (optional)
4. Use `collections: ['tag1', 'tag2']` field to cross-reference related content (enables RelatedContent component)
5. Set `draft: true` while working, remove for publishing
6. For shelf entries: Set `isFavorite: true` to mark the entry as a curated highlight — shows a gold star badge and gold title on its `/shelf` card (optional, defaults to false)
7. Run `npm run build` to validate schema

### Content Type Guidelines
- **Shelf**: All reviews, consumption logs, and inspirational content (anime, manga, film, series, music, book, game, character, other)
  - Set `isFavorite: false` (or omit) for reviews/notes that appear only in /shelf
  - Set `isFavorite: true` for curated highlights; shown with a gold star badge on its `/shelf` card
- **Notes**: Philosophical fragments and thoughts
- **Showcase**: Project inquiries and experiments
- **Now**: Current focus snapshots (time-based)

## Code Style Notes

- Prefer editing existing components over creating new ones
- Maintain P4G aesthetic (gold accents, bold typography, dark backgrounds)
- Use existing CSS variables rather than hardcoded values
- Follow stagger animation pattern (50ms-100ms increments) for lists and grids
- Keep components minimal and composable
- Use `collections` field for cross-referencing content (enables RelatedContent component)
- EmblemCards should use 63:88 aspect ratio (standard card dimensions)
- Logo tiles use 48x48px SVG logos with hover effects (gold border + glow + translate)
- Respect `prefers-reduced-motion` in all animations
- Use `requestAnimationFrame` for smooth JavaScript-driven animations
- Client-side filtering should reset stagger animations on filter change
- `.media-card` has `animation: card-in ... fill-mode: both`; use `filter: opacity(N)` not `opacity: N` to dim cards — plain `opacity` is overridden by the animation after it completes
- `border-color` on `.media-card` is dead CSS — the actual card border lives on `.media-card__poster`; target that child for border effects
