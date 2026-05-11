# Media & Stream QC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all bugs and add missing features on `/media` and `/stream` per the QC spec.

**Architecture:** Pure in-place edits — no new files, no new utilities. Changes are isolated to two pages, one CSS file, one schema file, and two content files. Each task is self-contained and can be verified independently with `npm run build`.

**Tech Stack:** Astro 5, TypeScript, Zod, vanilla CSS, vanilla JS (no frameworks)

---

## File map

| File | What changes |
|------|-------------|
| `src/content/stream/2026-05-08-normal-walking-stream.md` | Fix `publishedAt` date |
| `src/content/stream/2026-05-10-jp-fairy-tales.md` | Fix `publishedAt` date |
| `src/content/config.ts` | `memorable` → optional |
| `src/styles/stream.css` | Remove dead rules + unused `:root` vars |
| `src/pages/stream/index.astro` | Add `role="tablist"` |
| `src/pages/media/index.astro` | All media fixes (structural, emblem, ESC, animation, reduced-motion, merge styles) |

---

## Task 1: Fix stream entry dates

**Files:**
- Modify: `src/content/stream/2026-05-08-normal-walking-stream.md`
- Modify: `src/content/stream/2026-05-10-jp-fairy-tales.md`

Both files have `publishedAt: 2026-05-06` even though their filenames say 2026-05-08 and 2026-05-10. This breaks sort order and the date display in the Journal panel.

- [ ] **Step 1: Fix the 05-08 file**

In `src/content/stream/2026-05-08-normal-walking-stream.md`, change:
```
publishedAt: 2026-05-06
```
to:
```
publishedAt: 2026-05-08
```

- [ ] **Step 2: Fix the 05-10 file**

In `src/content/stream/2026-05-10-jp-fairy-tales.md`, change:
```
publishedAt: 2026-05-06
```
to:
```
publishedAt: 2026-05-10
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```
Expected: build succeeds, no schema errors.

- [ ] **Step 4: Commit**

```bash
git add src/content/stream/2026-05-08-normal-walking-stream.md src/content/stream/2026-05-10-jp-fairy-tales.md
git commit -m "fix(stream): correct publishedAt dates for 05-08 and 05-10 entries"
```

---

## Task 2: Make `memorable` optional in stream schema

**Files:**
- Modify: `src/content/config.ts`

The stream schema requires `memorable: z.string()`, meaning the build fails if an entry omits it. Making it optional lets future entries skip the field gracefully. The template already guards the render with `entry.data.memorable &&`, so no template change is needed.

- [ ] **Step 1: Update the schema**

In `src/content/config.ts`, in the `stream` collection definition, change:
```typescript
memorable: z.string(),
```
to:
```typescript
memorable: z.string().optional(),
```

The full stream schema after the change:
```typescript
const stream = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    stats: z.array(z.enum(['Determination', 'Insight', 'Expression', 'Sincerity', 'Chaos'])),
    summary: z.string(),
    memorable: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: build succeeds. Existing entries with `memorable` still render; future entries without it won't crash.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "fix(stream): make memorable field optional in schema"
```

---

## Task 3: Remove dead CSS from stream.css

**Files:**
- Modify: `src/styles/stream.css`

Three groups of CSS rules have no corresponding HTML: the unused `:root` stat variables (colors are injected via inline styles from `STAT_META` instead), the `.s-obj-due*` due-date UI (planned but never built), and `.bond-stat-icon` (replaced by a direct `<img>`).

- [ ] **Step 1: Remove unused `:root` variables**

Delete this entire block from the top of `src/styles/stream.css` (lines 2–9):
```css
:root {
  --stat-determination: #ff4040;
  --stat-insight:       #4ab0ff;
  --stat-expression:    #a855f7;
  --stat-sincerity:     #ffe52c;
  --stat-chaos:         #2dd4bf;
}
```

- [ ] **Step 2: Remove dead `.s-obj-due*` rules**

Delete this block from `src/styles/stream.css` (in the `/* Date / Objective strip */` section, after `.s-obj-text`):
```css
.s-obj-due {
  display: flex;
  align-items: center;
  gap: 10px;
}
.s-obj-due-date {
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 72, 72, 0.9);
  font-weight: 700;
}
.s-obj-due-days {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 72, 72, 0.75);
  padding: 3px 12px;
  border-radius: 100px;
  border: 1px solid rgba(255, 72, 72, 0.3);
  background: rgba(255, 72, 72, 0.1);
  font-weight: 600;
}
```

- [ ] **Step 3: Remove dead `.bond-stat-icon` rule**

Delete this block from `src/styles/stream.css` (in the `/* Emblem column */` section, after `.bond-img`):
```css
.bond-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```
Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/stream.css
git commit -m "chore(stream): remove dead CSS rules and unused stat CSS variables"
```

---

## Task 4: Add `role="tablist"` to stream tabs

**Files:**
- Modify: `src/pages/stream/index.astro`

The tab buttons have `role="tab"` and `aria-selected` but their container `.s-tabs` is missing `role="tablist"`, which is required to complete the ARIA tabs pattern.

- [ ] **Step 1: Add the role attribute**

In `src/pages/stream/index.astro`, find the `.s-tabs` div (around line 147):
```html
<div class="s-tabs" id="tab-list">
```
Change it to:
```html
<div class="s-tabs" id="tab-list" role="tablist">
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/stream/index.astro
git commit -m "fix(stream): add role=tablist to tabs container for complete ARIA pattern"
```

---

## Task 5: Fix media page structural bugs

**Files:**
- Modify: `src/pages/media/index.astro`

Four structural fixes: invalid nested `<main>`, unused `data-animate` attribute, undefined CSS variable, and split `<style>` blocks.

- [ ] **Step 1: Replace nested `<main>` with `<div>` and remove `data-animate`**

In `src/pages/media/index.astro`, find (around line 30):
```astro
<main class="media-page" data-animate>
```
Change to:
```astro
<div class="media-page">
```

Find the closing tag that matches (around line 92):
```astro
  </main>
</BaseLayout>
```
Change to:
```astro
  </div>
</BaseLayout>
```

- [ ] **Step 2: Fix undefined CSS variable in `.qv-excerpt`**

In the second `<style>` block of `src/pages/media/index.astro`, find:
```css
.qv-excerpt {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}
```
Change `var(--color-text-muted)` to `var(--color-muted)`:
```css
.qv-excerpt {
  font-size: 13px;
  color: var(--color-muted);
  line-height: 1.6;
  margin: 0;
}
```

- [ ] **Step 3: Merge the two `<style>` blocks**

The page currently has two `<style>` blocks: one before `<script>` (page/filter/grid styles) and one after `<script>` (quick-view content styles). Move the content of the second `<style>` block into the first one (append before its closing `</style>`), then delete the second `<style>` block entirely.

The `.qv-*` rules to move are:
```css
  /* ── Quick-view panel inner content ────────────── */
  .qv-type {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-muted);
    margin: 0;
  }
  .qv-title {
    font-size: 1.2rem;
    font-weight: 900;
    color: var(--color-text);
    margin: 0;
    line-height: 1.2;
  }
  .qv-excerpt {
    font-size: 13px;
    color: var(--color-muted);
    line-height: 1.6;
    margin: 0;
  }
  .qv-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .qv-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 3px 8px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    color: var(--color-muted);
  }
  .qv-link {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-gold);
    text-decoration: none;
    letter-spacing: 0.06em;
    margin-top: var(--space-sm);
  }
  .qv-link:hover {
    text-decoration: underline;
  }
```

Append these rules inside the first `<style>` block (before its `</style>`), then delete the second `<style>` block.

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```
Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/media/index.astro
git commit -m "fix(media): nested main→div, remove data-animate, fix color var, merge style blocks"
```

---

## Task 6: Add emblem to quick-view panel

**Files:**
- Modify: `src/pages/media/index.astro`

The `openPanel()` function renders type, title, excerpt, tags, and link — but not the emblem image. The entry data already carries `emblem` (set in the `entryData` build step). This task adds the image and its styles.

- [ ] **Step 1: Add emblem to `openPanel()` HTML**

In `src/pages/media/index.astro`, inside `initMediaFilters`, find the `openPanel` function's `content.innerHTML` assignment. Replace it with:

```typescript
function openPanel(slug: string, entry: typeof entries[number]) {
  const content = document.getElementById('quick-view-content');
  if (content) {
    content.innerHTML = `
      <div class="qv-emblem">
        <img src="${esc(entry.emblem)}" alt="" />
      </div>
      <p class="qv-type">${esc(entry.type)}</p>
      <h2 class="qv-title">${esc(entry.title)}</h2>
      ${entry.excerpt ? `<p class="qv-excerpt">${esc(entry.excerpt)}</p>` : ''}
      ${entry.tags.length ? `<div class="qv-tags">${entry.tags.map((t) => `<span class="qv-tag">${esc(t)}</span>`).join('')}</div>` : ''}
      <a href="/media/${esc(slug)}" class="qv-link">View full entry →</a>
    `;
  }
  if (panel) {
    panel.hidden = false;
    layout?.classList.add('panel-open');
  }
  updateOpenURL(slug);
}
```

- [ ] **Step 2: Add `.qv-emblem` styles**

Inside the (now single) `<style>` block, append after the `.qv-link:hover` rule:

```css
  .qv-emblem {
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-sm);
  }
  .qv-emblem img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--color-border, #2a2a2a);
    background: var(--color-bg-elevated, #1a1a1a);
  }
```

- [ ] **Step 3: Verify build passes and emblem renders**

```bash
npm run build
```
Expected: build succeeds. Open the media page in a browser, click any card — the panel should show a circular emblem image above the type label.

- [ ] **Step 4: Commit**

```bash
git add src/pages/media/index.astro
git commit -m "feat(media): add emblem image to quick-view panel"
```

---

## Task 7: ESC handler, animation reset, and reduced-motion

**Files:**
- Modify: `src/pages/media/index.astro`

Three JS/CSS improvements to bring the media page up to parity with the stream page's patterns.

- [ ] **Step 1: Add ESC key handler**

Inside `initMediaFilters`, after the `closeBtn.addEventListener('click', closePanel)` line, add:

```typescript
// Close panel on Escape
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && panel && !panel.hidden) closePanel();
});
```

`panel.hidden` is already the source of truth for whether the panel is open, so no extra boolean is needed.

- [ ] **Step 2: Add animation reset to `applyFilters()`**

Replace the existing `applyFilters` function with this version that skips the reset on first call (the CSS animation handles initial load) and replays it on subsequent filter changes:

```typescript
let isFirstFilter = true;

function applyFilters() {
  const cards = grid!.querySelectorAll<HTMLElement>('.media-card');
  let visibleIndex = 0;
  const shouldAnimate = !isFirstFilter;
  isFirstFilter = false;

  cards.forEach((card) => {
    const type = card.dataset.type ?? '';
    const isFav = card.dataset.fav === 'true';

    const typeMatch = activeType === 'all' || type === activeType;
    const favMatch = !favOnly || isFav;
    const visible = typeMatch && favMatch;

    card.dataset.hidden = visible ? 'false' : 'true';

    if (visible) {
      card.style.setProperty('--card-index', String(visibleIndex));
      visibleIndex++;
      if (shouldAnimate) {
        card.style.animation = 'none';
        void card.offsetWidth; // force reflow to restart animation
        card.style.animation = '';
      }
    }
  });
}
```

Note: `isFirstFilter` must be declared in the outer `initMediaFilters` scope (before `applyFilters` is defined), not inside `applyFilters`.

- [ ] **Step 3: Add `prefers-reduced-motion` override**

In the `<style>` block, append after the `@media (max-width: 768px)` block:

```css
  @media (prefers-reduced-motion: reduce) {
    .media-card {
      animation: none;
    }
  }
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 5: Manual verification**

Start the dev server:
```bash
npm run dev
```

Check all three behaviours:
1. Open `/media`, click a card to open the panel, press Escape — panel should close.
2. Click a filter pill — visible cards should animate in with stagger.
3. In browser devtools, enable "Emulate CSS media feature prefers-reduced-motion: reduce" — cards should appear instantly with no animation.

- [ ] **Step 6: Commit**

```bash
git add src/pages/media/index.astro
git commit -m "feat(media): ESC to close panel, animate cards on filter, prefers-reduced-motion"
```

---

## Self-review

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| nested `<main>` → `<div>` | Task 5 |
| remove `data-animate` | Task 5 |
| fix `--color-text-muted` | Task 5 |
| merge `<style>` blocks | Task 5 |
| emblem in quick-view panel | Task 6 |
| ESC handler | Task 7 |
| animation reset on filter | Task 7 |
| `prefers-reduced-motion` | Task 7 |
| wrong stream dates | Task 1 |
| `memorable` optional | Task 2 |
| dead CSS removed | Task 3 |
| unused `:root` vars removed | Task 3 |
| `role="tablist"` added | Task 4 |

All 13 spec requirements covered. ✓

**Placeholder scan:** No TBDs, no "similar to Task N" references. All code blocks are complete. ✓

**Type consistency:** `entry: typeof entries[number]` is used consistently in Task 6 — matches the type already in the existing `openPanel` signature. `isFirstFilter` declared in Task 7 is a new local variable in `initMediaFilters` scope, not referenced elsewhere. ✓
