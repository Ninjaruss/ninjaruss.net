# Media Page Overhaul — Design Spec

**Date:** 2026-05-11  
**Status:** Approved

---

## Problem

The current `/media` page has a design conflict: clicking a card opens a side panel with a "View full entry →" link that navigates to a separate page. This creates an awkward two-tier UX — the quick-view is too shallow to be useful, but the link takes you away from the browsing context. The card grid also uses the EmblemCard (Yu-Gi-Oh card frame) component which feels mismatched for a media logbook. The homepage media tile also needs to be updated to match the new aesthetic.

---

## Architecture

### `/media` page (list)

- Poster card grid + underline tab filter bar
- Clicking a card opens a **fullscreen overlay** with the complete entry (no navigation)
- URL updates to `?open=[slug]` when overlay is open — shareable and bookmarkable
- Page load with `?open=[slug]` pre-opens the overlay
- No-JS fallback: cards are `<a>` links to `/media/[slug]`; JS intercepts clicks to open overlay instead

### `/media/[slug]` pages (detail)

- Kept as static pages for SEO and direct linking
- Styled to match the overlay layout (cinematic split)
- No longer the primary UX path — the overlay is

---

## Components & Layout

### 1. Poster Card Grid

- **Card shape:** 2:3 aspect ratio (standard poster/film proportion)
- **Image:** Entry's `emblem` field fills the card via `object-fit: cover`. JPG/GIF emblems render cinematically; SVG emblems render as abstract art — both work.
- **Overlay:** Bottom gradient with type label (small, muted mono) above title (small, white mono)
- **Favorite indicator:** ★ gold, positioned top-right
- **Hover state:** Brightness lift + gold border glow
- **Grid:** `repeat(auto-fill, minmax(140px, 1fr))` — denser than current 160px to suit taller poster shape
- **Entrance animation:** Existing stagger (`card-in` keyframe, `--card-index * 50ms` delay). Re-triggers on filter change.

### 2. Filter Bar

Replaces the current pill row with a single **horizontally-scrollable underline tab bar**:

- ★ (favorites toggle) on the far left, separated by a right border from the type tabs
- Type tabs: `All · Anime · Manga · Film · Series · Music · Book · Game · Character · Other`
- Active tab: gold underline (`border-bottom: 2px solid var(--color-gold)`) + gold text
- Inactive: muted text, no underline
- Scrolls horizontally on mobile — no wrapping, no overflow
- State persisted in URL (`?type=anime&fav=1`) — same as current

### 3. Fullscreen Overlay

Covers the full viewport. Opens on card click, closes on ✕ button, ESC key, or backdrop click.

**Layout (desktop):**

```
┌──────────────────────────────────────────────────┐
│  [poster image — full height, ~320px wide]  │  ✕  │
│                                             │──── │
│                                             │type │
│                                             │     │
│                                             │TITLE│
│                                             │tags │
│                                             │     │
│                                             │prose│
│                                             │ ... │
│                                             │     │
│                                             │rel. │
└──────────────────────────────────────────────────┘
```

- **Left panel:** Entry `emblem` image, `object-fit: cover`, full panel height, fixed (doesn't scroll)
- **Right panel:** Scrollable. Contains:
  - Type label (mono, muted, uppercase)
  - Title (large, gold, font-weight 900)
  - Tags (pill row)
  - Full rendered markdown prose
  - Full rendered markdown prose + related content (fetched from `/media/[slug]` on open, extracted from `.entry__content`)
- **Background:** `rgba(8, 8, 8, 0.96)` — near-opaque, blurs the grid behind
- **Open animation:** fade-in + `translateY(12px → 0)`, 350ms, `var(--animation-easing)`
- **Respects `prefers-reduced-motion`:** no transform animation if reduced motion

**Layout (mobile, `< 768px`):**

- Single column
- Poster becomes a full-width banner image at top (`aspect-ratio: 16/9`)
- Content scrolls below

### 4. NavPill

- Added to the `/media` page — Home ◆ button only (`<NavPill />` with no `backLink`)
- Remains visible while the overlay is open (overlay sits above the grid, NavPill floats above the overlay via z-index)

### 5. Homepage Media Tile (2×2 BentoTile)

Replaces the current emblem grid with a **header + poster strip** layout:

- **Top section:** "Media" label (mono, muted, uppercase) + "Logbook" title (bold, large)
- **Middle:** Horizontal strip of 4 tall poster thumbnails (`aspect-ratio: 2/3`), pulled from the 4 most recently updated media entries
- **Bottom:** Entry count only (e.g. "29 entries") — no CTA, no "View all →"
- Entire tile is a link to `/media`
- CRT scan-line background texture kept (existing `.media-tile` style)

---

## Data & Schema

- No schema changes required
- `emblem` field is the poster image source (already set per entry)
- Overlay content is fetched client-side from the pre-rendered JSON in `data-entries` (same as current approach) — no new API needed
- For prose + related content: the overlay fetches `/media/[slug]` on open and extracts `.entry__content` innerHTML. This gives prose and the pre-rendered `RelatedContent` component for free, with no build-time payload cost. A loading state is shown while the fetch resolves.

---

## File Changes

| File | Change |
|------|--------|
| `src/pages/media/index.astro` | Full rewrite — poster grid, underline tabs, overlay, NavPill |
| `src/pages/index.astro` | Update media tile to header + poster strip layout |
| `src/pages/media/[slug].astro` | Restyle to match overlay layout (cinematic split) |

No new components required. The overlay is built as inline JS/CSS in `media/index.astro`.

---

## Accessibility

- Overlay traps focus when open (`aria-modal`, focus ring on ✕)
- ESC closes overlay
- Cards have `aria-label` set to title
- ★ indicators have `aria-label="Favorite"`
- Tab bar buttons use `aria-pressed` (same as current pills)
- `prefers-reduced-motion` respected for all animations
- 44px minimum touch targets for ✕ and tab bar items

---

## What's Not Changing

- URL state strategy (`?type=`, `?fav=`, `?open=`) — same params, same logic
- Filter engine (`src/utils/mediaGrid/filterEngine.ts`) — no changes
- Entry schema — no new fields
- `/media/[slug]` pages — kept, restyled only
