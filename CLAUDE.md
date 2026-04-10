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
│   ├── media/        # Anime, manga, films, series, characters, music, etc.
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
- **media**: adds `content_type: 'anime' | 'manga' | 'film' | 'series' | 'music' | 'book' | 'game' | 'character' | 'other'` and `isFavorite: boolean` (defaults to false)
- **notes**: uses sharedSchema without extensions
- **showcase**: uses sharedSchema without extensions
- **now**: simplified schema with `title` (defaults to 'Now'), `publishedAt` (required), `updatedAt`, `draft`

## Layouts

| Layout | Purpose |
|--------|---------|
| `BaseLayout.astro` | Foundation wrapper with meta, styles, view transitions |
| `SectionLayout.astro` | Content pages with NavPill and animated header |
| `SplitViewLayout.astro` | Three-panel list/detail/emblem interface with client-side navigation and emblem card sidebar |

## Component Inventory

### Structural
- `BentoGrid.astro` / `BentoTile.astro` — Homepage grid system with visual hierarchy
- `NavPill.astro` — Floating bottom navigation

### Bento Tile Hierarchy
The homepage uses a visual hierarchy pattern:
- **Core tiles** (`.bento-tile--core`): Main entry points (Showcase, Notes, Media) with elevated gold glow and larger typography
- **Signal tiles**: Current activity indicators (Now, Latest) - smaller, secondary visual weight
- **Favorites tile**: Gold highlight variant for curated inspirations collection (shows `isFavorite: true` entries)
- **Logo tiles** (`.logo-tile`): External service links (MyAnimeList, Spotify) with 48x48px logos and hover effects
- **YouTube tiles**: Video embeds with custom aspect ratios

Tile variants: `interactive` (default), `highlight` (gold bg), `dark`, `static`
Sizes: `dominant` (2x2), `medium-wide` (2x1), `medium-tall` (1x2), `small` (1x1)
Span classes: `.bento-tile--span-4x2`, `.bento-tile--span-3x2`, `.bento-tile--span-2x2`, `.bento-tile--span-2x1`, `.bento-tile--span-1x2`

**Current Homepage Grid Pattern:**
- Row 1: Title (4×1) + YouTube (1×1) + Now (1×1)
- Rows 2-3: Showcase (3×2, core) + Notes (2×2, core) + Favorites (1×2)
- Rows 4-5: Media (2×2, core) + Latest (2×1, row 4) + Novel (1×2) + MAL (1×1, row 4) + 2× decorative (1×1, row 5) + Spotify (1×1, row 5)

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
- `novel.css` — Novel reader UI (frosted glass two-panel navigator + reading overlay, canvas background)

### Key CSS Variables
```css
/* Colors */
--color-gold: #ffe52c;           /* Primary accent (P4G yellow) */
--color-bg-base: #111111;        /* Main background */
--color-text: #f5f5f5;           /* Primary text */

/* Shadows (gold glow effect) */
--shadow-hard: 4px 4px 0 rgba(255, 229, 44, 0.3);
--shadow-glow: 0 0 20px rgba(255, 229, 44, 0.15);

/* Animation */
--animation-easing: cubic-bezier(0.16, 1, 0.3, 1);
--animation-base: 400ms;
```

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
- `/media` — SplitViewLayout with all media (anime, manga, films, series, characters, etc.)
- `/media/[slug]` — Individual media detail pages
- `/notes` — SplitViewLayout with philosophical fragments
- `/notes/[slug]` — Individual note detail pages
- `/showcase` — SplitViewLayout with project inquiries
- `/showcase/[slug]` — Individual project detail pages
- `/favorites` — Grid layout showing media entries with `isFavorite: true`
- `/favorites/[slug]` — Centered single-column detail with prominent emblem

### Legacy Routes
- `/media` — Redirects to `/media` (301 redirect for backward compatibility)

### Novel Pages
- `/novel` — "Remember Rain" novel index (two-panel frosted glass navigator)
- `/novel/[...slug]` — Individual folder/file pages; slug encodes folder+file path (e.g. `/novel/characters/rain`)

### Utility Pages
- `/` — Homepage with BentoGrid tiles
- `/now` — Latest "Now" entry (current focus)
- `/now/archive` — Historical "Now" entries list

### Favorites Page Features
- Shows media entries where `isFavorite: true`
- Responsive grid: `auto-fill minmax(220px, 1fr)` → `minmax(160px, 1fr)` → 2 columns on mobile
- Type filter pills with client-side filtering (based on `content_type`)
- EmblemCards initially flipped to show emblems
- Staggered animations (50ms increments)
- Accessible (ARIA-pressed states)

### Favorites Detail Page Features
- Max-width: 800px centered layout
- Prominent EmblemCard at top (max 240px, centered)
- Type badge, tags, dates (Added/Updated)
- Collections footer if collections exist
- Back navigation to favorites index

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
| `src/utils/collections.ts` | `getAllCollections()`, `getSortedEntries<T>()` | Fetch all non-draft entries; sort by effective date |
| `src/utils/dates.ts` | `formatDate()`, `shouldShowUpdatedDate()` | Date formatting and update-date display logic |
| `src/utils/novel.ts` | `buildNovelTree()`, `slugify()`, `parseMetaData()` | Scrivener-backed novel content loader |
| `src/utils/splitView/` | (10 modules) | Modular SplitViewLayout client JS — see `index.ts` for entry point |

The `splitView/` directory is modular: `contentLoader`, `emblemAnimation`, `eventBindings`, `filterEngine`, `filterUI`, `idleManager`, `mediaHandlers`, `proseImageTilt`, `types`, `urlState`.

## Astro Integrations

- `@astrojs/mdx` — MDX support (`.mdx` files work in all content collections)
- `@astrojs/sitemap` — Auto-generates `/sitemap-index.xml` at build time
- Site URL: `https://ninjaruss.net` (set in `astro.config.mjs`)

## Important Implementation Details

1. **SplitViewLayout JavaScript**: Three-panel layout (list/detail/emblem) with client-side fetch for detail content, History API for navigation, search/tag filtering (Cmd/Ctrl+K to focus search), emblem card flipping on content selection, falls back gracefully without JS

2. **View Transitions**: Uses Astro's ClientRouter with custom P4G-style slide animations

3. **Draft Filtering**: All collection queries should filter `draft !== true`

4. **Accessibility**: Focus-visible gold rings, prefers-reduced-motion respected, 44px minimum touch targets

5. **Now Page**: Dynamically renders the latest entry from the `now` collection. To update, add a new markdown file to `src/content/now/` with `publishedAt` frontmatter. Archive available at `/now/archive`

6. **Latest Tile**: Homepage shows most recent content across all collections with "X days ago" indicator

7. **Favorites Page**: Shows media entries where `isFavorite: true`. Grid layout with client-side type filtering by `content_type` (anime, manga, film, series, music, book, game, character, other). Filter pills use ARIA-pressed states. Staggered animations reset on filter change. EmblemCards start flipped (showing emblem front).

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

1. Create `.md` file in appropriate `src/content/` subdirectory (media, notes, showcase, now)
2. Include required frontmatter matching collection schema
3. Add `emblem: '/images/emblems/your-emblem.svg'` for custom emblem (optional)
4. Use `collections: ['tag1', 'tag2']` field to cross-reference related content (enables RelatedContent component)
5. Set `draft: true` while working, remove for publishing
6. For media entries: Set `isFavorite: true` to show in favorites gallery (optional, defaults to false)
7. Run `npm run build` to validate schema

### Content Type Guidelines
- **Media**: All reviews, consumption logs, and inspirational content (anime, manga, film, series, music, book, game, character, other)
  - Set `isFavorite: false` (or omit) for reviews/notes that appear only in /media
  - Set `isFavorite: true` for curated highlights that appear in both /media and /favorites
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
