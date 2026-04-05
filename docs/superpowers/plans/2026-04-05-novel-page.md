# Novel Page (Remember Rain) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an immersive `/novel` page that renders Scrivener-exported markdown files as floating glass shards with per-folder color identity, shard-break navigation, and URL-reflected state.

**Architecture:** A catch-all `[...slug].astro` route reads `src/content/novel/` recursively at build time using Node `fs`, parses MetaData.txt sidecar files for created/modified dates, pre-renders markdown to HTML with `marked`, and serializes the full tree as inline JSON. Client-side JS handles all shard animations and navigation via History API with no round-trips.

**Tech Stack:** Astro 5, TypeScript, Node `fs`, `marked` (markdown→HTML), Vitest (utility tests), vanilla CSS (clip-path shards, CSS transitions)

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `src/utils/novel.ts` | Create | Tree builder, MetaData parser, slugify — all build-time fs logic |
| `src/tests/novel.test.ts` | Create | Unit tests for novel.ts pure functions |
| `src/styles/novel.css` | Create | Shard shapes, scatter positions, color themes, all state transitions, mobile |
| `src/pages/novel/[...slug].astro` | Create | Catch-all route: getStaticPaths, data serialization, HTML skeleton |

No new components. Reuses `BaseLayout`, `NavPill`, `formatDate` from existing utils.

---

## Task 1: Add marked dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install marked**

```bash
npm install marked
npm install -D @types/marked vitest
```

- [ ] **Step 2: Add test script to package.json**

Open `package.json`. Add `"test": "vitest run"` to the `scripts` block:

```json
{
  "name": "ninjaruss-net",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run"
  },
  "dependencies": {
    "@astrojs/mdx": "^4.3.13",
    "@astrojs/sitemap": "^3.7.0",
    "astro": "^5.16.6",
    "marked": "^15.0.0"
  },
  "devDependencies": {
    "@types/marked": "^6.0.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts` at the project root:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 4: Verify install**

```bash
npm run test
```

Expected: "No test files found" (0 tests, no errors)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add marked + vitest for novel page"
```

---

## Task 2: novel.ts — slugify and parseMetaData

**Files:**
- Create: `src/utils/novel.ts`
- Create: `src/tests/novel.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/novel.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { slugify, parseMetaData } from '../utils/novel';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Magic Overview')).toBe('magic-overview');
  });

  it('removes special characters', () => {
    expect(slugify('Focus Questions')).toBe('focus-questions');
  });

  it('handles single word', () => {
    expect(slugify('Rain')).toBe('rain');
  });

  it('collapses multiple spaces', () => {
    expect(slugify('Character  Ability  Table')).toBe('character-ability-table');
  });
});

describe('parseMetaData', () => {
  it('parses created and modified dates', () => {
    const input = `Created: December 18, 2025 at 2:27 PM
Modified: April 5, 2026 at 3:31 AM
Status: Web Ready
Label: No Label
Keywords: `;
    const result = parseMetaData(input);
    expect(result.created).toBe('December 18, 2025');
    expect(result.modified).toBe('April 5, 2026');
  });

  it('returns null for missing fields', () => {
    const result = parseMetaData('Status: No Status\nLabel: No Label');
    expect(result.created).toBeNull();
    expect(result.modified).toBeNull();
  });

  it('handles empty string', () => {
    const result = parseMetaData('');
    expect(result.created).toBeNull();
    expect(result.modified).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — "Cannot find module '../utils/novel'"

- [ ] **Step 3: Implement slugify and parseMetaData**

Create `src/utils/novel.ts`:

```ts
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import { marked } from 'marked';

export interface NovelFile {
  slug: string;
  title: string;
  body: string;         // markdown pre-rendered to HTML at build time
  created: string | null;
  modified: string | null;
  path: string[];       // folder path segments, e.g. ['lore', 'magic-system']
}

export interface NovelFolder {
  slug: string;
  title: string;
  files: NovelFile[];
  subfolders: Record<string, NovelFolder>;
}

export type NovelTree = Record<string, NovelFolder>;

export interface MetaData {
  created: string | null;
  modified: string | null;
}

/** Convert a filename (without extension) to a URL-safe slug. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Parse a Scrivener MetaData.txt file content for created and modified dates. */
export function parseMetaData(content: string): MetaData {
  const createdMatch = content.match(/^Created:\s*(.+?)\s+at\s+/m);
  const modifiedMatch = content.match(/^Modified:\s*(.+?)\s+at\s+/m);
  return {
    created: createdMatch ? createdMatch[1].trim() : null,
    modified: modifiedMatch ? modifiedMatch[1].trim() : null,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS — 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/novel.ts src/tests/novel.test.ts
git commit -m "feat: add novel utility - slugify + parseMetaData"
```

---

## Task 3: novel.ts — buildNovelTree

**Files:**
- Modify: `src/utils/novel.ts`
- Modify: `src/tests/novel.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/tests/novel.test.ts`:

```ts
import { buildNovelTree } from '../utils/novel';
import { join } from 'path';

describe('buildNovelTree', () => {
  it('builds tree from actual novel content directory', async () => {
    const dir = join(process.cwd(), 'src/content/novel');
    const tree = await buildNovelTree(dir);

    // Top-level folders exist
    expect(tree).toHaveProperty('characters');
    expect(tree).toHaveProperty('locations');
    expect(tree).toHaveProperty('lore');
    expect(tree).toHaveProperty('themes');

    // Characters folder has Rain file
    expect(tree.characters.files).toHaveLength(1);
    expect(tree.characters.files[0].slug).toBe('rain');
    expect(tree.characters.files[0].title).toBe('Rain');
    expect(tree.characters.files[0].body).toBeTruthy(); // HTML rendered
    expect(typeof tree.characters.files[0].body).toBe('string');

    // Lore has Magic System subfolder
    expect(tree.lore.subfolders).toHaveProperty('magic-system');
    expect(tree.lore.subfolders['magic-system'].files.length).toBeGreaterThan(0);

    // Dates are parsed
    expect(tree.characters.files[0].created).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — "buildNovelTree is not a function"

- [ ] **Step 3: Implement buildNovelTree**

Append to `src/utils/novel.ts` (after the existing functions):

```ts
/** Read a MetaData.txt sidecar file next to a given .md file, if it exists. */
function readSidecarMeta(mdFilePath: string): MetaData {
  // MetaData file is named "<Title> MetaData.txt" in the same directory
  const dir = mdFilePath.replace(/\/[^/]+$/, '');
  const title = basename(mdFilePath, '.md');
  const metaPath = join(dir, `${title} MetaData.txt`);
  if (existsSync(metaPath)) {
    return parseMetaData(readFileSync(metaPath, 'utf-8'));
  }
  return { created: null, modified: null };
}

/** Recursively build a NovelFolder from a directory path. */
async function buildFolder(
  dirPath: string,
  pathSegments: string[]
): Promise<NovelFolder> {
  const name = basename(dirPath);
  const slug = slugify(name);
  const entries = readdirSync(dirPath);

  const files: NovelFile[] = [];
  const subfolders: Record<string, NovelFolder> = {};

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      const sub = await buildFolder(fullPath, [...pathSegments, slugify(entry)]);
      subfolders[sub.slug] = sub;
    } else if (entry.endsWith('.md')) {
      const title = basename(entry, '.md');
      const fileSlug = slugify(title);
      const rawMarkdown = readFileSync(fullPath, 'utf-8');
      const body = await marked.parse(rawMarkdown);
      const meta = readSidecarMeta(fullPath);

      files.push({
        slug: fileSlug,
        title,
        body,
        created: meta.created,
        modified: meta.modified,
        path: [...pathSegments, fileSlug],
      });
    }
    // .txt files (MetaData) are silently skipped
  }

  return { slug, title: name, files, subfolders };
}

/**
 * Build the full novel content tree from the given base directory.
 * Only top-level subdirectories become tree entries.
 */
export async function buildNovelTree(baseDir: string): Promise<NovelTree> {
  const entries = readdirSync(baseDir);
  const tree: NovelTree = {};

  for (const entry of entries) {
    const fullPath = join(baseDir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      const folder = await buildFolder(fullPath, [slugify(entry)]);
      tree[folder.slug] = folder;
    }
  }

  return tree;
}
```

- [ ] **Step 4: Run tests to verify all pass**

```bash
npm test
```

Expected: PASS — all tests pass including integration test

- [ ] **Step 5: Commit**

```bash
git add src/utils/novel.ts src/tests/novel.test.ts
git commit -m "feat: add novel utility - buildNovelTree"
```

---

## Task 4: novel.css — shard shapes, scatter layout, color themes

**Files:**
- Create: `src/styles/novel.css`

- [ ] **Step 1: Create the CSS file with shard base styles**

Create `src/styles/novel.css`:

```css
/* ============================================================
   Novel Page — Remember Rain
   Memory Shards visual system
   ============================================================ */

/* --- Container -------------------------------------------- */

.novel-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: var(--color-bg-deep);
  overflow: hidden;
}

.novel-scatter {
  position: relative;
  width: 100%;
  height: 100vh;
}

/* --- Shard base ------------------------------------------- */

.shard {
  position: absolute;
  cursor: pointer;
  transition:
    transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 400ms ease-out,
    box-shadow 200ms ease;
  transform-origin: center center;
  will-change: transform, opacity;
}

.shard__inner {
  width: 100%;
  height: 100%;
  border: 1.5px solid currentColor;
  background: color-mix(in srgb, currentColor 8%, transparent);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
}

.shard__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: currentColor;
  text-align: center;
}

.shard__count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  color: currentColor;
  opacity: 0.5;
}

/* Hover glow */
.shard:hover .shard__inner {
  box-shadow: 0 0 24px color-mix(in srgb, currentColor 25%, transparent);
}

/* --- Folder identity (color + clip-path shape) ------------ */

[data-folder="characters"] {
  color: #ffe52c;
  width: 320px;
  height: 240px;
  top: 8%;
  left: 4%;
  --rotate: -3deg;
  transform: rotate(var(--rotate));
}
[data-folder="characters"] .shard__inner {
  clip-path: polygon(4% 6%, 95% 2%, 92% 91%, 7% 95%);
}

[data-folder="locations"] {
  color: #7ab8ff;
  width: 340px;
  height: 220px;
  top: 15%;
  left: 36%;
  --rotate: 2deg;
  transform: rotate(var(--rotate));
}
[data-folder="locations"] .shard__inner {
  clip-path: polygon(2% 5%, 93% 8%, 97% 90%, 4% 93%);
}

[data-folder="lore"] {
  color: #ff8822;
  width: 300px;
  height: 250px;
  top: 6%;
  left: 63%;
  --rotate: -4deg;
  transform: rotate(var(--rotate));
}
[data-folder="lore"] .shard__inner {
  clip-path: polygon(6% 3%, 96% 5%, 91% 93%, 3% 91%);
}

[data-folder="scenes"] {
  color: #ff6666;
  width: 360px;
  height: 230px;
  top: 55%;
  left: 10%;
  --rotate: 3deg;
  transform: rotate(var(--rotate));
}
[data-folder="scenes"] .shard__inner {
  clip-path: polygon(3% 7%, 94% 3%, 96% 94%, 5% 97%);
}

[data-folder="themes"] {
  color: #aaaaff;
  width: 310px;
  height: 260px;
  top: 50%;
  left: 56%;
  --rotate: -2deg;
  transform: rotate(var(--rotate));
}
[data-folder="themes"] .shard__inner {
  clip-path: polygon(7% 4%, 97% 6%, 93% 92%, 2% 89%);
}

/* --- Sub-shards (file fragments within a folder) ---------- */

.sub-shard {
  position: absolute;
  cursor: pointer;
  transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease;
  will-change: transform, opacity;
  opacity: 0;
  pointer-events: none;
}

.sub-shard__inner {
  width: 100%;
  height: 100%;
  border: 1px solid currentColor;
  background: color-mix(in srgb, currentColor 6%, transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
  clip-path: polygon(5% 8%, 94% 3%, 92% 90%, 6% 95%);
}

.sub-shard__title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: currentColor;
}

.sub-shard__meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  color: currentColor;
  opacity: 0.45;
  margin-top: 0.25rem;
}

.sub-shard:hover .sub-shard__inner {
  box-shadow: 0 0 16px color-mix(in srgb, currentColor 20%, transparent);
}
```

- [ ] **Step 2: Verify the file was created**

```bash
ls src/styles/novel.css
```

Expected: file listed

- [ ] **Step 3: Commit**

```bash
git add src/styles/novel.css
git commit -m "feat: novel CSS - shard shapes and scatter layout"
```

---

## Task 5: novel.css — state transitions

**Files:**
- Modify: `src/styles/novel.css`

- [ ] **Step 1: Append state transition styles**

Append to `src/styles/novel.css`:

```css
/* ============================================================
   Shard State Transitions
   ============================================================ */

/* --- State: folder selected ------------------------------- */

/* When a folder is selected, other folder shards become ghosts */
.novel-page.folder-selected .shard:not(.is-active-folder) {
  opacity: 0.18;
  pointer-events: auto; /* still clickable to switch folders */
}

/* Ghost drift positions — each folder drifts toward its nearest edge */
.novel-page.folder-selected [data-folder="characters"]:not(.is-active-folder) {
  transform: rotate(var(--rotate)) translate(-55%, -50%) scale(0.4);
}
.novel-page.folder-selected [data-folder="locations"]:not(.is-active-folder) {
  transform: rotate(var(--rotate)) translate(0%, -70%) scale(0.4);
}
.novel-page.folder-selected [data-folder="lore"]:not(.is-active-folder) {
  transform: rotate(var(--rotate)) translate(55%, -50%) scale(0.4);
}
.novel-page.folder-selected [data-folder="scenes"]:not(.is-active-folder) {
  transform: rotate(var(--rotate)) translate(-55%, 50%) scale(0.4);
}
.novel-page.folder-selected [data-folder="themes"]:not(.is-active-folder) {
  transform: rotate(var(--rotate)) translate(55%, 45%) scale(0.4);
}

/* Active folder: slight scale-up then sub-shards appear */
.shard.is-active-folder {
  z-index: 10;
  transform: rotate(var(--rotate)) scale(1.04);
}

/* Sub-shards visible when folder is selected */
.novel-page.folder-selected .sub-shard.is-visible {
  opacity: 1;
  pointer-events: auto;
}

/* --- State: file open ------------------------------------- */

/* When a file is open, non-active sub-shards become ghost */
.novel-page.file-open .sub-shard:not(.is-active-file) {
  opacity: 0.15;
  pointer-events: none;
}

/* Active file sub-shard fills the reading area */
.sub-shard.is-active-file {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  pointer-events: auto;
  transition: all 350ms cubic-bezier(0.16, 1, 0.3, 1);
}

.sub-shard.is-active-file .sub-shard__inner {
  clip-path: polygon(2% 2%, 98% 1%, 99% 98%, 1% 99%);
  justify-content: flex-start;
  padding: 3rem 4rem;
  overflow-y: auto;
  background: color-mix(in srgb, currentColor 5%, var(--color-bg-deep) 95%);
}

/* --- Content area inside open file ----------------------- */

.novel-content__back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: currentColor;
  opacity: 0.5;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  margin-bottom: 2rem;
  transition: opacity 200ms ease;
}
.novel-content__back:hover { opacity: 1; }

.novel-content__breadcrumb {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: currentColor;
  opacity: 0.4;
  margin-bottom: 0.5rem;
}

.novel-content__title {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(1.8rem, 4vw, 3rem);
  color: currentColor;
  line-height: 1.1;
  margin: 0 0 0.75rem;
}

.novel-content__dates {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: currentColor;
  opacity: 0.45;
  margin-bottom: 2.5rem;
  display: flex;
  gap: 1.5rem;
}

.novel-content__body {
  color: var(--color-text);
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  line-height: 1.75;
  max-width: 680px;
}

.novel-content__body p { margin: 0 0 1.25em; }
.novel-content__body strong { color: currentColor; font-weight: 700; }
.novel-content__body h2, .novel-content__body h3 {
  font-family: 'Archivo Black', sans-serif;
  color: currentColor;
  margin: 2em 0 0.75em;
}
.novel-content__body ul, .novel-content__body ol {
  padding-left: 1.5em;
  margin: 0 0 1.25em;
}
.novel-content__body li { margin-bottom: 0.4em; }

/* --- Empty folder state ----------------------------------- */

.novel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: currentColor;
  opacity: 0.35;
}

/* --- Reduced motion ---------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .shard, .sub-shard {
    transition: opacity 200ms ease;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/novel.css
git commit -m "feat: novel CSS - state transitions and content area"
```

---

## Task 6: novel.css — mobile styles

**Files:**
- Modify: `src/styles/novel.css`

- [ ] **Step 1: Append mobile styles**

Append to `src/styles/novel.css`:

```css
/* ============================================================
   Mobile (below 768px)
   ============================================================ */

@media (max-width: 768px) {
  .novel-scatter {
    height: auto;
    min-height: 100vh;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Shards stack as full-width cards, no absolute positioning */
  .shard {
    position: static;
    width: 100% !important;
    height: auto !important;
    transform: none !important;
    --rotate: 0deg;
  }

  .shard__inner {
    clip-path: none !important;
    border-radius: 2px;
    padding: 1.25rem 1.5rem;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }

  /* Ghost drift disabled on mobile */
  .novel-page.folder-selected .shard:not(.is-active-folder) {
    opacity: 0.35;
    transform: none !important;
  }

  .novel-page.folder-selected .shard.is-active-folder {
    transform: none !important;
  }

  /* Sub-shards: appear below the active folder shard as a list */
  .sub-shard {
    position: static;
    width: 100% !important;
    height: auto !important;
    opacity: 0;
    pointer-events: none;
    max-height: 0;
    overflow: hidden;
    transition: opacity 300ms ease, max-height 350ms ease;
  }

  .novel-page.folder-selected .sub-shard.is-visible {
    max-height: 80px;
    pointer-events: auto;
  }

  .sub-shard__inner {
    clip-path: none !important;
    border-radius: 2px;
    padding: 0.75rem 1.25rem;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  /* File open: full screen, normal scroll */
  .sub-shard.is-active-file {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .sub-shard.is-active-file .sub-shard__inner {
    clip-path: none !important;
    padding: 2rem 1.5rem;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .novel-content__title {
    font-size: 1.6rem;
  }

  .novel-content__body {
    font-size: 0.9rem;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/novel.css
git commit -m "feat: novel CSS - mobile styles"
```

---

## Task 7: [...slug].astro — page scaffold and data serialization

**Files:**
- Create: `src/pages/novel/[...slug].astro`

- [ ] **Step 1: Create the Astro page**

Create `src/pages/novel/[...slug].astro`:

```astro
---
import { join } from 'path';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NavPill from '../../components/NavPill.astro';
import { buildNovelTree, slugify } from '../../utils/novel';
import type { NovelTree, NovelFolder } from '../../utils/novel';

// Collect all URL path strings from the tree (used in getStaticPaths only)
function collectPaths(folder: NovelFolder, prefix: string): string[] {
  const paths: string[] = [prefix];
  for (const file of folder.files) {
    paths.push(`${prefix}/${file.slug}`);
  }
  for (const sub of Object.values(folder.subfolders)) {
    paths.push(...collectPaths(sub, `${prefix}/${sub.slug}`));
  }
  return paths;
}

export async function getStaticPaths() {
  const novelDir = join(process.cwd(), 'src/content/novel');
  const tree = await buildNovelTree(novelDir);

  const allPaths: string[] = [];
  for (const folder of Object.values(tree)) {
    allPaths.push(...collectPaths(folder, folder.slug));
  }

  return [
    // /novel index — slug is undefined (rest param matches parent)
    { params: { slug: undefined }, props: { tree, initialSlug: null } },
    ...allPaths.map((s) => ({
      params: { slug: s },
      props: { tree, initialSlug: s },
    })),
  ];
}

interface Props {
  tree: NovelTree;
  initialSlug: string | null;
}

const { tree: novelTree, initialSlug } = Astro.props;

// Determine initial UI state from slug
// slug format: "folder", "folder/file", "folder/sub/file"
const slugParts = initialSlug ? initialSlug.split('/') : [];
const initialFolder = slugParts[0] ?? null;
const initialSubPath = slugParts.length > 1 ? slugParts.slice(1).join('/') : null;
---

<BaseLayout
  title="Remember Rain"
  description="A novel in progress — characters, lore, locations, and themes."
>
  <NavPill />
  <main
    class="novel-page"
    data-initial-folder={initialFolder}
    data-initial-subpath={initialSubPath}
  >
    <div class="novel-scatter">
      {Object.values(novelTree).map((folder) => (
        <div
          class="shard"
          data-folder={folder.slug}
          role="button"
          tabindex="0"
          aria-label={`Open ${folder.title}`}
        >
          <div class="shard__inner">
            <span class="shard__label">{folder.title}</span>
            <span class="shard__count">
              {folder.files.length + Object.values(folder.subfolders).reduce((n, s) => n + s.files.length, 0)} files
            </span>
          </div>
        </div>
      ))}
    </div>
  </main>

  {/* Inline data — no client fetches */}
  <script type="application/json" id="novel-tree">
    {JSON.stringify(novelTree)}
  </script>
</BaseLayout>

<style>
  @import '../../styles/novel.css';
</style>
```

- [ ] **Step 2: Test the build**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds, no TypeScript errors, routes for `/novel`, `/novel/characters`, `/novel/characters/rain`, etc. are generated

- [ ] **Step 3: Verify routes exist in dist**

```bash
ls dist/novel/
```

Expected: `index.html` and subdirectories for each folder/file

- [ ] **Step 4: Commit**

```bash
git add src/pages/novel/
git commit -m "feat: novel page scaffold with static paths and data serialization"
```

---

## Task 8: Client JS — initialization and hover tilt

**Files:**
- Modify: `src/pages/novel/[...slug].astro`

- [ ] **Step 1: Add the client script block to the Astro page**

Before the closing `</BaseLayout>` tag but after the existing `<script>` data tag, add a `<script>` block. In Astro, client scripts go at the bottom of the template. Add the following directly in `src/pages/novel/[...slug].astro`:

```astro
<script>
  // Types inline — do NOT import from novel.ts (it uses Node fs, unsafe in client scripts)
  interface NovelFile {
    slug: string; title: string; body: string;
    created: string | null; modified: string | null; path: string[];
  }
  interface NovelFolder {
    slug: string; title: string;
    files: NovelFile[]; subfolders: Record<string, NovelFolder>;
  }
  type NovelTree = Record<string, NovelFolder>;

  // ── Read embedded data ──────────────────────────���───────────
  const treeEl = document.getElementById('novel-tree');
  if (!treeEl) throw new Error('novel-tree data missing');
  const tree: NovelTree = JSON.parse(treeEl.textContent!);

  const page = document.querySelector('.novel-page') as HTMLElement;
  const scatter = document.querySelector('.novel-scatter') as HTMLElement;

  // ── Hover tilt (desktop only) ───────────────────────────────
  // Only activate on devices that support hover
  const canHover = window.matchMedia('(hover: hover)').matches;

  if (canHover) {
    let rafId: number | null = null;

    document.querySelectorAll<HTMLElement>('.shard').forEach((shard) => {
      shard.addEventListener('mousemove', (e: MouseEvent) => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = shard.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) / (rect.width / 2);  // -1 to 1
          const dy = (e.clientY - cy) / (rect.height / 2); // -1 to 1
          const maxTilt = 10;
          const tiltX = -dy * maxTilt;
          const tiltY = dx * maxTilt;
          const baseRotate = getComputedStyle(shard).getPropertyValue('--rotate').trim() || '0deg';
          shard.style.transform = `rotate(${baseRotate}) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
        });
      });

      shard.addEventListener('mouseleave', () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        const baseRotate = getComputedStyle(shard).getPropertyValue('--rotate').trim() || '0deg';
        shard.style.transform = `rotate(${baseRotate})`;
      });
    });
  }
</script>
```

- [ ] **Step 2: Start dev server and verify tilt works**

```bash
npm run dev
```

Open `http://localhost:4321/novel` in a browser. Hover over any shard — it should tilt subtly toward the cursor.

- [ ] **Step 3: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat: novel client JS - hover tilt effect"
```

---

## Task 9: Client JS — folder selection and sub-shards

**Files:**
- Modify: `src/pages/novel/[...slug].astro`

- [ ] **Step 1: Add sub-shard rendering and folder selection to the client script**

Inside the existing `<script>` block (after the hover tilt code), append:

```ts
  // ── Sub-shard positioning helpers ──────────────────────────

  /** Get all files from a folder including files in immediate subfolders. */
  function getAllFiles(folder: NovelFolder): Array<{ file: NovelFile; subPath: string }> {
    const result: Array<{ file: NovelFile; subPath: string }> = [];
    for (const file of folder.files) {
      result.push({ file, subPath: file.slug });
    }
    for (const sub of Object.values(folder.subfolders)) {
      for (const file of sub.files) {
        result.push({ file, subPath: `${sub.slug}/${file.slug}` });
      }
    }
    return result;
  }

  /** Compute scattered positions for sub-shards around a folder shard. */
  function getSubShardPositions(
    folderEl: HTMLElement,
    count: number
  ): Array<{ top: number; left: number; width: number; height: number; rotate: number }> {
    const rect = folderEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const positions = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 1.4 - 0.2; // spread in an arc
      const radius = 160 + i * 20;
      const width = 220 + (i % 3) * 30;
      const height = 160 + (i % 2) * 20;
      positions.push({
        left: centerX + Math.cos(angle) * radius - width / 2,
        top: centerY + Math.sin(angle) * radius - height / 2,
        width,
        height,
        rotate: -3 + i * 1.5,
      });
    }
    return positions;
  }

  // ── State: current selection ────────────────────────────────
  let currentFolderSlug: string | null = null;
  let subShardEls: HTMLElement[] = [];

  /** Remove all existing sub-shards from the DOM. */
  function clearSubShards() {
    subShardEls.forEach((el) => el.remove());
    subShardEls = [];
  }

  /** Render sub-shards for the given folder into the scatter container. */
  function renderSubShards(folderSlug: string) {
    clearSubShards();
    const folder = tree[folderSlug];
    if (!folder) return;

    const folderEl = document.querySelector<HTMLElement>(`[data-folder="${folderSlug}"]`);
    if (!folderEl) return;

    const allFiles = getAllFiles(folder);
    if (allFiles.length === 0) {
      // Empty folder — show placeholder inside the active shard
      const empty = document.createElement('div');
      empty.className = 'novel-empty';
      empty.textContent = 'No files yet';
      folderEl.appendChild(empty);
      subShardEls.push(empty);
      return;
    }

    const positions = getSubShardPositions(folderEl, allFiles.length);

    allFiles.forEach(({ file, subPath }, i) => {
      const el = document.createElement('div');
      el.className = 'sub-shard';
      el.dataset.subPath = subPath;
      el.dataset.fileSlug = file.slug;
      el.style.color = getComputedStyle(
        document.querySelector<HTMLElement>(`[data-folder="${folderSlug}"]`)!
      ).color;

      const pos = positions[i];
      el.style.left = `${pos.left}px`;
      el.style.top = `${pos.top}px`;
      el.style.width = `${pos.width}px`;
      el.style.height = `${pos.height}px`;
      el.style.transform = `rotate(${pos.rotate}deg)`;

      el.innerHTML = `
        <div class="sub-shard__inner">
          <span class="sub-shard__title">${file.title}</span>
          ${file.modified ? `<span class="sub-shard__meta">Modified ${file.modified}</span>` : ''}
        </div>
      `;

      el.addEventListener('click', () => openFile(folderSlug, subPath));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') openFile(folderSlug, subPath);
      });
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `Open ${file.title}`);

      scatter.appendChild(el);
      subShardEls.push(el);

      // Stagger the appearance
      setTimeout(() => {
        el.classList.add('is-visible');
      }, i * 50);
    });
  }

  /** Select a folder: update classes, render sub-shards. */
  function selectFolder(folderSlug: string, pushState = true) {
    // Clear file-open state
    page.classList.remove('file-open');
    document.querySelector('.sub-shard.is-active-file')?.classList.remove('is-active-file');
    clearContentPanel();

    currentFolderSlug = folderSlug;
    page.classList.add('folder-selected');

    // Mark the active folder shard
    document.querySelectorAll('.shard').forEach((s) => {
      s.classList.toggle('is-active-folder', (s as HTMLElement).dataset.folder === folderSlug);
    });

    renderSubShards(folderSlug);

    if (pushState) {
      history.pushState({ folderSlug, fileSubPath: null }, '', `/novel/${folderSlug}`);
    }
  }

  // ── Bind folder shard clicks ────────────────────────────────
  document.querySelectorAll<HTMLElement>('.shard').forEach((shard) => {
    shard.addEventListener('click', () => {
      const slug = shard.dataset.folder;
      if (!slug) return;
      selectFolder(slug);
    });
    shard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const slug = shard.dataset.folder;
        if (slug) selectFolder(slug);
      }
    });
  });
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Navigate to `http://localhost:4321/novel`. Click a folder shard. The clicked shard should slightly scale up, other shards should fade and drift toward screen edges, and file sub-shards should appear staggered around the clicked shard.

- [ ] **Step 3: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat: novel client JS - folder selection and sub-shard rendering"
```

---

## Task 10: Client JS — file open and content render

**Files:**
- Modify: `src/pages/novel/[...slug].astro`

- [ ] **Step 1: Add file opening and content rendering to the client script**

Inside the existing `<script>` block, append (after the folder selection code):

```ts
  // ── Content panel ───────────────────────────────────────────

  /** Look up a NovelFile by folder slug and subPath (e.g. "magic-system/magic-overview"). */
  function findFile(folderSlug: string, subPath: string): NovelFile | null {
    const folder = tree[folderSlug];
    if (!folder) return null;
    const parts = subPath.split('/');

    if (parts.length === 1) {
      return folder.files.find((f) => f.slug === parts[0]) ?? null;
    }
    // Navigate subfolders
    let current: NovelFolder = folder;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current.subfolders[parts[i]];
      if (!current) return null;
    }
    return current.files.find((f) => f.slug === parts[parts.length - 1]) ?? null;
  }

  /** Remove content from any open file sub-shard. */
  function clearContentPanel() {
    const existing = document.querySelector('.novel-content');
    existing?.remove();
  }

  /** Build the breadcrumb string from folderSlug + subPath. */
  function buildBreadcrumb(folderSlug: string, subPath: string): string {
    const folder = tree[folderSlug];
    const parts = subPath.split('/');
    const labels = [folder?.title ?? folderSlug];
    if (parts.length > 1) {
      // Include subfolder name
      const sub = folder?.subfolders[parts[0]];
      if (sub) labels.push(sub.title);
    }
    return labels.join(' / ');
  }

  /** Open a file: expand its sub-shard and inject content. */
  function openFile(folderSlug: string, subPath: string, pushState = true) {
    const file = findFile(folderSlug, subPath);
    if (!file) return;

    // Mark page state
    page.classList.add('file-open');

    // Find the sub-shard element for this file
    const subShard = document.querySelector<HTMLElement>(
      `.sub-shard[data-sub-path="${subPath}"]`
    );
    if (!subShard) return;

    // Deactivate any previously active file
    document.querySelector('.sub-shard.is-active-file')?.classList.remove('is-active-file');
    clearContentPanel();

    // Activate this sub-shard
    subShard.classList.add('is-active-file');

    // Build and inject content
    const content = document.createElement('div');
    content.className = 'novel-content';
    content.innerHTML = `
      <button class="novel-content__back" type="button" aria-label="Back to folder">
        ← back
      </button>
      <div class="novel-content__breadcrumb">${buildBreadcrumb(folderSlug, subPath)}</div>
      <h1 class="novel-content__title">${file.title}</h1>
      <div class="novel-content__dates">
        ${file.created ? `<span>Created ${file.created}</span>` : ''}
        ${file.modified ? `<span>Modified ${file.modified}</span>` : ''}
      </div>
      <div class="novel-content__body"></div>
    `;

    // Set body HTML (trusted content — own Scrivener exports)
    const bodyEl = content.querySelector('.novel-content__body') as HTMLElement;
    bodyEl.innerHTML = file.body;

    subShard.querySelector('.sub-shard__inner')!.appendChild(content);

    // Back button
    content.querySelector('.novel-content__back')!.addEventListener('click', () => {
      closeFile(folderSlug);
    });

    if (pushState) {
      history.pushState(
        { folderSlug, fileSubPath: subPath },
        '',
        `/novel/${folderSlug}/${subPath}`
      );
    }
  }

  /** Close file view and return to folder sub-shards. */
  function closeFile(folderSlug: string, pushState = true) {
    page.classList.remove('file-open');
    document.querySelector('.sub-shard.is-active-file')?.classList.remove('is-active-file');
    clearContentPanel();

    if (pushState) {
      history.pushState({ folderSlug, fileSubPath: null }, '', `/novel/${folderSlug}`);
    }
  }
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Navigate to `http://localhost:4321/novel`. Click a folder, then click a file sub-shard. The sub-shard should expand to fill the screen with the file content (title, dates, markdown body). The back button should return to the folder sub-shard view.

- [ ] **Step 3: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat: novel client JS - file open and content rendering"
```

---

## Task 11: Client JS — URL state and initial load

**Files:**
- Modify: `src/pages/novel/[...slug].astro`

- [ ] **Step 1: Add History API popstate + initial state restoration**

Inside the existing `<script>` block, append at the very end:

```ts
  // ── popstate — browser back/forward ────────────────────────
  window.addEventListener('popstate', (e) => {
    const state = e.state as { folderSlug: string | null; fileSubPath: string | null } | null;

    if (!state || !state.folderSlug) {
      // Return to scatter
      page.classList.remove('folder-selected', 'file-open');
      document.querySelectorAll('.shard').forEach((s) => s.classList.remove('is-active-folder'));
      clearSubShards();
      clearContentPanel();
      currentFolderSlug = null;
      return;
    }

    if (state.fileSubPath) {
      // Restore folder first (no pushState), then file
      if (currentFolderSlug !== state.folderSlug) {
        selectFolder(state.folderSlug, false);
      }
      // Wait one frame for sub-shards to render
      requestAnimationFrame(() => openFile(state.folderSlug!, state.fileSubPath!, false));
    } else {
      selectFolder(state.folderSlug, false);
    }
  });

  // ── Initial state from server-rendered props ────────────────
  // The Astro page sets data-initial-folder and data-initial-subpath
  // to reflect the URL the user landed on directly.
  const initFolder = page.dataset.initialFolder;
  const initSubPath = page.dataset.initialSubpath;

  if (initFolder) {
    // Snap to state without animation on direct URL visit
    page.style.transition = 'none';
    document.querySelectorAll<HTMLElement>('.shard, .sub-shard').forEach((el) => {
      el.style.transition = 'none';
    });

    selectFolder(initFolder, false);

    if (initSubPath) {
      requestAnimationFrame(() => {
        openFile(initFolder, initSubPath, false);
        // Restore transitions after initial snap
        requestAnimationFrame(() => {
          page.style.transition = '';
          document.querySelectorAll<HTMLElement>('.shard, .sub-shard').forEach((el) => {
            el.style.transition = '';
          });
        });
      });
    } else {
      requestAnimationFrame(() => {
        page.style.transition = '';
        document.querySelectorAll<HTMLElement>('.shard, .sub-shard').forEach((el) => {
          el.style.transition = '';
        });
      });
    }

    // Set initial history state so back works from here
    history.replaceState(
      { folderSlug: initFolder, fileSubPath: initSubPath ?? null },
      '',
      window.location.pathname
    );
  } else {
    // /novel root — set initial state
    history.replaceState({ folderSlug: null, fileSubPath: null }, '', '/novel');
  }
```

- [ ] **Step 2: Close the `<script>` tag**

Make sure the `<script>` block ends with `</script>`.

- [ ] **Step 3: Test direct URL access**

```bash
npm run build && npm run preview
```

Navigate directly to `http://localhost:4321/novel/characters/rain` in the browser. Expected: the page loads with the Characters folder active and Rain's content visible — without any transition animation.

Navigate to `http://localhost:4321/novel/characters`. Expected: Characters folder is open, file sub-shards visible.

Click sub-shards and use browser back/forward. Expected: URL updates correctly and state restores.

- [ ] **Step 4: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat: novel client JS - URL state, popstate, and initial load"
```

---

## Task 12: Final build verification

**Files:**
- Verify: `npm run build`

> Note: NavPill is a home/back button, not a section nav. No modification needed.
> The novel page is accessible via `/novel` directly and can be linked from the homepage BentoGrid if desired in a future task.

- [ ] **Step 1: Run full build**

```bash
npm run build 2>&1
```

Expected: build succeeds with zero errors. All novel routes appear in the output.

- [ ] **Step 2: Preview and smoke test**

```bash
npm run preview
```

Manual checklist:
- [ ] `/novel` loads with 5 floating shards
- [ ] Hover on shard produces tilt effect (desktop)
- [ ] Click a folder shard: other shards drift to edges, file sub-shards appear
- [ ] Click a non-active folder shard: switches folder
- [ ] Click a file sub-shard: expands to show content with title, dates, markdown body
- [ ] Back button in content: returns to folder sub-shards
- [ ] Browser back/forward: URL and state stay in sync
- [ ] Direct URL `/novel/characters/rain` loads correctly
- [ ] Mobile (resize to 375px): shards stack vertically, tap interaction works
- [ ] Dark background, gold/blue/orange/red/purple accents per folder
