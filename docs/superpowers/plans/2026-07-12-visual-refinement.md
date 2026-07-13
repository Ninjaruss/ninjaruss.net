# Six-Area Visual Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved six-area visual refinement spec (`docs/superpowers/specs/2026-07-12-visual-refinement-design.md`): split-view auto-open fix + stats placeholder, mobile NavPill two-row wrap with clearance, logo-tile P4G treatment, homepage tile density, shelf wayfinding, stream/now polish.

**Architecture:** All changes are presentational Astro/CSS plus one client-TS timing fix. No utility-module contracts change; existing vitest suites must keep passing. Each task is independently shippable and committed separately. Verification is browser-based (dev server at localhost:4321) because the repo's vitest setup covers pure modules only — DOM behavior is verified live.

**Tech Stack:** Astro 5, vanilla CSS (design tokens in `src/styles/global.css`), TypeScript client scripts, vitest.

**Conventions that bind every task:**
- Never introduce new colors; use existing tokens (`--color-gold`, `--color-black`, etc.)
- Every `:hover` rule gets a comma-paired `:focus-visible`
- `clip-path` clips `box-shadow` — clipped elements needing shadows use `filter: drop-shadow(...)`
- Respect `prefers-reduced-motion`
- Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` (note: repo signs commits via 1Password; if commit fails with "failed to fill whole buffer", tell the user to unlock 1Password and retry)

**Verification setup (once):** `npm run dev` (or reuse running server) → localhost:4321.

---

### Task 0: Commit the staged spec

The spec file is already staged but uncommitted (1Password signing failed earlier).

- [ ] **Step 0.1:** Run `git status` — expect `docs/superpowers/specs/2026-07-12-visual-refinement-design.md` staged.
- [ ] **Step 0.2:** `git commit -m "docs: visual refinement design spec (six-area audit)"` (with co-author trailer). If 1Password signing fails, ask the user to unlock 1Password, then retry once. If it still fails, continue with Task 1 and retry commits at the end — do not block.

---

### Task 1: Fix split-view auto-open race

**Files:**
- Modify: `src/utils/splitView/index.ts:104-121`

**Bug:** `initSplitView` may run from `DOMContentLoaded` before the stylesheet is applied; `getComputedStyle(splitView).gridTemplateColumns` then reads a single track, the `>= 3` desktop check fails, and auto-open silently skips.

- [ ] **Step 1.1: Apply the fix** — replace the `else` branch (lines 107-120) with the same logic deferred one frame:

```ts
  } else {
    // No slug in the URL — auto-open the newest visible entry so visitors
    // land on content instead of the empty placeholder. URL stays untouched
    // until the user actually selects something. Desktop only: in the
    // single-column layout .has-selection collapses the list panel, which
    // must stay visible — detect the applied layout, not the viewport.
    // Deferred one frame: when init runs from DOMContentLoaded the stylesheet
    // may not be applied yet and gridTemplateColumns reads as a single track.
    requestAnimationFrame(() => {
      const isDesktopLayout =
        getComputedStyle(splitView).gridTemplateColumns.trim().split(/\s+/).length >= 3;
      const firstVisible = elements.listItems.find(item => !item.classList.contains('is-filtered'));
      const firstSlug = firstVisible?.dataset.slug;
      if (isDesktopLayout && firstSlug) {
        loadContent(firstSlug, elements, state, idleManager, { pushHistory: false, focusHeading: false });
      }
    });
  }
```

- [ ] **Step 1.2: Run existing tests** — `npm run test`. Expected: all pass (no suite covers this file's DOM paths).
- [ ] **Step 1.3: Verify live (desktop)** — load `localhost:4321/journal` at a viewport ≥ 1280px wide. Expected: the newest entry ("Avoidance") opens automatically in the center panel; URL stays `/journal`; the list shows it highlighted. Repeat on `/codex`. Also verify navigation path: from `/` click Journal in a tile → same result.
- [ ] **Step 1.4: Verify live (mobile)** — at 375px width load `/journal`. Expected: NO auto-open (list stays visible, placeholder area not shown in single-column layout).
- [ ] **Step 1.5: Commit** — `git add src/utils/splitView/index.ts && git commit -m "fix(splitview): defer desktop-layout detection so auto-open survives the style-load race"`

---

### Task 2: Placeholder stats block (journal + codex)

**Files:**
- Modify: `src/layouts/SplitViewLayout.astro` (Props ~line 7-19, placeholder markup ~line 84-96, CSS ~line 596-646)
- Modify: `src/pages/journal/index.astro` (frontmatter + layout props)
- Modify: `src/pages/codex/index.astro` (frontmatter + layout props)

- [ ] **Step 2.1: Add the prop.** In `SplitViewLayout.astro` Props interface add:

```ts
  placeholderStats?: { label: string; value: string }[];
```

and destructure it: `const { title, description, section, kicker, initialSlug, initialEmblem, pageTitle, ogImage, ogType, placeholderStats } = Astro.props;`

- [ ] **Step 2.2: Render stats in the placeholder.** Replace the placeholder title `<p>` (line 94) with:

```astro
            {placeholderStats && placeholderStats.length > 0 ? (
              <dl class="split-view__placeholder-stats">
                {placeholderStats.map(stat => (
                  <div class="split-view__placeholder-stat">
                    <dt>{stat.label}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p class="split-view__placeholder-title">Choose an entry</p>
            )}
```

(The emblem SVG above and the ⌘K hint below stay unchanged.)

- [ ] **Step 2.3: Add CSS** next to the existing `.split-view__placeholder-title` rules:

```css
  .split-view__placeholder-stats {
    display: flex;
    gap: var(--space-xl);
    margin: 0;
  }

  .split-view__placeholder-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2xs);
  }

  .split-view__placeholder-stat dt {
    font-family: var(--font-mono);
    font-size: var(--text-2xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    color: var(--color-text-subtle);
  }

  .split-view__placeholder-stat dd {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--color-text-muted);
  }
```

- [ ] **Step 2.4: Journal stats.** In `src/pages/journal/index.astro` frontmatter (after `const items = ...`):

```ts
const noteCount = items.filter(i => i.type === 'note').length;
const showcaseCount = items.filter(i => i.type === 'showcase').length;
const newestDate = items[0]?.entry.data.publishedAt;
const placeholderStats = [
  { label: 'notes', value: String(noteCount) },
  { label: 'showcases', value: String(showcaseCount) },
  ...(newestDate ? [{ label: 'newest', value: formatDate(newestDate) }] : []),
];
```

Pass `placeholderStats={placeholderStats}` on the `<SplitViewLayout>` element. (`formatDate` is already imported in this file.)

- [ ] **Step 2.5: Codex stats.** In `src/pages/codex/index.astro` frontmatter:

```ts
const sourceCount = concepts.reduce((n, c) => n + c.entries.length, 0);
const placeholderStats =
  concepts.length > 0
    ? [
        { label: 'concepts', value: String(concepts.length) },
        { label: 'source entries', value: String(sourceCount) },
      ]
    : undefined;
```

Pass `placeholderStats={placeholderStats}` on the `<SplitViewLayout>` element.

- [ ] **Step 2.6: Verify live.** The placeholder is hidden by auto-open on desktop, so check it where it still appears: (a) at 375px width load `/journal` — scroll under the list: placeholder shows note/showcase/newest stats instead of "Choose an entry"; (b) on desktop `/journal`, type a garbage search (`zzzz`) — the list shows the existing "No entries found" block (unchanged; it lives in the list panel, not the placeholder). (c) `/codex` mobile shows concepts/source-entries stats.
- [ ] **Step 2.7: Run `npm run build`.** Expected: success (catches Astro prop/type errors).
- [ ] **Step 2.8: Commit** — `git add src/layouts/SplitViewLayout.astro src/pages/journal/index.astro src/pages/codex/index.astro && git commit -m "feat(splitview): functional stats placeholder for journal and codex"`

---

### Task 3: Mobile NavPill two-row wrap + clearance guarantee

**Files:**
- Modify: `src/components/NavPill.astro` (media query ~line 152-168, plus new script)
- Modify: `src/pages/now.astro:62`, `src/pages/now/archive.astro:63`, `src/pages/now/[...slug].astro:58`
- Modify: `src/layouts/SplitViewLayout.astro:438`
- Modify: `src/styles/novel.css:41`

- [ ] **Step 3.1: Replace the 480px media block** in `NavPill.astro` with a 768px two-row wrap. Delete the existing `@media (max-width: 480px)` block and add:

```css
  @media (max-width: 768px) {
    .nav-bar {
      left: var(--space-sm);
      right: var(--space-sm);
      bottom: var(--space-sm);
    }

    /* Two-row wrap: gap + gold-tinted inner background paints hairlines
       between rows and columns without per-item border bookkeeping */
    .nav-bar__inner {
      flex-wrap: wrap;
      gap: 1px;
      background: rgba(255, 229, 44, 0.18);
    }

    .nav-bar__item {
      flex: 1 1 24%;
      min-height: 44px;
      padding: var(--space-xs) var(--space-2xs);
      font-size: 0.6rem;
      background: var(--color-black);
    }

    .nav-bar__item + .nav-bar__item {
      border-left: none;
    }

    .nav-bar__item--active {
      background: var(--color-gold);
    }
  }
```

`flex-basis: 24%` puts 4 items on row one; the remaining 3 (plus optional back link) grow to fill row two.

- [ ] **Step 3.2: Add the clearance script** at the end of `NavPill.astro` (after `</style>`):

```astro
<script>
  // Publishes the nav's real height so pages can pad their bottom edge —
  // the two-row mobile bar must never cover content.
  function setNavClearance() {
    const nav = document.querySelector<HTMLElement>('.nav-bar');
    const clearance = nav ? nav.offsetHeight + 16 : 0;
    document.documentElement.style.setProperty('--nav-clearance', `${clearance}px`);
  }
  setNavClearance();
  document.addEventListener('astro:page-load', setNavClearance);
  window.addEventListener('resize', setNavClearance);
</script>
```

- [ ] **Step 3.3: Consume the variable.** Update each fixed clearance (fallbacks preserve today's values if JS is off):
  - `src/pages/now.astro:62`: `padding-bottom: 80px;` → `padding-bottom: calc(var(--nav-clearance, 80px) + var(--space-md));`
  - `src/pages/now/archive.astro:63`: same replacement
  - `src/pages/now/[...slug].astro:58`: same replacement
  - `src/layouts/SplitViewLayout.astro:438`: `padding-bottom: calc(var(--space-3xl) + 80px);` → `padding-bottom: calc(var(--space-3xl) + var(--nav-clearance, 80px));`
  - `src/styles/novel.css:41`: `padding-bottom: 120px;` → `padding-bottom: calc(var(--nav-clearance, 120px) + var(--space-lg));`

- [ ] **Step 3.4: Verify live at 375px.** (a) `/journal`: nav shows two rows (4 + 3), no label collisions, every item ≥44px tall; scroll the list to the bottom — the last list item clears the bar. (b) `/novel/scenes/arc-structure`: scroll to the end — final prose line clears the bar. (c) `/now`: archive link clears the bar. (d) Desktop ≥1280px: nav unchanged (single row, bottom-left).
- [ ] **Step 3.5: Verify reduced motion is unaffected** (script only sets a CSS var — no motion added).
- [ ] **Step 3.6: Commit** — `git add src/components/NavPill.astro src/pages/now.astro "src/pages/now/archive.astro" "src/pages/now/[...slug].astro" src/layouts/SplitViewLayout.astro src/styles/novel.css && git commit -m "feat(nav): two-row mobile NavPill with measured content clearance"`

---

### Task 4: Logo tiles — kicker chips, corner cut, hover sweep

**Files:**
- Modify: `src/pages/index.astro` — markup lines ~455-497, CSS lines ~586-680

- [ ] **Step 4.1: Markup.** Add a kicker chip as the first child of each logo tile and the `p4g-sweep` class to each:
  - MAL (`line ~459`): `class="logo-tile logo-tile--mal p4g-sweep p3r-animate"`, first child:
    `<span class="logo-tile__kicker" aria-hidden="true"><span>Watchlist</span></span>`
  - Spotify (`~475`): same with `<span>Listening</span>`
  - Email (`~490`): same with `<span>Contact</span>`

- [ ] **Step 4.2: CSS — corner cut + chip.** In the `.logo-tile` block:

```css
  .logo-tile {
    /* existing flex/padding/background rules stay */
    position: relative;
    border-radius: 0;
    /* corner cut — clip-path clips box-shadow, so hover shadow moves to drop-shadow */
    clip-path: polygon(
      0 0,
      100% 0,
      100% calc(100% - var(--cut-md)),
      calc(100% - var(--cut-md)) 100%,
      0 100%
    );
  }

  .logo-tile__kicker {
    position: absolute;
    top: var(--space-sm);
    left: -4px;
    padding: 2px 12px 2px 14px;
    background: var(--color-gold);
    color: var(--color-black);
    font-family: var(--font-display);
    font-size: var(--text-2xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    transform: skewX(var(--skew-accent));
    z-index: 1;
  }

  .logo-tile__kicker > span {
    display: inline-block;
    transform: skewX(calc(-1 * var(--skew-accent)));
  }
```

- [ ] **Step 4.3: CSS — hover.** Replace the existing `.logo-tile:hover` rule and DELETE the four brand-hover rules (`.logo-tile--mal:hover`, `.logo-tile--mal:hover .logo-tile__label`, `.logo-tile--spotify:hover`, `.logo-tile--spotify:hover .logo-tile__label`) — the gold sweep replaces brand accents:

```css
  .logo-tile:hover,
  .logo-tile:focus-visible {
    transform: translate(-4px, -4px);
    border-color: var(--color-gold);
    filter: drop-shadow(4px 4px 0 rgba(255, 229, 44, 0.3));
  }

  /* Sweep paints the tile gold — flip text to black for contrast */
  .logo-tile:hover .logo-tile__label,
  .logo-tile:focus-visible .logo-tile__label,
  .logo-tile:hover .logo-tile__description,
  .logo-tile:focus-visible .logo-tile__description {
    color: var(--color-black);
  }

  .logo-tile--mail:hover,
  .logo-tile--mail:focus-visible {
    color: var(--color-black); /* mail SVG uses currentColor */
  }
```

Note: `.p4g-sweep` (global.css:292) lifts children above its gold `::before` automatically. The `--mail` tile's existing resting `color: var(--color-gold-dim)` rule stays.

- [ ] **Step 4.4: Verify live on `/` desktop.** (a) Resting: three tiles show angled gold chips (WATCHLIST / LISTENING / CONTACT), corner-cut bottom-right, logos unchanged. (b) Hover each: diagonal gold sweep fills, text flips black, hard gold drop-shadow follows the cut silhouette. (c) Tab to each: `:focus-visible` shows the same treatment + outline. (d) 375px: chips don't overlap logos; tiles still render correctly. (e) `prefers-reduced-motion`: sweep still functions (it's a transition; acceptable) — confirm nothing new animates on load.
- [ ] **Step 4.5: Verify email tile JS still works** — hover/click the email tile; `initializeMailTile` should still assemble the `mailto:` (markup children changed order — the handler binds to `#mail-tile`, unaffected).
- [ ] **Step 4.6: Commit** — `git add src/pages/index.astro && git commit -m "feat(home): P4G kicker chips, corner cuts, gold sweep on logo tiles"`

---

### Task 5: Homepage tile density — rain fills novel tile, journal gets 7 rows

**Files:**
- Modify: `src/pages/index.astro` — rain markup ~line 273-277, rain CSS ~line 1607-1638, journal slice ~line 60

- [ ] **Step 5.1: More journal rows.** Line ~60: `.slice(0, 5)` → `.slice(0, 7)` (in the `recentJournal` chain).
- [ ] **Step 5.2: Denser, varied rain.** Replace the rain markup (lines 273-277) with:

```astro
        <div class="novel-rain" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => i).map(i => (
            <span class="novel-rain__drop" style={`--i: ${i}; --len: ${14 + (i % 3) * 8}px;`}></span>
          ))}
        </div>
```

- [ ] **Step 5.3: Rain CSS.** Update `.novel-rain__drop` (keep the keyframes and state rules as they are):

```css
  .novel-rain__drop {
    position: absolute;
    top: -30px;
    left: calc(3% + var(--i) * 7%);
    width: 1px;
    height: var(--len, 22px);
    background: linear-gradient(to bottom, transparent, rgba(157, 184, 204, 0.8));
    animation: novel-rain-fall 1.5s linear infinite;
    animation-delay: calc(var(--i) * 0.13s);
  }
```

The `is-misting` override (`height: 9px; animation-duration: 2.6s;`) and the reduced-motion static frame stay as-is — verify the reduced-motion block still reads correctly with `--len` (it overrides `height: 6px`, which wins because it comes later; confirm in DevTools).

- [ ] **Step 5.4: Verify live on `/`.** (a) Journal tile: seven note rows fill the gold field, dates right-aligned, seam clearance intact at 1280px and stacked layout at <1024px. (b) Novel tile: with recent scene work (`is-raining`), rain spans the full tile width/height evenly — no bare middle; `is-waiting` state (toggle by editing `data-scene-modified` in DevTools to an old date and re-running the init — or just confirm the static "the rain waits." line renders centered). (c) Reduced motion: drops render as static dashes near the bottom, no animation. (d) Hover: corner triangle still the only hover signature.
- [ ] **Step 5.5: Run `npm run test`** — expected pass (novel stats logic untouched).
- [ ] **Step 5.6: Commit** — `git add src/pages/index.astro && git commit -m "feat(home): rain fills the novel tile, journal tile shows seven rows"`

---

### Task 6: Shelf wayfinding — p4g headers + gold-tab jump bar

**Files:**
- Modify: `src/pages/shelf/index.astro` — jumpbar markup ~line 83-94, header markup ~line 106-110, CSS ~line 251-341, mobile override ~line 749

- [ ] **Step 6.1: Jump bar markup.** Wrap each link label so the counter-skew works (line ~91):

```astro
        <a
          href={`#section-${type}`}
          class="shelf-jumpbar__link"
          data-type={type}
          aria-current="false"
        >
          <span class="shelf-jumpbar__label">{TYPE_LABELS[type]}</span>
        </a>
```

- [ ] **Step 6.2: Jump bar CSS.** Replace the `.shelf-jumpbar__link` rules (lines 265-292) with angled tabs:

```css
  .shelf-jumpbar {
    /* existing sticky rules stay */
    gap: 3px;
    padding: 8px 4px;
  }

  .shelf-jumpbar__link {
    padding: 10px 16px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--color-muted);
    font-family: var(--font-display);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    white-space: nowrap;
    text-decoration: none;
    transform: skewX(var(--skew-accent));
    transition: color 150ms, background 150ms;
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .shelf-jumpbar__label {
    display: inline-block;
    transform: skewX(calc(-1 * var(--skew-accent)));
  }

  .shelf-jumpbar__link:hover,
  .shelf-jumpbar__link:focus-visible {
    color: var(--color-gold);
    border-color: rgba(255, 229, 44, 0.35);
  }

  .shelf-jumpbar__link.is-active,
  .shelf-jumpbar__link[aria-current="true"] {
    background: var(--color-gold);
    color: var(--color-black);
    border-color: var(--color-gold);
  }
```

(Remove the old `border-bottom` / `margin-bottom: -1px` indicator rules.)

- [ ] **Step 6.3: Section headers.** Replace the shimmer-gradient `h2` rule (lines 306-324) with the skewed display treatment:

```css
  .shelf-section__header h2 {
    font-family: var(--font-display);
    font-size: clamp(1.05rem, 2.5vw, 1.35rem);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    color: var(--color-gold);
    transform: skewX(var(--skew-display));
  }
```

Check whether `shimmer-sweep` keyframes are used elsewhere in the file (`grep -n shimmer-sweep src/pages/shelf/index.astro`); if this was the only consumer, delete the keyframes too. Update the mobile override at ~line 749 if it references removed properties.

- [ ] **Step 6.4: Verify live on `/shelf`.** (a) Section headers: gold, skewed, bold — reads as the same family as the page header above. (b) Jump bar: angled tabs; scroll through sections — active section becomes a solid gold tab with black text (AA contrast: black on `#ffe52c` passes). (c) Click each tab — anchors still land correctly below the sticky bar (check `scroll-margin-top` on `.shelf-section` still compensates; adjust to `scroll-margin-top: 72px` if the taller bar overlaps section tops). (d) 375px: bar scrolls horizontally, no wrap breakage. (e) Keyboard: tab through links — focus visible.
- [ ] **Step 6.5: Commit** — `git add src/pages/shelf/index.astro && git commit -m "feat(shelf): p4g section headers and gold-tab jump bar"`

---

### Task 7: Stream sprite + Now measure

**Files:**
- Modify: `src/styles/stream.css` — `.s-sprite img` ~line 185
- Modify: `src/pages/now.astro:60`

- [ ] **Step 7.1: Stream sprite fills its column.** In `stream.css`:

```css
.s-sprite img {
  width: clamp(200px, 16vw, 280px);
  height: auto;
  object-fit: cover;
  object-position: top center;
  display: block;
}
```

- [ ] **Step 7.2: Now measure.** `now.astro:60`: `max-width: 60ch;` → `max-width: 65ch;`
- [ ] **Step 7.3: Verify live.** (a) `/stream` at 1280px+: the portrait reads larger and the column above it no longer dominates; layout doesn't overflow at 1024px. (b) `/now`: single centered column, prose measure comfortable; 375px unaffected. (c) `/stream` at ≤900px: `.s-sprite` is `display: none` (line 1058) — unchanged.
- [ ] **Step 7.4: Commit** — `git add src/styles/stream.css src/pages/now.astro && git commit -m "chore(stream,now): larger VN sprite, 65ch now measure"`

---

### Task 8: Docs, build, final sweep

**Files:**
- Modify: `CLAUDE.md` (tile row count, rain drops, NavPill mobile, placeholder stats, shelf headers)

- [ ] **Step 8.1: Update CLAUDE.md** — five surgical edits, no restructuring:
  - Journal tile bullet: "five deep-link rows" → "seven deep-link rows"
  - Novel tile bullet: note rain spans the full tile (14 varied drops)
  - NavPill section: add "≤768px: items wrap into two rows (4+3); a script publishes `--nav-clearance` (nav height) consumed by page bottom paddings"
  - SplitViewLayout row in Layouts table: mention optional `placeholderStats` prop
  - Shelf Page Features: jump bar "gold underline" description → solid gold angled tab; section headers use skewed gold display type
  - Logo tiles bullet: mention kicker chips (WATCHLIST/LISTENING/CONTACT), corner cut, gold sweep hover
- [ ] **Step 8.2: Full build + tests** — `npm run build && npm run test`. Expected: both succeed.
- [ ] **Step 8.3: Final browser sweep** at 375px / 768px / 1280px: `/`, `/journal`, `/codex`, `/shelf`, `/novel`, `/novel/scenes/arc-structure`, `/now`, `/stream`. Confirm: auto-open works, placeholder stats show on mobile, nav never covers content, tiles/hover states correct, reduced-motion pass on `/` (DevTools emulation).
- [ ] **Step 8.4: Commit** — `git add CLAUDE.md && git commit -m "docs: update CLAUDE.md for six-area visual refinement"`
- [ ] **Step 8.5:** If any earlier commits failed on 1Password signing, retry them now (ask the user to unlock 1Password first).

---

## Self-Review Notes

- **Spec coverage:** §1 → Tasks 1-2; §2 → Task 3; §3 → Task 4; §4 → Task 5; §5 → Task 6; §6 → Task 7; testing section → verification steps in every task + Task 8.
- **Type consistency:** `placeholderStats` prop name identical across layout and both pages; `--nav-clearance` name identical across NavPill script and all five consumers; `--len`/`--i` custom props defined in markup before CSS use.
- **No placeholders:** every step carries the actual code or exact command.
