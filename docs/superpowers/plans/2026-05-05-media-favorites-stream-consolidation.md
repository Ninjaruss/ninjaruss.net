# Media + Favorites + Stream Tile Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge `/favorites` into `/media` as a grid-first page with inline quick-view, replace the favorites homepage tile and standalone live tile with a single KAIMA tile.

**Architecture:** `src/pages/media/index.astro` is rewritten from SplitViewLayout to a full emblem card grid with client-side filter + quick-view logic. Filter and URL state logic lives in `src/utils/mediaGrid/` (pure functions, tested). The homepage loses the favorites tile and standalone live tile; both are replaced by a single KAIMA tile that absorbs the YouTube live-detection logic.

**Tech Stack:** Astro 5, TypeScript, Vitest, vanilla CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-05-05-media-favorites-stream-consolidation-design.md`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Rewrite | `src/pages/favorites.astro` | Redirect to `/media?fav=1` |
| Rewrite | `src/pages/favorites/[...slug].astro` | Redirect to `/media/[slug]` |
| Create | `src/utils/mediaGrid/filterEngine.ts` | Pure filter + URL-state functions |
| Create | `src/utils/mediaGrid/quickView.ts` | Quick-view panel DOM logic |
| Create | `src/utils/mediaGrid/index.ts` | Entry point — wires filter + quick-view |
| Create | `src/tests/mediaGrid.test.ts` | Vitest tests for filterEngine |
| Rewrite | `src/pages/media/index.astro` | Grid page with filter bar + quick-view panel |
| Modify | `src/pages/index.astro` | Remove favorites tile, add KAIMA tile, update live logic, remove live tile |

---

## Task 1: Redirect `/favorites` routes

**Files:**
- Modify: `src/pages/favorites.astro`
- Modify: `src/pages/favorites/[...slug].astro`

- [ ] **Step 1: Rewrite `src/pages/favorites.astro` to redirect**

Replace the entire file contents with:

```astro
---
return Astro.redirect('/media?fav=1', 301);
---
```

- [ ] **Step 2: Rewrite `src/pages/favorites/[...slug].astro` to redirect**

Replace the entire file contents with:

```astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('media', ({ data }) => !data.draft && data.isFavorite);
  return entries.map((entry) => ({
    params: { slug: entry.slug },
  }));
}

const { slug } = Astro.params;
return Astro.redirect(`/media/${slug}`, 301);
---
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: build completes with no errors. Check `dist/favorites/index.html` exists and contains a meta-refresh to `/media?fav=1`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/favorites.astro src/pages/favorites/[...slug].astro
git commit -m "feat: redirect /favorites routes to /media"
```

---

## Task 2: Write failing tests for filterEngine

**Files:**
- Create: `src/tests/mediaGrid.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// src/tests/mediaGrid.test.ts
import { describe, it, expect } from 'vitest';
import {
  filterEntries,
  parseFilterState,
  buildFilterURL,
  type FilterState,
  type FilterableEntry,
} from '../utils/mediaGrid/filterEngine';

const entries: FilterableEntry[] = [
  { slug: 'persona-4', type: 'anime', isFavorite: true },
  { slug: 'akira',     type: 'film',  isFavorite: false },
  { slug: 'berserk',   type: 'anime', isFavorite: false },
  { slug: 'p4-manga',  type: 'manga', isFavorite: true },
];

describe('filterEntries', () => {
  it('returns all entries when type is "all" and favOnly is false', () => {
    expect(filterEntries(entries, { type: 'all', favOnly: false })).toHaveLength(4);
  });

  it('filters by type', () => {
    const result = filterEntries(entries, { type: 'anime', favOnly: false });
    expect(result).toHaveLength(2);
    expect(result.every(e => e.type === 'anime')).toBe(true);
  });

  it('filters to favorites only', () => {
    const result = filterEntries(entries, { type: 'all', favOnly: true });
    expect(result).toHaveLength(2);
    expect(result.every(e => e.isFavorite)).toBe(true);
  });

  it('stacks type and favorites filters', () => {
    const result = filterEntries(entries, { type: 'anime', favOnly: true });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('persona-4');
  });

  it('returns empty array when no entries match', () => {
    expect(filterEntries(entries, { type: 'game', favOnly: false })).toHaveLength(0);
  });
});

describe('parseFilterState', () => {
  it('returns defaults for empty string', () => {
    expect(parseFilterState('')).toEqual({ type: 'all', favOnly: false });
  });

  it('parses type param', () => {
    expect(parseFilterState('?type=anime')).toEqual({ type: 'anime', favOnly: false });
  });

  it('parses fav=1 param', () => {
    expect(parseFilterState('?fav=1')).toEqual({ type: 'all', favOnly: true });
  });

  it('parses combined params', () => {
    expect(parseFilterState('?type=film&fav=1')).toEqual({ type: 'film', favOnly: true });
  });

  it('ignores fav param when not "1"', () => {
    expect(parseFilterState('?fav=0')).toEqual({ type: 'all', favOnly: false });
  });
});

describe('buildFilterURL', () => {
  it('returns /media for default state', () => {
    expect(buildFilterURL({ type: 'all', favOnly: false })).toBe('/media');
  });

  it('includes type param when not "all"', () => {
    expect(buildFilterURL({ type: 'anime', favOnly: false })).toBe('/media?type=anime');
  });

  it('includes fav=1 when favOnly is true', () => {
    expect(buildFilterURL({ type: 'all', favOnly: true })).toBe('/media?fav=1');
  });

  it('combines type and fav params', () => {
    expect(buildFilterURL({ type: 'film', favOnly: true })).toBe('/media?type=film&fav=1');
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail**

```bash
npm run test -- src/tests/mediaGrid.test.ts
```

Expected: tests fail with `Cannot find module '../utils/mediaGrid/filterEngine'`.

---

## Task 3: Implement filterEngine and make tests pass

**Files:**
- Create: `src/utils/mediaGrid/filterEngine.ts`

- [ ] **Step 1: Create the filterEngine module**

```typescript
// src/utils/mediaGrid/filterEngine.ts
export interface FilterState {
  type: string;
  favOnly: boolean;
}

export interface FilterableEntry {
  slug: string;
  type: string;
  isFavorite: boolean;
}

export function filterEntries<T extends FilterableEntry>(
  entries: T[],
  state: FilterState,
): T[] {
  return entries.filter(e => {
    if (state.favOnly && !e.isFavorite) return false;
    if (state.type !== 'all' && e.type !== state.type) return false;
    return true;
  });
}

export function parseFilterState(search: string): FilterState {
  const params = new URLSearchParams(search.replace(/^\?/, ''));
  return {
    type: params.get('type') ?? 'all',
    favOnly: params.get('fav') === '1',
  };
}

export function buildFilterURL(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.type !== 'all') params.set('type', state.type);
  if (state.favOnly) params.set('fav', '1');
  const qs = params.toString();
  return qs ? `/media?${qs}` : '/media';
}
```

- [ ] **Step 2: Run tests — expect them to pass**

```bash
npm run test -- src/tests/mediaGrid.test.ts
```

Expected: all 14 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/utils/mediaGrid/filterEngine.ts src/tests/mediaGrid.test.ts
git commit -m "feat: add mediaGrid filterEngine with tests"
```

---

## Task 4: Rewrite `media/index.astro` — HTML and CSS

**Files:**
- Rewrite: `src/pages/media/index.astro`

The page pre-renders all entry metadata as a JSON data attribute so the client-side quick-view needs no fetch calls. The quick-view panel is in the DOM but `hidden` by default.

- [ ] **Step 1: Rewrite the file**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NavPill from '../../components/NavPill.astro';
import EmblemCard from '../../components/EmblemCard.astro';
import { stripMarkdown } from '../../utils/content';

const allMedia = await getCollection('media', ({ data }) => !data.draft);
const sorted = allMedia.sort((a, b) =>
  new Date(b.data.updatedAt || b.data.publishedAt || 0).getTime() -
  new Date(a.data.updatedAt || a.data.publishedAt || 0).getTime()
);

const allTypes = [...new Set(allMedia.map(e => e.data.content_type))].sort();
const totalCount = sorted.length;

const entryData = sorted.map(e => ({
  slug: e.slug,
  title: e.data.title,
  type: e.data.content_type,
  isFavorite: e.data.isFavorite ?? false,
  emblem: e.data.emblem ?? '/images/emblems/default.svg',
  tags: e.data.tags ?? [],
  excerpt: stripMarkdown(e.body ?? '').slice(0, 150),
}));
---

<BaseLayout title="Media" description="Notes on anime, manga, films, and more.">
  <NavPill />

  <div
    id="entry-data"
    data-entries={JSON.stringify(entryData)}
    hidden
  ></div>

  <div class="media-container">
    <header class="media-header p3r-animate">
      <div class="media-header__left">
        <span class="media-header__section">Collection</span>
      </div>
      <div class="media-header__center">
        <h1 class="media-title">Media</h1>
      </div>
      <div class="media-header__right">
        <span class="media-header__count" id="media-count">{totalCount}</span>
        <span class="media-header__count-label">entries</span>
      </div>
    </header>

    <div class="filter-bar p3r-animate" style="--stagger-delay: 50ms;">
      <button class="filter-pill filter-pill--fav" data-fav="true" aria-pressed="false">
        ★ favorites
      </button>
      <div class="filter-divider" aria-hidden="true"></div>
      <button class="filter-pill" data-type="all" aria-pressed="false">all</button>
      {allTypes.map(type => (
        <button class="filter-pill" data-type={type} aria-pressed="false">{type}</button>
      ))}
    </div>

    <div class="media-layout" id="media-layout">
      <div class="media-grid" id="media-grid">
        {sorted.map((entry, index) => (
          <a
            href={`/media/${entry.slug}`}
            class="media-card p3r-animate"
            data-slug={entry.slug}
            data-type={entry.data.content_type}
            data-fav={entry.data.isFavorite ? 'true' : 'false'}
            style={`--stagger-delay: ${(index % 20) * 50}ms`}
            aria-label={entry.data.title}
          >
            <div class="media-card__emblem">
              <EmblemCard
                emblemSrc={entry.data.emblem}
                isInitiallyFlipped={true}
                disableLightbox={true}
              />
            </div>
            <div class="media-card__footer">
              <span class="media-card__title">{entry.data.title}</span>
              {entry.data.isFavorite && (
                <span class="media-card__star" aria-label="Favorite">★</span>
              )}
            </div>
          </a>
        ))}
      </div>

      <aside
        class="quick-view-panel"
        id="quick-view-panel"
        aria-label="Quick view"
        hidden
      >
        <div class="qv-inner">
          <div class="qv-top">
            <span class="qv-label">Quick View</span>
            <button class="qv-close" id="qv-close" aria-label="Close">✕</button>
          </div>
          <div class="qv-emblem" id="qv-emblem"></div>
          <span class="qv-type" id="qv-type"></span>
          <h2 class="qv-title" id="qv-title"></h2>
          <div class="qv-tags" id="qv-tags"></div>
          <p class="qv-excerpt" id="qv-excerpt"></p>
          <a class="qv-link" id="qv-link" href="#">open full entry →</a>
        </div>
      </aside>
    </div>
  </div>
</BaseLayout>

<style>
  /* ─── Container ─────────────────────────────────── */
  .media-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--space-2xl) var(--space-md);
  }

  /* ─── Header ────────────────────────────────────── */
  .media-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: flex-end;
    gap: var(--space-md);
    margin-bottom: var(--space-2xl);
    padding-bottom: var(--space-xl);
    border-bottom: var(--border-thick) solid var(--color-gold);
  }

  .media-header__left { display: flex; align-items: flex-end; }

  .media-header__right {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: var(--space-xs);
  }

  .media-header__section {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    padding-bottom: 4px;
  }

  .media-header__center { text-align: center; }

  .media-title {
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    color: var(--color-gold);
    text-transform: uppercase;
    line-height: 1.1;
    margin: 0;
  }

  .media-header__count {
    font-family: var(--font-display);
    font-size: var(--text-4xl);
    color: var(--color-gold);
    line-height: 1;
  }

  .media-header__count-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding-bottom: 6px;
  }

  /* ─── Filter Bar ─────────────────────────────────── */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-xs);
    margin-bottom: var(--space-2xl);
    padding: var(--space-sm) 0;
    border-bottom: var(--border-hairline) solid var(--color-border);
  }

  .filter-divider {
    width: 1px;
    height: 16px;
    background: var(--color-border-strong);
    margin: 0 var(--space-xs);
    flex-shrink: 0;
  }

  .filter-pill {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: lowercase;
    letter-spacing: 0.03em;
    padding: var(--space-xs) var(--space-md);
    background: transparent;
    color: var(--color-text-subtle);
    border: var(--border-hairline) solid var(--color-border);
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: all var(--transition-base);
  }

  .filter-pill:hover {
    color: var(--color-text);
    border-color: var(--color-border-strong);
    background: var(--color-bg-elevated);
  }

  .filter-pill--fav {
    color: rgba(255, 229, 44, 0.6);
    border-color: rgba(255, 229, 44, 0.2);
  }

  .filter-pill--fav:hover {
    color: var(--color-gold);
    border-color: rgba(255, 229, 44, 0.5);
    background: rgba(255, 229, 44, 0.05);
  }

  .filter-pill.is-active {
    background: var(--color-gold);
    color: var(--color-black);
    border-color: var(--color-gold);
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    box-shadow: 0 0 12px rgba(255, 229, 44, 0.3);
  }

  .filter-pill--fav.is-active {
    background: rgba(255, 229, 44, 0.15);
    color: var(--color-gold);
    border-color: rgba(255, 229, 44, 0.5);
    font-family: var(--font-mono);
    text-transform: lowercase;
    letter-spacing: 0.03em;
    box-shadow: 0 0 10px rgba(255, 229, 44, 0.2);
  }

  .filter-pill:focus-visible {
    outline: 2px solid var(--color-gold);
    outline-offset: 2px;
  }

  /* ─── Layout (grid + quick-view) ─────────────────── */
  .media-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-xl);
    transition: grid-template-columns 300ms var(--animation-easing);
  }

  .media-layout.panel-open {
    grid-template-columns: 1fr 340px;
  }

  /* ─── Card Grid ──────────────────────────────────── */
  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--space-xl);
    padding: var(--space-md) 0;
  }

  .media-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    text-decoration: none;
    transition: transform var(--transition-base);
    contain: layout style paint;
  }

  .media-card:hover { transform: translateY(-4px); }

  .media-card:focus-visible {
    outline: 2px solid var(--color-gold);
    outline-offset: 4px;
    border-radius: var(--radius-sm);
  }

  .media-card.is-hidden { display: none; }

  .media-card__emblem {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }

  .media-card__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    padding: 0 var(--space-sm);
    opacity: 0.55;
    transition: opacity var(--transition-base);
  }

  .media-card:hover .media-card__footer { opacity: 1; }

  .media-card__title {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text);
    text-align: center;
    line-height: 1.3;
    margin: 0;
    word-wrap: break-word;
  }

  .media-card__star {
    font-size: var(--text-xs);
    color: var(--color-gold);
    flex-shrink: 0;
  }

  /* ─── Quick-View Panel ───────────────────────────── */
  .quick-view-panel {
    border-left: 1px solid rgba(255, 229, 44, 0.15);
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    position: sticky;
    top: var(--space-lg);
    height: fit-content;
    max-height: calc(100vh - var(--space-2xl));
    overflow-y: auto;
  }

  .qv-inner {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .qv-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .qv-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-gold);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .qv-close {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    cursor: pointer;
    padding: var(--space-xs);
    transition: color var(--transition-fast);
  }

  .qv-close:hover { color: var(--color-gold); }

  .qv-emblem {
    width: 100px;
    margin: 0 auto;
  }

  .qv-emblem img {
    width: 100%;
    aspect-ratio: 63/88;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border-strong);
  }

  .qv-type {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    color: var(--color-gold-dim);
    text-align: center;
  }

  .qv-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--color-text);
    text-align: center;
    line-height: 1.3;
    margin: 0;
  }

  .qv-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    justify-content: center;
  }

  .qv-tag {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    padding: 2px var(--space-sm);
    border-radius: var(--radius-pill);
    background: var(--color-bg-surface);
    color: var(--color-text-muted);
    border: var(--border-hairline) solid var(--color-border);
  }

  .qv-excerpt {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.6;
    margin: 0;
  }

  .qv-link {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    color: var(--color-gold);
    text-decoration: none;
    border: var(--border-hairline) solid rgba(255, 229, 44, 0.3);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-sm);
    text-align: center;
    transition: all var(--transition-fast);
    margin-top: auto;
  }

  .qv-link:hover {
    background: rgba(255, 229, 44, 0.08);
    border-color: var(--color-gold);
  }

  /* ─── Responsive ──────────────────────────────────── */
  @media (max-width: 900px) {
    .media-layout.panel-open {
      grid-template-columns: 1fr;
    }

    .quick-view-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      border-left: none;
      border-top: 1px solid rgba(255, 229, 44, 0.2);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      max-height: 60vh;
      z-index: 100;
    }
  }

  @media (max-width: 480px) {
    .media-container { padding: var(--space-xl) var(--space-sm); }

    .media-header {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      text-align: center;
    }

    .media-header__left,
    .media-header__right { justify-content: center; }

    .media-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-md);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .media-card__footer { transition: none; }
    .media-layout { transition: none; }
  }
</style>
```

- [ ] **Step 2: Run build to verify no errors**

```bash
npm run build
```

Expected: build succeeds. The page renders with the grid and a hidden quick-view panel.

- [ ] **Step 3: Commit**

```bash
git add src/pages/media/index.astro
git commit -m "feat: rewrite media page as emblem card grid"
```

---

## Task 5: Wire up filter and quick-view JavaScript

**Files:**
- Create: `src/utils/mediaGrid/quickView.ts`
- Create: `src/utils/mediaGrid/index.ts`
- Modify: `src/pages/media/index.astro` (append `<script>` block)

- [ ] **Step 1: Create `quickView.ts`**

```typescript
// src/utils/mediaGrid/quickView.ts
export interface QuickViewEntry {
  slug: string;
  title: string;
  type: string;
  isFavorite: boolean;
  emblem: string;
  tags: string[];
  excerpt: string;
}

export function openPanel(entry: QuickViewEntry): void {
  const panel = document.getElementById('quick-view-panel');
  const layout = document.getElementById('media-layout');
  if (!panel || !layout) return;

  const typeEl    = document.getElementById('qv-type');
  const titleEl   = document.getElementById('qv-title');
  const tagsEl    = document.getElementById('qv-tags');
  const excerptEl = document.getElementById('qv-excerpt');
  const linkEl    = document.getElementById('qv-link') as HTMLAnchorElement | null;
  const emblemEl  = document.getElementById('qv-emblem');

  if (typeEl)    typeEl.textContent    = entry.isFavorite ? `★ ${entry.type}` : entry.type;
  if (titleEl)   titleEl.textContent   = entry.title;
  if (excerptEl) excerptEl.textContent = entry.excerpt;
  if (linkEl)    linkEl.href           = `/media/${entry.slug}`;
  if (emblemEl)  emblemEl.innerHTML    = `<img src="${entry.emblem}" alt="" loading="lazy" />`;

  if (tagsEl) {
    tagsEl.innerHTML = entry.tags
      .map(t => `<span class="qv-tag">${t}</span>`)
      .join('');
  }

  panel.hidden = false;
  layout.classList.add('panel-open');

  const url = new URL(window.location.href);
  url.searchParams.set('open', entry.slug);
  history.pushState({ open: entry.slug }, '', url.toString());
}

export function closePanel(): void {
  const panel = document.getElementById('quick-view-panel');
  const layout = document.getElementById('media-layout');
  if (!panel || !layout) return;

  panel.hidden = true;
  layout.classList.remove('panel-open');

  const url = new URL(window.location.href);
  url.searchParams.delete('open');
  history.pushState({}, '', url.toString());
}
```

- [ ] **Step 2: Create `index.ts`**

```typescript
// src/utils/mediaGrid/index.ts
export { filterEntries, parseFilterState, buildFilterURL } from './filterEngine';
export { openPanel, closePanel } from './quickView';
export type { FilterState, FilterableEntry } from './filterEngine';
export type { QuickViewEntry } from './quickView';
```

- [ ] **Step 3: Append the `<script>` block to `src/pages/media/index.astro`**

Add this immediately before the closing `</BaseLayout>` tag:

```astro
<script>
  import {
    filterEntries,
    parseFilterState,
    buildFilterURL,
    openPanel,
    closePanel,
  } from '../../utils/mediaGrid/index';
  import type { FilterableEntry, QuickViewEntry } from '../../utils/mediaGrid/index';

  type FullEntry = FilterableEntry & QuickViewEntry;

  function init() {
    const dataEl   = document.getElementById('entry-data');
    const countEl  = document.getElementById('media-count');
    const gridEl   = document.getElementById('media-grid');
    const closeBtn = document.getElementById('qv-close');

    if (!dataEl || !gridEl) return;

    const allEntries: FullEntry[] = JSON.parse(dataEl.dataset.entries ?? '[]');

    // ── Filter ──────────────────────────────────────
    let state = parseFilterState(window.location.search);

    function applyFilter() {
      const visible = filterEntries(allEntries, state);
      const visibleSlugs = new Set(visible.map(e => e.slug));

      let staggerIdx = 0;
      gridEl!.querySelectorAll<HTMLElement>('.media-card').forEach(card => {
        const isVisible = visibleSlugs.has(card.dataset.slug ?? '');
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          card.style.setProperty('--stagger-delay', `${staggerIdx * 50}ms`);
          staggerIdx++;
        }
      });

      if (countEl) countEl.textContent = String(visible.length);

      // Update URL without pushing a new history entry
      history.replaceState(history.state, '', buildFilterURL(state));
    }

    // Type pills
    gridEl.closest('.media-container')
      ?.querySelectorAll<HTMLElement>('.filter-pill[data-type]')
      .forEach(pill => {
        pill.addEventListener('click', () => {
          state = { ...state, type: pill.dataset.type ?? 'all' };

          pill.closest('.filter-bar')
            ?.querySelectorAll('.filter-pill[data-type]')
            .forEach(p => {
              p.classList.toggle('is-active', p === pill);
              p.setAttribute('aria-pressed', String(p === pill));
            });

          applyFilter();
        });
      });

    // Favorites pill
    gridEl.closest('.media-container')
      ?.querySelectorAll<HTMLElement>('.filter-pill[data-fav]')
      .forEach(pill => {
        pill.addEventListener('click', () => {
          state = { ...state, favOnly: !state.favOnly };
          pill.classList.toggle('is-active', state.favOnly);
          pill.setAttribute('aria-pressed', String(state.favOnly));
          applyFilter();
        });
      });

    // Sync pill UI with initial URL state
    function syncPillUI() {
      const bar = gridEl!.closest('.media-container')?.querySelector('.filter-bar');
      if (!bar) return;

      bar.querySelectorAll<HTMLElement>('.filter-pill[data-type]').forEach(p => {
        const active = p.dataset.type === state.type;
        p.classList.toggle('is-active', active);
        p.setAttribute('aria-pressed', String(active));
      });

      bar.querySelectorAll<HTMLElement>('.filter-pill[data-fav]').forEach(p => {
        p.classList.toggle('is-active', state.favOnly);
        p.setAttribute('aria-pressed', String(state.favOnly));
      });
    }

    syncPillUI();
    applyFilter();

    // ── Quick-view ──────────────────────────────────
    gridEl.querySelectorAll<HTMLElement>('.media-card').forEach(card => {
      card.addEventListener('click', e => {
        e.preventDefault();
        const slug = card.dataset.slug;
        const entry = allEntries.find(e => e.slug === slug);
        if (entry) openPanel(entry);
      });
    });

    closeBtn?.addEventListener('click', closePanel);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePanel();
    });

    // Restore panel if URL has ?open= on load
    const openSlug = new URLSearchParams(window.location.search).get('open');
    if (openSlug) {
      const entry = allEntries.find(e => e.slug === openSlug);
      if (entry) openPanel(entry);
    }

    // ── popstate ────────────────────────────────────
    window.addEventListener('popstate', () => {
      state = parseFilterState(window.location.search);
      syncPillUI();
      applyFilter();

      const openSlug = new URLSearchParams(window.location.search).get('open');
      if (!openSlug) {
        closePanel();
      } else {
        const entry = allEntries.find(e => e.slug === openSlug);
        if (entry) openPanel(entry);
      }
    });
  }

  document.addEventListener('astro:page-load', init);
  if (document.readyState !== 'loading') init();
</script>
```

- [ ] **Step 4: Run dev server and manually verify**

```bash
npm run dev
```

Open `http://localhost:4321/media` and check:
- All media entries appear as cards.
- Clicking a type pill filters the grid and updates the URL.
- Clicking `★ favorites` filters to favorites; stacks with type filters.
- Clicking a card opens the quick-view panel on the right with title, type, tags, excerpt, and "open full entry →" link.
- Pressing ESC or clicking ✕ closes the panel.
- Navigating to `/media?fav=1` pre-selects the favorites filter.
- Navigating to `/media?open=some-slug` opens the panel for that entry.

- [ ] **Step 5: Run build to confirm no type errors**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/utils/mediaGrid/ src/pages/media/index.astro
git commit -m "feat: add filter and quick-view interactivity to media grid"
```

---

## Task 6: Update homepage — KAIMA tile, remove favorites + live tiles

**Files:**
- Modify: `src/pages/index.astro`

This task:
1. Removes the favorites tile (rows 2-3, col 6).
2. Adds the KAIMA tile in the same slot.
3. Removes the standalone live tile from row 5.
4. Updates `applyLiveState` and `startLivePolling` to target the KAIMA tile.
5. Adds CSS for the KAIMA tile and Watch Live button.

- [ ] **Step 1: Replace the favorites tile with the KAIMA tile**

In `src/pages/index.astro`, find the favorites `BentoTile` block (around line 188-201):

```astro
      <BentoTile
        href="/favorites"
        variant="dark"
        label="Favorites"
        title="Inspirations"
        description="My favorite characters, series, and soundtracks."
        class="bento-tile--span-1x2"
      >
        <div class="tile-favorites-count">
          <span class="tile-favorites-count__num">{favoritesCount}</span>
          <span class="tile-favorites-count__label">curated<br />entries</span>
        </div>
      </BentoTile>
```

Replace it with:

```astro
      <a
        id="kaima-tile"
        href="https://www.youtube.com/@kaima-mask"
        target="_blank"
        rel="noopener noreferrer"
        class="bento-tile bento-tile--full bento-tile--small bento-tile--dark bento-tile--interactive bento-tile--span-1x2 kaima-tile"
      >
        <div class="bento-tile__header">
          <span class="bento-tile__label">KAIMA</span>
          <h3 class="bento-tile__title">悔魔</h3>
        </div>
        <div class="kaima-tile__body">
          <span class="kaima-tile__desc">upcoming · session log</span>
          <div
            id="kaima-watch-btn"
            class="kaima-watch-btn"
            role="link"
            tabindex="-1"
            aria-label="Watch live stream"
            data-href="https://www.youtube.com/@kaima-mask"
            hidden
          >
            <span class="kaima-watch-btn__dot"></span>
            Watch<br>Live
          </div>
        </div>
      </a>
```

- [ ] **Step 2: Remove the standalone live tile**

Find and delete the entire `<a id="live-tile" ...>` block (around line 294-313):

```astro
      <a
        id="live-tile"
        href="https://www.youtube.com/@kaima-mask"
        target="_blank"
        rel="noopener noreferrer"
        class="bento-tile bento-tile--dark bento-tile--span-2x1 live-tile"
      >
        <div class="live-tile__header">
          <span class="live-tile__badge" id="live-badge" aria-live="polite">Stream</span>
          <span class="live-tile__platform">YouTube</span>
        </div>
        <div class="live-tile__channel">KAIMA 悔魔</div>
        <div class="live-tile__handle">@kaima-mask</div>
        <hr class="live-tile__divider" />
        <div class="live-tile__cta" id="live-cta">not streaming right now</div>
      </a>
```

- [ ] **Step 3: Remove the `favoritesCount` variable from the frontmatter**

In the frontmatter (around line 53), find and delete:

```typescript
const favoritesCount = media.filter(e => e.data.isFavorite).length;
```

- [ ] **Step 4: Update `applyLiveState` in the `<script>` block**

Find the existing `applyLiveState` function and replace it with:

```typescript
  function applyLiveState(isLive: boolean, videoId: string | null): void {
    const kaimaTile = document.getElementById('kaima-tile') as HTMLAnchorElement | null;
    const watchBtn  = document.getElementById('kaima-watch-btn') as HTMLElement | null;
    const container = document.querySelector<HTMLElement>('.container');

    if (!kaimaTile || !container) return;

    const liveUrl = videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : 'https://www.youtube.com/@kaima-mask';

    if (isLive) {
      kaimaTile.classList.add('is-live');
      container.classList.add('is-live');
      if (watchBtn) {
        watchBtn.hidden = false;
        watchBtn.setAttribute('tabindex', '0');
        watchBtn.dataset.href = liveUrl;
      }
    } else {
      kaimaTile.classList.remove('is-live');
      container.classList.remove('is-live');
      if (watchBtn) {
        watchBtn.hidden = true;
        watchBtn.setAttribute('tabindex', '-1');
        watchBtn.dataset.href = 'https://www.youtube.com/@kaima-mask';
      }
    }
  }
```

- [ ] **Step 5: Add Watch Live button click handler and update media tile description**

In the `<script>` block, find `function initializeEmblemLinks()` and add a new function immediately after its closing brace (before `function initializeTilt()`):

```typescript
  function initializeKaimaWatchBtn() {
    const watchBtn = document.getElementById('kaima-watch-btn');
    if (!watchBtn) return;

    const navigate = () => {
      window.open(watchBtn.dataset.href!, '_blank', 'noopener,noreferrer');
    };

    watchBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      navigate();
    });

    watchBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        navigate();
      }
    });
  }
```

Then find the block that calls `initializeEmblemLinks()` on first load (around line 1386-1390 of the original file):

```typescript
  initializeLatestTile();
  initializeNovelTile();
  initializeEmblemLinks();
  initializeTilt();
  startLivePolling();
```

Add `initializeKaimaWatchBtn();` after `initializeEmblemLinks();` in **both** this block and inside the `document.addEventListener('astro:page-load', ...)` block that mirrors it:

```typescript
  initializeLatestTile();
  initializeNovelTile();
  initializeEmblemLinks();
  initializeKaimaWatchBtn();
  initializeTilt();
  startLivePolling();
```

Also update the media tile description. Find this BentoTile in the template:

```astro
      <BentoTile
        href="/media"
        variant="dark"
        label="Media"
        title="Logbook"
        description="My thoughts on anime, manga, movies, and more."
        class="bento-tile--core bento-tile--span-2x2 media-tile"
      >
```

Change the `description` prop to:

```astro
        description="My thoughts on anime, manga, movies, and more — favorites included."
```

- [ ] **Step 6: Add KAIMA tile CSS**

In the `<style>` block, find the `/* ─── Live Stream Tile ───────────────────────────────── */` section. Replace the entire live tile CSS block (`.live-tile`, `.live-tile__*`, `.live-tile.is-live`, etc.) with:

```css
  /* ─── KAIMA Tile ─────────────────────────────────── */
  .kaima-tile {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      background var(--transition-base);
  }

  .kaima-tile__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    flex: 1;
  }

  .kaima-tile__desc {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-transform: lowercase;
    letter-spacing: 0.06em;
    line-height: 1.5;
  }

  /* Live state */
  .kaima-tile.is-live {
    border-color: #ff4040;
    background: #181212;
    box-shadow: 4px 4px 0 rgba(255, 64, 64, 0.35), 0 0 28px rgba(255, 64, 64, 0.12);
    animation: live-tile-pulse 2.5s ease-in-out infinite;
  }

  @keyframes live-tile-pulse {
    0%, 100% { box-shadow: 4px 4px 0 rgba(255, 64, 64, 0.35), 0 0 24px rgba(255, 64, 64, 0.12); }
    50%       { box-shadow: 4px 4px 0 rgba(255, 64, 64, 0.5),  0 0 40px rgba(255, 64, 64, 0.22); }
  }

  /* Watch Live button */
  .kaima-watch-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex-shrink: 0;
    width: 52px;
    padding: 8px 6px;
    border-radius: var(--radius-sm);
    background: #ff4040;
    color: #fff;
    font-family: var(--font-mono);
    font-size: 0.55rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-align: center;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.15);
    animation: btn-breathe 1.5s ease-in-out infinite;
  }

  @keyframes btn-breathe {
    0%, 100% { box-shadow: 0 0 10px rgba(255, 64, 64, 0.45); }
    50%       { box-shadow: 0 0 20px rgba(255, 64, 64, 0.85); }
  }

  .kaima-watch-btn:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  .kaima-watch-btn__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    animation: dot-flash 1s ease-in-out infinite;
  }

  @keyframes dot-flash {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  @media (prefers-reduced-motion: reduce) {
    .kaima-tile.is-live    { animation: none; }
    .kaima-watch-btn       { animation: none; }
    .kaima-watch-btn__dot  { animation: none; }
  }
```

Also remove any CSS referencing `.live-tile`, `.live-tile__*` classes that remain in the style block after this replacement.

- [ ] **Step 7: Verify in dev server**

```bash
npm run dev
```

Open `http://localhost:4321` and check:
- Favorites tile is gone.
- KAIMA tile appears in rows 2-3, col 6 with "KAIMA / 悔魔" and "upcoming · session log".
- The standalone live tile at the bottom is gone.
- Clicking the KAIMA tile opens the YouTube channel in a new tab.

To verify the live state manually, open the browser console and run:
```javascript
// Simulate live state
document.getElementById('kaima-tile').classList.add('is-live');
const btn = document.getElementById('kaima-watch-btn');
btn.hidden = false;
btn.setAttribute('tabindex', '0');
```
Expected: red border appears, Watch Live button fades in to the right of "upcoming · session log".

- [ ] **Step 8: Run build**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 9: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: replace favorites + live tiles with unified KAIMA tile"
```

---

## Done

All tasks complete. Verify end-to-end:

1. `npm run build && npm run preview`
2. `/media` — grid loads, filters work, quick-view opens and closes, URL state preserved.
3. `/favorites` — redirects to `/media?fav=1` with favorites filter active.
4. `/favorites/[some-slug]` — redirects to `/media/[some-slug]`.
5. Homepage — no favorites tile, KAIMA tile present, old live tile gone.
6. `npm run test` — all tests pass including the 14 new mediaGrid tests.
