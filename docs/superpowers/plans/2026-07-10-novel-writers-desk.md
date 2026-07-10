# Novel "Writer's Desk" Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/novel` as a statically-rendered "writer's desk" — desk landing with the latest scene open on paper, folder pages, and focused reading pages (paper for scenes, ink for everything else) — in a gold/black/brown palette.

**Architecture:** The existing client-rendered SPA in `src/pages/novel/[...slug].astro` (JSON blob + innerHTML + pushState) is replaced by three server-rendered view branches (desk / folder / file) in the same route file, navigated with plain links. Two new pure helpers in `src/utils/novel.ts` supply recency and sibling data. `src/styles/novel.css` is rewritten for the new palette; the rain canvas script stays but recolors to sepia and gains a reduced-motion path.

**Tech Stack:** Astro 5 static routes, vanilla CSS custom properties, vitest for pure helpers. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-10-novel-writers-desk-design.md`

---

## Codebase context (read first)

- `src/utils/novel.ts` — `buildNovelTree()` returns `NovelTree = Record<string, NovelFolder>`; `NovelFile` has `slug, title, body (rendered HTML), created, modified, mtime, path (slug segments incl. own slug)`. A private `collectFiles()` already flattens a folder recursively; a private `parseNovelDate()` normalizes sidecar/mtime dates to UTC.
- `src/utils/content.ts` — `stripMarkdown(markdown)` also strips raw HTML tags/entities, so it works on rendered HTML.
- `src/utils/dates.ts` — `formatDate(date: Date): string` (UTC-safe).
- `src/styles/global.css` — P4G utilities `.p4g-tab`, `.p4g-heading`, `.p4g-underline`; tokens `--skew-display/-accent/-rule`, `--cut-sm/-md`, `--color-gold`, `--font-display/-body/-mono`, `--animation-easing`.
- Design invariant: dates shown as facts ("edited …"), never time-since. Copy restraint: no flavor text beyond the "where the pen left off" kicker.
- Every `:hover` rule gets a comma-paired `:focus-visible` twin.
- `clip-path` clips `box-shadow` — hard shadows on cut elements go on a wrapper via `filter: drop-shadow()`.

---

### Task 1: Export `flattenFolderFiles` from novel.ts

The private `collectFiles()` in `src/utils/novel.ts` is exactly the helper the pages need. Rename it and export it.

**Files:**
- Modify: `src/utils/novel.ts:149-154` (the `collectFiles` function) and its call site in `computeNovelStats`
- Test: `src/tests/novel.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/tests/novel.test.ts` (reuse the `file`/`folder` factories already defined inside the `computeNovelStats` describe block by moving them to module scope — see below):

First, move the factories out of the `computeNovelStats` block. Cut these lines from inside `describe('computeNovelStats', …)`:

```ts
  const file = (over: object) => ({
    slug: 'f', title: 'F', body: '<p>one two three</p>',
    created: null, modified: null, mtime: null, path: ['x'], ...over,
  });
  const folder = (slug: string, files: any[], subfolders = {}) =>
    ({ slug, title: slug, files, subfolders });
```

and paste them at module scope, directly above `describe('computeNovelStats', …)`. Then add the new describe block at the end of the file:

```ts
describe('flattenFolderFiles', () => {
  it('returns root files then subfolder files depth-first, in tree order', () => {
    const tree = folder('lore', [file({ slug: 'root-a' })], {
      'magic-system': folder('magic-system', [file({ slug: 'sub-a' }), file({ slug: 'sub-b' })], {
        deeper: folder('deeper', [file({ slug: 'deep-a' })]),
      }),
      plot: folder('plot', [file({ slug: 'plot-a' })]),
    });
    expect(flattenFolderFiles(tree).map((f: any) => f.slug))
      .toEqual(['root-a', 'sub-a', 'sub-b', 'deep-a', 'plot-a']);
  });

  it('returns empty array for empty folder', () => {
    expect(flattenFolderFiles(folder('themes', []))).toEqual([]);
  });
});
```

Update the import line at the top of the test file (do NOT add `findRecentFiles` yet — importing a missing named export fails the whole file under Vite ESM; Task 2 adds it):

```ts
import { slugify, parseMetaData, buildNovelTree, countWords, computeNovelStats, flattenFolderFiles, type NovelTree } from '../utils/novel';
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/novel.test.ts`
Expected: FAIL — `flattenFolderFiles` is not exported (import resolves to undefined / TypeError on call).

- [ ] **Step 3: Rename and export in novel.ts**

In `src/utils/novel.ts`, replace:

```ts
function collectFiles(folder: NovelFolder): NovelFile[] {
  return [
    ...folder.files,
    ...Object.values(folder.subfolders).flatMap(collectFiles),
  ];
}
```

with:

```ts
/** Depth-first flat file list for a folder, in tree order. */
export function flattenFolderFiles(folder: NovelFolder): NovelFile[] {
  return [
    ...folder.files,
    ...Object.values(folder.subfolders).flatMap(flattenFolderFiles),
  ];
}
```

and update the one call site in `computeNovelStats` from `collectFiles(folder)` to `flattenFolderFiles(folder)`.

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/tests/novel.test.ts`
Expected: the two `flattenFolderFiles` tests PASS; the `findRecentFiles` import is still unused so nothing else fails. All pre-existing tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/novel.ts src/tests/novel.test.ts
git commit -m "refactor(novel): export flattenFolderFiles helper"
```

---

### Task 2: Add `findRecentFiles` to novel.ts

Most-recently-modified files across the tree, filtered to scenes or non-scenes. Date precedence matches `computeNovelStats`: sidecar `modified` preferred, `mtime` fallback, unparseable/missing dates excluded.

**Files:**
- Modify: `src/utils/novel.ts` (append after `computeNovelStats`)
- Test: `src/tests/novel.test.ts`

- [ ] **Step 1: Write the failing tests**

Add `findRecentFiles` to the novel.ts import in `src/tests/novel.test.ts`:

```ts
import { slugify, parseMetaData, buildNovelTree, countWords, computeNovelStats, flattenFolderFiles, findRecentFiles, type NovelTree } from '../utils/novel';
```

Then append:

```ts
describe('findRecentFiles', () => {
  const tree: NovelTree = {
    scenes: folder('scenes', [
      file({ slug: 'old-scene', modified: '2026-05-01' }),
      file({ slug: 'new-scene', modified: '2026-07-01' }),
    ]),
    characters: folder('characters', [], {
      rain: folder('rain', [file({ slug: 'rain-doc', modified: null, mtime: '2026-06-20T00:00:00.000Z' })]),
    }),
    lore: folder('lore', [
      file({ slug: 'dated-note', modified: 'June 1, 2026' }),
      file({ slug: 'undated', modified: null, mtime: null }),
      file({ slug: 'bad-date', modified: 'not a date', mtime: null }),
    ]),
  };

  it('returns newest scenes first when scenes=true', () => {
    const result = findRecentFiles(tree, { scenes: true, limit: 2 });
    expect(result.map((f) => f.slug)).toEqual(['new-scene', 'old-scene']);
  });

  it('returns newest non-scene files when scenes=false, using mtime fallback', () => {
    const result = findRecentFiles(tree, { scenes: false, limit: 2 });
    expect(result.map((f) => f.slug)).toEqual(['rain-doc', 'dated-note']);
  });

  it('excludes files without a parseable date and respects limit', () => {
    const result = findRecentFiles(tree, { scenes: false, limit: 10 });
    expect(result.map((f) => f.slug)).toEqual(['rain-doc', 'dated-note']);
  });

  it('returns empty array on empty tree', () => {
    expect(findRecentFiles({}, { scenes: true, limit: 1 })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/novel.test.ts`
Expected: FAIL — `findRecentFiles is not a function`.

- [ ] **Step 3: Implement**

Append to `src/utils/novel.ts`:

```ts
export interface RecentFileOptions {
  /** true → only the top-level `scenes` folder; false → everything else */
  scenes: boolean;
  limit: number;
}

/**
 * Most recently modified files, newest first. Sidecar `Modified:` dates are
 * preferred over filesystem mtime (same precedence as computeNovelStats);
 * files with no parseable date are excluded.
 */
export function findRecentFiles(tree: NovelTree, opts: RecentFileOptions): NovelFile[] {
  const dated: Array<{ file: NovelFile; date: Date }> = [];
  for (const [slug, folder] of Object.entries(tree)) {
    if ((slug === 'scenes') !== opts.scenes) continue;
    for (const file of flattenFolderFiles(folder)) {
      const raw = file.modified ?? file.mtime;
      if (!raw) continue;
      const date = parseNovelDate(raw);
      if (!date) continue;
      dated.push({ file, date });
    }
  }
  dated.sort((a, b) => b.date.getTime() - a.date.getTime());
  return dated.slice(0, opts.limit).map((entry) => entry.file);
}
```

(`parseNovelDate` is already defined above in the same module — stays private.)

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/tests/novel.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/novel.ts src/tests/novel.test.ts
git commit -m "feat(novel): add findRecentFiles helper for desk landing"
```

---

### Task 3: Rewrite the novel route — static desk / folder / file views

Replace the entire contents of `src/pages/novel/[...slug].astro`. The SPA machinery (JSON blob, sidebar/content renderers, pushState/popstate, sidebar collapse, filter tabs) is deleted. The only client script left is the rain canvas, recolored to sepia with a reduced-motion static frame.

URL behavior: `/novel` → desk; `/novel/<top>` → folder page; `/novel/<top>/<…>/<file>` → reading page. Intermediate subfolder-only URLs (e.g. `/novel/characters/rain`) still build — they render the parent top-level folder page so old deep links don't 404.

**Files:**
- Rewrite: `src/pages/novel/[...slug].astro` (full replacement)

- [ ] **Step 1: Replace the file with the new implementation**

```astro
---
import { join } from 'path';
import BaseLayout from '../../layouts/BaseLayout.astro';
import NavPill from '../../components/NavPill.astro';
import {
  buildNovelTree,
  computeNovelStats,
  countWords,
  flattenFolderFiles,
  findRecentFiles,
} from '../../utils/novel';
import type { NovelFile, NovelFolder, NovelTree } from '../../utils/novel';
import { stripMarkdown } from '../../utils/content';
import { formatDate } from '../../utils/dates';

type View = 'desk' | 'folder' | 'file';

interface Props {
  view: View;
  tree: NovelTree;
  topSlug?: string;
  filePath?: string;
}

export async function getStaticPaths() {
  const novelDir = join(process.cwd(), 'src/content/novel');
  const tree = await buildNovelTree(novelDir);

  const paths: Array<{ params: { slug: string | undefined }; props: Props }> = [
    { params: { slug: undefined }, props: { view: 'desk', tree } },
  ];

  function walk(top: NovelFolder, folder: NovelFolder, prefix: string): void {
    // Folder URLs (top-level and intermediate) all render the top-level folder page
    paths.push({ params: { slug: prefix }, props: { view: 'folder', tree, topSlug: top.slug } });
    for (const file of folder.files) {
      paths.push({
        params: { slug: `${prefix}/${file.slug}` },
        props: { view: 'file', tree, topSlug: top.slug, filePath: file.path.join('/') },
      });
    }
    for (const sub of Object.values(folder.subfolders)) {
      walk(top, sub, `${prefix}/${sub.slug}`);
    }
  }
  for (const top of Object.values(tree)) walk(top, top, top.slug);

  return paths;
}

const { view, tree, topSlug, filePath } = Astro.props;

// ── Shared helpers ─────────────────────────────────────────────────────
function editedLabel(f: NovelFile): string {
  if (f.modified) return f.modified;
  if (f.mtime) return formatDate(new Date(f.mtime));
  return '';
}

function fileUrl(f: NovelFile): string {
  return `/novel/${f.path.join('/')}`;
}

function excerptOf(html: string, max = 300): string {
  const text = stripMarkdown(html).replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

function folderHasContent(f: NovelFolder): boolean {
  return flattenFolderFiles(f).length > 0;
}

// ── Desk data ──────────────────────────────────────────────────────────
const stats = view === 'desk' ? computeNovelStats(tree) : null;
const latestScene = view === 'desk' ? (findRecentFiles(tree, { scenes: true, limit: 1 })[0] ?? null) : null;
const recentNotes = view === 'desk' ? findRecentFiles(tree, { scenes: false, limit: 2 }) : [];
const sceneExcerpt = latestScene ? excerptOf(latestScene.body) : '';
const archiveCards = view === 'desk'
  ? Object.values(tree)
      .filter(folderHasContent)
      .map((f) => ({ slug: f.slug, title: f.title, count: flattenFolderFiles(f).length }))
  : [];

// ── Folder / file data ─────────────────────────────────────────────────
const topFolder: NovelFolder | null = topSlug ? (tree[topSlug] ?? null) : null;

interface FolderGroup { title: string | null; files: NovelFile[]; }
const folderGroups: FolderGroup[] = view === 'folder' && topFolder
  ? [
      ...(topFolder.files.length > 0 ? [{ title: null, files: topFolder.files }] : []),
      ...Object.values(topFolder.subfolders)
        .filter(folderHasContent)
        .map((sub) => ({ title: sub.title, files: flattenFolderFiles(sub) })),
    ]
  : [];

let file: NovelFile | null = null;
let prevFile: NovelFile | null = null;
let nextFile: NovelFile | null = null;
let crumbTitles: string[] = [];
if (view === 'file' && topFolder && filePath) {
  const siblings = flattenFolderFiles(topFolder);
  const idx = siblings.findIndex((f) => f.path.join('/') === filePath);
  file = siblings[idx] ?? null;
  prevFile = siblings[idx - 1] ?? null;
  nextFile = siblings[idx + 1] ?? null;
  // Walk folder titles along the file's path (excluding the file's own slug)
  if (file) {
    let cursor: NovelFolder | undefined = topFolder;
    crumbTitles = [topFolder.title];
    for (const seg of file.path.slice(1, -1)) {
      cursor = cursor?.subfolders[seg];
      if (cursor) crumbTitles.push(cursor.title);
    }
  }
}
const isScene = topSlug === 'scenes';

const pageTitle =
  view === 'file' && file ? `${file.title} — Remember Rain`
  : view === 'folder' && topFolder ? `${topFolder.title} — Remember Rain`
  : 'Remember Rain';
---

<BaseLayout
  title={pageTitle}
  description="A novel in progress — a writer's desk of scenes, characters, lore, and themes."
>
  <NavPill backLink={view === 'file' && topFolder ? `/novel/${topFolder.slug}` : view === 'folder' ? '/novel' : undefined}
           backLabel={view === 'file' && topFolder ? topFolder.title : view === 'folder' ? 'Desk' : undefined} />

  <canvas id="bg-canvas" aria-hidden="true"></canvas>

  {view === 'desk' && stats && (
    <main class="novel-page novel-desk">
      <header class="novel-header p3r-animate">
        <div class="novel-header__titles">
          <span class="p4g-tab">novel</span>
          <h1 class="p4g-heading novel-header__title">Remember Rain</h1>
          <span class="p4g-underline"></span>
        </div>
        <p class="novel-header__stats">
          {stats.storyWords.toLocaleString('en-US')} story words · {stats.outlineWords.toLocaleString('en-US')} outline words
        </p>
      </header>

      <div class="desk-layout">
        <section class="desk-main p3r-animate" style="--stagger-delay: 60ms">
          {latestScene ? (
            <a class="desk-sheet-wrap" href={fileUrl(latestScene)}>
              <article class="desk-sheet">
                <div class="desk-sheet__meta">
                  <span class="desk-sheet__kicker">where the pen left off</span>
                  <span class="desk-sheet__count">scene · {countWords(latestScene.body).toLocaleString('en-US')} words</span>
                </div>
                <h2 class="desk-sheet__title">{latestScene.title}</h2>
                <p class="desk-sheet__excerpt">{sceneExcerpt}</p>
                <span class="desk-sheet__cta">keep reading</span>
              </article>
            </a>
          ) : (
            <p class="desk-empty">No scenes yet.</p>
          )}

          {recentNotes.length > 0 && (
            <div class="desk-recent">
              {recentNotes.map((f) => (
                <a class="desk-recent__item" href={fileUrl(f)}>
                  <span class="desk-recent__title">{f.title}</span>
                  <span class="desk-recent__date">edited {editedLabel(f)}</span>
                </a>
              ))}
            </div>
          )}
        </section>

        <aside class="desk-archive p3r-animate" style="--stagger-delay: 120ms" aria-label="Archive">
          <h2 class="desk-archive__kicker">archive</h2>
          {archiveCards.map((card) => (
            <a
              class:list={['desk-archive__card', { 'desk-archive__card--scenes': card.slug === 'scenes' }]}
              href={`/novel/${card.slug}`}
            >
              <span class="desk-archive__title">{card.title}</span>
              <span class="desk-archive__count">{card.count}</span>
            </a>
          ))}
        </aside>
      </div>
    </main>
  )}

  {view === 'folder' && topFolder && (
    <main class="novel-page novel-folder">
      <nav class="novel-crumb p3r-animate" aria-label="Breadcrumb">
        <a href="/novel">desk</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{topFolder.title.toLowerCase()}</span>
      </nav>
      <header class="novel-header p3r-animate" style="--stagger-delay: 40ms">
        <div class="novel-header__titles">
          <span class="p4g-tab">novel</span>
          <h1 class="p4g-heading novel-header__title">{topFolder.title}</h1>
          <span class="p4g-underline"></span>
        </div>
        <p class="novel-header__stats">{flattenFolderFiles(topFolder).length} files</p>
      </header>

      <div class="folder-groups">
        {folderGroups.map((group, gi) => (
          <section class="folder-group p3r-animate" style={`--stagger-delay: ${80 + gi * 50}ms`}>
            {group.title && <h2 class="folder-group__title">{group.title}</h2>}
            <ul class="folder-list">
              {group.files.map((f) => (
                <li>
                  <a class="folder-row" href={fileUrl(f)}>
                    <span class="folder-row__title">{f.title}</span>
                    <span class="folder-row__date">edited {editedLabel(f)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )}

  {view === 'file' && topFolder && file && (
    <main class="novel-page novel-reading">
      <nav class="novel-crumb p3r-animate" aria-label="Breadcrumb">
        <a href="/novel">desk</a>
        <span aria-hidden="true">/</span>
        <a href={`/novel/${topFolder.slug}`}>{crumbTitles.join(' / ').toLowerCase()}</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{file.title.toLowerCase()}</span>
      </nav>

      <div class:list={['reading-sheet-wrap', { 'reading-sheet-wrap--paper': isScene }]}>
        <article class:list={['reading', isScene ? 'reading--paper' : 'reading--ink']}>
          <div class="reading__meta">
            <span>{topFolder.title}</span>
            {editedLabel(file) && <span>edited {editedLabel(file)}</span>}
          </div>
          <h1 class="reading__title">{file.title}</h1>
          <div class="reading__rule" aria-hidden="true"></div>
          <div class="reading__body" set:html={file.body} />
        </article>
      </div>

      {(prevFile || nextFile) && (
        <nav class="page-turn" aria-label="Adjacent files">
          {prevFile ? (
            <a class="page-turn__link page-turn__link--prev" href={fileUrl(prevFile)}>
              <span class="page-turn__dir">← previous</span>
              <span class="page-turn__name">{prevFile.title}</span>
            </a>
          ) : <span></span>}
          {nextFile && (
            <a class="page-turn__link page-turn__link--next" href={fileUrl(nextFile)}>
              <span class="page-turn__dir">next →</span>
              <span class="page-turn__name">{nextFile.title}</span>
            </a>
          )}
        </nav>
      )}
    </main>
  )}
</BaseLayout>

<script>
  // Sepia rain canvas — "rain through a lamplit window".
  // Static single frame under prefers-reduced-motion.
  function initCanvas() {
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0;

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
      if (reduced) drawScene(false);
    }

    const towers = Array.from({ length: 16 }, (_, i) => ({
      x: (i / 15) * 1.1 - 0.05,
      height: 0.2 + Math.random() * 0.4,
      width: 0.4 + Math.random() * 1.8,
      opacity: 0.03 + Math.random() * 0.04,
    }));
    const struts = Array.from({ length: 5 }, () => ({
      y: 0.45 + Math.random() * 0.45,
      opacity: 0.02 + Math.random() * 0.015,
    }));
    const drops = Array.from({ length: 110 }, () => ({
      x: Math.random(), y: Math.random(),
      speed: (1.8 + Math.random() * 2.2) / 800,
      len: (7 + Math.random() * 16) / 800,
      opacity: 0.06 + Math.random() * 0.14,
      lean: -0.035 + Math.random() * 0.02,
    }));

    function drawScene(withDrops: boolean) {
      ctx.clearRect(0, 0, w, h);
      const grd = ctx.createRadialGradient(w * 0.5, h * 0.92, 0, w * 0.5, h * 0.65, h * 0.7);
      grd.addColorStop(0, 'rgba(190,125,40,0.09)');
      grd.addColorStop(0.5, 'rgba(130,85,25,0.045)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      towers.forEach((t) => {
        ctx.fillStyle = `rgba(150,115,70,${t.opacity})`;
        ctx.fillRect(t.x * w - t.width / 2, h - t.height * h, t.width, t.height * h);
      });
      struts.forEach((s) => {
        ctx.strokeStyle = `rgba(150,115,70,${s.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, s.y * h); ctx.lineTo(w, s.y * h); ctx.stroke();
      });
      if (!withDrops) return;
      drops.forEach((d) => {
        const px = d.x * w, py = d.y * h, plen = d.len * h;
        ctx.strokeStyle = `rgba(215,175,110,${d.opacity})`;
        ctx.lineWidth = 0.55;
        ctx.beginPath(); ctx.moveTo(px, py);
        ctx.lineTo(px + Math.sin(d.lean) * plen, py + plen); ctx.stroke();
        d.y += d.speed;
        if (d.y > 1) { d.y = -d.len; d.x = Math.random(); }
      });
    }

    resize();
    window.addEventListener('resize', resize);

    let rafId = 0;
    if (reduced) {
      drawScene(false);
    } else {
      const loop = () => { drawScene(true); rafId = requestAnimationFrame(loop); };
      rafId = requestAnimationFrame(loop);
    }

    document.addEventListener('astro:before-swap', () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    }, { once: true });
  }

  document.addEventListener('astro:page-load', initCanvas);
</script>

<style is:global>
  @import '../../styles/novel.css';
</style>
```

Note for the implementer: check `src/components/NavPill.astro`'s props — it accepts optional `backLink`/`backLabel` (per CLAUDE.md). If the prop names differ, match the component; if passing `undefined` renders an empty back link, conditionally spread the props instead:
`<NavPill {...(view !== 'desk' ? { backLink, backLabel } : {})} />` with `backLink`/`backLabel` computed in frontmatter.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds. Spot-check output exists:

```bash
ls dist/novel/index.html dist/novel/scenes/index.html dist/novel/characters/rain/index.html
grep -l "where the pen left off" dist/novel/index.html
grep -c "reading--paper" dist/novel/scenes/*/index.html | head -3
```

Expected: files exist; desk page contains the kicker; scene file pages use the paper class.

- [ ] **Step 3: Run the full test suite**

Run: `npm run test -- --run`
Expected: all PASS (route change touches no tested module).

- [ ] **Step 4: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat(novel): static desk/folder/reading views replace client SPA"
```

---

### Task 4: Rewrite novel.css — writer's desk palette and views

Full replacement of `src/styles/novel.css`. Keeps the two NavPill-clearance conventions (bottom padding) and adds `:focus-visible` parity everywhere.

**Files:**
- Rewrite: `src/styles/novel.css` (full replacement)

- [ ] **Step 1: Replace the file**

```css
/* ============================================================
   Novel Page — Remember Rain: The Writer's Desk
   Static views: desk landing / folder page / reading page
   Palette: gold + black + brown; paper for scenes, ink for the rest
   ============================================================ */

.novel-page {
  /* Palette tokens (spec: 2026-07-10-novel-writers-desk-design.md) */
  --novel-bg: #141110;
  --novel-panel: #241c12;
  --novel-panel-deep: #1c1712;
  --novel-border: #4a3a24;
  --novel-border-strong: #5a4632;
  --novel-paper: #e8dcc3;
  --novel-paper-ink: #2c2216;
  --novel-paper-text: #3c3020;
  --novel-paper-rule: #c4b494;
  --novel-parchment: #d8cbb0;
  --novel-warm-muted: #a8905f;
  --novel-warm-dim: #8a7355;
  --novel-warm-faint: #6b5a42;
}

/* ══ Background ══ */
#bg-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* ══ Page frame — normal document flow ══ */
.novel-page {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 2.5rem;
  /* Clear the fixed NavPill (bottom-left) */
  padding-bottom: 120px;
  box-sizing: border-box;
  min-height: 100vh;
}

/* ══ Header (desk + folder pages) ══ */
.novel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.75rem;
}
.novel-header__titles {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.novel-header__title {
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  color: #efe6d0;
  margin: 0;
}
.novel-header__stats {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: var(--novel-warm-muted);
  margin: 0 0 4px;
}

/* ══ Breadcrumb ══ */
.novel-crumb {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--novel-warm-dim);
  display: flex;
  gap: 8px;
  margin-bottom: 1.25rem;
}
.novel-crumb a {
  color: var(--novel-warm-muted);
  text-decoration: none;
  transition: color 150ms ease;
}
.novel-crumb a:hover,
.novel-crumb a:focus-visible { color: var(--color-gold); }
.novel-crumb [aria-current="page"] { color: var(--novel-warm-faint); }

/* ══ Desk layout ══ */
.desk-layout {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.25rem;
  align-items: start;
}

/* The open sheet — paper panel, corner cut, hard brown shadow.
   clip-path clips box-shadow → shadow lives on the wrapper via drop-shadow. */
.desk-sheet-wrap {
  display: block;
  text-decoration: none;
  filter: drop-shadow(5px 5px 0 rgba(58, 44, 30, 0.9));
  transition: filter 200ms var(--animation-easing), transform 200ms var(--animation-easing);
}
.desk-sheet-wrap:hover,
.desk-sheet-wrap:focus-visible {
  filter: drop-shadow(5px 5px 0 rgba(255, 229, 44, 0.35));
  transform: translate(-2px, -2px);
}
.desk-sheet {
  background: var(--novel-paper);
  padding: 1.5rem 1.75rem;
  clip-path: polygon(0 0, calc(100% - var(--cut-md)) 0, 100% var(--cut-md), 100% 100%, 0 100%);
}
.desk-sheet__meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
}
.desk-sheet__kicker,
.desk-sheet__count {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--novel-warm-dim);
}
.desk-sheet__title {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 2.4vw, 1.6rem);
  color: var(--novel-paper-ink);
  margin: 0 0 0.6rem;
  line-height: 1.1;
}
.desk-sheet__excerpt {
  font-family: var(--font-body);
  font-size: 0.92rem;
  line-height: 1.75;
  color: var(--novel-paper-text);
  margin: 0 0 1rem;
}
.desk-sheet__cta {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: var(--novel-paper-ink);
  color: var(--novel-paper);
  padding: 5px 14px;
  transform: skewX(var(--skew-accent));
}

.desk-empty {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--novel-warm-dim);
}

/* Recent non-scene files below the sheet */
.desk-recent {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}
.desk-recent__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--novel-panel-deep);
  border: 1px solid var(--novel-border);
  padding: 8px 12px;
  text-decoration: none;
  min-height: 44px;
  justify-content: center;
  transition: border-color 150ms ease, background 150ms ease;
}
.desk-recent__item:hover,
.desk-recent__item:focus-visible {
  border-color: var(--color-gold);
  background: var(--novel-panel);
}
.desk-recent__title {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: var(--novel-parchment);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.desk-recent__date {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: var(--novel-warm-dim);
}

/* ══ Archive cards ══ */
.desk-archive {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.desk-archive__kicker {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 400;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--novel-warm-dim);
  margin: 0 0 2px;
}
.desk-archive__card {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  background: var(--novel-panel);
  border: 1px solid var(--novel-border);
  padding: 12px 14px;
  min-height: 44px;
  box-sizing: border-box;
  text-decoration: none;
  clip-path: polygon(0 0, calc(100% - var(--cut-sm)) 0, 100% var(--cut-sm), 100% 100%, 0 100%);
  transition: border-color 150ms ease, background 150ms ease;
}
.desk-archive__card:hover,
.desk-archive__card:focus-visible {
  border-color: var(--color-gold);
  background: var(--novel-panel-deep);
}
.desk-archive__title {
  font-family: var(--font-display);
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--novel-parchment);
}
.desk-archive__count {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--novel-warm-dim);
}
.desk-archive__card--scenes {
  border-color: var(--novel-border-strong);
}
.desk-archive__card--scenes .desk-archive__title {
  color: var(--color-gold);
}

/* ══ Folder page ══ */
.folder-groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 720px;
}
.folder-group__title {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--novel-warm-muted);
  margin: 0 0 8px;
}
.folder-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.folder-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  background: var(--novel-panel-deep);
  border-left: 3px solid var(--novel-border);
  padding: 10px 14px;
  min-height: 44px;
  box-sizing: border-box;
  text-decoration: none;
  transition: border-color 150ms ease, background 150ms ease;
}
.folder-row:hover,
.folder-row:focus-visible {
  border-left-color: var(--color-gold);
  background: var(--novel-panel);
}
.folder-row__title {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--novel-parchment);
}
.folder-row__date {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--novel-warm-dim);
  white-space: nowrap;
}

/* ══ Reading page ══ */
.novel-reading {
  max-width: 860px;
}
.reading-sheet-wrap--paper {
  filter: drop-shadow(6px 6px 0 rgba(58, 44, 30, 0.9));
}
.reading {
  padding: 2rem 2.25rem;
}
.reading--paper {
  background: var(--novel-paper);
  clip-path: polygon(0 0, calc(100% - var(--cut-md)) 0, 100% var(--cut-md), 100% 100%, 0 100%);
}
.reading--ink {
  background: rgba(26, 22, 16, 0.82);
  border: 1px solid var(--novel-border);
  border-top: 2px solid var(--color-gold);
}

.reading__meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 0.6rem;
}
.reading--paper .reading__meta { color: var(--novel-warm-dim); }
.reading--ink .reading__meta { color: var(--novel-warm-muted); }

.reading__title {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2.1rem);
  line-height: 1.1;
  margin: 0 0 0.75rem;
}
.reading--paper .reading__title { color: var(--novel-paper-ink); }
.reading--ink .reading__title { color: var(--color-gold); }

.reading__rule {
  height: 1px;
  margin-bottom: 1.5rem;
}
.reading--paper .reading__rule { background: var(--novel-paper-rule); }
.reading--ink .reading__rule {
  background: linear-gradient(to right, var(--novel-border-strong), transparent);
}

/* Prose — shared metrics, per-treatment colors */
.reading__body {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.85;
  max-width: 65ch;
}
.reading--paper .reading__body { color: var(--novel-paper-text); }
.reading--ink .reading__body { color: var(--novel-parchment); }

.reading__body p { margin: 0 0 1.25em; }
.reading--paper .reading__body strong { color: var(--novel-paper-ink); }
.reading--ink .reading__body strong { color: #efe6d0; }
.reading--paper .reading__body em { color: var(--novel-paper-text); }
.reading--ink .reading__body em { color: var(--novel-warm-muted); }

.reading__body h2,
.reading__body h3 {
  font-family: var(--font-display);
  font-size: 1.05rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 2em 0 0.75em;
}
.reading--paper .reading__body h2,
.reading--paper .reading__body h3 { color: var(--novel-paper-ink); }
.reading--ink .reading__body h2,
.reading--ink .reading__body h3 { color: var(--novel-warm-muted); }

.reading__body ul,
.reading__body ol { padding-left: 1.5em; margin: 0 0 1.25em; }
.reading__body li { margin-bottom: 0.4em; }
.reading__body img { max-width: 100%; display: block; margin: 1.5em 0; }
.reading__body a { color: inherit; text-decoration: underline; }

.reading__body table {
  display: block;
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  margin: 0 0 1.5em;
  font-size: 0.85rem;
  white-space: nowrap;
}
.reading__body th,
.reading__body td {
  padding: 8px 14px;
  text-align: left;
  vertical-align: top;
}
.reading--paper .reading__body th,
.reading--paper .reading__body td { border: 1px solid var(--novel-paper-rule); }
.reading--ink .reading__body th,
.reading--ink .reading__body td { border: 1px solid var(--novel-border); }
.reading__body th {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
}
.reading--paper .reading__body th { color: var(--novel-paper-ink); background: rgba(58, 44, 30, 0.08); }
.reading--ink .reading__body th { color: var(--novel-warm-muted); background: rgba(90, 70, 50, 0.15); }
.reading--paper .reading__body tbody tr:nth-child(even) td { background: rgba(58, 44, 30, 0.05); }
.reading--ink .reading__body tbody tr:nth-child(even) td { background: rgba(255, 255, 255, 0.02); }

/* ══ Page-turn nav ══ */
.page-turn {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  max-width: 860px;
}
.page-turn__link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-decoration: none;
  padding: 10px 14px;
  min-height: 44px;
  box-sizing: border-box;
  border: 1px solid var(--novel-border);
  background: var(--novel-panel-deep);
  max-width: 46%;
  transition: border-color 150ms ease, background 150ms ease;
}
.page-turn__link--next { text-align: right; align-items: flex-end; }
.page-turn__link:hover,
.page-turn__link:focus-visible {
  border-color: var(--color-gold);
  background: var(--novel-panel);
}
.page-turn__dir {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--novel-warm-dim);
}
.page-turn__name {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: var(--novel-parchment);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* ══ Reduced motion ══ */
@media (prefers-reduced-motion: reduce) {
  .desk-sheet-wrap,
  .desk-recent__item,
  .desk-archive__card,
  .folder-row,
  .page-turn__link,
  .novel-crumb a { transition: none; }
  .desk-sheet-wrap:hover,
  .desk-sheet-wrap:focus-visible { transform: none; }
}

/* ══ Mobile ══ */
@media (max-width: 768px) {
  .novel-page { padding: 1.5rem 1.25rem 120px; }

  .desk-layout { grid-template-columns: 1fr; }
  .desk-recent { grid-template-columns: 1fr; }

  .novel-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }

  .folder-row { flex-direction: column; align-items: flex-start; gap: 2px; }

  .reading { padding: 1.5rem 1.25rem; }

  .page-turn { flex-direction: column; }
  .page-turn__link { max-width: 100%; }
  .page-turn__link--next { align-items: flex-start; text-align: left; }
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: build succeeds (CSS is imported by the route from Task 3).

- [ ] **Step 3: Commit**

```bash
git add src/styles/novel.css
git commit -m "feat(novel): writer's desk palette and view styles"
```

---

### Task 5: Browser verification

Verify all three views render and navigate correctly in the dev server. Use the preview tools (or `npm run dev` + manual check if unavailable).

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server and load `/novel`**

Verify on the desk landing:
- Gold NOVEL tab, "Remember Rain" heading, skewed gold underline, story/outline word counts.
- Cream paper sheet with "where the pen left off", a scene title, real prose excerpt, "keep reading" chip.
- Two recent non-scene rows with "edited …" dates.
- Five archive cards with counts; Scenes card gold-titled.
- Sepia rain canvas animating behind (warm tones, no blue).

- [ ] **Step 2: Click through the flows**

- Archive card → `/novel/characters` folder page: breadcrumb "desk / characters", subfolder groups (Rain, Claire, …), rows with dates.
- Folder row → reading page: **ink** treatment (dark panel, gold title, parchment prose), breadcrumb, prev/next page-turn links.
- From the desk, "keep reading" → scene reading page: **paper** treatment (cream sheet, dark ink prose, brown drop shadow).
- A character doc with a markdown table (e.g. `/novel/characters/rain/rain-layer-table`): table readable in ink treatment.
- Browser back/forward works (real navigations now).
- Legacy subfolder URL `/novel/characters/rain` renders the Characters folder page (no 404).

- [ ] **Step 3: Responsive + reduced motion**

- Resize to 375px: desk stacks (sheet → recent → archive), folder rows stack, page-turn stacks.
- Emulate `prefers-reduced-motion: reduce`: canvas shows a static skyline frame (no falling drops), hover transforms disabled.

- [ ] **Step 4: Console check**

No console errors on any of the three views. The old SPA globals (`novel-tree` JSON element, `filter-tab`, `sidebar-file`) should not appear anywhere in served HTML:

```bash
grep -rL "novel-tree" dist/novel/index.html && grep -c "filter-tab" dist/novel/index.html
```

Expected: no `novel-tree` script id; `filter-tab` count 0.

- [ ] **Step 5: Fix anything found, then commit fixes (if any)**

```bash
git add -A src/
git commit -m "fix(novel): verification fixes for writer's desk views"
```

(Skip the commit if nothing needed fixing.)

---

### Task 6: Update CLAUDE.md and finish

**Files:**
- Modify: `CLAUDE.md` (Novel System section, Layouts table mention, novel.css description)

- [ ] **Step 1: Update CLAUDE.md**

In the **CSS Files** list, change the `novel.css` line to:

```markdown
- `novel.css` — Novel writer's-desk UI (gold/black/brown; desk landing, folder pages, paper/ink reading pages, sepia rain canvas)
```

In the **Novel System ("Remember Rain")** section, replace the `**Routing**` and `**UI**` bullets with:

```markdown
- **Routing**: `src/pages/novel/[...slug].astro` renders three static views from `getStaticPaths()`: `/novel` (desk landing: latest scene as a cream paper sheet with excerpt, 2 recent non-scene files, archive folder cards), `/novel/[folder]` (file list grouped by subfolder), `/novel/[folder]/.../[file]` (focused reading page — paper treatment for Scenes, ink for everything else, prev/next page-turn links in tree order). Intermediate subfolder URLs render the parent folder page. No client-side rendering — plain links + view transitions; the only script is the sepia rain canvas (static frame under reduced motion).
- **UI**: "Writer's desk" — gold/black/brown palette (`--novel-*` tokens in `novel.css`), P4G header pattern, dates always shown as facts ("edited …", never time-since — no-shame invariant). Story vs. outline split is visual: Scenes render on paper, outline docs in ink.
```

In the **Utility Modules** table, update the novel.ts row exports to include the new helpers:

```markdown
| `src/utils/novel.ts` | `buildNovelTree()`, `slugify()`, `parseMetaData()`, `countWords()`, `computeNovelStats()`, `flattenFolderFiles()`, `findRecentFiles()` | Scrivener-backed novel content loader + rain-gauge stats + desk recency helpers |
```

- [ ] **Step 2: Final full verification**

```bash
npm run test -- --run && npm run build
```

Expected: all tests pass, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for novel writer's desk redesign"
```
