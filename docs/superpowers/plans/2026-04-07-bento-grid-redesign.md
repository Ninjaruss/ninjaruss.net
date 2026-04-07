# Bento Grid Z-Flow Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rearrange the homepage bento grid into a Z-Flow layout with Novel as a 1×2 tile at bottom-right, fitting within a single viewport.

**Architecture:** Two files change — `bento.css` gets a new span class, `index.astro` gets tile class changes, a tile reorder, and one deletion. Changes are purely structural (CSS grid spans + HTML order). No JS or content changes.

**Tech Stack:** Astro 5, vanilla CSS grid, no frameworks.

---

## File Map

| File | What changes |
|------|-------------|
| `src/styles/bento.css` | Add `.bento-tile--span-4x2` + responsive rules at ≤1024px and ≤768px |
| `src/pages/index.astro` | Title: 3x2→2x2, YouTube #1: 3x2→4x2, Showcase: 3x2→4x2, Notes: 3x2→2x2, Now: remove span-2x1, Novel: move before Favs/MAL/Spotify, YouTube #2: delete |

---

### Task 1: Add `.bento-tile--span-4x2` CSS class

**Files:**
- Modify: `src/styles/bento.css:34-48`

- [ ] **Step 1: Add the new span class after the existing `.bento-tile--span-3x2` block**

In `src/styles/bento.css`, the span classes live at lines 34–48. Add the new class immediately after `.bento-tile--span-3x2`:

```css
/* Dense asymmetric layout spans */
.bento-tile--span-3x2 {
  grid-column: span 3;
  grid-row: span 2;
}

.bento-tile--span-4x2 {
  grid-column: span 4;
  grid-row: span 2;
}

.bento-tile--span-2x2 {
  grid-column: span 2;
  grid-row: span 2;
}

.bento-tile--span-2x1 {
  grid-column: span 2;
  grid-row: span 1;
}
```

- [ ] **Step 2: Add responsive rule at ≤1024px**

Inside the existing `@media (max-width: 1024px)` block (around line 524), add `.bento-tile--span-4x2` alongside the existing `.bento-tile--span-3x2` rule:

```css
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .bento-tile--span-3x2 {
    grid-column: span 2;
    grid-row: span 2;
  }

  .bento-tile--span-4x2 {
    grid-column: span 2;
    grid-row: span 2;
  }

  .bento-tile--dominant {
    grid-column: span 2;
  }
}
```

- [ ] **Step 3: Add responsive rule at ≤768px**

Inside the existing `@media (max-width: 768px)` block (around line 539), add `.bento-tile--span-4x2` to the existing multi-selector that collapses large tiles to single rows:

```css
  .bento-tile--span-3x2,
  .bento-tile--span-2x2,
  .bento-tile--span-4x2 {
    grid-column: span 2;
    grid-row: span 1;
  }
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: exits 0, no errors. If errors appear, check for typos in the CSS selectors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/bento.css
git commit -m "feat(bento): add bento-tile--span-4x2 CSS class with responsive rules"
```

---

### Task 2: Resize top row — Title (3×2→2×2) and YouTube #1 (3×2→4×2)

**Files:**
- Modify: `src/pages/index.astro:91` (Title tile)
- Modify: `src/pages/index.astro:100` (YouTube #1 tile)

- [ ] **Step 1: Update Title tile class**

At line 91, change the span class on the title tile div from `bento-tile--span-3x2` to `bento-tile--span-2x2`:

Before:
```astro
<div class="title-tile bento-tile--span-3x2 p3r-animate-left">
```

After:
```astro
<div class="title-tile bento-tile--span-2x2 p3r-animate-left">
```

- [ ] **Step 2: Update YouTube #1 tile class**

At line 100, change the span class on the first YouTube image tile from `bento-tile--span-3x2` to `bento-tile--span-4x2`:

Before:
```astro
<div class="image-tile image-tile--youtube bento-tile--span-3x2 p3r-animate" style="--stagger-delay: 100ms;">
```

After:
```astro
<div class="image-tile image-tile--youtube bento-tile--span-4x2 p3r-animate" style="--stagger-delay: 100ms;">
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: exits 0. Start the dev server and confirm the top row visually shows a narrow title (2 cols) + wide YouTube (4 cols):

```bash
npm run dev
```

Open `http://localhost:4321` and check rows 1–2.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(bento): resize title 3x2→2x2 and youtube-1 3x2→4x2"
```

---

### Task 3: Resize middle rows — Showcase (3×2→4×2) and Notes (3×2→2×2)

**Files:**
- Modify: `src/pages/index.astro:123` (Showcase BentoTile class prop)
- Modify: `src/pages/index.astro:142` (Notes BentoTile class prop)

- [ ] **Step 1: Update Showcase tile class**

At line 123, change the `class` prop on the Showcase BentoTile from `bento-tile--span-3x2` to `bento-tile--span-4x2`:

Before:
```astro
<BentoTile
  href="/showcase"
  variant="highlight"
  accent
  label="Showcase"
  title="What I'm Building"
  description="Stuff I've created and that I am currently working on."
  class="bento-tile--core bento-tile--span-3x2 showcase-tile"
>
```

After:
```astro
<BentoTile
  href="/showcase"
  variant="highlight"
  accent
  label="Showcase"
  title="What I'm Building"
  description="Stuff I've created and that I am currently working on."
  class="bento-tile--core bento-tile--span-4x2 showcase-tile"
>
```

- [ ] **Step 2: Update Notes tile class**

At line 142, change the `class` prop on the Notes BentoTile from `bento-tile--span-3x2` to `bento-tile--span-2x2`:

Before:
```astro
<BentoTile
  href="/notes"
  variant="dark"
  label="Notes"
  title="Thoughts in Progress"
  description="An assortment of ideas I've been thinking about."
  class="bento-tile--core bento-tile--span-3x2 notes-tile"
/>
```

After:
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

- [ ] **Step 3: Verify build passes and Z-pattern is visible**

```bash
npm run build
```

Expected: exits 0. Check dev server at `http://localhost:4321` — rows 1–4 should now form a Z: narrow Title (left) → wide YouTube (right) → wide Showcase (left) → narrow Notes (right).

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(bento): resize showcase 3x2→4x2 and notes 3x2→2x2 for Z-flow"
```

---

### Task 4: Fix bottom rows — Now 1×1, reorder Novel, remove YouTube #2

**Files:**
- Modify: `src/pages/index.astro:195-285`

This task makes three edits in the bottom of the BentoGrid:

1. Remove `bento-tile--span-2x1` from the Now tile (line 201)
2. Move the Novel tile block (lines 251–269) to appear **before** the Favorites tile (currently line 211)
3. Delete the YouTube #2 tile block (lines 271–285)

- [ ] **Step 1: Remove the span class from the Now tile**

At line 201, the Now BentoTile has `class="bento-tile--span-2x1"`. Remove that `class` prop entirely (the tile becomes a default 1×1):

Before:
```astro
      <!-- Now Tile -->
      <BentoTile
        href="/now"
        variant="highlight"
        label="Now"
        title="Current Focus"
        class="bento-tile--span-2x1"
        description="Where am I at right now?"
      >
```

After:
```astro
      <!-- Now Tile -->
      <BentoTile
        href="/now"
        variant="highlight"
        label="Now"
        title="Current Focus"
        description="Where am I at right now?"
      >
```

- [ ] **Step 2: Move Novel tile before Favorites**

The Novel tile currently lives after MAL and Spotify (lines 251–269). Cut it out and paste it immediately before the Favorites BentoTile (currently line 211). The result should read in this order:

```astro
      <!-- Now Tile -->
      <BentoTile ...Now tile... />

      <!-- Novel tile — 1x2, auto-places at col 6 rows 5-6 -->
      <a
        href="/novel"
        class="bento-tile bento-tile--full bento-tile--small bento-tile--dark bento-tile--interactive novel-tile"
        id="novel-tile"
        style="grid-column: span 1; grid-row: span 2;"
      >
        <div class="bento-tile__header">
          <span class="bento-tile__label">Novel</span>
          <h3 class="bento-tile__title">Remember Rain</h3>
        </div>
        <div class="bento-tile__footer">
          <span
            class="days-ago"
            id="novel-days-ago"
            data-novel-date={novelLastModifiedISO ?? ''}
          ></span>
        </div>
      </a>

      <BentoTile
        href="/favorites"
        variant="dark"
        label="Favorites"
        title="Inspirations"
        description="My favorite characters, series, and soundtracks."
      />

      <a ...MAL logo tile... />

      <a ...Spotify logo tile... />
```

- [ ] **Step 3: Delete the YouTube #2 tile block**

Remove the entire YouTube #2 block including its comment (originally lines 271–285):

```astro
      <!-- Row 7-8: YouTube Hero #2 (3x2) + Mini Tiles (2x1 each) -->
      <div class="image-tile image-tile--youtube bento-tile--span-3x2 p3r-animate" style="--stagger-delay: 100ms;">
        <a href="https://www.youtube.com/@kaima-mask" target="_blank" rel="noopener noreferrer">
          <img
            src="https://yt3.ggpht.com/1ThFXMWuqv4QV_DlxmGVxKgNNW6bWWSpETC5uEOleDcM_T07zT3xtueJ-fW1-SCQhgaXA7DtrQ=s600-c-k-c0x00ffffff-no-rj-rp-mo"
            alt="Hero visual"
            class="image-tile__img"
          />
          <div class="image-tile__youtube-overlay">
            <svg class="image-tile__youtube-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        </a>
      </div>
```

Delete the entire block above. Nothing else is removed.

- [ ] **Step 4: Verify the full grid**

```bash
npm run build
```

Expected: exits 0. Run dev and open `http://localhost:4321`:

- Rows 1–2: Title (2 cols, left) + YouTube (4 cols, right)
- Rows 3–4: Showcase (4 cols, left, gold) + Notes (2 cols, right)
- Row 5: Media (2 cols) + Latest (2 cols) + Now (1 col, gold square) + Novel (1 col, teal, tall)
- Row 6: Media (cont) + Favs + MAL + Spotify + Novel (cont)
- No row 7 — page ends after row 6

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(bento): Z-flow layout — remove YouTube #2, resize now 1x1, novel to bottom-right"
```
