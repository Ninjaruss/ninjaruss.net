# Substack Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move published writing to Substack — the site stops serving note prose, redirects every note URL to its Substack post, dissolves `/journal` into a standalone `/showcase`, and feeds the homepage from the Substack RSS feed.

**Architecture:** Note markdown stays in `src/content/notes/` as a content collection, but produces no pages — the collection becomes the slug→Substack redirect map, read by a single server-rendered rest route. Showcases keep `SplitViewLayout`, which must first be made null-safe so its filter chrome can be omitted. The homepage fetches the Substack feed at build time behind a failure guard.

**Tech Stack:** Astro 5, `@astrojs/vercel` (on-demand rendering already used by the Traces API), Zod via `astro:content`, vitest (node environment), vanilla CSS.

**Spec:** `docs/superpowers/specs/2026-09-03-substack-migration-design.md`

## Global Constraints

- Substack publication: `https://ninjaruss.substack.com`
- Substack feed: `https://ninjaruss.substack.com/feed`
- Substack archive (redirect fallback): `https://ninjaruss.substack.com/archive`
- **No new npm dependencies.** The feed parser is hand-rolled on purpose.
- **Vitest runs in the `node` environment with no jsdom** (`vitest.config.ts`). DOM-touching code CANNOT be unit-tested in this repo. Write unit tests for pure functions only; verify DOM behaviour in the browser pane. Do not add jsdom — that is out of scope.
- A Substack outage or offline build must **degrade to a showcase-only tile, never fail the build**.
- Never run dev servers with Bash — use the Browser pane's `preview_start`.
- Dates are always absolute, never "time since" (no-shame invariant).
- `aria-current` is `"page"` or absent, never `"false"`.
- Existing tests must stay green: `npm test` and `npm run build`.

## Decisions Already Made (do not relitigate)

- No notes listing page on the site. Substack's `/archive` serves that role.
- No `canonical` prop on `BaseLayout` — with no note pages, nothing to canonicalise.
- Note redirects are server-rendered (`prerender = false`), not config entries. A static `Astro.redirect` degrades to a meta-refresh document, which feed readers ignore and search engines discount.
- `RelatedContent` is **left unchanged**. It can still surface notes, whose links now redirect to Substack — which is correct behaviour. In practice `collections: ["japan"]` is on 6 notes and no shelf/showcase entry, so no cross-collection edge exists today anyway.

## File Structure

**Created**

| File | Responsibility |
|---|---|
| `src/utils/substack.ts` | Substack URLs, `parseSubstackFeed` (pure), `fetchSubstackPosts` (guarded I/O) |
| `src/utils/noteRedirect.ts` | `resolveNoteRedirect` — slug → Substack URL, pure |
| `src/tests/substack.test.ts` | Feed parser + fetch guard |
| `src/tests/noteRedirect.test.ts` | Redirect resolution |
| `src/pages/showcase/index.astro` | The showcase surface |

**Modified**

| File | Change |
|---|---|
| `src/content/config.ts` | `notes` schema gains `substackUrl` |
| `src/utils/splitView/types.ts` | Four filter elements become nullable |
| `src/utils/splitView/index.ts` | `queryElements` requires only `contentArea`; guarded restore |
| `src/utils/splitView/filterEngine.ts` | `applyFilters` accepts a null `noResults` |
| `src/utils/splitView/eventBindings.ts` | `bindFilterEvents` returns early without filter chrome |
| `src/layouts/SplitViewLayout.astro` | `showSearch` prop; retire `showDraw`/`placeholderStats`/`rssHref` |
| `src/pages/showcase/[...slug].astro` | List panel reads showcase, not the merged journal |
| `src/pages/notes/[...slug].astro` | Becomes the SSR redirect route |
| `src/pages/index.astro` | Journal + Latest tiles read the Substack feed |
| `src/components/NavPill.astro` | Journal item → Showcase |
| `src/layouts/BaseLayout.astro` | Feed autodiscovery → Substack |
| `src/content/profile/about.md` | Substack link; `/showcase` href |
| `src/tests/profile.test.ts` | Updated href assertion |
| `astro.config.mjs` | `/journal` → `/showcase` |
| `vercel.json` | `/rss.xml` → Substack feed (301) |
| `CLAUDE.md` | Documentation |

**Deleted**

`src/pages/journal/index.astro`, `src/pages/notes/index.astro`, `src/pages/rss.xml.ts`, `src/utils/journal.ts`, `src/utils/journalMerge.ts`, `src/tests/journal.test.ts`, `src/utils/splitView/drawCard.ts`, `src/tests/drawCard.test.ts`

---

### Task 1: Substack constants and note redirect resolution

**Files:**
- Create: `src/utils/substack.ts`
- Create: `src/utils/noteRedirect.ts`
- Create: `src/tests/noteRedirect.test.ts`
- Modify: `src/content/config.ts` (notes collection, ~line 27)

**Interfaces:**
- Consumes: nothing
- Produces:
  - `SUBSTACK_URL`, `SUBSTACK_FEED_URL`, `SUBSTACK_ARCHIVE_URL` — `string` constants from `src/utils/substack.ts`
  - `NoteRedirectEntry = { slug: string; substackUrl?: string }`
  - `resolveNoteRedirect(slug: string, entries: NoteRedirectEntry[]): string`
  - `notes` frontmatter field `substackUrl?: string`

- [ ] **Step 1: Create the constants module**

Create `src/utils/substack.ts`:

```ts
/** The publication writing now lives on. The site links out; it does not mirror. */
export const SUBSTACK_URL = 'https://ninjaruss.substack.com';
export const SUBSTACK_FEED_URL = `${SUBSTACK_URL}/feed`;
export const SUBSTACK_ARCHIVE_URL = `${SUBSTACK_URL}/archive`;
```

- [ ] **Step 2: Write the failing test**

Create `src/tests/noteRedirect.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveNoteRedirect } from '../utils/noteRedirect';
import { SUBSTACK_ARCHIVE_URL } from '../utils/substack';

const entries = [
  { slug: 'addiction', substackUrl: 'https://ninjaruss.substack.com/p/addiction' },
  { slug: 'gratitude' },
];

describe('resolveNoteRedirect', () => {
  it('sends a backfilled note to its Substack post', () => {
    expect(resolveNoteRedirect('addiction', entries)).toBe(
      'https://ninjaruss.substack.com/p/addiction'
    );
  });

  it('falls back to the archive for a note with no substackUrl yet', () => {
    expect(resolveNoteRedirect('gratitude', entries)).toBe(SUBSTACK_ARCHIVE_URL);
  });

  it('falls back to the archive for an unknown slug', () => {
    expect(resolveNoteRedirect('never-existed', entries)).toBe(SUBSTACK_ARCHIVE_URL);
  });

  it('falls back to the archive for the bare /notes path (empty slug)', () => {
    expect(resolveNoteRedirect('', entries)).toBe(SUBSTACK_ARCHIVE_URL);
  });

  it('ignores a trailing slash on the slug', () => {
    expect(resolveNoteRedirect('addiction/', entries)).toBe(
      'https://ninjaruss.substack.com/p/addiction'
    );
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/tests/noteRedirect.test.ts`
Expected: FAIL — cannot resolve `../utils/noteRedirect`.

- [ ] **Step 4: Write the implementation**

Create `src/utils/noteRedirect.ts`:

```ts
import { SUBSTACK_ARCHIVE_URL } from './substack';

export interface NoteRedirectEntry {
  slug: string;
  substackUrl?: string;
}

/**
 * Where a legacy /notes/<slug> URL should send a visitor.
 *
 * The notes collection no longer renders pages — it is the redirect map. A note
 * that has not been backfilled to Substack yet goes to the archive: imprecise,
 * but a correct destination, and better than a 404 for an inbound link.
 */
export function resolveNoteRedirect(slug: string, entries: NoteRedirectEntry[]): string {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  if (!clean) return SUBSTACK_ARCHIVE_URL;
  return entries.find((e) => e.slug === clean)?.substackUrl ?? SUBSTACK_ARCHIVE_URL;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/tests/noteRedirect.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 6: Add the schema field**

In `src/content/config.ts`, replace the `notes` collection definition:

```ts
// Notes collection — philosophical fragments, beliefs in progress.
// No longer renders pages: writing is published on Substack, and this
// collection is the slug -> post redirect map (src/utils/noteRedirect.ts).
// The markdown stays in the repo as the working copy, public via GitHub.
const notes = defineCollection({
  type: 'content',
  schema: sharedSchema.extend({
    // Optional only because a half-written entry must not fail the build.
    // Backfill target: every note carries one.
    substackUrl: z.string().url().optional(),
  }),
});
```

- [ ] **Step 7: Verify the schema change builds**

Run: `npm run build`
Expected: succeeds. (Note pages still render at this point — they are replaced in Task 6.)

- [ ] **Step 8: Commit**

```bash
git add src/utils/substack.ts src/utils/noteRedirect.ts src/tests/noteRedirect.test.ts src/content/config.ts
git commit -m "feat: add substackUrl to notes and resolve note redirects"
```

---

### Task 2: Substack feed parser

**Files:**
- Modify: `src/utils/substack.ts`
- Create: `src/tests/substack.test.ts`

**Interfaces:**
- Consumes: `src/utils/substack.ts` constants from Task 1
- Produces:
  - `SubstackPost = { title: string; link: string; pubDate: string; description: string }`
  - `parseSubstackFeed(xml: string): SubstackPost[]`

- [ ] **Step 1: Write the failing test**

Create `src/tests/substack.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseSubstackFeed } from '../utils/substack';

const FEED = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <title>ninjaruss</title>
  <item>
    <title><![CDATA[Why one must fall]]></title>
    <link>https://ninjaruss.substack.com/p/why-one-must-fall</link>
    <pubDate>Mon, 01 Sep 2026 12:00:00 GMT</pubDate>
    <description><![CDATA[<p>Potential man must die.</p>]]></description>
  </item>
  <item>
    <title>Gratitude &amp; its opposite</title>
    <link>https://ninjaruss.substack.com/p/gratitude</link>
    <pubDate>Mon, 25 Aug 2026 12:00:00 GMT</pubDate>
    <description>Plain text body</description>
  </item>
</channel></rss>`;

describe('parseSubstackFeed', () => {
  it('extracts each item in feed order', () => {
    const posts = parseSubstackFeed(FEED);
    expect(posts).toHaveLength(2);
    expect(posts[0].title).toBe('Why one must fall');
    expect(posts[0].link).toBe('https://ninjaruss.substack.com/p/why-one-must-fall');
    expect(posts[0].pubDate).toBe('Mon, 01 Sep 2026 12:00:00 GMT');
  });

  it('unwraps CDATA and decodes entities in titles', () => {
    expect(parseSubstackFeed(FEED)[1].title).toBe('Gratitude & its opposite');
  });

  it('strips markup from the description', () => {
    expect(parseSubstackFeed(FEED)[0].description).toBe('Potential man must die.');
  });

  it('returns [] for a feed with no items', () => {
    expect(parseSubstackFeed('<rss><channel></channel></rss>')).toEqual([]);
  });

  it('returns [] for malformed input rather than throwing', () => {
    expect(parseSubstackFeed('not xml at all <<<')).toEqual([]);
    expect(parseSubstackFeed('')).toEqual([]);
  });

  it('skips an item with no link', () => {
    const xml = '<rss><channel><item><title>Orphan</title></item></channel></rss>';
    expect(parseSubstackFeed(xml)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/substack.test.ts`
Expected: FAIL — `parseSubstackFeed` is not exported.

- [ ] **Step 3: Write the implementation**

Append to `src/utils/substack.ts`:

```ts
export interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

const ITEM_RE = /<item\b[^>]*>([\s\S]*?)<\/item>/g;

/** Undo the five XML entities a feed generator emits. Anything exotic is left alone. */
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Read one child element out of an <item> block, unwrapping CDATA. */
function tagText(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`));
  if (!m) return '';
  const raw = m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1');
  return decodeEntities(raw).trim();
}

/**
 * Minimal RSS reader for the Substack feed.
 *
 * Hand-rolled rather than pulling an XML dependency: the shape of a Substack
 * item is narrow and stable, and this runs at build time on one known feed.
 * It must never throw — a homepage tile is not worth failing a build over.
 */
export function parseSubstackFeed(xml: string): SubstackPost[] {
  try {
    const posts: SubstackPost[] = [];
    for (const match of xml.matchAll(ITEM_RE)) {
      const block = match[1];
      const link = tagText(block, 'link');
      if (!link) continue; // an item we cannot link to is not useful
      posts.push({
        title: tagText(block, 'title'),
        link,
        pubDate: tagText(block, 'pubDate'),
        description: tagText(block, 'description').replace(/<[^>]+>/g, '').trim(),
      });
    }
    return posts;
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/substack.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/substack.ts src/tests/substack.test.ts
git commit -m "feat: parse the Substack RSS feed"
```

---

### Task 3: Guarded feed fetch

**Files:**
- Modify: `src/utils/substack.ts`
- Modify: `src/tests/substack.test.ts`

**Interfaces:**
- Consumes: `parseSubstackFeed`, `SUBSTACK_FEED_URL`
- Produces: `fetchSubstackPosts(limit?: number): Promise<SubstackPost[]>` — resolves to `[]` on any failure, never rejects

- [ ] **Step 1: Write the failing test**

Append to `src/tests/substack.test.ts`:

```ts
import { afterEach, vi } from 'vitest';
import { fetchSubstackPosts } from '../utils/substack';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchSubstackPosts', () => {
  it('returns parsed posts capped at the limit', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(FEED, { status: 200 })));
    const posts = await fetchSubstackPosts(1);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Why one must fall');
  });

  it('returns [] when the network throws', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    await expect(fetchSubstackPosts()).resolves.toEqual([]);
  });

  it('returns [] on a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 503 })));
    await expect(fetchSubstackPosts()).resolves.toEqual([]);
  });
});
```

Move the `import { describe, it, expect }` line at the top of the file to `import { describe, it, expect, afterEach, vi } from 'vitest';` and delete the duplicate import added above.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tests/substack.test.ts`
Expected: FAIL — `fetchSubstackPosts` is not exported.

- [ ] **Step 3: Write the implementation**

Append to `src/utils/substack.ts`:

```ts
/**
 * Build-time read of the Substack feed.
 *
 * Every failure path returns [] on purpose: the homepage tiles guard on an
 * empty result and fall back to showcase-only. A Substack outage, a network
 * blip, or an offline build must not fail `npm run build`.
 */
export async function fetchSubstackPosts(limit = 5): Promise<SubstackPost[]> {
  try {
    const res = await fetch(SUBSTACK_FEED_URL);
    if (!res.ok) return [];
    return parseSubstackFeed(await res.text()).slice(0, limit);
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/tests/substack.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/substack.ts src/tests/substack.test.ts
git commit -m "feat: fetch the Substack feed at build time, degrading to empty"
```

---

### Task 4: Make the split-view filter chrome optional

This is the highest-risk change in the plan. `queryElements` currently treats the search input, type list, clear button, and no-results panel as **required** — if any is absent it logs an error, returns `null`, and `initSplitView` returns early. That kills detail-panel content loading, list events, and the emblem card, not just filtering. Task 5 removes that markup from `/showcase`, so this must land first, on its own, with no behaviour change.

**Files:**
- Modify: `src/utils/splitView/types.ts:2-9`
- Modify: `src/utils/splitView/index.ts:17-44` (`queryElements`), `:74-80` (restore block)
- Modify: `src/utils/splitView/filterEngine.ts:6-9`, `:37`
- Modify: `src/utils/splitView/eventBindings.ts:15`

**Interfaces:**
- Consumes: nothing new
- Produces: `SplitViewElements` with `searchInput`, `typesList`, `clearAllButton`, `noResults` typed `| null`; `applyFilters(listItems: HTMLElement[], noResults: HTMLElement | null)`

- [ ] **Step 1: Widen the element types**

In `src/utils/splitView/types.ts`, replace the first five fields of `SplitViewElements`:

```ts
export interface SplitViewElements {
  splitView: HTMLElement;
  /** Filter chrome is absent on bare surfaces (e.g. /showcase) — all nullable. */
  searchInput: HTMLInputElement | null;
  /** Segmented type control (.split-view__types); hidden when <2 types */
  typesList: HTMLElement | null;
  clearAllButton: HTMLElement | null;
  noResults: HTMLElement | null;
  contentArea: HTMLElement;
```

- [ ] **Step 2: Require only the content area**

In `src/utils/splitView/index.ts`, replace the guard inside `queryElements`:

```ts
  // Only the content area is structural. The filter chrome is optional so a
  // bare surface (no search, no types) still gets selection + content loading.
  if (!contentArea) {
    console.error('Split view: missing content area');
    return null;
  }
```

- [ ] **Step 3: Guard the filter restore block**

In `src/utils/splitView/index.ts`, replace the "Restore filter state from URL" block:

```ts
  // Restore filter state from URL
  const { search: initialSearch, types: initialTypes } = getFiltersFromURL();
  if (elements.searchInput) elements.searchInput.value = initialSearch;
  if (elements.typesList) populateTypes(elements.typesList, elements.listItems, initialTypes);
  // Reflect restored (non-search) filters on the clear button
  if (elements.clearAllButton) elements.clearAllButton.hidden = initialTypes.size === 0;
  applyFilters(elements.listItems, elements.noResults);
```

- [ ] **Step 4: Let `applyFilters` accept a null panel**

In `src/utils/splitView/filterEngine.ts`, change the signature and the assignment:

```ts
export function applyFilters(
  listItems: HTMLElement[],
  noResults: HTMLElement | null
): void {
```

and

```ts
  if (noResults) noResults.hidden = visibleCount > 0;
```

- [ ] **Step 5: Bail out of filter bindings when the chrome is absent**

In `src/utils/splitView/eventBindings.ts`, immediately after the destructure on line 15:

```ts
  const { searchInput, typesList, clearAllButton, listItems, noResults } = elements;
  // A bare surface renders no filter chrome — nothing to bind. Selection and
  // content loading are bound separately in bindListEvents and are unaffected.
  if (!searchInput || !typesList || !clearAllButton) return;
```

- [ ] **Step 6: Typecheck and test**

Run: `npm run build && npm test`
Expected: both succeed. TypeScript will flag any remaining unguarded dereference — fix each with a null check, do not cast with `!`.

- [ ] **Step 7: Verify no behaviour changed, in the browser**

Start the dev server with the Browser pane's `preview_start` (never Bash). Then on `/journal`:
- type in the search box — the list filters and the count updates
- click a type pill — the list filters and the URL gains `?types=`
- click an entry — the detail panel loads its content
- confirm `read_console_messages` shows no errors

This task must be a pure refactor. If any of the above behaves differently, fix it before committing.

- [ ] **Step 8: Commit**

```bash
git add src/utils/splitView/types.ts src/utils/splitView/index.ts src/utils/splitView/filterEngine.ts src/utils/splitView/eventBindings.ts
git commit -m "refactor: make split-view filter chrome optional"
```

---

### Task 5: The showcase surface

**Files:**
- Modify: `src/layouts/SplitViewLayout.astro:17-23` (props), `:62-88` (filter block)
- Create: `src/pages/showcase/index.astro`
- Modify: `src/pages/showcase/[...slug].astro`
- Delete: nothing yet

**Interfaces:**
- Consumes: the null-safe `SplitViewElements` from Task 4
- Produces: `SplitViewLayout` prop `showSearch?: boolean` (default `true`)

- [ ] **Step 1: Add the `showSearch` prop**

In `src/layouts/SplitViewLayout.astro`, add to the props interface:

```ts
  /** Render the search + filter chrome. False for bare surfaces like /showcase. */
  showSearch?: boolean;
```

and add it to the destructure with a default:

```ts
const { title, description, section, kicker, initialSlug, initialEmblem, pageTitle, ogImage, ogType, placeholderStats, showDraw, rssHref, showSearch = true } = Astro.props;
```

- [ ] **Step 2: Gate the filter block**

Wrap the entire `<div class="split-view__filter">…</div>` element in the template:

```astro
      {showSearch && (
        <div class="split-view__filter">
          <div class="split-view__filter-row">
            <div class="split-view__search-wrapper">…</div>
            <button class="split-view__clear-all-filters" …></button>
          </div>
          <div class="split-view__types" role="group" aria-label="Filter by type"></div>
        </div>
      )}
```

The three children — `.split-view__filter-row` with its search wrapper and
clear-all button, and the empty `.split-view__types` container — move inside the
conditional **byte-for-byte as they are today**. The `…` above marks existing
markup to preserve, not markup to write. (The `{showDraw && …}` mobile DRAW
button inside the filter row also moves with them; Task 8 deletes it.)

Leave `.split-view__no-results` outside the conditional and unchanged — it stays in the DOM, permanently hidden on a bare surface, and `applyFilters` handles it either way.

- [ ] **Step 3: Create the showcase index**

Create `src/pages/showcase/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import SplitViewLayout from '../../layouts/SplitViewLayout.astro';
import ListItem from '../../components/ListItem.astro';
import { stripMarkdown, hasMinimalContent } from '../../utils/content';
import { formatDate } from '../../utils/dates';

const entries = (await getCollection('showcase', ({ data }) => !data.draft)).sort(
  (a, b) =>
    new Date(b.data.updatedAt || b.data.publishedAt || 0).getTime() -
    new Date(a.data.updatedAt || a.data.publishedAt || 0).getTime()
);
---

<SplitViewLayout
  title="Showcase"
  description="Projects framed as inquiries — things I built because I wanted them to exist."
  section="showcase"
  ogImage="/social-default.svg"
  showSearch={false}
>
  <Fragment slot="list">
    {entries.length > 0 ? (
      entries.map((entry) => (
        <ListItem
          href={`/showcase/${entry.slug}`}
          slug={entry.slug}
          title={entry.data.title}
          subtitle={stripMarkdown(entry.body).split('\n').find(l => l.trim().length > 20)?.trim().slice(0, 90)}
          meta={entry.data.publishedAt ? formatDate(entry.data.publishedAt) : undefined}
          emblem={entry.data.emblem}
          contentType="showcase"
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
  .empty-state {
    color: var(--color-muted);
    font-style: italic;
    text-align: center;
    padding: var(--space-xl);
  }
</style>
```

- [ ] **Step 4: Point the detail route's list panel at showcase only**

In `src/pages/showcase/[...slug].astro`, remove the `getJournalItems` import and its call, and replace them with a showcase query sorted the same way as the index. Replace the list `Fragment` with:

```astro
  <Fragment slot="list">
    {showcaseItems.map((item) => (
      <ListItem
        href={`/showcase/${item.slug}`}
        slug={item.slug}
        title={item.data.title}
        emblem={item.data.emblem}
        contentType="showcase"
        searchableContent={stripMarkdown(item.body).slice(0, 500)}
        hasMinimalContent={hasMinimalContent(item.body)}
      />
    ))}
  </Fragment>
```

where the frontmatter gains:

```ts
const showcaseItems = (await getCollection('showcase', ({ data }) => !data.draft)).sort(
  (a, b) =>
    new Date(b.data.updatedAt || b.data.publishedAt || 0).getTime() -
    new Date(a.data.updatedAt || a.data.publishedAt || 0).getTime()
);
```

Also change the layout's `title` prop from `"Journal"` to `"Showcase"` and its `section` from `"journal"` to `"showcase"`.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: succeeds. `/showcase` and `/showcase/<slug>` are emitted.

- [ ] **Step 6: Verify in the browser — this is the risk checkpoint**

With the dev server running via `preview_start`:
- `/showcase` renders the six entries with **no search box and no type pills**
- **click an entry — the detail panel loads its content.** This is the specific regression Task 4 guards against; if the panel stays empty, `initSplitView` is bailing early.
- `read_console_messages` shows no errors
- the emblem card still flips on selection
- `/showcase/this-website` loads directly and shows the showcase-only list on the left

- [ ] **Step 7: Commit**

```bash
git add src/layouts/SplitViewLayout.astro src/pages/showcase/
git commit -m "feat: give showcase its own bare surface"
```

---

### Task 6: Redirect note URLs to Substack

**Files:**
- Modify: `src/pages/notes/[...slug].astro` (replace entirely)
- Delete: `src/pages/notes/index.astro`

**Interfaces:**
- Consumes: `resolveNoteRedirect`, `NoteRedirectEntry` from Task 1
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Replace the note detail route**

Replace the entire contents of `src/pages/notes/[...slug].astro` with:

```astro
---
/**
 * Legacy note URLs.
 *
 * Notes are published on Substack and no longer rendered here; the collection
 * is the redirect map. Server-rendered on purpose: a static Astro.redirect
 * emits a meta-refresh document, which feed readers ignore and search engines
 * discount — that would defeat the point of keeping these URLs alive.
 *
 * The rest parameter also matches bare /notes, which takes the archive fallback.
 */
export const prerender = false;

import { getCollection } from 'astro:content';
import { resolveNoteRedirect } from '../../utils/noteRedirect';

const notes = await getCollection('notes');
const target = resolveNoteRedirect(
  Astro.params.slug ?? '',
  notes.map((n) => ({ slug: n.slug, substackUrl: n.data.substackUrl }))
);

return Astro.redirect(target, 301);
---
```

- [ ] **Step 2: Delete the notes index stub**

```bash
git rm src/pages/notes/index.astro
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: succeeds. No `/notes/*` HTML pages in `dist/`; the route becomes a function.

- [ ] **Step 4: Add a temporary substackUrl to verify the happy path**

In `src/content/notes/addiction.md`, add to the frontmatter:

```yaml
substackUrl: "https://ninjaruss.substack.com/p/addiction"
```

Keep this only if the post actually exists at that URL; otherwise remove it after Step 5 and let the archive fallback stand.

- [ ] **Step 5: Verify real 301s**

With the dev server running via `preview_start`, from Bash:

```bash
curl -sI http://localhost:4321/notes/addiction | head -5
```

Expected: `HTTP/1.1 301` with `location: https://ninjaruss.substack.com/p/addiction`.

```bash
curl -sI http://localhost:4321/notes/gratitude | head -5
curl -sI http://localhost:4321/notes | head -5
```

Expected: both `301` to `https://ninjaruss.substack.com/archive`.

A `200` response carrying HTML means the route is still prerendering — check `export const prerender = false` is present and at the top of the frontmatter.

- [ ] **Step 6: Commit**

```bash
git add src/pages/notes/ src/content/notes/addiction.md
git commit -m "feat: redirect note URLs to Substack"
```

---

### Task 7: Dissolve the journal and retire the feed

**Files:**
- Delete: `src/pages/journal/index.astro`, `src/pages/rss.xml.ts`, `src/utils/journal.ts`, `src/utils/journalMerge.ts`, `src/tests/journal.test.ts`
- Modify: `astro.config.mjs`
- Modify: `vercel.json`
- Modify: `src/layouts/BaseLayout.astro:37`

**Interfaces:**
- Consumes: nothing
- Produces: nothing

- [ ] **Step 1: Confirm nothing still imports the merge**

Run: `grep -rn "getJournalItems\|journalMerge" src/`
Expected: only the files about to be deleted. If `src/pages/showcase/[...slug].astro` still appears, Task 5 Step 4 was not completed — go finish it.

- [ ] **Step 2: Delete the dissolved surfaces**

```bash
git rm src/pages/journal/index.astro src/pages/rss.xml.ts src/utils/journal.ts src/utils/journalMerge.ts src/tests/journal.test.ts
```

- [ ] **Step 3: Redirect `/journal` internally**

In `astro.config.mjs`, add to the `redirects` object:

```js
    /* The journal merged notes + showcases. Notes moved to Substack, so the
       merge had nothing left to merge — showcase is what survived. */
    '/journal': '/showcase',
```

- [ ] **Step 4: Redirect the feed to Substack**

In `vercel.json`, add a top-level `redirects` array before `"headers"`:

```json
  "redirects": [
    {
      "source": "/rss.xml",
      "destination": "https://ninjaruss.substack.com/feed",
      "permanent": true
    }
  ],
```

This lives here rather than in `astro.config.mjs` because the destination is external and feed readers need a true 301, not a meta-refresh.

- [ ] **Step 5: Retarget feed autodiscovery**

In `src/layouts/BaseLayout.astro`, replace line 37:

```astro
    <link rel="alternate" type="application/rss+xml" title="ninjaruss — Substack" href="https://ninjaruss.substack.com/feed" />
```

- [ ] **Step 6: Build and test**

Run: `npm run build && npm test`
Expected: both succeed. `dist/` contains no `rss.xml` and no `journal/`.

- [ ] **Step 7: Verify**

With the dev server running, confirm `/journal` lands on `/showcase`. Note that `vercel.json` redirects are **not** applied by `astro dev` — `/rss.xml` must be verified against a Vercel preview deployment, not localhost. Record that as a post-deploy check rather than claiming it works.

- [ ] **Step 8: Commit**

```bash
git add -A astro.config.mjs vercel.json src/layouts/BaseLayout.astro src/pages src/utils src/tests
git commit -m "feat: dissolve /journal into /showcase and retire the site feed"
```

---

### Task 8: Retire journal-only layout affordances

The draw deck, placeholder stats, and the RSS icon existed only for `/journal`, which no longer exists. Leaving them is dead code in a 1,263-line layout.

**Files:**
- Modify: `src/layouts/SplitViewLayout.astro` (props, deck markup, mobile DRAW button, stats block, RSS anchor, and their CSS)
- Modify: `src/utils/splitView/index.ts` (draw blocks and the `hasDrawDeck` branch)
- Delete: `src/utils/splitView/drawCard.ts`, `src/tests/drawCard.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `SplitViewLayout` no longer accepts `showDraw`, `placeholderStats`, or `rssHref`

- [ ] **Step 1: Confirm no remaining consumers**

Run: `grep -rn "showDraw\|placeholderStats\|rssHref\|pickDrawCandidate" src/`
Expected: only `SplitViewLayout.astro`, `splitView/index.ts`, `drawCard.ts`, and `drawCard.test.ts`. Any page hit means that page still needs converting — stop and resolve it first.

- [ ] **Step 2: Remove the props**

Delete `placeholderStats`, `showDraw`, and `rssHref` from the props interface and the destructure in `src/layouts/SplitViewLayout.astro`. Remove `'has-draw': showDraw` from the root `class:list`.

- [ ] **Step 3: Remove the markup**

Delete from the template: the `{rssHref && (…)}` anchor block, the `{showDraw && (…)}` mobile DRAW button, the `{placeholderStats && …}` stats `<dl>` and its `:` fallback branch, and the `{showDraw && (…)}` draw deck in the placeholder. Delete the now-unused `.split-view__rss`, `.split-view__draw-*`, `.split-view__placeholder-stats`, and `.has-draw` CSS rules.

- [ ] **Step 4: Remove the client-side draw logic**

In `src/utils/splitView/index.ts`: delete the `import { pickDrawCandidate } from './drawCard';` line, the `hasDrawDeck` constant, both the `if (drawDeck)` and `if (drawMobile)` blocks, the `drawPool` helper, and the `drawDeck`/`drawMobile` queries.

Simplify the auto-open branch — with no deck, the `hasDrawDeck` exception is gone:

```ts
  // Start floating if initial content is loaded
  if (initialSlug) {
    idleManager.startFloating();
  } else {
```

Keep the rest of that block, and its comment, intact — but remove the two sentences describing the draw-deck exception, since the behaviour they document no longer exists.

- [ ] **Step 5: Delete the module and its test**

```bash
git rm src/utils/splitView/drawCard.ts src/tests/drawCard.test.ts
```

- [ ] **Step 6: Build and test**

Run: `npm run build && npm test`
Expected: both succeed.

- [ ] **Step 7: Verify in the browser**

On `/showcase`: the page loads, no console errors, and — because there is no longer a draw deck suppressing it — **the newest entry auto-opens on a desktop-width viewport**. Confirm that, since Step 4 changed the branch that controls it.

- [ ] **Step 8: Commit**

```bash
git add -A src/layouts/SplitViewLayout.astro src/utils/splitView src/tests
git commit -m "refactor: retire journal-only split-view affordances"
```

---

### Task 9: Feed the homepage from Substack

**Files:**
- Modify: `src/pages/index.astro` — frontmatter ~lines 14, 44-72, 118-125; the journal tile template ~lines 250-285

**Interfaces:**
- Consumes: `fetchSubstackPosts`, `SubstackPost` from Task 3
- Produces: nothing

- [ ] **Step 1: Fetch the feed and drop the notes query**

In the frontmatter of `src/pages/index.astro`:

Remove the `notes` collection query (`const notes = await getCollection('notes', …)`).
Then run `grep -n "\bnotes\b" src/pages/index.astro` and confirm every remaining
hit is dealt with by Steps 2-4 — a missed reference is a build error, not a silent
fallback. Add:

```ts
import { fetchSubstackPosts } from '../utils/substack';

// Writing lives on Substack. Fetched at build time; [] on any failure, which
// collapses both tiles to showcase-only rather than failing the build.
const substackPosts = await fetchSubstackPosts(5);
```

- [ ] **Step 2: Rebuild the tile row data**

Replace the `recentJournal` block with:

```ts
type WritingRow = { href: string; title: string; date: string };
const recentWriting: WritingRow[] = substackPosts.slice(0, 5).map((p) => {
  const ms = Date.parse(p.pubDate);
  return {
    href: p.link,
    title: p.title,
    date: Number.isNaN(ms) ? '' : shortDate(ms),
  };
});
```

- [ ] **Step 3: Rebuild the Latest tile pool**

Delete the `byDateDesc` helper as well — it is typed as `(typeof notes)[number]`
and will not compile once the `notes` query is gone. Replace the `byDateDesc` /
`latestNotes` / `latestShowcase` / `latestPool` block **and** the `latestEntries`
mapping with:

```ts
const latestShowcase = [...showcase].sort(
  (a, b) => effectiveDate(b) - effectiveDate(a)
)[0];

// Interleave writing/showcase/writing so the client-side cycle alternates.
const latestEntries = [
  substackPosts[0] && {
    title: substackPosts[0].title,
    href: substackPosts[0].link,
    date: Number.isNaN(Date.parse(substackPosts[0].pubDate))
      ? ''
      : formatDate(new Date(substackPosts[0].pubDate)),
    emblem: '/images/emblems/scroll.svg',
    excerpt: substackPosts[0].description.slice(0, 140),
  },
  latestShowcase && {
    title: latestShowcase.data.title,
    href: `/showcase/${latestShowcase.slug}`,
    date: formatDate(latestShowcase.data.updatedAt ?? latestShowcase.data.publishedAt!),
    emblem: latestShowcase.data.emblem ?? DEFAULT_EMBLEM,
    excerpt: stripMarkdown(latestShowcase.body ?? '').slice(0, 140),
  },
  substackPosts[1] && {
    title: substackPosts[1].title,
    href: substackPosts[1].link,
    date: Number.isNaN(Date.parse(substackPosts[1].pubDate))
      ? ''
      : formatDate(new Date(substackPosts[1].pubDate)),
    emblem: '/images/emblems/scroll.svg',
    excerpt: substackPosts[1].description.slice(0, 140),
  },
].filter(Boolean);
```

`/images/emblems/scroll.svg` is the existing default for inner-work reflection — Substack items carry no per-entry emblem.

- [ ] **Step 4: Update the tile markup**

In the journal tile block:
- root `data-tile-href="/journal"` → `data-tile-href="/showcase"`
- the notes head `href="/journal?types=note"` → `href="https://ninjaruss.substack.com"`
- kicker text `Journal` → `Writing`; the `h3` stays `Notes`
- the rows loop `recentJournal.map(...)` → `recentWriting.map(...)`, guarded by `recentWriting.length > 0`
- the showcase tab `href="/journal?types=showcase"` → `href="/showcase"`

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: succeeds, with real Substack rows if the feed is reachable.

- [ ] **Step 6: Verify the offline degradation**

Temporarily change `SUBSTACK_FEED_URL` in `src/utils/substack.ts` to an unreachable host, run `npm run build`, and confirm it **still succeeds** with the writing column absent and the showcase column intact. Revert the URL afterwards. This is the guard the whole design leans on — verify it, don't assume it.

- [ ] **Step 7: Verify in the browser**

Homepage: the journal tile shows Substack post titles with dates linking off-site; the showcase column is unchanged; the Latest tile cycles through writing/showcase/writing; no console errors.

- [ ] **Step 8: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: read the homepage writing tiles from the Substack feed"
```

---

### Task 10: Navigation and profile links

**Files:**
- Modify: `src/components/NavPill.astro:13`
- Modify: `src/content/profile/about.md`
- Modify: `src/tests/profile.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: nothing

- [ ] **Step 1: Update the nav item**

In `src/components/NavPill.astro`, replace line 13:

```ts
  { href: '/showcase', label: 'Showcase', match: ['/showcase'] },
```

Still six items, so the ≤768px 4+3 wrap is unchanged. No external Substack nav item — an outbound link inside site-section navigation reads as a mistake.

- [ ] **Step 2: Update the profile**

In `src/content/profile/about.md` frontmatter:

- in `makes`, change the "Things I build" `href` from `/journal?types=showcase` to `/showcase`
- in `links`, replace the `Read the journal` entry with:

```yaml
  - label: "Read on Substack"
    href: "https://ninjaruss.substack.com"
    primary: true
```

- [ ] **Step 3: Update the failing assertion**

Run: `npm test`
Expected: `src/tests/profile.test.ts` fails on the `/journal?types=showcase` href.

Update that assertion to `/showcase`.

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Verify in the browser**

`/about` shows "Read on Substack" as a primary link and "Things I build" points at `/showcase`. The nav bar highlights Showcase on `/showcase` and on a showcase detail page. Check the ≤768px layout with `resize_window` — the nav must still wrap 4+3 without overlapping content.

- [ ] **Step 6: Commit**

```bash
git add src/components/NavPill.astro src/content/profile/about.md src/tests/profile.test.ts
git commit -m "feat: point navigation and profile at Substack and /showcase"
```

---

### Task 11: Documentation

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: nothing
- Produces: nothing

- [ ] **Step 1: Update the route documentation**

In `CLAUDE.md`:
- Replace the `/journal`, `/notes/[slug]`, and `/showcase/[slug]` bullets under "Content Collection Pages" with the new shapes.
- In "Legacy Routes (301 Redirects)": remove the `/notes` and `/showcase` entries; add `/journal → /showcase`, `/notes/* → Substack (server-rendered)`, and `/rss.xml → Substack feed (vercel.json)`.
- Delete the `/rss.xml` bullet under "Utility Pages".

- [ ] **Step 2: Update the component and utility documentation**

- Journal tile paragraph: the left field is now Substack posts, kicker "Writing", tile href `/showcase`.
- Latest tile paragraph: pool is 2 Substack posts + 1 showcase, emblem `scroll.svg`.
- NavPill: six items, Showcase replaces Journal.
- Utility module table: remove `journal.ts`; add `substack.ts` and `noteRedirect.ts`.
- SplitViewLayout row: remove `placeholderStats`, `showDraw`, `rssHref`; add `showSearch`.
- Remove the draw-a-card sentences from the `/journal` description and Implementation Detail 1.
- Content Collections Schema: note that `notes` gains `substackUrl` and renders no pages.

- [ ] **Step 3: Add a Substack section**

Add a section documenting: Substack is canonical; the site serves no note prose; `src/content/notes/` is the redirect map and stays public via GitHub; the backfill obligation (fill `substackUrl` per note, fallback is the archive); the build-time feed fetch degrades to `[]`; and the two inbound prose links in `about.md` and `now/2026-03.md` to retarget once those notes are backfilled.

- [ ] **Step 4: Final full verification**

Run: `npm test && npm run build`
Expected: both green.

Then in the browser, walk: `/` → `/showcase` → a showcase detail → `/about`, confirming no console errors on any of them.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document the Substack migration"
```

---

## Post-deploy checks

`vercel.json` redirects do not run under `astro dev`. After the first deploy, verify against the real deployment:

```bash
curl -sI https://ninjaruss.net/rss.xml | head -5
curl -sI https://ninjaruss.net/notes/addiction | head -5
curl -sI https://ninjaruss.net/journal | head -5
```

Expected: `301` to the Substack feed, `301` to the note's post or the archive, and `301` to `/showcase` respectively.

## Deferred (not in this plan)

- Backfilling the 24 notes to Substack and filling in each `substackUrl`. Ongoing manual work.
- Retargeting `src/content/profile/about.md` → `/notes/i-am-ninjaruss` and `src/content/now/2026-03.md` → `/notes/addiction` to direct Substack URLs. Both keep working via the redirect until then.
- `src/utils/level.ts` and `src/tests/level.test.ts` remain unimported. Unrelated to this migration; deleting them is a separate decision.
