# Homepage & Flow Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge Notes + Showcase into a `/journal` section, rebalance the homepage grid (Journal 4×2 core tile, rain-gauge Novel tile, Latest 2×2, email tile replacing TOP), reduce the NavPill to 4 items site-wide including /stream, and fix the `stripMarkdown` HTML leak.

**Architecture:** Content collections stay separate on disk; only the *list pages* merge (new `/journal` route; `/notes` and `/showcase` become 301 redirects; detail URLs unchanged). The split-view filter engine already supports a `types` facet end-to-end (`?types=` URL param, pills UI, `data-content-type`), so Journal only needs to feed it. The rain-gauge Novel tile computes word counts and last-modified timestamps at build time in `novel.ts` and resolves the rain state client-side from embedded data attributes.

**Tech Stack:** Astro 5, vanilla CSS (P4G design system), TypeScript, vitest.

**Spec:** `docs/superpowers/specs/2026-07-08-homepage-flow-refinement-design.md`

**Conventions to honor** (from CLAUDE.md): every `:hover` gets `:focus-visible` parity; respect `prefers-reduced-motion`; use existing CSS variables; 50–100ms stagger for lists; `clip-path` clips `box-shadow` (use `filter: drop-shadow()` wrappers for cut elements).

---

### Task 1: stripMarkdown strips raw HTML

**Files:**
- Create: `src/tests/content.test.ts`
- Modify: `src/utils/content.ts`

- [ ] **Step 1: Write the failing test**

Create `src/tests/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { stripMarkdown, hasMinimalContent } from '../utils/content';

describe('stripMarkdown', () => {
  it('strips raw HTML tags, keeping inner text', () => {
    expect(stripMarkdown('Hello <strong>world</strong>')).toBe('Hello world');
  });

  it('strips iframe embeds entirely', () => {
    const input = '<iframe width="560" height="315" src="https://www.youtube.com/embed/x"></iframe>\n\nA video essay about Marie.';
    expect(stripMarkdown(input)).toBe('A video essay about Marie.');
  });

  it('strips self-closing and multi-line tags', () => {
    expect(stripMarkdown('before <img\n  src="x.png"\n/> after')).toBe('before after');
  });

  it('still strips markdown syntax', () => {
    expect(stripMarkdown('# Head\n**bold** [link](https://x.com)')).toBe('Head bold link');
  });
});

describe('hasMinimalContent', () => {
  it('treats HTML-only bodies as minimal', () => {
    expect(hasMinimalContent('<iframe src="https://youtube.com/embed/x"></iframe>')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/content.test.ts`
Expected: FAIL — `strips raw HTML tags` and the iframe cases fail (tags leak through).

- [ ] **Step 3: Implement**

In `src/utils/content.ts`, add two replacements to `stripMarkdown` after the inline-code line (order matters — code blocks first so code samples containing `<` aren't half-stripped):

```ts
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')           // Remove code blocks
    .replace(/`[^`]+`/g, '')                  // Remove inline code
    .replace(/<[^>]*>/g, ' ')                 // Remove raw HTML tags (incl. multi-line)
    .replace(/&[a-z#0-9]+;/gi, ' ')           // Remove HTML entities
    .replace(/!\[.*?\]\(.*?\)/g, '')          // Remove images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
    .replace(/^#{1,6}\s+/gm, '')              // Remove headings
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove bold/italic
    .replace(/\s+/g, ' ')                     // Collapse whitespace
    .trim();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/content.test.ts`
Expected: PASS (all 5).

- [ ] **Step 5: Run the full suite (regression)**

Run: `npm run test`
Expected: PASS — no other suite depends on tags surviving `stripMarkdown`.

- [ ] **Step 6: Commit**

```bash
git add src/utils/content.ts src/tests/content.test.ts
git commit -m "fix: stripMarkdown removes raw HTML tags and entities"
```

---

### Task 2: Novel stats helper (word counts + story/outline timestamps)

**Files:**
- Modify: `src/utils/novel.ts`
- Modify: `src/tests/novel.test.ts`

The `NovelFile.body` field is **already-rendered HTML** (marked runs at build). Word counting strips tags first. "Story" = the top-level folder whose slug is `scenes`; everything else is "outline". Files without a sidecar `Modified:` date fall back to filesystem mtime, which requires capturing mtime in `buildFolder`.

- [ ] **Step 1: Write the failing tests**

Append to `src/tests/novel.test.ts`:

```ts
import { computeNovelStats, countWords, type NovelTree } from '../utils/novel';

describe('countWords', () => {
  it('counts words in HTML, ignoring tags and entities', () => {
    expect(countWords('<p>It rains <em>softly</em> tonight&nbsp;here</p>')).toBe(5);
  });

  it('returns 0 for empty or tag-only input', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('<hr/><br>')).toBe(0);
  });
});

describe('computeNovelStats', () => {
  const file = (over: object) => ({
    slug: 'f', title: 'F', body: '<p>one two three</p>',
    created: null, modified: null, mtime: null, path: ['x'], ...over,
  });
  const folder = (slug: string, files: any[], subfolders = {}) =>
    ({ slug, title: slug, files, subfolders });

  it('splits story (scenes/) from outline words, recursing subfolders', () => {
    const tree: NovelTree = {
      scenes: folder('scenes', [file({})], {
        'act-1': folder('act-1', [file({ body: '<p>four five</p>' })]),
      }),
      characters: folder('characters', [file({ body: '<p>a b c d</p>' })]),
    };
    const stats = computeNovelStats(tree);
    expect(stats.storyWords).toBe(5);
    expect(stats.outlineWords).toBe(4);
  });

  it('tracks last modified per group, preferring sidecar over mtime', () => {
    const tree: NovelTree = {
      scenes: folder('scenes', [
        file({ modified: '2026-07-01' }),
        file({ modified: null, mtime: '2026-07-05T00:00:00.000Z' }),
      ]),
      lore: folder('lore', [file({ modified: '2026-06-01' })]),
    };
    const stats = computeNovelStats(tree);
    expect(stats.lastSceneModified).toBe('2026-07-05T00:00:00.000Z');
    expect(stats.lastOutlineModified).toBe(new Date('2026-06-01').toISOString());
  });

  it('handles missing scenes folder and empty tree', () => {
    expect(computeNovelStats({})).toEqual({
      storyWords: 0, outlineWords: 0,
      lastSceneModified: null, lastOutlineModified: null,
    });
    const stats = computeNovelStats({ lore: folder('lore', [file({})]) });
    expect(stats.storyWords).toBe(0);
    expect(stats.lastSceneModified).toBeNull();
  });

  it('ignores unparseable dates', () => {
    const tree: NovelTree = { scenes: folder('scenes', [file({ modified: 'not a date' })]) };
    expect(computeNovelStats(tree).lastSceneModified).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/tests/novel.test.ts`
Expected: FAIL — `computeNovelStats`/`countWords` not exported.

- [ ] **Step 3: Implement in `src/utils/novel.ts`**

Add `mtime` to `NovelFile` (additive — existing consumers unaffected):

```ts
export interface NovelFile {
  slug: string;
  title: string;
  body: string;         // markdown pre-rendered to HTML at build time
  created: string | null;
  modified: string | null;
  mtime: string | null; // filesystem mtime ISO — fallback when no sidecar
  path: string[];
}
```

In `buildFolder`, the `stat` for each entry is already computed; populate the field where files are pushed:

```ts
      files.push({
        slug: fileSlug,
        title,
        body,
        created: meta.created,
        modified: meta.modified,
        mtime: stat.mtime.toISOString(),
        path: [...pathSegments, fileSlug],
      });
```

Append at the end of the file:

```ts
export interface NovelStats {
  storyWords: number;
  outlineWords: number;
  lastSceneModified: string | null;   // ISO
  lastOutlineModified: string | null; // ISO
}

/** Count words in a pre-rendered HTML body. */
export function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').trim();
  return text ? text.split(/\s+/).length : 0;
}

function collectFiles(folder: NovelFolder): NovelFile[] {
  return [
    ...folder.files,
    ...Object.values(folder.subfolders).flatMap(collectFiles),
  ];
}

/**
 * Story vs outline stats for the homepage rain-gauge tile.
 * Story = top-level `scenes` folder; outline = every other top-level folder.
 */
export function computeNovelStats(tree: NovelTree): NovelStats {
  let storyWords = 0;
  let outlineWords = 0;
  let lastScene: Date | null = null;
  let lastOutline: Date | null = null;

  for (const [slug, folder] of Object.entries(tree)) {
    const isStory = slug === 'scenes';
    for (const file of collectFiles(folder)) {
      const words = countWords(file.body);
      if (isStory) storyWords += words;
      else outlineWords += words;

      const raw = file.modified ?? file.mtime;
      if (!raw) continue;
      const d = new Date(raw);
      if (isNaN(d.getTime())) continue;
      if (isStory) {
        if (!lastScene || d > lastScene) lastScene = d;
      } else {
        if (!lastOutline || d > lastOutline) lastOutline = d;
      }
    }
  }

  return {
    storyWords,
    outlineWords,
    lastSceneModified: lastScene?.toISOString() ?? null,
    lastOutlineModified: lastOutline?.toISOString() ?? null,
  };
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/tests/novel.test.ts`
Expected: PASS (existing `buildNovelTree` tests may assert file shapes — if one fails on the new `mtime` key, update that fixture/assertion to include it; mtime values from real files vary, so assert `expect(typeof file.mtime).toBe('string')` rather than a literal).

- [ ] **Step 5: Commit**

```bash
git add src/utils/novel.ts src/tests/novel.test.ts
git commit -m "feat: computeNovelStats — story/outline word counts and last-modified"
```

---

### Task 3: Journal entries utility

**Files:**
- Create: `src/utils/journal.ts`
- Create: `src/tests/journal.test.ts`

Pure merge/sort logic is unit-tested; the `getCollection` wrapper is exercised by the build.

- [ ] **Step 1: Write the failing test**

Create `src/tests/journal.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mergeJournalEntries } from '../utils/journal';

const entry = (slug: string, publishedAt: string, updatedAt?: string) => ({
  slug,
  body: '',
  data: {
    title: slug,
    tags: [],
    publishedAt: new Date(publishedAt),
    ...(updatedAt ? { updatedAt: new Date(updatedAt) } : {}),
  },
});

describe('mergeJournalEntries', () => {
  it('interleaves notes and showcase by effective date, newest first', () => {
    const notes = [entry('old-note', '2026-01-01'), entry('new-note', '2026-07-01')];
    const showcase = [entry('mid-inquiry', '2026-03-01')];
    const merged = mergeJournalEntries(notes as any, showcase as any);
    expect(merged.map(m => m.entry.slug)).toEqual(['new-note', 'mid-inquiry', 'old-note']);
  });

  it('tags each item with type and href', () => {
    const merged = mergeJournalEntries([entry('a', '2026-01-01')] as any, [entry('b', '2026-02-01')] as any);
    expect(merged[0]).toMatchObject({ type: 'inquiry', href: '/showcase/b' });
    expect(merged[1]).toMatchObject({ type: 'fragment', href: '/notes/a' });
  });

  it('prefers updatedAt over publishedAt for ordering', () => {
    const notes = [entry('bumped', '2026-01-01', '2026-06-01')];
    const showcase = [entry('newer-pub', '2026-03-01')];
    const merged = mergeJournalEntries(notes as any, showcase as any);
    expect(merged[0].entry.slug).toBe('bumped');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/tests/journal.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `src/utils/journal.ts`**

```ts
import { getCollection, type CollectionEntry } from 'astro:content';

export type JournalType = 'inquiry' | 'fragment';

export interface JournalItem {
  entry: CollectionEntry<'notes'> | CollectionEntry<'showcase'>;
  type: JournalType;
  href: string;
}

const effectiveDate = (e: { data: { updatedAt?: Date; publishedAt?: Date } }) =>
  new Date(e.data.updatedAt || e.data.publishedAt || 0).getTime();

/** Merge notes + showcase into one date-sorted journal list (pure; unit-tested). */
export function mergeJournalEntries(
  notes: CollectionEntry<'notes'>[],
  showcase: CollectionEntry<'showcase'>[]
): JournalItem[] {
  const items: JournalItem[] = [
    ...notes.map(e => ({ entry: e, type: 'fragment' as const, href: `/notes/${e.slug}` })),
    ...showcase.map(e => ({ entry: e, type: 'inquiry' as const, href: `/showcase/${e.slug}` })),
  ];
  return items.sort((a, b) => effectiveDate(b.entry) - effectiveDate(a.entry));
}

/** Fetch all non-draft notes + showcase entries as a merged journal list. */
export async function getJournalItems(): Promise<JournalItem[]> {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  const showcase = await getCollection('showcase', ({ data }) => !data.draft);
  return mergeJournalEntries(notes, showcase);
}
```

Note: `astro:content` is a virtual module — vitest resolves the file because the test only imports `mergeJournalEntries` and vitest doesn't execute `getCollection`. If the import itself fails under vitest, split the pure function into `src/utils/journalMerge.ts` (no astro imports) and re-export from `journal.ts`; adjust the test import accordingly.

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/tests/journal.test.ts`
Expected: PASS (or apply the split noted above, then PASS).

- [ ] **Step 5: Commit**

```bash
git add src/utils/journal.ts src/tests/journal.test.ts
git commit -m "feat: journal utility merging notes + showcase entries"
```

---

### Task 4: contentLoader fetches by item href (mixed-collection lists)

**Files:**
- Modify: `src/utils/splitView/contentLoader.ts:70-84,106-109`

`loadContent` currently builds `/${state.section}/${slug}/` — wrong for a Journal list whose items live under `/notes/` and `/showcase/`. The list item anchor already carries the correct href.

- [ ] **Step 1: Implement**

In `loadContent`, after the `activeItem` lookup (line ~60), derive the fetch path, and use it in the three places the section path is currently built:

```ts
  const activeHref = activeItem?.getAttribute('href');
  const path = activeHref ?? `/${state.section}/${slug}/`;
```

Then:

```ts
    const response = await fetch(path);
```

```ts
      if (pushHistory) {
        history.pushState({ slug }, '', path);
        syncPageMeta(doc);
      }
```

```ts
  } catch (error) {
    console.error('Failed to load content:', error);
    window.location.href = path;
  }
```

- [ ] **Step 2: Verify existing pages still work (manual, quick)**

Run: `npm run dev` and open `http://localhost:4321/notes` — click two entries; detail loads, URL updates to `/notes/<slug>`, back button works.
Expected: identical behavior to before (hrefs on notes items are `/notes/<slug>`, same as the constructed path).

- [ ] **Step 3: Commit**

```bash
git add src/utils/splitView/contentLoader.ts
git commit -m "refactor: splitView contentLoader fetches by list-item href"
```

---

### Task 5: NavPill — 4 items with legacy-path matching

**Files:**
- Modify: `src/components/NavPill.astro:11-20`

- [ ] **Step 1: Implement**

Replace the `SECTIONS` array and `isActive`:

```ts
const SECTIONS = [
  { href: '/', label: 'Home', match: ['/'] },
  { href: '/journal', label: 'Journal', match: ['/journal', '/notes', '/showcase'] },
  { href: '/shelf', label: 'Shelf', match: ['/shelf'] },
  { href: '/now', label: 'Now', match: ['/now'] },
];

const isActive = (section: (typeof SECTIONS)[number]) =>
  section.href === '/'
    ? isHome
    : section.match.some(m => currentPath === m || currentPath.startsWith(`${m}/`));
```

Update the two call sites in the template from `isActive(section.href)` to `isActive(section)`.

- [ ] **Step 2: Verify**

Run: `npm run dev`, open `/shelf` — pill shows HOME / JOURNAL / SHELF / NOW with SHELF active. Open `/notes/avoidance` — JOURNAL is active.
Expected: as described (the `/journal` link 404s until Task 6 — fine for now).

- [ ] **Step 3: Commit**

```bash
git add src/components/NavPill.astro
git commit -m "feat: NavPill consolidates to Home/Journal/Shelf/Now"
```

---

### Task 6: /journal page, redirects, merged lists on detail pages

**Files:**
- Create: `src/pages/journal/index.astro`
- Modify: `src/layouts/SplitViewLayout.astro:22-26` (kicker map)
- Modify: `src/pages/notes/index.astro` (becomes redirect)
- Modify: `src/pages/showcase/index.astro` (becomes redirect)
- Modify: `src/pages/notes/[...slug].astro:22,40-51`
- Modify: `src/pages/showcase/[...slug].astro` (same pattern)

- [ ] **Step 1: Add the journal kicker to SplitViewLayout**

In `src/layouts/SplitViewLayout.astro`:

```ts
const SECTION_KICKERS: Record<string, string> = {
  notes: 'fragments',
  showcase: 'inquiries',
  journal: 'fragments & inquiries',
};
```

- [ ] **Step 2: Create `src/pages/journal/index.astro`**

```astro
---
import SplitViewLayout from '../../layouts/SplitViewLayout.astro';
import ListItem from '../../components/ListItem.astro';
import { stripMarkdown, hasMinimalContent } from '../../utils/content';
import { formatDate } from '../../utils/dates';
import { getJournalItems } from '../../utils/journal';

const items = await getJournalItems();

const FEATURED = [
  { href: '/novel', label: 'Novel', title: 'Remember Rain', blurb: 'An in-progress novel with its own reader.' },
  { href: '/stream', label: 'Stream', title: 'Stream Log', blurb: 'Session stats, journal, and bonds.' },
];
---

<SplitViewLayout
  title="Journal"
  description="Inquiries I'm building and fragments I'm turning over."
  section="journal"
  ogImage="/social-default.svg"
>
  <Fragment slot="list">
    <div class="journal-featured" role="presentation">
      {FEATURED.map(card => (
        <a href={card.href} class="journal-featured__card">
          <span class="journal-featured__label">{card.label}</span>
          <span class="journal-featured__title">{card.title}</span>
          <span class="journal-featured__blurb">{card.blurb}</span>
        </a>
      ))}
    </div>
    {items.length > 0 ? (
      items.map(({ entry, type, href }) => (
        <ListItem
          href={href}
          slug={entry.slug}
          title={entry.data.title}
          subtitle={stripMarkdown(entry.body).split('\n').find(l => l.trim().length > 20)?.trim().slice(0, 90)}
          meta={entry.data.publishedAt ? formatDate(entry.data.publishedAt) : undefined}
          tags={entry.data.tags}
          contentType={type}
          searchableContent={stripMarkdown(entry.body).slice(0, 500)}
          hasMinimalContent={hasMinimalContent(entry.body)}
        />
      ))
    ) : (
      <p class="empty-state">Nothing here yet.</p>
    )}
  </Fragment>
</SplitViewLayout>

<style>
  .journal-featured {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    border-bottom: var(--border-hairline) solid var(--color-border);
  }

  .journal-featured__card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    padding: var(--space-sm);
    background: var(--color-bg-deep);
    border: var(--border-medium) solid var(--color-border);
    text-decoration: none;
    clip-path: polygon(var(--cut-sm) 0, 100% 0, calc(100% - var(--cut-sm)) 100%, 0 100%);
    transition: border-color var(--transition-fast), background var(--transition-fast);
  }

  .journal-featured__card:hover,
  .journal-featured__card:focus-visible {
    border-color: var(--color-gold);
    background: rgba(255, 229, 44, 0.06);
  }

  .journal-featured__label {
    font-family: var(--font-display);
    font-size: var(--text-2xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    color: var(--color-gold);
  }

  .journal-featured__title {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text);
  }

  .journal-featured__blurb {
    font-size: var(--text-2xs);
    color: var(--color-text-muted);
  }

  .empty-state {
    color: var(--color-muted);
    font-style: italic;
    text-align: center;
    padding: var(--space-xl);
  }
</style>
```

(If any CSS variable above doesn't exist in `global.css` — check `--color-bg-deep`, `--tracking-label`, `--cut-sm` with grep — substitute the nearest existing token rather than inventing one.)

- [ ] **Step 3: Turn the old list pages into 301 redirects**

Replace the **entire contents** of `src/pages/notes/index.astro` with (this matches the `src/pages/favorites.astro` pattern):

```astro
---
return Astro.redirect('/journal?types=fragment', 301);
---
```

Replace the **entire contents** of `src/pages/showcase/index.astro` with:

```astro
---
return Astro.redirect('/journal?types=inquiry', 301);
---
```

Note: the query param is `types` (plural) — that is what `src/utils/splitView/urlState.ts` parses.

- [ ] **Step 4: Give detail pages the merged list**

In `src/pages/notes/[...slug].astro`, replace the list construction. Change line 22 and the imports:

```ts
import { getAllCollections } from '../../utils/collections';
import { getJournalItems } from '../../utils/journal';
```

```ts
const journalItems = await getJournalItems();
```

(delete the `getSortedEntries` import/use), change `section="notes"` to stay as-is (the detail fetch is now href-driven per Task 4; `section` still keys the kicker — change `title="Notes"` to `title="Journal"` and `section="notes"` to `section="journal"` so the left panel matches /journal), and replace the list slot:

```astro
  <Fragment slot="list">
    {journalItems.map(({ entry: item, type, href }) => (
      <ListItem
        href={href}
        slug={item.slug}
        title={item.data.title}
        tags={item.data.tags}
        contentType={type}
        searchableContent={stripMarkdown(item.body).slice(0, 500)}
        hasMinimalContent={hasMinimalContent(item.body)}
      />
    ))}
  </Fragment>
```

Apply the identical change to `src/pages/showcase/[...slug].astro` (same imports, same list slot, `title="Journal"`, `section="journal"`).

Known edge (accept): if a note and a showcase entry ever share a slug, the `data-slug` active-highlight would match both. No current collision; the detail fetch itself is href-based and unaffected.

- [ ] **Step 5: Unknown `?types=` values fall back to All (spec edge case)**

In `src/utils/splitView/filterUI.ts`, at the top of `populateTypes` after `allTypes` is built, prune unknown selections (the `selectedTypes` Set is shared by reference with the filter engine, so pruning here restores the unfiltered list):

```ts
  const allTypes = new Set<string>();
  listItems.forEach((item) => {
    const type = item.dataset.contentType;
    if (type) allTypes.add(type);
  });

  // URL may carry stale/unknown types (e.g. hand-edited ?types=) — drop them
  selectedTypes.forEach((t) => {
    if (!allTypes.has(t)) selectedTypes.delete(t);
  });
```

Verify: `/journal?types=bogus` shows the full list, not "No entries found".

- [ ] **Step 6: Verify in dev**

Run: `npm run dev`. Check:
1. `/journal` lists both collections newest-first with INQUIRY/FRAGMENT badges and the two featured cards.
2. Type dropdown shows `fragment` / `inquiry` pills; selecting one filters and writes `?types=`.
3. `/journal?types=inquiry` preselects the filter on load.
4. `/notes` and `/showcase` redirect to the filtered journal.
5. Clicking a showcase entry from `/journal` loads its detail; URL becomes `/showcase/<slug>`.
6. Visiting `/notes/avoidance` directly shows the merged list with that entry active.

- [ ] **Step 7: Build check**

Run: `npm run build`
Expected: succeeds; `/journal/index.html` emitted; `/notes/index.html` and `/showcase/index.html` emitted as redirects.

- [ ] **Step 8: Commit**

```bash
git add src/pages/journal src/pages/notes src/pages/showcase src/layouts/SplitViewLayout.astro src/utils/splitView/filterUI.ts
git commit -m "feat: /journal merges notes + showcase lists; old list pages 301"
```

---

### Task 7: Stream page gets the NavPill, loses the home link

**Files:**
- Modify: `src/pages/stream/index.astro:145` (+ imports, + NavPill render)

- [ ] **Step 1: Implement**

Add to the imports in `src/pages/stream/index.astro`:

```ts
import NavPill from '../../components/NavPill.astro';
```

Render `<NavPill />` as the first child inside `<BaseLayout ...>` (it positions itself `fixed` bottom-left; placement in markup doesn't matter visually, but keep it before the page content for focus order).

Change line 145 from a link to a static label (keeps the sidebar header visual, removes the redundant home affordance):

```astro
      <span class="s-logo">Ninjaruss</span>
```

Check `src/styles/stream.css` for `.s-logo:hover` / link-specific styles (`grep -n "s-logo" src/styles/stream.css`) and remove any now-dead `:hover`/`cursor: pointer` rules on it.

- [ ] **Step 2: Verify**

Run: `npm run dev`, open `/stream`.
Expected: NavPill bottom-left (no active item — stream isn't in the pill; that's per spec), "NINJARUSS" is plain text, the internal Status/Journal/Bonds/Mailbox sidebar unchanged. Confirm the pill doesn't overlap the sidebar's lower items at 1280×800 — if it does, add `padding-bottom: 96px` to the sidebar container in `stream.css`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/stream/index.astro src/styles/stream.css
git commit -m "feat: stream page uses site NavPill instead of home link"
```

---

### Task 8: Homepage — Journal core tile (4×2) + Latest 2×2 with exclusion

**Files:**
- Modify: `src/pages/index.astro` (frontmatter ~1-137; tiles at 216-265 and 392-421; scripts ~1704-1737; scoped CSS)

- [ ] **Step 1: Frontmatter — journal data + latest exclusion + excerpts**

In `src/pages/index.astro` frontmatter, add imports:

```ts
import { stripMarkdown } from '../utils/content';
```

Replace the `recentNotes` block (lines 48-52) with a merged journal list (notes + showcase are already fetched):

```ts
type JournalRow = { href: string; title: string; type: 'inquiry' | 'fragment' };
const recentJournal: JournalRow[] = [
  ...notes.map(e => ({ href: `/notes/${e.slug}`, title: e.data.title, type: 'fragment' as const, d: effectiveDate(e) })),
  ...showcase.map(e => ({ href: `/showcase/${e.slug}`, title: e.data.title, type: 'inquiry' as const, d: effectiveDate(e) })),
]
  .sort((a, b) => b.d - a.d)
  .slice(0, 5)
  .map(({ href, title, type }) => ({ href, title, type }));
```

Keep `recentShowcase` (emblem strip source) as-is.

Replace the latest-entries selection (lines 54-62) so it skips journal-tile rows, with fallback:

```ts
const journalHrefs = new Set(recentJournal.map(r => r.href));
const allContent = [...notes, ...media, ...showcase];
const sorted = allContent.sort((a, b) => effectiveDate(b) - effectiveDate(a));
const eligible = sorted.filter(e => !journalHrefs.has(`/${e.collection}/${e.slug}`));
const latestPool = eligible.length > 0 ? eligible : sorted;

const mostRecentDate = latestPool[0] ? effectiveDate(latestPool[0]) : null;
const sameDateEntries = mostRecentDate
  ? latestPool.filter(entry => effectiveDate(entry) === mostRecentDate)
  : [];
```

Add `excerpt` to `latestEntries` (lines 131-137):

```ts
const latestEntries = sameDateEntries.map(entry => ({
  title: entry.data.title,
  href: `/${entry.collection}/${entry.slug}`,
  publishedAt: entry.data.publishedAt!.toISOString(),
  updatedAt: entry.data.updatedAt?.toISOString(),
  emblem: entry.data.emblem ?? DEFAULT_EMBLEM,
  excerpt: stripMarkdown(entry.body).slice(0, 140),
}));
```

- [ ] **Step 2: Replace the Showcase + Notes tiles with one Journal tile**

Delete the two `<BentoTile>` blocks at lines 216-265 (`showcase-tile` and `notes-tile`) and insert (root is a `div`, not `<a>` — header and rows are real links; no nested anchors):

```astro
      <!-- Rows 2-3: Journal (4×2) + Novel (1×2) + Stream (1×2) -->
      <div class="bento-tile bento-tile--full bento-tile--highlight bento-tile--core bento-tile--span-4x2 journal-tile">
        <a href="/journal" class="journal-tile__head">
          <div class="bento-tile__header">
            <span class="bento-tile__label">Journal</span>
            <h3 class="bento-tile__title">Inquiries & Fragments</h3>
          </div>
          <p class="bento-tile__description">Projects I'm building and ideas I'm turning over.</p>
        </a>
        {recentJournal.length > 0 && (
          <div class="journal-tile__list">
            {recentJournal.map(row => (
              <a class="journal-tile__row" href={row.href} title={row.title}>
                <span class="journal-tile__type">{row.type}</span>
                <span class="journal-tile__row-title">{row.title}</span>
              </a>
            ))}
          </div>
        )}
        {recentShowcase.length > 0 && (
          <div class="journal-tile__emblems">
            {recentShowcase.map(entry => (
              <a href={entry.href} class="journal-tile__emblem" title={entry.title}>
                <img src={entry.emblem} alt="" loading="lazy" aria-hidden="true" />
              </a>
            ))}
          </div>
        )}
        <span class="bento-tile__corner" aria-hidden="true"></span>
      </div>
```

- [ ] **Step 3: Grow the Latest tile to 2×2 and add the excerpt element**

At line 396, change `bento-tile--span-2x1` to `bento-tile--span-2x2`. Inside `.latest-tile__text`, after the `bento-tile__header` div, add:

```astro
              <p class="latest-tile__excerpt" id="latest-excerpt"></p>
```

In `initializeLatestTile()` (line ~1705), after the title update, add:

```ts
        const excerptEl = document.getElementById('latest-excerpt');
        if (excerptEl) excerptEl.textContent = entry.excerpt || '';
```

- [ ] **Step 4: Journal tile CSS + excerpt CSS**

The old `.tile-notes-list` / `.tile-note-link` styles (lines ~874-900) become dead — delete them. Add to the page's `<style>` (highlight tile = gold background, so rows are black-on-gold):

```css
  .journal-tile {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .journal-tile__head {
    text-decoration: none;
    color: inherit;
  }

  .journal-tile__head:hover .bento-tile__title,
  .journal-tile__head:focus-visible .bento-tile__title {
    text-decoration: underline;
    text-decoration-thickness: 3px;
  }

  .journal-tile__list {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .journal-tile__row {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-2xs) var(--space-xs);
    border-top: 1px solid rgba(0, 0, 0, 0.15);
    text-decoration: none;
    color: var(--color-black);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    transition: background var(--transition-fast);
  }

  .journal-tile__row:hover,
  .journal-tile__row:focus-visible {
    background: rgba(0, 0, 0, 0.85);
    color: var(--color-gold);
  }

  .journal-tile__type {
    flex-shrink: 0;
    padding: 1px 6px;
    background: var(--color-black);
    color: var(--color-gold);
    font-family: var(--font-display);
    font-size: var(--text-2xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    clip-path: polygon(0 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
    padding-right: 10px;
  }

  .journal-tile__row-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .journal-tile__emblems {
    display: flex;
    gap: var(--space-xs);
  }

  .journal-tile__emblem {
    width: 56px;
    height: 56px;
    border: 2px solid var(--color-black);
    overflow: hidden;
    flex-shrink: 0;
    transition: transform var(--transition-fast);
  }

  .journal-tile__emblem:hover,
  .journal-tile__emblem:focus-visible {
    transform: translateY(-3px);
  }

  .journal-tile__emblem img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .latest-tile__excerpt {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: var(--space-xs);
  }
```

- [ ] **Step 5: Span-4x2 responsive rules**

Run `grep -n "span-4x2\|span-3x2" src/styles/bento.css`. If `--span-4x2` lacks the responsive collapse rules that `--span-3x2` has, mirror them (e.g. at the 900px/768px breakpoints, whatever `--span-3x2` does — typically collapsing to `span 2` then full width). The `showcase-tile`-specific scoped CSS in `index.astro` (search `showcase-tile`) is dead after Step 2 — delete it, along with `notes-tile` rules.

- [ ] **Step 6: Verify**

Run: `npm run dev`, open `/`.
Expected: rows 2-3 show Journal (4 cols wide, gold) + Stream (Novel joins in Task 9); journal rows deep-link; Latest is 2×2 with an excerpt; keyboard-Tab reaches header, each row, each emblem.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro src/styles/bento.css
git commit -m "feat: homepage Journal 4x2 core tile; Latest grows to 2x2 with excerpt"
```

---

### Task 9: Homepage — rain-gauge Novel tile, promoted to rows 2-3

**Files:**
- Modify: `src/pages/index.astro` (frontmatter novel block ~64-87; tile markup 423-448; script ~1739-1755; CSS)

- [ ] **Step 1: Frontmatter — use computeNovelStats**

Add to imports: `import { buildNovelTree, computeNovelStats } from '../utils/novel';` (replacing the existing `buildNovelTree` import). After the existing `novelTree` build, keep the recent-file breadcrumb loop as-is, and add:

```ts
const novelStats = computeNovelStats(novelTree);
```

(The existing `novelLastModifiedISO` variable and its `#novel-days-ago` consumer are removed in Step 2/3.)

- [ ] **Step 2: Replace the Novel tile markup and move it**

Delete the current novel tile block (lines 423-448). Insert the new tile **between the Journal tile and the Stream tile** (so grid auto-placement lands it in column 5, rows 2-3):

```astro
      <a
        href="/novel"
        class="bento-tile bento-tile--full bento-tile--small bento-tile--dark bento-tile--interactive bento-tile--span-1x2 novel-tile"
        id="novel-tile"
        data-scene-modified={novelStats.lastSceneModified ?? ''}
        data-outline-modified={novelStats.lastOutlineModified ?? ''}
      >
        <div class="novel-rain" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <span class="novel-rain__drop" style={`--i: ${i};`}></span>
          ))}
        </div>
        <div class="bento-tile__header">
          <span class="bento-tile__label">Novel</span>
          <h3 class="bento-tile__title">Remember Rain</h3>
        </div>
        {novelRecentFolderTitle && novelRecentFileTitle && (
          <p class="novel-tile__recent">
            <span class="novel-tile__folder">{novelRecentFolderTitle}</span>
            <span class="novel-tile__sep">›</span>
            <span class="novel-tile__file">{novelRecentFileTitle}</span>
          </p>
        )}
        <p class="novel-tile__waits">the rain waits.</p>
        <div class="novel-tile__words">
          <span class="novel-tile__story">{novelStats.storyWords.toLocaleString('en-US')}</span>
          <span class="novel-tile__story-label">story words</span>
          <span class="novel-tile__outline">{novelStats.outlineWords.toLocaleString('en-US')} outline</span>
        </div>
        <span class="bento-tile__corner" aria-hidden="true"></span>
      </a>
```

- [ ] **Step 3: Replace `initializeNovelTile` with the rain-state script**

Replace the whole `initializeNovelTile` function (lines ~1739-1755) with:

```ts
  // Novel rain gauge — full rain for recent scene work, mist for outline-only,
  // still "the rain waits." past 14 quiet days. Reward accretion; never count absence.
  function initializeNovelRain() {
    const tile = document.getElementById('novel-tile');
    if (!tile) return;
    tile.classList.remove('is-raining', 'is-misting', 'is-waiting');

    const daysSince = (iso: string | undefined): number | null => {
      if (!iso) return null;
      const d = new Date(iso);
      if (isNaN(d.getTime())) return null;
      const today = new Date();
      const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
      const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      return Math.floor((todayUTC - dUTC) / 86_400_000);
    };

    const WINDOW = 14;
    const sceneDays = daysSince((tile as HTMLElement).dataset.sceneModified);
    const outlineDays = daysSince((tile as HTMLElement).dataset.outlineModified);

    if (sceneDays !== null && sceneDays <= WINDOW) {
      tile.classList.add('is-raining');
      (tile as HTMLElement).style.setProperty('--rain-strength', String(Math.max(0.2, 1 - sceneDays / WINDOW)));
    } else if (outlineDays !== null && outlineDays <= WINDOW) {
      tile.classList.add('is-misting');
      (tile as HTMLElement).style.setProperty('--rain-strength', String(Math.max(0.15, 0.5 * (1 - outlineDays / WINDOW))));
    } else {
      tile.classList.add('is-waiting');
    }
  }
```

Update both call sites (initial run and `astro:page-load` listener): `initializeNovelTile()` → `initializeNovelRain()`.

Also delete the now-dead `#novel-days-ago` hover CSS reference at line ~551 (`#novel-tile:hover .days-ago` selector — keep `#latest-tile:hover .days-ago`).

- [ ] **Step 4: Rain CSS**

Add to the page `<style>` (replacing any existing `.novel-tile__recent`-adjacent dead rules for the removed days-ago line):

```css
  .novel-tile {
    position: relative;
    overflow: hidden;
  }

  .novel-rain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 600ms ease;
  }

  .novel-tile.is-raining .novel-rain,
  .novel-tile.is-misting .novel-rain {
    opacity: var(--rain-strength, 0.5);
  }

  .novel-rain__drop {
    position: absolute;
    top: -30px;
    left: calc(6% + var(--i) * 12%);
    width: 1px;
    height: 22px;
    background: linear-gradient(to bottom, transparent, rgba(157, 184, 204, 0.8));
    animation: novel-rain-fall 1.5s linear infinite;
    animation-delay: calc(var(--i) * 0.21s);
  }

  .novel-tile.is-misting .novel-rain__drop {
    height: 9px;
    animation-duration: 2.6s;
  }

  @keyframes novel-rain-fall {
    to { transform: translateY(400px); }
  }

  .novel-tile__waits {
    display: none;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-style: italic;
    color: var(--color-text-muted);
    margin: auto 0;
  }

  .novel-tile.is-waiting .novel-tile__waits {
    display: block;
  }

  .novel-tile__words {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: relative;
    z-index: 1;
  }

  .novel-tile__story {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-gold);
    line-height: 1;
  }

  .novel-tile__story-label {
    font-family: var(--font-mono);
    font-size: var(--text-2xs);
    color: var(--color-gold-dim);
    text-transform: lowercase;
    letter-spacing: 0.06em;
  }

  .novel-tile__outline {
    font-family: var(--font-mono);
    font-size: var(--text-2xs);
    color: var(--color-text-muted);
    margin-top: var(--space-2xs);
  }

  @media (prefers-reduced-motion: reduce) {
    .novel-rain__drop {
      animation: none;
      top: auto;
      bottom: 20%;
      height: 6px;
      opacity: 0.5;
    }
  }
```

(`.novel-tile__recent` styles already exist — keep them. If the old novel tile CSS block includes footer/days-ago rules, delete those.)

- [ ] **Step 5: Verify all three states**

Run: `npm run dev`, open `/`. The live state depends on real content dates. Force each state in DevTools (or temporarily via `preview_eval`): set `data-scene-modified` to yesterday → full rain; clear it and set `data-outline-modified` to yesterday → sparse slow mist; clear both → "the rain waits." shows, no rain. Verify OS reduced-motion (or DevTools emulation) shows static drops. Check story words render gold and large, outline smaller grey.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: rain-gauge novel tile — story/outline words, recency-driven rain"
```

---

### Task 10: Homepage — Now title, Media collage, YouTube chip, quote dedup, email tile

**Files:**
- Modify: `src/pages/index.astro` (Now tile 201-214; media tile 372-390; yt tile 153-199; quote 483-486 + QUOTES ~1809-1816; totop 488-492 + script 1847-1854 + CSS ~1526-1566)

- [ ] **Step 1: Now tile shows the entry title**

Change the `title` prop at line ~206:

```astro
      <BentoTile
        href="/now"
        variant="highlight"
        label="Now"
        title={latestNow?.data.title ?? 'Current Focus'}
        description="Where am I at right now?"
      >
```

(The date span child stays as-is.)

- [ ] **Step 2: Media Log — 8 covers, drop the count**

In the frontmatter, change `recentMedia` slice from `.slice(0, 4)` to `.slice(0, 8)`. In the media tile markup, delete the `<span class="tile-count">{media.length} entries</span>` line. Find `.tile-poster-strip` in the page CSS and make it a 4×2 grid:

```css
  .tile-poster-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-xs);
  }
```

(Adjust any existing flex properties on `.tile-poster` that conflict — posters should fill their grid cell; keep their aspect-ratio rule if one exists.)

- [ ] **Step 3: YouTube kicker chip**

Inside the `#yt-tile` anchor, right after the avatar `<img>` (line ~163), add:

```astro
        <span class="yt-tile__chip" aria-hidden="true">YouTube</span>
```

CSS (page `<style>`):

```css
  .yt-tile__chip {
    position: absolute;
    top: var(--space-xs);
    left: var(--space-xs);
    z-index: 2;
    padding: 2px 8px 2px 6px;
    background: var(--color-gold);
    color: var(--color-black);
    font-family: var(--font-display);
    font-size: var(--text-2xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    clip-path: polygon(0 0, 100% 0, calc(100% - 5px) 100%, 0 100%);
  }
```

(The tile is `position: relative` already via `.image-tile`; verify with grep, add if missing. The existing live overlay has its own branding — the chip sits under it visually when live, which is fine since the overlay covers the tile.)

- [ ] **Step 4: Quote rotation excludes the tagline**

In the `QUOTES` array (~line 1809), remove `'Live without regret.'`. Change the server-rendered initial quote at line 485 to match the new first entry:

```astro
        <p class="quote-tile__text" id="quote-text">The bonds you forge are your true strength.</p>
```

- [ ] **Step 5: Replace TOP tile with the email tile**

Delete the `<button ... id="totop-tile">` block (lines 488-492), the `initializeToTop` function (~1847-1854), its two call sites, and the `.totop-tile*` CSS rules (~1526-1566). Insert in its place in the markup:

```astro
      <a href="mailto:russ081999@gmail.com" class="logo-tile logo-tile--mail p3r-animate" style="--stagger-delay: 200ms;">
        <svg class="logo-tile__img" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="2.5" y="5" width="19" height="14" rx="1.5"/>
          <path d="M3 6.5l9 6.5 9-6.5"/>
        </svg>
        <span class="logo-tile__label">Email</span>
        <p class="logo-tile__description">Say hi. No forms, no funnels.</p>
      </a>
```

CSS (next to the other `logo-tile--*` accents):

```css
  .logo-tile--mail {
    color: var(--color-gold-dim);
  }

  .logo-tile--mail:hover,
  .logo-tile--mail:focus-visible {
    color: var(--color-gold);
  }
```

(Owner note: confirm `russ081999@gmail.com` is the address you want public; swap for an alias if not.)

- [ ] **Step 6: Verify markup order = grid order**

Final tile order in the markup must be: title, yt, now, **journal, novel, stream**, media, latest, MAL, spotify, quote, email. At 1280px this fills: row 1 (4+1+1), rows 2-3 (4+1+1), rows 4-5 (2+2, then col5 = MAL/quote, col6 = spotify/email).

Run: `npm run dev` — verify the full grid renders with no gaps at 1280 and stacks sensibly at 375 (DevTools responsive mode). Verify quote tile never shows the tagline; email tile opens the mail client; Tab order sane.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: now-title tile, 8-cover media collage, yt chip, quote dedup, email tile"
```

---

### Task 11: Full verification pass

**Files:** none (verification only; fix regressions inline)

- [ ] **Step 1: Unit tests**

Run: `npm run test`
Expected: all suites pass (content, novel, journal, plus existing shelf/stream/liveStatus/transition).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: success. Confirm in output: `/journal/index.html`, redirect pages for `/notes` and `/showcase`, sitemap generated.

- [ ] **Step 3: Preview visual sweep**

Run: `npm run preview`. Check at 1280×800 and 375×812:
- `/` — grid layout per spec, rain gauge state renders, all tiles reachable by keyboard
- `/journal` — list, filters, `?types=` params, featured cards
- `/notes/avoidance` and a showcase detail — merged list, correct active item, back/forward navigation
- `/shelf`, `/now`, `/novel`, `/stream` — NavPill present with 4 items and correct active state; stream home button gone
- Reduced-motion emulation — no rain animation, static drops; list/tile entrance animations suppressed as before

- [ ] **Step 4: Commit any fixes**

```bash
git add -A src
git commit -m "fix: post-verification adjustments"
```

(Skip if nothing changed.)

---

### Task 12: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update stale sections**

CLAUDE.md is detailed and will be wrong after this work. Update:
- **Pages & Routes**: replace `/notes` + `/showcase` list-page entries with `/journal` (SplitViewLayout, type filter, featured Novel/Stream cards); note `/notes` & `/showcase` are 301s; detail routes unchanged.
- **Current Homepage Grid Pattern**: new rows 2-3 (Journal 4×2 + Novel 1×2 + Stream 1×2) and rows 4-5 (Media 2×2, Latest 2×2, MAL/quote, Spotify/email); TOP tile removed.
- **Component Inventory / Bento Tile Hierarchy**: Journal core tile description; rain-gauge Novel tile (story vs outline words, is-raining/is-misting/is-waiting states, never counts absence); YouTube chip.
- **Utility Modules table**: add `src/utils/journal.ts` (`mergeJournalEntries`, `getJournalItems`) and the new `novel.ts` exports (`computeNovelStats`, `countWords`, `NovelFile.mtime`).
- **NavPill**: 4 items (Home/Journal/Shelf/Now), rendered on /stream; `/notes`+`/showcase` paths highlight Journal.
- **Important Implementation Details**: note contentLoader now fetches by list-item href (mixed-collection lists supported); `stripMarkdown` also strips raw HTML.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for journal merge and homepage rebalance"
```
