# Media + Favorites + Stream Tile Consolidation

**Date:** 2026-05-05
**Status:** Approved

## Goals

1. Reduce navigation clutter — two routes to the same type of content (media and favorites) feels redundant.
2. Free up a homepage tile slot — repurpose the 1×2 favorites tile for a future stream/character page.

---

## 1. `/media` Page — Grid-First with Inline Quick-View

### Layout

Replace the current SplitViewLayout with a full-width emblem card grid, matching the aesthetic of the current `/favorites` page but expanded to cover all media entries.

- **Header:** Same editorial three-part header as current favorites (section label / title / entry count).
- **Filter bar:** Two filter layers:
  - `★ favorites` pill — filters to `isFavorite: true` entries only. Visually distinct from type pills (gold-tinted, separated by a divider).
  - Type pills — `all`, `anime`, `manga`, `film`, `series`, `music`, `book`, `game`, `character`, `other`.
  - Filters stack: selecting `★ favorites` + `anime` shows only favorite anime entries.
  - Filter state persisted in URL params: `?type=anime&fav=1`.
- **Card grid:** `repeat(auto-fill, minmax(160px, 1fr))` responsive grid of EmblemCards.
  - Cards for `isFavorite: true` entries show a `★` indicator (small, top-right corner).
  - Cards start flipped to show emblem front (same as current favorites page).
  - Staggered entrance animation (50ms increments).

### Quick-View Panel

Clicking a card slides in a panel from the right (the card grid shrinks to make room — does not overlay).

Panel contents:
- EmblemCard (smaller, non-interactive)
- Type badge (with `★` if favorite)
- Title
- Tags
- Excerpt (first ~150 chars of body content, stripped of markdown)
- `open full entry →` link to `/media/[slug]`

Behaviour:
- ESC key or `✕` button closes the panel.
- URL updates to `/media?open=[slug]` when panel is open — direct link works (opens grid with panel pre-opened).
- Clicking another card swaps the panel content without closing.

### Routes and Redirects

| Route | Result |
|---|---|
| `/media` | New grid page |
| `/media/[slug]` | Existing detail page (unchanged) |
| `/favorites` | 301 redirect → `/media?fav=1` |
| `/favorites/[slug]` | 301 redirect → `/media/[slug]` |

---

## 2. Homepage Tile Changes

### Media Tile (unchanged position)

- Stays at 2×2, rows 4–5.
- Label: `Media` — description updated to reflect both logbook and favorites ("My thoughts on anime, manga, movies, and more — including favorites.")
- Tile content: recent emblem thumbnails (same as current, mix of favorites and non-favorites).
- Links to `/media`.

### Favorites Tile (removed)

- The 1×2 favorites tile in rows 2–3 is removed.
- That slot is filled by the new **KAIMA tile** (built in this session).

### KAIMA Tile (built this session)

- Position: 1×2, rows 2–3 (where favorites tile was).
- **Offline state:** Shows KAIMA name + short descriptor ("upcoming · session log"). Links to the YouTube channel (`https://www.youtube.com/@kaima-mask`) until `/stream` is built. No red styling.
- **Live state:** Red border + pulsing glow (same visual language as current live tile). A `Watch Live` button fades in to the right side **inside** the tile, linking to the live YouTube video. The tile body still links to the YouTube channel.
- The existing standalone live tile in rows 4–5 (2×1) is **removed** — the KAIMA tile absorbs both roles.
- The freed 2×1 slot at the bottom can be repurposed later.
- When `/stream` is eventually built, update the tile's `href` from the YouTube channel to `/stream`.

#### Live detection

Reuse the existing `checkYouTubeLive()` polling logic from `index.astro`. The KAIMA tile subscribes to the same interval — no second API call needed.

---

## 3. What Is Not Changing

- `/media/[slug]` detail pages — untouched.
- `/notes`, `/showcase`, `/novel`, `/now` — untouched.
- The `isFavorite` field on media entries — still used, just surfaced as a filter rather than a separate page.
- The `collections` cross-referencing and `RelatedContent` component — untouched.
- The `EmblemCard` component — reused as-is.

---

## 4. Files Affected (estimated)

| File | Change |
|---|---|
| `src/pages/media/index.astro` | Full rewrite — SplitViewLayout → grid + quick-view |
| `src/pages/favorites.astro` | Delete — replaced by redirect |
| `src/pages/favorites/[...slug].astro` | Delete — replaced by redirect |
| `src/pages/index.astro` | Remove favorites tile, update media tile description, add KAIMA tile placeholder |
| `astro.config.mjs` | Add 301 redirects for `/favorites` and `/favorites/[slug]` |
| `src/styles/` | Quick-view panel styles (new), filter bar updates |

---

## 5. Out of Scope (this session)

- The `/stream` character sheet page itself (the KAIMA tile links to YouTube as a fallback until it exists).
- Stream schedule or session log data model.
- Any changes to `/media/[slug]` detail page layout.
