# Novel Page Navigation & Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Widen the sidebar to 320px with larger mixed-case file buttons, remove the 620px content body cap, and add a collapsible edge-tab toggle that persists to localStorage.

**Architecture:** Two files change: `src/styles/novel.css` gets the layout/typography/new-component CSS, and `src/pages/novel/[...slug].astro` gets the new `<button class="sidebar-tab">` HTML element and the JS toggle logic inside the existing `init()` function. The sidebar collapse tab is positioned absolutely as a sibling of the sidebar (not inside it) so it is never clipped by the sidebar's `overflow: hidden`.

**Tech Stack:** Astro 5, vanilla CSS custom properties, vanilla TypeScript in `<script>` blocks, localStorage.

---

## File Map

| File | Lines | Change |
|---|---|---|
| `src/styles/novel.css` | 157–164 | `.novel-panels`: grid → flex, add `position: relative` |
| `src/styles/novel.css` | 167–172 | `.novel-sidebar`: add explicit width, flex-shrink, transition |
| `src/styles/novel.css` | 251–257 | `.novel-content`: add `flex: 1; min-width: 0` |
| `src/styles/novel.css` | 313–319 | `.content-body`: remove `max-width: 620px` |
| `src/styles/novel.css` | 210–248 | `.sidebar-file` and overrides: bigger, mixed-case |
| `src/styles/novel.css` | after 363 | Add `.sidebar-tab` styles (new) |
| `src/styles/novel.css` | 365–371 | Add `.novel-sidebar`, `.sidebar-tab` to reduced-motion block |
| `src/styles/novel.css` | 373–403 | Mobile block: grid → flex-direction, sidebar width override |
| `src/pages/novel/[...slug].astro` | 97–100 | Add `<button class="sidebar-tab">` between sidebar and content divs |
| `src/pages/novel/[...slug].astro` | ~391 | Add `setSidebarCollapsed()` + localStorage restore + tab click listener |

---

## Task 1: CSS — Panel layout, sidebar width, and content body

**Files:**
- Modify: `src/styles/novel.css:157–164` (`.novel-panels`)
- Modify: `src/styles/novel.css:167–172` (`.novel-sidebar`)
- Modify: `src/styles/novel.css:251–257` (`.novel-content`)
- Modify: `src/styles/novel.css:313–319` (`.content-body`)
- Modify: `src/styles/novel.css:385–402` (mobile overrides)

- [ ] **Step 1: Replace `.novel-panels` rule**

Replace lines 157–164:
```css
.novel-panels {
  display: grid;
  grid-template-columns: 200px 1fr;
  flex: 1;
  min-height: 0;
  border: 1px solid rgba(100,140,200,0.1);
  overflow: hidden;
}
```
With:
```css
.novel-panels {
  display: flex;
  position: relative;
  flex: 1;
  min-height: 0;
  border: 1px solid rgba(100,140,200,0.1);
  overflow: hidden;
}
```

- [ ] **Step 2: Replace `.novel-sidebar` rule**

Replace lines 167–172:
```css
.novel-sidebar {
  border-right: 1px solid rgba(100,140,200,0.1);
  overflow-y: auto;
  padding: 0.6rem 0;
  background: rgba(255,255,255,0.018);
}
```
With:
```css
.novel-sidebar {
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid rgba(100,140,200,0.1);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.6rem 0;
  background: rgba(255,255,255,0.018);
  transition: width 280ms cubic-bezier(0.16, 1, 0.3, 1),
              border-right-color 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.novel-sidebar.is-collapsed {
  width: 0;
  overflow: hidden;
  padding: 0;
  border-right-color: transparent;
}
```

- [ ] **Step 3: Update `.novel-content` rule**

Replace lines 251–257:
```css
.novel-content {
  padding: 1.75rem 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
```
With:
```css
.novel-content {
  flex: 1;
  min-width: 0;
  padding: 1.75rem 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
```

- [ ] **Step 4: Remove `max-width` from `.content-body`**

Replace lines 313–319:
```css
.content-body {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.85;
  color: rgba(200,215,235,0.85);
  max-width: 620px;
}
```
With:
```css
.content-body {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.85;
  color: rgba(200,215,235,0.85);
}
```

- [ ] **Step 5: Update mobile block**

Replace lines 385–402 (inside `@media (max-width: 768px)`):
```css
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
```
With:
```css
  .novel-panels {
    flex-direction: column;
    overflow: visible;
    border: none;
  }

  .novel-sidebar {
    width: 100% !important;
    flex-shrink: initial;
    border-right: none;
    border-bottom: 1px solid rgba(100,140,200,0.1);
    max-height: 260px;
    overflow-y: auto;
    transition: none;
  }

  .novel-content {
    padding: 1.25rem;
    overflow-y: visible;
  }
```

- [ ] **Step 6: Build to verify no errors**

```bash
npm run build
```
Expected: exits 0, no TypeScript or Astro errors.

- [ ] **Step 7: Commit**

```bash
git add src/styles/novel.css
git commit -m "feat: novel panels flex layout, sidebar 320px, fluid content body"
```

---

## Task 2: CSS — File button typography

**Files:**
- Modify: `src/styles/novel.css:210–248`

- [ ] **Step 1: Replace `.sidebar-file` rule and its variants**

Replace lines 210–248:
```css
.sidebar-file {
  display: block;
  width: 100%;
  padding: 5px 12px 5px 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
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
```
With:
```css
.sidebar-file {
  display: block;
  width: 100%;
  padding: 9px 16px 9px 28px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
  text-transform: none;
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
  padding-left: 26px;
}

/* Flat file list (no subfolder groups — used by Themes, Locations) */
.novel-sidebar > .sidebar-file {
  padding-left: 18px;
}
.novel-sidebar > .sidebar-file.is-active {
  padding-left: 16px;
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/styles/novel.css
git commit -m "feat: novel sidebar file buttons larger mixed-case text"
```

---

## Task 3: CSS — Sidebar collapse tab styles

**Files:**
- Modify: `src/styles/novel.css` (add new `.sidebar-tab` block after existing sidebar rules; update reduced-motion and mobile blocks)

- [ ] **Step 1: Add collapse tab styles**

After the `.novel-sidebar > .sidebar-file.is-active` rule (after line 248) and before the `/* ══ Content panel ══ */` comment, insert:

```css
/* ══ Sidebar collapse tab ══ */
.sidebar-tab {
  position: absolute;
  top: 50%;
  left: 320px;
  transform: translateY(-50%);
  z-index: 10;
  writing-mode: vertical-lr;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 14px 6px;
  background: rgba(10, 12, 20, 0.92);
  border: 1px solid rgba(100,140,200,0.2);
  border-left: none;
  color: rgba(200,215,235,0.4);
  cursor: pointer;
  border-radius: 0 3px 3px 0;
  line-height: 1;
  user-select: none;
  appearance: none;
  -webkit-appearance: none;
  transition: left 280ms cubic-bezier(0.16, 1, 0.3, 1),
              color 150ms ease,
              border-color 150ms ease;
}

.sidebar-tab:hover {
  color: rgba(200,215,235,0.85);
  border-color: rgba(100,140,200,0.45);
}

.sidebar-tab.is-collapsed {
  left: 0;
  border-left: 1px solid rgba(100,140,200,0.2);
  border-right: none;
  border-radius: 3px 0 0 3px;
}
```

- [ ] **Step 2: Add to reduced-motion block**

The existing block at ~line 366 reads:
```css
@media (prefers-reduced-motion: reduce) {
  .filter-tab { transition: none; }
  .sidebar-group-btn,
  .sidebar-file { transition: none; }
  .sidebar-arrow { transition: none; }
}
```
Replace with:
```css
@media (prefers-reduced-motion: reduce) {
  .filter-tab { transition: none; }
  .sidebar-group-btn,
  .sidebar-file { transition: none; }
  .sidebar-arrow { transition: none; }
  .novel-sidebar,
  .sidebar-tab { transition: none; }
}
```

- [ ] **Step 3: Hide tab in mobile block**

Inside the `@media (max-width: 768px)` block, add after the `.novel-content` rule:
```css
  .sidebar-tab { display: none; }
```

- [ ] **Step 4: Build to verify**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/styles/novel.css
git commit -m "feat: novel sidebar collapse tab CSS"
```

---

## Task 4: HTML — Add sidebar-tab element

**Files:**
- Modify: `src/pages/novel/[...slug].astro:97–100`

- [ ] **Step 1: Add the button element**

The current `.novel-panels` div in `[...slug].astro` (lines 97–100) reads:
```html
<div class="novel-panels">
  <div class="novel-sidebar" id="novel-sidebar"></div>
  <div class="novel-content" id="novel-content"></div>
</div>
```
Replace with:
```html
<div class="novel-panels">
  <div class="novel-sidebar" id="novel-sidebar"></div>
  <button class="sidebar-tab" id="sidebar-tab" type="button" aria-label="Hide navigation">◀ hide</button>
  <div class="novel-content" id="novel-content"></div>
</div>
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```
Expected: exits 0. The button will be visible in the DOM but non-functional until Task 5.

- [ ] **Step 3: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat: add sidebar-tab collapse button to novel panels"
```

---

## Task 5: JS — Toggle behavior and localStorage

**Files:**
- Modify: `src/pages/novel/[...slug].astro` (inside the `<script>` block, within `init()`)

- [ ] **Step 1: Add toggle logic inside `init()`**

In the `<script>` block's `init()` function, find this existing comment and code (~line 390):
```typescript
// ── Panel refs ───────────────────────────────────────────────────
const sidebar = document.getElementById('novel-sidebar')!;
const content = document.getElementById('novel-content')!;
```

Immediately after the two `const` declarations (before the `// ── Tab click` comment), insert:

```typescript
// ── Collapse toggle ──────────────────────────────────────────────
const LS_KEY = 'novel-sidebar-collapsed';
const tabBtn = document.getElementById('sidebar-tab') as HTMLButtonElement | null;

function setSidebarCollapsed(collapsed: boolean, skipTransition = false): void {
  if (skipTransition) {
    sidebar.style.transition = 'none';
    if (tabBtn) tabBtn.style.transition = 'none';
    sidebar.offsetHeight; // force reflow so transition is bypassed
  }
  sidebar.classList.toggle('is-collapsed', collapsed);
  if (tabBtn) {
    tabBtn.classList.toggle('is-collapsed', collapsed);
    tabBtn.setAttribute('aria-label', collapsed ? 'Show navigation' : 'Hide navigation');
    tabBtn.textContent = collapsed ? '▶ show' : '◀ hide';
  }
  if (skipTransition) {
    requestAnimationFrame(() => {
      sidebar.style.transition = '';
      if (tabBtn) tabBtn.style.transition = '';
    });
  }
}

// Restore persisted collapsed state without animation
if (window.innerWidth > 768) {
  setSidebarCollapsed(localStorage.getItem(LS_KEY) === 'true', true);
}

tabBtn?.addEventListener('click', () => {
  if (window.innerWidth <= 768) return;
  const nowCollapsed = !sidebar.classList.contains('is-collapsed');
  setSidebarCollapsed(nowCollapsed);
  localStorage.setItem(LS_KEY, String(nowCollapsed));
});
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```
Expected: exits 0, no TypeScript errors.

- [ ] **Step 3: Run dev server and verify behaviour**

```bash
npm run dev
```

Open `http://localhost:4321/novel` and check:

1. Sidebar renders at ~320px wide with larger, mixed-case file names
2. Content body text fills the full panel width — no blank margin on the right
3. The `◀ hide` tab is visible at the right edge of the sidebar, vertically centered
4. Clicking `◀ hide` animates the sidebar to 0 width; tab slides left and changes to `▶ show`
5. Clicking `▶ show` restores the sidebar; tab slides right and changes to `◀ hide`
6. Refresh the page while collapsed — sidebar stays collapsed (localStorage restored)
7. Narrow the browser below 768px — tab disappears, sidebar stacks above content normally
8. Run `npm run test` and verify all existing novel utility tests pass

```bash
npm run test
```
Expected: all tests in `src/tests/novel.test.ts` pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/novel/[...slug].astro
git commit -m "feat: novel sidebar collapse toggle with localStorage persistence"
```
