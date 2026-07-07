# P4G Thematic Cohesion & Style Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every surface of ninjaruss.net the same Persona 4 Golden design dialect — diagonal energy, bold menu-screen typography, motion flair — via reusable CSS utilities applied to chrome, content pages, and the homepage bento grid.

**Architecture:** A vocabulary layer of 5 utility classes + 5 tokens in `src/styles/global.css` (loaded globally on every page), then per-component application. Pure CSS/markup pass: no new JS, no new data flow. Client-side split-view content injection (`contentLoader.ts`) copies fetched `.entry` HTML wholesale, so `EntryHeader.astro` must use only **global** utility classes — no new scoped `<style>` block there (scoped styles wouldn't be bundled on the list page that receives the injected HTML).

**Tech Stack:** Astro 5, vanilla CSS (design tokens in `global.css`), vitest (existing suite only — this pass adds no JS).

**Spec:** `docs/superpowers/specs/2026-07-07-p4g-cohesion-design.md`

**Reality notes (spec ↔ codebase drift):**
- `SectionLayout.astro` is unused by any page today (notes/showcase use `SplitViewLayout`). It still gets the variant-A treatment (Task 7) so future sections inherit it, but the *visible* header work lands in the shelf header (Task 5), entry headers (Task 3), and split-view header (Task 2).
- `/shelf` has a sticky jumpbar (`.shelf-jumpbar`), not filter pills. Jumpbar links get a skewed-underline active/hover treatment (Task 5). The kicker-tab style goes on the shelf detail page's type label (Task 5).

**Verification model:** This is a CSS pass — there is no unit-testable logic, so tasks verify via `npm run build` (must exit 0) plus visual checks in the dev server. Task 8 is the full verification sweep. Do not skip the build step in any task: Astro builds catch malformed component syntax.

---

### Task 1: Vocabulary layer in global.css

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add skew/cut tokens**

In `src/styles/global.css`, inside `:root`, directly below the `/* P4G Border Weight */` block (after the `--border-hairline: 1px;` line), add:

```css
  /* P4G Skew & Cut Vocabulary */
  --skew-display: -6deg;   /* display-type slant */
  --skew-accent: -12deg;   /* sweep panel slant */
  --skew-rule: -30deg;     /* underline bar slant */
  --cut-sm: 6px;           /* parallelogram cut distance, small */
  --cut-md: 12px;          /* parallelogram cut distance, medium */
```

- [ ] **Step 2: Add utility classes**

In the same file, directly after the `.p4g-label` rule block (ends around line 237), add:

```css
/* ── P4G Vocabulary Utilities ───────────────────────────
   Shared menu-screen moves. NOTE: clip-path clips box-shadow —
   if a cut element needs the hard gold shadow, put
   filter: drop-shadow() on a wrapper element instead. */

/* Slanted uppercase display type */
.p4g-heading {
  display: inline-block;
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: var(--tracking-tight);
  transform: skewX(var(--skew-display));
}

/* Angled kicker tab — black text on gold, slanted right edge */
.p4g-tab {
  display: inline-block;
  background: var(--color-gold);
  color: var(--color-black);
  font-family: var(--font-display);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
  padding: var(--space-2xs) calc(var(--space-sm) + var(--cut-sm)) var(--space-2xs) var(--space-sm);
  clip-path: polygon(0 0, 100% 0, calc(100% - var(--cut-sm)) 100%, 0 100%);
}

/* Skewed gold underline that sweeps in on entrance */
.p4g-underline {
  display: block;
  height: 3px;
  width: 200px;
  max-width: 60%;
  background: linear-gradient(90deg, var(--color-gold) 60%, transparent);
  transform: skewX(var(--skew-rule));
  transform-origin: left;
  animation: p4g-underline-in var(--animation-base) var(--animation-easing) backwards;
}

@keyframes p4g-underline-in {
  from { transform: skewX(var(--skew-rule)) scaleX(0); }
  to { transform: skewX(var(--skew-rule)) scaleX(1); }
}

/* Diagonal gold sweep fill on hover/focus. Children are lifted
   above the sweep panel automatically. */
.p4g-sweep {
  position: relative;
  overflow: hidden;
}

.p4g-sweep::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-gold);
  transform: translateX(-104%) skewX(var(--skew-accent));
  transition: transform var(--animation-fast) var(--animation-easing);
  z-index: 0;
}

.p4g-sweep > * {
  position: relative;
  z-index: 1;
}

.p4g-sweep:hover,
.p4g-sweep:focus-visible {
  color: var(--color-black);
}

.p4g-sweep:hover::before,
.p4g-sweep:focus-visible::before {
  transform: translateX(0) skewX(0deg);
}

/* Parallelogram silhouette */
.p4g-cut {
  clip-path: polygon(var(--cut-sm) 0, 100% 0, calc(100% - var(--cut-sm)) 100%, 0 100%);
}

@media (prefers-reduced-motion: reduce) {
  .p4g-underline { animation: none; }
  .p4g-sweep::before { transition: none; }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0, no CSS errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add P4G vocabulary tokens and utility classes"
```

---

### Task 2: ListItem sweep + cut, SplitViewLayout header

**Files:**
- Modify: `src/components/ListItem.astro` (style block, lines 46–264)
- Modify: `src/layouts/SplitViewLayout.astro` (`.split-view__header` ~line 146, `.split-view__title` ~line 159)

- [ ] **Step 1: Rework ListItem hover to diagonal gold sweep**

In `src/components/ListItem.astro`, replace the `.list-item` base rule, the `.list-item::before` rule, the `.list-item:hover` rules, and the reduced-motion block (currently lines 47–102) with:

```css
  .list-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    border-bottom: var(--border-hairline) solid var(--color-border);
    cursor: pointer;
    transition: transform var(--transition-fast);
    text-decoration: none;
    color: inherit;
    position: relative;
    overflow: hidden;
    clip-path: polygon(var(--cut-sm) 0, 100% 0, calc(100% - var(--cut-sm)) 100%, 0 100%);
  }

  .list-item::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--color-gold);
    transform: translateX(-104%) skewX(var(--skew-accent));
    transition: transform var(--animation-fast) var(--animation-easing);
    z-index: 0;
  }

  .list-item > * {
    position: relative;
    z-index: 1;
  }

  .list-item:hover {
    transform: translateX(4px);
  }

  .list-item:hover::before {
    transform: translateX(0) skewX(0deg);
  }

  .list-item:hover .list-item__title {
    color: var(--color-black);
  }

  .list-item:hover .list-item__subtitle {
    color: rgba(0, 0, 0, 0.6);
  }

  .list-item:hover .list-item__meta-text {
    color: rgba(0, 0, 0, 0.55);
  }

  @media (prefers-reduced-motion: reduce) {
    .list-item::before {
      transition: none;
    }
    .list-item:hover {
      transform: none;
    }
  }
```

- [ ] **Step 2: Update hover states for indicator and arrow**

Still in `ListItem.astro`, replace the `.list-item:hover .list-item__indicator` rule (currently sets `color: var(--color-gold-dim)`) with:

```css
  .list-item:hover .list-item__indicator {
    opacity: 0.8;
    color: var(--color-black);
  }
```

Replace the `.list-item:hover .list-item__arrow` rule with:

```css
  .list-item:hover .list-item__arrow {
    opacity: 0.7;
    transform: translateX(0);
    color: var(--color-black);
  }
```

- [ ] **Step 3: Cut the type badge edge**

Replace the `.list-item__type` rule's `border-radius: var(--radius-xs);` line with:

```css
    border-radius: 0;
    clip-path: polygon(0 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
    padding-right: calc(var(--space-xs) + 4px);
```

(Keep every other declaration in `.list-item__type` unchanged.)

- [ ] **Step 4: Keep `is-active` coherent with the cut silhouette**

The `.list-item.is-active` rules already fill with solid gold and flip text black — leave them as they are. The parallelogram `clip-path` added in Step 1 applies to all states, so active items get the cut automatically. Verify no `is-active` rule needs changes (they don't reference `::before` transforms).

- [ ] **Step 5: Angle the split-view gold header and slant its title**

In `src/layouts/SplitViewLayout.astro`, replace the `.split-view__header` rule with:

```css
  .split-view__header {
    padding: var(--space-lg) var(--space-md) calc(var(--space-lg) + 4px);
    border-bottom: none;
    background: var(--color-gold);
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), 0 100%);
  }
```

Replace the `.split-view__title` rule with:

```css
  .split-view__title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--color-black);
    text-transform: uppercase;
    margin-bottom: 0;
    line-height: 1.3;
    word-wrap: break-word;
    overflow-wrap: break-word;
    transform: skewX(var(--skew-display));
    transform-origin: left bottom;
  }
```

- [ ] **Step 6: Verify build and visuals**

Run: `npm run build`
Expected: exits 0.

Start the dev server (`npm run dev`), open `http://localhost:4321/notes`:
- Hovering a list item sweeps a gold panel in diagonally; title/meta flip to black; item nudges right.
- List items have subtly slanted left/right edges.
- The gold list header has an angled bottom edge and a slanted title.
- Clicking an item still loads content and marks the item active (solid gold).
- Keyboard-Tab onto a list item shows the gold focus ring.

- [ ] **Step 7: Commit**

```bash
git add src/components/ListItem.astro src/layouts/SplitViewLayout.astro
git commit -m "feat: P4G sweep hover and cut silhouette for list items, angled split-view header"
```

---

### Task 3: EntryHeader slanted title + swept underline

**Files:**
- Modify: `src/components/EntryHeader.astro` (markup only — NO scoped style block; see Architecture note)

- [ ] **Step 1: Wrap the title and add the underline using global utilities**

In `src/components/EntryHeader.astro`, replace:

```astro
  <h1 class="entry__title">{title}</h1>
```

with:

```astro
  <h1 class="entry__title"><span class="p4g-heading">{title}</span></h1>
  <span class="p4g-underline" aria-hidden="true"></span>
```

`.p4g-heading` and `.p4g-underline` are global classes from Task 1, so the markup styles itself on any page — including when `contentLoader.ts` injects fetched detail HTML into the split view (no scoped stylesheet dependency). The `<span>` inside `<h1>` inherits the h1 font sizing; `.p4g-heading` only adds the slant. Do not add a `<style>` block to this component.

- [ ] **Step 2: Verify build and visuals**

Run: `npm run build`
Expected: exits 0.

In the dev server, open `http://localhost:4321/notes`, click an entry:
- The entry title is slanted; a skewed gold underline sweeps in below it.
- Open a note's direct URL (e.g. any `/notes/<slug>`) — same rendering.

- [ ] **Step 3: Commit**

```bash
git add src/components/EntryHeader.astro
git commit -m "feat: P4G slanted title and swept underline on entry headers"
```

---

### Task 4: NavPill sweep hover + diamond spin

**Files:**
- Modify: `src/components/NavPill.astro` (style block)

- [ ] **Step 1: Repurpose the item ::before as a sweep panel**

In `src/components/NavPill.astro`, replace the `/* P4G Selection indicator */ .nav-pill__item::before` rule (lines 114–124) with:

```css
  /* P4G diagonal sweep panel */
  .nav-pill__item::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-pill);
    background: var(--color-gold);
    transform: translateX(-110%) skewX(var(--skew-accent));
    transition: transform var(--animation-fast) var(--animation-easing);
    z-index: 0;
  }

  .nav-pill__item:hover::before {
    transform: translateX(0) skewX(0deg);
  }

  .nav-pill__item > * {
    position: relative;
    z-index: 1;
  }
```

- [ ] **Step 2: Make item hover rely on the sweep, add overflow clip**

Replace the `.nav-pill__item` base rule's `background: transparent;` declaration block — keep all existing declarations but add `overflow: hidden;` after `position: relative;`. Then replace the `.nav-pill__item:hover` rule with:

```css
  .nav-pill__item:hover {
    background: transparent;
    color: var(--color-black);
    transform: scale(1.05);
  }
```

And replace `.nav-pill__home:hover` with:

```css
  .nav-pill__home:hover {
    background: transparent;
    color: var(--color-black);
  }
```

- [ ] **Step 3: Diamond spin-flash**

Replace the `.nav-pill__home:hover .nav-pill__icon` rule with:

```css
  .nav-pill__home:hover .nav-pill__icon {
    transform: rotate(225deg) scale(1.2);
  }
```

Add after it:

```css
  @media (prefers-reduced-motion: reduce) {
    .nav-pill__item::before {
      transition: none;
    }
    .nav-pill__home:hover .nav-pill__icon {
      transform: none;
    }
  }
```

- [ ] **Step 4: Verify build and visuals**

Run: `npm run build`
Expected: exits 0.

In the dev server, open any non-home page (e.g. `/notes`):
- Hovering a nav pill item sweeps gold in diagonally within the pill (no square corners leaking — `overflow: hidden` + pill radius clip it).
- Home diamond spins on hover.
- Text stays readable (black on gold) throughout the sweep.

- [ ] **Step 5: Commit**

```bash
git add src/components/NavPill.astro
git commit -m "feat: P4G diagonal sweep hover on nav pill"
```

---

### Task 5: Shelf page — header treatment, jumpbar, detail type tab

**Files:**
- Modify: `src/pages/shelf/index.astro` (header markup ~lines 74–78, `.shelf-header__*` styles, `.shelf-jumpbar__link` styles)
- Modify: `src/pages/shelf/[...slug].astro` (type label ~line 48)

- [ ] **Step 1: Full variant-A treatment on the shelf header**

In `src/pages/shelf/index.astro`, replace the header markup:

```astro
    <header class="shelf-header">
      <span class="shelf-header__eyebrow">catalog</span>
      <h1 class="shelf-header__title">Shelf</h1>
      <p class="shelf-header__count">{totalCount} entries</p>
    </header>
```

with:

```astro
    <header class="shelf-header">
      <div class="shelf-header__main">
        <span class="p4g-tab">catalog</span>
        <h1 class="shelf-header__title"><span class="p4g-heading">Shelf<span class="shelf-header__period">.</span></span></h1>
        <span class="p4g-underline" aria-hidden="true"></span>
      </div>
      <p class="shelf-header__count">{totalCount} entries</p>
    </header>
```

- [ ] **Step 2: Update shelf header styles**

In the same file's `<style>` block, replace the `.shelf-header` and `.shelf-header__eyebrow` rules with:

```css
  .shelf-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
    flex-wrap: wrap;
  }
  .shelf-header__main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }
  .shelf-header__period {
    color: var(--color-gold);
  }
```

Keep `.shelf-header__title` and `.shelf-header__count` as they are. (`.shelf-header__eyebrow` is deleted — the markup now uses the global `.p4g-tab`.)

- [ ] **Step 3: Jumpbar link treatment**

Replace the `.shelf-jumpbar__link.is-active` block:

```css
  .shelf-jumpbar__link.is-active,
  .shelf-jumpbar__link[aria-current="true"] {
    color: var(--color-gold);
    border-bottom-color: var(--color-gold);
  }
```

with:

```css
  .shelf-jumpbar__link:hover {
    color: var(--color-gold);
  }
  .shelf-jumpbar__link.is-active,
  .shelf-jumpbar__link[aria-current="true"] {
    color: var(--color-gold);
    border-bottom-color: var(--color-gold);
    border-bottom-width: 3px;
  }
```

Also delete the now-duplicated older `.shelf-jumpbar__link:hover { color: var(--color-text); }` rule.

- [ ] **Step 4: Kicker tab on shelf detail type label**

In `src/pages/shelf/[...slug].astro`, replace:

```astro
        <p class="media-detail__type">{entry.data.content_type}</p>
```

with:

```astro
        <p class="media-detail__type p4g-tab">{entry.data.content_type}</p>
```

Then check that page's `<style>` block for a `.media-detail__type` rule; if it sets `background`, `color`, `border-radius`, or `padding`, delete those declarations from it (the global `.p4g-tab` supplies them) but keep any margin declarations.

- [ ] **Step 5: Verify build and visuals**

Run: `npm run build`
Expected: exits 0.

In the dev server:
- `/shelf`: header shows angled gold "CATALOG" tab, slanted "SHELF." title with gold period, swept underline; count pill sits right-aligned. Jumpbar hover turns links gold; active link has a thicker gold underline. Card grid unaffected.
- Any `/shelf/<slug>`: type label renders as an angled gold tab.

- [ ] **Step 6: Commit**

```bash
git add src/pages/shelf/index.astro "src/pages/shelf/[...slug].astro"
git commit -m "feat: P4G header treatment on shelf index and detail pages"
```

---

### Task 6: Homepage bento — corner reveal, slanted core titles, kicker labels, title tile

**Files:**
- Modify: `src/components/BentoTile.astro` (add corner span)
- Modify: `src/styles/bento.css` (core tile styles)
- Modify: `src/pages/index.astro` (title tile markup ~line 147, title tile styles ~line 706)

- [ ] **Step 1: Add corner element to BentoTile**

In `src/components/BentoTile.astro`, after the closing `</div>` of `bento-tile__footer` (line 41), add:

```astro
  <span class="bento-tile__corner" aria-hidden="true"></span>
```

- [ ] **Step 2: Core tile styles in bento.css**

In `src/styles/bento.css`, after the `.bento-tile--core:hover` rule (ends ~line 429), add:

```css
/* P4G corner-cut reveal — gold triangle slides into top-right on hover */
.bento-tile--core {
  overflow: hidden;
}

.bento-tile__corner {
  display: none;
}

.bento-tile--core .bento-tile__corner {
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  width: 44px;
  height: 44px;
  background: var(--color-gold);
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  transform: translate(46px, -46px);
  transition: transform var(--animation-fast) var(--animation-easing);
  pointer-events: none;
  z-index: 3;
}

.bento-tile--core:hover .bento-tile__corner {
  transform: translate(0, 0);
}

/* Slanted italic titles on core tiles */
.bento-tile--core .bento-tile__title {
  display: inline-block;
  transform: skewX(var(--skew-display));
  transform-origin: left bottom;
}

/* Mini kicker tabs for core tile labels */
.bento-tile--core .bento-tile__label {
  background: var(--color-gold);
  color: var(--color-black);
  border-radius: 0;
  clip-path: polygon(0 0, 100% 0, calc(100% - var(--cut-sm)) 100%, 0 100%);
  padding-right: calc(var(--space-sm) + var(--cut-sm));
}

@media (prefers-reduced-motion: reduce) {
  .bento-tile--core .bento-tile__corner {
    transition: none;
  }
}
```

Note: `.bento-tile--core .bento-tile__title` already has a rule around line 419 setting size/weight/text-shadow — leave it; this new rule only adds the transform (CSS cascade merges them).

- [ ] **Step 3: Title tile slant + gold period**

In `src/pages/index.astro`, replace:

```astro
          <span class="title-tile__name">Ninjaruss</span>
```

with:

```astro
          <span class="title-tile__name">Ninjaruss<span class="title-tile__period">.</span></span>
```

In the same file's `<style>` block, in the `.title-tile__name` rule, add these declarations (keep all existing ones):

```css
    display: inline-block;
    transform: skewX(var(--skew-display));
```

Caution: `.title-tile__name` has `animation: p3r-animate-left ...` — check `src/styles/transitions.css` for the `p3r-animate-left` keyframes; if they animate `transform`, the animation's final frame will override the skew while running and then snap. If so, wrap instead: leave `.title-tile__name` untouched and put the skew on a new inner span — change markup to:

```astro
          <span class="title-tile__name"><span class="title-tile__name-inner">Ninjaruss<span class="title-tile__period">.</span></span></span>
```

with:

```css
  .title-tile__name-inner {
    display: inline-block;
    transform: skewX(var(--skew-display));
  }
```

Use whichever variant matches what you find in `transitions.css` (the wrapper variant is always safe — prefer it if in doubt).

Then add after the `.title-tile__name` rule:

```css
  .title-tile__period {
    color: var(--color-text);
    text-shadow: none;
  }
```

- [ ] **Step 4: Verify build and visuals**

Run: `npm run build`
Expected: exits 0.

In the dev server, open `/`:
- Showcase/Notes/Shelf tiles: labels are angled gold tabs; titles slanted; hovering slides a gold triangle into the top-right corner alongside the existing lift + hard shadow.
- Dark tiles (Stream, Latest, Novel), logo tiles, YouTube/Now tiles: unchanged.
- Title tile: "NINJARUSS." slanted with a white period, rules/shimmer still animate.
- Check 375px width: grid stacks, corner reveal still clips inside tiles.

- [ ] **Step 5: Commit**

```bash
git add src/components/BentoTile.astro src/styles/bento.css src/pages/index.astro
git commit -m "feat: P4G corner reveals, slanted titles, kicker labels on bento tiles"
```

---

### Task 7: SectionLayout variant-A header (future-proofing)

**Files:**
- Modify: `src/layouts/SectionLayout.astro`

`SectionLayout` is unused by current pages but is the canonical section header component (per CLAUDE.md). Give it the full treatment so any future section page inherits the look.

- [ ] **Step 1: Add kicker prop and new header markup**

Replace the frontmatter interface and header markup so the component reads:

```astro
---
import BaseLayout from './BaseLayout.astro';
import NavPill from '../components/NavPill.astro';

interface Props {
  title: string;
  description: string;
  subtitle?: string;
  kicker?: string;
}

const { title, description, subtitle, kicker } = Astro.props;
---

<BaseLayout title={title} description={description}>
  <NavPill />
  <div class="container">
    <header class="section-header">
      {kicker && <span class="p4g-tab p3r-animate">{kicker}</span>}
      <h1 class="section-header__title p3r-animate-left"><span class="p4g-heading">{title}<span class="section-header__period">.</span></span></h1>
      <span class="p4g-underline" aria-hidden="true"></span>
      {subtitle && <p class="section-header__subtitle p3r-animate" style="--stagger-delay: 80ms;">{subtitle}</p>}
    </header>
    <div class="section-content p3r-animate" style="--stagger-delay: 150ms;">
      <slot />
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Update header styles**

Replace the `.section-header` rule with:

```css
  .section-header {
    margin-bottom: var(--space-2xl);
    padding-bottom: var(--space-xl);
  }
```

(The thick gold `border-bottom` is replaced by the swept underline.) Keep `.section-header__title` and `.section-header__subtitle` as-is, and add:

```css
  .section-header__period {
    color: var(--color-text);
    text-shadow: none;
  }

  .section-header__subtitle {
    margin-top: var(--space-md);
  }
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0 (component is unused, so build success is the whole check).

- [ ] **Step 4: Commit**

```bash
git add src/layouts/SectionLayout.astro
git commit -m "feat: P4G variant-A header treatment in SectionLayout"
```

---

### Task 8: Full verification sweep + CLAUDE.md documentation

**Files:**
- Modify: `CLAUDE.md` (Design System section)

- [ ] **Step 1: Build and unit tests**

Run: `npm run build && npm run test`
Expected: build exits 0; all vitest tests pass (novel + filterEngine suites — untouched by this pass).

- [ ] **Step 2: Visual pass at three widths**

In the dev server, check each of `/`, `/notes`, `/showcase`, `/shelf`, one `/notes/<slug>`, one `/shelf/<slug>` at 375px, 768px, and 1280px widths:
- No horizontal overflow introduced by skews/cuts (skewed elements can widen their box — look for scrollbars).
- Text remains readable in all hover/active states (black on gold everywhere gold fills).
- Split view collapse at 900px still works with the angled header.

- [ ] **Step 3: Reduced-motion check**

Emulate `prefers-reduced-motion: reduce` (browser devtools → Rendering). Verify:
- List item hover becomes an instant gold fill (no travel), no nudge.
- Underlines render static (no sweep-in).
- Bento corner triangles appear instantly on hover.
- Nav pill sweep is instant.

- [ ] **Step 4: Keyboard focus walk**

Tab through `/notes` (list items, search), the nav pill, and `/shelf` jumpbar links. Every stop must show the gold `:focus-visible` ring; the ring must not be clipped by any `clip-path` (rings render on the unclipped border box via `outline`, which is not clipped — confirm visually on list items).

- [ ] **Step 5: Fix anything found**

If any check fails, fix it in the relevant file and re-run the failed check before proceeding. Commit fixes as `fix: <what>` with the files involved.

- [ ] **Step 6: Document the vocabulary in CLAUDE.md**

In `CLAUDE.md`, in the "Design System" section after the "Key CSS Variables" code block, add:

```markdown
### P4G Vocabulary Utilities (global.css)
Reusable menu-screen moves — prefer these over bespoke CSS for new surfaces:
- `.p4g-heading` — slanted uppercase display type (`--skew-display`)
- `.p4g-tab` — angled black-on-gold kicker label bar
- `.p4g-underline` — skewed gold underline, sweeps in on entrance
- `.p4g-sweep` — diagonal gold fill on hover/focus (children auto-lifted above panel)
- `.p4g-cut` — parallelogram silhouette via clip-path
- Tokens: `--skew-display: -6deg`, `--skew-accent: -12deg`, `--skew-rule: -30deg`, `--cut-sm: 6px`, `--cut-md: 12px`
- Caveat: `clip-path` clips `box-shadow` — cut elements needing the hard gold shadow use `filter: drop-shadow()` on a wrapper
```

Also in CLAUDE.md, fix two stale statements encountered during this work:
- In "Layouts" table, `SectionLayout.astro` row: change purpose text to "Content pages with NavPill and animated header (currently unused by routes; canonical section header)".
- In "Shelf Page Features", the filter-pill description predates the jumpbar redesign — update the "Filter bar" bullet to describe the sticky jumpbar (`.shelf-jumpbar`) with section anchors if the pills are indeed gone from the page.

- [ ] **Step 7: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: document P4G vocabulary utilities, fix stale CLAUDE.md entries"
```

---

## Self-review notes

- **Spec coverage:** Vocabulary layer → Task 1. Section headers → Tasks 2 (split-view), 5 (shelf), 7 (SectionLayout). NavPill → Task 4. ListItem + type badges → Task 2. EntryHeader → Task 3. Prose untouched → no task touches `.prose` or `EntryBody`. Shelf "filter bar" → Task 5 (adapted to jumpbar). Bento core tiles + title tile → Task 6. Signal/logo tiles → intentionally minimal (shared timing already exists; no change needed). Motion/accessibility → reduced-motion blocks in Tasks 1, 2, 4, 6 + sweep in Task 8.
- **Type consistency:** utility class names (`.p4g-heading`, `.p4g-tab`, `.p4g-underline`, `.p4g-sweep`, `.p4g-cut`) and tokens (`--skew-display`, `--skew-accent`, `--skew-rule`, `--cut-sm`, `--cut-md`) are used identically across all tasks; `p4g-underline-in` keyframe defined once in Task 1, referenced nowhere else by name.
- **Known judgment call:** Task 6 Step 3 offers two variants (direct skew vs. wrapper span) contingent on `transitions.css` keyframe contents — the wrapper variant is safe in all cases and is the stated default when in doubt.
