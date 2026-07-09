# Diagonal Tile Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the homepage Journal tile a gold/black diagonal slash split (notes field / showcases field), with quieter diagonal echoes on the Latest tile (angled deep-black emblem field + gold hairline) and Shelf tile (angled collage bleed edge).

**Architecture:** All changes live in `src/pages/index.astro` (markup + scoped styles). The Journal tile becomes a 2-column grid over a `::before` black overlay clipped diagonally; Latest's existing `.latest-tile__emblem-wrap` becomes the angled field via negative margins + `clip-path`; Shelf's `.tile-poster-strip` gets a single diagonal top clip. No new components, utilities, or JS. Spec: `docs/superpowers/specs/2026-07-08-diagonal-tile-language-design.md`.

**Tech Stack:** Astro 5, vanilla scoped CSS (`clip-path`, CSS custom properties). Verification via `npm run dev` preview + `npm run build` (no DOM unit-test rig exists for this; `npm run test` guards utils only).

**Key existing facts** (verified against the codebase):
- `.bento-tile` has `padding: var(--space-md)`, `overflow: hidden`, `position: relative` (`src/styles/bento.css`).
- `.bento-tile__corner` is a 44px gold triangle, translated off-tile until `:hover`; `.bento-tile--highlight .bento-tile__corner` overrides it to black (`src/styles/bento.css:295-322`).
- The bento grid drops the Journal tile from span-4 to span-2 at `max-width: 1024px` (`src/styles/bento.css:428-441`).
- `recentJournal` (5 rows: `href`, `title`, `type`, `date`) and `recentShowcase` (3 entries: `href`, `emblem`, `title`) already exist in `index.astro` frontmatter — no data changes needed.
- Astro scoped styles use `:where()` for scoping, so specificity ties with `bento.css` rules; overrides must win on their own specificity (e.g. `.journal-tile.bento-tile--highlight .bento-tile__corner`).

---

### Task 1: Journal tile — markup restructure

**Files:**
- Modify: `src/pages/index.astro` (journal tile markup, currently lines ~224–254)

- [ ] **Step 1: Replace the journal tile markup**

Replace the entire `<div class="bento-tile ... journal-tile">…</div>` block with:

```astro
      <!-- Rows 2-3: Journal (4×2, slash split) + Novel (1×2) + Stream (1×2) -->
      <div class="bento-tile bento-tile--full bento-tile--highlight bento-tile--core bento-tile--span-4x2 journal-tile">
        <div class="journal-tile__notes">
          <a href="/journal?types=note" class="journal-tile__head">
            <div class="bento-tile__header">
              <span class="bento-tile__label">Journal</span>
              <h3 class="bento-tile__title">Notes</h3>
            </div>
          </a>
          {recentJournal.length > 0 && (
            <div class="journal-tile__list">
              {recentJournal.map(row => (
                <a class="journal-tile__row" href={row.href} title={row.title}>
                  <span class="journal-tile__row-title">{row.title}</span>
                  <span class="journal-tile__date">{row.date}</span>
                </a>
              ))}
            </div>
          )}
        </div>
        {recentShowcase.length > 0 && (
          <div class="journal-tile__showcases">
            <a href="/journal?types=showcase" class="journal-tile__showcase-tab">Showcases</a>
            <div class="journal-tile__projects">
              {recentShowcase.map((entry, i) => (
                <a
                  href={entry.href}
                  class:list={['journal-tile__project', { 'journal-tile__project--recent': i === 0 }]}
                >
                  <img src={entry.emblem} alt="" loading="lazy" />
                  <span class="journal-tile__project-title">{entry.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        <span class="bento-tile__corner" aria-hidden="true"></span>
      </div>
```

Notes: the root stays a `div` (no nested anchors). The old combined heading
("Notes & Showcases"), the description `<p>`, and the `journal-tile__emblems`
strip are gone. Showcase links now have visible text (previously
`aria-label`-only).

- [ ] **Step 2: Confirm the page still renders**

Run: `npm run dev` (or use the running preview) and load `/`.
Expected: journal tile renders unstyled-but-valid — two stacked/side groups, five note rows, three showcase rows with titles. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: restructure journal tile into notes/showcases fields"
```

---

### Task 2: Journal tile — slash-split styles

**Files:**
- Modify: `src/pages/index.astro` (scoped `<style>`, journal section currently lines ~749–828)

- [ ] **Step 1: Replace the journal tile style block**

Delete the current `.journal-tile { gap: … }`, `.journal-tile__emblems`, and
`.journal-tile__emblem` rules. Keep `.journal-tile__head`,
`.journal-tile__list`, `.journal-tile__row`, `.journal-tile__row-title`,
`.journal-tile__date` as they are. Add:

```css
  /* Journal tile — slash split: gold notes field / black showcases field.
     The black field is a ::before overlay clipped diagonally; both content
     columns are positioned to paint above it. */
  .journal-tile {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
    gap: var(--space-md);
  }

  .journal-tile::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--color-bg-base);
    clip-path: polygon(66% 0, 100% 0, 100% 100%, 58% 100%);
    transition: clip-path var(--animation-base) var(--animation-easing);
    pointer-events: none;
  }

  .journal-tile:hover::before {
    clip-path: polygon(64% 0, 100% 0, 100% 100%, 56% 100%);
  }

  @media (prefers-reduced-motion: reduce) {
    .journal-tile::before {
      transition: none;
    }
    .journal-tile:hover::before {
      clip-path: polygon(66% 0, 100% 0, 100% 100%, 58% 100%);
    }
  }

  .journal-tile__notes,
  .journal-tile__showcases {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  /* Corner triangle sits on the black field now — gold, not the highlight
     black (which would vanish). Extra class specificity beats bento.css. */
  .journal-tile.bento-tile--highlight .bento-tile__corner {
    background: var(--color-gold);
  }

  /* Showcases field — gold kicker tab + emblem/title project rows */
  .journal-tile__showcase-tab {
    align-self: flex-start;
    padding: 2px 12px;
    background: var(--color-gold);
    color: var(--color-black);
    font-family: var(--font-display);
    font-size: var(--text-2xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    text-decoration: none;
    transform: skewX(var(--skew-accent));
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .journal-tile__showcase-tab:hover,
  .journal-tile__showcase-tab:focus-visible {
    background: var(--color-text);
  }

  .journal-tile__projects {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    margin-top: var(--space-sm);
  }

  .journal-tile__project {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-2xs) var(--space-xs);
    text-decoration: none;
    color: var(--color-text);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  /* Mirror of the note rows' hover: gold-on-black side inverts to gold bg */
  .journal-tile__project:hover,
  .journal-tile__project:focus-visible {
    background: var(--color-gold);
    color: var(--color-black);
  }

  .journal-tile__project img {
    width: 42px;
    height: 42px;
    object-fit: cover;
    display: block;
    flex-shrink: 0;
    border: 2px solid var(--color-border-strong);
  }

  .journal-tile__project--recent img {
    border-color: var(--color-gold);
  }

  .journal-tile__project-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
```

- [ ] **Step 2: Verify at desktop width in the preview**

Checks (preview at ≥1100px wide):
- Black field covers the right ~40% with a diagonal seam; note rows never
  cross the seam; showcase rows sit fully on black.
- SHOWCASES tab is gold-on-black; JOURNAL tab black-on-gold (existing core
  label style).
- Hovering the tile slides the seam ~2% left and reveals a gold corner
  triangle; note-row hover inverts to black/gold, project-row hover inverts
  to gold/black.
- Links: notes header → `/journal?types=note`, SHOWCASES tab →
  `/journal?types=showcase`, rows deep-link.

If the seam-to-column alignment is off (content crossing the seam), tune the
`grid-template-columns` ratio and the polygon x-values together — the seam
midpoint (~62%) should sit inside the grid gap.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: journal tile slash-split styles"
```

---

### Task 3: Journal tile — responsive stack

**Files:**
- Modify: `src/pages/index.astro` (scoped `<style>`, after the Task 2 block)

- [ ] **Step 1: Add the ≤1024px stacked layout**

The bento grid narrows the tile to span-2 at 1024px (`bento.css:438`), where
the steep diagonal no longer fits. Stack the fields and flatten the seam:

```css
  @media (max-width: 1024px) {
    .journal-tile {
      grid-template-columns: 1fr;
    }

    .journal-tile::before,
    .journal-tile:hover::before {
      clip-path: polygon(0 66%, 100% 60%, 100% 100%, 0 100%);
    }
  }
```

- [ ] **Step 2: Verify stacking in the preview**

Resize preview to 900px and 375px. Checks:
- Gold notes block on top, black showcases block below, near-horizontal
  angled seam between them; no content crossing the seam (tune the polygon
  y-values if the showcase block starts above 60% of the tile height).
- No horizontal overflow (`document.documentElement.scrollWidth === innerWidth`).
- Tap targets: showcase rows ≥44px tall on mobile (42px emblem + padding).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: journal tile stacked seam below 1024px"
```

---

### Task 4: Latest tile — quiet angled emblem field

**Files:**
- Modify: `src/pages/index.astro` (scoped `<style>`: `.latest-tile__emblem-wrap` at ~1330, plus any `.latest-tile__emblem-wrap` rules inside media queries near ~1490–1550)

- [ ] **Step 1: Replace `.latest-tile__emblem-wrap` styles**

```css
  .latest-tile__emblem-wrap {
    flex-shrink: 0;
    position: relative;
    width: 34%;
    margin: calc(-1 * var(--space-md));
    margin-left: 0;
    padding: var(--space-md) var(--space-md) var(--space-md) var(--space-lg);
    clip-path: polygon(24% 0, 100% 0, 100% 100%, 6% 100%);
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
  }

  /* Gold hairline tracing the seam; skew approximates the clip edge angle —
     tune left/skew at preview so it hugs the edge */
  .latest-tile__emblem-wrap::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 15%;
    width: 2px;
    background: var(--color-gold);
    transform: skewX(-8deg);
    opacity: 0.7;
  }
```

The negative margins bleed the field to the tile edges (tile padding is
`var(--space-md)`; `overflow: hidden` on `.bento-tile` keeps the clip clean).
Remove the old `margin-top: 8px; margin-bottom: 8px;` and `width: 56px`.

- [ ] **Step 2: Reconcile the media-query overrides**

Read the existing `.latest-tile__emblem-wrap` rules in the media queries
around lines 1490–1550 and replace their sizing with a flattened bottom
field for narrow layouts:

```css
  @media (max-width: 768px) {
    .latest-tile__inner {
      flex-direction: column;
    }

    .latest-tile__emblem-wrap {
      width: auto;
      margin: 0 calc(-1 * var(--space-md)) calc(-1 * var(--space-md));
      clip-path: polygon(0 22%, 100% 0, 100% 100%, 0 100%);
      justify-content: center;
      padding: var(--space-md);
    }

    .latest-tile__emblem-wrap::before {
      display: none;
    }

    .latest-tile__emblem {
      max-width: 120px;
    }
  }
```

If the existing media queries already set a column layout or hide the emblem
at some widths, prefer the existing behavior and only adjust what conflicts —
the goal is the angled field, not a relayout.

- [ ] **Step 3: Verify in the preview**

Checks at desktop width:
- Emblem art sits on a visibly deeper black angled field reaching the tile's
  top/right/bottom edges; a thin gold line traces the seam.
- The 7s entry cycling still fades and swaps the emblem inside the field
  (wait through one cycle; `.is-cycling` opacity transition unchanged).
- At 375px the field flattens to the bottom edge without horizontal overflow.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: latest tile angled emblem field with gold seam"
```

---

### Task 5: Shelf tile — angled collage bleed

**Files:**
- Modify: `src/pages/index.astro` (scoped `<style>`: `.tile-poster-strip` at ~850)

- [ ] **Step 1: Add the diagonal top clip to the collage**

Per spec: one cut, no new colors, no hairline. Modify `.tile-poster-strip`:

```css
  .tile-poster-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-xs);
    align-items: center;
    clip-path: polygon(0 12%, 100% 0, 100% 100%, 0 100%);
  }
```

- [ ] **Step 2: Verify in the preview**

Checks:
- The top edge of the 8-cover collage is a subtle descending diagonal (top-
  right corner of the collage higher than top-left); covers visibly "tuck
  under" the header zone.
- Hover still brightens covers (`opacity 0.75 → 0.9`); no layout shift.
- At mobile width the cut still reads (it scales with the container — no
  media query needed).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: shelf tile angled collage bleed edge"
```

---

### Task 6: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Build and unit tests**

Run: `npm run build && npm run test`
Expected: build completes; all vitest suites pass (no utils were touched —
this guards against accidental frontmatter breakage in `index.astro`).

- [ ] **Step 2: Preview sweep**

Desktop (≥1100px), tablet (900px), mobile (375px):
- All three seams render; shared angle family reads as one system.
- Journal: both header links route to the filtered journal views and the
  segmented control shows the matching selection (`Note` / `Showcase`).
- Keyboard: Tab order runs notes header → note rows → SHOWCASES tab →
  showcase rows; every stop shows a visible focus state.
- Emulate `prefers-reduced-motion: reduce`: seam does not move on hover.
- Console: no errors on `/`.

- [ ] **Step 3: Fix anything found, re-verify, commit fixes**

```bash
git add src/pages/index.astro
git commit -m "fix: diagonal tile polish from verification pass"
```

(Skip the commit if nothing needed fixing.)

---

### Task 7: Documentation

**Files:**
- Modify: `CLAUDE.md` (Bento Tile Hierarchy section + Important Implementation Details)

- [ ] **Step 1: Update CLAUDE.md**

Rewrite the Journal tile bullet in "Bento Tile Hierarchy":

```markdown
- **Journal tile** (`.journal-tile`, 4×2, core, slash split): gold notes field / black showcases field separated by a diagonal `clip-path` seam (`::before` overlay; shifts ~2% on hover, static under reduced motion). Root is a `div` (no nested anchors). Left: JOURNAL tab + "Notes" heading linking to `/journal?types=note`, five deep-link rows with right-aligned dates. Right: gold SHOWCASES tab linking to `/journal?types=showcase`, three showcase rows (42px emblem + visible title; gold border marks the most recent). Corner hover triangle is gold (overrides the highlight-tile black — it sits on the black field). Below 1024px the fields stack with a near-horizontal seam.
```

Update the Latest tile bullet (append):

```markdown
  The emblem sits on a deeper-black angled field (`.latest-tile__emblem-wrap`, `clip-path` + negative margins) traced by a gold hairline seam — the quiet echo of the Journal slash.
```

Update the Shelf/Media tile mention (append to the core tiles bullet or Shelf grid note):

```markdown
  The homepage Shelf tile's 8-cover collage tucks under a diagonal top edge (`.tile-poster-strip` clip) — one cut, no new colors.
```

Add to the design-system section (after the P4G Vocabulary Utilities list):

```markdown
- Diagonal-language rule: full slash/seam treatments are reserved for tiles with two real content zones (Journal, Latest, Shelf collage). Single-zone tiles carry the motif only via the corner-cut hover triangle — don't add decorative slashes.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document diagonal tile language in CLAUDE.md"
```
