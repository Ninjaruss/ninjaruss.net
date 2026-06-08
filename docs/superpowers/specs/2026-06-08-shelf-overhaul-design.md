# Shelf Overhaul + Decorative Elements Design

**Date:** 2026-06-08
**Status:** Approved

## Overview

Five related changes inspired by the Persona 4 Reload website aesthetic:

1. **Shelf page overhaul** — grouped sections by content type, P4R-style cards, sticky jump-bar, slide-in panel, character hero carousel
2. **Diagonal section dividers** — angled cuts between shelf sections and homepage BentoGrid row groups
3. **Shimmer headers** — slow gold shimmer sweep on shelf section headers and homepage title tile
4. **Stream tile CRT glow** — faint inset box-shadow warmth replacing scanlines/noise
5. **Favorites sorting** — favorites surface first within each section

---

## 1. Shelf Page Overhaul (`src/pages/shelf/index.astro`)

### Page Structure

```
<BaseLayout>
  <div id="entry-data" hidden>   ← JSON for JS (same as now)

  <div class="shelf-page">
    <header class="shelf-header">
      <span class="shelf-header__eyebrow">catalog</span>
      <h1 class="shelf-header__title">Shelf</h1>
      <p class="shelf-header__count">N entries</p>
    </header>

    <nav class="shelf-jumpbar" aria-label="Jump to section">
      <a href="#section-anime">Anime</a>
      <a href="#section-manga">Manga</a>
      ... (one per type that has entries)
    </nav>

    <!-- One <section> per content_type that has ≥1 entry -->
    <section id="section-anime" class="shelf-section">
      <header class="shelf-section__header">
        <h2>Anime</h2>
        <div class="shelf-section__line"></div>
        <span class="shelf-section__count">N</span>
      </header>
      <div class="shelf-grid">...</div>
    </section>

    <div class="shelf-divider"></div>
    <div class="shelf-divider shelf-divider--flip"></div>  ← alternates

    <!-- CHARACTER SECTION ONLY: hero carousel before grid -->
    <section id="section-character" class="shelf-section">
      <header class="shelf-section__header">...</header>
      <div class="shelf-hero" data-characters="[...]">
        <button class="shelf-hero__prev">‹</button>
        <div class="shelf-hero__portrait"><img /></div>
        <div class="shelf-hero__info">
          <p class="shelf-hero__eyebrow">character · 1 / N</p>
          <h3 class="shelf-hero__name"></h3>
          <div class="shelf-hero__tags"></div>
          <p class="shelf-hero__excerpt"></p>
          <a class="shelf-hero__link">Read more →</a>
        </div>
        <button class="shelf-hero__next">›</button>
      </div>
      <div class="shelf-grid">...</div>
    </section>
  </div>

  <!-- Fixed slide-in panel -->
  <div class="shelf-backdrop" hidden></div>
  <aside class="shelf-panel" hidden>
    <button class="shelf-panel__close">✕</button>
    <div class="shelf-panel__poster"><img /></div>
    <div class="shelf-panel__content">
      <p class="shelf-panel__type"></p>
      <h2 class="shelf-panel__title"></h2>
      <div class="shelf-panel__tags"></div>
      <p class="shelf-panel__date"></p>
      <div class="shelf-panel__prose">Loading…</div>
      <a class="shelf-panel__link">Open full entry →</a>
    </div>
  </aside>

  <NavPill />
</BaseLayout>
```

### Section Ordering

Types rendered in this fixed order (omit if empty):
`anime → manga → film → series → music → book → game → character → other`

### Entry Sorting Within Each Section

Within each section, entries are sorted in three tiers:

1. `isFavorite: true` — sorted by `updatedAt ?? publishedAt` descending
2. `isFavorite: false` AND `hasContent: true` — sorted by `updatedAt ?? publishedAt` descending
3. `isFavorite: false` AND `hasContent: false` — sorted by `updatedAt ?? publishedAt` descending, rendered at `filter: opacity(0.52)`

---

## 2. Card Design (`.shelf-card`)

Replaces existing `.media-card`. The gradient overlay is removed; a discrete solid bar sits at the bottom.

```
.shelf-card                        ← <a> tag, position: relative
├── .shelf-card__poster            ← aspect-ratio: 2/3, overflow: hidden
│   └── img.shelf-card__img       ← object-fit: cover
└── .shelf-card__bar               ← solid strip, ~28px
    ├── .shelf-card__title         ← mono, truncated
    └── .shelf-card__star          ← ★ (isFavorite only, right-aligned)
```

**Styling rules:**
- `.shelf-card__bar`: `background: #0d0d0d`, `border-top: 1px solid #252525`
- Favorite variant: title `color: var(--color-gold)`, bar `border-top-color: rgba(255,229,44,0.35)`
- No-content variant: whole card `filter: opacity(0.52)` (same `fill-mode: both` animation caveat as before — use `filter` not `opacity`)
- Hover: `border-color: var(--color-gold)` on `.shelf-card__poster`, gold `box-shadow`
- Entrance: same `card-in` keyframe, `--card-index` resets to 0 at the start of each section

**Grid:** `display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: var(--space-md)`

---

## 3. Sticky Jump-Bar (`.shelf-jumpbar`)

- `position: sticky; top: 0; z-index: 50`
- Contains anchor links for each rendered section type only
- Active state: the section currently in view gets `color: var(--color-gold)` and `border-bottom: 2px solid var(--color-gold)` via Intersection Observer
- Scrolls horizontally on mobile (`overflow-x: auto; scrollbar-width: none`)
- **No favorites toggle** — favorites are visually indicated on cards only
- Background: `var(--color-bg-base)` with a faint bottom border

---

## 4. Character Section Hero (`.shelf-hero`)

Carousel cycling through all character entries (sorted by `updatedAt ?? publishedAt` desc).

**Layout:**
- `display: grid; grid-template-columns: 200px 1fr` on desktop
- `background: var(--color-bg-elevated)` with diagonal stripe texture (`repeating-linear-gradient(-45deg, ...)` at low opacity)
- `border-left: 4px solid var(--color-gold)`
- Portrait has `box-shadow: var(--shadow-hard)`
- On mobile: `grid-template-columns: 1fr`, portrait stacks above info

**Carousel behavior:**
- All character data pre-serialized as JSON in `data-characters` on `.shelf-hero`. Fields per entry: `{ slug, title, emblem, tags, excerpt, publishedAt }` where `excerpt` is the first 120 chars of `entry.body` with markdown stripped via `stripMarkdown()` from `src/utils/content.ts`
- Auto-advances every 5000ms via `setInterval`
- `mouseenter` clears interval, `mouseleave` restarts (skipped if `prefers-reduced-motion`)
- On change: portrait `opacity` crossfades (300ms), name/excerpt does `translateX(-8px) → 0` slide-in
- Eyebrow updates to `character · N / total`
- Clicking the hero navigates to `/shelf/[slug]` — arrow buttons call `e.stopPropagation()`
- Prev/next arrows: `rgba(255,255,255,0.12)` background, `color: var(--color-gold)` on hover

---

## 5. Slide-In Panel (`.shelf-panel` + `.shelf-backdrop`)

**Approach A: Fixed overlay from right edge.**

- `.shelf-backdrop`: `position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 90`
- `.shelf-panel`: `position: fixed; top: 0; right: 0; bottom: 0; width: 360px; z-index: 100; overflow-y: auto`
- Open: `transform: translateX(100%) → translateX(0)` (300ms `cubic-bezier(0.16,1,0.3,1)`), backdrop `opacity: 0 → 1` simultaneously
- Close triggers: ✕ button, clicking `.shelf-backdrop`, ESC key
- `document.body.style.overflow = 'hidden'` while open
- On mobile (`max-width: 768px`): `width: 100vw`, slides from bottom (`translateY(100%) → translateY(0)`)
- Prose loaded via `fetch(/shelf/[slug])` → parse `.entry__content` — same pattern as current overlay
- URL: `history.pushState` to `/shelf/[slug]` on open, restore on close
- `.shelf-panel__link` → `/shelf/[slug]` for full detail page

---

## 6. Diagonal Section Dividers (`.shelf-divider`)

Between each `<section>` on the shelf page. Direction alternates.

```css
.shelf-divider {
  height: 36px;
  background: var(--color-bg-base);
  clip-path: polygon(0 0, 100% 12px, 100% 100%, 0 100%);
  position: relative;
}
.shelf-divider::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg,
    rgba(255,229,44,0.18) 0%,
    rgba(255,229,44,0.06) 60%,
    transparent 100%
  );
}
.shelf-divider--flip {
  clip-path: polygon(0 12px, 100% 0, 100% 100%, 0 100%);
}
.shelf-divider--flip::before {
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255,229,44,0.06) 40%,
    rgba(255,229,44,0.18) 100%
  );
}
```

**Also on homepage** (`src/pages/index.astro`): dividers between BentoGrid row groups (rows 1→2 and rows 3→4 boundaries), added as thin elements between the tile groups in the JSX. Alternating direction.

---

## 7. Shimmer Section Headers

Applied to `.shelf-section__header h2` and the homepage title tile's `Ninjaruss` name.

```css
.shelf-section__header h2 {
  background: linear-gradient(
    90deg,
    var(--color-text) 0%,
    var(--color-gold) 40%,
    var(--color-gold-orange) 50%,
    var(--color-text) 65%
  );
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer-sweep 12s ease-in-out infinite;
}
@keyframes shimmer-sweep {
  0%   { background-position: 300% center; }
  100% { background-position: -300% center; }
}
@media (prefers-reduced-motion: reduce) {
  .shelf-section__header h2 {
    animation: none;
    -webkit-text-fill-color: var(--color-text);
    background: none;
    color: var(--color-text);
  }
}
```

The homepage `title-tile__name` already has the `rule-shimmer` animation on its gold rules. `shimmer-sweep` is a **new, separate keyframe** added to `transitions.css` — `rule-shimmer` (for the horizontal gold rules) is unchanged.

---

## 8. Stream Tile CRT Glow

Replaces proposed scanlines and noise grain. Only the inset `box-shadow` is added to `.stream-tile`:

```css
.stream-tile::after {
  content: '';
  position: absolute; inset: 0;
  box-shadow: inset 0 0 22px rgba(255,229,44,0.04);
  pointer-events: none; z-index: 2;
  border-radius: inherit;
  transition: box-shadow 300ms;
}
.stream-tile:hover::after {
  box-shadow: inset 0 0 28px rgba(255,229,44,0.08);
}
.stream-tile.is-live::after {
  box-shadow: inset 0 0 22px rgba(255,64,64,0.1);
}
```

---

## Files Affected

| File | Change |
|------|--------|
| `src/pages/shelf/index.astro` | Full overhaul — new structure, styles, and script |
| `src/pages/index.astro` | Add diagonal dividers between row groups |
| `src/styles/transitions.css` | Add `shimmer-sweep` keyframe |
| `src/styles/global.css` | No changes expected |
| `src/utils/mediaGrid/filterEngine.ts` | **Delete** — only used by `shelf/index.astro`, becomes dead code |
| `src/utils/mediaGrid/index.ts` | **Delete** — same |
| `src/tests/mediaGrid.test.ts` | **Delete** — tests for deleted utility |

**Note on `src/utils/splitView/filterEngine.ts`:** This is a separate file used by the Notes/Showcase SplitView layout — it is **not** the same as `src/utils/mediaGrid/filterEngine.ts` and is unaffected by this work.

**Note on old URL params:** Existing `/shelf?type=anime` or `/shelf?fav=1` bookmarks will land on the shelf page with all sections visible. The params are silently ignored — no redirect needed. `/shelf?open=[slug]` still works (triggers panel open on load).

## Out of Scope

- `/shelf/[slug]` detail pages — unchanged
- Notes, Showcase, Novel pages — unchanged

---

## Open Questions

- None — all design decisions confirmed.
