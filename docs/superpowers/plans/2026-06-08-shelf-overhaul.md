# Shelf Overhaul + Decorative Elements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the shelf page with grouped P4R-style sections, a cycling character hero, a slide-in detail panel, and add diagonal dividers + shimmer headers + stream tile CRT glow.

**Architecture:** The shelf page is fully rewritten in-place as a single Astro file. Sorting logic is extracted to a new `src/utils/shelf.ts` utility (testable). The dead `src/utils/mediaGrid/` module is deleted. Global decorative CSS (dividers, shimmer keyframe) lands in `global.css` and `transitions.css`; homepage changes are scoped to `index.astro`.

**Tech Stack:** Astro 5, TypeScript, Vitest, vanilla CSS custom properties

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| **Create** | `src/utils/shelf.ts` | `sortShelfSection()` — three-tier entry sorting |
| **Create** | `src/tests/shelf.test.ts` | Unit tests for `sortShelfSection` |
| **Modify** | `src/styles/transitions.css` | Add `shimmer-sweep` keyframe |
| **Modify** | `src/styles/global.css` | Add `.shelf-divider` / `.shelf-divider--flip` styles |
| **Modify** | `src/pages/index.astro` | Stream tile CRT glow + homepage row dividers |
| **Overwrite** | `src/pages/shelf/index.astro` | Full overhaul — structure, CSS, JS |
| **Delete** | `src/utils/mediaGrid/filterEngine.ts` | Dead code after overhaul |
| **Delete** | `src/utils/mediaGrid/index.ts` | Dead code after overhaul |
| **Delete** | `src/tests/mediaGrid.test.ts` | Tests for deleted utility |

---

## Task 1: Sorting utility + tests

**Files:**
- Create: `src/utils/shelf.ts`
- Create: `src/tests/shelf.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/shelf.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { sortShelfSection } from '../utils/shelf';

type E = { isFavorite: boolean; hasContent: boolean; date: Date | null; label: string };

describe('sortShelfSection', () => {
  it('places favorites before non-favorites regardless of date', () => {
    const entries: E[] = [
      { isFavorite: false, hasContent: true,  date: new Date('2025-01-01'), label: 'reviewed' },
      { isFavorite: true,  hasContent: false, date: new Date('2020-01-01'), label: 'fav-old' },
    ];
    const result = sortShelfSection(entries);
    expect(result[0].label).toBe('fav-old');
  });

  it('places reviewed (hasContent) before unreviewed within non-favorites', () => {
    const entries: E[] = [
      { isFavorite: false, hasContent: false, date: new Date('2025-06-01'), label: 'unreviewed-new' },
      { isFavorite: false, hasContent: true,  date: new Date('2020-01-01'), label: 'reviewed-old' },
    ];
    const result = sortShelfSection(entries);
    expect(result[0].label).toBe('reviewed-old');
  });

  it('sorts by date descending within each tier', () => {
    const entries: E[] = [
      { isFavorite: true, hasContent: true, date: new Date('2023-01-01'), label: 'fav-old' },
      { isFavorite: true, hasContent: true, date: new Date('2025-06-01'), label: 'fav-new' },
    ];
    const result = sortShelfSection(entries);
    expect(result[0].label).toBe('fav-new');
  });

  it('treats null date as oldest (sorts to end of tier)', () => {
    const entries: E[] = [
      { isFavorite: false, hasContent: true, date: null,                   label: 'no-date' },
      { isFavorite: false, hasContent: true, date: new Date('2024-01-01'), label: 'has-date' },
    ];
    const result = sortShelfSection(entries);
    expect(result[0].label).toBe('has-date');
  });

  it('returns empty array unchanged', () => {
    expect(sortShelfSection([])).toEqual([]);
  });

  it('favorites with no content are not dimmed (isFavorite takes priority)', () => {
    // The function sorts, not dims — but this verifies favorites always precede non-favs
    const entries: E[] = [
      { isFavorite: false, hasContent: true,  date: new Date('2025-01-01'), label: 'reviewed' },
      { isFavorite: true,  hasContent: false, date: new Date('2020-01-01'), label: 'fav-no-content' },
    ];
    const result = sortShelfSection(entries);
    expect(result[0].label).toBe('fav-no-content');
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm run test -- shelf.test.ts
```

Expected: FAIL — `Cannot find module '../utils/shelf'`

- [ ] **Step 3: Implement `src/utils/shelf.ts`**

```typescript
export type SortableEntry = {
  isFavorite: boolean;
  hasContent: boolean;
  date: Date | null;
};

export function sortShelfSection<T extends SortableEntry>(entries: T[]): T[] {
  const byDate = (a: T, b: T) =>
    (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0);

  const favs      = entries.filter(e =>  e.isFavorite).sort(byDate);
  const reviewed  = entries.filter(e => !e.isFavorite &&  e.hasContent).sort(byDate);
  const unreviewed = entries.filter(e => !e.isFavorite && !e.hasContent).sort(byDate);

  return [...favs, ...reviewed, ...unreviewed];
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm run test -- shelf.test.ts
```

Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/shelf.ts src/tests/shelf.test.ts
git commit -m "feat: add sortShelfSection utility with three-tier entry sorting"
```

---

## Task 2: Global CSS — shimmer keyframe + shelf divider styles

**Files:**
- Modify: `src/styles/transitions.css`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add `shimmer-sweep` keyframe to `transitions.css`**

Open `src/styles/transitions.css` and append after the last existing `@keyframes` block (before the stagger classes):

```css
/* Shimmer sweep — used on shelf section headers and homepage title */
@keyframes shimmer-sweep {
  0%   { background-position: 300% center; }
  100% { background-position: -300% center; }
}
```

- [ ] **Step 2: Add `.shelf-divider` to `global.css`**

Append to the end of `src/styles/global.css`:

```css
/* ── Shelf / Homepage section dividers ───────────────── */
.shelf-divider {
  height: 36px;
  background: var(--color-bg-base);
  clip-path: polygon(0 0, 100% 12px, 100% 100%, 0 100%);
  position: relative;
  pointer-events: none;
}

.shelf-divider::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(255, 229, 44, 0.18) 0%,
    rgba(255, 229, 44, 0.06) 60%,
    transparent 100%
  );
}

.shelf-divider--flip {
  clip-path: polygon(0 12px, 100% 0, 100% 100%, 0 100%);
}

.shelf-divider--flip::before {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 229, 44, 0.06) 40%,
    rgba(255, 229, 44, 0.18) 100%
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/transitions.css src/styles/global.css
git commit -m "feat: add shimmer-sweep keyframe and shelf-divider shared styles"
```

---

## Task 3: Homepage — stream tile CRT glow + row dividers

**Files:**
- Modify: `src/pages/index.astro` (scoped `<style>` block only)

The homepage `index.astro` scoped style block already has a long `.stream-tile` section. Make two additions:

- [ ] **Step 1: Add CRT glow `::after` to the stream tile**

In the `<style>` block of `src/pages/index.astro`, find the `.stream-tile` rule and add after it:

```css
/* CRT inset glow — always present, warms to red when live */
.stream-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 22px rgba(255, 229, 44, 0.04);
  pointer-events: none;
  z-index: 2;
  border-radius: inherit;
  transition: box-shadow 300ms;
}

.stream-tile:hover::after {
  box-shadow: inset 0 0 28px rgba(255, 229, 44, 0.08);
}

.stream-tile.is-live::after {
  box-shadow: inset 0 0 22px rgba(255, 64, 64, 0.1);
}
```

Also add to the existing `@media (prefers-reduced-motion: reduce)` block inside the `<style>`:

```css
.stream-tile::after { transition: none; }
```

- [ ] **Step 2: Add diagonal dividers between BentoGrid row groups**

In the JSX template of `src/pages/index.astro`, add two divider elements. The BentoGrid currently has tiles flowing in this order:
1. `.title-tile` + `#yt-tile` + Now `BentoTile` (fills row 1, 6 cols)
2. Showcase `BentoTile` + Notes `BentoTile` + `#stream-tile` (rows 2–3)
3. Shelf `BentoTile` + `#latest-tile` + Novel `<a>` + MAL + Spotify + fillers (rows 4–5)

Insert a full-width divider element **after the Now BentoTile** (between row group 1 and rows 2–3):

```astro
<!-- Diagonal divider — row 1 → rows 2-3 -->
<div class="shelf-divider" style="grid-column: 1 / -1;" aria-hidden="true"></div>
```

Insert a flipped divider **after `#stream-tile`** (between rows 2–3 and rows 4–5):

```astro
<!-- Diagonal divider — rows 2-3 → rows 4-5 -->
<div class="shelf-divider shelf-divider--flip" style="grid-column: 1 / -1;" aria-hidden="true"></div>
```

- [ ] **Step 3: Run dev server and visually verify**

```bash
npm run dev
```

Open `http://localhost:4321`. Verify:
- Stream tile has a faint warm glow visible on hover
- Thin diagonal cuts appear between the BentoGrid row groups (subtle — at 36px height they're nearly invisible but create a slight angled break)
- Live state CRT glow (test by temporarily adding `.is-live` class in devtools)

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add stream tile CRT glow and homepage row diagonal dividers"
```

---

## Task 4: Shelf page — static structure, CSS (no panel/carousel JS yet)

**Files:**
- Overwrite: `src/pages/shelf/index.astro`

This is the largest task. The complete new file is built here. Panel and carousel JS are added in later tasks.

- [ ] **Step 1: Replace the frontmatter**

The new frontmatter groups entries by type and sorts within each group:

```typescript
---
import { getCollection, type CollectionEntry } from 'astro:content';
import { hasMinimalContent, stripMarkdown } from '../../utils/content';
import { sortShelfSection, type SortableEntry } from '../../utils/shelf';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NavPill from '../../components/NavPill.astro';

const TYPE_ORDER = ['anime', 'manga', 'film', 'series', 'music', 'book', 'game', 'character', 'other'] as const;
type ContentType = typeof TYPE_ORDER[number];

const TYPE_LABELS: Record<ContentType, string> = {
  anime: 'Anime',
  manga: 'Manga',
  film: 'Films',
  series: 'Series',
  music: 'Music',
  book: 'Books',
  game: 'Games',
  character: 'Characters',
  other: 'Other',
};

type ShelfEntry = CollectionEntry<'shelf'> & SortableEntry;

const allShelf = await getCollection('shelf', ({ data }) => !data.draft);

// Group by content_type in TYPE_ORDER, sort each group three-tier
const grouped: Array<{ type: ContentType; entries: ShelfEntry[] }> = [];

for (const type of TYPE_ORDER) {
  const typeEntries = allShelf.filter(e => e.data.content_type === type);
  if (typeEntries.length === 0) continue;

  const annotated: ShelfEntry[] = typeEntries.map(e => ({
    ...e,
    isFavorite: e.data.isFavorite ?? false,
    hasContent: !hasMinimalContent(e.body),
    date: e.data.updatedAt ?? e.data.publishedAt ?? null,
  }));

  grouped.push({ type, entries: sortShelfSection(annotated) });
}

const totalCount = allShelf.length;

// Serialize all entries for panel JS
const entryData = allShelf.map(e => ({
  slug: e.slug,
  title: e.data.title,
  type: e.data.content_type,
  isFavorite: e.data.isFavorite ?? false,
  emblem: e.data.emblem ?? '/images/emblems/default.svg',
  tags: e.data.tags ?? [],
  publishedAt: e.data.publishedAt?.toISOString() ?? null,
  updatedAt: e.data.updatedAt?.toISOString() ?? null,
}));

// Serialize character entries for hero carousel
const characterGroup = grouped.find(g => g.type === 'character');
const characterData = (characterGroup?.entries ?? []).map(e => ({
  slug: e.slug,
  title: e.data.title,
  emblem: e.data.emblem ?? '/images/emblems/default.svg',
  tags: e.data.tags ?? [],
  excerpt: stripMarkdown(e.body ?? '').slice(0, 120),
  publishedAt: e.data.publishedAt?.toISOString() ?? null,
}));
---
```

- [ ] **Step 2: Write the HTML template**

```astro
<BaseLayout title="Shelf" description="My thoughts on anime, manga, movies, and more — favorites included." ogImage="/social-default.svg">
  <div id="entry-data" data-entries={JSON.stringify(entryData)} hidden></div>

  <div class="shelf-page">
    <header class="shelf-header">
      <span class="shelf-header__eyebrow">catalog</span>
      <h1 class="shelf-header__title">Shelf</h1>
      <p class="shelf-header__count">{totalCount} entries</p>
    </header>

    <nav class="shelf-jumpbar" aria-label="Jump to section">
      {grouped.map(({ type }) => (
        <a
          href={`#section-${type}`}
          class="shelf-jumpbar__link"
          data-type={type}
          aria-current="false"
        >
          {TYPE_LABELS[type]}
        </a>
      ))}
    </nav>

    {grouped.map(({ type, entries }, groupIndex) => (
      <>
        {groupIndex > 0 && (
          <div
            class:list={['shelf-divider', { 'shelf-divider--flip': groupIndex % 2 === 1 }]}
            aria-hidden="true"
          />
        )}

        <section id={`section-${type}`} class="shelf-section">
          <header class="shelf-section__header">
            <h2>{TYPE_LABELS[type]}</h2>
            <div class="shelf-section__line" aria-hidden="true"></div>
            <span class="shelf-section__count">{entries.length}</span>
          </header>

          {type === 'character' && characterData.length > 0 && (
            <div class="shelf-hero" data-characters={JSON.stringify(characterData)}>
              <button class="shelf-hero__prev" aria-label="Previous character" type="button">‹</button>
              <a
                class="shelf-hero__portrait-link"
                href={`/shelf/${characterData[0]?.slug}`}
                tabindex="-1"
                aria-hidden="true"
              >
                <div class="shelf-hero__portrait">
                  <img
                    class="shelf-hero__portrait-img"
                    src={characterData[0]?.emblem ?? '/images/emblems/default.svg'}
                    alt={characterData[0]?.title ?? ''}
                  />
                </div>
              </a>
              <div class="shelf-hero__info">
                <p class="shelf-hero__eyebrow">
                  character · 1 / {characterData.length}
                </p>
                <h3 class="shelf-hero__name">{characterData[0]?.title ?? ''}</h3>
                <div class="shelf-hero__tags">
                  {(characterData[0]?.tags ?? []).map(tag => (
                    <span class="shelf-hero__tag">{tag}</span>
                  ))}
                </div>
                {characterData[0]?.excerpt && (
                  <p class="shelf-hero__excerpt">{characterData[0].excerpt}</p>
                )}
                <a class="shelf-hero__link" href={`/shelf/${characterData[0]?.slug}`}>
                  Read more →
                </a>
              </div>
              <button class="shelf-hero__next" aria-label="Next character" type="button">›</button>
            </div>
          )}

          <div class="shelf-grid">
            {entries.map((entry, i) => (
              <a
                href={`/shelf/${entry.slug}`}
                class:list={[
                  'shelf-card',
                  { 'shelf-card--dim': !entry.isFavorite && !entry.hasContent },
                ]}
                data-slug={entry.slug}
                style={`--card-index: ${i}`}
                aria-label={entry.data.title}
              >
                <div class="shelf-card__poster">
                  <img
                    src={entry.data.emblem ?? '/images/emblems/default.svg'}
                    alt=""
                    class="shelf-card__img"
                    loading="lazy"
                  />
                </div>
                <div class:list={['shelf-card__bar', { 'shelf-card__bar--fav': entry.isFavorite }]}>
                  <span class:list={['shelf-card__title', { 'shelf-card__title--fav': entry.isFavorite }]}>
                    {entry.data.title}
                  </span>
                  {entry.isFavorite && (
                    <span class="shelf-card__star" aria-hidden="true">★</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      </>
    ))}
  </div>

  <!-- Slide-in panel (activated in Task 5) -->
  <div id="shelf-backdrop" class="shelf-backdrop" hidden aria-hidden="true"></div>
  <aside
    id="shelf-panel"
    class="shelf-panel"
    hidden
    role="dialog"
    aria-modal="true"
    aria-label="Entry detail"
    tabindex="-1"
  >
    <button class="shelf-panel__close" id="shelf-panel-close" aria-label="Close panel">✕</button>
    <div class="shelf-panel__poster">
      <img src="" alt="" class="shelf-panel__poster-img" id="shelf-panel-img" />
    </div>
    <div class="shelf-panel__content" id="shelf-panel-content"></div>
    <a class="shelf-panel__link" id="shelf-panel-link" href="#">Open full entry →</a>
  </aside>

  <NavPill />
</BaseLayout>
```

- [ ] **Step 3: Write the scoped `<style>` block**

```css
<style>
  /* ── Page ────────────────────────────────────────── */
  .shelf-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-lg) calc(var(--space-xl) * 3);
  }

  /* ── Header ──────────────────────────────────────── */
  .shelf-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
    flex-wrap: wrap;
  }
  .shelf-header__eyebrow {
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--color-muted);
  }
  .shelf-header__title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 900;
    color: var(--color-text);
    line-height: 1;
  }
  .shelf-header__count {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-muted);
    margin-left: auto;
  }

  /* ── Sticky Jump-Bar ─────────────────────────────── */
  .shelf-jumpbar {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    align-items: stretch;
    background: var(--color-bg-base);
    border-bottom: 1px solid var(--color-border, #2a2a2a);
    margin-bottom: var(--space-xl);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .shelf-jumpbar::-webkit-scrollbar { display: none; }

  .shelf-jumpbar__link {
    padding: 10px 16px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    white-space: nowrap;
    text-decoration: none;
    transition: color 150ms, border-color 150ms;
    margin-bottom: -1px;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  .shelf-jumpbar__link:hover { color: var(--color-text); }
  .shelf-jumpbar__link.is-active,
  .shelf-jumpbar__link[aria-current="true"] {
    color: var(--color-gold);
    border-bottom-color: var(--color-gold);
  }

  /* ── Section ─────────────────────────────────────── */
  .shelf-section {
    margin-bottom: var(--space-2xl);
  }

  .shelf-section__header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: var(--space-lg);
  }

  .shelf-section__header h2 {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    /* Shimmer sweep — keyframe defined in transitions.css */
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

  .shelf-section__line {
    flex: 1;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(255, 229, 44, 0.3) 0%,
      transparent 100%
    );
  }

  .shelf-section__count {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--color-muted);
  }

  /* ── Card Grid ───────────────────────────────────── */
  .shelf-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: var(--space-md);
    align-content: start;
  }

  /* ── Individual Card ─────────────────────────────── */
  .shelf-card {
    position: relative;
    display: block;
    text-decoration: none;
    color: var(--color-text);
    cursor: pointer;
    animation: card-in 400ms var(--animation-easing, ease) both;
    animation-delay: min(calc(var(--card-index, 0) * 40ms), 1200ms);
  }

  @keyframes card-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .shelf-card--dim { filter: opacity(0.52); }

  .shelf-card__poster {
    position: relative;
    aspect-ratio: 2/3;
    overflow: hidden;
    border-radius: 4px;
    background: var(--color-bg-elevated, #1a1a1a);
    border: 1px solid transparent;
    transition: border-color 200ms, box-shadow 200ms;
  }

  .shelf-card:hover .shelf-card__poster {
    border-color: var(--color-gold);
    box-shadow: 0 0 14px rgba(255, 229, 44, 0.15);
  }

  .shelf-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: filter 200ms;
  }
  .shelf-card:hover .shelf-card__img { filter: brightness(1.08); }

  .shelf-card__bar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 6px 5px;
    background: #0d0d0d;
    border-top: 1px solid #252525;
    border-radius: 0 0 4px 4px;
  }
  .shelf-card__bar--fav {
    border-top-color: rgba(255, 229, 44, 0.35);
  }

  .shelf-card__title {
    font-family: var(--font-mono);
    font-size: 8px;
    color: var(--color-text);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }
  .shelf-card__title--fav { color: var(--color-gold); }

  .shelf-card__star {
    font-size: 8px;
    color: var(--color-gold);
    flex-shrink: 0;
    line-height: 1;
  }

  /* ── Character Hero ──────────────────────────────── */
  .shelf-hero {
    display: grid;
    grid-template-columns: auto 200px 1fr auto;
    align-items: center;
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
    padding: var(--space-lg);
    background: var(--color-bg-elevated);
    border-left: 4px solid var(--color-gold);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    background-image: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 18px,
      rgba(255, 229, 44, 0.02) 18px,
      rgba(255, 229, 44, 0.02) 19px
    );
    position: relative;
  }

  .shelf-hero__prev,
  .shelf-hero__next {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--color-muted);
    flex-shrink: 0;
    cursor: pointer;
    transition: color 150ms, background 150ms, border-color 150ms;
  }
  .shelf-hero__prev:hover,
  .shelf-hero__next:hover {
    color: var(--color-gold);
    background: rgba(255, 229, 44, 0.08);
    border-color: rgba(255, 229, 44, 0.3);
  }

  .shelf-hero__portrait-link { display: block; }

  .shelf-hero__portrait {
    width: 200px;
    aspect-ratio: 2/3;
    overflow: hidden;
    border-radius: var(--radius-sm);
    background: var(--color-bg-surface);
    box-shadow: var(--shadow-hard);
    flex-shrink: 0;
  }

  .shelf-hero__portrait-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: opacity 300ms ease;
  }

  .shelf-hero__info {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    min-width: 0;
  }

  .shelf-hero__eyebrow {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-muted);
  }

  .shelf-hero__name {
    font-size: clamp(1.2rem, 3vw, 2rem);
    font-weight: 900;
    color: var(--color-gold);
    line-height: 1.1;
    transition: opacity 300ms ease, transform 300ms ease;
  }

  .shelf-hero__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .shelf-hero__tag {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border: 1px solid rgba(255, 229, 44, 0.25);
    border-radius: 12px;
    color: rgba(255, 229, 44, 0.6);
    background: rgba(255, 229, 44, 0.05);
  }

  .shelf-hero__excerpt {
    font-size: 0.875rem;
    color: var(--color-muted);
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .shelf-hero__link {
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-gold-dim);
    text-decoration: none;
    align-self: flex-start;
    transition: color 150ms;
  }
  .shelf-hero__link:hover { color: var(--color-gold); }

  /* ── Slide-In Panel ──────────────────────────────── */
  .shelf-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 90;
  }
  .shelf-backdrop[hidden] { display: none; }

  .shelf-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 360px;
    z-index: 100;
    background: var(--color-bg-deep, #0a0a0a);
    border-left: 1px solid rgba(255, 229, 44, 0.15);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    transform: translateX(100%);
    transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
    outline: none;
  }
  .shelf-panel[hidden] { display: none; }
  /* JS removes [hidden] then sets transform via class */
  .shelf-panel.is-open { transform: translateX(0); }

  .shelf-panel__close {
    position: sticky;
    top: 0;
    align-self: flex-end;
    margin: var(--space-md) var(--space-md) 0;
    z-index: 10;
    background: none;
    border: none;
    color: var(--color-muted);
    font-size: 16px;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: color 150ms, background 150ms;
  }
  .shelf-panel__close:hover {
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.06);
  }

  .shelf-panel__poster {
    flex-shrink: 0;
    overflow: hidden;
    background: var(--color-bg-elevated);
  }
  .shelf-panel__poster-img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    display: block;
    max-height: 320px;
    object-position: top;
  }

  .shelf-panel__content {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    flex: 1;
  }

  /* Panel content JS-injected classes */
  :global(.sp-type) {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-muted);
    margin: 0;
  }
  :global(.sp-title) {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    font-weight: 900;
    color: var(--color-gold);
    line-height: 1.1;
    margin: 0;
  }
  :global(.sp-tags) {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0;
  }
  :global(.sp-tag) {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border: 1px solid rgba(255, 229, 44, 0.25);
    border-radius: 12px;
    color: rgba(255, 229, 44, 0.6);
    background: rgba(255, 229, 44, 0.05);
  }
  :global(.sp-date) {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-muted);
    margin: 0;
  }
  :global(.sp-prose) {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--color-muted);
  }

  .shelf-panel__link {
    display: block;
    margin: 0 var(--space-lg) var(--space-xl);
    padding: 10px 16px;
    border: 1px solid rgba(255, 229, 44, 0.25);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-gold-dim);
    text-decoration: none;
    text-align: center;
    transition: color 150ms, border-color 150ms, background 150ms;
  }
  .shelf-panel__link:hover {
    color: var(--color-gold);
    border-color: rgba(255, 229, 44, 0.5);
    background: rgba(255, 229, 44, 0.05);
  }

  /* ── Responsive ──────────────────────────────────── */
  @media (max-width: 768px) {
    .shelf-hero {
      grid-template-columns: auto 1fr auto;
      grid-template-rows: auto auto;
    }
    .shelf-hero__portrait-link {
      grid-column: 1 / -1;
      grid-row: 1;
    }
    .shelf-hero__portrait { width: 100%; max-width: 180px; margin: 0 auto; }
    .shelf-hero__prev { grid-column: 1; grid-row: 2; }
    .shelf-hero__info { grid-column: 2; grid-row: 2; }
    .shelf-hero__next { grid-column: 3; grid-row: 2; }

    .shelf-panel {
      width: 100vw;
      top: auto;
      height: 90vh;
      border-left: none;
      border-top: 1px solid rgba(255, 229, 44, 0.15);
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      transform: translateY(100%);
    }
    .shelf-panel.is-open { transform: translateY(0); }

    .shelf-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: var(--space-sm);
    }
    .shelf-header__count { margin-left: 0; width: 100%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .shelf-card { animation: none; }
    .shelf-card__img,
    .shelf-card__poster { transition: none; }
    .shelf-section__header h2 {
      animation: none;
      -webkit-text-fill-color: var(--color-text);
      background: none;
      color: var(--color-text);
    }
    .shelf-hero__portrait-img,
    .shelf-hero__name { transition: none; }
    .shelf-panel { transition: none; }
  }
</style>
```

- [ ] **Step 4: Add an empty `<script>` tag (placeholder for Tasks 5–7)**

```astro
<script>
  // Panel, carousel, and jumpbar JS added in Tasks 5–7
</script>
```

- [ ] **Step 5: Run dev server and verify static rendering**

```bash
npm run dev
```

Open `http://localhost:4321/shelf`. Verify:
- Page shows grouped sections (Anime, Manga, Films, etc.) with bold shimmer headers
- Diagonal dividers appear between sections (subtle angled cut)
- Favorites appear first in each section with gold title bar + ★
- Unreviewed entries are dimmed
- Character section shows the hero structure (static, not cycling yet)
- Jump-bar is visible and sticky on scroll
- Cards have the solid bottom-bar title (no gradient overlay)
- Panel and backdrop are hidden

- [ ] **Step 6: Commit**

```bash
git add src/pages/shelf/index.astro
git commit -m "feat: shelf page grouped sections with P4R card style and character hero"
```

---

## Task 5: Slide-in panel JS

**Files:**
- Modify: `src/pages/shelf/index.astro` (replace the empty `<script>` with full panel JS)

- [ ] **Step 1: Replace the empty `<script>` with panel JS**

```typescript
<script>
  type EntryData = {
    slug: string;
    title: string;
    type: string;
    isFavorite: boolean;
    emblem: string;
    tags: string[];
    publishedAt: string | null;
    updatedAt: string | null;
  };

  let activeFetch: AbortController | null = null;
  let pageCleanup: AbortController | null = null;

  function esc(s: unknown): string {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatDate(pub: string | null, upd: string | null): string {
    if (!pub) return '';
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    };
    const pubStr = new Date(pub).toLocaleDateString('en-US', opts);
    if (upd) {
      const updDate = new Date(upd);
      if (updDate > new Date(pub)) {
        return `${pubStr} · Updated ${updDate.toLocaleDateString('en-US', opts)}`;
      }
    }
    return pubStr;
  }

  function initShelfPage() {
    pageCleanup?.abort();
    pageCleanup = new AbortController();
    document.body.style.overflow = '';

    const entryDataEl = document.getElementById('entry-data');
    let entries: EntryData[] = [];
    try { entries = JSON.parse(entryDataEl?.dataset.entries || '[]'); } catch {}
    const entryMap = new Map(entries.map(e => [e.slug, e]));

    const backdrop = document.getElementById('shelf-backdrop') as HTMLElement | null;
    const panel    = document.getElementById('shelf-panel') as HTMLElement | null;
    const closeBtn = document.getElementById('shelf-panel-close');
    const panelImg = document.getElementById('shelf-panel-img') as HTMLImageElement | null;
    const panelContent = document.getElementById('shelf-panel-content') as HTMLElement | null;
    const panelLink = document.getElementById('shelf-panel-link') as HTMLAnchorElement | null;

    if (!panel || !backdrop) return;

    let previouslyFocused: HTMLElement | null = null;
    let panelPushedHistory = false;

    function openPanel(slug: string) {
      const entry = entryMap.get(slug);
      if (!entry || !panelImg || !panelContent || !panelLink) return;

      activeFetch?.abort();
      activeFetch = new AbortController();

      panelImg.src = entry.emblem;
      panelImg.alt = entry.title;
      panelLink.href = `/shelf/${encodeURIComponent(slug)}`;

      const dateStr = formatDate(entry.publishedAt, entry.updatedAt);
      panelContent.innerHTML = `
        <p class="sp-type">${esc(entry.type)}</p>
        <h2 class="sp-title">${esc(entry.title)}</h2>
        ${entry.tags.length
          ? `<div class="sp-tags">${entry.tags.map(t => `<span class="sp-tag">${esc(t)}</span>`).join('')}</div>`
          : ''}
        ${dateStr ? `<p class="sp-date">${esc(dateStr)}</p>` : ''}
        <div class="sp-prose" id="sp-prose-body">Loading…</div>
      `;

      const proseEl = panelContent.querySelector<HTMLElement>('#sp-prose-body');

      panel.hidden = false;
      backdrop.hidden = false;
      // rAF so the display:none removal happens before the transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => panel.classList.add('is-open'));
      });
      document.body.style.overflow = 'hidden';
      panel.focus();

      fetch(`/shelf/${encodeURIComponent(slug)}`, { signal: activeFetch.signal })
        .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.text(); })
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const prose = doc.querySelector('.entry__content');
          if (proseEl) {
            if (prose) proseEl.replaceWith(prose);
            else proseEl.remove();
          }
        })
        .catch(err => {
          if (err.name === 'AbortError') return;
          if (proseEl) {
            proseEl.textContent = 'Could not load entry.';
            proseEl.removeAttribute('id');
          }
        });
    }

    function closePanel(fromPop = false) {
      panel.classList.remove('is-open');
      document.body.style.overflow = '';
      activeFetch?.abort();

      // Wait for slide-out transition before hiding
      const onTransitionEnd = () => {
        panel.hidden = true;
        backdrop.hidden = true;
        panel.removeEventListener('transitionend', onTransitionEnd);
      };
      panel.addEventListener('transitionend', onTransitionEnd, { once: true });

      if (!fromPop) {
        if (panelPushedHistory) history.back();
        else history.replaceState(null, '', '/shelf');
      }
      panelPushedHistory = false;
      previouslyFocused?.focus();
      previouslyFocused = null;
    }

    // Card click
    document.querySelectorAll<HTMLAnchorElement>('.shelf-card').forEach(card => {
      card.addEventListener('click', e => {
        const slug = card.dataset.slug;
        if (!slug) return;
        e.preventDefault();
        previouslyFocused = card;
        history.pushState(null, '', `/shelf/${encodeURIComponent(slug)}`);
        panelPushedHistory = true;
        openPanel(slug);
      }, { signal: pageCleanup!.signal });
    });

    // Close on backdrop click, ✕ button, ESC
    backdrop.addEventListener('click', () => closePanel(), { signal: pageCleanup!.signal });
    closeBtn?.addEventListener('click', () => closePanel(), { signal: pageCleanup!.signal });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !panel.hidden) closePanel();
    }, { signal: pageCleanup!.signal });
    window.addEventListener('popstate', () => {
      if (!panel.hidden) closePanel(true);
    }, { signal: pageCleanup!.signal });

    // Open on initial ?open= param
    const params = new URLSearchParams(location.search);
    const initialOpen = params.get('open');
    if (initialOpen && entryMap.has(initialOpen)) {
      history.replaceState(null, '', `/shelf/${encodeURIComponent(initialOpen)}`);
      panelPushedHistory = false;
      previouslyFocused =
        document.querySelector<HTMLElement>(`[data-slug="${initialOpen}"]`) ??
        (document.body as HTMLElement);
      openPanel(initialOpen);
    }

    // Carousel and jumpbar will be added next
  }

  document.addEventListener('astro:page-load', initShelfPage);
</script>
```

- [ ] **Step 2: Run dev server and test panel manually**

```bash
npm run dev
```

Open `http://localhost:4321/shelf`. Verify:
- Clicking any card opens the panel sliding from the right
- Clicking the dim backdrop closes the panel
- Clicking ✕ closes the panel
- ESC closes the panel
- Panel shows title, type, tags, and "Loading…" that resolves to prose content
- "Open full entry →" link navigates to `/shelf/[slug]`
- URL updates to `/shelf/[slug]` on open and restores on close
- On mobile, panel slides up from the bottom as a sheet

- [ ] **Step 3: Commit**

```bash
git add src/pages/shelf/index.astro
git commit -m "feat: shelf slide-in detail panel with backdrop click-to-close"
```

---

## Task 6: Character hero carousel JS

**Files:**
- Modify: `src/pages/shelf/index.astro` (add carousel init inside `initShelfPage`)

- [ ] **Step 1: Add `initCharacterHero` function and call it inside `initShelfPage`**

Inside the `<script>` block, add this function **before** `initShelfPage`, then call `initCharacterHero()` at the end of `initShelfPage`:

```typescript
  type CharData = {
    slug: string;
    title: string;
    emblem: string;
    tags: string[];
    excerpt: string;
    publishedAt: string | null;
  };

  function initCharacterHero() {
    const hero = document.querySelector<HTMLElement>('.shelf-hero');
    if (!hero) return;

    let chars: CharData[] = [];
    try { chars = JSON.parse(hero.dataset.characters || '[]'); } catch {}
    if (chars.length <= 1) return;

    let current = 0;
    let timer: ReturnType<typeof setInterval> | null = null;

    const img      = hero.querySelector<HTMLImageElement>('.shelf-hero__portrait-img');
    const nameEl   = hero.querySelector<HTMLElement>('.shelf-hero__name');
    const eyebrow  = hero.querySelector<HTMLElement>('.shelf-hero__eyebrow');
    const excerptEl = hero.querySelector<HTMLElement>('.shelf-hero__excerpt');
    const tagsEl   = hero.querySelector<HTMLElement>('.shelf-hero__tags');
    const readLink = hero.querySelector<HTMLAnchorElement>('.shelf-hero__link');
    const portLink = hero.querySelector<HTMLAnchorElement>('.shelf-hero__portrait-link');
    const prevBtn  = hero.querySelector<HTMLButtonElement>('.shelf-hero__prev');
    const nextBtn  = hero.querySelector<HTMLButtonElement>('.shelf-hero__next');

    function show(index: number) {
      const c = chars[index];
      if (!c || !img || !nameEl || !eyebrow || !excerptEl || !tagsEl || !readLink || !portLink) return;

      img.style.opacity = '0';
      setTimeout(() => {
        img.src = c.emblem;
        img.alt = c.title;
        img.style.opacity = '1';
      }, 150);

      nameEl.style.transform = 'translateX(-8px)';
      nameEl.style.opacity = '0';
      setTimeout(() => {
        nameEl.textContent = c.title;
        nameEl.style.transform = '';
        nameEl.style.opacity = '1';
      }, 150);

      excerptEl.textContent = c.excerpt || '';
      tagsEl.innerHTML = c.tags
        .map(t => `<span class="shelf-hero__tag">${t.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span>`)
        .join('');
      eyebrow.textContent = `character · ${index + 1} / ${chars.length}`;
      readLink.href = `/shelf/${encodeURIComponent(c.slug)}`;
      portLink.href = `/shelf/${encodeURIComponent(c.slug)}`;
    }

    function advance(dir: 1 | -1) {
      current = (current + dir + chars.length) % chars.length;
      show(current);
    }

    function startTimer() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = setInterval(() => advance(1), 5000);
    }

    function stopTimer() {
      if (timer !== null) { clearInterval(timer); timer = null; }
    }

    prevBtn?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      stopTimer();
      advance(-1);
      startTimer();
    });

    nextBtn?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      stopTimer();
      advance(1);
      startTimer();
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);

    startTimer();
  }
```

At the bottom of `initShelfPage`, just before the closing `}`, add:

```typescript
    initCharacterHero();
```

- [ ] **Step 2: Test carousel manually**

```bash
npm run dev
```

Open `http://localhost:4321/shelf` and navigate to the Characters section. Verify:
- Hero cycles through characters automatically every 5s
- Portrait crossfades (opacity transition)
- Name slides in from left on change
- Eyebrow shows `character · N / total`
- Prev/next arrows work and reset the timer
- Hovering the hero pauses the timer
- If `prefers-reduced-motion` is enabled (toggle in devtools > Rendering > Emulate CSS media), auto-advance stops but arrows still work

- [ ] **Step 3: Commit**

```bash
git add src/pages/shelf/index.astro
git commit -m "feat: character hero auto-cycling carousel with prev/next controls"
```

---

## Task 7: Sticky jumpbar active-section highlighting

**Files:**
- Modify: `src/pages/shelf/index.astro` (add jumpbar init inside `initShelfPage`)

- [ ] **Step 1: Add `initJumpbar` and call it from `initShelfPage`**

Add before `initShelfPage`:

```typescript
  function initJumpbar() {
    const jumpbar  = document.querySelector<HTMLElement>('.shelf-jumpbar');
    if (!jumpbar) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>('.shelf-section[id]'));
    const links    = Array.from(jumpbar.querySelectorAll<HTMLAnchorElement>('a.shelf-jumpbar__link'));

    if (sections.length === 0 || links.length === 0) return;

    function setActive(id: string) {
      links.forEach(link => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('is-active', active);
        link.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    // Activate the first section on load
    setActive(sections[0].id);

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      // Section is "active" when it crosses into the top 30% of the viewport
      { rootMargin: '-10% 0px -60% 0px' }
    );

    sections.forEach(s => observer.observe(s));
  }
```

At the bottom of `initShelfPage` (after `initCharacterHero()`), add:

```typescript
    initJumpbar();
```

- [ ] **Step 2: Test jumpbar highlighting manually**

```bash
npm run dev
```

Open `http://localhost:4321/shelf`. Scroll through the page. Verify:
- The jumpbar link for the currently visible section gets gold color and underline
- Clicking a jumpbar link scrolls to that section and activates it
- The active state updates as you scroll past each section

- [ ] **Step 3: Commit**

```bash
git add src/pages/shelf/index.astro
git commit -m "feat: sticky jumpbar with Intersection Observer active-section highlighting"
```

---

## Task 8: Delete dead mediaGrid utilities

**Files:**
- Delete: `src/utils/mediaGrid/filterEngine.ts`
- Delete: `src/utils/mediaGrid/index.ts`
- Delete: `src/tests/mediaGrid.test.ts`

- [ ] **Step 1: Verify no remaining imports**

```bash
grep -r "mediaGrid\|filterEngine" src/ --include="*.ts" --include="*.astro"
```

Expected output: No results (or only results inside the files we're about to delete).

- [ ] **Step 2: Delete the files**

```bash
rm src/utils/mediaGrid/filterEngine.ts
rm src/utils/mediaGrid/index.ts
rm src/tests/mediaGrid.test.ts
rmdir src/utils/mediaGrid
```

- [ ] **Step 3: Run full build + test suite**

```bash
npm run build && npm run test
```

Expected: Build succeeds, all remaining tests pass (`shelf.test.ts`, `novel.test.ts`, `stream.test.ts`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove dead mediaGrid utilities replaced by shelf overhaul"
```

---

## Complete

All 8 tasks done. The shelf page now has:
- Grouped sections with shimmer headers and diagonal dividers
- P4R-style solid bottom-bar cards with favorites sorted first
- Cycling character hero carousel
- Sticky jumpbar with Intersection Observer active state
- Slide-in panel with backdrop click-to-close

Homepage has diagonal row dividers and stream tile CRT glow.
