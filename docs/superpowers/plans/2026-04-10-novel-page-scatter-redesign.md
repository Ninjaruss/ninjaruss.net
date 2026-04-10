# Novel Page Scatter Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-panel novel navigator with a full-viewport freeform scatter canvas, category filter tabs, and a shard-expand-to-fullscreen reading animation.

**Architecture:** All changes are confined to two files — `src/pages/novel/[...slug].astro` (HTML structure + client JS) and `src/styles/novel.css` (styles). The existing rain canvas, title block, reading overlay HTML, novel tree data, and History API URL scheme are preserved. The navigator grid and folder cluster HTML are replaced with a `.filter-tabs` row and a `.scatter-canvas` div populated entirely by client JS.

**Tech Stack:** Astro 5, vanilla TypeScript (client `<script>`), vanilla CSS, VanillaTilt (already installed)

---

## File Map

| File | What changes |
|---|---|
| `src/pages/novel/[...slug].astro` | Remove `.navigator` / `.folder-list` / `.shard-panel` HTML. Add `.filter-tabs` + `.scatter-canvas`. Rewrite all client JS (hash helper, scatter render, tab handler, switch animation, expand/close animation, init/popstate). |
| `src/styles/novel.css` | Remove `.navigator`, `.folder-list`, `.folder-cluster`, `.cluster-*`, `.shard-panel`, `.shard-panel-*` styles. Update `.novel-page` to flex column. Add `.filter-tabs`, `.filter-tab`, `.tab-count`, `.scatter-canvas` styles. Update `.reading-overlay` to clip-path-based reveal. Update `@media` blocks. |
| `src/tests/novel.test.ts` | Add unit test for new `hashSlug` helper. |

---

## Task 1: Restructure HTML

**Files:**
- Modify: `src/pages/novel/[...slug].astro:52–119` (the `<main>` block)

Replace the two-panel navigator with filter tabs + scatter canvas. Reading overlay and script tags are **unchanged**.

- [ ] **Step 1: Replace the `<main>` block**

In `src/pages/novel/[...slug].astro`, replace lines 52–119 (from `<BaseLayout` through `</main>`) with:

```astro
<BaseLayout
  title="Remember Rain"
  description="A novel in progress — characters, lore, locations, and themes."
>
  <NavPill />

  <canvas id="bg-canvas" aria-hidden="true"></canvas>

  <main
    class="novel-page"
    data-initial-folder={initialFolder}
    data-initial-subpath={initialSubPath}
  >
    <!-- Title block: Rain's afterimage motif -->
    <div class="title-block">
      <div class="title-text-group">
        <span class="title-main">Remember Rain</span>
        <span class="waterline" aria-hidden="true"></span>
        <span class="title-reflection" aria-hidden="true">Remember Rain</span>
      </div>
      <span class="title-eyebrow">a novel in progress · memory shards</span>
    </div>

    <!-- Category filter tabs -->
    <div class="filter-tabs" id="filter-tabs">
      {Object.values(novelTree).map((folder) => {
        function countFiles(f: typeof folder): number {
          return f.files.length + Object.values(f.subfolders).reduce((n, s) => n + countFiles(s), 0);
        }
        const count = countFiles(folder);
        return (
          <button
            class="filter-tab"
            data-folder={folder.slug}
            type="button"
            aria-pressed="false"
          >
            {folder.title}
            {count > 0 && <span class="tab-count">{count}</span>}
          </button>
        );
      })}
    </div>

    <!-- Scatter canvas: populated entirely by JS -->
    <div class="scatter-canvas" id="scatter-canvas"></div>
  </main>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: no TypeScript or Astro errors. (JS errors from the stale client script are expected — we rewrite it in later tasks.)

- [ ] **Step 3: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat(novel): replace navigator with filter-tabs + scatter-canvas HTML"
```

---

## Task 2: CSS — Layout + Filter Tabs

**Files:**
- Modify: `src/styles/novel.css`

Update `.novel-page` to a flex column, remove the `.navigator` grid rule, and add filter tab styles.

- [ ] **Step 1: Update `.novel-page` to flex column**

Replace the existing `.novel-page` rule:

```css
.novel-page {
  position: relative;
  z-index: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 3rem 4rem;
  gap: 0.75rem;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
```

- [ ] **Step 2: Remove the `.navigator` rule**

Delete this block from `novel.css`:

```css
/* ══ Two-panel navigator — fills remaining height ══ */
.navigator {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 4px;
  min-height: 0;
  overflow: hidden;
}
```

- [ ] **Step 3: Add filter tab styles**

Add after the `.title-reflection` rule:

```css
/* ══ Category filter tabs ══ */
.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
  padding-bottom: 0.25rem;
}

.filter-tab {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 5px 12px;
  border: 1px solid rgba(var(--tab-accent-rgb, 80,120,200), 0.25);
  background: rgba(var(--tab-accent-rgb, 80,120,200), 0.04);
  color: rgba(var(--tab-accent-rgb, 80,120,200), 0.45);
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
  cursor: pointer;
  transition: border-color 180ms ease, color 180ms ease, background 180ms ease, box-shadow 180ms ease;
  user-select: none;
}

.filter-tab[data-folder="characters"] { --tab-accent-rgb: 255,229,44; }
.filter-tab[data-folder="locations"]  { --tab-accent-rgb: 122,184,255; }
.filter-tab[data-folder="lore"]       { --tab-accent-rgb: 255,136,34; }
.filter-tab[data-folder="scenes"]     { --tab-accent-rgb: 255,102,102; }
.filter-tab[data-folder="themes"]     { --tab-accent-rgb: 170,170,255; }

.filter-tab:hover {
  border-color: rgba(var(--tab-accent-rgb, 80,120,200), 0.6);
  color: rgba(var(--tab-accent-rgb, 80,120,200), 0.8);
  background: rgba(var(--tab-accent-rgb, 80,120,200), 0.07);
}

.filter-tab.is-active {
  border-color: rgba(var(--tab-accent-rgb, 80,120,200), 0.85);
  color: rgba(var(--tab-accent-rgb, 80,120,200), 1);
  background: rgba(var(--tab-accent-rgb, 80,120,200), 0.1);
  box-shadow: 0 0 14px rgba(var(--tab-accent-rgb, 80,120,200), 0.12);
}

.tab-count {
  font-size: 0.55rem;
  opacity: 0.65;
  margin-left: 5px;
}
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build 2>&1 | tail -10
```

Expected: no CSS errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/novel.css
git commit -m "feat(novel): update layout to flex column, add filter tab styles"
```

---

## Task 3: CSS — Scatter Canvas, Reading Overlay, Mobile

**Files:**
- Modify: `src/styles/novel.css`

Remove all the old folder/shard-panel styles, add scatter canvas styles, update reading overlay for clip-path animation, update mobile breakpoint.

- [ ] **Step 1: Remove old folder + shard panel CSS blocks**

Delete these entire rule blocks from `novel.css`:

- `.folder-list { ... }`
- `.folder-cluster { ... }`
- `.cluster-face { ... }`
- `.cluster-face::before { ... }`
- `.cluster-face::after { ... }`
- `.cluster-name { ... }`
- `.cluster-meta { ... }`
- `[data-folder="characters"] { ... }` through `[data-folder="themes"] { ... }` (the 5 accent rules)
- `.folder-cluster .cluster-name { ... }`
- `.folder-cluster .cluster-face { ... }`
- `.folder-cluster:not(.empty):hover .cluster-face { ... }`
- `.folder-cluster:not(.empty):hover .cluster-face::before { ... }`
- `.folder-cluster:not(.empty):hover .cluster-meta { ... }`
- `.folder-cluster.is-open .cluster-face { ... }`
- `.folder-cluster.is-open .cluster-face::before { ... }`
- `.folder-cluster.is-open .cluster-meta { ... }`
- `.folder-cluster.empty { ... }`
- `.folder-cluster.empty .cluster-name { ... }`
- `.folder-cluster.empty .cluster-meta { ... }`
- `.folder-list.has-open .folder-cluster:not(.is-open):not(.empty) .cluster-face { ... }`
- `.shard-panel { ... }`
- `.shard-panel.is-visible { ... }`
- `.shard-panel-header { ... }`
- `.shard-panel-header::before { ... }`
- `.shard-panel-name { ... }`
- `.shard-panel-count { ... }`
- `.shard-panel-list { ... }`
- `.shard-panel-list::-webkit-scrollbar { ... }`
- `.shard-panel-list::-webkit-scrollbar-thumb { ... }`
- `.shard-subfolder-label { ... }`
- `.shard-subfolder-label::before { ... }`
- `.shard-subfolder-label::after { ... }`

- [ ] **Step 2: Add scatter canvas styles**

Add after the filter tab block:

```css
/* ══ Scatter canvas — full remaining viewport ══ */
.scatter-canvas {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Shards are absolutely positioned within the scatter canvas */
.scatter-canvas .memory-shard {
  position: absolute;
  width: 110px;
}
```

- [ ] **Step 3: Remove the CSS `animation` from `.memory-shard`**

The existing `.memory-shard` rule has `animation: shard-in 320ms ...`. Remove that line (JS now drives entrance animation). Keep all other `.memory-shard` properties.

Find and delete from `.memory-shard`:
```css
  animation: shard-in 320ms cubic-bezier(0.16,1,0.3,1) backwards;
  animation-delay: calc(var(--shard-i, 0) * 40ms);
```

- [ ] **Step 4: Update `.reading-overlay` for clip-path reveal**

Replace the existing `.reading-overlay` and `.reading-overlay.is-open` rules:

```css
/* ══ Full-screen reading overlay — clip-path expand animation ══ */
.reading-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: stretch;
  pointer-events: none;
  /* clip-path set by JS to animate expand from shard rect */
}

.reading-overlay.is-open {
  pointer-events: auto;
}
```

- [ ] **Step 5: Update `@media (prefers-reduced-motion)` block**

Replace the existing reduced-motion block with:

```css
@media (prefers-reduced-motion: reduce) {
  /* Reduced motion: reading overlay falls back to opacity fade */
  .reading-overlay {
    opacity: 0;
    transition: opacity 200ms ease;
    clip-path: none !important;
  }
  .reading-overlay.is-open {
    opacity: 1;
  }

  .filter-tab,
  .memory-shard,
  .memory-shard::after {
    transition: none;
    animation: none;
  }
}
```

- [ ] **Step 6: Update `@media (max-width: 768px)` block**

Replace the existing mobile breakpoint:

```css
@media (max-width: 768px) {
  .novel-page {
    padding: 1.5rem;
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .filter-tabs {
    gap: 4px;
  }

  .filter-tab {
    font-size: 0.58rem;
    padding: 4px 8px;
  }

  /* On mobile: scatter canvas becomes a two-column grid instead of freeform absolute */
  .scatter-canvas {
    overflow: visible;
    flex: none;
    height: auto;
  }

  .scatter-canvas .memory-shard {
    position: static;
    rotate: none !important;
    width: auto;
  }

  /* Two-column grid layout for mobile shards */
  #scatter-canvas {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0.25rem 0;
  }

  .reading-inner {
    flex-direction: column;
    gap: 1.5rem;
  }

  .reading-images {
    width: 100%;
  }
}
```

- [ ] **Step 7: Verify build passes**

```bash
npm run build 2>&1 | tail -10
```

Expected: clean build (JS errors still expected from stale client script).

- [ ] **Step 8: Commit**

```bash
git add src/styles/novel.css
git commit -m "feat(novel): scatter canvas CSS, remove old panel styles, clip-path overlay"
```

---

## Task 4: JS — Hash Helper, Scatter Render, Hotspot

**Files:**
- Modify: `src/pages/novel/[...slug].astro` (client `<script>`)
- Modify: `src/tests/novel.test.ts`

Replace the entire client `<script>` with a fresh implementation. Start with the pure helpers and the `renderScatter` function.

- [ ] **Step 1: Write a unit test for `hashSlug`**

Open `src/tests/novel.test.ts` and add at the end:

```typescript
// hashSlug — deterministic hash used for scatter positioning
describe('hashSlug', () => {
  // Inline the same algorithm used in the client script
  function hashSlug(slug: string): number {
    let h = 0;
    for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
    return h;
  }

  it('returns a non-negative integer', () => {
    expect(hashSlug('rain')).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(hashSlug('rain'))).toBe(true);
  });

  it('is deterministic', () => {
    expect(hashSlug('vesper')).toBe(hashSlug('vesper'));
  });

  it('produces different values for different slugs', () => {
    expect(hashSlug('rain')).not.toBe(hashSlug('vesper'));
  });

  it('handles empty string without throwing', () => {
    expect(() => hashSlug('')).not.toThrow();
    expect(hashSlug('')).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests — all must pass**

```bash
npm run test
```

Expected: all existing tests pass + 4 new hashSlug tests pass.

- [ ] **Step 3: Replace the entire client `<script>` with the new implementation (Part 1 — types, constants, pure helpers)**

Replace everything inside the `<script>` tag in `[...slug].astro` with:

```typescript
import VanillaTilt from 'vanilla-tilt';

// ── Types ────────────────────────────────────────────────────────────
interface NovelFile {
  slug: string; title: string; body: string;
  created: string | null; modified: string | null; path: string[];
}
interface NovelFolder {
  slug: string; title: string;
  files: NovelFile[]; subfolders: Record<string, NovelFolder>;
}
type NovelTree = Record<string, NovelFolder>;
interface ShardEntry { file: NovelFile; breadcrumb: string; subPath: string; }
interface ShardGroup { label: string | null; entries: ShardEntry[]; }

// ── Constants ────────────────────────────────────────────────────────
const ACCENT_MAP: Record<string, string> = {
  characters: '255,229,44',
  locations:  '122,184,255',
  lore:       '255,136,34',
  scenes:     '255,102,102',
  themes:     '170,170,255',
};

const SHARD_SHAPES: string[] = [
  'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
  'polygon(8px 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%, 0 8px)',
  'polygon(14px 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%, 0 14px)',
  'polygon(0 10px, calc(100% - 2px) 0, 100% calc(100% - 10px), 2px 100%)',
  'polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 0 100%)',
  'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px))',
  'polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
  'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 12px 100%, 0 calc(100% - 12px))',
];

// ── Pure helpers ─────────────────────────────────────────────────────

/** djb2-style hash — same algorithm as the old shapeIndex but returns raw hash */
function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

function shapeIndex(slug: string, count: number): number {
  return hashSlug(slug) % count;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getGroupedFiles(folder: NovelFolder): ShardGroup[] {
  const groups: ShardGroup[] = [];
  if (folder.files.length > 0) {
    groups.push({
      label: null,
      entries: folder.files.map((file) => ({ file, breadcrumb: folder.title, subPath: file.slug })),
    });
  }
  for (const sub of Object.values(folder.subfolders)) {
    const entries: ShardEntry[] = [];
    function collect(s: NovelFolder, parentBc: string) {
      for (const file of s.files) {
        entries.push({ file, breadcrumb: `${parentBc} / ${s.title}`, subPath: file.path.slice(1).join('/') });
      }
      for (const nested of Object.values(s.subfolders)) collect(nested, `${parentBc} / ${s.title}`);
    }
    collect(sub, folder.title);
    if (entries.length > 0) groups.push({ label: sub.title, entries });
  }
  return groups;
}

function formatDate(created: string | null, modified: string | null): string {
  if (!created && !modified) return '';
  if (!created) return modified!;
  if (!modified || created === modified) return created;
  return `${created} · edited ${modified}`;
}

/**
 * Compute a stable absolute position for a shard within the canvas.
 * Uses hashSlug so positions are deterministic across visits.
 */
function shardPosition(
  slug: string, canvasW: number, canvasH: number, shardW: number, shardH: number
): { x: number; y: number; rotation: number } {
  const h = hashSlug(slug);
  const marginX = 60;
  const marginYTop = 16;
  const marginYBottom = 40;
  const rangeX = Math.max(canvasW - shardW - marginX * 2, 1);
  const rangeY = Math.max(canvasH - shardH - marginYTop - marginYBottom, 1);
  const x = marginX + (h % rangeX);
  const y = marginYTop + ((h >> 8) % rangeY);
  const rotation = ((h >> 16) % 17) - 8;   // −8° to +8°
  return { x, y, rotation };
}
```

- [ ] **Step 4: Add `renderScatter` function (still inside `<script>`, after helpers)**

```typescript
/**
 * Populate the scatter canvas with shards for the given folder.
 * Clears existing content first. Does NOT animate — caller handles animation.
 */
function renderScatter(folderKey: string, tree: NovelTree, canvas: HTMLElement): void {
  canvas.innerHTML = '';

  const folder = tree[folderKey];
  if (!folder) return;

  const rgb = ACCENT_MAP[folderKey] || '80,120,200';
  const groups = getGroupedFiles(folder);
  const canvasRect = canvas.getBoundingClientRect();
  const shardW = 110;
  const shardH = 56;

  let idx = 0;
  for (const group of groups) {
    for (const { file, breadcrumb, subPath } of group.entries) {
      const pos = shardPosition(file.slug, canvasRect.width, canvasRect.height, shardW, shardH);
      const safeData = encodeURIComponent(JSON.stringify({ file, breadcrumb, folderKey, subPath }));
      const clip = SHARD_SHAPES[shapeIndex(file.slug, SHARD_SHAPES.length)];

      const el = document.createElement('div');
      el.className = 'memory-shard';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.dataset.shardEncoded = safeData;
      // Use CSS `rotate` (individual transform) so VanillaTilt's `transform` doesn't clobber the rotation
      el.style.left = `${pos.x}px`;
      el.style.top  = `${pos.y}px`;
      el.style.rotate = `${pos.rotation}deg`;
      el.style.setProperty('--panel-accent-rgb', rgb);
      el.style.setProperty('--shard-i', String(idx));
      el.style.clipPath = clip;

      el.innerHTML = `<span class="shard-title">${esc(file.title)}</span>`;
      canvas.appendChild(el);
      idx++;
    }
  }

  // Re-initialize VanillaTilt on newly inserted shards
  VanillaTilt.init(canvas.querySelectorAll<HTMLElement>('.memory-shard'), {
    max: 15, speed: 300, scale: 1.04,
    glare: true, 'max-glare': 0.25,
    gyroscope: false,
  });
}
```

- [ ] **Step 5: Add mousemove hotspot delegation on scatter canvas (after `renderScatter`)**

This handler is registered once on the canvas container; it stays active for all future shard renders:

```typescript
function initHotspot(canvas: HTMLElement): void {
  canvas.addEventListener('mousemove', (e) => {
    const shard = (e.target as Element).closest<HTMLElement>('.memory-shard');
    if (!shard) return;
    const rect = shard.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    shard.style.setProperty('--shard-gx', x);
    shard.style.setProperty('--shard-gy', y);
  });
}
```

- [ ] **Step 6: Verify build passes**

```bash
npm run build 2>&1 | tail -10
```

Expected: clean build.

- [ ] **Step 7: Run tests**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/pages/novel/[...slug].astro src/tests/novel.test.ts
git commit -m "feat(novel): hash helper, renderScatter, hotspot delegation"
```

---

## Task 5: JS — Tab Handler + Category Switch Animation

**Files:**
- Modify: `src/pages/novel/[...slug].astro` (client `<script>`, inside `init()`)

Add the `switchFolder` function and wire up tab click events.

- [ ] **Step 1: Add `animateOut` + `animateIn` helpers (after `initHotspot`, still module-level)**

```typescript
function animateOut(shards: NodeListOf<HTMLElement>): Promise<void> {
  return new Promise((resolve) => {
    if (shards.length === 0) { resolve(); return; }
    shards.forEach((s) => {
      s.style.transition = 'opacity 180ms ease-in, transform 180ms ease-in';
      s.style.opacity = '0';
      s.style.transform = `${s.style.transform || ''} translateY(12px)`;
    });
    setTimeout(resolve, 190);
  });
}

function animateIn(canvas: HTMLElement): void {
  const shards = canvas.querySelectorAll<HTMLElement>('.memory-shard');
  shards.forEach((s, i) => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(-20px)';
    s.style.transition = 'none';
    // Force reflow so the initial state is painted before the transition starts
    void s.offsetHeight;
    setTimeout(() => {
      s.style.transition = 'opacity 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)';
      s.style.opacity = '1';
      s.style.transform = '';
    }, i * 30);
  });
}
```

- [ ] **Step 2: Add `switchFolder` function (module-level, after `animateIn`)**

```typescript
let currentFolderSlug: string | null = null;

async function switchFolder(
  folderKey: string,
  tree: NovelTree,
  canvas: HTMLElement,
  pushState = true
): Promise<void> {
  // Update tab active states immediately
  document.querySelectorAll<HTMLElement>('.filter-tab').forEach((tab) => {
    const isActive = tab.dataset.folder === folderKey;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  currentFolderSlug = folderKey;

  // Animate existing shards out, then render + animate new ones in
  const existing = canvas.querySelectorAll<HTMLElement>('.memory-shard');
  await animateOut(existing);
  renderScatter(folderKey, tree, canvas);
  animateIn(canvas);

  if (pushState) {
    history.pushState(
      { folderSlug: folderKey, fileSubPath: null },
      '',
      `/novel/${folderKey}`
    );
  }
}
```

- [ ] **Step 3: Wire up tab clicks inside `init()`**

Inside the `init()` function, after getting `tree` from the JSON element, add:

```typescript
const canvas = document.getElementById('scatter-canvas')!;
initHotspot(canvas);

document.getElementById('filter-tabs')!.addEventListener('click', (e) => {
  const tab = (e.target as Element).closest<HTMLElement>('.filter-tab');
  if (!tab || !tab.dataset.folder) return;
  switchFolder(tab.dataset.folder, tree, canvas);
});

document.getElementById('filter-tabs')!.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const tab = (e.target as Element).closest<HTMLElement>('.filter-tab');
  if (!tab || !tab.dataset.folder) return;
  e.preventDefault();
  switchFolder(tab.dataset.folder, tree, canvas);
});
```

- [ ] **Step 4: Check dev server renders filter tabs and switching works**

```bash
npm run dev
```

Open `http://localhost:4321/novel`. Verify:
- Five category tabs appear below the title
- Clicking a tab renders shards scattered on canvas
- Switching tabs animates old shards down+out, new shards fall in from above
- Rain canvas renders behind everything

- [ ] **Step 5: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat(novel): tab handler, switchFolder, scatter in/out animations"
```

---

## Task 6: JS — Expand-to-Read + Close Animation

**Files:**
- Modify: `src/pages/novel/[...slug].astro` (client `<script>`)

Replace `openShard` / `closeReading` implementations with clip-path expand/contract animations.

- [ ] **Step 1: Add `openShard` with clip-path expand (module-level, after `switchFolder`)**

```typescript
// Stored so closeReading can contract back to the origin rect
let _openRect: { top: number; right: number; bottom: number; left: number } | null = null;

function openShard(
  folderKey: string,
  file: NovelFile,
  breadcrumb: string,
  subPath: string,
  shardEl: HTMLElement,
  pushState = true
): void {
  const overlay    = document.getElementById('reading-overlay')!;
  const shardDiv   = document.getElementById('reading-shard')!;
  const imagesEl   = document.getElementById('reading-images')!;
  const titleEl    = document.getElementById('reading-title')!;
  const bodyEl     = document.getElementById('reading-body')!;
  const rgb        = ACCENT_MAP[folderKey] || '80,120,200';

  // Populate content
  overlay.style.setProperty('--overlay-accent-rgb', rgb);
  shardDiv.style.borderColor = `rgba(${rgb},0.4)`;
  document.getElementById('reading-breadcrumb')!.textContent = breadcrumb;
  titleEl.textContent  = file.title;
  titleEl.style.color  = `rgba(${rgb},1)`;
  document.getElementById('reading-date')!.textContent = formatDate(file.created, file.modified);

  const div  = document.createElement('div');
  div.innerHTML = file.body;
  const imgs   = Array.from(div.querySelectorAll('img'));
  const images = imgs.map((img) => ({ src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '' }));
  imgs.forEach((img) => img.remove());
  bodyEl.innerHTML = div.innerHTML;

  if (images.length > 0) {
    imagesEl.style.display  = 'flex';
    imagesEl.innerHTML = images.map((img) => `<img src="${esc(img.src)}" alt="${esc(img.alt)}">`).join('');
  } else {
    imagesEl.style.display  = 'none';
    imagesEl.innerHTML = '';
  }

  // Capture shard rect relative to viewport for clip-path start
  const rect   = shardEl.getBoundingClientRect();
  const top    = rect.top;
  const right  = window.innerWidth  - rect.right;
  const bottom = window.innerHeight - rect.bottom;
  const left   = rect.left;
  _openRect    = { top, right, bottom, left };

  // Hide reading content initially; set clip-path to shard rect
  shardDiv.style.opacity   = '0';
  shardDiv.style.transition = 'none';
  overlay.style.clipPath   = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  overlay.style.transition = 'none';
  overlay.classList.add('is-open');
  overlay.querySelector('.reading-content')!.scrollTop = 0;

  // Two rAF frames to ensure initial clip-path is painted before animating
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.transition = 'clip-path 280ms ease-out';
      overlay.style.clipPath   = 'inset(0px)';

      setTimeout(() => {
        shardDiv.style.transition = 'opacity 150ms ease';
        shardDiv.style.opacity    = '1';
      }, 260);
    });
  });

  if (pushState && currentFolderSlug) {
    history.pushState(
      { folderSlug: currentFolderSlug, fileSubPath: subPath ?? file.slug },
      '',
      `/novel/${currentFolderSlug}/${subPath ?? file.slug}`
    );
  }
}
```

- [ ] **Step 2: Add `closeReading` with clip-path contract (module-level)**

```typescript
function closeReading(pushState = true): void {
  const overlay  = document.getElementById('reading-overlay')!;
  const shardDiv = document.getElementById('reading-shard')!;

  // Fade content out first
  shardDiv.style.transition = 'opacity 100ms ease';
  shardDiv.style.opacity    = '0';

  setTimeout(() => {
    if (_openRect) {
      const { top, right, bottom, left } = _openRect;
      overlay.style.transition = 'clip-path 250ms ease-in';
      overlay.style.clipPath   = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
      setTimeout(() => {
        overlay.classList.remove('is-open');
        overlay.style.clipPath   = '';
        overlay.style.transition = '';
        shardDiv.style.opacity   = '';
        shardDiv.style.transition = '';
        _openRect = null;
      }, 260);
    } else {
      overlay.classList.remove('is-open');
      shardDiv.style.opacity   = '';
      shardDiv.style.transition = '';
    }

    if (pushState && currentFolderSlug) {
      history.pushState(
        { folderSlug: currentFolderSlug, fileSubPath: null },
        '',
        `/novel/${currentFolderSlug}`
      );
    }
  }, 110);
}

(window as any).__novelCloseReading = () => closeReading();
```

- [ ] **Step 3: Wire up shard click/keydown on scatter canvas inside `init()`**

After the tab event listeners, add:

```typescript
canvas.addEventListener('click', (e) => {
  const shardEl = (e.target as Element).closest<HTMLElement>('.memory-shard');
  if (!shardEl?.dataset.shardEncoded) return;
  const { file, breadcrumb, folderKey, subPath } = JSON.parse(
    decodeURIComponent(shardEl.dataset.shardEncoded)
  ) as { file: NovelFile; breadcrumb: string; folderKey: string; subPath: string };
  openShard(folderKey, file, breadcrumb, subPath, shardEl);
});

canvas.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const shardEl = (e.target as Element).closest<HTMLElement>('.memory-shard');
  if (!shardEl?.dataset.shardEncoded) return;
  e.preventDefault();
  const { file, breadcrumb, folderKey, subPath } = JSON.parse(
    decodeURIComponent(shardEl.dataset.shardEncoded)
  ) as { file: NovelFile; breadcrumb: string; folderKey: string; subPath: string };
  openShard(folderKey, file, breadcrumb, subPath, shardEl);
});
```

- [ ] **Step 4: Verify expand animation in dev server**

```bash
npm run dev
```

Open `http://localhost:4321/novel`, click a tab, then click a shard. Verify:
- The overlay clips to the shard's position and expands to full screen (~280ms)
- Reading content fades in after the expand
- Clicking the back button / clicking outside closes the overlay with a reverse animation that contracts to the shard's original position

- [ ] **Step 5: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat(novel): expand-to-read clip-path animation, close contract animation"
```

---

## Task 7: JS — Init + Popstate Handler

**Files:**
- Modify: `src/pages/novel/[...slug].astro` (client `<script>`)

Wire up initial state from URL props and browser back/forward navigation.

- [ ] **Step 1: Rewrite `init()` to include rain canvas + initial state**

Replace the entire `init()` function with:

```typescript
function init() {
  const treeEl = document.getElementById('novel-tree');
  if (!treeEl) return;

  const tree: NovelTree = JSON.parse(treeEl.textContent!);

  // ── Rain canvas ──────────────────────────────────────────────────
  (function () {
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = 0, h = 0;

    function resize() {
      w = canvas!.width  = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const towers = Array.from({ length: 16 }, (_, i) => ({
      x: (i / 15) * 1.1 - 0.05,
      height: 0.2 + Math.random() * 0.4,
      width: 0.4 + Math.random() * 1.8,
      opacity: 0.025 + Math.random() * 0.035,
    }));
    const struts = Array.from({ length: 5 }, () => ({
      y: 0.45 + Math.random() * 0.45,
      opacity: 0.015 + Math.random() * 0.015,
    }));
    const drops = Array.from({ length: 110 }, () => ({
      x: Math.random(), y: Math.random(),
      speed: (1.8 + Math.random() * 2.2) / 800,
      len: (7 + Math.random() * 16) / 800,
      opacity: 0.07 + Math.random() * 0.18,
      lean: -0.035 + Math.random() * 0.02,
    }));

    let rafId = 0;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const grd = ctx.createRadialGradient(w * 0.5, h * 0.92, 0, w * 0.5, h * 0.65, h * 0.7);
      grd.addColorStop(0, 'rgba(180,75,15,0.08)');
      grd.addColorStop(0.5, 'rgba(140,55,10,0.04)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      towers.forEach((t) => {
        ctx.fillStyle = `rgba(90,130,200,${t.opacity})`;
        ctx.fillRect(t.x * w - t.width / 2, h - t.height * h, t.width, t.height * h);
      });
      struts.forEach((s) => {
        ctx.strokeStyle = `rgba(90,130,200,${s.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, s.y * h); ctx.lineTo(w, s.y * h); ctx.stroke();
      });
      drops.forEach((d) => {
        const px = d.x * w, py = d.y * h, plen = d.len * h;
        ctx.strokeStyle = `rgba(130,180,255,${d.opacity})`;
        ctx.lineWidth = 0.55;
        ctx.beginPath(); ctx.moveTo(px, py);
        ctx.lineTo(px + Math.sin(d.lean) * plen, py + plen); ctx.stroke();
        d.y += d.speed;
        if (d.y > 1) { d.y = -d.len; d.x = Math.random(); }
      });

      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);

    document.addEventListener('astro:before-swap', () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    }, { once: true });
  })();

  // ── Tab + canvas wiring ──────────────────────────────────────────
  const canvas = document.getElementById('scatter-canvas')!;
  initHotspot(canvas);

  document.getElementById('filter-tabs')!.addEventListener('click', (e) => {
    const tab = (e.target as Element).closest<HTMLElement>('.filter-tab');
    if (!tab || !tab.dataset.folder) return;
    switchFolder(tab.dataset.folder, tree, canvas);
  });

  document.getElementById('filter-tabs')!.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tab = (e.target as Element).closest<HTMLElement>('.filter-tab');
    if (!tab || !tab.dataset.folder) return;
    e.preventDefault();
    switchFolder(tab.dataset.folder, tree, canvas);
  });

  canvas.addEventListener('click', (e) => {
    const shardEl = (e.target as Element).closest<HTMLElement>('.memory-shard');
    if (!shardEl?.dataset.shardEncoded) return;
    const { file, breadcrumb, folderKey, subPath } = JSON.parse(
      decodeURIComponent(shardEl.dataset.shardEncoded)
    ) as { file: NovelFile; breadcrumb: string; folderKey: string; subPath: string };
    openShard(folderKey, file, breadcrumb, subPath, shardEl);
  });

  canvas.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const shardEl = (e.target as Element).closest<HTMLElement>('.memory-shard');
    if (!shardEl?.dataset.shardEncoded) return;
    e.preventDefault();
    const { file, breadcrumb, folderKey, subPath } = JSON.parse(
      decodeURIComponent(shardEl.dataset.shardEncoded)
    ) as { file: NovelFile; breadcrumb: string; folderKey: string; subPath: string };
    openShard(folderKey, file, breadcrumb, subPath, shardEl);
  });

  // ── Popstate — browser back/forward ─────────────────────────────
  function handlePopstate(e: PopStateEvent) {
    const state = e.state as { folderSlug: string | null; fileSubPath: string | null } | null;
    const overlay = document.getElementById('reading-overlay')!;

    // Always close reading overlay on navigation
    overlay.classList.remove('is-open');
    overlay.style.clipPath   = '';
    overlay.style.transition = '';
    const shardDiv = document.getElementById('reading-shard')!;
    shardDiv.style.opacity   = '';
    shardDiv.style.transition = '';
    _openRect = null;

    if (!state?.folderSlug) {
      // No folder — clear scatter
      canvas.innerHTML = '';
      currentFolderSlug = null;
      document.querySelectorAll<HTMLElement>('.filter-tab').forEach((t) => {
        t.classList.remove('is-active');
        t.setAttribute('aria-pressed', 'false');
      });
      return;
    }

    // Switch to folder (no history push — this IS the popstate handler)
    if (currentFolderSlug !== state.folderSlug) {
      switchFolder(state.folderSlug, tree, canvas, false);
    }

    // Re-open shard if fileSubPath is in state
    if (state.fileSubPath) {
      // Find the shard element matching the subPath
      requestAnimationFrame(() => {
        canvas.querySelectorAll<HTMLElement>('.memory-shard[data-shard-encoded]').forEach((el) => {
          const { file, breadcrumb, folderKey, subPath } = JSON.parse(
            decodeURIComponent(el.dataset.shardEncoded!)
          ) as { file: NovelFile; breadcrumb: string; folderKey: string; subPath: string };
          if ((file.path.slice(1).join('/') || file.slug) === state.fileSubPath) {
            openShard(folderKey, file, breadcrumb, subPath, el, false);
          }
        });
      });
    }
  }

  window.addEventListener('popstate', handlePopstate);

  document.addEventListener('astro:before-swap', () => {
    window.removeEventListener('popstate', handlePopstate);
  }, { once: true });

  // ── Initial state from server-rendered URL props ─────────────────
  const page        = document.querySelector('.novel-page') as HTMLElement;
  const initFolder  = page.dataset.initialFolder  || null;
  const initSubPath = page.dataset.initialSubpath || null;

  // Default to first non-empty folder if no folder in URL
  const firstFolder = initFolder
    ?? Object.values(tree).find((f) =>
        f.files.length > 0 || Object.keys(f.subfolders).length > 0
      )?.slug
    ?? null;

  if (firstFolder) {
    history.replaceState(
      { folderSlug: firstFolder, fileSubPath: initSubPath ?? null },
      '',
      window.location.pathname
    );
    switchFolder(firstFolder, tree, canvas, false).then(() => {
      if (initSubPath) {
        requestAnimationFrame(() => {
          canvas.querySelectorAll<HTMLElement>('.memory-shard[data-shard-encoded]').forEach((el) => {
            const { file, breadcrumb, folderKey, subPath } = JSON.parse(
              decodeURIComponent(el.dataset.shardEncoded!)
            ) as { file: NovelFile; breadcrumb: string; folderKey: string; subPath: string };
            if ((file.path.slice(1).join('/') || file.slug) === initSubPath) {
              openShard(folderKey, file, breadcrumb, subPath, el, false);
            }
          });
        });
      }
    });
  } else {
    history.replaceState({ folderSlug: null, fileSubPath: null }, '', '/novel');
  }
}

document.addEventListener('astro:page-load', init);
```

Note: `switchFolder` must return a `Promise<void>` for the `.then()` call above. Confirm it does — it was defined as `async function switchFolder(...)` in Task 5.

- [ ] **Step 2: Verify full flow in dev server**

```bash
npm run dev
```

Check all flows:
1. `/novel` loads → first non-empty tab auto-selected, shards scatter in
2. Click a different tab → switch animation plays
3. Click a shard → expand animation plays, reading view opens
4. Click back button → contract animation, returns to scatter
5. Browser back/forward → correct state restored
6. `/novel/characters` direct URL → Characters tab active, shards visible
7. `/novel/characters/rain` direct URL → Characters tab active + reading overlay open

- [ ] **Step 3: Run tests**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 4: Run build**

```bash
npm run build 2>&1 | tail -20
```

Expected: clean build, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat(novel): init, popstate, default folder selection, full scatter flow"
```

---

## Self-Review Checklist

- [x] **Spec: Full-viewport scatter canvas** — Task 3 removes nav grid; `.scatter-canvas` fills flex column remainder
- [x] **Spec: Deterministic positioning** — `shardPosition()` uses `hashSlug` (Task 4)
- [x] **Spec: ±8° rotation via `rotate` CSS property** — avoids VanillaTilt `transform` conflict (Task 4)
- [x] **Spec: Category filter tabs** — Task 2 CSS + Task 5 click handler
- [x] **Spec: Category switch animation** — `animateOut` + `animateIn` in Task 5
- [x] **Spec: Expand-to-read clip-path** — `openShard` in Task 6 animates `.reading-overlay` clip-path from shard rect → `inset(0)`
- [x] **Spec: Close/contract animation** — `closeReading` reverses clip-path in Task 6
- [x] **Spec: VanillaTilt re-init on scatter render** — called at end of `renderScatter` (Task 4)
- [x] **Spec: Hotspot delegation moved to scatter canvas** — `initHotspot(canvas)` in Task 4/7
- [x] **Spec: prefers-reduced-motion** — opacity fallback in Task 3 CSS; Task 7 popstate clears clip-path cleanly
- [x] **Spec: Mobile grid fallback** — Task 3 CSS `@media (max-width: 768px)` block
- [x] **Spec: URL scheme preserved** — `switchFolder` pushes `/novel/<folder>`, `openShard` pushes `/novel/<folder>/<file>`, popstate handles all states
- [x] **Spec: Default to first non-empty folder** — `init()` in Task 7 falls back to first folder with content
- [x] **Spec: History API replaceState on initial load** — Task 7 `init()` calls `replaceState`
- [x] **Type consistency** — `switchFolder(folderKey, tree, canvas, pushState)` signature used consistently across Tasks 5, 6, 7
