# Shelf Wall Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/shelf`'s seven per-type poster sections with a single dense "pinned wall" collage where size = affection (favorite > written > logged), and turn the jump bar into a client-side type filter.

**Architecture:** A new pure module `src/utils/shelfWall.ts` owns all wall logic (tier, shape, CSS-class mapping, deterministic rotation, ordering, filter validation) and is unit-tested with vitest. `src/pages/shelf/index.astro` is rewritten around it: CSS grid with `grid-auto-flow: dense` + integer spans per tier/shape (no JS masonry), per-item rotation via a `--rot` custom property, hover/focus title plates, and a filter bar that toggles `hidden` on items. The quick-view panel, `?open=` legacy support, and detail routes are untouched.

**Tech Stack:** Astro 5, vanilla CSS (design tokens from `global.css`/`typography.css`), TypeScript page script, vitest.

**Spec:** `docs/superpowers/specs/2026-08-04-shelf-wall-redesign-design.md`

**Grid math (reference for Tasks 2–3):** Column tracks `repeat(auto-fill, minmax(84px, 1fr))`, `grid-auto-rows: 10px`, `gap: 10px`. An item spanning R rows is `20R − 10`px tall at minimum track width; spans are chosen so posters ≈ 2:3 and music ≈ 1:1 at that width (`object-fit: cover` absorbs fluid-track drift). Desktop spans: poster S/M/L = 1×7 / 2×14 / 3×21, square S/M/L = 1×5 / 2×9 / 3×14. At ≤768px tracks shrink to `minmax(72px, 1fr)` with `gap: 8px` (row height `18R − 8`) and row spans are overridden (see Task 3).

---

### Task 1: `shelfWall.ts` pure module (TDD)

**Files:**
- Create: `src/utils/shelfWall.ts`
- Test: `src/tests/shelfWall.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/shelfWall.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  wallTier,
  wallShape,
  wallClass,
  wallRotation,
  sortWall,
} from '../utils/shelfWall';

describe('wallTier', () => {
  it('favorites are large even without written content', () => {
    expect(wallTier({ isFavorite: true, hasContent: false })).toBe('large');
  });

  it('written-about non-favorites are medium', () => {
    expect(wallTier({ isFavorite: false, hasContent: true })).toBe('medium');
  });

  it('bare logs are small', () => {
    expect(wallTier({ isFavorite: false, hasContent: false })).toBe('small');
  });
});

describe('wallShape', () => {
  it('music is square', () => {
    expect(wallShape('music')).toBe('square');
  });

  it('everything else is poster', () => {
    for (const t of ['anime', 'manga', 'film', 'series', 'book', 'game', 'character', 'other']) {
      expect(wallShape(t)).toBe('poster');
    }
  });
});

describe('wallClass', () => {
  it('maps tier + shape to a modifier class', () => {
    expect(wallClass('large', 'poster')).toBe('shelf-card--poster-large');
    expect(wallClass('small', 'square')).toBe('shelf-card--square-small');
  });
});

describe('wallRotation', () => {
  it('is deterministic for the same slug', () => {
    expect(wallRotation('persona-4-golden')).toBe(wallRotation('persona-4-golden'));
  });

  it('stays within ±1.5 degrees', () => {
    const slugs = ['a', 'bocchi-the-rock', 'ttgl', 'set-it-off', 'veil', 'x'.repeat(80)];
    for (const s of slugs) {
      expect(Math.abs(wallRotation(s))).toBeLessThanOrEqual(1.5);
    }
  });

  it('spreads across slugs (not all identical)', () => {
    const values = new Set(
      Array.from({ length: 20 }, (_, i) => wallRotation(`slug-${i}`)),
    );
    expect(values.size).toBeGreaterThanOrEqual(5);
  });
});

describe('sortWall', () => {
  const e = (title: string, date: string | null) => ({
    title,
    date: date ? new Date(date) : null,
  });

  it('sorts newest first by date', () => {
    const result = sortWall([e('old', '2020-01-01'), e('new', '2025-06-01')]);
    expect(result.map(x => x.title)).toEqual(['new', 'old']);
  });

  it('puts undated entries last', () => {
    const result = sortWall([e('undated', null), e('dated', '2020-01-01')]);
    expect(result.map(x => x.title)).toEqual(['dated', 'undated']);
  });

  it('tie-breaks equal/missing dates by title', () => {
    const result = sortWall([e('zeta', null), e('alpha', null)]);
    expect(result.map(x => x.title)).toEqual(['alpha', 'zeta']);
  });

  it('does not mutate its input', () => {
    const input = [e('b', '2020-01-01'), e('a', '2025-01-01')];
    sortWall(input);
    expect(input[0].title).toBe('b');
  });
});

```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/tests/shelfWall.test.ts`
Expected: FAIL — cannot resolve `../utils/shelfWall`.

- [ ] **Step 3: Implement the module**

Create `src/utils/shelfWall.ts`:

```ts
/**
 * Pure logic for the /shelf "pinned wall" — tier, shape, span-class mapping,
 * deterministic rotation, ordering, and filter-param validation.
 * No astro imports (vitest can't resolve astro:content).
 */

export type WallTier = 'large' | 'medium' | 'small';
export type WallShape = 'poster' | 'square';

/** Size = affection: favorite > written-about > bare log. Never a shame signal. */
export function wallTier(e: { isFavorite: boolean; hasContent: boolean }): WallTier {
  if (e.isFavorite) return 'large';
  if (e.hasContent) return 'medium';
  return 'small';
}

export function wallShape(contentType: string): WallShape {
  return contentType === 'music' ? 'square' : 'poster';
}

/** CSS modifier class carrying the grid spans (numbers live in the page CSS). */
export function wallClass(tier: WallTier, shape: WallShape): string {
  return `shelf-card--${shape}-${tier}`;
}

/**
 * Deterministic per-item rotation in [-1.5, 1.5] degrees, 0.1° steps,
 * seeded from the slug (djb2-xor) so it is stable across builds.
 */
export function wallRotation(slug: string): number {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) {
    h = ((h * 33) ^ slug.charCodeAt(i)) >>> 0;
  }
  return ((h % 31) - 15) / 10;
}

export type WallSortable = { title: string; date: Date | null };

/** Newest first; undated entries last, tie-broken by title. Non-mutating. */
export function sortWall<T extends WallSortable>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const ad = a.date?.getTime() ?? null;
    const bd = b.date?.getTime() ?? null;
    if (ad !== null && bd !== null && ad !== bd) return bd - ad;
    if (ad !== null && bd === null) return -1;
    if (ad === null && bd !== null) return 1;
    return a.title.localeCompare(b.title);
  });
}
```

Note (deliberate deviation from the spec's file list): filter-param validation
does not live in this module. The page script validates `?type=` against the
set of types actually present on the wall (`presentTypes` in Task 4), which is
stricter than schema-membership — a schema-valid type with zero entries would
otherwise filter to an empty wall. The spec's requirement ("invalid values fall
back to All") is covered by Task 4's verification step 5 and acceptance
criterion 4.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/tests/shelfWall.test.ts`
Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add src/utils/shelfWall.ts src/tests/shelfWall.test.ts
git commit -m "feat: shelfWall pure module — tiers, rotation, ordering for the wall"
```

---

### Task 2: Rewrite the page data + markup

**Files:**
- Modify: `src/pages/shelf/index.astro` (frontmatter, lines 1–68; template, lines 70–212)

The old script/styles still reference removed elements after this task — that is fine (`querySelector` returns null and the init functions bail early); they are replaced in Tasks 3–4. The build must still pass.

- [ ] **Step 1: Replace the frontmatter (everything between the `---` fences)**

```astro
---
import { getCollection } from 'astro:content';
import { hasMinimalContent } from '../../utils/content';
import {
  wallTier,
  wallShape,
  wallClass,
  wallRotation,
  sortWall,
} from '../../utils/shelfWall';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NavPill from '../../components/NavPill.astro';

const TYPE_ORDER = ['anime', 'manga', 'character', 'film', 'series', 'music', 'book', 'game', 'other'] as const;
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

const allShelf = await getCollection('shelf', ({ data }) => !data.draft);

// One flat wall, newest first; size tiers come from wallTier at render time.
const wallItems = sortWall(
  allShelf.map(e => ({
    slug: e.slug,
    title: e.data.title,
    type: e.data.content_type as ContentType,
    isFavorite: e.data.isFavorite ?? false,
    hasContent: !hasMinimalContent(e.body ?? ''),
    date: e.data.updatedAt ?? e.data.publishedAt ?? null,
    emblem: e.data.emblem ?? '/images/emblems/default.svg',
  })),
);

const totalCount = wallItems.length;

// Filter tabs: only types that exist, in TYPE_ORDER, with counts.
const typeCounts = TYPE_ORDER
  .map(type => ({ type, count: wallItems.filter(i => i.type === type).length }))
  .filter(({ count }) => count > 0);

// Serialize all entries for panel JS (unchanged shape from the old page).
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
---
```

- [ ] **Step 2: Replace the template body**

Replace everything from `<BaseLayout` down to (and including) `</BaseLayout>`'s inner content **except** the panel/backdrop block and `<NavPill />`, which are kept verbatim. New body:

```astro
<BaseLayout title="Shelf" description="My thoughts on anime, manga, movies, and more — favorites included." ogImage="/social-default.svg">
  <div id="entry-data" data-entries={JSON.stringify(entryData)} hidden></div>

  <div class="shelf-page">
    <header class="shelf-header">
      <div class="shelf-header__main">
        <span class="p4g-tab">catalog</span>
        <h1 class="shelf-header__title"><span class="p4g-heading">Shelf</span></h1>
        <span class="p4g-underline" aria-hidden="true"></span>
      </div>
      <p class="shelf-header__count">{totalCount} entries</p>
    </header>

    {/* Sticky filter bar — the old jump bar's silhouette, now filtering the
        wall client-side. The hrefs are honest no-JS fallbacks (they reload the
        unfiltered page); JS intercepts and filters in place. */}
    <div class="shelf-jumpbar-wrap">
      <nav class="shelf-jumpbar" aria-label="Filter by type">
        <a href="/shelf" class="shelf-jumpbar__link is-active" aria-current="page" data-type="">
          <span class="shelf-jumpbar__label">All · {totalCount}</span>
        </a>
        {typeCounts.map(({ type, count }) => (
          <a href={`/shelf?type=${type}`} class="shelf-jumpbar__link" data-type={type}>
            <span class="shelf-jumpbar__label">{TYPE_LABELS[type]} · {count}</span>
          </a>
        ))}
      </nav>
    </div>

    <div class="shelf-wall">
      {wallItems.map((item, i) => (
        <a
          href={`/shelf/${item.slug}`}
          class:list={[
            'shelf-card',
            wallClass(wallTier(item), wallShape(item.type)),
            { 'shelf-card--fav': item.isFavorite },
          ]}
          data-slug={item.slug}
          data-type={item.type}
          style={`--rot: ${wallRotation(item.slug)}deg; --card-index: ${i}`}
          aria-label={item.title}
        >
          <img
            src={item.emblem}
            alt=""
            class="shelf-card__img"
            loading={i < 8 ? 'eager' : 'lazy'}
            decoding="async"
          />
          <span class="shelf-card__corner" aria-hidden="true"></span>
          <span class="shelf-card__plate">
            {item.isFavorite && <span aria-hidden="true">★ </span>}{item.title}
          </span>
        </a>
      ))}
    </div>
  </div>

  <!-- Slide-in panel — KEEP the existing #shelf-backdrop and #shelf-panel
       markup from the old file verbatim here. -->

  <NavPill />
</BaseLayout>
```

Deleted in this step: the grouped-sections loop, `shelf-divider`s, section headers, the entire `shelf-hero` block, and the `characterData` serialization (and with it the `stripMarkdown` and `sortShelfSection`/`SortableEntry` imports and the `grouped` builder).

- [ ] **Step 3: Verify the build passes**

Run: `npm run build`
Expected: build succeeds (old styles/script reference now-missing elements, which is inert).

- [ ] **Step 4: Commit**

```bash
git add src/pages/shelf/index.astro
git commit -m "feat: shelf wall markup — flat collage + filter bar, sections and hero removed"
```

---

### Task 3: Wall styles

**Files:**
- Modify: `src/pages/shelf/index.astro` (the `<style>` block)

- [ ] **Step 1: Replace the style regions**

Keep these blocks **unchanged**: `.shelf-page`, `.shelf-header*`, `.shelf-jumpbar-wrap` (+ `::after` fade + `.is-scroll-end`), `.shelf-jumpbar`, `.shelf-jumpbar__link` (+ label/hover/active rules), `.shelf-backdrop`, `.shelf-panel*`, `:global(.sp-*)`, and the 900px panel media block.

Delete these blocks: `.shelf-section*`, `.shelf-divider*` (if present in the style block), `.shelf-grid`, all `.shelf-card*` rules, all `.shelf-hero*` rules, and the 768px rules for hero/grid/section-count.

Add the new wall rules (complete block):

```css
  /* ── The Wall ────────────────────────────────────── */
  /* Dense-packed collage: fine-grained rows so integer spans approximate each
     shape (posters 2:3, music 1:1) at minimum track width; object-fit: cover
     absorbs fluid-track drift. Height of an R-row span = 20R − 10 (10px rows,
     10px gap). */
  .shelf-wall {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
    grid-auto-rows: 10px;
    grid-auto-flow: dense;
    gap: 10px;
  }

  .shelf-card {
    position: relative;
    display: block;
    overflow: hidden;
    border-radius: var(--radius-sm);
    color: var(--color-text);
    cursor: pointer;
    /* Pinned-by-hand: deterministic per-item rotation set inline as --rot */
    transform: rotate(var(--rot, 0deg));
    /* Diamond watermark shows through while a poster loads (or never arrives) */
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cg fill='none' stroke='%23d4b82a' stroke-opacity='0.28'%3E%3Crect x='14' y='14' width='20' height='20' transform='rotate(45 24 24)'/%3E%3Crect x='19' y='19' width='10' height='10' transform='rotate(45 24 24)'/%3E%3C/g%3E%3C/svg%3E")
        center / 48px 48px no-repeat,
      var(--color-surface-2);
    animation: card-in 400ms var(--animation-easing) both;
    animation-delay: min(calc(var(--card-index, 0) * 40ms), 1200ms);
    transition: transform var(--animation-fast) var(--animation-easing);
  }

  /* display:block above beats the hidden attribute — restore it for filtering */
  .shelf-card[hidden] { display: none; }

  @keyframes card-in {
    from { opacity: 0; transform: translateY(10px) rotate(var(--rot, 0deg)); }
    to   { opacity: 1; transform: translateY(0) rotate(var(--rot, 0deg)); }
  }

  /* Span table — single source of truth for shapes is wallClass() in
     src/utils/shelfWall.ts; the numbers live here so media queries can
     override them. */
  .shelf-card--poster-small  { grid-column: span 1; grid-row: span 7; }
  .shelf-card--poster-medium { grid-column: span 2; grid-row: span 14; }
  .shelf-card--poster-large  { grid-column: span 3; grid-row: span 21; }
  .shelf-card--square-small  { grid-column: span 1; grid-row: span 5; }
  .shelf-card--square-medium { grid-column: span 2; grid-row: span 9; }
  .shelf-card--square-large  { grid-column: span 3; grid-row: span 14; }

  /* Favorites: gold edge + the hard gold shadow. box-shadow (not outline) so
     the site's gold :focus-visible ring stays distinct. */
  .shelf-card--fav {
    box-shadow:
      0 0 0 2px var(--color-gold),
      var(--shadow-hard);
  }

  .shelf-card__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* P4G corner-cut reveal — site-wide hover signature */
  .shelf-card__corner {
    position: absolute;
    top: 0;
    right: 0;
    width: 26px;
    height: 26px;
    background: var(--color-gold);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    transform: translate(28px, -28px);
    transition: transform var(--animation-fast) var(--animation-easing);
    pointer-events: none;
    z-index: 2;
  }

  /* Title plate — hidden at rest (the wall is pure art), slides in on
     hover/focus. Touch users get titles in the quick-view panel instead. */
  .shelf-card__plate {
    position: absolute;
    left: 0;
    bottom: 8px;
    max-width: calc(100% - 12px);
    padding: 5px 10px;
    background: #0d0d0d;
    border-left: 3px solid var(--color-gold);
    font-family: var(--font-mono);
    font-size: var(--text-floor);
    line-height: 1.3;
    word-break: break-word;
    transform: skewX(var(--skew-display)) translateY(6px);
    opacity: 0;
    transition:
      opacity var(--animation-fast) var(--animation-easing),
      transform var(--animation-fast) var(--animation-easing);
    pointer-events: none;
    z-index: 2;
  }
  .shelf-card--fav .shelf-card__plate { color: var(--color-gold); }

  .shelf-card:hover,
  .shelf-card:focus-visible {
    transform: rotate(0deg) translateY(-3px);
    z-index: 3;
  }
  .shelf-card:hover .shelf-card__corner,
  .shelf-card:focus-visible .shelf-card__corner {
    transform: translate(0, 0);
  }
  .shelf-card:hover .shelf-card__plate,
  .shelf-card:focus-visible .shelf-card__plate {
    opacity: 1;
    transform: skewX(var(--skew-display)) translateY(0);
  }
```

Replace the old 768px media block's grid rules with:

```css
  @media (max-width: 768px) {
    .shelf-wall {
      grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
      gap: 8px;
    }
    /* Row height at this gap = 18R − 8; spans re-tuned to the 72px track */
    .shelf-card--poster-small  { grid-row: span 6; }
    .shelf-card--poster-medium { grid-row: span 13; }
    .shelf-card--poster-large  { grid-row: span 20; }
    .shelf-card--square-small  { grid-row: span 4; }
    .shelf-card--square-medium { grid-row: span 9; }
    .shelf-card--square-large  { grid-row: span 13; }

    .shelf-header__count { margin-left: 0; width: 100%; }
  }
```

Replace the reduced-motion block with:

```css
  @media (prefers-reduced-motion: reduce) {
    .shelf-card { animation: none; transition: none; }
    /* Rotation is a static pose, not motion — it stays. Hover pop doesn't. */
    .shelf-card:hover,
    .shelf-card:focus-visible { transform: rotate(var(--rot, 0deg)); }
    .shelf-card__corner,
    .shelf-card__plate { transition: none; }
    .shelf-panel { transition: none; }
  }
```

- [ ] **Step 2: Build and inspect**

Run: `npm run build`
Expected: build succeeds.

Then start the dev server (via the Browser pane's `preview_start`, config `dev`) and verify on `/shelf` via DOM/CSS assertions (Browser-pane scroll and screenshots below the fold are unreliable — assert via `getComputedStyle`):

- `.shelf-wall` computed `grid-auto-flow` is `dense`.
- A `.shelf-card--fav` computed `box-shadow` contains two shadows (gold ring + hard shadow).
- A `.shelf-card` computed `transform` is a non-identity matrix (rotation applied).
- No element matches `.shelf-card--dim`, `.shelf-hero`, `.shelf-section`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/shelf/index.astro
git commit -m "feat: pinned-wall styles — dense grid spans, rotation, hover plates, fav gold"
```

---

### Task 4: Page script — filter + cleanup

**Files:**
- Modify: `src/pages/shelf/index.astro` (the `<script>` block)

- [ ] **Step 1: Delete dead code, add the filter**

In the `<script>` block:

1. Delete `initCharacterHero()` entirely, its `CharData` type, and its call inside `initShelfPage()`.
2. Delete `initJumpbar()` entirely (IntersectionObserver scrollspy included) and its call.
3. Add `initFilter()` and call it at the end of `initShelfPage()` (where the two deleted calls were):

```ts
  function initFilter() {
    const jumpbar = document.querySelector<HTMLElement>('.shelf-jumpbar');
    const wall = document.querySelector<HTMLElement>('.shelf-wall');
    if (!jumpbar || !wall) return;

    // Right-edge fade: on while there is more bar to scroll to (kept from the
    // old jump bar — the fade is painted by the non-scrolling wrapper).
    const jumpbarWrap = jumpbar.parentElement;
    const updateEdgeFade = () => {
      const atEnd = jumpbar.scrollLeft + jumpbar.clientWidth >= jumpbar.scrollWidth - 1;
      jumpbarWrap?.classList.toggle('is-scroll-end', atEnd);
    };
    updateEdgeFade();
    jumpbar.addEventListener('scroll', updateEdgeFade, { passive: true, signal: pageCleanup!.signal });
    window.addEventListener('resize', updateEdgeFade, { signal: pageCleanup!.signal });

    const links = Array.from(jumpbar.querySelectorAll<HTMLAnchorElement>('.shelf-jumpbar__link'));
    const items = Array.from(wall.querySelectorAll<HTMLAnchorElement>('.shelf-card'));
    const presentTypes = new Set(items.map(i => i.dataset.type ?? ''));

    function applyFilter(type: string) {
      links.forEach(link => {
        const active = (link.dataset.type ?? '') === type;
        link.classList.toggle('is-active', active);
        // "page", or absent — never aria-current="false"
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });

      let visIndex = 0;
      items.forEach(item => {
        const show = !type || item.dataset.type === type;
        item.toggleAttribute('hidden', !show);
        if (show) {
          // Re-stagger visible items and restart the entrance animation
          // (site convention: filtering resets stagger animations).
          item.style.setProperty('--card-index', String(visIndex++));
          item.style.animation = 'none';
          void item.offsetWidth;
          item.style.animation = '';
        }
      });
    }

    jumpbar.addEventListener('click', e => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('.shelf-jumpbar__link');
      if (!link) return;
      e.preventDefault();
      const type = link.dataset.type ?? '';
      applyFilter(type);
      history.replaceState(null, '', type ? `/shelf?type=${type}` : '/shelf');
    }, { signal: pageCleanup!.signal });

    // Initial state: ?type= param, or a legacy #section-<type> deep link.
    // Unknown values (absent from the wall) fall back to All.
    const params = new URLSearchParams(location.search);
    let initial = params.get('type') ?? '';
    const legacy = location.hash.match(/^#section-([a-z]+)$/);
    if (!initial && legacy) initial = legacy[1];
    if (initial && !presentTypes.has(initial)) initial = '';
    if (initial || legacy) {
      applyFilter(initial);
      history.replaceState(null, '', initial ? `/shelf?type=${initial}` : '/shelf');
    }
  }
```

Note: `initShelfPage()`'s existing `?open=` handling stays after `initFilter()` in source order, exactly as the old hero/jumpbar calls were — if both `?type=` and `?open=` are present, the panel's `replaceState` to `/shelf/[slug]` wins the URL, which matches the old behavior of `?open=` owning the address bar.

- [ ] **Step 2: Verify in the browser**

With the dev server running, assert via JS in the Browser pane:

1. Load `/shelf` → clicking the MUSIC tab leaves only `[data-type="music"]` items un-`hidden`; `location.search` is `?type=music`; the tab has `aria-current="page"` and no other link does.
2. Clicking ALL restores every item; `location.search` is empty.
3. Load `/shelf?type=music` → wall starts filtered.
4. Load `/shelf#section-anime` → wall starts filtered to anime and the hash is gone from `location.href`.
5. Load `/shelf?type=bogus` → nothing hidden, ALL active.
6. Click a card → quick-view panel still opens, URL becomes `/shelf/[slug]`, ESC closes it.

- [ ] **Step 3: Run the full test suite and build**

Run: `npm run test && npm run build`
Expected: PASS / build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/shelf/index.astro
git commit -m "feat: wall filter bar — type filtering, URL state, legacy anchor mapping; hero JS removed"
```

---

### Task 5: Retire `shelf.ts`, update CLAUDE.md

**Files:**
- Delete: `src/utils/shelf.ts`, `src/tests/shelf.test.ts`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Confirm `sortShelfSection` has no remaining consumers**

Run: `grep -rn "utils/shelf'" src`
Expected: no matches (Task 2 removed the only import). If anything matches, stop and resolve before deleting.

- [ ] **Step 2: Delete the module and its test**

```bash
git rm src/utils/shelf.ts src/tests/shelf.test.ts
```

- [ ] **Step 3: Update CLAUDE.md**

Replace the "Shelf Page Features (`/shelf`)" section body with:

```markdown
### Shelf Page Features (`/shelf`)
- **The Wall**: one flat dense-packed collage of every non-draft entry (no per-type
  sections). CSS grid, `grid-auto-flow: dense`, fine-grained rows + integer spans;
  size = affection tier from existing frontmatter (`wallTier` in
  `src/utils/shelfWall.ts`): favorite → large (gold ring + hard gold shadow),
  written-about → medium, bare log → small. **No dimming anywhere** — small is the
  quiet tier (no-shame invariant). Posters render ~2:3, music ~1:1 (`wallShape`);
  span numbers live in the page CSS (`.shelf-card--<shape>-<tier>`), overridden at
  ≤768px. Order: newest first, undated last (`sortWall`).
- **Pinned look**: every item carries a deterministic ±1.5° rotation seeded from its
  slug (`wallRotation`, inline `--rot`). Titles are hidden at rest; a skewed title
  plate + the corner-cut gold triangle appear on hover/focus (rotation eases to 0).
  Under reduced motion the rotation stays (static pose) but entrance/hover motion
  is disabled.
- **Filter bar** (`.shelf-jumpbar`, same angled-tab silhouette as before): tabs are
  now client-side type filters with counts (All + present types, single-select,
  solid gold active tab, `aria-current="page"`). URL state via `?type=` +
  `replaceState`; legacy `#section-<type>` links map onto the filter and the hash
  is stripped; unknown values fall back to All. Filtering re-staggers the entrance
  animation. No-JS: the bar's links just reload the unfiltered page (every entry
  is still a plain `<a>` to its detail route).
- **Quick-view panel**: unchanged — card click intercepts navigation, pushes
  `/shelf/[slug]`, slides the panel in; `?open=[slug]` legacy param still works;
  ≤900px bottom sheet.
- The character hero carousel, section headers/dividers, scrollspy, and
  `.shelf-card--dim` were all removed in the 2026-08 wall redesign
  (`src/utils/shelf.ts`/`sortShelfSection` retired with them; wall logic lives in
  `src/utils/shelfWall.ts`, tested in `src/tests/shelfWall.test.ts`).
```

Then update the other stale references:
- In the Pages & Routes `/shelf` bullet: replace "Full-width emblem card grid grouped by content type, with a sticky jump bar (section anchor links)" with "Flat 'wall' collage with a sticky type-filter bar".
- In Important Implementation Details #7: replace the section-grid description with a pointer to the Shelf Page Features section.
- In Utility Modules table: remove the `src/utils/shelf.ts` row if present; add `src/utils/shelfWall.ts` — `wallTier()`, `wallShape()`, `wallClass()`, `wallRotation()`, `sortWall()` — "/shelf wall logic (tiers, spans, rotation, ordering)".

- [ ] **Step 4: Full verification**

Run: `npm run test && npm run build`
Expected: PASS (shelfWall suite present, shelf suite gone) / build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: retire sortShelfSection, document the shelf wall in CLAUDE.md"
```

---

## Acceptance criteria (from the spec — verify before finishing)

1. Every non-draft shelf entry appears exactly once; favorites large with gold ring + hard shadow; nothing dimmed.
2. Posters read ~2:3, music ~square; no ragged holes at 1200/900/768/375px.
3. Rotation stable across reloads and within ±1.5°.
4. Filter tabs: correct counts, correct filtering, `?type=` written, restored from `?type=` and `#section-*`.
5. Keyboard: items reachable, focus shows plate + corner; panel flow unchanged.
6. No-JS: full wall renders, every item navigates to its detail page.
7. `npm run test` and `npm run build` pass.
