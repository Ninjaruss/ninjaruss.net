# Bento Grid Layout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the homepage bento grid into a compact 5-row layout that fills every cell, eliminates the row-1 empty gap, and reduces oversized Showcase inner space.

**Architecture:** Pure HTML reorder + CSS class changes. No new components. The 6-column grid auto-placement takes care of positioning as long as DOM order and span classes are correct.

**Tech Stack:** Astro 5, vanilla CSS (CSS Grid), `src/styles/bento.css`, `src/pages/index.astro`

---

## Final Layout Reference

```
Row 1: [  TITLE (4×1)  ............] [YT] [NOW]
Row 2: [ SHOWCASE (3×2) ] [NOTES (2×2)] [FAVS]
Row 3: [    cont        ] [   cont    ] [1×2]
Row 4: [MEDIA] [LATEST (2×1)] [NOVEL] [MAL]
Row 5: [2×2 ] [ decor ][ decor ] [1×2] [SPOTIFY]
```

---

## Files Modified

| File | Change |
|---|---|
| `src/styles/bento.css` | Add `.bento-tile--span-1x2`; bump `grid-auto-rows` min to 100px |
| `src/pages/index.astro` | Reorder HTML tiles; update span classes; update scoped `.title-tile` CSS |
| `CLAUDE.md` | Update span class inventory and grid pattern section |

---

## Task 1: CSS Foundation — `bento.css`

**Files:**
- Modify: `src/styles/bento.css` lines 6, 50–53

- [ ] **Step 1: Update `grid-auto-rows` minimum**

  In `src/styles/bento.css`, line 6, change:
  ```css
  grid-auto-rows: minmax(80px, auto);
  ```
  to:
  ```css
  grid-auto-rows: minmax(100px, auto);
  ```

- [ ] **Step 2: Add the `bento-tile--span-1x2` class**

  In `src/styles/bento.css`, after the `.bento-tile--span-2x1` block (currently ending around line 53), add:
  ```css
  .bento-tile--span-1x2 {
    grid-column: span 1;
    grid-row: span 2;
  }
  ```

- [ ] **Step 3: Verify build passes**

  ```bash
  npm run build
  ```
  Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add src/styles/bento.css
  git commit -m "feat(bento): add span-1x2 class, tighten grid-auto-rows to 100px"
  ```

---

## Task 2: Restructure `index.astro` HTML and Scoped CSS

**Files:**
- Modify: `src/pages/index.astro` (HTML grid block lines 89–269, scoped CSS lines 403–423)

This task has two parts: scoped CSS update and HTML reorder. Do them in the same file edit session and commit once.

### Part A — Scoped CSS: Title tile grid span

- [ ] **Step 1: Update `.title-tile` grid-column in scoped CSS**

  In `src/pages/index.astro` scoped `<style>`, find the `.title-tile` rule (around line 415). Change:
  ```css
  grid-column: span 2;
  grid-row: span 1;
  ```
  to:
  ```css
  grid-column: span 4;
  grid-row: span 1;
  ```

### Part B — HTML: Reorder tiles and update classes

The grid's entire `<BentoGrid>` block (lines 89–269) needs to be rewritten with the new tile order and class changes. Replace everything between `<BentoGrid>` and `</BentoGrid>` with the following:

- [ ] **Step 2: Replace the BentoGrid inner HTML**

  ```astro
        <!-- Row 1: Title (4×1) + YouTube (1×1) + Now (1×1) -->
        <div class="title-tile p3r-animate-left">
          <div class="title-tile__inner">
            <div class="title-tile__rule title-tile__rule--top" aria-hidden="true"></div>
            <span class="title-tile__name">Ninjaruss</span>
            <div class="title-tile__rule title-tile__rule--bottom" aria-hidden="true"></div>
          </div>
          <p class="title-tile__description">Live without regret.</p>
        </div>

        <div class="image-tile image-tile--youtube p3r-animate" style="--stagger-delay: 100ms;">
          <a href="https://www.youtube.com/@Ninjaruss_" target="_blank" rel="noopener noreferrer">
            <img
              src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2FHCc3Ol7adcw%2Fmaxresdefault.jpg&f=1&nofb=1&ipt=3af1979f6b60ed9a8bb7f3ff02d25d81b2b98005b38c7a5b9f2bc4d6f8bb3aa9"
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

        <!-- Now tile — row 1 col 6 -->
        <BentoTile
          href="/now"
          variant="highlight"
          label="Now"
          title="Current Focus"
          description="Where am I at right now?"
        >
          <span class="now-date" title={`Local: ${nowMonthYearLocal}`}>
            <span class="now-dot" aria-hidden="true"></span>
            {nowMonthYearUTC}
            {nowMonthYearLocal !== nowMonthYearUTC ? ` — ${nowMonthYearLocal} locally` : ''}
          </span>
        </BentoTile>

        <!-- Rows 2-3: Showcase (3×2) + Notes (2×2) + Favorites (1×2) -->
        <BentoTile
          href="/showcase"
          variant="highlight"
          accent
          label="Showcase"
          title="What I'm Building"
          description="Stuff I've created and that I am currently working on."
          class="bento-tile--core bento-tile--span-3x2 showcase-tile"
        >
          {recentShowcase.length > 0 && (
            <div class="tile-emblems tile-emblems--highlight">
              {recentShowcase.map(entry => (
                <div class="tile-emblem" title={entry.title} data-href={entry.href} role="link" tabindex="0">
                  <img src={entry.emblem} alt="" class="tile-emblem__img" loading="lazy" aria-hidden="true" />
                </div>
              ))}
            </div>
          )}
        </BentoTile>

        <BentoTile
          href="/notes"
          variant="dark"
          label="Notes"
          title="Thoughts in Progress"
          description="An assortment of ideas I've been thinking about."
          class="bento-tile--core bento-tile--span-2x2 notes-tile"
        />

        <BentoTile
          href="/favorites"
          variant="dark"
          label="Favorites"
          title="Inspirations"
          description="My favorite characters, series, and soundtracks."
          class="bento-tile--span-1x2"
        />

        <!-- Rows 4-5: Media (2×2) + Latest (2×1) + Novel (1×2) + MAL/Spotify (stacked 1×1) -->
        <BentoTile
          href="/media"
          variant="dark"
          label="Media"
          title="Watched & Read"
          description="My thoughts on anime, manga, movies, and more."
          class="bento-tile--core bento-tile--span-2x2 media-tile"
        >
          {recentMedia.length > 0 && (
            <div class="tile-emblems">
              {recentMedia.map(entry => (
                <div class="tile-emblem" title={entry.title} data-href={entry.href} role="link" tabindex="0">
                  <img src={entry.emblem} alt="" class="tile-emblem__img" loading="lazy" aria-hidden="true" />
                </div>
              ))}
            </div>
          )}
        </BentoTile>

        {latestEntries.length > 0 && (
          <a
            id="latest-tile"
            href={latestEntries[0].href}
            class="bento-tile bento-tile--full bento-tile--small bento-tile--dark bento-tile--accent bento-tile--span-2x1"
            data-entries={JSON.stringify(latestEntries)}
          >
            <div class="latest-tile__inner">
              <div class="latest-tile__text">
                <div class="bento-tile__header">
                  <span class="bento-tile__label">Latest</span>
                  <h3 class="bento-tile__title" id="latest-title">{latestEntries[0].title}</h3>
                </div>
                <div class="bento-tile__footer">
                  <span class="days-ago" id="latest-days-ago"></span>
                </div>
              </div>
              <div class="latest-tile__emblem-wrap">
                <img
                  id="latest-emblem"
                  src={latestEntries[0].emblem}
                  alt=""
                  class="latest-tile__emblem"
                  aria-hidden="true"
                />
              </div>
            </div>
          </a>
        )}

        <!-- Novel tile — 1×2 -->
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

        <a
          href="https://myanimelist.net/animelist/Ninjaruss_?status=7&order=4&order2=0"
          target="_blank"
          rel="noopener noreferrer"
          class="logo-tile logo-tile--mal p3r-animate"
          style="--stagger-delay: 100ms;"
        >
          <img
            src="/images/logos/myanimelist.svg"
            alt="MyAnimeList"
            class="logo-tile__img"
          />
          <span class="logo-tile__label">MyAnimeList</span>
          <p class="logo-tile__description">Anime I've watched and rated based on personal enjoyment.</p>
        </a>

        <!-- Row 5 decorative fillers (cols 3-4) -->
        <div class="bento-tile bento-tile--static" aria-hidden="true"></div>
        <div class="bento-tile bento-tile--static" aria-hidden="true"></div>

        <a
          href="https://open.spotify.com/playlist/6PYIeR2dXsbTrk47TqetSD?si=2b68cabcfc26451c"
          target="_blank"
          rel="noopener noreferrer"
          class="logo-tile logo-tile--spotify p3r-animate"
          style="--stagger-delay: 150ms;"
        >
          <img
            src="/images/logos/spotify.svg"
            alt="Spotify Playlist"
            class="logo-tile__img"
          />
          <span class="logo-tile__label">Spotify</span>
          <p class="logo-tile__description">The bangers I listen to every day.</p>
        </a>
  ```

- [ ] **Step 3: Verify build passes**

  ```bash
  npm run build
  ```
  Expected: exits 0, no errors.

- [ ] **Step 4: Visual check — start dev server**

  ```bash
  npm run dev
  ```
  Open `http://localhost:4321` and verify:
  - Row 1: Title spans ~⅔ of the row, YouTube and Now are side-by-side on the right
  - Rows 2–3: Showcase is narrower than before (3 cols not 4), Notes is right of it, Favorites stacks on the far right
  - Rows 4–5: Media, Latest, Novel, MAL/Spotify fill the bottom two rows cleanly
  - No obvious empty gap in row 1
  - Grid fits in a 1080p window without scrolling

- [ ] **Step 5: Commit**

  ```bash
  git add src/pages/index.astro
  git commit -m "feat(home): restructure bento grid — wide title row, 5-row compact layout"
  ```

---

## Task 3: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the span class inventory**

  Find the line:
  ```
  Span classes: `.bento-tile--span-4x2`, `.bento-tile--span-3x2`, `.bento-tile--span-2x2`, `.bento-tile--span-2x1`
  ```
  Change to:
  ```
  Span classes: `.bento-tile--span-4x2`, `.bento-tile--span-3x2`, `.bento-tile--span-2x2`, `.bento-tile--span-2x1`, `.bento-tile--span-1x2`
  ```

- [ ] **Step 2: Update the homepage grid pattern**

  Find the `**Current Homepage Grid Pattern:**` section and replace with:
  ```markdown
  **Current Homepage Grid Pattern:**
  - Row 1: Title (4×1) + YouTube (1×1) + Now (1×1)
  - Rows 2-3: Showcase (3×2, core) + Notes (2×2, core) + Favorites (1×2)
  - Rows 4-5: Media (2×2, core) + Latest (2×1, row 4) + Novel (1×2) + MAL (1×1, row 4) + 2× decorative (1×1, row 5) + Spotify (1×1, row 5)

  Note: Title grid placement is controlled by scoped CSS in `index.astro` (`.title-tile { grid-column: span 4 }`), not a span class.
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add CLAUDE.md
  git commit -m "docs(claude-md): update bento grid pattern and span class inventory"
  ```
