# Media → Shelf Rename + Content Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the `media` content collection and route to `shelf`, add 301 redirects for old URLs, and add a visual content indicator (gold glow on filled cards, dim on empty) to the shelf grid.

**Architecture:** Full rename — content folder, Astro config, utilities, components, and pages all update in lockstep. Old `/media` URLs get `astro.config.mjs` redirects. Content indicator uses the existing `hasMinimalContent()` util at build time to classify each card.

**Tech Stack:** Astro 5, TypeScript, vanilla CSS, `@astrojs/vercel` adapter

---

### Task 1: Move content folder + update collection config

**Files:**
- Move: `src/content/media/` → `src/content/shelf/`
- Modify: `src/content/config.ts`

These two changes are atomic — Astro requires the folder name to match the collection key in config. Do both before committing.

- [ ] **Step 1: Move the content folder**

```bash
git mv src/content/media src/content/shelf
```

Expected: git tracks the directory rename, all 29 `.md` files show as renamed.

- [ ] **Step 2: Update config.ts — rename collection variable and export key**

In `src/content/config.ts`, make these two changes:

Change line 17 — the variable name:
```ts
// Before
const media = defineCollection({
// After
const shelf = defineCollection({
```

Change the export at line 79:
```ts
// Before
export const collections = {
  media,
  notes,
  showcase,
  now,
  stream,
  'social-links': socialLinks,
};
// After
export const collections = {
  shelf,
  notes,
  showcase,
  now,
  stream,
  'social-links': socialLinks,
};
```

Everything inside `defineCollection({...})` stays identical — `content_type`, `isFavorite`, all schema fields are unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(shelf): rename media collection to shelf"
```

---

### Task 2: Update collections utility

**Files:**
- Modify: `src/utils/collections.ts`

- [ ] **Step 1: Replace all `media`/`allMedia` references**

Replace the entire file content with:

```ts
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type SectionName = 'shelf' | 'notes' | 'showcase';

export interface AllCollections {
  allShelf: CollectionEntry<'shelf'>[];
  allNotes: CollectionEntry<'notes'>[];
  allShowcase: CollectionEntry<'showcase'>[];
}

/**
 * Fetch all non-draft entries from all content collections
 * Used for RelatedContent component
 */
export async function getAllCollections(): Promise<AllCollections> {
  const [allShelf, allNotes, allShowcase] = await Promise.all([
    getCollection('shelf', ({ data }) => !data.draft),
    getCollection('notes', ({ data }) => !data.draft),
    getCollection('showcase', ({ data }) => !data.draft),
  ]);

  return { allShelf, allNotes, allShowcase };
}

/**
 * Get sorted entries for a specific section (by publishedAt descending)
 */
export async function getSortedEntries<T extends SectionName>(
  section: T
): Promise<CollectionEntry<T>[]> {
  const entries = await getCollection(section, ({ data }) => !data.draft);
  return entries.sort((a, b) =>
    new Date(b.data.updatedAt || b.data.publishedAt || 0).getTime() -
    new Date(a.data.updatedAt || a.data.publishedAt || 0).getTime()
  ) as CollectionEntry<T>[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/collections.ts
git commit -m "feat(shelf): update collections utility for shelf rename"
```

---

### Task 3: Update RelatedContent component

**Files:**
- Modify: `src/components/RelatedContent.astro`

- [ ] **Step 1: Update Props interface and destructure**

Replace lines 1–13 (the frontmatter Props block):

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  currentSlug: string;
  currentCollections: string[];
  section: 'shelf' | 'notes' | 'showcase';
  allShelf: CollectionEntry<'shelf'>[];
  allNotes: CollectionEntry<'notes'>[];
  allShowcase: CollectionEntry<'showcase'>[];
}

const { currentSlug, currentCollections, section, allShelf, allNotes, allShowcase } = Astro.props;
```

- [ ] **Step 2: Update allEntries spread**

Replace lines 16–20 (the `allEntries` construction):

```ts
const allEntries = [
  ...allShelf.map(entry => ({ ...entry, type: 'shelf' as const })),
  ...allNotes.map(entry => ({ ...entry, type: 'notes' as const })),
  ...allShowcase.map(entry => ({ ...entry, type: 'showcase' as const }))
];
```

- [ ] **Step 3: Update getSectionLabel**

Replace the `getSectionLabel` function (lines 48–62):

```ts
const getSectionLabel = (entry: typeof relatedEntries[0]) => {
  if (entry.type === 'shelf' && 'content_type' in entry.data) {
    const type = entry.data.content_type;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  const labels = {
    shelf: 'Shelf',
    notes: 'Note',
    showcase: 'Project'
  };
  return labels[entry.type];
};
```

- [ ] **Step 4: Commit**

```bash
git add src/components/RelatedContent.astro
git commit -m "feat(shelf): update RelatedContent for shelf rename"
```

---

### Task 4: Move + rewrite shelf/index.astro

**Files:**
- Move: `src/pages/media/index.astro` → `src/pages/shelf/index.astro`
- Move: `src/pages/media/[...slug].astro` → `src/pages/shelf/[...slug].astro` (moved here, edited in Task 5)

- [ ] **Step 1: Move the pages directory**

```bash
git mv src/pages/media src/pages/shelf
```

- [ ] **Step 2: Update the frontmatter — collection, import, entryData**

In `src/pages/shelf/index.astro`, replace the entire frontmatter block (lines 1–24):

```astro
---
import { getCollection } from 'astro:content';
import { hasMinimalContent } from '../../utils/content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NavPill from '../../components/NavPill.astro';

const allShelf = await getCollection('shelf', ({ data }) => !data.draft);
const sortedShelf = allShelf.sort((a, b) =>
  new Date(b.data.updatedAt || b.data.publishedAt || 0).getTime() -
  new Date(a.data.updatedAt || a.data.publishedAt || 0).getTime()
);

const entryData = sortedShelf.map((entry) => ({
  slug: entry.slug,
  title: entry.data.title,
  type: entry.data.content_type,
  isFavorite: entry.data.isFavorite ?? false,
  emblem: entry.data.emblem ?? '/images/emblems/default.svg',
  tags: entry.data.tags ?? [],
  publishedAt: entry.data.publishedAt?.toISOString() ?? null,
  updatedAt: entry.data.updatedAt?.toISOString() ?? null,
  hasContent: !hasMinimalContent(entry.body),
}));

const count = sortedShelf.length;
---
```

- [ ] **Step 3: Update BaseLayout title and header**

Change line 26:
```astro
<BaseLayout title="Shelf" description="My thoughts on anime, manga, movies, and more — favorites included." ogImage="/social-default.svg">
```

Change the header block (was lines 31–36):
```astro
    <header class="media-header">
      <span class="media-header__label">Shelf</span>
      <h1 class="media-header__title">Shelf</h1>
      <span class="media-header__count">{count} entries</span>
    </header>
```

- [ ] **Step 4: Update card rendering — href and class**

Change the card `<a>` opening tag (was around line 58–66). Replace `href` and `class`:

```astro
      {sortedShelf.map((entry, i) => (
        <a
          href={`/shelf/${entry.slug}`}
          class:list={['media-card', { 'media-card--has-note': !hasMinimalContent(entry.body) }]}
          data-slug={entry.slug}
          data-type={entry.data.content_type}
          data-fav={entry.data.isFavorite ? 'true' : 'false'}
          style={`--card-index: ${i}`}
          aria-label={entry.data.title}
        >
```

- [ ] **Step 5: Update JS URL strings in the `<script>` block**

Three strings need changing. Find and replace each:

```
/media/${encodeURIComponent(slug)}  →  /shelf/${encodeURIComponent(slug)}
'/media' + filterURL                →  '/shelf' + filterURL
`/media/${encodeURIComponent(slug)}`  →  `/shelf/${encodeURIComponent(slug)}`
```

Specifically:
- `fetch('/media/${...}')` (line ~599) → `fetch('/shelf/${...}')`
- `history.replaceState(null, '', '/media' + filterURL)` (line ~635) → `'/shelf' + filterURL`
- `history.pushState(null, '', '/media/${...}')` (line ~654) → `'/shelf/${...}'`
- `history.replaceState(null, '', '/media/${...}')` (line ~703) → `'/shelf/${...}'`

- [ ] **Step 6: Add content indicator CSS**

Inside the `<style>` block, add these rules after the existing `.media-card` base styles:

```css
  .media-card--has-note {
    border-color: rgba(255, 229, 44, 0.5);
    box-shadow: 0 0 12px rgba(255, 229, 44, 0.15), inset 0 0 0 1px rgba(255, 229, 44, 0.1);
  }
  .media-card:not(.media-card--has-note) {
    opacity: 0.55;
  }
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/shelf/index.astro
git commit -m "feat(shelf): rename media page to shelf, add content indicator"
```

---

### Task 5: Update shelf/[...slug].astro

**Files:**
- Modify: `src/pages/shelf/[...slug].astro`

- [ ] **Step 1: Update getCollection call**

Line 12 — change collection name:
```ts
  const entries = await getCollection('shelf');
```

- [ ] **Step 2: Update getAllCollections destructure**

Line 21 — rename `allMedia` to `allShelf`:
```ts
const { allShelf, allNotes, allShowcase } = await getAllCollections();
```

- [ ] **Step 3: Update window.location.replace URL**

Line ~34:
```ts
    window.location.replace('/shelf?open=' + encodeURIComponent(entrySlug));
```

- [ ] **Step 4: Update RelatedContent props**

In the RelatedContent usage (lines ~67–71), two props change. The others (`currentSlug`, `currentCollections`, `allNotes`, `allShowcase`) are unchanged:
```astro
            section="shelf"
            allShelf={allShelf}
            allNotes={allNotes}
            allShowcase={allShowcase}
```

Replace `section="media"` with `section="shelf"` and `allMedia={allMedia}` with `allShelf={allShelf}`.

- [ ] **Step 5: Update NavPill back-link**

Line ~78:
```astro
  <NavPill backLink="/shelf" backLabel="Shelf" />
```

- [ ] **Step 6: Commit**

```bash
git add "src/pages/shelf/[...slug].astro"
git commit -m "feat(shelf): update slug page for shelf rename"
```

---

### Task 6: Update homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Update getCollection call**

Line 12:
```ts
const media = await getCollection('shelf', ({ data }) => !data.draft && data.publishedAt);
```

(Keep the variable name `media` — it's only used locally on this page and renaming it would require many more line changes for no benefit.)

- [ ] **Step 2: Update recentMedia href template**

Line ~46:
```ts
  .map(e => ({ href: `/shelf/${e.slug}`, emblem: e.data.emblem ?? DEFAULT_EMBLEM, title: e.data.title }));
```

- [ ] **Step 3: Update BentoTile**

Lines ~345–350:
```astro
      <BentoTile
        href="/shelf"
        variant="dark"
        label="Shelf"
        title="Shelf"
        class="bento-tile--core bento-tile--span-2x2 media-tile"
      >
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(shelf): update homepage bento tile for shelf rename"
```

---

### Task 7: Update favorites redirects + add astro.config.mjs redirects

**Files:**
- Modify: `src/pages/favorites.astro`
- Modify: `src/pages/favorites/[...slug].astro`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Update favorites.astro**

Change the redirect target:
```astro
---
return Astro.redirect('/shelf?fav=1', 301);
---
```

- [ ] **Step 2: Update favorites/[...slug].astro**

Change `getCollection` and redirect target:
```astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('shelf', ({ data }) => !data.draft && data.isFavorite);
  return entries.map((entry) => ({
    params: { slug: entry.slug },
  }));
}

const { slug } = Astro.params;
return Astro.redirect(`/shelf/${slug}`, 301);
---
```

- [ ] **Step 3: Add redirects to astro.config.mjs**

```js
// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://ninjaruss.net',
  adapter: vercel(),
  integrations: [mdx(), sitemap()],
  redirects: {
    '/media': '/shelf',
    '/media/[...slug]': '/shelf/[...slug]',
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/favorites.astro "src/pages/favorites/[...slug].astro" astro.config.mjs
git commit -m "feat(shelf): update favorites redirects and add /media → /shelf config redirects"
```

---

### Task 8: Build verification

- [ ] **Step 1: Run unit tests**

```bash
npm run test
```

Expected: all tests pass (novel.test.ts and mediaGrid.test.ts are unaffected by this rename).

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: exits 0, no TypeScript errors, no missing collection errors. If you see `Cannot find collection 'media'`, check that `src/content/config.ts` exports `shelf` and `src/content/shelf/` exists.

- [ ] **Step 3: Preview and verify**

```bash
npm run preview
```

Open a browser and check:

| URL | Expected result |
|-----|----------------|
| `http://localhost:4321/shelf` | Grid renders; header shows "Shelf"; 6 cards have gold glow, 23 cards are dimmed |
| `http://localhost:4321/shelf/persona-4-golden` | Detail page loads correctly |
| `http://localhost:4321/media` | 301 redirect → `/shelf` |
| `http://localhost:4321/media/bocchi` | 301 redirect → `/shelf/bocchi` |
| `http://localhost:4321/favorites` | Redirects → `/shelf?fav=1` |
| `http://localhost:4321/` | Homepage bento tile shows "Shelf" label and links to `/shelf` |

- [ ] **Step 4: Verify filter + overlay still work**

On `/shelf`: click a type filter tab (e.g. "anime") — grid should filter. Click a card — overlay should open, URL should update to `/shelf/[slug]`. Press ESC — overlay closes, URL reverts to `/shelf`.

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -p
git commit -m "fix(shelf): post-build corrections"
```
