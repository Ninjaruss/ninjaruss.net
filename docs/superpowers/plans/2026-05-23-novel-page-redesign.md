# Novel Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken scatter canvas (which overlaps when folders have many files) with a two-panel navigator: a collapsible sidebar tree on the left and inline file content on the right.

**Architecture:** Three files change. `src/styles/novel.css` keeps its first 155 lines (canvas, layout, title, tabs) and replaces everything after with two-panel CSS. `src/pages/novel/[...slug].astro` gets a small HTML swap (scatter div + reading overlay → two panel divs) and a full script replacement. `vanilla-tilt` is uninstalled.

**Tech Stack:** Astro 5, vanilla TypeScript (inline `<script>`), CSS custom properties, History API

---

### Task 1: Rewrite `novel.css`

**Files:**
- Modify: `src/styles/novel.css`

- [ ] **Step 1: Replace `src/styles/novel.css` with the following**

The first 155 lines (canvas, layout, title block, filter tabs) are unchanged. Everything after line 155 is replaced with two-panel rules.

```css
/* ============================================================
   Novel Page — Remember Rain
   Scatter canvas navigator + clip-path reading overlay
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

/* ══ Main layout — full viewport, flex column stack ══ */
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
  appearance: none;
  -webkit-appearance: none;
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

.filter-tab:active {
  transform: translateY(1px);
  transition-duration: 60ms;
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

/* ══ Two-panel navigator ══ */
.novel-panels {
  display: grid;
  grid-template-columns: 200px 1fr;
  flex: 1;
  min-height: 0;
  border: 1px solid rgba(100,140,200,0.1);
  overflow: hidden;
}

/* ══ Sidebar ══ */
.novel-sidebar {
  border-right: 1px solid rgba(100,140,200,0.1);
  overflow-y: auto;
  padding: 0.6rem 0;
  background: rgba(255,255,255,0.018);
}

.sidebar-group { margin-bottom: 0.1rem; }

.sidebar-group-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(var(--panel-accent-rgb, 255,229,44), 0.65);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: color 150ms ease;
  appearance: none;
  -webkit-appearance: none;
}
.sidebar-group-btn:hover { color: rgba(var(--panel-accent-rgb, 255,229,44), 0.9); }
.sidebar-group-btn.is-open { color: rgba(var(--panel-accent-rgb, 255,229,44), 0.95); }

.sidebar-arrow {
  font-size: 0.45rem;
  opacity: 0.7;
  transition: transform 200ms ease;
  flex-shrink: 0;
  display: inline-block;
}
.sidebar-group-btn.is-open .sidebar-arrow { transform: rotate(90deg); }

.sidebar-files { display: none; }
.sidebar-files.is-open { display: block; }

.sidebar-file {
  display: block;
  width: 100%;
  padding: 3px 12px 3px 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(200,215,235,0.45);
  background: none;
  border: none;
  border-left: 2px solid transparent;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
  appearance: none;
  -webkit-appearance: none;
}
.sidebar-file:hover {
  color: rgba(200,215,235,0.8);
  background: rgba(255,255,255,0.025);
}
.sidebar-file.is-active {
  color: rgba(var(--panel-accent-rgb, 255,229,44), 0.92);
  background: rgba(var(--panel-accent-rgb, 255,229,44), 0.055);
  border-left-color: rgba(var(--panel-accent-rgb, 255,229,44), 0.6);
  padding-left: 22px;
}

/* Flat file list (no subfolder groups — used by Themes, Locations) */
.novel-sidebar > .sidebar-file {
  padding-left: 14px;
}
.novel-sidebar > .sidebar-file.is-active {
  padding-left: 12px;
}

/* ══ Content panel ══ */
.novel-content {
  padding: 1.75rem 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.content-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.6rem;
  opacity: 0.3;
}
.content-placeholder-line {
  width: 32px;
  height: 1px;
  background: rgba(var(--panel-accent-rgb, 122,184,255), 0.5);
}
.content-placeholder-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(var(--panel-accent-rgb, 122,184,255), 0.7);
}

.content-breadcrumb {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(var(--panel-accent-rgb, 255,229,44), 0.55);
  margin-bottom: 0.5rem;
}

.content-title {
  font-family: 'Archivo Black', 'Arial Black', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  font-weight: 900;
  line-height: 1.05;
  color: rgba(var(--panel-accent-rgb, 255,229,44), 0.95);
  margin-bottom: 0.35rem;
}

.content-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: rgba(var(--panel-accent-rgb, 255,229,44), 0.4);
  margin-bottom: 1.25rem;
}

.content-divider {
  height: 1px;
  background: linear-gradient(to right, rgba(var(--panel-accent-rgb, 255,229,44), 0.25) 0%, transparent 60%);
  margin-bottom: 1.5rem;
}

.content-body {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.85;
  color: rgba(200,215,235,0.85);
  max-width: 620px;
}
.content-body p { margin-bottom: 1.25em; }
.content-body strong { color: rgba(var(--panel-accent-rgb, 200,220,255), 0.95); }
.content-body em { color: rgba(200,215,235,0.65); }
.content-body h2,
.content-body h3 {
  font-family: 'Archivo Black', sans-serif;
  color: rgba(var(--panel-accent-rgb, 200,220,255), 0.9);
  margin: 2em 0 0.75em;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.content-body ul,
.content-body ol { padding-left: 1.5em; margin-bottom: 1.25em; }
.content-body li { margin-bottom: 0.4em; }
.content-body img { max-width: 100%; display: block; margin: 1.5em 0; }
.content-body table {
  display: block;
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5em;
  font-size: 0.875rem;
  white-space: nowrap;
}
.content-body th,
.content-body td {
  padding: 8px 14px;
  border: 1px solid rgba(var(--panel-accent-rgb, 80,120,200), 0.18);
  text-align: left;
  vertical-align: top;
}
.content-body th {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(var(--panel-accent-rgb, 200,220,255), 0.75);
  background: rgba(var(--panel-accent-rgb, 80,120,200), 0.07);
  white-space: nowrap;
}
.content-body td { color: rgba(200,215,235,0.8); }
.content-body tbody tr:nth-child(even) td { background: rgba(255,255,255,0.025); }

/* ══ Reduced motion ══ */
@media (prefers-reduced-motion: reduce) {
  .filter-tab { transition: none; }
  .sidebar-group-btn,
  .sidebar-file { transition: none; }
  .sidebar-arrow { transition: none; }
}

/* ══ Mobile (below 768px) ══ */
@media (max-width: 768px) {
  .novel-page {
    padding: 1.5rem;
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .filter-tabs { gap: 4px; }
  .filter-tab { font-size: 0.58rem; padding: 4px 8px; }

  .novel-panels {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    overflow: visible;
    border: none;
  }

  .novel-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(100,140,200,0.1);
    max-height: 260px;
    overflow-y: auto;
  }

  .novel-content {
    padding: 1.25rem;
    overflow-y: visible;
  }
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```

Expected: build completes, no CSS parse errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/novel.css
git commit -m "style(novel): replace scatter/overlay CSS with two-panel navigator"
```

---

### Task 2: Update HTML in `[...slug].astro`

**Files:**
- Modify: `src/pages/novel/[...slug].astro`

- [ ] **Step 1: Replace the scatter canvas div and reading overlay**

In `src/pages/novel/[...slug].astro`, find this block (around line 97–124):

```astro
    <!-- Scatter canvas: populated entirely by JS -->
    <div class="scatter-canvas" id="scatter-canvas"></div>
  </main>

  <!-- Full-screen reading overlay -->
  <div class="reading-overlay" id="reading-overlay">
    <div class="reading-shard" id="reading-shard">
      <div class="reading-content" id="reading-content" onclick="window.__novelCloseReading && window.__novelCloseReading()">
        <button
          class="reading-back"
          type="button"
          id="reading-back"
          onclick="event.stopPropagation(); window.__novelCloseReading && window.__novelCloseReading()"
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
```

Replace it with:

```astro
    <!-- Two-panel navigator: populated by JS -->
    <div class="novel-panels">
      <div class="novel-sidebar" id="novel-sidebar"></div>
      <div class="novel-content" id="novel-content"></div>
    </div>
  </main>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```

Expected: build completes. The page will show an empty panel area since the JS still references `scatter-canvas` — that's fine, fixed in Task 3.

- [ ] **Step 3: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat(novel): replace scatter canvas + reading overlay HTML with two-panel panels"
```

---

### Task 3: Replace the inline script in `[...slug].astro`

**Files:**
- Modify: `src/pages/novel/[...slug].astro`

- [ ] **Step 1: Replace the entire `<script>` block**

In `src/pages/novel/[...slug].astro`, find the entire `<script>` block that starts at around line 132 with:

```typescript
<script>
  import VanillaTilt from 'vanilla-tilt';
```

and ends at around line 818 with:

```typescript
  document.addEventListener('astro:page-load', init);
</script>
```

Replace the entire block with the following:

```astro
<script>
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

  // ── Constants ────────────────────────────────────────────────────────
  const ACCENT_MAP: Record<string, string> = {
    characters: '255,229,44',
    locations:  '122,184,255',
    lore:       '255,136,34',
    scenes:     '255,102,102',
    themes:     '170,170,255',
  };

  // ── Pure helpers ─────────────────────────────────────────────────────
  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatDate(created: string | null, modified: string | null): string {
    if (!created && !modified) return '';
    if (!created) return modified!;
    if (!modified || created === modified) return created;
    return `${created} · edited ${modified}`;
  }

  function findSidebarFile(sidebar: HTMLElement, subPath: string): HTMLElement | null {
    return Array.from(sidebar.querySelectorAll<HTMLElement>('.sidebar-file'))
      .find((btn) => btn.dataset.subPath === subPath) ?? null;
  }

  // ── Sidebar renderer ─────────────────────────────────────────────────
  function renderSidebar(folderKey: string, tree: NovelTree, sidebar: HTMLElement): void {
    sidebar.innerHTML = '';
    const folder = tree[folderKey];
    if (!folder) return;

    const rgb = ACCENT_MAP[folderKey] || '80,120,200';
    sidebar.style.setProperty('--panel-accent-rgb', rgb);

    const hasSubfolders = Object.keys(folder.subfolders).length > 0;

    if (!hasSubfolders) {
      // Flat list (Themes, Locations, Scenes)
      for (const file of folder.files) {
        const btn = buildFileBtn(file, file.slug, folderKey, folder.title);
        sidebar.appendChild(btn);
      }
      return;
    }

    // Subfolder groups
    for (const sub of Object.values(folder.subfolders)) {
      const entries: Array<{ file: NovelFile; breadcrumb: string; subPath: string }> = [];
      collectEntries(sub, folder.title, entries);
      if (entries.length === 0) continue;

      const group = document.createElement('div');
      group.className = 'sidebar-group';

      const groupBtn = document.createElement('button');
      groupBtn.className = 'sidebar-group-btn is-open';
      groupBtn.type = 'button';
      groupBtn.innerHTML = `<span class="sidebar-arrow">&#9658;</span>${esc(sub.title)}`;

      const fileList = document.createElement('div');
      fileList.className = 'sidebar-files is-open';

      groupBtn.addEventListener('click', () => {
        groupBtn.classList.toggle('is-open');
        fileList.classList.toggle('is-open');
      });

      for (const { file, breadcrumb, subPath } of entries) {
        fileList.appendChild(buildFileBtn(file, subPath, folderKey, breadcrumb));
      }

      group.appendChild(groupBtn);
      group.appendChild(fileList);
      sidebar.appendChild(group);
    }

    // Root-level files alongside subfolders (if any)
    for (const file of folder.files) {
      sidebar.appendChild(buildFileBtn(file, file.slug, folderKey, folder.title));
    }
  }

  function collectEntries(
    sub: NovelFolder,
    parentLabel: string,
    out: Array<{ file: NovelFile; breadcrumb: string; subPath: string }>
  ): void {
    const bc = `${parentLabel} / ${sub.title}`;
    for (const file of sub.files) {
      const subPath = file.path.slice(1).join('/') || file.slug;
      out.push({ file, breadcrumb: bc, subPath });
    }
    for (const nested of Object.values(sub.subfolders)) {
      collectEntries(nested, bc, out);
    }
  }

  function buildFileBtn(
    file: NovelFile, subPath: string, folderKey: string, breadcrumb: string
  ): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'sidebar-file';
    btn.type = 'button';
    btn.textContent = file.title;
    btn.dataset.subPath  = subPath;
    btn.dataset.folderKey  = folderKey;
    btn.dataset.breadcrumb = breadcrumb;
    btn.dataset.fileEncoded = encodeURIComponent(JSON.stringify(file));
    return btn;
  }

  // ── Content panel ────────────────────────────────────────────────────
  function showPlaceholder(folderKey: string, content: HTMLElement): void {
    const rgb = ACCENT_MAP[folderKey] || '122,184,255';
    content.style.setProperty('--panel-accent-rgb', rgb);
    content.innerHTML = `
      <div class="content-placeholder">
        <div class="content-placeholder-line"></div>
        <div class="content-placeholder-text">select a file to read</div>
        <div class="content-placeholder-line"></div>
      </div>`;
  }

  function renderContent(
    folderKey: string, file: NovelFile, breadcrumb: string, content: HTMLElement
  ): void {
    const rgb = ACCENT_MAP[folderKey] || '80,120,200';
    content.style.setProperty('--panel-accent-rgb', rgb);
    const dateStr = formatDate(file.created, file.modified);
    // file.body is build-time-rendered Markdown from the repository — not runtime user input
    content.innerHTML = `
      <div class="content-breadcrumb">${esc(breadcrumb)}</div>
      <h1 class="content-title">${esc(file.title)}</h1>
      ${dateStr ? `<div class="content-date">${esc(dateStr)}</div>` : ''}
      <div class="content-divider"></div>
      <div class="content-body">${file.body}</div>`;
  }

  // ── File selection ────────────────────────────────────────────────────
  function selectFile(
    folderKey: string, file: NovelFile, breadcrumb: string, subPath: string,
    sidebar: HTMLElement, content: HTMLElement, pushState = true
  ): void {
    sidebar.querySelectorAll<HTMLElement>('.sidebar-file').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.subPath === subPath);
    });
    renderContent(folderKey, file, breadcrumb, content);
    if (pushState && currentFolderSlug) {
      history.pushState(
        { folderSlug: currentFolderSlug, fileSubPath: subPath },
        '',
        `/novel/${currentFolderSlug}/${subPath}`
      );
    }
  }

  // ── Folder switching ──────────────────────────────────────────────────
  let currentFolderSlug: string | null = null;
  let isSwitching = false;

  async function switchFolder(
    folderKey: string, tree: NovelTree,
    sidebar: HTMLElement, content: HTMLElement,
    pushState = true
  ): Promise<void> {
    if (isSwitching) return;
    isSwitching = true;
    try {
      document.querySelectorAll<HTMLElement>('.filter-tab').forEach((tab) => {
        const isActive = tab.dataset.folder === folderKey;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      currentFolderSlug = folderKey;
      renderSidebar(folderKey, tree, sidebar);
      showPlaceholder(folderKey, content);
      if (pushState) {
        history.pushState({ folderSlug: folderKey, fileSubPath: null }, '', `/novel/${folderKey}`);
      }
    } finally {
      isSwitching = false;
    }
  }

  // ── Main init ────────────────────────────────────────────────────────
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

    // ── Panel refs ───────────────────────────────────────────────────
    const sidebar = document.getElementById('novel-sidebar')!;
    const content = document.getElementById('novel-content')!;

    // ── Tab click ────────────────────────────────────────────────────
    document.getElementById('filter-tabs')!.addEventListener('click', (e) => {
      const tab = (e.target as Element).closest<HTMLElement>('.filter-tab');
      if (!tab?.dataset.folder) return;
      switchFolder(tab.dataset.folder, tree, sidebar, content);
    });

    document.getElementById('filter-tabs')!.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const tab = (e.target as Element).closest<HTMLElement>('.filter-tab');
      if (!tab?.dataset.folder) return;
      e.preventDefault();
      switchFolder(tab.dataset.folder, tree, sidebar, content);
    });

    // ── Sidebar delegated click ──────────────────────────────────────
    sidebar.addEventListener('click', (e) => {
      const fileBtn = (e.target as Element).closest<HTMLElement>('.sidebar-file');
      if (!fileBtn?.dataset.fileEncoded || !fileBtn.dataset.folderKey) return;
      try {
        const file: NovelFile = JSON.parse(decodeURIComponent(fileBtn.dataset.fileEncoded));
        selectFile(
          fileBtn.dataset.folderKey, file,
          fileBtn.dataset.breadcrumb ?? currentFolderSlug ?? '',
          fileBtn.dataset.subPath ?? file.slug,
          sidebar, content
        );
      } catch { /* malformed data attribute */ }
    });

    sidebar.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const fileBtn = (e.target as Element).closest<HTMLElement>('.sidebar-file');
      if (!fileBtn) return;
      e.preventDefault();
      fileBtn.click();
    });

    // ── Popstate — browser back/forward ─────────────────────────────
    function handlePopstate(e: PopStateEvent) {
      const state = e.state as { folderSlug: string | null; fileSubPath: string | null } | null;

      if (!state?.folderSlug) {
        sidebar.innerHTML = '';
        content.innerHTML = '';
        currentFolderSlug = null;
        document.querySelectorAll<HTMLElement>('.filter-tab').forEach((t) => {
          t.classList.remove('is-active');
          t.setAttribute('aria-pressed', 'false');
        });
        return;
      }

      const folderSwitchPromise = currentFolderSlug !== state.folderSlug
        ? switchFolder(state.folderSlug, tree, sidebar, content, false)
        : Promise.resolve();

      if (state.fileSubPath) {
        const targetSubPath = state.fileSubPath;
        folderSwitchPromise.then(() => {
          requestAnimationFrame(() => {
            const fileBtn = findSidebarFile(sidebar, targetSubPath);
            if (fileBtn?.dataset.fileEncoded && fileBtn.dataset.folderKey) {
              try {
                const file: NovelFile = JSON.parse(decodeURIComponent(fileBtn.dataset.fileEncoded));
                selectFile(
                  fileBtn.dataset.folderKey, file,
                  fileBtn.dataset.breadcrumb ?? currentFolderSlug ?? '',
                  targetSubPath, sidebar, content, false
                );
              } catch { /* malformed */ }
            }
          });
        });
      }
    }

    window.addEventListener('popstate', handlePopstate);

    document.addEventListener('astro:before-swap', () => {
      window.removeEventListener('popstate', handlePopstate);
    }, { once: true });

    // ── Initial state from server-rendered URL props ──────────────────
    const page       = document.querySelector('.novel-page') as HTMLElement;
    const initFolder = page.dataset.initialFolder  || null;
    const initSubPath = page.dataset.initialSubpath || null;

    function folderHasContent(f: NovelFolder): boolean {
      return f.files.length > 0 || Object.values(f.subfolders).some((s) => folderHasContent(s));
    }

    const firstFolder = (initFolder && tree[initFolder] && folderHasContent(tree[initFolder]))
      ? initFolder
      : Object.values(tree).find(folderHasContent)?.slug ?? null;

    if (firstFolder) {
      history.replaceState(
        { folderSlug: firstFolder, fileSubPath: initSubPath ?? null },
        '',
        window.location.pathname
      );
      switchFolder(firstFolder, tree, sidebar, content, false).then(() => {
        if (initSubPath) {
          requestAnimationFrame(() => {
            const fileBtn = findSidebarFile(sidebar, initSubPath);
            if (fileBtn?.dataset.fileEncoded && fileBtn.dataset.folderKey) {
              try {
                const file: NovelFile = JSON.parse(decodeURIComponent(fileBtn.dataset.fileEncoded));
                selectFile(
                  fileBtn.dataset.folderKey, file,
                  fileBtn.dataset.breadcrumb ?? firstFolder,
                  initSubPath, sidebar, content, false
                );
              } catch { /* malformed */ }
            }
          });
        }
      });
    } else {
      history.replaceState({ folderSlug: null, fileSubPath: null }, '', '/novel');
    }
  }

  document.addEventListener('astro:page-load', init);
</script>
```

- [ ] **Step 2: Run build and tests**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -30
```

Expected: build completes with no TypeScript or Astro errors.

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run test 2>&1 | tail -20
```

Expected: all tests pass (novel.test.ts covers `buildNovelTree`, `slugify`, `parseMetaData` — none of these changed).

- [ ] **Step 3: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat(novel): replace scatter JS with two-panel sidebar navigator"
```

---

### Task 4: Remove `vanilla-tilt`

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Uninstall the package**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm uninstall vanilla-tilt
```

Expected: `vanilla-tilt` removed from `package.json` dependencies and `node_modules`.

- [ ] **Step 2: Verify build still passes**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build 2>&1 | tail -20
```

Expected: build completes cleanly with no missing module errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): remove vanilla-tilt (no longer used after novel page redesign)"
```

---

### Task 5: Manual smoke test

**Files:** None (verification only)

- [ ] **Step 1: Start dev server**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run dev
```

Open `http://localhost:4321/novel` in a browser.

- [ ] **Step 2: Check Characters (19 files)**

- Tab "Characters" is active (gold border, glow)
- Sidebar shows Rain, Vesper, Claire, Shiori as collapsible groups
- All groups expanded by default, all file names visible
- No overlap anywhere
- Click `▶ Rain` — group collapses, arrow rotates
- Click it again — expands

- [ ] **Step 3: Check file selection**

- Click "Artifact" under Rain
- Right panel shows: breadcrumb `Characters / Rain`, title `Artifact` in gold, date, divider, prose body
- "Artifact" button in sidebar has gold border-left highlight
- URL updates to `/novel/characters/rain/artifact`

- [ ] **Step 4: Check Lore (10 files)**

- Click "Lore" tab — sidebar rebuilds with `Magic System` (9 files) and `Plot` (1 file)
- Open Magic System group, click "The Flare"
- Right panel shows The Flare content
- URL updates to `/novel/lore/magic-system/the-flare`

- [ ] **Step 5: Check flat folders (Themes, Locations)**

- Click "Themes" tab — sidebar shows 4 files directly (no group wrappers)
- Click any file — content renders in right panel

- [ ] **Step 6: Check browser back/forward**

- Navigate: Lore → Characters → click Rain/Artifact
- Press browser Back — returns to Characters folder, no file selected (placeholder shown)
- Press Back again — returns to Lore folder
- Press Forward — returns to Characters
- Press Forward again — re-selects Rain/Artifact and renders it

- [ ] **Step 7: Check direct URL navigation**

- Open `http://localhost:4321/novel/characters/rain/artifact` directly
- Page loads with Characters tab active, Rain expanded, Artifact highlighted, content visible

- [ ] **Step 8: Check mobile**

- Resize browser to 500px wide (or use DevTools device emulation)
- Sidebar stacks above content panel
- Sidebar scrollable to max 260px height
- File selection still works

- [ ] **Step 9: Run final build**

```bash
cd /Users/ninjaruss/Documents/GitHub/ninjaruss.net && npm run build && npm run test
```

Expected: both pass cleanly.
