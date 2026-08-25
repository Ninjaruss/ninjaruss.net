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
├── tests/            # Vitest unit tests (novel, content, journal, shelf, sessions, streamTile, ...)
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
- `collections` (string array for cross-referencing, defaults to [])
- `publishedAt` (optional date)
- `updatedAt` (optional date)
- `draft` (boolean, defaults to false, filters from production)
- `emblem` (optional string, path to page-specific emblem image)
- `description` (optional string, used for meta/OG description)
- `image` (optional string, path to social share image)

Collection-specific extensions:
- **shelf**: adds `content_type: 'anime' | 'manga' | 'film' | 'series' | 'music' | 'book' | 'game' | 'character' | 'other'`, `isFavorite: boolean` (defaults to false), and `tags` (string array, defaults to []) — shelf is the only collection with tags
- **notes**: uses sharedSchema without extensions (no tags; relatedness via `collections`)
- **showcase**: uses sharedSchema without extensions
- **now**: simplified schema with `title` (defaults to 'Now'), `publishedAt` (required), `updatedAt`, `draft`
- **profile**: single entry backing `/about` — `hook` (required), `credentials[]`, `makes[]` (`{label, blurb, href}`), `makesMore` (`{text, href}`), `subjects[]` (`{group, items[]}`), `connect`, `links[]` (`{label, href, primary}`). Every string is `.min(1)` — a blank field is a build error, not a silently empty card. Schema is defined in `src/utils/profile.ts` and imported into `config.ts` (not inline) so it stays unit-testable. Body markdown is the ABOUT prose. Deliberately has **no** `draft` field: it's a singleton the author edits directly

## Layouts

| Layout | Purpose |
|--------|---------|
| `BaseLayout.astro` | Foundation wrapper with meta, styles, view transitions |
| `SplitViewLayout.astro` | Three-panel list/detail/emblem interface with client-side navigation and emblem card sidebar. Optional `kicker` prop; renders the unified P4G section header (`p4g-tab` + `p4g-heading` + `p4g-underline`; the page title is the `<h1>` and the entry title in the detail panel is the `<h2>` beneath it, on the list route and the standalone detail routes alike) — the same header pattern is replicated on the Now, Now-archive, and Novel pages; optional `placeholderStats` prop renders a build-time stats `<dl>` in the no-selection placeholder (journal: notes/showcases/newest); optional `showDraw` prop renders the draw-a-card deck in the placeholder + the mobile DRAW button (journal only) |

## Component Inventory

### Structural
- `BentoGrid.astro` / `BentoTile.astro` — Homepage grid system with visual hierarchy
- `NavPill.astro` — Fixed bottom-left P4G angled nav bar (`.nav-bar`, corner-cut clip-path, hard gold shadow via `drop-shadow` wrapper). Links Home/Journal/VN/Shelf/About/Now with solid-gold active-page highlight (`.nav-bar__item--active` + `aria-current="page"`; `/notes/*` and `/showcase/*` paths highlight Journal via each section's `match` array); optional `backLink`/`backLabel` props append a back link. Hidden on the homepage; rendered on /about. (No longer the centered floating Home pill.) ≤768px: items wrap into two rows (4+3, 44px targets, hairlines via gap + gold-tinted inner background) and the back link takes a full-width third row (a folder title never fits a quarter-width cell); a small script publishes the nav's measured height as `--nav-clearance` on <html> (re-set on astro:page-load/resize), consumed by page bottom paddings (now pages, SplitViewLayout detail panel, novel.css) so the bar never covers content.

### Bento Tile Hierarchy
The homepage uses a visual hierarchy pattern:
- **Journal tile** (`.journal-tile`, 4×2, core, slash split): gold notes field / black showcases field separated by a diagonal `clip-path` seam (`::before` overlay; shifts ~2% left on hover, static under reduced motion; notes rows carry `padding-right` so dates clear the hovered seam). Root is a `div` (no nested anchors). Whole-tile navigation is JS (`initializeJournalTileNav`, `data-tile-href="/journal"`): a click handler on the tile routes any non-`<a>` click to the journal via `window.location.href` (a plain assignment on purpose — the view-transition router's trusted-event gating makes a stretched-link/`navigate()` approach unverifiable and it silently failed in testing); entry links keep their own view-transition nav. Left: JOURNAL tab + "Notes" heading linking to `/journal?types=note`, seven deep-link rows with right-aligned dates. Right: gold SHOWCASES tab linking to `/journal?types=showcase`, three showcase rows (42px emblem + visible title; gold border marks the most recent); the showcases column has `padding-left` so its content clears the seam and never straddles the diagonal. Corner hover triangle is gold (overrides the highlight-tile black — it sits on the black field). Below 1024px the fields stack and the black field is painted by `.journal-tile__showcases` itself (negative-margin bleed + 16px diagonal top clip) — tile-relative percentage seams can't track auto-sized content.
- **Core tiles** (`.bento-tile--core`): Journal and Shelf (Media Log) with elevated gold glow and larger typography. The homepage Shelf tile's 8-cover collage tucks under a diagonal top edge (`.tile-poster-strip` clip) — one cut, no new colors.
- **Signal tiles**: Current activity indicators (Now, Latest) — Now shows the latest now-entry's title; Latest is 2×2 with a stripped-markdown excerpt, an absolute per-entry date (`.latest-date`, never time-since, rendered lowercase to match the journal tile's date rows), and cycles client-side through the latest 2 notes + latest 1 showcase (interleaved note/showcase/note, 7s interval; each swap is a P4G gold sweep — a skewed gold panel (`.latest-tile__sweep`, `skewX(--skew-accent)`, the same move as the journal-entry hover `.list-item::before`) sweeps across via the `latest-sweep` keyframes on `#latest-tile.is-cycling`: in to cover, entry swapped behind it at the midpoint, out to reveal; cycling is skipped entirely under `prefers-reduced-motion`, which also sets the sweep `animation: none`). The emblem sits on a deeper-black angled field (`.latest-tile__emblem-wrap`, `clip-path` + negative-margin bleed) traced by a gold hairline (`::before`, skewX(-4deg) measured against the clip edge); ≤768px the field flattens to the tile's bottom edge and the hairline hides.
- **Novel tile** (`.novel-tile`, 1×2, rows 2-3): "rain gauge" — script words (Manuscript/ folder, big gold; labelled "script words" in the UI) vs outline words (other folders, small grey) from `computeNovelStats()`. Each rain drop is randomized per-visit (position/speed/delay/length/opacity) by `initializeNovelRain`. Client script (`initializeNovelRain`) reads `data-scene-modified`/`data-outline-modified` and sets `is-raining` (scene work ≤14 days, CSS rain animation scaled by `--rain-strength`), `is-misting` (outline-only work ≤14 days, sparse slow drizzle), or `is-waiting` (static "the rain waits." line); the rain spans the full tile (14 drops with varied lengths via `--len`, spread across the width). Design invariant: never red, never displays a count of absent days — the tile rewards accumulation, it does not shame absence.
- **Stream tile** (`.stream-tile`, `#stream-tile`): Dark 1×2 tile linking to `/about`, kicker "About" and the protagonist's name as its title; shows a one-line teaser of the current arc's decision text (read from `_quests.md`'s `## Current Arc` section, the same source `/about`'s arc card uses). Pulsing red border (`--color-live`) when live, via the unchanged `/api/live-status.ts` polling. Known wart: the element keeps `id="stream-tile"`, the `.stream-tile` class, and the whole `--st-*`/`.st-*` CSS prefix family from its pre-merge "Stream" identity even though the tile now means "About" — the id is load-bearing for the live-status client script, and renaming it would have to touch the CSS and that script together in the same pass, so it was deliberately left for a separate cleanup.
- **Logo tiles** (`.logo-tile`): External service links (MyAnimeList, Spotify) and an Email tile (2×1, `#mail-tile`) with 48x48px logos/icons and hover effects. The email address (mailbox@ninjaruss.net) is never in the served HTML — `initializeMailTile()` assembles the `mailto:` on first pointerenter/focus/touch/click (bot-scrape mitigation; same pattern fills `#about-mail` in `/about`'s Connect block). Angled gold kicker chips name each tile's role (WATCHLIST / LISTENING / CONTACT), corner-cut clip-path (no hover shadow — clip-path would clip it, same reason there's no focus outline ring — hover/focus feedback is the gold sweep + lift instead), brand-colored hovers replaced by the shared `.p4g-sweep` gold wash with black text.
- **YouTube tile**: Full-bleed channel avatar with an angled gold "YouTube" kicker chip (`.yt-tile__chip`); switches to Twitch live preview when streaming (live overlay covers the chip)

Tile variants: `interactive` (default), `highlight` (gold bg), `dark`, `static`
Sizes: `dominant` (2x2), `medium-wide` (2x1), `medium-tall` (1x2), `small` (1x1)

**Hover signature**: the corner-cut triangle (`.bento-tile__corner` — gold triangle slides into the top-right on hover/focus) is the single hover signature for every interactive bento tile. Gold-background (`highlight`) tiles use a black triangle for contrast; `static` tiles hide it. Shelf cards have a matching `.shelf-card__corner`. BentoTile has no `accent` prop — the old `.bento-tile--accent` dot, corner-bracket `::after` decorations, and `.bento-tile--cyan` variant were all removed.
Span classes: `.bento-tile--span-4x2`, `.bento-tile--span-3x2`, `.bento-tile--span-2x2`, `.bento-tile--span-2x1`, `.bento-tile--span-1x2`

**Current Homepage Grid Pattern:**
- Row 1: Title (4×1) + YouTube (1×1) + Now (1×1)
- Rows 2-3: Journal (4×2, core) + Novel (1×2, rain gauge) + Stream (1×2)
- Rows 4-5: Shelf/Media Log (2×2, core) + Latest (2×2) + MAL (1×1, row 4) + Spotify (1×1, row 4) + Email (2×1, row 5)

Note: Title grid placement is controlled by scoped CSS in `index.astro` (`.title-tile { grid-column: span 4 }`), not a span class. Below the grid (not a tile): the Traces band — see the Traces section.

### List/Detail
- `ListItem.astro` — Left panel items in SplitViewLayout
- `EntryHeader.astro` — Entry title, dates, emblem trigger (`data-page-emblem` attr signals SplitView to flip card); no tag row (notes/showcase have no tags)
- `EntryBody.astro` — Wraps entry prose in `.entry__content.prose`; renders nothing if `hasContent` is false

### Content
- `TagList.astro` — Tag pills display (shelf detail pages only — shelf is the only tagged collection)
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
--color-gold-rgb: 255, 229, 44;  /* For rgba() alpha variants */

/* Near-black surface scale, darkest first (dividers, panel fills, borders) */
--color-surface-1: #141416;
--color-surface-2: #1a1a1a;
--color-surface-3: #2a2a2a;

/* Two-tier heading scale — a surface picks one, nothing in between */
--text-page-title: clamp(2.5rem, 6vw, 3.5rem);  /* the h1 naming the surface */
--text-panel-title: 1.5rem;                     /* a heading inside a panel */

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
- `/journal` — SplitViewLayout merging the `notes` + `showcase` collections into one date-sorted list ("notes & showcases" kicker). Filters are search + a segmented type control only (All / note / showcase, single-select with per-type counts, `?types=` URL param), plus a "visible / total" count and a compact ✕ clear-all beside search — no tag filtering (legacy `?tags=` params are ignored and scrubbed from the URL on first filter interaction, `urlState.ts`). Unknown `?types=` values — including the legacy `fragment`/`inquiry` — are dropped (fall back to All, enforced in `filterUI.populateTypes` + `filterEngine.applyFilters`). The no-selection placeholder shows build-time stats (`placeholderStats`) and the draw-a-card deck (`showDraw`). Draw-a-card: desktop = deck in the placeholder (one draw per visit; clicking the revealed face opens the entry through the normal selection path), mobile (≤900px) = a DRAW button that navigates to a random note; the pool respects active filters and contains notes only (pure logic in `splitView/drawCard.ts`). (The old featured strip linking `/novel` and `/status` (then `/stream`) was removed; those live in the NavPill now.)
- `/notes/[slug]` — Individual note detail pages (left panel shows the merged journal list, `section="journal"`)
- `/showcase/[slug]` — Individual project detail pages (same merged list)
- `/shelf` — Flat 'wall' collage of every entry (size = favorite/written/logged tier) with a sticky type-filter bar and inline quick-view panel. Progressive enhancement: cards link to `/shelf/[slug]` without JS; JS intercepts clicks to push `/shelf/[slug]` into history and open the panel instead (`?open=slug` supported for legacy links only).
- `/shelf/[slug]` — Individual shelf detail pages

### Legacy Routes (301 Redirects)
- `/status` → redirects to `/about` (the 2026-08 `/status`↔`/about` merge; `astro.config.mjs` `redirects`).
- `/stream` → redirects to `/about` (retargeted in the same merge so it's a direct hop, not a chain through `/status`; `astro.config.mjs` `redirects`).
- `/notes` → redirects to `/journal?types=note` (list page only; detail routes live)
- `/showcase` → redirects to `/journal?types=showcase` (list page only; detail routes live)
- `/favorites` → redirects to `/shelf` (the `?fav=1` filter no longer exists)
- `/favorites/[slug]` → redirects to `/shelf/[slug]`
- `/media` → redirects to `/shelf` (via `astro.config.mjs` redirects)
- `/media/[...slug]` → redirects to `/shelf/[...slug]`

### Novel Pages
- `/novel` — "Remember Rain" writer's desk, story-first (top row: synopsis intro panel + "read from the start" CTA beside the latest-scene paper sheet; SCRIPT chapter-select hero — arcs with word counts, numbered scene rows, gold sweep hover, `latest` chip; BINDER row of Characters / Story Plan / World panels; anchors per folder)
- `/novel/[folder]/.../[file]` — Focused reading pages; folder-only URLs (e.g. `/novel/characters`) 301-redirect to the matching desk anchor (`/novel#characters`)

### Utility Pages
- `/` — Homepage with BentoGrid tiles
- `/about` — profile card. One card, one screen: header (name/epithet/portrait from `_protagonist.md` via `parseProtagonist`), credential lines, WHAT I MAKE, SUBJECTS I EXPLORE, ABOUT prose, NOW, CONNECT + FIND ME. Copy is hand-written in the single-entry `profile` collection (`src/content/profile/about.md`); the Zod schema and the `pickProfile`/`nowLine` selectors live in `src/utils/profile.ts` (pure — vitest can't resolve `astro:content`, same split as `journal.ts`/`journalMerge.ts`). Exactly one live element in the profile card proper: the NOW line, pulled from the latest `now` entry and omitted entirely when there isn't one. Reached from NavPill (the About item, on every non-home page) and from the homepage's 1×2 About tile. The `.title-tile__about` button under the homepage tagline was removed in the 2026-08 `/status` merge — an always-visible nav item replaces it. The page absorbed `/status` in that same merge: the current-arc card (`parseCurrentArc()` over `_quests.md`) is the first block in the main column, above the hook, and the retired mailbox strip's "Send mail to be read on stream" line now sits in the rail's Connect section. Arc-card CSS lives in `about.css`; `status.css` was deleted. Was a 301 to `/notes/i-am-ninjaruss` — the "no static About page" stance is preserved in spirit (the card is all output and links, no biography) and that note is now the deep read, linked from the ABOUT prose. The email address is assembled client-side (`#about-mail`), never in the served HTML. Link labels inside `.p4g-sweep` anchors **must** be wrapped in an element (`<span>`): the utility lifts children via `.p4g-sweep > *`, which doesn't match bare text nodes, so an unwrapped label gets painted over by the gold panel on hover.
- `/now` — Latest "Now" entry (current focus)
- `/now/archive` — Historical "Now" entries list
- `/rss.xml` — Journal RSS feed (`src/pages/rss.xml.ts`, `@astrojs/rss`): merged notes + showcases, **excerpt-only by design** (~300 chars + link — the feed is a doorbell, the site is the room). Autodiscovery `<link rel="alternate">` in BaseLayout head.

### Shelf Page Features (`/shelf`)
- **The Wall**: one flat dense-packed collage of every non-draft entry (no per-type
  sections). CSS grid, `grid-auto-flow: dense`, fine-grained rows + integer spans;
  size = affection tier from existing frontmatter (`wallTier` in
  `src/utils/shelfWall.ts`): favorite → large (gold ring + hard gold shadow),
  written-about → medium, bare log → small. **No dimming anywhere** — small is the
  quiet tier (no-shame invariant). Posters render ~2:3, music ~1:1 (`wallShape`);
  span numbers live in the page CSS (`.shelf-card--<shape>-<tier>`), overridden at
  ≤768px. Order: newest first, undated last (`sortWall`).
- **Pinned look**: every item carries a deterministic ±1.5° rotation seeded from its
  slug (`wallRotation`, inline `--rot`). Titles are hidden at rest; a skewed title
  plate (clamped to 3 lines) + the corner-cut gold triangle appear on hover/focus
  (rotation eases to 0). The entrance animation uses `animation-fill-mode: backwards`,
  NOT `both` — a filling animation outranks `:hover`/`:focus-visible` forever and
  would silently kill the straighten-and-lift (same trap as `.media-card`, see Code
  Style Notes). Under reduced motion the rotation stays (static pose) but
  entrance/hover motion is disabled.
- **Filter bar** (`.shelf-jumpbar`, same angled-tab silhouette as the old jump bar):
  tabs are client-side type filters with counts (All + present types, single-select,
  solid gold active tab, `aria-current="page"`). Filtering toggles the `hidden`
  attribute on cards — `.shelf-card[hidden] { display: none }` is required because the
  base rule is `display: block`. URL state via `?type=` + `replaceState`; legacy
  `#section-<type>` links map onto the filter and the hash is stripped; unknown types
  fall back to All (`resolveInitialFilter` in `shelfWall.ts` owns this resolution, and
  an invalid `?type=` is left in the URL rather than scrubbed unless a hash was also
  present). Modified clicks (Cmd/Ctrl/Shift/Alt/middle) are passed through to the
  browser so the tabs still open in a new tab. Filtering re-staggers the entrance
  animation. No-JS: the bar's links just reload the unfiltered page (every entry is
  still a plain `<a>` to its detail route).
- **Quick-view panel**: unchanged — clicking a `.shelf-card` intercepts navigation,
  pushes `/shelf/[slug]` into history, and slides in a panel from the right showing
  emblem, type, title, tags, excerpt, and a link to the full entry. ESC/✕/backdrop
  closes. `?open=[slug]` still opens it on load for legacy links. ≤900px it becomes a
  full-height bottom sheet (poster capped at 40vh, CTA held above `--nav-clearance`).
  Its init runs BEFORE `initFilter()` on purpose: `initFilter`'s `replaceState` would
  otherwise strip the `open` param out of `location.search` before it is read.
- Cards are `<a>` tags linking to `/shelf/[slug]` (works without JS) — the standalone
  detail page redirects (`window.location.replace`) back to `/shelf?open=slug` when JS
  is available, so the quick-view panel is the JS-enabled experience.
- Entry data pre-rendered as JSON in the `data-entries` attribute — no client fetch.
- The character hero carousel, section headers/dividers, jump-bar scrollspy, and
  `.shelf-card--dim` were all removed in the 2026-08 wall redesign, and
  `src/utils/shelf.ts`/`sortShelfSection` retired with them. Wall logic lives in
  `src/utils/shelfWall.ts`, tested in `src/tests/shelfWall.test.ts`.
- The `/favorites` route 301-redirects to `/shelf` (the old `?fav=1` filter is long gone).

## Visual Novel System ("Remember Rain")

Remember Rain is a **visual novel** in progress (the project committed to a VN-first direction — see [[remember-rain-project]] in memory). The `/novel` route (URL and content folders keep the `novel`/`manuscript` names; only the visible framing says "visual novel") serves it with its own UI, separate from content collections.

- **Content location**: `src/content/novel/` — Scrivener export structure with top-level folders (`Characters`, `Manuscript`, `Story Plan`, `World`). The manuscript prose (the story) lives under `Manuscript/` (arc subfolders); everything else is outline. The story-folder slug is defined once as `STORY_FOLDER_SLUG` in `src/utils/novel.ts`. Each `.md` file may have a sidecar `<Title> MetaData.txt` with Scrivener-format `Created:` / `Modified:` dates.
- **Build utility**: `src/utils/novel.ts` — `buildNovelTree()` reads the directory at build time and returns a `NovelTree` (recursive `NovelFolder`/`NovelFile` types). Files are slugified and markdown is pre-rendered to HTML via `marked`. Two Scrivener-specific cleanups run before `marked`: `unescapeScrivenerMarkdown()` undoes the compile step's blanket backslash-escaping, and `stripSceneLabel()` removes a scene document's leading `aNsNN_slug` line (`a1s01_road_less_traveled`, `a4d01_commute`, `a3v02_life`) — that label is the drafting handle, kept out of the title so the title can stay human-readable for this site, so it must not leak into body HTML, excerpts, or word counts. A label-only card correctly renders as empty. Top-level folders in `PRIVATE_FOLDER_SLUGS` (currently `inbox`) are excluded from the tree — the Inbox is the author's unsorted scratch front door and never belongs on the public desk.
- **Routing**: `src/pages/novel/[...slug].astro` renders two static views from `getStaticPaths()`: `/novel` (desk landing, story-first — spec: docs/superpowers/specs/2026-08-04-novel-desk-story-first-design.md. Top row `.desk-top` (2-col grid, stacks ≤768px; `--solo` when only one child): the optional `.desk-about` intro panel — rendered from the Story Plan doc found by `findSynopsisDoc()` (slug `synopsis` / `what-is-remember-rain` / `about` / `overview` / `premise`, currently `Story Plan/0 What is Remember Rain.md`), stretched to match the sheet with its "read from the start" CTA (to `findFirstScene()`, first Manuscript file in binder order) pinned to the panel bottom via `margin-top: auto`; falls back to a small `.desk-restart` link under the sheet when no synopsis doc exists — beside the latest scene as a cream paper sheet with excerpt. Then `.desk-script` (`id="manuscript"`) — the chapter-select hero: arcs (Manuscript subfolders; root files as an untitled first group) as mono headers with per-arc word counts, each scene a `.scene-row p4g-sweep` link (skewed number chip with continuous reading-order numbering, title, word count — count hidden ≤768px; the latest-edited scene carries a gold `latest` chip). Then `.desk-binder` — Characters / Story Plan / World as `.binder-panel`s (3-col grid, stacks ≤768px), each `id={slug}` so folder-URL redirects keep landing on their anchor. Panel headers carry doc count + summed word count; every row is `.binder-row__title` plus a `.binder-row__hook` — the document's own opening line, extracted at build by `hookOf()`, 130 chars, cut on the first sentence end when one fits, clamped to two lines. `hookOf` drops headings, then skips two kinds of useless opening block when real prose follows: a **wholly-italic** paragraph (this binder's provenance notes / "replaced by ticket N" asides are all italic leads) and a line that merely **restates the doc's own title**. Hover/focus is a gold left rule + 4px indent, not a background sweep — the binder stays subordinate to the script) and `/novel/[folder]/.../[file]` (focused reading page — paper treatment for Manuscript scenes, ink for everything else, prev/next page-turn links in tree order). Folder and intermediate subfolder URLs 301-redirect (`Astro.redirect`) to the matching desk anchor (`/novel#characters`); reading-page breadcrumbs and the NavPill back link point at those anchors. No client-side rendering — plain links + view transitions; the only script is the sepia rain canvas (static frame under reduced motion).
- **UI**: "Writer's desk" — gold/black/brown palette (`--novel-*` tokens in `novel.css`), P4G header pattern, dates always shown as facts ("edited …", never time-since — no-shame invariant). Story vs. outline split is visual: Manuscript scenes render on paper, outline docs in ink. Flat by design: two layers only (desk → reading page), no folder pages, no decorative copy (the sheet kicker is the functional "latest scene").
- **Homepage stats**: `computeNovelStats(tree)` returns `{ storyWords, outlineWords, lastSceneModified, lastOutlineModified }` for the rain-gauge tile — story = top-level `Manuscript` folder (`STORY_FOLDER_SLUG`), outline = everything else; sidecar `Modified:` dates preferred, filesystem `mtime` fallback (`NovelFile.mtime`), all anchored to UTC.
- **Testing**: `src/tests/novel.test.ts` covers `slugify`, `parseMetaData`, `buildNovelTree`, `countWords`, `computeNovelStats`, `flattenFolderFiles`, `findRecentFiles`, `findSynopsisDoc`, and `findFirstScene` via vitest.
- **Ordering (binder order)**: The Scrivener export carries no binder-order data (no `.scrivx`, no order field in the sidecars), so `buildNovelTree` orders siblings by a **leading numeric filename prefix** (`parseOrderPrefix`): `1 Rain intro.md`, `2 Claire and Roxana save Rain.md`, … render in that order, and the number is stripped from both the display title and the URL slug (→ "Rain intro", `/novel/manuscript/arc-1-fugitive/rain-intro`). Works on files and folders at every level. A 1–3 digit prefix + separator (space/`.`/`-`/`_`/`)`) is treated as order; 4-digit years stay part of the title. Un-prefixed siblings fall back to natural (numeric-aware) alphabetical order, so `Arc 2` precedes `Arc 10` without prefixes. Number the exported files to reproduce the Scrivener binder order.
- **Adding content**: Drop `.md` files into the appropriate `src/content/novel/` subfolder. Scrivener MetaData.txt sidecars are auto-read if present (numbered sidecars like `1 Rain intro MetaData.txt` and prefix-stripped names both resolve); other `.txt` files are silently skipped.

## Traces

A public guestbook: visitors leave a short name + one-line message. Neon
Postgres-backed (`traces_messages` table, provisioned via the Vercel
Marketplace `neon` integration — `DATABASE_URL` and the connection is
lazy-initialized in `src/utils/tracesDb.ts` to stay build-safe). The site is
otherwise fully static; only the Traces routes opt into on-demand rendering
(`export const prerender = false`): `GET`/`POST /api/traces` (list, with an
optional `?limit=`, and submit — both live in the same
`src/pages/api/traces/index.ts`) and the admin-only `DELETE
/api/traces/[id]` (gated by an `x-admin-key` header checked against
`TRACES_ADMIN_KEY`). `/traces` (`src/pages/traces.astro`) is the canonical,
no-JS-safe destination — full form + full list, server-rendered.
**Deleting via curl needs an explicit `-H "Content-Type: application/json"`**
— Astro's default `security.checkOrigin` CSRF guard blocks `DELETE` requests
whose Content-Type is form-like (including curl's default when none is set),
with the generic error "Cross-site DELETE form submissions are forbidden";
this only surfaces on the real deployment, not `astro dev`/`vercel dev`.

**Anti-abuse (all invisible, no CAPTCHA)**: a honeypot field (`website`,
silently no-ops rather than erroring), Vercel BotID (`checkBotId()`
server-side, fails open on error — see `vercel.json`'s proxy rewrites and
`initBotId()` client-side calls in both `traces.astro` and `index.astro`),
a per-IP rate limit (`hashIp()`/`isRateLimited()` in `src/utils/traces.ts`,
5 min window, `ip_hash` never stores the raw IP), a length cap (name 40 /
message 100 chars), and a narrow, intentionally-not-general-purpose
blocklist (`BLOCKED_TERMS` in the same file — self-harm-incitement phrases
only; extend it directly rather than treating it as a profanity filter).

**Homepage — the wall** (`.traces-wall`, three redesigns in: pills →
fixed-corner ticker → this): a danmaku/bullet-comment strip living in
normal page flow directly under the bento grid (`.container` class in
markup, so it lines up with the grid's own width/padding — not fixed to
the viewport like the two prior iterations). Header is a "Traces"
`p4g-tab` + a plain "Leave your mark →" link (`#traces-tab`, opens the
modal via JS, degrades to a real link to `/traces` with no JS). Below
that, `.traces-wall__lanes` holds 3 horizontal lanes (2 on ≤768px —
three lanes of readable-length messages start overlapping below that);
JS (`initializeTracesWall`) fetches `?limit=30` and spawns each message
as a `.traces-wall__bullet` — name, message, and a compact timestamp
(`formatTraceTimestampCompact`, e.g. "aug 25 · 3:41pm") — that flies
right-to-left via a CSS `translateX` keyframe, `--bullet-duration` scaled
to message length (`tracesBulletDuration`), removed on `animationend`.
Bullets loop continuously through the same fetched snapshot (schedule
the queue once, reschedule after its total run time — same "loop a fixed
set" approach as the Latest tile) rather than re-fetching.

**Same-person grouping** (`buildTracesSpawnQueue`): names are free text,
not accounts, so "same person" is approximated by trimmed
case-insensitive name match. Each name-group's newest message is a
"primary" bullet; older messages from that name become dimmer, smaller
"echo" bullets (`.traces-wall__bullet--echo`) queued immediately after
the primary with a tighter gap (`TRACES_ECHO_GAP_MS`, 900ms) than the gap
between different people's primaries (`TRACES_BULLET_GAP_MS`, 2600ms) —
so a person's history clusters together in the wall and their latest
message is what surfaces first, instead of their old messages scattered
evenly among everyone else's.

Clicking a bullet (or the header link) opens the existing `<dialog>`
modal with the full form + list, scrolled to and highlighting that exact
entry (`data-trace-id`); the modal list and `/traces` itself both show
the full formatted date **and time** per message
(`formatTraceTimestamp`, e.g. "Aug 25, 2026 · 3:41 PM UTC") — traces
are submission instants, not editorial content dates, so this
intentionally departs from the sitewide date-only `formatDate()`
convention (see `src/utils/tracesFormat.ts`'s doc comment).

**Reduced motion**: flying, looping text is the entire point of a
danmaku wall, so `prefers-reduced-motion` doesn't just slow it down —
`initializeTracesWall` skips the animated spawn queue entirely and
instead appends each name-group's primary bullet statically (no echoes,
no motion) directly into `.traces-wall__lanes[data-static]`, which CSS
switches to a plain wrapped flex row.

**Gotcha**: Astro's scoped CSS only tags elements present in the
server-rendered template. Anything built client-side via
`document.createElement`/`innerHTML` — the wall's bullets, the modal's
form/list, a page's own JS-appended list item — never gets the
`data-astro-cid-*` attribute, so scoped rules silently never match it.
Every such selector in `traces.astro` and `index.astro` is wrapped in
`:global(...)` for exactly this reason; do the same for any new
dynamically-created Traces markup.

## Sessions & the /about arc card

The `sessions` collection logs work sessions (Japanese, writing, streams) as
hand-written markdown — create a `.md` in `src/content/sessions/` (VS Code
snippet: type `session` + Tab). These files are currently an inert historical
archive: nothing reads them anymore (see below), so creating new ones is
optional bookkeeping, not something any page depends on.

The arc card that now lives on `/about` traces back to `/status`
(spec: docs/superpowers/specs/2026-08-18-status-page-arc-revamp-design.md),
which was rebuilt 2026-08 from a four-screen session-log pause menu into a
single flat screen, because the log required per-stream maintenance that
competed with the actual writing/Japanese-learning work it was meant to
reflect. `/status` was then merged into `/about`
(spec: docs/superpowers/specs/2026-08-19-about-status-merge-design.md) once it
became clear the two pages were two one-screen answers to "who is this?" that
already shared the protagonist header, the profile links, and the mailbox —
only the arc card and the `LV n` chip were unique to `/status`. Both `/status`
and `/stream` now 301 to `/about`. The surviving framing: `/about` is a
profile that has a status, not a status screen that has a profile — and it's
still viewer-facing, not a personal tracker: the arc card's job is "what
chapter of the story is this, and what's currently being decided" — not "how
many sessions has Russ logged."

- **Arc card** (`.arc-card`) — the first block in `/about`'s main column,
  above the hook. Whole-card accent-colored by the arc's stat (border/kicker/
  updated stamp use `STAT_COLORS`), with a stat emblem badge
  (`/images/emblems/<stat>.png`) on a dark circular plate for contrast (the
  emblem PNGs are opaque-white-background line art and wash out if dropped
  directly on a pale accent color like Insight). Sourced from a
  `## Current Arc` section in `_quests.md` (`**Arc:**`/`**Stat:**`/
  `**Updated:**` fields + a decision paragraph), parsed by
  `parseCurrentArc()` (`src/utils/currentArc.ts`). An absent or incomplete
  section hides the card entirely rather than rendering blanks; an
  unrecognized `Stat` value degrades to a neutral gold accent rather than
  failing the build. Hand-edited, expected to change every few weeks/months —
  not per-stream. The rest of `_quests.md` (The Question / Active / Ideas —
  `<Stat>` / Completed) is Russ's private planning scaffold and is **not**
  rendered anywhere. Arc-card CSS moved into `about.css` in the merge;
  `status.css` was deleted.
- **Identity header** and **"find me elsewhere" links row** — no longer
  `/status`-specific; they're just `/about`'s own header (portrait/name/
  epithet from `_protagonist.md`, parsed by `parseProtagonist()`,
  `src/utils/protagonist.ts`; missing file/fields degrade to defaults) and its
  existing rail links strip (`profile.links`) — not the `social-links`
  collection, which models Bonds/confidants (`arcana`/`affinity`/`rank`/`lore`)
  and has no real entries.
- **The `LV n` chip is gone.** It was a byproduct stat for a screen that no
  longer exists, and `computeSiteLevel()` is no longer called anywhere.
  `src/utils/level.ts` and `src/tests/level.test.ts` remain in the repo,
  unimported, still passing — deleting them is a separate decision.
- **Mailbox strip** — carried over into `/about`'s existing Connect section:
  address assembled client-side into `#about-mail` (never in served HTML),
  `<noscript>` obfuscated-text fallback, plus the one line kept from
  `/status`'s old mailbox strip, "Send mail to be read on stream" (hard-coded
  copy, not a `profile` schema field). Kept because the homepage's
  `#mail-tile` links to `/about` as its no-JS fallback.

`STAT_COLORS`/`STAT_ORDER`/`StatName`/`hexToRgbTriplet` are all that remain in
`src/utils/sessions.ts` — everything else (tallying, radar/donut geometry,
quest-file parsing, the log-scale level curve) was deleted with the pause
menu. `STAT_COLORS` is still consumed by `scripts/transition.ts`'s per-route
page-transition card effect (a static route→stat color mapping, unrelated to
session tallies) and by the arc card above.

The homepage's Stream tile (`#stream-tile`, dark 1×2, links to `/about`) shows
the same live-now indicator as before (`/api/live-status.ts`, unchanged) plus
a one-line teaser of the current arc's decision text, read from the same
`_quests.md` section.

The `social-links` collection/schema is unused by any page as of 2026-08 (it
has one `draft: true` sample entry) — a future Bonds/confidants feature is a
separate decision, not part of this page.

## Utility Modules

| File | Exports | Purpose |
|------|---------|---------|
| `src/utils/content.ts` | `stripMarkdown()`, `hasMinimalContent()` | Strip markdown AND raw HTML for excerpts + client-side search; detect empty entries. Entities a renderer emits (`&amp; &lt; &gt; &quot; &#39;`) are **decoded, not blanked** — blanking them turned every "the author&#39;s notes" into "the author s notes" in excerpts and the search index; exotic entities still collapse to a space |
| `src/utils/collections.ts` | `getAllCollections()` → `{ allShelf, allNotes, allShowcase }` | Fetch all non-draft entries; `SectionName = 'shelf' \| 'notes' \| 'showcase'` |
| `src/utils/journal.ts` | `getJournalItems()`, `mergeJournalEntries()`, `JournalItem`, `JournalType` | Merge notes (`note`) + showcase (`showcase`) into one date-sorted list |
| `src/utils/journalMerge.ts` | pure merge/sort logic (no astro imports) | Unit-testable core of journal.ts (vitest can't resolve `astro:content`) |
| `src/utils/dates.ts` | `formatDate()`, `shouldShowUpdatedDate()` | Date formatting and update-date display logic |
| `src/utils/novel.ts` | `buildNovelTree()`, `slugify()`, `parseMetaData()`, `parseOrderPrefix()`, `unescapeScrivenerMarkdown()`, `stripSceneLabel()`, `countWords()`, `computeNovelStats()`, `flattenFolderFiles()`, `findRecentFiles()`, `findSynopsisDoc()`, `findFirstScene()` | Scrivener-backed novel content loader + rain-gauge stats + desk recency/intro helpers |
| `src/utils/sessions.ts` | `STAT_ORDER`, `StatName`, `STAT_COLORS`, `hexToRgbTriplet()` | The shared stat vocabulary/colors — the only place the five stat hexes are written (`index.astro`'s homepage tile, `about.astro`'s arc card, and `scripts/transition.ts`'s page-transition card all read `STAT_COLORS`). Tallying/radar/donut/quest-parsing/level-curve logic that used to live here was deleted in the 2026-08 `/status` rebuild (see Sessions & the /about arc card above) |
| `src/utils/protagonist.ts` | `parseProtagonist()`, `DEFAULT_PROTAGONIST` | Minimal frontmatter reader for `_protagonist.md` (name/epithet/portrait); missing file/fields degrade to defaults |
| `src/utils/profile.ts` | `profileSchema`, `pickProfile()`, `nowLine()` | /about profile card data layer — Zod schema (from `astro/zod`, **not** `astro:content`, so vitest can load it), singleton entry selection, and the single live NOW line (returns null rather than a placeholder when there's nothing real to show) |
| `src/utils/shelfWall.ts` | `wallTier()`, `wallShape()`, `wallClass()`, `wallRotation()`, `sortWall()`, `resolveInitialFilter()` | /shelf wall logic — affection tiers, shape/span classes, slug-seeded rotation, ordering, filter-URL resolution |
| `src/utils/splitView/` | (11 modules) | Modular SplitViewLayout client JS — see `index.ts` for entry point |
| `src/utils/traces.ts` | `tracesMessageSchema`, `parseTracesInput()`, `sanitizeText()`, `hashIp()`, `isRateLimited()`, `containsBlockedTerm()`, `BLOCKED_TERMS`, `NAME_MAX_LENGTH`, `MESSAGE_MAX_LENGTH`, `RATE_LIMIT_WINDOW_MS` | Traces validation/hash/rate-limit/blocklist — see Traces section |
| `src/utils/tracesDb.ts` | `insertMessage()`, `listMessages()`, `lastSubmissionByIpHash()`, `deleteMessage()`, `TraceRow` | Traces database access layer (Neon, lazy-initialized) |
| `src/utils/tracesFormat.ts` | `formatTraceTimestamp()`, `formatTraceTimestampCompact()` | Zero-import timestamp formatting shared by `traces.astro`'s list, the homepage modal list, and the wall bullets' compact date+time |

The `splitView/` directory is modular: `contentLoader`, `drawCard` (pure draw-pool logic, tested in `src/tests/drawCard.test.ts`), `emblemAnimation`, `eventBindings`, `filterEngine`, `filterUI`, `idleManager`, `mediaHandlers`, `proseImageTilt`, `types`, `urlState`.

## Astro Integrations

- `@astrojs/mdx` — MDX support (`.mdx` files work in all content collections)
- `@astrojs/sitemap` — Auto-generates `/sitemap-index.xml` at build time
- `@astrojs/vercel` — Deployment adapter; the site deploys on Vercel (`wrangler.jsonc` is a Cloudflare static-assets config not referenced by any npm script — Vercel is the live target)
- Site URL: `https://ninjaruss.net` (set in `astro.config.mjs`)

## Build Warnings (expected vs. real)

- `[glob-loader] Duplicate id "..."` warnings with no actual duplicate files = stale cache; fix with `rm -rf .astro node_modules/.astro` and rebuild. Verify with `ls src/content/shelf | sort | uniq -d` before hunting further.
- One deprecation warning about defining collections in `src/content.config.ts` is expected: `src/content/novel/` lives inside `src/content/` but is not a content collection (read directly by `buildNovelTree()`). Relocating it is a known deferred task.

## Important Implementation Details

1. **SplitViewLayout JavaScript**: Three-panel layout (list/detail/emblem) with client-side fetch for detail content, History API for navigation, search/tag/type filtering (Cmd/Ctrl+K to focus search), emblem card flipping on content selection, falls back gracefully without JS. `contentLoader.loadContent` fetches by each list item's own `href` (not the page section), so mixed-collection lists like `/journal` work. On load with no slug in the URL, auto-opens the newest visible entry — desktop layout only (detected via the applied grid columns, not viewport width) and without pushing history or moving focus; detection retries on a setTimeout loop (20 × 75ms then 20 × 250ms, ~6.5s total) because styles can land after init and rAF is suspended in background tabs, and is re-kicked once on window `load` and once when the `(min-width: 1200px)` media query flips true (embedded panes can report 0×0 at init), with a `splitView.isConnected` guard stopping stale timers after view-transition swaps (`src/utils/splitView/index.ts`; `loadContent` accepts `{ pushHistory, focusHeading }` options). Auto-open is skipped entirely when `showDraw` renders the draw deck — the journal lands on the placeholder (stats + draw) instead of auto-opening an entry.

1b. **SplitView mobile (≤900px) stacked layout**: the list panel flows at natural height (`.split-view__nav` has `max-height: none` — the page scrolls; an inner scroller left a dead band above the bottom nav) with `--nav-clearance` bottom padding, and the empty detail pane is `display: none` until a selection exists (`has-selection` is server-set on detail routes like `/notes/[slug]` and client-set on tap, so both flows show the detail). Auto-open remains desktop-only. The `.split-view__content .prose` right inset in that breakpoint exists to clear the fixed `.emblem-badge` (60px + its offset) — removing it puts the badge back on top of the text.

2. **View Transitions**: Uses Astro's ClientRouter with custom P4G-style slide animations. `#transition-canvas` is a replaced element sized by its `width`/`height` attributes (`resizeCanvas()` in `src/scripts/transition.ts`) — a percentage in CSS can't size it, and measuring from `window.innerWidth` (scrollbar-inclusive) reintroduces horizontal page overflow; use `documentElement.clientWidth`.

3. **Draft Filtering**: All collection queries should filter `draft !== true`

4. **Accessibility**: Focus-visible gold rings, prefers-reduced-motion respected, 44px minimum touch targets

5. **Now Page**: Dynamically renders the latest entry from the `now` collection. To update, add a new markdown file to `src/content/now/` with `publishedAt` frontmatter. Archive available at `/now/archive`. The homepage Now tile shows the latest entry's title.

6. **Latest Tile**: Homepage 2×2 tile with an absolute date (`.latest-date`, formatted at build with `formatDate`, carried per entry in `data-entries` so it swaps with the cycle — never "days ago", per the no-shame invariant; `text-transform: lowercase` in CSS so it matches the journal tile's "aug 1" rows without touching `formatDate`) and excerpt; cycles client-side through the latest 2 notes and latest 1 showcase (interleaved note/showcase/note, 7s interval; each swap is a P4G gold sweep — a skewed gold panel (`.latest-tile__sweep`) sweeps across via the `latest-sweep` keyframes on `#latest-tile.is-cycling`, matching the journal-entry hover, with the entry swapped behind it mid-sweep; cycling skipped under `prefers-reduced-motion`). The emblem sits on a deeper-black angled field (`.latest-tile__emblem-wrap`, `clip-path` + negative-margin bleed) traced by a gold hairline (`::before`, skewX(-4deg) measured against the clip edge); ≤768px the field flattens to the tile's bottom edge and the hairline hides.

6b. **NavPill**: 6 items — Home / Journal / VN / Shelf / About / Now — rendered on every non-home page including `/about` (whose sidebar "Ninjaruss" logo badge was removed back when this was `/status`; both `/status` and `/stream` now 301-redirect to `/about`). `/notes/*` and `/showcase/*` paths highlight Journal via each section's `match` array.

7. **Shelf Wall**: `/shelf` is one flat dense-packed collage (not SplitViewLayout, no per-type sections) where an entry's size expresses affection — favorites large with a gold ring, written-about medium, bare logs small, nothing dimmed. See the Shelf Page Features section above for the full model.

8. **Related Content System**: Uses `collections` field in frontmatter for cross-referencing. Calculates relevance scores based on matching collections, displays up to 6 related entries in card grid at bottom of detail pages. Shows emblem thumbnail, section badge, and title.

9. **EmblemCard 3D Tilt**: Interactive mouse-tracking tilt effect with `requestAnimationFrame` for smooth performance. Max 15-degree tilt, scale 1.03 on hover. Only activates on `(hover: hover)` devices. Respects `prefers-reduced-motion`. 3D flip animation reveals Yu-Gi-Oh card backing.

10. **Date Display**: Uses `updatedAt` from frontmatter if present. `shouldShowUpdatedDate()` only renders "Last Edited" when `updatedAt > publishedAt`. `formatDate()` always uses UTC to avoid timezone drift.

11. **Content Search**: Uses `stripMarkdown()` function to remove code blocks, links, headings, formatting, raw HTML tags, and HTML entities for client-side search (prose comparisons like `a < b` are preserved — the tag regex requires a letter or `/` after `<`). Truncates to 500 chars for search index.

## Image Assets

### Shelf posters (`/public/images/media/`)
- All `.webp`, max 640px wide, quality 80 (animated WebP for the former GIFs — sharp with `{ animated: true }` preserves frames). Keep new posters in this format/budget; the directory went 15MB → 4.3MB in the 2026-07 optimization pass and page weight is the shelf's main perf lever.
- `.shelf-card` carries a diamond-watermark background (inline SVG data URI) so a card whose poster is still loading — or missing — reads as intentional, not broken.

### Logos (`/public/images/logos/`)
- `myanimelist.svg` — MyAnimeList logo for external link tile
- `spotify.svg` — Spotify logo for external link tile

### Emblems (`/public/images/emblems/`)
All placeholder emblems share the same card template (dark card, gold gradient frame, icon in the center emblem area). The set is deliberately small — four ninja-themed types plus the fallback; don't grow it per-note, pick the closest theme. Renderer gotcha baked into the set: never stroke an axis-aligned `<line>` with the gold gradient — a zero-area bbox makes `objectBoundingBox` gradients unpaintable in strict renderers; use gradient-filled `<rect>`s or non-axis-aligned paths instead.
- `default.svg` — "N" card (fallback; also the identity note)
- `scroll.svg` — Inner-work reflections (the default for most notes)
- `torii.svg` — Japan / weeb life
- `flame.svg` — Drive, goals, growth ("clear mind, burning soul")
- `shuriken.svg` — Ninjaruss identity / online presence
- Content-specific emblems stored per entry (PNGs)

### Card Assets
- `/public/images/ygo-card-backing.png` — Yu-Gi-Oh style card backing texture for EmblemCard reverse

## Adding New Content

1. Create `.md` file in appropriate `src/content/` subdirectory (shelf, notes, showcase, now)
2. Include required frontmatter matching collection schema
3. Add `emblem: '/images/emblems/your-emblem.svg'` for custom emblem (optional)
4. Use the `collections` field to cross-reference related content (enables RelatedContent component) — this is the way to relate notes to each other (e.g. the six Japan notes threaded via `collections: ["japan"]`). Notes/showcase have no `tags`; only shelf entries take a `tags` array (displayed on shelf cards/detail)
5. Set `draft: true` while working, remove for publishing
6. For shelf entries: Set `isFavorite: true` to mark the entry as a curated highlight — on `/shelf` it renders at the large wall tier with a gold ring + hard gold shadow and a `★` prefix in its title plate (see Shelf Page Features; optional, defaults to false)
7. Run `npm run build` to validate schema

### Content Type Guidelines
- **Shelf**: All reviews, consumption logs, and inspirational content (anime, manga, film, series, music, book, game, character, other)
  - Set `isFavorite: false` (or omit) for reviews/notes that appear only in /shelf
  - Set `isFavorite: true` for curated highlights — large wall tier with a gold ring + hard gold shadow on `/shelf` (see Shelf Page Features)
- **Notes**: Philosophical fragments and thoughts
- **Showcase**: Project inquiries and experiments
- **Now**: Current focus snapshots (time-based)

## Code Style Notes

- Prefer editing existing components over creating new ones
- Maintain P4G aesthetic (gold accents, bold typography, dark backgrounds)
- Use existing CSS variables rather than hardcoded values. Specifically: gold and
  live-red alpha values are `rgba(var(--color-gold-rgb), a)` / `rgba(var(--color-live-rgb), a)`
  — the raw triplets appear only in `global.css`, which defines them; near-black
  greys come from `--color-surface-1/2/3` and text greys from
  `--color-text-muted` / `--color-text-subtle`; page and panel headings use
  `--text-page-title` / `--text-panel-title`; and the five stat hexes live only
  in `STAT_COLORS` (`src/utils/sessions.ts`)
- `aria-current` is `"page"` or absent — never `"false"` (AT reads the attribute's
  presence, and `"false"` is a token, not an absence)
- Follow stagger animation pattern (50ms-100ms increments) for lists and grids
- Keep components minimal and composable
- Use `collections` field for cross-referencing content (enables RelatedContent component)
- EmblemCards should use 63:88 aspect ratio (standard card dimensions)
- Logo tiles use 48x48px SVG logos with hover effects (gold border + glow + translate)
- Respect `prefers-reduced-motion` in all animations
- Use `requestAnimationFrame` for smooth JavaScript-driven animations
- Client-side filtering should reset stagger animations on filter change
- `.media-card` has `animation: card-in ... fill-mode: both`; use `filter: opacity(N)` not `opacity: N` to dim cards — plain `opacity` is overridden by the animation after it completes. Sharper version of the same trap: `both`/`forwards` keeps outranking `:hover`/`:focus-visible` forever, not just at the moment it completes — when a fill only exists to hide an element through its stagger delay, use `backwards` instead (`.shelf-card`'s entrance)
- `border-color` on `.media-card` is dead CSS — the actual card border lives on `.media-card__poster`; target that child for border effects
