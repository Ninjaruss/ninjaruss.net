# Tagless Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove tags from notes and showcases entirely; the Codex becomes the thematic map, `collections` threads related notes, and a "draw a card" control adds serendipity to the journal.

**Architecture:** Pure subtraction across schema → frontmatter → list plumbing → client filter stack, then two small additions in `SplitViewLayout.astro` (a Codex CTA and a draw-a-card deck) gated by new optional props so only `/journal` renders them. Shelf entries KEEP tags (`peak`, `waifu` are displayed in the shelf hero and quick-view panel), so `tags` moves from `sharedSchema` into the shelf schema extension — it does not disappear from the schema file.

**Tech Stack:** Astro 5, vanilla TS (`src/utils/splitView/`), vitest, no frameworks.

**Spec:** `docs/superpowers/specs/2026-07-28-tagless-journal-design.md`

**Verification convention:** run `npx vitest run` and `npx astro build` where a step says so; expected baseline before this plan is 152 tests / 9 files passing.

---

### Task 1: Schema — tags become shelf-only; strip note/showcase frontmatter

**Files:**
- Modify: `src/content/config.ts:4-35`
- Modify: all `src/content/notes/*.md` (22 files), `src/content/showcase/*.md` (5 files)

- [ ] **Step 1: Move `tags` out of sharedSchema into shelf**

In `src/content/config.ts`, delete line 6 (`tags: z.array(z.string()).default([]),`) from `sharedSchema` and add the same line to the shelf `extend` block:

```ts
// Shared schema fields across all content types
const sharedSchema = z.object({
  title: z.string(),
  collections: z.array(z.string()).default([]),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  emblem: z.string().optional(), // Path to page-specific emblem image
  description: z.string().optional(), // For meta/OG description
  image: z.string().optional(), // Path to social share image
});

// Shelf collection — anime, manga, films, series, music, books, games, characters, and other inspirations
const shelf = defineCollection({
  type: 'content',
  schema: sharedSchema.extend({
    content_type: z.enum(['anime', 'manga', 'film', 'series', 'music', 'book', 'game', 'character', 'other']),
    isFavorite: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});
```

`notes` and `showcase` keep using plain `sharedSchema` — no change to their definitions. (Astro strips unknown frontmatter keys rather than erroring, so stray `tags:` would be silently ignored — strip them anyway in Step 2 so the files tell the truth.)

- [ ] **Step 2: Strip `tags:` frontmatter from notes and showcases**

All tag lines in these collections are single-line inline arrays (`tags: ["life"]`). Verify that assumption, then strip:

```bash
grep -n "^tags:" src/content/notes/*.md src/content/showcase/*.md | grep -v '\["' ; echo "---any output above means a multi-line tags block: handle manually---"
sed -i '' '/^tags: \[/d' src/content/notes/*.md src/content/showcase/*.md
grep -c "^tags:" src/content/notes/*.md src/content/showcase/*.md | grep -v ":0" ; echo "---any output above means leftovers---"
```

Expected: both guard greps print nothing (only the `---` echo lines).

- [ ] **Step 3: Build to validate schema + content**

Run: `npx astro build`
Expected: build completes. (Tests still pass untouched — no code reads changed yet.)

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/notes src/content/showcase
git commit -m "Make tags shelf-only; strip tags from notes and showcase frontmatter"
```

---

### Task 2: Remove tags from journal list plumbing and entry headers

**Files:**
- Modify: `src/utils/journalMerge.ts` (drop `tags` from the item type)
- Modify: `src/pages/journal/index.astro:36`
- Modify: `src/pages/notes/[...slug].astro:47,60`
- Modify: `src/pages/showcase/[...slug].astro` (same two spots as notes — ListItem + EntryHeader props)
- Modify: `src/components/ListItem.astro:8,14,21`
- Modify: `src/components/EntryHeader.astro`
- Modify: `src/tests/journal.test.ts:9`
- Keep untouched: `src/components/TagList.astro` and `src/pages/shelf/[...slug].astro:52` (shelf still shows tags)

- [ ] **Step 1: Update the journal.test.ts fixture (test-first)**

In `src/tests/journal.test.ts`, delete the `tags: [],` line (line 9) from the fixture entry data. Run `npx vitest run src/tests/journal.test.ts` — expected: still PASSES (the merge logic never read tags; this just keeps the fixture honest once the type drops the field).

- [ ] **Step 2: Drop `tags` from the JournalItem entry type**

In `src/utils/journalMerge.ts`, delete the `tags: string[];` line (line 8) from the entry `data` type.

- [ ] **Step 3: Drop the tags prop from ListItem**

In `src/components/ListItem.astro`: delete `tags?: string[];` from Props (line 8), remove `tags = [],` from the destructure (line 14), and delete the `data-tags={tags.join(',')}` attribute (line 21). While here, add the emblem passthrough the draw card (Task 7) needs:

```astro
interface Props {
  href: string;
  slug: string;
  title: string;
  subtitle?: string;
  meta?: string;
  searchableContent?: string;
  contentType?: string;
  hasMinimalContent?: boolean;
  emblem?: string;
}

const { href, slug, title, subtitle, meta, searchableContent, contentType, hasMinimalContent = false, emblem } = Astro.props;
```

```astro
<a
  href={href}
  class="list-item"
  data-slug={slug}
  data-search-content={searchableContent}
  data-content-type={contentType}
  data-emblem={emblem}
>
```

- [ ] **Step 4: Drop the tags prop from EntryHeader**

In `src/components/EntryHeader.astro`: remove the `import TagList from './TagList.astro';` line, remove `tags: string[];` from Props, remove `tags` from the destructure, and delete the whole `{tags.length > 0 && (...)}` block (lines 22-26).

- [ ] **Step 5: Update all callers**

```bash
grep -rn "tags={" src/pages src/components --include="*.astro"
```

Expected hits to fix (remove the `tags={...}` attribute; add `emblem={...}` on ListItem uses):

- `src/pages/journal/index.astro:36` — in the ListItem, replace `tags={entry.data.tags}` with `emblem={entry.data.emblem}`
- `src/pages/notes/[...slug].astro:47` (ListItem) — same replacement; `:60` (EntryHeader) — delete the tags attribute
- `src/pages/showcase/[...slug].astro` — same two changes as the notes page

The remaining hit at `src/pages/shelf/[...slug].astro:52` (`<TagList tags={entry.data.tags ?? []} />`) stays — shelf keeps tags.

- [ ] **Step 6: Tests + build**

Run: `npx vitest run && npx astro build`
Expected: 152 tests pass, build green.

- [ ] **Step 7: Commit**

```bash
git add -A src
git commit -m "Remove tags from journal list items and entry headers (shelf keeps them)"
```

---

### Task 3: Remove tag filtering from the split-view client stack

**Files:**
- Modify: `src/utils/splitView/types.ts`
- Modify: `src/utils/splitView/urlState.ts`
- Modify: `src/utils/splitView/filterEngine.ts`
- Modify: `src/utils/splitView/filterUI.ts`
- Modify: `src/utils/splitView/eventBindings.ts`
- Modify: `src/utils/splitView/index.ts`
- Modify: `src/layouts/SplitViewLayout.astro` (markup line 79, CSS for `.split-view__tags`, `.split-view__tag-pill`, and the "TagList component" block near line 921)

- [ ] **Step 1: types.ts**

Remove `tagsList: HTMLElement;` (and its doc comment) from `SplitViewElements`; remove `tags: Set<string>;` from `FilterState`.

- [ ] **Step 2: urlState.ts**

Full replacement — `tags` handling removed, `?tags=` simply never read again (old links degrade to the unfiltered list because unread params are ignored):

```ts
import type { FilterState } from './types';

/**
 * Parse filter state from URL query parameters
 */
export function getFiltersFromURL(): FilterState {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search') || '';
  const typesParam = params.get('types') || '';

  return {
    search,
    types: typesParam ? new Set(typesParam.split(',').filter(Boolean)) : new Set<string>(),
  };
}

/**
 * Update URL with current filter state using History API
 */
export function updateURL(
  search: string,
  types: Set<string>,
  clearAllButton?: HTMLElement | null
): void {
  const params = new URLSearchParams(window.location.search);

  if (search) {
    params.set('search', search);
  } else {
    params.delete('search');
  }

  // Drop any legacy ?tags= param the moment the user interacts with filters
  params.delete('tags');

  if (types.size > 0) {
    params.set('types', Array.from(types).sort().join(','));
  } else {
    params.delete('types');
  }

  const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  history.replaceState(null, '', newURL);

  // Show/hide clear all button based on active filters
  if (clearAllButton) {
    clearAllButton.hidden = types.size === 0;
  }
}
```

- [ ] **Step 3: filterEngine.ts**

Remove the tag lines from `applyFilters`: the `tags` destructure (line 10 → `const { search, types } = getFiltersFromURL();`), the `itemTags` line (22), the `matchesTags` line (28), and change line 31 to `const isVisible = matchesSearch && matchesType;`.

- [ ] **Step 4: filterUI.ts**

Delete the entire `populateTags` function (lines 39-63). `populateTypes` is unchanged.

- [ ] **Step 5: eventBindings.ts**

In `bindFilterEvents`: remove `tagsList` from the destructure (line 15); delete the `clearTagPills` helper (lines 26-31); delete the whole tag-pill click listener (lines 56-78); and update every `getFiltersFromURL()`/`updateURL()` call site to the new arity:

- search input listener: `const { types } = getFiltersFromURL(); updateURL(searchInput.value, types, clearAllButton);`
- type pill listener: `const { search, types } = getFiltersFromURL();` … `updateURL(search, next, clearAllButton);`
- clear-all listener: `updateURL(search, new Set(), clearAllButton);` and drop the `clearTagPills();` call (comment becomes `// Clear all filters (types; search stays)`).

- [ ] **Step 6: index.ts**

Remove: the `populateTags` import (line 5 → `import { populateTypes } from './filterUI';`), the `tagsList` query (line 19), `tagsList` from the null-check (line 28) and the returned object (line 37), the `populateTags(...)` call (line 80), and change the destructure/clear-button lines to:

```ts
const { search: initialSearch, types: initialTypes } = getFiltersFromURL();
elements.searchInput.value = initialSearch;
populateTypes(elements.typesList, elements.listItems, initialTypes);
// Reflect restored (non-search) filters on the clear button
elements.clearAllButton.hidden = initialTypes.size === 0;
```

- [ ] **Step 7: SplitViewLayout.astro markup + CSS**

Delete line 79 (`<div class="split-view__tags" role="group" aria-label="Filter by tag"></div>`). Then find and delete the now-dead CSS:

```bash
grep -n "split-view__tags\|split-view__tag-pill\|TagList component" src/layouts/SplitViewLayout.astro
```

Delete the `.split-view__tags` rules (~lines 346-352), every `.split-view__tag-pill` rule, and the `/* TagList component */` block (~line 921) — that block styled tag pills inside fetched split-view detail content, which EntryHeader no longer renders. Do NOT touch `.split-view__type-pill` / `.split-view__pill-count` rules (`.split-view__pill-count` is shared by type pills — keep it).

- [ ] **Step 8: Type-check, tests, build**

Run: `npx astro check 2>&1 | tail -5` (catches any missed `tagsList`/arity references; if `astro check` isn't installed, `npx tsc --noEmit -p tsconfig.json` on the utils is an acceptable fallback — but the build itself also surfaces TS errors in practice)
Run: `npx vitest run && npx astro build`
Expected: 152 tests pass, build green.

- [ ] **Step 9: Commit**

```bash
git add src/utils/splitView src/layouts/SplitViewLayout.astro
git commit -m "Remove tag filtering from split-view (search + type only)"
```

---

### Task 4: RSS categories without tags

**Files:**
- Modify: `src/pages/rss.xml.ts:27`

- [ ] **Step 1: Drop tags from item categories**

Line 27: `categories: [type, ...entry.data.tags],` → `categories: [type],`

- [ ] **Step 2: Build + spot-check**

Run: `npx astro build && grep -o "<category>[^<]*</category>" dist/client/rss.xml 2>/dev/null | sort -u | head`
(If the feed isn't in `dist/client/`, find it: `find dist .vercel -name "rss.xml" | head -1`.)
Expected: only `note` / `showcase` categories remain.

- [ ] **Step 3: Commit**

```bash
git add src/pages/rss.xml.ts
git commit -m "RSS categories: entry type only, no tags"
```

---

### Task 5: Codex CTA in the journal placeholder

**Files:**
- Modify: `src/layouts/SplitViewLayout.astro` (Props interface + placeholder markup at lines 104-117 + CSS)
- Modify: `src/pages/journal/index.astro`

- [ ] **Step 1: Add the prop**

In `SplitViewLayout.astro`'s Props interface (top of frontmatter — find it with `grep -n "placeholderStats" src/layouts/SplitViewLayout.astro | head -3`), alongside `placeholderStats`, add:

```ts
/** Optional link rendered under the placeholder stats (e.g. journal → codex) */
placeholderCta?: { href: string; label: string };
```

and destructure it with the other props: `placeholderCta`.

- [ ] **Step 2: Render it**

After the `placeholderStats` `</dl>`/title conditional (after line 115's closing `)}`) and before the `⌘K` hint line, insert:

```astro
{placeholderCta && (
  <a class="split-view__placeholder-cta" href={placeholderCta.href}>
    {placeholderCta.label} <span aria-hidden="true">→</span>
  </a>
)}
```

- [ ] **Step 3: Style it**

Next to the existing `.split-view__placeholder-hint` CSS rule (grep for it), add:

```css
.split-view__placeholder-cta {
  display: inline-block;
  margin-top: var(--space-md);
  font-family: var(--font-display);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
  color: var(--color-gold);
  text-decoration: none;
  padding: var(--space-2xs) var(--space-sm);
  border: var(--border-hairline) solid var(--color-gold-dim);
  clip-path: polygon(var(--cut-sm) 0, 100% 0, calc(100% - var(--cut-sm)) 100%, 0 100%);
}

.split-view__placeholder-cta:hover,
.split-view__placeholder-cta:focus-visible {
  background: var(--color-gold);
  color: var(--color-black);
}
```

(Hover/focus-visible parity is a repo convention. If `--color-gold-dim` doesn't exist, grep `global.css` for the dim-gold token name and use that.)

- [ ] **Step 4: Pass it from the journal page**

In `src/pages/journal/index.astro`, add to the `<SplitViewLayout>` props:

```astro
placeholderCta={{ href: '/codex', label: 'browse by theme — codex' }}
```

- [ ] **Step 5: Build + commit**

Run: `npx astro build`
Expected: green. (Codex/notes pages don't pass the prop, so nothing renders there.)

```bash
git add src/layouts/SplitViewLayout.astro src/pages/journal/index.astro
git commit -m "Journal placeholder links to the Codex as the thematic map"
```

---

### Task 6: Draw-a-card pure logic (TDD)

**Files:**
- Create: `src/utils/splitView/drawCard.ts`
- Create: `src/tests/drawCard.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { pickDrawCandidate } from '../utils/splitView/drawCard';

interface Candidate {
  slug: string;
  type: string;
}

const items: Candidate[] = [
  { slug: 'note-a', type: 'note' },
  { slug: 'showcase-a', type: 'showcase' },
  { slug: 'note-b', type: 'note' },
];

describe('pickDrawCandidate', () => {
  it('only ever draws notes', () => {
    for (let i = 0; i < 20; i++) {
      const picked = pickDrawCandidate(items, Math.random);
      expect(picked?.type).toBe('note');
    }
  });

  it('is uniform over the note pool via the injected rng', () => {
    expect(pickDrawCandidate(items, () => 0)?.slug).toBe('note-a');
    expect(pickDrawCandidate(items, () => 0.99)?.slug).toBe('note-b');
  });

  it('avoids the excluded slug when another note exists', () => {
    const picked = pickDrawCandidate(items, () => 0, 'note-a');
    expect(picked?.slug).toBe('note-b');
  });

  it('returns the sole note even if excluded (redraw beats dead button)', () => {
    const pool: Candidate[] = [{ slug: 'only', type: 'note' }];
    expect(pickDrawCandidate(pool, () => 0, 'only')?.slug).toBe('only');
  });

  it('returns null when no notes exist', () => {
    expect(pickDrawCandidate([{ slug: 's', type: 'showcase' }], () => 0)).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/tests/drawCard.test.ts`
Expected: FAIL — cannot resolve `../utils/splitView/drawCard`.

- [ ] **Step 3: Implement**

```ts
/**
 * Draw-a-card pool logic (journal serendipity). Pure — DOM-free, rng injected
 * for testability. Drafts never reach the pool: they aren't rendered at all.
 */
export interface DrawCandidate {
  slug: string;
  type: string;
}

export function pickDrawCandidate<T extends DrawCandidate>(
  items: T[],
  random: () => number,
  excludeSlug?: string
): T | null {
  const notes = items.filter((i) => i.type === 'note');
  if (notes.length === 0) return null;
  const pool = notes.filter((i) => i.slug !== excludeSlug);
  const from = pool.length > 0 ? pool : notes;
  return from[Math.floor(random() * from.length)];
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/tests/drawCard.test.ts`
Expected: 5 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/splitView/drawCard.ts src/tests/drawCard.test.ts
git commit -m "Add pure draw-a-card pool logic"
```

---

### Task 7: Draw-a-card UI — desktop deck + mobile button

**Files:**
- Modify: `src/layouts/SplitViewLayout.astro` (Props, placeholder markup, filter-row markup, CSS)
- Modify: `src/utils/splitView/index.ts` (wiring)
- Modify: `src/pages/journal/index.astro` (enable the prop)

Interaction contract (from the spec): desktop deck click → 3D flip reveals the drawn note's emblem + title on the card face → clicking the face loads the entry via `loadContent` (no history push surprise: it's a real selection, so push history as a normal click would — reuse the list item's own `.click()`). Clicking the deck again while a face is shown redraws. Mobile: a "DRAW" button navigates directly to the drawn note's `href`. Reduced motion: no flip animation, face appears instantly.

- [ ] **Step 1: Add the `showDraw` prop**

In `SplitViewLayout.astro` Props (next to `placeholderCta` from Task 5): `showDraw?: boolean;` — destructure it. In `src/pages/journal/index.astro`, add `showDraw` to the layout props.

- [ ] **Step 2: Desktop deck markup**

Inside `.split-view__placeholder-content`, after the `placeholderCta` block, insert:

```astro
{showDraw && (
  <div class="split-view__draw" data-draw-deck>
    <button class="split-view__draw-deck" type="button" aria-label="Draw a random note">
      <img src="/images/ygo-card-backing.png" alt="" width="90" height="126" loading="lazy" />
    </button>
    <button class="split-view__draw-face" type="button" hidden>
      <img class="split-view__draw-emblem" src="/images/emblems/default.svg" alt="" width="40" height="40" />
      <span class="split-view__draw-title"></span>
    </button>
    <p class="split-view__draw-hint">draw a card</p>
  </div>
)}
```

- [ ] **Step 3: Mobile draw button**

In the `.split-view__filter-row` (next to the clear-all button, line ~74), insert:

```astro
{showDraw && (
  <button class="split-view__draw-mobile" type="button" hidden data-draw-mobile>DRAW</button>
)}
```

(`hidden` by default; CSS reveals it only in the stacked layout so desktop never shows two draw controls.)

- [ ] **Step 4: CSS**

In SplitViewLayout's style block, near the placeholder styles:

```css
.split-view__draw {
  margin-top: var(--space-lg);
  perspective: 600px;
}

.split-view__draw-deck,
.split-view__draw-face {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-block;
}

.split-view__draw-deck img {
  display: block;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-hard);
  transition: transform var(--animation-base) var(--animation-easing);
}

.split-view__draw-deck:hover img,
.split-view__draw-deck:focus-visible img {
  transform: translateY(-4px);
}

.split-view__draw.is-flipping .split-view__draw-deck img {
  transform: rotateY(90deg);
}

.split-view__draw-face {
  width: 90px;
  min-height: 126px;
  border: var(--border-thick) solid var(--color-gold);
  border-radius: var(--radius-sm);
  background: var(--color-bg-base);
  color: var(--color-text);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  animation: draw-reveal var(--animation-base) var(--animation-easing);
}

@keyframes draw-reveal {
  from { transform: rotateY(-90deg); }
  to { transform: rotateY(0deg); }
}

.split-view__draw-title {
  font-family: var(--font-display);
  font-size: var(--text-2xs);
  line-height: 1.3;
  text-align: center;
}

.split-view__draw-emblem {
  filter: invert(1) opacity(0.8);
}

.split-view__draw-hint {
  margin-top: var(--space-sm);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.split-view__draw-mobile {
  font-family: var(--font-display);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-label);
  background: var(--color-black);
  color: var(--color-gold);
  border: var(--border-hairline) solid var(--color-gold-dim);
  padding: var(--space-2xs) var(--space-sm);
  cursor: pointer;
  clip-path: polygon(var(--cut-sm) 0, 100% 0, calc(100% - var(--cut-sm)) 100%, 0 100%);
}

@media (prefers-reduced-motion: reduce) {
  .split-view__draw-deck img,
  .split-view__draw-face {
    transition: none;
    animation: none;
  }
}
```

And inside the existing `@media (max-width: 900px)` block:

```css
    .split-view__draw-mobile[data-draw-mobile] {
      display: inline-block;
    }
```

plus remove the `hidden` attribute's effect there by revealing via attribute selector — simpler and equivalent: in the client wiring (next step) un-hide the button only when the stacked layout applies. Choose the wiring approach (JS un-hide) and skip this media-query rule if it fights the `hidden` attribute (an attribute-hidden element beats a `display` rule unless `!important` — use the JS approach).

- [ ] **Step 5: Client wiring in `src/utils/splitView/index.ts`**

Add imports: `import { pickDrawCandidate } from './drawCard';` (top of file). At the end of `initSplitView()` (after the auto-open block), add:

```ts
  // --- Draw a card (journal serendipity) ---
  const drawDeck = splitView.querySelector('[data-draw-deck]') as HTMLElement | null;
  const drawMobile = splitView.querySelector('[data-draw-mobile]') as HTMLElement | null;

  const drawPool = () =>
    elements.listItems
      .filter((item) => !item.classList.contains('is-filtered'))
      .map((item) => ({
        slug: item.dataset.slug || '',
        type: item.dataset.contentType || '',
        href: item.getAttribute('href') || '',
        title: item.querySelector('.list-item__title')?.textContent || '',
        emblem: item.dataset.emblem || '/images/emblems/default.svg',
      }));

  if (drawDeck) {
    const deckButton = drawDeck.querySelector('.split-view__draw-deck') as HTMLElement;
    const faceButton = drawDeck.querySelector('.split-view__draw-face') as HTMLButtonElement;
    const faceEmblem = drawDeck.querySelector('.split-view__draw-emblem') as HTMLImageElement;
    const faceTitle = drawDeck.querySelector('.split-view__draw-title') as HTMLElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let drawnSlug: string | null = null;

    const draw = () => {
      const picked = pickDrawCandidate(drawPool(), Math.random, drawnSlug ?? undefined);
      if (!picked) return;
      drawnSlug = picked.slug;
      faceEmblem.src = picked.emblem;
      faceTitle.textContent = picked.title;
      const reveal = () => {
        drawDeck.classList.remove('is-flipping');
        deckButton.hidden = true;
        faceButton.hidden = false;
        faceButton.focus();
      };
      if (reduceMotion.matches) {
        reveal();
      } else {
        drawDeck.classList.add('is-flipping');
        setTimeout(reveal, 200);
      }
    };

    deckButton.addEventListener('click', draw);
    faceButton.addEventListener('click', () => {
      if (!drawnSlug) return;
      const item = splitView.querySelector(`[data-slug="${drawnSlug}"]`) as HTMLElement | null;
      item?.click(); // normal selection path: history push, active state, load
    });
  }

  if (drawMobile) {
    // Only meaningful in the stacked layout, where the placeholder (and desk
    // deck) is hidden — reveal it there and keep desktop to the deck.
    const stackedQuery = window.matchMedia('(max-width: 900px)');
    const syncDrawMobile = () => { drawMobile.hidden = !stackedQuery.matches; };
    syncDrawMobile();
    stackedQuery.addEventListener('change', syncDrawMobile);
    drawMobile.addEventListener('click', () => {
      const picked = pickDrawCandidate(drawPool(), Math.random);
      if (picked?.href) window.location.href = picked.href;
    });
  }
```

Note: `drawPool()` reads the live DOM each draw, so filtered-out items (search/type) are excluded — drawing respects the current filter view, and drafts were never rendered.

- [ ] **Step 6: Tests + build**

Run: `npx vitest run && npx astro build`
Expected: 157 tests pass (152 + 5 from Task 6), build green.

- [ ] **Step 7: Live verification (dev server)**

Start the dev server (`.claude/launch.json` name `dev`, port 4321) and verify on `/journal`:
- Desktop: deck visible under the stats; click flips and reveals a note title; clicking the face opens that entry; the deck never draws a showcase (spot-check several draws); filter to `showcase` type first — deck click does nothing (empty pool) rather than erroring.
- Mobile (375px): DRAW button appears beside search; tapping navigates to a note page.
- Old link `/journal?tags=life` renders the full unfiltered list, and interacting with any filter scrubs `tags` from the URL.
- Emulate reduced motion: face appears without flip.

- [ ] **Step 8: Commit**

```bash
git add src/layouts/SplitViewLayout.astro src/utils/splitView/index.ts src/pages/journal/index.astro
git commit -m "Add draw-a-card to the journal (desktop deck, mobile button)"
```

---

### Task 8: Thread the Japan cluster via collections

**Files:**
- Modify: `src/content/notes/reason-for-japan.md`, `japanese-special.md`, `jp-journal.md`, `vibe-learning.md`, `real-weeb.md`, `waifus.md`

- [ ] **Step 1: Add the collection to each of the six notes**

In each file's frontmatter, set `collections: ["japan"]` (the field exists in the schema with default `[]`; if a file already has a `collections:` line, append `"japan"` to it rather than replacing).

- [ ] **Step 2: Build + verify RelatedContent**

Run: `npx astro build`
Then in dev, open `/notes/real-weeb` and confirm a Related grid appears at the bottom listing other Japan notes.

- [ ] **Step 3: Commit**

```bash
git add src/content/notes
git commit -m "Thread the Japan notes via the japan collection"
```

---

### Task 9: Docs + final sweep

**Files:**
- Modify: `CLAUDE.md` (journal filter description, `/journal` route section, splitView module list, "Adding New Content" steps that mention tags for notes/showcases)
- Modify: `README.md` (if it mentions tag filtering — check)

- [ ] **Step 1: Update CLAUDE.md**

Grep for stale claims: `grep -n "tags\|Tags" CLAUDE.md`. Update: the `/journal` section (filters are now search + type only; add the codex CTA + draw-a-card), the Content Collections Schema section (`tags` is shelf-only now), the splitView module list (add `drawCard`), and "Adding New Content" (remove tag guidance for notes/showcases). Keep shelf tag mentions.

- [ ] **Step 2: Check README**

`grep -n "tag" README.md` — expected: only the "filterable split-view list" phrase; reword to "searchable split-view list" if present.

- [ ] **Step 3: Full suite + build one last time**

Run: `npx vitest run && npx astro build`
Expected: 157 tests, green build, and the only build warning is the known novel-folder deprecation.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "Docs: tagless journal, codex as thematic map, draw-a-card"
```

---

## Self-Review Notes

- Spec §1 (remove tags) → Tasks 1-4. Spec §2 (codex CTA) → Task 5. Spec §3 (collections) → Task 8. Spec §4 (draw) → Tasks 6-7. Docs → Task 9.
- Deviation from spec, deliberate: `tags` stays in the schema file but scoped to shelf — the spec's "drop from schema outright" assumed no other consumer; the shelf hero/quick-view/detail pages render shelf tags (`peak`, `waifu`). Spec updated understanding is recorded here rather than editing the approved spec.
- `pickDrawCandidate` name is consistent across Task 6 (definition) and Task 7 (import/use).
- The `?tags=` degrade path: `getFiltersFromURL` never reads it (harmless), and `updateURL` actively deletes it on first interaction.
