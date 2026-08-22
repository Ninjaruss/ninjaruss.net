# /status → /about Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fold the `/status` arc card into `/about`, delete the `/status` route, and re-point every entry point (nav, homepage tiles, redirects, transition map) at the merged page.

**Architecture:** `/about` keeps its header / left-rail / main-column layout. The arc card becomes the first child of the main column (the live layer above the static profile); the mailbox strip's one useful line folds into the rail's existing Connect section; the `LV n` chip is dropped. `src/pages/status/index.astro` and `src/styles/status.css` are deleted, and `/status` + `/stream` 301 to `/about`.

**Tech Stack:** Astro 5, vanilla CSS (design tokens in `src/styles/global.css`), vitest.

**Spec:** `docs/superpowers/specs/2026-08-19-about-status-merge-design.md`

**A note on testing:** most of this change is markup and routing, which this repo does not unit-test. Exactly one piece of pure logic changes (`statForPath` in `src/scripts/transition.ts`), and Task 4 does it test-first. Every other task verifies with `npm run build` plus a specific browser assertion. Do not skip those — they are the tests for those tasks.

---

### Task 1: Arc card moves into /about

**Files:**
- Modify: `src/pages/about.astro` (frontmatter + `.about__main`)
- Modify: `src/styles/about.css` (append arc rules)

- [ ] **Step 1: Add the arc-card data to the about.astro frontmatter**

`src/pages/about.astro` already imports `readFileSync` and `join`. Add two imports below the existing `parseProtagonist` import:

```ts
import { parseCurrentArc } from '../utils/currentArc';
import { STAT_COLORS, hexToRgbTriplet } from '../utils/sessions';
```

Then, in the frontmatter directly after the `protagonist` try/catch block, add:

```ts
/* The current arc — the page's one live element besides the NOW line. Read
   from the same _quests.md section /status used to read, with the same
   contract: an absent or incomplete section renders no card at all rather
   than blanks, and an unrecognized Stat degrades to neutral gold. */
let questsRaw = '';
try {
  questsRaw = readFileSync(join(process.cwd(), 'src/content/sessions/_quests.md'), 'utf-8');
} catch {
  /* Missing file → no arc card. */
}
const currentArc = parseCurrentArc(questsRaw);

function colorBg(hex: string, a: number): string {
  return `rgba(${hexToRgbTriplet(hex).join(',')},${a})`;
}

const arcColor = currentArc?.stat ? STAT_COLORS[currentArc.stat] : null;
const arcEmblem = currentArc?.stat
  ? `/images/emblems/${currentArc.stat.toLowerCase()}.png`
  : '/images/emblems/default.svg';
const arcCardStyle = arcColor
  ? `--arc-color:${arcColor};--arc-color-dim:${colorBg(arcColor, 0.35)}`
  : '';
```

- [ ] **Step 2: Render the arc card as the first child of the main column**

In `src/pages/about.astro`, find:

```astro
      <div class="about__main">
        {profile && <p class="about__hook">{profile.hook}</p>}
```

Replace with:

```astro
      <div class="about__main">
        {currentArc && (
          <section class="arc-card" style={arcCardStyle} aria-label="Current arc">
            <div class="arc-card__top">
              <div class="arc-badge">
                <img src={arcEmblem} alt="" />
              </div>
              <div>
                <span class="arc-kicker">Current arc{currentArc.stat ? ` · ${currentArc.stat}` : ''}</span>
                <h2 class="arc-title">{currentArc.arc}</h2>
              </div>
            </div>
            <span class="arc-decision-label">Active decision</span>
            <p class="arc-decision-text">{currentArc.decision}</p>
            {currentArc.updated && <span class="arc-updated">updated {currentArc.updated}</span>}
          </section>
        )}

        {profile && <p class="about__hook">{profile.hook}</p>}
```

- [ ] **Step 3: Move the arc CSS into about.css**

In `src/styles/about.css`, insert the following immediately BEFORE the closing `@media (prefers-reduced-motion: reduce) {` block at the end of the file. These rules are copied verbatim from `src/styles/status.css` (which Task 3 deletes):

```css
/* ── Current arc card ────────────────────────────────────────────────── */
/* Copied from the retired status.css. The whole card is accent-colored by
   the arc's stat via --arc-color / --arc-color-dim, set inline on the
   element; both fall back to gold when the Stat is missing or unknown. */

.arc-card {
  border: 2px solid var(--arc-color, var(--color-gold));
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  background: rgba(255, 255, 255, 0.02);
}
.arc-card__top {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--arc-color-dim, rgba(var(--color-gold-rgb), 0.25));
}
/* The emblem PNGs are opaque-white line art, so they need a dark plate —
   dropped straight onto a pale accent like Insight they wash out. */
.arc-badge {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-surface-1);
  border: 2px solid var(--arc-color, var(--color-gold));
  box-shadow: 0 0 16px var(--arc-color-dim, rgba(var(--color-gold-rgb), 0.35));
  display: flex;
  align-items: center;
  justify-content: center;
}
.arc-badge img { width: 44px; height: 44px; object-fit: contain; }
.arc-kicker {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--arc-color, var(--color-gold));
  margin-bottom: 4px;
}
.arc-title {
  margin: 0;
  font-size: var(--text-panel-title);
  color: var(--color-text);
}
.arc-decision-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin-bottom: 6px;
}
.arc-decision-text {
  margin: 0 0 var(--space-sm);
  color: var(--color-text);
  line-height: 1.65;
}
.arc-updated {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: var(--arc-color, var(--color-gold));
}

@media (max-width: 768px) {
  .arc-card__top { flex-wrap: wrap; }
}
```

Note the one deliberate change from the original: `margin-bottom: var(--space-lg)` is dropped from `.arc-card`, because `.about__main` is a flex column with `gap: 2.5rem` — keeping the margin would double the space below the card.

- [ ] **Step 4: Build and verify the card renders**

Run: `npm run build`
Expected: exit 0, no errors.

Run: `grep -c 'arc-card' dist/client/about/index.html`
Expected: a number ≥ 1 (the card is in the built HTML).

Run: `grep -o 'Current arc[^<]*' dist/client/about/index.html`
Expected: `Current arc · <Stat>` matching the `**Stat:**` field in `src/content/sessions/_quests.md`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/about.astro src/styles/about.css
git commit -m "feat: render the current-arc card at the top of /about"
```

---

### Task 2: Mailbox line folds into Connect

**Files:**
- Modify: `src/pages/about.astro` (the Connect `<section>` in `.about__rail`)
- Modify: `src/styles/about.css` (one new rule)

- [ ] **Step 1: Add the stream sub-label to the Connect section**

In `src/pages/about.astro`, find:

```astro
        <section>
          <h2 class="about__section-label">Connect</h2>
          {profile?.connect && <p class="about__connect">{profile.connect}</p>}
```

Replace with:

```astro
        <section>
          <h2 class="about__section-label">Connect</h2>
          {profile?.connect && <p class="about__connect">{profile.connect}</p>}
          {/* Carried over from the retired /status mailbox strip. One line of
              literal copy, not a profile schema field. */}
          <p class="about__connect-stream">Send mail to be read on stream</p>
```

Leave the rest of the section (the `#about-mail` anchor and the `<noscript>` fallback) exactly as it is.

- [ ] **Step 2: Style the new line**

In `src/styles/about.css`, find the `.about__connect` rule and add this rule directly after it:

```css
.about__connect-stream {
  margin: 0 0 0.75rem;
  color: var(--color-text-subtle);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: exit 0.

Run: `grep -c 'Send mail to be read on stream' dist/client/about/index.html`
Expected: `1`

Run: `grep -c 'mailbox@ninjaruss' dist/client/about/index.html`
Expected: `0` — the address is assembled client-side and must never appear in the
served HTML. (Do not grep for the substring `mailto:` — the inline assembly
script legitimately contains the literal `"mailto:"`, so that check always
returns 1 and proves nothing.)

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro src/styles/about.css
git commit -m "feat: fold the mailbox stream line into the /about Connect block"
```

---

### Task 3: Delete /status and redirect it

**Files:**
- Delete: `src/pages/status/index.astro`
- Delete: `src/styles/status.css`
- Modify: `astro.config.mjs:12-16`

- [ ] **Step 1: Confirm nothing else imports status.css**

Run: `grep -rn "status.css" src scripts`
Expected: exactly one hit, `src/pages/status/index.astro:14`. If anything else appears, stop and report it before deleting.

- [ ] **Step 2: Delete the page and its stylesheet**

```bash
git rm src/pages/status/index.astro src/styles/status.css
```

The `LV n` chip dies with the page. `src/utils/level.ts` and `src/tests/level.test.ts` stay — do not delete them.

- [ ] **Step 3: Add the redirects**

In `astro.config.mjs`, find:

```js
  redirects: {
    '/media': '/shelf',
    '/media/[...slug]': '/shelf/[...slug]',
    '/stream': '/status',
  },
```

Replace with:

```js
  redirects: {
    '/media': '/shelf',
    '/media/[...slug]': '/shelf/[...slug]',
    /* /stream → /status → /about happened over two renames. Both point
       straight at /about so there is no redirect chain. */
    '/stream': '/about',
    '/status': '/about',
  },
```

- [ ] **Step 4: Build and verify both redirects exist**

Run: `npm run build`
Expected: exit 0.

Run: `grep -ro '"/status"\|"/stream"' .vercel/output/config.json dist/client/status/index.html dist/client/stream/index.html 2>/dev/null`

Expected: at least one hit. The Vercel adapter may emit redirects into
`.vercel/output/config.json` as routes rather than as meta-refresh files in
`dist/`, so check whichever exists:

- if `.vercel/output/config.json` exists, run
  `grep -o '"src": "/status[^}]*' .vercel/output/config.json` and expect a
  route whose `Location` header is `/about`;
- if `dist/client/status/index.html` exists instead, run
  `grep -o 'url=[^"]*' dist/client/status/index.html` and expect `url=/about`.

Do the same check for `/stream`. Both must resolve to `/about` directly — if
either points at the other, the chain was not removed.

- [ ] **Step 5: Commit**

```bash
git add -A src/pages/status src/styles/status.css astro.config.mjs
git commit -m "refactor: delete /status, redirect it and /stream to /about"
```

---

### Task 4: Transition card keeps the Chaos identity

The page-transition canvas picks a stat card by route prefix. `/status` was mapped to Chaos; with the route gone, `/about` would silently fall through to the `Determination` default. This is the one piece of pure logic in the merge, so it goes test-first.

**Files:**
- Modify: `src/tests/transition.test.ts:85-88`
- Modify: `src/scripts/transition.ts:42`

- [ ] **Step 1: Write the failing test**

In `src/tests/transition.test.ts`, find:

```ts
  it('returns Chaos for /status', () => {
    expect(statForPath('/status').color).toBe('#2dd4bf');
    expect(statForPath('/status').name).toBe('CHAOS');
  });
```

Replace with:

```ts
  it('returns Chaos for /about', () => {
    expect(statForPath('/about').color).toBe('#2dd4bf');
    expect(statForPath('/about').name).toBe('CHAOS');
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- transition`
Expected: FAIL — `returns Chaos for /about` reports `expected '#ff4040' to be '#2dd4bf'` (the Determination fallback).

- [ ] **Step 3: Retarget the route map**

In `src/scripts/transition.ts`, find the line inside `ROUTE_STATS`:

```ts
  ['/status',   'Chaos'],
```

Replace with:

```ts
  ['/about',    'Chaos'],
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- transition`
Expected: PASS, all transition tests green.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/transition.ts src/tests/transition.test.ts
git commit -m "refactor: move the Chaos transition card from /status to /about"
```

---

### Task 5: NavPill points at About

**Files:**
- Modify: `src/components/NavPill.astro:13`

- [ ] **Step 1: Replace the Status item**

In `src/components/NavPill.astro`, find:

```ts
  { href: '/status', label: 'Status', match: ['/status'] },
```

Replace with:

```ts
  { href: '/about', label: 'About', match: ['/about'] },
```

Do not add or remove any other item: the list must stay at 7 so the ≤768px 4+3 wrap is unchanged.

- [ ] **Step 2: Build and verify the nav highlights About on /about**

Run: `npm run build`
Expected: exit 0.

Run: `grep -o 'href="/about"[^>]*aria-current="page"' dist/client/about/index.html`
Expected: one match — the About item is marked current on its own page.

Run: `grep -c 'href="/status"' dist/client/journal/index.html`
Expected: `0` — no interior page still links to the dead route.

- [ ] **Step 3: Commit**

```bash
git add src/components/NavPill.astro
git commit -m "feat: replace the NavPill Status item with About"
```

---

### Task 6: Homepage entry points

Three edits in `src/pages/index.astro`: drop the title-tile About button (the nav covers it now), re-frame the stream tile as a profile card, and re-point the mail tile's no-JS fallback.

**Files:**
- Modify: `src/pages/index.astro` (frontmatter ~line 12, markup ~lines 127 / 276-300 / 393, scoped CSS ~lines 704-732)

- [ ] **Step 1: Import the protagonist into the homepage frontmatter**

The stream tile's new title is the protagonist's name, which `index.astro` does not currently read. Add this import alongside the existing utility imports at the top:

```ts
import { parseProtagonist, DEFAULT_PROTAGONIST } from '../utils/protagonist';
```

Then, directly after the existing `const currentArc = parseCurrentArc(questsRaw);` line, add:

```ts
/* Name for the About tile — same source /about reads. */
let protagonist = DEFAULT_PROTAGONIST;
try {
  const protagonistRaw = readFileSync(join(process.cwd(), 'src/content/sessions/_protagonist.md'), 'utf-8');
  protagonist = parseProtagonist(protagonistRaw);
} catch {
  /* Missing file → defaults. */
}
```

- [ ] **Step 2: Remove the title-tile About button**

In the markup, find:

```astro
        <p class="title-tile__description">In spite of it all...</p>
        <a class="title-tile__about p4g-sweep" href="/about"><span>About</span></a>
      </div>
```

Replace with:

```astro
        <p class="title-tile__description">In spite of it all...</p>
      </div>
```

- [ ] **Step 3: Remove the now-dead title-tile CSS**

In the scoped `<style>` block, delete this entire run (comment included):

```css
  /* Always-visible entry point to the profile card — a new visitor
     shouldn't have to hover to discover it. */
  .title-tile__about {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    margin-top: var(--space-sm);
    padding: 8px 20px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-gold);
    text-decoration: none;
    border: 1px solid rgba(var(--color-gold-rgb), 0.4);
    transition: border-color var(--transition-fast);
  }

  .title-tile__about:hover,
  .title-tile__about:focus-visible {
    border-color: var(--color-gold);
  }

  .title-tile__about:focus-visible {
    outline: 2px solid var(--color-gold);
    outline-offset: 2px;
  }
```

Leave the surrounding `.title-tile:has(:focus-visible) .title-tile__description` rule above it and the `/* ─── Journal Tile ─── */` comment below it untouched.

- [ ] **Step 4: Re-frame the stream tile as a profile card**

Find the tile's opening tag and header:

```astro
      <a
        id="stream-tile"
        href="/status"
        class="bento-tile bento-tile--dark bento-tile--interactive stream-tile"
        style={`--st-lead: ${arcColor};`}
      >
        <div class="bento-tile__header">
          <span class="bento-tile__label">Status</span>
          <h3 class="bento-tile__title">{currentArc ? currentArc.arc : 'Status'}</h3>
        </div>
```

Replace with:

```astro
      <a
        id="stream-tile"
        href="/about"
        class="bento-tile bento-tile--dark bento-tile--interactive stream-tile"
        style={`--st-lead: ${arcColor};`}
      >
        {/* Reads as a profile card first — a stranger should learn there is a
            person here, with the current arc underneath as evidence. */}
        <div class="bento-tile__header">
          <span class="bento-tile__label">About</span>
          <h3 class="bento-tile__title">{protagonist.name}</h3>
        </div>
```

Do not touch anything below that header: `.st-body`, the `currentArc` teaser and its "The story hasn't started yet." empty state, `.st-footer`, the `► load` CTA, the `#st-live-badge` element, and the `is-live` pulse all stay exactly as they are. The `id="stream-tile"` must stay too — the live-status script at the bottom of the file looks it up by that id.

- [ ] **Step 5: Re-point the mail tile's no-JS fallback**

Find:

```astro
      <a href="/status" id="mail-tile" class="logo-tile logo-tile--mail p4g-sweep bento-tile--span-2x1 p3r-animate" style="--stagger-delay: 200ms;">
```

Replace with:

```astro
      <a href="/about" id="mail-tile" class="logo-tile logo-tile--mail p4g-sweep bento-tile--span-2x1 p3r-animate" style="--stagger-delay: 200ms;">
```

Then update the comment directly above it, which names the old destination. Find `is a real no-JS fallback (the /status Mailbox), not a dead #anchor` and change `/status Mailbox` to `/about Connect block`.

- [ ] **Step 6: Build and verify the homepage**

Run: `npm run build`
Expected: exit 0.

Run: `grep -c 'href="/status"' dist/client/index.html`
Expected: `0`

Run: `grep -c 'title-tile__about' dist/client/index.html`
Expected: `0`

Run: `grep -o 'stream-tile[^>]*' dist/client/index.html | head -1`
Expected: contains `href="/about"` (attribute order may differ).

Run: `grep -o '<span class="bento-tile__label">About</span>' dist/client/index.html`
Expected: one match.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: re-frame the homepage status tile as an About profile card"
```

---

### Task 7: Documentation and full verification

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the CLAUDE.md sections that describe the old split**

Four places describe `/status` or the About entry point and are now wrong. Make these edits:

1. In the **Component Inventory → NavPill** entry: change `Links Home/Journal/VN/Shelf/Status/Now/Codex` to `Links Home/Journal/VN/Shelf/About/Now/Codex`, and change `Hidden on the homepage; rendered on /status.` to `Hidden on the homepage; rendered on /about.`

2. In **Bento Tile Hierarchy → Stream tile**: change the description to read `Dark 1×2 tile linking to /about; kicker "About", title = the protagonist's name, with a one-line teaser of the current arc's decision text (read from _quests.md's ## Current Arc section, the same source /about's arc card uses). Pulsing red border (--color-live) when live, via the unchanged /api/live-status.ts polling.`

3. In **Pages & Routes → Utility Pages → `/about`**: delete the sentence beginning "Reached from an always-visible \"About\" button under the homepage title tile's tagline" through "and still homepage-only" — that entry point and that stance are both gone. In its place, write:

   > Reached from NavPill (the About item, on every non-home page) and from the homepage's 1×2 About tile. The `.title-tile__about` button under the tagline was removed in the 2026-08 merge — an always-visible nav item replaces it. The page absorbed `/status` in that same merge: the current-arc card (`parseCurrentArc` over `_quests.md`) is the first block in the main column, above the hook, and the retired mailbox strip's "Send mail to be read on stream" line now sits in the rail's Connect section. Arc-card CSS lives in `about.css`; `status.css` was deleted.

4. Replace the **Sessions & /status** section heading and body: the page is now `/about`, `src/styles/status.css` is gone (arc rules live in `about.css`), the `LV n` chip and its `computeSiteLevel` call are dropped (`src/utils/level.ts` remains, unimported), and `/status` + `/stream` both 301 to `/about`. Keep the explanation of why the pause menu was retired and the note that `STAT_COLORS` is still consumed by `scripts/transition.ts` and the arc card.

Also add `/status → redirects to /about` to the **Legacy Routes (301 Redirects)** list and update the existing `/stream` line to say it redirects to `/about`.

- [ ] **Step 2: Run the full test suite**

Run: `npm run test`
Expected: all suites pass. `level.test.ts` still passes even though nothing imports `level.ts` — that is intentional.

- [ ] **Step 3: Run a clean build**

Run: `npm run build`
Expected: exit 0. The only warnings should be the two documented as expected in CLAUDE.md (the `src/content.config.ts` deprecation notice).

- [ ] **Step 4: Browser verification**

Start the dev server via the preview tooling (never `npm run dev` in a shell), then confirm all five:

1. `/about` — the arc card is the first block in the main column, has its stat accent color on the border/kicker/updated stamp, and shows the emblem badge on a dark plate.
2. `/about` — the Connect block reads: connect line, "Send mail to be read on stream", then the assembled `mailbox@ninjaruss.net` link.
3. `/status` and `/stream` — both land on `/about`.
4. `/` — the tile in rows 2-3 reads "About" / "Ninjaruss" with the arc decision as its teaser, and the title tile has no About button under the tagline.
5. `/journal` — the nav shows About, and it highlights (solid gold) when you follow it to `/about`.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: describe the merged /about profile-and-status page"
```
