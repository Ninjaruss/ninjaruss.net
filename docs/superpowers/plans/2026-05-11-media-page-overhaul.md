# Media Page Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the media page's quick-view side panel + EmblemCard grid with a cinematic poster card grid and fullscreen overlay that shows the complete entry; update the homepage media tile to match.

**Architecture:** The media page (`/media`) becomes a poster grid (2:3 aspect ratio cards, image fills card, title/type overlaid) with an underline tab filter bar. Clicking a card opens a fixed fullscreen overlay (poster left, scrollable content right) that fetches full prose from `/media/[slug]` on open. The `/media/[slug]` page is restyled to match the overlay layout. No schema changes.

**Tech Stack:** Astro 5, vanilla CSS custom properties, TypeScript client scripts, vitest (existing filter tests unchanged)

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `src/pages/index.astro` | Modify | Media tile: poster strip replaces emblem grid; `recentMedia` slice 2→4 |
| `src/pages/media/index.astro` | Full rewrite | Poster grid, underline tabs, fullscreen overlay, NavPill |
| `src/pages/media/[...slug].astro` | Full rewrite | BaseLayout + cinematic split; removes SplitViewLayout |

---

## Task 1: Update homepage media tile

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Change `recentMedia` to slice 4 entries**

In `src/pages/index.astro`, find the `recentMedia` declaration (~line 42) and change `.slice(0, 2)` to `.slice(0, 4)`:

```typescript
const recentMedia = media
  .filter(e => e.data.publishedAt)
  .sort((a, b) => effectiveDate(b) - effectiveDate(a))
  .slice(0, 4)
  .map(e => ({ href: `/media/${e.slug}`, emblem: e.data.emblem ?? DEFAULT_EMBLEM, title: e.data.title }));
```

- [ ] **Step 2: Replace tile slot content**

Find the `BentoTile` block for the media tile (~line 346). Replace with:

```astro
<BentoTile
  href="/media"
  variant="dark"
  label="Media"
  title="Logbook"
  class="bento-tile--core bento-tile--span-2x2 media-tile"
>
  {recentMedia.length > 0 && (
    <div class="tile-poster-strip">
      {recentMedia.map(entry => (
        <div class="tile-poster" aria-hidden="true">
          <img src={entry.emblem} alt="" class="tile-poster__img" loading="lazy" />
        </div>
      ))}
    </div>
  )}
  <span class="tile-count">{media.length} entries</span>
</BentoTile>
```

(Remove the `description` prop and replace the `tile-emblems` slot with `tile-poster-strip` + count.)

- [ ] **Step 3: Replace media tile CSS**

Find and **remove** the old `.media-tile .tile-emblem` block (~line 824):

```css
/* DELETE this block */
.media-tile .tile-emblem {
  width: 96px;
  height: 96px;
  border: 2px solid var(--color-gold-dim);
}
```

Then add new styles **in its place** inside the `/* ─── Media Tile ───` section:

```css
/* ─── Media Tile ──────────────────────────────────────── */
.media-tile {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(255, 229, 44, 0.025) 3px,
    rgba(255, 229, 44, 0.025) 4px
  );
}

.media-tile .bento-tile__footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
  justify-content: flex-end;
}

.tile-poster-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  flex: 1;
  align-items: end;
}

.tile-poster {
  aspect-ratio: 2/3;
  overflow: hidden;
  border-radius: 3px;
  background: #1a1a1a;
}

.tile-poster__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0.75;
  transition: opacity 200ms;
}

.media-tile:hover .tile-poster__img {
  opacity: 0.9;
}

.tile-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: exits 0, no type errors, no missing import warnings.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): media tile → poster strip layout"
```

---

## Task 2: Rewrite media page — poster grid + underline filter bar

**Files:**
- Modify: `src/pages/media/index.astro` (template + CSS + JS; overlay added in Task 3)

The goal of this task is a functional page with the new poster card grid and underline tabs. Cards link directly to `/media/[slug]` (no JS interception yet — overlay is Task 3). The `data-entries` hidden element stays because Task 3's overlay JS needs it.

- [ ] **Step 1: Replace the entire file content**

Replace `src/pages/media/index.astro` with:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NavPill from '../../components/NavPill.astro';
import { stripMarkdown } from '../../utils/content';

const allMedia = await getCollection('media', ({ data }) => !data.draft);
const sortedMedia = allMedia.sort((a, b) =>
  new Date(b.data.updatedAt || b.data.publishedAt || 0).getTime() -
  new Date(a.data.updatedAt || a.data.publishedAt || 0).getTime()
);

const entryData = sortedMedia.map((entry) => ({
  slug: entry.slug,
  title: entry.data.title,
  type: entry.data.content_type,
  isFavorite: entry.data.isFavorite ?? false,
  emblem: entry.data.emblem ?? '/images/emblems/default.svg',
  tags: entry.data.tags ?? [],
  excerpt: stripMarkdown(entry.body ?? '').slice(0, 150),
}));

const count = sortedMedia.length;
---

<BaseLayout title="Media" description="My thoughts on anime, manga, movies, and more — favorites included." ogImage="/social-default.svg">
  <!-- Entry data for overlay JS -->
  <div id="entry-data" data-entries={JSON.stringify(entryData)} hidden></div>

  <div class="media-page">
    <!-- Header -->
    <header class="media-header">
      <span class="media-header__label">Media</span>
      <h1 class="media-header__title">Logbook</h1>
      <span class="media-header__count">{count} entries</span>
    </header>

    <!-- Underline tab filter bar -->
    <div class="filter-bar" role="toolbar" aria-label="Filter media entries">
      <button class="filter-tab filter-tab--fav" data-filter-fav aria-pressed="false">★</button>
      <div class="filter-bar__divider" aria-hidden="true"></div>
      <div class="filter-bar__tabs" role="group" aria-label="Filter by type">
        {(['all', 'anime', 'manga', 'film', 'series', 'music', 'book', 'game', 'character', 'other']).map((type) => (
          <button
            class:list={['filter-tab', { 'is-active': type === 'all' }]}
            data-filter-type={type}
            aria-pressed={type === 'all' ? 'true' : 'false'}
          >
            {type}
          </button>
        ))}
      </div>
    </div>

    <!-- Poster card grid -->
    <div class="media-grid" id="media-grid">
      {sortedMedia.map((entry, i) => (
        <a
          href={`/media/${entry.slug}`}
          class:list={['media-card', { 'media-card--fav': entry.data.isFavorite }]}
          data-slug={entry.slug}
          data-type={entry.data.content_type}
          data-fav={entry.data.isFavorite ? 'true' : 'false'}
          style={`--card-index: ${i}`}
          aria-label={entry.data.title}
        >
          <div class="media-card__poster">
            <img
              src={entry.data.emblem ?? '/images/emblems/default.svg'}
              alt=""
              class="media-card__img"
              loading="lazy"
            />
            <div class="media-card__overlay">
              <span class="media-card__type">{entry.data.content_type}</span>
              <span class="media-card__title">{entry.data.title}</span>
            </div>
          </div>
          {entry.data.isFavorite && (
            <span class="media-card__star" aria-label="Favorite">★</span>
          )}
        </a>
      ))}
    </div>
  </div>

  <NavPill />
</BaseLayout>

<style>
  /* ── Page layout ───────────────────────────────── */
  .media-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-lg) calc(var(--space-xl) * 3);
  }

  /* ── Header ────────────────────────────────────── */
  .media-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
    flex-wrap: wrap;
  }
  .media-header__label {
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--color-muted);
  }
  .media-header__title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 900;
    color: var(--color-text);
    line-height: 1;
  }
  .media-header__count {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-muted);
    margin-left: auto;
  }

  /* ── Filter bar ────────────────────────────────── */
  .filter-bar {
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid var(--color-border, #2a2a2a);
    margin-bottom: var(--space-xl);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .filter-bar::-webkit-scrollbar { display: none; }

  .filter-bar__divider {
    width: 1px;
    background: var(--color-border, #2a2a2a);
    margin: 6px 4px;
    flex-shrink: 0;
  }

  .filter-bar__tabs {
    display: flex;
  }

  .filter-tab {
    padding: 10px 16px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    white-space: nowrap;
    transition: color 150ms, border-color 150ms;
    margin-bottom: -1px;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  .filter-tab:hover { color: var(--color-text); }
  .filter-tab.is-active,
  .filter-tab[aria-pressed="true"] {
    color: var(--color-gold);
    border-bottom-color: var(--color-gold);
  }
  .filter-tab--fav {
    color: rgba(255, 229, 44, 0.4);
    padding: 10px 14px;
  }
  .filter-tab--fav.is-active,
  .filter-tab--fav[aria-pressed="true"] {
    color: var(--color-gold);
    border-bottom-color: var(--color-gold);
  }

  /* ── Poster card grid ──────────────────────────── */
  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-md);
    align-content: start;
  }

  /* ── Individual poster card ────────────────────── */
  .media-card {
    position: relative;
    display: block;
    text-decoration: none;
    color: var(--color-text);
    cursor: pointer;
    animation: card-in 400ms var(--animation-easing, ease) both;
    animation-delay: min(calc(var(--card-index, 0) * 50ms), 1500ms);
  }
  @keyframes card-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .media-card[data-hidden="true"] { display: none; }

  .media-card__poster {
    position: relative;
    aspect-ratio: 2/3;
    overflow: hidden;
    border-radius: 4px;
    background: var(--color-bg-elevated, #1a1a1a);
    border: 1px solid transparent;
    transition: border-color 200ms, box-shadow 200ms;
  }
  .media-card:hover .media-card__poster {
    border-color: var(--color-gold);
    box-shadow: 0 0 14px rgba(255, 229, 44, 0.15);
  }

  .media-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: filter 200ms;
  }
  .media-card:hover .media-card__img { filter: brightness(1.08); }

  .media-card__overlay {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 28px 8px 8px;
    background: linear-gradient(transparent, rgba(0,0,0,0.88));
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .media-card__type {
    font-family: var(--font-mono);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.45);
  }
  .media-card__title {
    font-family: var(--font-mono);
    font-size: 10px;
    color: #f5f5f5;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .media-card__star {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 11px;
    color: var(--color-gold);
    line-height: 1;
    text-shadow: 0 0 6px rgba(0,0,0,0.9);
  }

  /* ── Responsive ────────────────────────────────── */
  @media (max-width: 480px) {
    .media-grid {
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: var(--space-sm);
    }
    .media-header__count { margin-left: 0; width: 100%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .media-card { animation: none; }
  }
</style>

<script>
  import { parseFilterState, buildFilterURL } from '../../utils/mediaGrid/filterEngine';

  function updateFilterURL(type: string, favOnly: boolean) {
    const base = buildFilterURL({ type, favOnly });
    history.replaceState(null, '', base || location.pathname);
  }

  function initMediaPage() {
    const grid = document.getElementById('media-grid');
    if (!grid) return;

    const { type: initialType, favOnly: initialFav } = parseFilterState(location.search);
    let activeType = initialType;
    let favOnly = initialFav;
    let isFirstFilter = true;

    function applyFilters() {
      const cards = grid!.querySelectorAll<HTMLElement>('.media-card');
      let visibleIndex = 0;
      const shouldAnimate = !isFirstFilter;
      isFirstFilter = false;

      cards.forEach((card) => {
        const type = card.dataset.type ?? '';
        const isFav = card.dataset.fav === 'true';
        const typeMatch = activeType === 'all' || type === activeType;
        const favMatch = !favOnly || isFav;
        const visible = typeMatch && favMatch;

        card.dataset.hidden = visible ? 'false' : 'true';
        if (visible) {
          card.style.setProperty('--card-index', String(visibleIndex));
          visibleIndex++;
          if (shouldAnimate) {
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = '';
          }
        }
      });
    }

    // Type tabs
    const typeTabs = document.querySelectorAll<HTMLButtonElement>('[data-filter-type]');
    typeTabs.forEach((tab) => {
      const isActive = tab.dataset.filterType === initialType;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      tab.addEventListener('click', () => {
        const type = tab.dataset.filterType ?? 'all';
        activeType = type;
        typeTabs.forEach((t) => {
          const active = t.dataset.filterType === type;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        updateFilterURL(activeType, favOnly);
        applyFilters();
      });
    });

    // Favorites tab
    const favTab = document.querySelector<HTMLButtonElement>('[data-filter-fav]');
    if (favTab) {
      favTab.classList.toggle('is-active', initialFav);
      favTab.setAttribute('aria-pressed', initialFav ? 'true' : 'false');
      favTab.addEventListener('click', () => {
        favOnly = !favOnly;
        favTab.classList.toggle('is-active', favOnly);
        favTab.setAttribute('aria-pressed', favOnly ? 'true' : 'false');
        updateFilterURL(activeType, favOnly);
        applyFilters();
      });
    }

    applyFilters();
  }

  document.addEventListener('astro:page-load', initMediaPage);
</script>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: exits 0. Check that `/media` route generates without errors.

- [ ] **Step 3: Start dev server and verify the page visually**

```bash
npm run dev
```

Navigate to `http://localhost:4321/media`. Confirm:
- Cards display as 2:3 posters with title/type overlaid
- Filter tab bar shows underline on active tab, scrolls horizontally on narrow viewport
- ★ favorites tab toggles correctly
- Type tabs filter correctly
- URL updates on filter change

- [ ] **Step 4: Run existing filter tests to confirm nothing broke**

```bash
npm run test -- mediaGrid
```

Expected: all tests pass (filter logic unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/pages/media/index.astro
git commit -m "feat(media): poster grid + underline filter tabs"
```

---

## Task 3: Add fullscreen overlay

**Files:**
- Modify: `src/pages/media/index.astro`

Add overlay HTML, CSS, and JS. Cards now intercept clicks to open the overlay instead of navigating.

- [ ] **Step 1: Add overlay HTML to the template**

In `src/pages/media/index.astro`, find the closing `</div>` of `.media-page` and insert the overlay just before `</BaseLayout>` (after `</div>` of `.media-page`):

```astro
  <!-- Fullscreen overlay -->
  <div
    class="media-overlay"
    id="media-overlay"
    hidden
    role="dialog"
    aria-modal="true"
    aria-label="Entry detail"
    tabindex="-1"
  >
    <button class="media-overlay__close" id="media-overlay-close" aria-label="Close">✕</button>
    <div class="media-overlay__inner" id="media-overlay-inner">
      <div class="media-overlay__poster">
        <img src="" alt="" class="media-overlay__poster-img" id="media-overlay-img" />
      </div>
      <div class="media-overlay__content" id="media-overlay-content">
        <!-- Populated by JS -->
      </div>
    </div>
  </div>
```

- [ ] **Step 2: Add overlay CSS**

At the bottom of the `<style>` block in `src/pages/media/index.astro`, add:

```css
  /* ── Fullscreen overlay ────────────────────────── */
  .media-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(8, 8, 8, 0.96);
    animation: overlay-in 350ms var(--animation-easing, ease) both;
    outline: none;
  }
  .media-overlay[hidden] { display: none; }

  @keyframes overlay-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .media-overlay__close {
    position: absolute;
    top: var(--space-md, 16px);
    right: var(--space-lg, 24px);
    z-index: 10;
    background: none;
    border: none;
    color: var(--color-muted);
    font-size: 18px;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: color 150ms, background 150ms;
  }
  .media-overlay__close:hover {
    color: var(--color-text);
    background: rgba(255,255,255,0.06);
  }

  .media-overlay__inner {
    display: grid;
    grid-template-columns: 320px 1fr;
    height: 100%;
    overflow: hidden;
  }

  .media-overlay__poster {
    overflow: hidden;
    background: #0a0a0a;
  }
  .media-overlay__poster-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .media-overlay__content {
    overflow-y: auto;
    padding: var(--space-xl, 40px);
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 16px);
    padding-right: calc(var(--space-xl, 40px) + 44px); /* room for close btn */
  }

  /* Content elements rendered inside overlay */
  .ov-type {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-muted);
    margin: 0;
  }
  .ov-title {
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 900;
    color: var(--color-gold);
    line-height: 1.1;
    margin: 0;
  }
  .ov-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0;
  }
  .ov-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 3px 8px;
    border: 1px solid var(--color-border, #2a2a2a);
    border-radius: 12px;
    color: var(--color-muted);
  }
  .ov-loading {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-muted);
    padding: var(--space-lg, 24px) 0;
  }

  /* Mobile overlay */
  @media (max-width: 768px) {
    .media-overlay__inner {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
      overflow-y: auto;
      height: 100%;
    }
    .media-overlay__poster {
      aspect-ratio: 16/9;
      height: auto;
    }
    .media-overlay__poster-img {
      object-position: top;
    }
    .media-overlay__content {
      padding: var(--space-lg, 24px);
      padding-right: var(--space-lg, 24px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .media-overlay { animation: none; }
  }
```

- [ ] **Step 3: Replace the `<script>` block with overlay-aware version**

Replace the entire `<script>` block in `src/pages/media/index.astro` with:

```typescript
<script>
  import { parseFilterState, buildFilterURL } from '../../utils/mediaGrid/filterEngine';

  type EntryData = {
    slug: string;
    title: string;
    type: string;
    isFavorite: boolean;
    emblem: string;
    tags: string[];
    excerpt: string;
  };

  function esc(s: unknown): string {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateFilterURL(type: string, favOnly: boolean) {
    const base = buildFilterURL({ type, favOnly });
    history.replaceState(null, '', base || location.pathname);
  }

  function updateOpenURL(slug: string) {
    const filterState = parseFilterState(location.search);
    const base = buildFilterURL(filterState);
    const p = new URLSearchParams(base.startsWith('?') ? base.slice(1) : base);
    p.set('open', slug);
    history.replaceState(null, '', `?${p.toString()}`);
  }

  function clearOpenURL() {
    const filterState = parseFilterState(location.search);
    const base = buildFilterURL(filterState);
    history.replaceState(null, '', base || location.pathname);
  }

  function initMediaPage() {
    const grid = document.getElementById('media-grid');
    const overlay = document.getElementById('media-overlay') as HTMLElement | null;
    const overlayImg = document.getElementById('media-overlay-img') as HTMLImageElement | null;
    const overlayContent = document.getElementById('media-overlay-content') as HTMLElement | null;
    const closeBtn = document.getElementById('media-overlay-close');
    const entryDataEl = document.getElementById('entry-data');

    if (!grid) return;

    // Parse entry data
    let entries: EntryData[] = [];
    if (entryDataEl) {
      try { entries = JSON.parse(entryDataEl.dataset.entries || '[]'); } catch {}
    }
    const entryMap = new Map(entries.map((e) => [e.slug, e]));

    // Filter state
    const { type: initialType, favOnly: initialFav } = parseFilterState(location.search);
    const params = new URLSearchParams(location.search);
    const initialOpen = params.get('open') || null;
    let activeType = initialType;
    let favOnly = initialFav;
    let isFirstFilter = true;
    let previouslyFocused: HTMLElement | null = null;

    // ── Filter logic ──────────────────────────────
    function applyFilters() {
      const cards = grid!.querySelectorAll<HTMLElement>('.media-card');
      let visibleIndex = 0;
      const shouldAnimate = !isFirstFilter;
      isFirstFilter = false;

      cards.forEach((card) => {
        const type = card.dataset.type ?? '';
        const isFav = card.dataset.fav === 'true';
        const typeMatch = activeType === 'all' || type === activeType;
        const favMatch = !favOnly || isFav;
        const visible = typeMatch && favMatch;
        card.dataset.hidden = visible ? 'false' : 'true';
        if (visible) {
          card.style.setProperty('--card-index', String(visibleIndex));
          visibleIndex++;
          if (shouldAnimate) {
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = '';
          }
        }
      });
    }

    // Type tabs
    const typeTabs = document.querySelectorAll<HTMLButtonElement>('[data-filter-type]');
    typeTabs.forEach((tab) => {
      const isActive = tab.dataset.filterType === initialType;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      tab.addEventListener('click', () => {
        const type = tab.dataset.filterType ?? 'all';
        activeType = type;
        typeTabs.forEach((t) => {
          const active = t.dataset.filterType === type;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        updateFilterURL(activeType, favOnly);
        applyFilters();
      });
    });

    // Favorites tab
    const favTab = document.querySelector<HTMLButtonElement>('[data-filter-fav]');
    if (favTab) {
      favTab.classList.toggle('is-active', initialFav);
      favTab.setAttribute('aria-pressed', initialFav ? 'true' : 'false');
      favTab.addEventListener('click', () => {
        favOnly = !favOnly;
        favTab.classList.toggle('is-active', favOnly);
        favTab.setAttribute('aria-pressed', favOnly ? 'true' : 'false');
        updateFilterURL(activeType, favOnly);
        applyFilters();
      });
    }

    applyFilters();

    // ── Overlay logic ─────────────────────────────
    function openOverlay(slug: string, entry: EntryData) {
      if (!overlay || !overlayImg || !overlayContent) return;

      // Set poster immediately
      overlayImg.src = entry.emblem;
      overlayImg.alt = entry.title;

      // Render header + loading state
      overlayContent.innerHTML = `
        <p class="ov-type">${esc(entry.type)}</p>
        <h2 class="ov-title">${esc(entry.title)}</h2>
        ${entry.tags.length
          ? `<div class="ov-tags">${entry.tags.map((t) => `<span class="ov-tag">${esc(t)}</span>`).join('')}</div>`
          : ''}
        <div class="ov-loading" id="ov-prose">Loading…</div>
      `;

      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      overlay.focus();
      updateOpenURL(slug);

      // Fetch full prose from detail page
      fetch(`/media/${slug}`)
        .then((r) => r.text())
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const prose = doc.querySelector('.entry__content');
          const loading = document.getElementById('ov-prose');
          if (loading) {
            if (prose) {
              loading.replaceWith(prose);
            } else {
              loading.remove();
            }
          }
        })
        .catch(() => {
          const loading = document.getElementById('ov-prose');
          if (loading) loading.remove();
        });
    }

    function closeOverlay() {
      if (!overlay) return;
      overlay.hidden = true;
      document.body.style.overflow = '';
      clearOpenURL();
      previouslyFocused?.focus();
      previouslyFocused = null;
    }

    if (overlay) {
      // Card click → open overlay
      const cards = grid.querySelectorAll<HTMLAnchorElement>('.media-card');
      cards.forEach((card) => {
        card.addEventListener('click', (e) => {
          const slug = card.dataset.slug;
          if (!slug) return;
          const entry = entryMap.get(slug);
          if (!entry) return;
          e.preventDefault();
          previouslyFocused = card;
          openOverlay(slug, entry);
        });
      });

      // Close button
      closeBtn?.addEventListener('click', closeOverlay);

      // ESC key
      document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !overlay.hidden) closeOverlay();
      });

      // Backdrop click (click outside inner panel)
      overlay.addEventListener('click', (e) => {
        const inner = document.getElementById('media-overlay-inner');
        if (inner && !inner.contains(e.target as Node)) closeOverlay();
      });

      // Pre-open from URL
      if (initialOpen) {
        const entry = entryMap.get(initialOpen);
        if (entry) openOverlay(initialOpen, entry);
      }
    }
  }

  document.addEventListener('astro:page-load', initMediaPage);
</script>
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 5: Start dev server and test the overlay**

```bash
npm run dev
```

Navigate to `http://localhost:4321/media`. Confirm:
- Clicking a card opens the fullscreen overlay
- Poster image appears immediately; prose loads asynchronously
- ✕ button closes overlay
- ESC closes overlay
- Clicking the dark backdrop (outside the inner panel) closes overlay
- URL updates to `?open=[slug]` on open, reverts on close
- Loading `?open=persona-4-golden` in the URL pre-opens the correct entry
- NavPill Home button still visible above overlay
- Mobile (resize to <768px): poster becomes 16:9 banner at top

- [ ] **Step 6: Run filter tests**

```bash
npm run test -- mediaGrid
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/pages/media/index.astro
git commit -m "feat(media): fullscreen overlay with prose fetch"
```

---

## Task 4: Restyle `/media/[...slug].astro`

**Files:**
- Modify: `src/pages/media/[...slug].astro`

Replace `SplitViewLayout` with `BaseLayout` + cinematic split layout. The `.entry__content` class must be preserved — the overlay fetches this element.

- [ ] **Step 1: Replace the entire file content**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NavPill from '../../components/NavPill.astro';
import TagList from '../../components/TagList.astro';
import DateDisplay from '../../components/DateDisplay.astro';
import RelatedContent from '../../components/RelatedContent.astro';
import { stripMarkdown, hasMinimalContent } from '../../utils/content';
import { getAllCollections } from '../../utils/collections';

export async function getStaticPaths() {
  const entries = await getCollection('media');
  return entries.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
const { allMedia, allNotes, allShowcase } = await getAllCollections();
const hasContent = !hasMinimalContent(entry.body);
const pageDescription = entry.data.description ?? stripMarkdown(entry.body || '').slice(0, 160);
const pageOgImage = entry.data.image ?? '/social-default.svg';
---

<BaseLayout
  title={entry.data.title}
  description={pageDescription}
  ogImage={pageOgImage}
  ogType="article"
>
  <div class="media-detail">
    <div class="media-detail__inner">
      <!-- Poster panel (sticky on desktop) -->
      <div class="media-detail__poster-panel">
        <img
          src={entry.data.emblem ?? '/images/emblems/default.svg'}
          alt=""
          class="media-detail__poster-img"
        />
      </div>

      <!-- Content panel -->
      <div class="media-detail__content">
        <p class="media-detail__type">{entry.data.content_type}</p>
        <h1 class="media-detail__title">{entry.data.title}</h1>
        {(entry.data.tags ?? []).length > 0 && (
          <div class="media-detail__tags">
            <TagList tags={entry.data.tags} />
          </div>
        )}
        <DateDisplay
          publishedAt={entry.data.publishedAt}
          updatedAt={entry.data.updatedAt}
        />
        {hasContent && (
          <div class="entry__content prose">
            <Content />
          </div>
        )}
        {(entry.data.collections ?? []).length > 0 && (
          <RelatedContent
            currentSlug={entry.slug}
            currentCollections={entry.data.collections}
            section="media"
            allMedia={allMedia}
            allNotes={allNotes}
            allShowcase={allShowcase}
          />
        )}
      </div>
    </div>
  </div>

  <NavPill backLink="/media" backLabel="Media" />
</BaseLayout>

<style>
  .media-detail {
    padding: var(--space-xl) var(--space-lg) calc(var(--space-xl) * 3);
  }

  .media-detail__inner {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: var(--space-xl);
    max-width: 1100px;
    margin: 0 auto;
    align-items: start;
  }

  .media-detail__poster-panel {
    position: sticky;
    top: var(--space-xl);
  }

  .media-detail__poster-img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: 6px;
    display: block;
    border: 1px solid var(--color-border, #2a2a2a);
  }

  .media-detail__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    min-width: 0;
  }

  .media-detail__type {
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-muted);
    margin: 0;
  }

  .media-detail__title {
    font-size: clamp(1.8rem, 5vw, 3rem);
    font-weight: 900;
    color: var(--color-gold);
    line-height: 1.1;
    margin: 0;
  }

  .media-detail__tags { margin: 0; }

  @media (max-width: 768px) {
    .media-detail__inner {
      grid-template-columns: 1fr;
    }
    .media-detail__poster-panel {
      position: static;
    }
    .media-detail__poster-img {
      aspect-ratio: 16/9;
      object-fit: cover;
      object-position: top;
    }
  }
</style>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: exits 0. All `/media/[slug]` routes generate without errors.

- [ ] **Step 3: Dev server verification**

```bash
npm run dev
```

Check `http://localhost:4321/media/bocchi` (or any slug). Confirm:
- Page shows poster left, content right on desktop
- Mobile: poster becomes 16:9 banner, content below
- NavPill shows Home + ← Media
- Overlay fetch still works (open `/media` → click Bocchi → prose loads from this page)

- [ ] **Step 4: Confirm overlay prose fetch**

Open `http://localhost:4321/media`. Click any card with prose content. In DevTools Network tab, confirm a fetch to `/media/[slug]` fires and the overlay content panel populates with the prose (not just the loading state).

- [ ] **Step 5: Run all tests**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/media/[...slug].astro
git commit -m "feat(media): cinematic split layout for detail page"
```

---

## Self-Review Notes

- **Filter engine unchanged**: `src/utils/mediaGrid/filterEngine.ts` is untouched; existing tests cover it.
- **`.entry__content` preserved**: Task 4 wraps prose in `<div class="entry__content prose">` — the overlay fetch targets this selector.
- **No-JS fallback**: cards are `<a>` tags with `href="/media/[slug]"` — without JS, navigation works normally.
- **NavPill z-index**: NavPill uses `z-index: 100`; overlay uses `z-index: 200`. NavPill floats above the overlay on desktop as intended.
- **Showcase tile emblems**: the `.tile-emblems--highlight` CSS in `index.astro` is untouched (used by showcase tile, not media tile).
- **`recentMedia` count**: changed from `.slice(0, 2)` to `.slice(0, 4)` in Task 1 to populate the 4-poster strip.
