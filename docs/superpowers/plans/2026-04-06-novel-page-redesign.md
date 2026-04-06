# Novel Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scatter-view novel page with a two-panel frosted-glass navigator (folder clusters left, shard list right) and a full-screen reading overlay, incorporating the story's reflections and rainpunk motifs.

**Architecture:** Three files change: `novel.css` (complete replacement), `[...slug].astro` HTML template (replace `<main>` body), and `[...slug].astro` `<script>` block (replace all client JS). `novel.ts` is untouched — the build-time tree builder and data shapes remain identical.

**Tech Stack:** Astro 5, TypeScript (client script), vanilla CSS (no frameworks), Canvas 2D API for rain background, History API for URL management.

---

## File Map

| File | Change |
|---|---|
| `src/styles/novel.css` | Complete replacement |
| `src/pages/novel/[...slug].astro` | Replace HTML inside `<BaseLayout>` + replace `<script>` block; keep `getStaticPaths()` and frontmatter unchanged |
| `src/utils/novel.ts` | No changes |

---

## Task 1: Replace novel.css

**Files:**
- Modify: `src/styles/novel.css`

The existing file implements the scatter/shard system. Replace the entire contents with the two-panel layout, frosted glass cluster styles, reading overlay styles, and motion/mobile overrides.

- [ ] **Step 1: Replace the full contents of `src/styles/novel.css`**

```css
/* ============================================================
   Novel Page — Remember Rain
   Two-panel frosted glass navigator + reading overlay
   ============================================================ */

/* ══ Background canvas ══ */
#bg-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* ══ Main layout — full viewport, title row above navigator ══ */
.novel-page {
  position: relative;
  z-index: 1;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 3rem 4rem;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* ══ Two-panel navigator — fills remaining height ══ */
.navigator {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 4px;
  min-height: 0;
  overflow: hidden;
}

/* ══ Title block ══ */
.title-block {
  text-align: left;
  user-select: none;
  display: flex;
  align-items: flex-end;
  gap: 2.5rem;
}
.title-text-group { display: flex; flex-direction: column; }

.title-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(122,184,255,0.55);
  display: block;
  padding-bottom: 2px;
}

.title-main {
  font-family: 'Archivo Black', 'Arial Black', sans-serif;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #eef2fa;
  line-height: 1;
  display: block;
  text-shadow:
    0 0 40px rgba(100,160,240,0.2),
    0 2px 16px rgba(100,160,240,0.1);
}

/* Rain's passive ability — ghostly afterimage of himself */
.waterline {
  display: block;
  width: 100%;
  height: 1px;
  margin: 4px 0 0;
  background: linear-gradient(to right,
    transparent,
    rgba(122,184,255,0.3) 15%,
    rgba(160,210,255,0.5) 50%,
    rgba(122,184,255,0.3) 85%,
    transparent
  );
}

.title-reflection {
  font-family: 'Archivo Black', 'Arial Black', sans-serif;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #eef2fa;
  line-height: 1;
  display: block;
  transform: scaleY(-1);
  opacity: 0.13;
  filter: blur(0.8px);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 45%, transparent 80%);
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 45%, transparent 80%);
  pointer-events: none;
  margin-top: 1px;
}

/* ══ Folder clusters — left panel ══ */
.folder-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  height: 100%;
  align-content: start;
  scrollbar-width: thin;
  scrollbar-color: rgba(80,120,200,0.2) transparent;
}

.folder-cluster {
  position: relative;
  cursor: pointer;
  user-select: none;
}

/* Frosted glass face — Vesper's memory extraction as glass shards */
.cluster-face {
  position: relative;
  padding: 1.1rem 1.6rem;
  background: rgba(80,120,200,0.045);
  border: 1px solid rgba(80,120,200,0.16);
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  transition:
    background 350ms cubic-bezier(0.16,1,0.3,1),
    border-color 350ms cubic-bezier(0.16,1,0.3,1);
  clip-path: polygon(0 0, 100% 0.6%, 99.6% 99%, 0.2% 100%);
}

/* Frost texture lines */
.cluster-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(91deg, transparent 0, rgba(190,215,255,0.016) 1px, transparent 2px, transparent 10px),
    repeating-linear-gradient(180deg, transparent 0, rgba(190,215,255,0.01) 1px, transparent 2px, transparent 15px);
  pointer-events: none;
  transition: opacity 400ms ease;
  opacity: 1;
}

/* Glass glint */
.cluster-face::after {
  content: '';
  position: absolute;
  top: 0; left: 6%; right: 6%; height: 1px;
  background: linear-gradient(to right, transparent, rgba(210,230,255,0.3) 30%, rgba(220,240,255,0.45) 50%, rgba(210,230,255,0.3) 70%, transparent);
  transition: opacity 300ms ease;
}

.cluster-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  transition: color 300ms ease;
}

.cluster-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  opacity: 0.5;
  transition: opacity 300ms ease;
}

/* Per-folder accent colors */
[data-folder="characters"] { --accent: #ffe52c; --accent-rgb: 255,229,44; }
[data-folder="locations"]  { --accent: #7ab8ff; --accent-rgb: 122,184,255; }
[data-folder="lore"]       { --accent: #ff8822; --accent-rgb: 255,136,34; }
[data-folder="scenes"]     { --accent: #ff6666; --accent-rgb: 255,102,102; }
[data-folder="themes"]     { --accent: #aaaaff; --accent-rgb: 170,170,255; }

.folder-cluster .cluster-name { color: var(--accent); }
.folder-cluster .cluster-face { border-color: rgba(var(--accent-rgb), 0.2); }

/* Hover */
.folder-cluster:not(.empty):hover .cluster-face {
  background: rgba(var(--accent-rgb), 0.06);
  border-color: rgba(var(--accent-rgb), 0.45);
}
.folder-cluster:not(.empty):hover .cluster-face::before { opacity: 0.35; }
.folder-cluster:not(.empty):hover .cluster-meta { opacity: 0.55; }

/* Open state */
.folder-cluster.is-open .cluster-face {
  background: rgba(var(--accent-rgb), 0.09);
  border-color: rgba(var(--accent-rgb), 0.7);
}
.folder-cluster.is-open .cluster-face::before { opacity: 0; }
.folder-cluster.is-open .cluster-meta { opacity: 0.6; }

/* Dim non-selected folders when one is open */
.folder-list.has-open .folder-cluster:not(.is-open):not(.empty) .cluster-face {
  opacity: 0.45;
  transition: opacity 350ms ease, background 350ms ease;
}

/* ══ Shard panel — right column ══ */
.shard-panel {
  border: 1px solid rgba(80,120,200,0.1);
  background: rgba(80,120,200,0.02);
  clip-path: polygon(0 0, 100% 0.3%, 99.8% 99.8%, 0.1% 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  opacity: 0;
  transition: opacity 350ms cubic-bezier(0.16,1,0.3,1),
              border-color 350ms ease;
  pointer-events: none;
}
.shard-panel.is-visible {
  opacity: 1;
  pointer-events: all;
}

.shard-panel-header {
  padding: 0.85rem 1.2rem 0.75rem;
  border-bottom: 1px solid rgba(80,120,200,0.1);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-shrink: 0;
}
.shard-panel-name {
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
}
.shard-panel-count {
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  opacity: 0.5;
  font-family: 'JetBrains Mono', monospace;
}

.shard-panel-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0.4rem 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(80,120,200,0.2) transparent;
}
.shard-panel-list::-webkit-scrollbar { width: 2px; }
.shard-panel-list::-webkit-scrollbar-thumb { background: rgba(80,120,200,0.25); }

/* ══ Memory shards — rows inside right panel ══ */
.memory-shard {
  position: relative;
  padding: 0.75rem 1.2rem 0.75rem 2.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  cursor: pointer;
  transition: background 150ms ease;
  overflow: hidden;
}
.memory-shard::before {
  content: '◇';
  position: absolute;
  left: 0.75rem;
  font-size: 0.48rem;
  opacity: 0.3;
  transition: opacity 150ms ease, transform 150ms ease;
}
.memory-shard:hover { background: rgba(var(--panel-accent-rgb, 80,120,200), 0.08); }
.memory-shard:hover::before { opacity: 0.75; transform: rotate(45deg); }

.shard-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.shard-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.04em;
  opacity: 0.5;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ══ Full-screen reading overlay ══ */
.reading-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: stretch;
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms ease;
}
.reading-overlay.is-open {
  pointer-events: all;
  opacity: 1;
}

.reading-shard {
  position: absolute;
  inset: 0;
  background: rgba(3,6,16,0.97);
  border: 1px solid rgba(var(--overlay-accent-rgb, 80,120,200), 0.4);
  clip-path: polygon(0.3% 0.2%, 99.7% 0, 100% 99.8%, 0 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Entire overlay is a dismiss target; inner column stops propagation */
.reading-content {
  position: relative;
  z-index: 1;
  padding: 3rem 0;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  cursor: pointer;
}

/* Back button — sits above the centered column, same max-width */
.reading-back {
  width: 100%;
  max-width: 720px;
  padding: 0 2rem 1.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(var(--overlay-accent-rgb, 80,120,200), 0.45);
  background: none;
  border: none;
  cursor: pointer;
  margin: 0;
  transition: color 200ms ease;
  display: block;
  text-align: left;
}
.reading-back:hover { color: rgba(var(--overlay-accent-rgb, 80,120,200), 0.9); }

/* Centered column — clicking inside does NOT dismiss */
.reading-inner {
  display: flex;
  gap: 2.5rem;
  align-items: flex-start;
  width: 100%;
  max-width: 720px;
  padding: 0 2rem;
  cursor: default;
}

.reading-breadcrumb {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(var(--overlay-accent-rgb, 80,120,200), 0.6);
  margin-bottom: 0.5rem;
}

.reading-title {
  font-family: 'Archivo Black', 'Arial Black', sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 900;
  line-height: 1.05;
  margin-bottom: 0.5rem;
}

.reading-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: rgba(var(--overlay-accent-rgb, 80,120,200), 0.55);
  margin-bottom: 2.5rem;
}

.reading-body {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.85;
  color: rgba(200,215,235,0.85);
  max-width: 620px;
  flex: 1;
  min-width: 0;
}
.reading-body p { margin-bottom: 1.25em; }
.reading-body strong { color: rgba(var(--overlay-accent-rgb, 200,220,255), 0.95); }
.reading-body em { color: rgba(200,215,235,0.65); }
.reading-body h2, .reading-body h3 {
  font-family: 'Archivo Black', sans-serif;
  color: rgba(var(--overlay-accent-rgb, 200,220,255), 0.9);
  margin: 2em 0 0.75em;
  font-size: 1.1rem;
}
.reading-body ul, .reading-body ol { padding-left: 1.5em; margin-bottom: 1.25em; }
.reading-body li { margin-bottom: 0.4em; }
.reading-body img { max-width: 100%; display: block; margin: 1.5em 0; }

/* Image column — only shown when images are extracted from body */
.reading-images {
  flex-shrink: 0;
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
}
.reading-images img {
  width: 100%;
  border: 1px solid rgba(var(--overlay-accent-rgb, 80,120,200), 0.25);
  display: block;
}

/* ══ Reduced motion ══ */
@media (prefers-reduced-motion: reduce) {
  .shard-panel,
  .reading-overlay,
  .folder-cluster .cluster-face,
  .folder-list.has-open .folder-cluster .cluster-face,
  .memory-shard,
  .memory-shard::before {
    transition: none;
  }
}

/* ══ Mobile (below 768px) ══ */
@media (max-width: 768px) {
  .novel-page {
    padding: 1.5rem;
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .navigator {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: 8px;
    overflow: visible;
    height: auto;
  }

  .folder-list {
    height: auto;
    overflow: visible;
  }

  .shard-panel {
    clip-path: none;
    height: auto;
    min-height: 180px;
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

- [ ] **Step 2: Verify the file compiles (build check)**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```

Expected: build completes with no CSS errors. TypeScript errors in the Astro file are expected at this point because the HTML still references old class names — we fix those in the next tasks.

- [ ] **Step 3: Commit**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net
git add src/styles/novel.css
git commit -m "feat(novel): replace scatter CSS with two-panel frosted glass layout"
```

---

## Task 2: Replace Astro HTML Template

**Files:**
- Modify: `src/pages/novel/[...slug].astro`

Replace everything inside `<BaseLayout>` with the new structure. The `getStaticPaths()`, frontmatter imports, and props destructuring are **unchanged** — only the template HTML changes.

The new HTML must:
1. Add `<canvas id="bg-canvas">` outside `<main>` for the rain background
2. Render a `.title-block` with the reflection motif
3. Render `.navigator` with server-side folder clusters (dynamically from `novelTree`)
4. Mark folders with no files as `.empty` with `cursor:default`
5. Include the `.reading-overlay` HTML structure
6. Keep the `<script type="application/json" id="novel-tree">` data tag

- [ ] **Step 1: Locate the template section to replace**

In `src/pages/novel/[...slug].astro`, find the section between `<BaseLayout ...>` and `</BaseLayout>`. It currently contains `<NavPill />`, `<main class="novel-page">`, the data script tag, and the `<style>` import. Replace the `<NavPill />` through `</style>` section with the code below.

- [ ] **Step 2: Replace the template body**

The full new template block (replaces everything from `<NavPill />` through `</style>`):

```astro
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

    <!-- Two-panel navigator -->
    <div class="navigator">

      <!-- Left: folder cluster list -->
      <div class="folder-list" id="folder-list">
        {Object.values(novelTree).map((folder) => {
          const totalFiles = folder.files.length +
            Object.values(folder.subfolders).reduce((n, s) => n + s.files.length, 0);
          const isEmpty = totalFiles === 0;
          return (
            <div
              class={`folder-cluster${isEmpty ? ' empty' : ''}`}
              data-folder={folder.slug}
            >
              <div class="cluster-face" style={isEmpty ? 'cursor:default;' : undefined}>
                <span
                  class="cluster-name"
                  style={isEmpty ? 'opacity:0.38;' : undefined}
                >
                  {folder.title}
                </span>
                <span
                  class="cluster-meta"
                  style={isEmpty ? 'font-style:italic;opacity:0.18;' : undefined}
                >
                  {isEmpty
                    ? 'no shards yet'
                    : `${totalFiles} ${totalFiles === 1 ? 'shard' : 'shards'}`}
                </span>
              </div>
            </div>
          );
        })}
      </div><!-- /folder-list -->

      <!-- Right: shard panel (populated by JS) -->
      <div class="shard-panel" id="shard-panel">
        <div class="shard-panel-header">
          <span class="shard-panel-name" id="shard-panel-name"></span>
          <span class="shard-panel-count" id="shard-panel-count"></span>
        </div>
        <div class="shard-panel-list" id="shard-panel-list"></div>
      </div><!-- /shard-panel -->

    </div><!-- /navigator -->
  </main>

  <!-- Full-screen reading overlay -->
  <div class="reading-overlay" id="reading-overlay">
    <div class="reading-shard" id="reading-shard">
      <div class="reading-content" onclick="(window as any).__novelCloseReading()">
        <button
          class="reading-back"
          type="button"
          onclick="event.stopPropagation();(window as any).__novelCloseReading()"
        >
          ← return shard
        </button>
        <div class="reading-inner" onclick="event.stopPropagation()">
          <div style="flex:1;min-width:0;">
            <div class="reading-breadcrumb" id="reading-breadcrumb"></div>
            <h1 class="reading-title" id="reading-title"></h1>
            <div class="reading-date" id="reading-date"></div>
            <div class="reading-body" id="reading-body"></div>
          </div>
          <div class="reading-images" id="reading-images" style="display:none;"></div>
        </div>
      </div>
    </div>
  </div>

  {/* Inline data — no client fetches */}
  <script type="application/json" id="novel-tree" set:html={
    JSON.stringify(novelTree).replace(/<\/script>/gi, '<\\/script>')
  }></script>

<style>
  @import '../../styles/novel.css';
</style>
```

> **Note on `onclick` in the overlay:** Astro's script module scope means `closeReading()` isn't global. The onclick inline handlers use `(window as any).__novelCloseReading()` — a global bridge function that the `<script>` block will register on `window`. This is the safest way to bridge inline HTML events with module-scope JS in Astro.

- [ ] **Step 3: Verify the build compiles**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```

Expected: build succeeds. The page may not work interactively yet (the `<script>` block still has the old JS).

- [ ] **Step 4: Commit**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net
git add "src/pages/novel/[...slug].astro"
git commit -m "feat(novel): replace scatter HTML with two-panel navigator and reading overlay"
```

---

## Task 3: Replace the Client-Side Script

**Files:**
- Modify: `src/pages/novel/[...slug].astro` — the `<script>` block only

Replace the entire `<script>` block (everything between `<script>` and `</script>` that follows the `<style>` import). The new script implements: rain canvas, folder toggle, shard panel population, reading overlay, and History API URL management.

- [ ] **Step 1: Replace the `<script>` block contents**

Locate the `<script>` block in `[...slug].astro` (it starts with the comment `// Types inline — do NOT import from novel.ts`). Replace its entire contents with:

```typescript
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

// ── Read embedded tree data ─────────────────────────────────
const treeEl = document.getElementById('novel-tree');
if (!treeEl) throw new Error('novel-tree data missing');
const tree: NovelTree = JSON.parse(treeEl.textContent!);

// ── Rain canvas ─────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  let w = 0, h = 0;

  function resize() {
    w = canvas!.width = window.innerWidth;
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
    x: Math.random(),
    y: Math.random(),
    speed: (1.8 + Math.random() * 2.2) / 800,
    len: (7 + Math.random() * 16) / 800,
    opacity: 0.07 + Math.random() * 0.18,
    lean: -0.035 + Math.random() * 0.02,
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Volcanic glow — Flare-charged water rising from the island's volcano
    const grd = ctx.createRadialGradient(w * 0.5, h * 0.92, 0, w * 0.5, h * 0.65, h * 0.7);
    grd.addColorStop(0, 'rgba(180,75,15,0.08)');
    grd.addColorStop(0.5, 'rgba(140,55,10,0.04)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // City silhouette
    towers.forEach((t) => {
      ctx.fillStyle = `rgba(90,130,200,${t.opacity})`;
      const tw = t.width;
      const tx = t.x * w - tw / 2;
      const th = t.height * h;
      ctx.fillRect(tx, h - th, tw, th);
    });
    struts.forEach((s) => {
      ctx.strokeStyle = `rgba(90,130,200,${s.opacity})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, s.y * h);
      ctx.lineTo(w, s.y * h);
      ctx.stroke();
    });

    // Rain
    drops.forEach((d) => {
      const px = d.x * w;
      const py = d.y * h;
      const plen = d.len * h;
      ctx.strokeStyle = `rgba(130,180,255,${d.opacity})`;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.sin(d.lean) * plen, py + plen);
      ctx.stroke();
      d.y += d.speed;
      if (d.y > 1) { d.y = -d.len; d.x = Math.random(); }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Accent color map ────────────────────────────────────────
const ACCENT_MAP: Record<string, string> = {
  characters: '255,229,44',
  locations:  '122,184,255',
  lore:       '255,136,34',
  scenes:     '255,102,102',
  themes:     '170,170,255',
};

// ── Helpers ─────────────────────────────────────────────────

/** Collect all files from a folder, recursing into subfolders. */
function getAllFiles(folder: NovelFolder): Array<{ file: NovelFile; breadcrumb: string }> {
  const result: Array<{ file: NovelFile; breadcrumb: string }> = [];
  for (const file of folder.files) {
    result.push({ file, breadcrumb: folder.title });
  }
  function recurse(sub: NovelFolder, parentBc: string) {
    for (const file of sub.files) {
      result.push({ file, breadcrumb: `${parentBc} / ${sub.title}` });
    }
    for (const nested of Object.values(sub.subfolders)) {
      recurse(nested, `${parentBc} / ${sub.title}`);
    }
  }
  for (const sub of Object.values(folder.subfolders)) {
    recurse(sub, folder.title);
  }
  return result;
}

/**
 * Extract <img> elements from an HTML string.
 * Returns the body without the images, and the images separately.
 * This allows images to be shown in the right column of the reading overlay.
 */
function extractImages(bodyHtml: string): {
  cleanBody: string;
  images: Array<{ src: string; alt: string }>;
} {
  const div = document.createElement('div');
  div.innerHTML = bodyHtml;
  const imgs = Array.from(div.querySelectorAll('img'));
  const images = imgs.map((img) => ({
    src: img.getAttribute('src') || '',
    alt: img.getAttribute('alt') || '',
  }));
  imgs.forEach((img) => img.remove());
  return { cleanBody: div.innerHTML, images };
}

/** Format a one-line date string. */
function formatDate(created: string | null, modified: string | null): string {
  if (!created && !modified) return '';
  if (!created) return `${modified}`;
  if (!modified || created === modified) return created;
  return `${created} · edited ${modified}`;
}

// ── Folder cluster interaction ──────────────────────────────

let currentFolderSlug: string | null = null;

function toggleFolder(clusterEl: HTMLElement, pushState = true) {
  if (clusterEl.classList.contains('empty')) return;

  const folderKey = clusterEl.dataset.folder!;
  const list      = document.getElementById('folder-list')!;
  const panel     = document.getElementById('shard-panel')!;
  const panelName = document.getElementById('shard-panel-name')!;
  const panelCount = document.getElementById('shard-panel-count')!;
  const panelList = document.getElementById('shard-panel-list')!;
  const isAlreadyOpen = clusterEl.classList.contains('is-open');
  const rgb = ACCENT_MAP[folderKey] || '80,120,200';

  // Deselect all clusters first
  document.querySelectorAll<HTMLElement>('.folder-cluster').forEach((c) =>
    c.classList.remove('is-open')
  );
  list.classList.remove('has-open');

  if (!isAlreadyOpen) {
    // Open this cluster
    clusterEl.classList.add('is-open');
    list.classList.add('has-open');
    currentFolderSlug = folderKey;

    // Apply accent to panel
    panel.style.borderColor     = `rgba(${rgb}, 0.35)`;
    panel.style.backgroundColor = `rgba(${rgb}, 0.025)`;
    panelName.style.color       = `rgba(${rgb}, 0.85)`;
    panelCount.style.color      = '';

    // Populate panel from tree data
    const folder = tree[folderKey];
    const allFiles = folder ? getAllFiles(folder) : [];
    const count = allFiles.length;

    panelName.textContent  = folder?.title ?? folderKey;
    panelCount.textContent = count === 1 ? '1 shard' : `${count} shards`;

    panelList.innerHTML = allFiles.map(({ file, breadcrumb }) => {
      const safeData = encodeURIComponent(
        JSON.stringify({ file, breadcrumb, folderKey })
      );
      const dateStr = file.modified || file.created || '';
      return `<div
        class="memory-shard"
        style="color:rgba(${rgb},0.95); --panel-accent-rgb:${rgb};"
        role="button"
        tabindex="0"
        data-shard-encoded="${safeData}"
      >
        <span class="shard-title">${file.title}</span>
        <span class="shard-date">${dateStr}</span>
      </div>`;
    }).join('');

    panel.classList.add('is-visible');

    if (pushState) {
      history.pushState(
        { folderSlug: folderKey, fileSubPath: null },
        '',
        `/novel/${folderKey}`
      );
    }
  } else {
    // Clicking the open cluster again collapses it
    currentFolderSlug = null;
    panel.classList.remove('is-visible');
    if (pushState) {
      history.pushState({ folderSlug: null, fileSubPath: null }, '', '/novel');
    }
  }
}

// Event delegation — folder list clicks
document.getElementById('folder-list')!.addEventListener('click', (e) => {
  const cluster = (e.target as Element).closest<HTMLElement>('.folder-cluster');
  if (cluster) toggleFolder(cluster);
});
document.getElementById('folder-list')!.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const cluster = (e.target as Element).closest<HTMLElement>('.folder-cluster');
  if (cluster) { e.preventDefault(); toggleFolder(cluster); }
});

// Event delegation — shard list clicks
document.getElementById('shard-panel-list')!.addEventListener('click', (e) => {
  const shardEl = (e.target as Element).closest<HTMLElement>('.memory-shard');
  if (!shardEl) return;
  const encoded = shardEl.dataset.shardEncoded;
  if (encoded) openShardEncoded(encoded);
});
document.getElementById('shard-panel-list')!.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const shardEl = (e.target as Element).closest<HTMLElement>('.memory-shard');
  if (!shardEl) return;
  e.preventDefault();
  const encoded = shardEl.dataset.shardEncoded;
  if (encoded) openShardEncoded(encoded);
});

// ── Reading overlay ─────────────────────────────────────────

function openShardEncoded(encoded: string, pushState = true) {
  const { file, breadcrumb, folderKey } = JSON.parse(decodeURIComponent(encoded)) as {
    file: NovelFile;
    breadcrumb: string;
    folderKey: string;
  };
  openShard(folderKey, file.title, breadcrumb, file.created, file.modified, file.body, pushState, file.slug);
}

function openShard(
  folderKey: string,
  title: string,
  breadcrumb: string,
  created: string | null,
  modified: string | null,
  bodyHtml: string,
  pushState = true,
  fileSlug = ''
) {
  const overlay    = document.getElementById('reading-overlay')!;
  const shard      = document.getElementById('reading-shard')!;
  const imagesEl   = document.getElementById('reading-images')!;
  const titleEl    = document.getElementById('reading-title')!;
  const bodyEl     = document.getElementById('reading-body')!;

  const rgb = ACCENT_MAP[folderKey] || '80,120,200';
  overlay.style.setProperty('--overlay-accent-rgb', rgb);
  shard.style.borderColor = `rgba(${rgb}, 0.4)`;

  document.getElementById('reading-breadcrumb')!.textContent = breadcrumb;
  titleEl.textContent = title;
  titleEl.style.color = `rgba(${rgb}, 1)`;
  document.getElementById('reading-date')!.textContent = formatDate(created, modified);

  // Extract images from body and show in right column
  const { cleanBody, images } = extractImages(bodyHtml);
  bodyEl.innerHTML = cleanBody;

  if (images.length > 0) {
    imagesEl.style.display = 'flex';
    imagesEl.innerHTML = images
      .map((img) => `<img src="${img.src}" alt="${img.alt}">`)
      .join('');
  } else {
    imagesEl.style.display = 'none';
    imagesEl.innerHTML = '';
  }

  overlay.classList.add('is-open');
  overlay.querySelector('.reading-content')!.scrollTop = 0;

  if (pushState && currentFolderSlug) {
    history.pushState(
      { folderSlug: currentFolderSlug, fileSubPath: fileSlug },
      '',
      `/novel/${currentFolderSlug}/${fileSlug}`
    );
  }
}

function closeReading(pushState = true) {
  document.getElementById('reading-overlay')!.classList.remove('is-open');
  if (pushState && currentFolderSlug) {
    history.pushState(
      { folderSlug: currentFolderSlug, fileSubPath: null },
      '',
      `/novel/${currentFolderSlug}`
    );
  }
}

// Bridge for inline onclick in the overlay HTML
(window as any).__novelCloseReading = () => closeReading();

// ── popstate — browser back/forward ────────────────────────
window.addEventListener('popstate', (e) => {
  const state = e.state as { folderSlug: string | null; fileSubPath: string | null } | null;

  // Close reading overlay if open
  document.getElementById('reading-overlay')!.classList.remove('is-open');

  if (!state || !state.folderSlug) {
    // Return to index — collapse all clusters
    document.querySelectorAll<HTMLElement>('.folder-cluster').forEach((c) =>
      c.classList.remove('is-open')
    );
    document.getElementById('folder-list')!.classList.remove('has-open');
    document.getElementById('shard-panel')!.classList.remove('is-visible');
    currentFolderSlug = null;
    return;
  }

  // Restore folder selection
  if (currentFolderSlug !== state.folderSlug) {
    const clusterEl = document.querySelector<HTMLElement>(
      `[data-folder="${state.folderSlug}"]`
    );
    if (clusterEl) toggleFolder(clusterEl, false);
  }

  // Restore file if needed
  if (state.fileSubPath) {
    const shardEl = document.querySelector<HTMLElement>(
      `.memory-shard[data-shard-encoded]`
    );
    // Find the matching shard by iterating encoded data
    document.querySelectorAll<HTMLElement>('.memory-shard[data-shard-encoded]').forEach((el) => {
      const encoded = el.dataset.shardEncoded!;
      const { file } = JSON.parse(decodeURIComponent(encoded)) as { file: NovelFile; folderKey: string; breadcrumb: string };
      if (file.slug === state.fileSubPath) {
        openShardEncoded(encoded, false);
      }
    });
  }
});

// ── Initial state from server-rendered URL props ────────────
const page = document.querySelector('.novel-page') as HTMLElement;
const initFolder  = page.dataset.initialFolder  || null;
const initSubPath = page.dataset.initialSubpath || null;

if (initFolder) {
  // Replace history state so back works from the initial URL
  history.replaceState(
    { folderSlug: initFolder, fileSubPath: initSubPath ?? null },
    '',
    window.location.pathname
  );

  // Defer until layout is complete so getBoundingClientRect() has real values
  requestAnimationFrame(() => {
    const clusterEl = document.querySelector<HTMLElement>(`[data-folder="${initFolder}"]`);
    if (clusterEl) toggleFolder(clusterEl, false);

    if (initSubPath) {
      requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>('.memory-shard[data-shard-encoded]').forEach((el) => {
          const encoded = el.dataset.shardEncoded!;
          const { file } = JSON.parse(decodeURIComponent(encoded)) as { file: NovelFile; folderKey: string; breadcrumb: string };
          if (file.slug === initSubPath) {
            openShardEncoded(encoded, false);
          }
        });
      });
    }
  });
} else {
  history.replaceState({ folderSlug: null, fileSubPath: null }, '', '/novel');
}
```

- [ ] **Step 2: Verify the build**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```

Expected: build completes with no errors.

- [ ] **Step 3: Smoke test in browser**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run preview
```

Open `http://localhost:4321/novel` in a browser. Verify:
1. Rain canvas is visible in the background
2. "Remember Rain" title with reflection and waterline renders
3. Folder clusters (Characters, Locations, Lore, Scenes, Themes) appear in the left panel
4. Scenes cluster is greyed out and not clickable
5. Clicking a folder cluster highlights it and populates the right panel with shard rows
6. Clicking a shard row opens the full-screen reading overlay with correct content
7. Clicking outside the content column dismisses the overlay
8. The "← return shard" button also dismisses the overlay
9. Browser back button restores the previous state correctly
10. Navigating directly to `/novel/lore` opens with Lore cluster selected
11. Navigating directly to `/novel/characters/rain` opens with Characters selected and Rain overlay open

- [ ] **Step 4: Commit**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net
git add "src/pages/novel/[...slug].astro"
git commit -m "feat(novel): replace scatter JS with two-panel navigator, rain canvas, reading overlay"
```

---

## Spec Coverage Self-Review

| Spec requirement | Covered by |
|---|---|
| Two-panel grid (260px + 1fr) | Task 1 CSS (`.navigator`), Task 2 HTML |
| Rain canvas background | Task 3 JS (canvas IIFE) |
| Title reflection + waterline | Task 1 CSS, Task 2 HTML |
| Eyebrow subtitle | Task 1 CSS, Task 2 HTML |
| Frosted glass cluster faces | Task 1 CSS (`.cluster-face`, `::before`, `::after`) |
| Per-folder accent colors | Task 1 CSS (`[data-folder=*]` vars) |
| Empty folder state | Task 2 HTML (conditional `.empty` class) |
| Shard panel populated on click | Task 3 JS (`toggleFolder`) |
| Shard count in panel header | Task 3 JS |
| Reading overlay (full-screen, 97% dim) | Task 1 CSS (`.reading-overlay`), Task 2 HTML, Task 3 JS |
| Centered column + click-outside dismiss | Task 1 CSS (`.reading-content` cursor:pointer, `.reading-inner` cursor:default) |
| Image extraction to right column | Task 3 JS (`extractImages`) |
| One-line date format | Task 3 JS (`formatDate`) |
| History API (pushState + popstate) | Task 3 JS |
| Direct URL navigation works | Task 3 JS (initial state block) |
| `prefers-reduced-motion` | Task 1 CSS (media query) |
| Mobile layout (single column) | Task 1 CSS (768px breakpoint) |
