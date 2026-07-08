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
│   ├── novel/        # "Remember Rain" novel (Scrivener export — Characters, Locations, Lore, Scenes, Themes)
│   ├── now/          # "Now" page snapshots (current focus)
│   └── showcase/     # Projects as inquiries
├── layouts/          # Page layout templates
├── pages/            # File-based routing
├── styles/           # Global CSS (no frameworks)
├── tests/            # Vitest unit tests (novel.test.ts)
└── utils/            # Shared utilities (content, collections, dates, novel, splitView/)
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
| `SectionLayout.astro` | Content pages with NavPill and animated P4G header (still unused by routes; the unified section header now lives in `SplitViewLayout`) |
| `SplitViewLayout.astro` | Three-panel list/detail/emblem interface with client-side navigation and emblem card sidebar. Optional `kicker` prop; renders the unified P4G section header (`p4g-tab` + `p4g-heading` + `p4g-underline`) — the same header pattern is replicated on the Now, Now-archive, and Novel pages |

## Component Inventory

### Structural
- `BentoGrid.astro` / `BentoTile.astro` — Homepage grid system with visual hierarchy
- `NavPill.astro` — Fixed bottom-left P4G angled nav bar (`.nav-bar`, corner-cut clip-path, hard gold shadow via `drop-shadow` wrapper). Links Home/Showcase/Notes/Shelf/Now with solid-gold active-page highlight (`.nav-bar__item--active` + `aria-current="page"`); optional `backLink`/`backLabel` props append a back link. Hidden on the homepage. (No longer the centered floating Home pill.)

### Bento Tile Hierarchy
The homepage uses a visual hierarchy pattern:
- **Core tiles** (`.bento-tile--core`): Main entry points (Showcase, Notes, Shelf) with elevated gold glow and larger typography
- **Signal tiles**: Current activity indicators (Now, Latest) - smaller, secondary visual weight
- **Stream tile**: Dark 1×2 tile linking to `/stream`; shows live stat donut chart with leading stat emblem and session count. Pulsing red border (`--color-live`) when live.
- **Logo tiles** (`.logo-tile`): External service links (MyAnimeList, Spotify) with 48x48px logos and hover effects
- **YouTube tile**: Full-bleed channel avatar; switches to Twitch live preview when streaming

Tile variants: `interactive` (default), `highlight` (gold bg), `dark`, `static`
Sizes: `dominant` (2x2), `medium-wide` (2x1), `medium-tall` (1x2), `small` (1x1)

**Hover signature**: the corner-cut triangle (`.bento-tile__corner` — gold triangle slides into the top-right on hover/focus) is the single hover signature for every interactive bento tile. Gold-background (`highlight`) tiles use a black triangle for contrast; `static` tiles hide it. Shelf cards have a matching `.shelf-card__corner`. BentoTile has no `accent` prop — the old `.bento-tile--accent` dot, corner-bracket `::after` decorations, and `.bento-tile--cyan` variant were all removed.
Span classes: `.bento-tile--span-4x2`, `.bento-tile--span-3x2`, `.bento-tile--span-2x2`, `.bento-tile--span-2x1`, `.bento-tile--span-1x2`

**Current Homepage Grid Pattern:**
- Row 1: Title (4×1) + YouTube (1×1) + Now (1×1)
- Rows 2-3: Showcase (3×2, core) + Notes (2×2, core) + Stream (1×2)
- Rows 4-5: Shelf (2×2, core) + Latest (2×1, row 4) + Novel (1×2) + MAL (1×1, row 4) + Spotify (1×1, row 5) + back-to-top tile (1×1, row 5)

Note: Title grid placement is controlled by scoped CSS in `index.astro` (`.title-tile { grid-column: span 4 }`), not a span class.

### List/Detail
- `ListItem.astro` — Left panel items in SplitViewLayout
- `EntryCard.astro` — Card component for listings
- `EntryHeader.astro` — Entry title, tags, dates, emblem trigger (`data-page-emblem` attr signals SplitView to flip card)
- `EntryBody.astro` — Wraps entry prose in `.entry__content.prose`; renders nothing if `hasContent` is false

### Content
- `TagList.astro` — Tag pills display
- `DateDisplay.astro` — Published/updated date display with optional size variants
- `EmblemCard.astro` — 3D flippable card component with mouse-tracking tilt effect (Yu-Gi-Oh card backing style, aspect ratio 63:88)
- `MediaLightbox.astro` — Fullscreen media popup
- `ImageGallery.astro` — Thumbnail gallery with sticky positioning on desktop, staggered animations
- `RelatedContent.astro` — Cross-referenced entries via collections field, relevance-scored card grid (max 6 items)

## Design System

### CSS Files
- `global.css` — Design tokens, colors, spacing, shadows
- `typography.css` — Fonts (Archivo Black, Inter, JetBrains Mono), type scale
- `bento.css` — Grid system and tile variants
- `transitions.css` — P4G-style animations and view transitions
- `novel.css` — Novel reader UI (frosted glass two-panel navigator, canvas background)

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

### Animation Classes
- `.p3r-animate` — Standard entrance (translateY + fade)
- `.p3r-animate-left` — Left entrance
- `.p3r-animate-scale` — Scale entrance
- Use `--stagger-delay` for sequencing

## Responsive Breakpoints

- `480px` — Mobile
- `768px` — Tablet
- `900px` — SplitView collapse point
- `1024px` — Small desktop
- `1200px` — Desktop

## Pages & Routes

### Content Collection Pages
- `/shelf` — Full-width emblem card grid grouped by content type, with a sticky jump bar (section anchor links) and inline quick-view panel. Progressive enhancement: cards link to `/shelf/[slug]` without JS; JS intercepts clicks to push `/shelf/[slug]` into history and open the panel instead (`?open=slug` supported for legacy links only).
- `/shelf/[slug]` — Individual shelf detail pages
- `/notes` — SplitViewLayout with philosophical fragments
- `/notes/[slug]` — Individual note detail pages
- `/showcase` — SplitViewLayout with project inquiries
- `/showcase/[slug]` — Individual project detail pages

### Legacy Routes (301 Redirects)
- `/favorites` → redirects to `/shelf?fav=1`
- `/favorites/[slug]` → redirects to `/shelf/[slug]`
- `/media` → redirects to `/shelf` (via `astro.config.mjs` redirects)
- `/media/[...slug]` → redirects to `/shelf/[...slug]`

### Novel Pages
- `/novel` — "Remember Rain" novel index (two-panel frosted glass navigator)
- `/novel/[...slug]` — Individual folder/file pages; slug encodes folder+file path (e.g. `/novel/characters/rain`)

### Utility Pages
- `/` — Homepage with BentoGrid tiles
- `/now` — Latest "Now" entry (current focus)
- `/now/archive` — Historical "Now" entries list

### Shelf Page Features (`/shelf`)
- Entries are grouped by `content_type` into sections (anime, manga, film, series, music, book, game, character, other), each rendered server-side with a `shelf-section` header and `shelf-grid` of cards.
- **Jump bar** (`.shelf-jumpbar`): sticky (`position: sticky; top: 0`) row of section anchor links (`#section-[type]`) below the page header. Active section gets a gold underline (`.is-active` / `[aria-current="true"]`, 3px gold `border-bottom`), tracked via scroll position in client JS.
- **Character section**: renders an additional `shelf-hero` carousel (prev/next through character entries) above the character `shelf-grid`.
- **Quick-view panel**: clicking a `.shelf-card` intercepts navigation, pushes `/shelf/[slug]` into history, and slides in a panel from the right. Panel shows emblem, type, title, tags, excerpt, and link to full entry. ESC/✕/backdrop-click closes. `?open=[slug]` query param still opens the panel on load for legacy links, but is not written by current interactions.
- Cards are `<a>` tags linking to `/shelf/[slug]` (works without JS) — the standalone detail page itself redirects (`window.location.replace`) back to `/shelf?open=slug` when JS is available, so the quick-view panel is the JS-enabled experience.
- Entry data pre-rendered as JSON in `data-entries` attribute — no client fetch needed.
- **Content indicator**: favorites get a gold star badge (`.shelf-card__bar--fav`, `.shelf-card__star`) and gold title (`.shelf-card__title--fav`); entries that are neither a favorite nor have written content dim via `.shelf-card--dim` (`filter: opacity(0.52)`, not `opacity` — see Code Style Notes).
- No client-side type/favorites filter pills exist on this page (the `★ favorites` filter and `?type=/&fav=` URL params described elsewhere in this doc were removed; `src/utils/mediaGrid/filterEngine.ts` no longer exists). The `/favorites` route still 301-redirects to `/shelf?fav=1`, which is now a no-op query param.

## Novel System ("Remember Rain")

The `/novel` route serves a standalone in-progress novel with its own UI, separate from content collections.

- **Content location**: `src/content/novel/` — Scrivener export structure with top-level folders (`Characters`, `Locations`, `Lore`, `Scenes`, `Themes`). Each `.md` file may have a sidecar `<Title> MetaData.txt` with Scrivener-format `Created:` / `Modified:` dates.
- **Build utility**: `src/utils/novel.ts` — `buildNovelTree()` reads the directory at build time and returns a `NovelTree` (recursive `NovelFolder`/`NovelFile` types). Files are slugified and markdown is pre-rendered to HTML via `marked`.
- **Routing**: `src/pages/novel/[...slug].astro` uses `getStaticPaths()` to enumerate all folder + file paths. The rest param slug encodes the full path (e.g. `lore/magic-system/overview`).
- **UI**: Frosted glass two-panel layout (`novel.css`) with an animated canvas background. No SplitViewLayout — entirely custom.
- **Testing**: `src/tests/novel.test.ts` covers `slugify`, `parseMetaData`, and `buildNovelTree` via vitest.
- **Adding content**: Drop `.md` files into the appropriate `src/content/novel/` subfolder. Scrivener MetaData.txt sidecars are auto-read if present; other `.txt` files are silently skipped.

## Utility Modules

| File | Exports | Purpose |
|------|---------|---------|
| `src/utils/content.ts` | `stripMarkdown()`, `hasMinimalContent()` | Strip markdown for client-side search; detect empty entries |
| `src/utils/collections.ts` | `getAllCollections()` → `{ allShelf, allNotes, allShowcase }`; `getSortedEntries<T>()` | Fetch all non-draft entries; `SectionName = 'shelf' \| 'notes' \| 'showcase'` |
| `src/utils/dates.ts` | `formatDate()`, `shouldShowUpdatedDate()` | Date formatting and update-date display logic |
| `src/utils/novel.ts` | `buildNovelTree()`, `slugify()`, `parseMetaData()` | Scrivener-backed novel content loader |
| `src/utils/splitView/` | (10 modules) | Modular SplitViewLayout client JS — see `index.ts` for entry point |

The `splitView/` directory is modular: `contentLoader`, `emblemAnimation`, `eventBindings`, `filterEngine`, `filterUI`, `idleManager`, `mediaHandlers`, `proseImageTilt`, `types`, `urlState`.

## Astro Integrations

- `@astrojs/mdx` — MDX support (`.mdx` files work in all content collections)
- `@astrojs/sitemap` — Auto-generates `/sitemap-index.xml` at build time
- Site URL: `https://ninjaruss.net` (set in `astro.config.mjs`)

## Important Implementation Details

1. **SplitViewLayout JavaScript**: Three-panel layout (list/detail/emblem) with client-side fetch for detail content, History API for navigation, search/tag filtering (Cmd/Ctrl+K to focus search), emblem card flipping on content selection, falls back gracefully without JS. On load with no slug in the URL, auto-opens the newest visible entry — desktop layout only (detected via the applied grid columns, not viewport width) and without pushing history or moving focus (`src/utils/splitView/index.ts`; `loadContent` accepts `{ pushHistory, focusHeading }` options)

2. **View Transitions**: Uses Astro's ClientRouter with custom P4G-style slide animations

3. **Draft Filtering**: All collection queries should filter `draft !== true`

4. **Accessibility**: Focus-visible gold rings, prefers-reduced-motion respected, 44px minimum touch targets

5. **Now Page**: Dynamically renders the latest entry from the `now` collection. To update, add a new markdown file to `src/content/now/` with `publishedAt` frontmatter. Archive available at `/now/archive`

6. **Latest Tile**: Homepage shows most recent content across all collections with "X days ago" indicator

7. **Shelf Page Grid**: `/shelf` is a full emblem card grid grouped by content type (not SplitViewLayout), with a sticky jump bar for section navigation. `isFavorite: true` entries get a gold star badge and gold title on their card (no separate favorites filter exists anymore). Quick-view panel opens on card click without navigating away, pushing `/shelf/[slug]` into history. Cards that are neither a favorite nor have written content dim with `.shelf-card--dim` (`filter: opacity(0.52)`, not `opacity` — see Code Style Notes).

8. **Related Content System**: Uses `collections` field in frontmatter for cross-referencing. Calculates relevance scores based on matching collections, displays up to 6 related entries in card grid at bottom of detail pages. Shows emblem thumbnail, section badge, and title.

9. **EmblemCard 3D Tilt**: Interactive mouse-tracking tilt effect with `requestAnimationFrame` for smooth performance. Max 15-degree tilt, scale 1.03 on hover. Only activates on `(hover: hover)` devices. Respects `prefers-reduced-motion`. 3D flip animation reveals Yu-Gi-Oh card backing.

10. **Date Display**: Uses `updatedAt` from frontmatter if present. `shouldShowUpdatedDate()` only renders "Last Edited" when `updatedAt > publishedAt`. `formatDate()` always uses UTC to avoid timezone drift.

11. **Content Search**: Uses `stripMarkdown()` function to remove code blocks, links, headings, and formatting for client-side search. Truncates to 500 chars for search index.

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
