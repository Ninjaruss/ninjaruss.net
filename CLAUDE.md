# CLAUDE.md

This file provides guidance for Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

**ninjaruss.net** is a personal website built with Astro 5, featuring a Persona 4 Golden-inspired dark UI aesthetic. It's a static site for fragments, reflections, and experiments—organized around philosophical notes, media consumption logs, curated music collections, and inquiry-driven projects.

## Build & Development Commands

```bash
npm run dev       # Start dev server at localhost:3001
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
│   ├── media/        # Anime, manga, film notes
│   ├── music/        # Curated song collections
│   ├── notes/        # Philosophical fragments
│   └── experiments/  # Projects as inquiries
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

All collections share a base schema:
- `title` (required string)
- `emotional_tags` (string array)
- `collections` (string array for cross-referencing)
- `status`: `'confident' | 'conflicted' | 'unresolved'`
- `thumbnails`: `{ src, alt? }[]`
- `draft` (boolean, filters from production)

Collection-specific extensions:
- **media**: adds `media_type: 'anime' | 'manga' | 'film'`
- **music**: adds `mood`, `tracks: { title, artist, link? }[]`
- **experiments**: adds `question`, `approach`, `surprise`, `unresolved`

## Layouts

| Layout | Purpose |
|--------|---------|
| `BaseLayout.astro` | Foundation wrapper with meta, styles, view transitions |
| `SectionLayout.astro` | Content pages with NavPill and animated header |
| `SplitViewLayout.astro` | Two-panel list/detail interface with client-side navigation |

## Component Inventory

### Structural
- `BentoGrid.astro` / `BentoTile.astro` — Homepage grid system
- `NavPill.astro` — Floating bottom navigation

### List/Detail
- `ListItem.astro` — Left panel items in SplitViewLayout
- `EntryCard.astro` — Card component for listings

### Content
- `StatusBadge.astro` — Status indicator (confident/conflicted/unresolved)
- `TagList.astro` — Emotional tag pills
- `ImageGallery.astro` — Sticky sidebar image gallery
- `ThumbnailGallery.astro` — Thumbnail display (new, unintegrated)

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
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
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

## Important Implementation Details

1. **SplitViewLayout JavaScript**: Client-side fetch for detail content, History API for navigation, falls back gracefully without JS

2. **View Transitions**: Uses Astro's ClientRouter with custom P4G-style slide animations

3. **Draft Filtering**: All collection queries should filter `draft !== true`

4. **Status Colors** (WCAG AA compliant):
   - Confident: `#16a34a` (dark green)
   - Conflicted: `#fbbf24` (amber)
   - Unresolved: `#6b7280` (gray)

5. **Accessibility**: Focus-visible gold rings, prefers-reduced-motion respected, 44px minimum touch targets

## Adding New Content

1. Create `.md` file in appropriate `src/content/` subdirectory
2. Include required frontmatter matching collection schema
3. Set `draft: true` while working, remove for publishing
4. Run `npm run build` to validate schema

## Code Style Notes

- Prefer editing existing components over creating new ones
- Maintain P4G aesthetic (gold accents, bold typography, dark backgrounds)
- Use existing CSS variables rather than hardcoded values
- Follow stagger animation pattern (50ms increments) for lists
- Keep components minimal and composable
