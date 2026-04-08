# Bento Tile Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix dead space and emblem layout in 6 homepage bento tiles so every tile uses its space intentionally.

**Architecture:** All changes are isolated to two files — `src/styles/bento.css` (one shared CSS rule) and `src/pages/index.astro` (data variables, slot HTML, scoped CSS, JS). No new components or files are created. The key CSS technique is `:has(.tile-emblems)` on the footer to make it grow and center emblems for Media/Showcase tiles.

**Tech Stack:** Astro 5, vanilla CSS, TypeScript in Astro frontmatter, Vitest (build validation only — no UI unit tests exist)

---

## File Map

| File | What changes |
|------|-------------|
| `src/styles/bento.css` | Add one rule: `.bento-tile__footer:has(.tile-emblems)` |
| `src/pages/index.astro` | Add `recentNotes` + `favoritesCount` in frontmatter; update Notes + Favorites tile slots; add/update scoped CSS for 5 tile overrides; extend JS link handler |

---

## Task 1: Fix emblem footer fill (bento.css)

Makes the footer grow and center its content when it contains `.tile-emblems`. This fixes Media and Showcase dead space in one rule.

**Files:**
- Modify: `src/styles/bento.css:487-490`

- [ ] **Step 1: Add the footer override rule**

Open `src/styles/bento.css`. Find the `.bento-tile__footer` block (around line 487):

```css
.bento-tile__footer {
  margin-top: auto;
  padding-top: var(--space-sm);
}
```

Add the following rule directly after it:

```css
/* When footer contains emblems, grow to fill remaining height and center them */
.bento-tile__footer:has(.tile-emblems) {
  flex: 1;
  margin-top: 0;
  padding-top: var(--space-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 2: Build to validate**

```bash
npm run build
```

Expected: Build completes with no errors or type warnings.

- [ ] **Step 3: Commit**

```bash
git add src/styles/bento.css
git commit -m "fix(bento): grow emblem footer to fill tile height and center content"
```

---

## Task 2: Scale up emblem sizes for Media and Showcase tiles

**Files:**
- Modify: `src/pages/index.astro` (scoped `<style>` block, `.media-tile .tile-emblem` around line 576)

- [ ] **Step 1: Update Media tile emblem size**

In `src/pages/index.astro`, find the existing `.media-tile .tile-emblem` override in the scoped `<style>` block:

```css
/* Slightly larger emblems */
.media-tile .tile-emblem {
  width: 80px;
  height: 80px;
  border: 2px solid var(--color-gold-dim);
}
```

Replace with:

```css
/* Larger emblems centered in filled footer area */
.media-tile .tile-emblem {
  width: 96px;
  height: 96px;
  border: 2px solid var(--color-gold-dim);
}
```

- [ ] **Step 2: Add Showcase tile emblem size override**

Directly after the `.media-tile .tile-emblem` block you just updated, add:

```css
.showcase-tile .tile-emblem {
  width: 80px;
  height: 80px;
}
```

- [ ] **Step 3: Build and verify visually**

```bash
npm run build && npm run preview
```

Open `http://localhost:4321`. The Media tile should show two 96px emblems centered in the lower area (no dead gap). The Showcase tile should show three 80px emblems centered similarly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "fix(bento): scale up Media and Showcase tile emblems to 96px/80px"
```

---

## Task 3: Add recentNotes and favoritesCount data

**Files:**
- Modify: `src/pages/index.astro` (frontmatter, around line 34–45)

- [ ] **Step 1: Add recentNotes variable**

In the frontmatter of `src/pages/index.astro`, find the block that defines `recentShowcase` and `recentMedia` (around line 34). After `recentMedia`, add:

```typescript
const recentNotes = notes
  .filter(e => e.data.publishedAt)
  .sort((a, b) => effectiveDate(b) - effectiveDate(a))
  .slice(0, 3)
  .map(e => ({ href: `/notes/${e.slug}`, title: e.data.title }));
```

- [ ] **Step 2: Add favoritesCount variable**

Immediately after `recentNotes`, add:

```typescript
const favoritesCount = media.filter(e => e.data.isFavorite).length;
```

- [ ] **Step 3: Build to validate types**

```bash
npm run build
```

Expected: No TypeScript errors. Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(bento): add recentNotes and favoritesCount data for tile slots"
```

---

## Task 4: Update Notes tile slot with clickable fragment titles

**Files:**
- Modify: `src/pages/index.astro` (Notes BentoTile around line 151, scoped `<style>` block)

- [ ] **Step 1: Open the Notes tile slot**

In `src/pages/index.astro`, find the Notes tile (around line 151). It currently self-closes:

```astro
<BentoTile
  href="/notes"
  variant="dark"
  label="Notes"
  title="Thoughts in Progress"
  description="An assortment of ideas I've been thinking about."
  class="bento-tile--core bento-tile--span-2x2 notes-tile"
/>
```

Replace with (open the slot and add the fragment list):

```astro
<BentoTile
  href="/notes"
  variant="dark"
  label="Notes"
  title="Thoughts in Progress"
  description="An assortment of ideas I've been thinking about."
  class="bento-tile--core bento-tile--span-2x2 notes-tile"
>
  {recentNotes.length > 0 && (
    <div class="tile-notes-list">
      {recentNotes.map(entry => (
        <div
          class="tile-note-link"
          data-href={entry.href}
          role="link"
          tabindex="0"
          title={entry.title}
        >
          {entry.title}
        </div>
      ))}
    </div>
  )}
</BentoTile>
```

- [ ] **Step 2: Add tile-notes-list CSS**

In the scoped `<style>` block, find the `/* ─── Notes Tile ─────────────────────────── */` section (around line 533). After the existing `.notes-tile::before` rule, add:

```css
/* Notes tile fragment list */
.tile-notes-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tile-note-link {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: rgba(255, 229, 44, 0.5);
  padding: var(--space-xs) 0;
  border-top: 1px solid rgba(255, 229, 44, 0.08);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.tile-note-link::before {
  content: '→ ';
  opacity: 0.6;
}

.tile-note-link:hover {
  color: var(--color-gold);
}

.tile-note-link:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
  border-radius: 2px;
}
```

- [ ] **Step 3: Build to validate**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(bento): add clickable recent fragment titles to Notes tile"
```

---

## Task 5: Wire up click navigation for note links

The Notes tile is an `<a>` tag, so nested `<a>` elements are invalid HTML. The `data-href` + JS pattern (already used for `.tile-emblem`) handles this.

**Files:**
- Modify: `src/pages/index.astro` (JS block, `initializeEmblemLinks` function around line 977)

- [ ] **Step 1: Extend the link handler**

Find `initializeEmblemLinks` (around line 977):

```typescript
function initializeEmblemLinks() {
  document.querySelectorAll<HTMLElement>('.tile-emblem[data-href]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = el.dataset.href!;
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = el.dataset.href!;
      }
    });
  });
}
```

Replace with (broaden the selector to include `.tile-note-link`):

```typescript
function initializeEmblemLinks() {
  document.querySelectorAll<HTMLElement>('.tile-emblem[data-href], .tile-note-link[data-href]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = el.dataset.href!;
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = el.dataset.href!;
      }
    });
  });
}
```

- [ ] **Step 2: Build and verify manually**

```bash
npm run build && npm run preview
```

Open `http://localhost:4321`. The Notes tile should show 3 recent fragment titles at the bottom. Clicking a title should navigate to that note (e.g. `/notes/addiction`), not to `/notes`. Keyboard navigation (Tab to focus, Enter to activate) should also work.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(bento): wire click/keyboard navigation for note fragment links"
```

---

## Task 6: Update Favorites tile slot with entry count

**Files:**
- Modify: `src/pages/index.astro` (Favorites BentoTile around line 160)

- [ ] **Step 1: Open the Favorites tile slot**

Find the Favorites tile (around line 160), currently self-closing:

```astro
<BentoTile
  href="/favorites"
  variant="dark"
  label="Favorites"
  title="Inspirations"
  description="My favorite characters, series, and soundtracks."
  class="bento-tile--span-1x2"
/>
```

Replace with:

```astro
<BentoTile
  href="/favorites"
  variant="dark"
  label="Favorites"
  title="Inspirations"
  description="My favorite characters, series, and soundtracks."
  class="bento-tile--span-1x2"
>
  <div class="tile-favorites-count">
    <span class="tile-favorites-count__num">{favoritesCount}</span>
    <span class="tile-favorites-count__label">curated<br />entries</span>
  </div>
</BentoTile>
```

- [ ] **Step 2: Add tile-favorites-count CSS**

In the scoped `<style>` block, after the `.tile-notes-list` rules you added in Task 4, add:

```css
/* Favorites tile count display */
.tile-favorites-count {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.tile-favorites-count__num {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  color: rgba(255, 229, 44, 0.35);
  line-height: 1;
  transition: color var(--transition-fast);
}

.bento-tile:hover .tile-favorites-count__num {
  color: rgba(255, 229, 44, 0.6);
}

.tile-favorites-count__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
  line-height: 1.4;
}
```

- [ ] **Step 3: Build and verify visually**

```bash
npm run build && npm run preview
```

Open `http://localhost:4321`. The Favorites tile should show the count number (e.g. `28`) with "curated entries" label in the lower portion of the tile.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(bento): add curated entry count to Favorites tile"
```

---

## Task 7: Novel tile vertical centering + Latest tile emblem height

Two small CSS-only fixes, batched into one commit.

**Files:**
- Modify: `src/pages/index.astro` (scoped `<style>` block)

- [ ] **Step 1: Fix Novel tile centering**

In the scoped `<style>` block, find the `.novel-tile` referenced in the JS section. There is no dedicated CSS rule for it yet. Add one at the bottom of the styles, before the `@media` blocks:

```css
/* Novel tile — center title and date vertically, no dead gap */
.novel-tile {
  justify-content: center;
  gap: var(--space-md);
}
```

- [ ] **Step 2: Fix Latest tile emblem height**

Find `.latest-tile__emblem-wrap` (around line 804):

```css
.latest-tile__emblem-wrap {
  flex-shrink: 0;
  width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Replace with:

```css
.latest-tile__emblem-wrap {
  flex-shrink: 0;
  width: 56px;
  display: flex;
  align-items: stretch;
}
```

Then find `.latest-tile__emblem` (around line 812):

```css
.latest-tile__emblem {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  border: 1px solid var(--color-border-strong);
  background: var(--color-bg-surface);
  opacity: 0.85;
  transition:
    opacity var(--transition-fast),
    border-color var(--transition-fast);
}
```

Replace with:

```css
.latest-tile__emblem {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-sm);
  object-fit: cover;
  border: 1px solid var(--color-border-strong);
  background: var(--color-bg-surface);
  opacity: 0.85;
  transition:
    opacity var(--transition-fast),
    border-color var(--transition-fast);
}
```

Also update the responsive overrides in the `@media (max-width: 768px)` block. Find:

```css
.latest-tile__emblem-wrap {
  width: 44px;
}

.latest-tile__emblem {
  width: 44px;
  height: 44px;
}
```

Replace with:

```css
.latest-tile__emblem-wrap {
  width: 48px;
}
```

(The emblem now uses `width: 100%; height: 100%` so the height override is no longer needed.)

- [ ] **Step 3: Build and verify visually**

```bash
npm run build && npm run preview
```

Open `http://localhost:4321`.
- Novel tile: "Remember Rain" and the date should be clustered together in the middle, not at opposite ends.
- Latest tile: The emblem thumbnail should fill the full tile height rather than floating at 52px in a taller space.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "fix(bento): center Novel tile content vertically; stretch Latest tile emblem to full height"
```

---

## Final check

- [ ] Run `npm run build` one final time to confirm a clean build with all 7 tasks applied.
- [ ] Run `npm run preview` and visually verify all 6 tiles on the homepage.
