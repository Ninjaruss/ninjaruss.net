# CLAUDE.md

This file provides guidance for Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

**ninjaruss.net** is a personal website built with Astro 5, featuring a Persona 4 Golden-inspired dark UI aesthetic. It's a static site for fragments, reflections, and experiments—organized around philosophical notes, reflections consumption logs, and inquiry-driven projects.

## Build & Development Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build static site to ./dist/
npm run preview   # Preview production build locally
npm run astro     # Direct Astro CLI access
```

## Architecture

### Directory Structure

```
src/
├── components/       # Reusable Astro components
├── content/          # Content collections (Markdown)
│   ├── config.ts     # Zod schema definitions
│   ├── reflections/  # Anime, manga, film notes
│   ├── notes/        # Philosophical fragments
│   ├── now/          # "Now" page snapshots (current focus)
│   ├── favorites/    # Inspirational content (characters, media, etc.)
│   └── showcase/     # Projects as inquiries
├── layouts/          # Page layout templates
├── pages/            # File-based routing
└── styles/           # Global CSS (no frameworks)
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

Collection-specific extensions:
- **reflections**: adds `reflections_type: 'anime' | 'manga' | 'film'`
- **favorites**: adds `favorites_type: 'anime' | 'manga' | 'film' | 'music' | 'book' | 'game' | 'character' | 'other'`
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
- **Core tiles** (`.bento-tile--core`): Main entry points (Showcase, Notes, Reflections) with elevated gold glow and larger typography
- **Signal tiles**: Current activity indicators (Now, Latest) - smaller, secondary visual weight
- **Favorites tile**: Gold highlight variant for inspirations collection
- **Logo tiles** (`.logo-tile`): External service links (MyAnimeList, Spotify) with 48x48px logos and hover effects
- **YouTube tiles**: Video embeds with custom aspect ratios

Tile variants: `interactive` (default), `highlight` (gold bg), `dark`, `static`
Sizes: `dominant` (2x2), `medium-wide` (2x1), `medium-tall` (1x2), `small` (1x1)
Span classes: `.bento-tile--span-3x2`, `.bento-tile--span-2x2`, `.bento-tile--span-2x1`

**Current Homepage Grid Pattern:**
- Rows 1-2: Title (3×2) + YouTube Hero #1 (3×2)
- Rows 3-4: Showcase (3×2, core) + Notes (3×2, core)
- Rows 5-6: Reflections (2×2, core) + Latest (2×1) + Now (2×1)
- Row 7: Favorites (1×1, highlight) + MAL Logo (1×1) + Spotify Logo (1×1)
- Rows 8-9: YouTube Hero #2 (3×2)

### List/Detail
- `ListItem.astro` — Left panel items in SplitViewLayout
- `EntryCard.astro` — Card component for listings

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
- `/reflections` — SplitViewLayout with anime/manga/film reviews
- `/reflections/[slug]` — Individual reflection detail pages
- `/notes` — SplitViewLayout with philosophical fragments
- `/notes/[slug]` — Individual note detail pages
- `/showcase` — SplitViewLayout with project inquiries
- `/showcase/[slug]` — Individual project detail pages
- `/favorites` — Grid layout with type-filtered inspirations (NEW)
- `/favorites/[slug]` — Centered single-column detail with prominent emblem (NEW)

### Utility Pages
- `/` — Homepage with BentoGrid tiles
- `/now` — Latest "Now" entry (current focus)
- `/now/archive` — Historical "Now" entries list (NEW)

### Favorites Page Features
- Responsive grid: `auto-fill minmax(220px, 1fr)` → `minmax(160px, 1fr)` → 2 columns on mobile
- Type filter pills with client-side filtering
- EmblemCards initially flipped to show emblems
- Staggered animations (100ms increments)
- Accessible (ARIA-pressed states)

### Favorites Detail Page Features
- Max-width: 800px centered layout
- Prominent EmblemCard at top (max 240px, centered)
- Type badge, tags, dates (Added/Updated)
- Collections footer if collections exist
- Back navigation to favorites index

## Important Implementation Details

1. **SplitViewLayout JavaScript**: Three-panel layout (list/detail/emblem) with client-side fetch for detail content, History API for navigation, search/tag filtering (Cmd/Ctrl+K to focus search), emblem card flipping on content selection, falls back gracefully without JS

2. **View Transitions**: Uses Astro's ClientRouter with custom P4G-style slide animations

3. **Draft Filtering**: All collection queries should filter `draft !== true`

4. **Accessibility**: Focus-visible gold rings, prefers-reduced-motion respected, 44px minimum touch targets

5. **Now Page**: Dynamically renders the latest entry from the `now` collection. To update, add a new markdown file to `src/content/now/` with `publishedAt` frontmatter. Archive available at `/now/archive`

6. **Latest Tile**: Homepage shows most recent content across all collections with "X days ago" indicator

7. **Favorites Page**: Grid layout with client-side type filtering (anime, manga, film, music, book, game, character, other). Filter pills use ARIA-pressed states. Staggered animations reset on filter change. EmblemCards start flipped (showing emblem front).

8. **Related Content System**: Uses `collections` field in frontmatter for cross-referencing. Calculates relevance scores based on matching collections, displays up to 6 related entries in card grid at bottom of detail pages. Shows emblem thumbnail, section badge, and title.

9. **EmblemCard 3D Tilt**: Interactive mouse-tracking tilt effect with `requestAnimationFrame` for smooth performance. Max 15-degree tilt, scale 1.03 on hover. Only activates on `(hover: hover)` devices. Respects `prefers-reduced-motion`. 3D flip animation reveals Yu-Gi-Oh card backing.

10. **Hybrid Date System**: Uses manual `updatedAt` from frontmatter if present, falls back to file modification time (mtime) if not set. Shows "Last Edited" only if different from `publishedAt`.

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

1. Create `.md` file in appropriate `src/content/` subdirectory (reflections, notes, showcase, favorites, now)
2. Include required frontmatter matching collection schema
3. Add `emblem: '/images/emblems/your-emblem.svg'` for custom emblem (optional)
4. Use `collections: ['tag1', 'tag2']` field to cross-reference related content (enables RelatedContent component)
5. Set `draft: true` while working, remove for publishing
6. Run `npm run build` to validate schema

### Content Type Guidelines
- **Reflections**: Reviews and consumption logs (anime, manga, film)
- **Favorites**: Inspirational content and personal favorites (anime, manga, film, music, book, game, character, other)
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
