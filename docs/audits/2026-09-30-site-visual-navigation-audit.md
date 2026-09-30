# Site audit — visual & navigation (2026-09-30)

> **Status: all 47 findings addressed** (same day). Every fix was verified with
> `npm run build`, `npm run test` (216 tests) and spot-checks against the built
> HTML; `npx astro check` went from 12 pre-existing type errors to 10, so none
> were added. Per-finding status is in the [Resolution log](#resolution-log) at
> the end — including the four resolved by documented decision rather than code
> change. The findings below are left as written (this is the audit record);
> `CLAUDE.md` was updated wherever a fix changed documented behaviour, and it
> gained an explicit correction for the stale arc-card section (see Appendix B).

Scope: the shipped site (`https://www.ninjaruss.net`) and the source in `src/`.
Method: read the source, built the site (`npm run build`), inspected
`dist/client/`, fetched the live deployment, crawled all 142 built pages for
broken internal links, and computed contrast with WCAG relative-luminance math.
Every finding cites a line I read; contrast figures are computed, not eyeballed.

Two delegated passes (homepage visual, navigation architecture) contributed
findings; **every load-bearing claim from both was independently re-verified
against the source or the live site before it was included here.** Geometry
figures computed from the cascade rather than from a rendered page are labelled
*(computed)* — there is no headless browser in this checkout, so those are
arithmetic, not screenshots.

The P4G vocabulary — gold on near-black, corner cuts, hard gold shadows, slashed
seams, uppercase display type — is treated as fixed and correct. Nothing here
asks to soften it. Several findings are about *internal inconsistency inside that
language*, which is the opposite request.

---

## Priority summary

### Fix first (P0)

| # | Finding | Effort |
|---|---|---|
| [N1](#n1--every-internal-navigation-is-gated-behind-a-114s-animation) | Every internal navigation is gated behind a ~1.14s full-screen animation | S |
| [N10](#n10--splitviews-back-button-corrupts-history-forward-dies) | SplitView's Back button corrupts history — Forward dies | S |
| [N11](#n11--under-reduced-motion-closing-the-shelf-quick-view-permanently-dims-the-page) | Under reduced motion, closing the shelf quick-view permanently bricks the wall | XS |
| [V11](#v11--the-traces-modal-is-built-from-unreset-browser-form-controls) | The Traces modal is built from unreset browser form controls | XS |
| [M1](#m1--ogimage-is-an-svg-so-link-previews-have-no-image) | `og:image` is an SVG — link previews have no image | S |
| [N2](#n2--traces-is-reachable-from-exactly-one-link-on-one-page-and-not-by-a-normal-click) | `/traces` is reachable from one link, on one page, and not by a normal click | S |
| [V20](#v20--opening-the-media-lightbox-leaves-no-visible-cursor-at-all) | Opening the media lightbox leaves no visible cursor at all | XS |
| [V1](#v1--display-type-loads-through-a-3-hop-waterfall-and-swaps-in-after-first-paint) | Display type swaps in after first paint on every load | S |

### Then (P1)

| # | Finding | Effort |
|---|---|---|
| [V10](#v10--the-hero-tagline-renders-at-2301) | The hero tagline renders at 2.30:1 | XS |
| [N17](#n17--the-showcase-list-is-dimmed-twice-over-measuring-2001) | The `/showcase` list is dimmed twice over — 2.00:1 | XS |
| [V21](#v21--the-active-nav-item-has-no-perceivable-focus-indicator) | The active nav item has no perceivable focus indicator | XS |
| [N18](#n18--the-active-list-rows-focus-ring-is-clipped-away) | The active list row's focus ring is clipped away | XS |
| [N9](#n9--there-is-no-404-page) | There is no 404 page — dead URLs are a hard dead end | XS |
| [M2](#m2--the-homepage-title-is-in-spite-of-it-all) | Homepage `<title>` is `*in spite of it all*` — no site name | XS |
| [N3](#n3--the-custom-cursors-active-state-misses-the-four-biggest-tiles) | Custom cursor's active state misses 4 of 6 homepage tiles + the nav | XS |
| [V2](#v2--the-latest-tile-can-show-a-mid-word-truncated-excerpt-with-a-raw-url) | Latest tile shows a mid-word truncated excerpt with a raw URL | XS |
| [V3](#v3--the-only-form-field-on-the-site-is-nearly-invisible-at-rest) | The site's only form field is nearly invisible at rest | XS |
| [N12](#n12--nested-main-landmarks-on-showcase-and-novel) | Nested `<main>` landmarks on `/showcase` and `/novel` | XS |
| [N13](#n13--the-shelf-dialog-claims-aria-modal-but-does-not-trap-focus) | The shelf dialog claims `aria-modal` but doesn't trap focus | S |
| [N14](#n14--modified-clicks-are-swallowed-on-both-client-side-nav-surfaces) | ⌘-click is swallowed on the shelf wall and the showcase list | XS |
| [N15](#n15--showcase-detail-loses-your-scroll-and-on-mobile-has-no-way-back) | `/showcase` detail loses your scroll; on mobile there's no way back | S |
| [V13](#v13--at-480px-the-youtube-tile-stays-above-all-owned-content) | At ≤480px the YouTube tile stays above all owned content | S |
| [N4](#n4--four-names-for-two-sections) | Four names for two sections; writing has no nav entry | M |
| [M4](#m4--heading-outline-skips-h2-on-the-homepage-and-is-absent-on-three-pages) | Heading outline skips h2; /shelf, /showcase, /traces have only an h1 | S |

### Worth doing (P2)

| # | Finding | Effort |
|---|---|---|
| [N7](#n7--31-routes-ship-http-200-meta-refresh-instead-of-301-and-are-advertised-in-the-sitemap) | 31 routes ship 200 meta-refresh instead of 301, and are in the sitemap | S |
| [V4](#v4--neighbour-dimming-fires-from-a-non-interactive-element) | Neighbour dimming fires from a non-interactive tile | XS |
| [V5](#v5--tile-subtitles-are-below-aa-at-rest) | Tile subtitles are 3.1–3.3:1 at rest (need 4.5:1) | XS |
| [V6](#v6--traces-bullet-metadata-is-under-aa) | Traces bullet metadata is 3.5–3.7:1 at 11px | XS |
| [V7](#v7--journal-tile-dates-are-a-hair-under-aa) | Journal dates are 4.48:1 at 11px | XS |
| [V14](#v14--the-about-tile-prints-markdown-asterisks-from-your-source) | The About tile prints markdown asterisks from your source | XS |
| [V12](#v12--four-inline-stagger-delay-declarations-never-apply) | Four inline `--stagger-delay` declarations never apply | XS |
| [V16](#v16--eleven-gold-kicker-chips-three-insets-two-sizes) | Eleven gold kicker chips, three insets, two sizes | S |
| [V15](#v15--the-youtube-tile-throws-away-about-half-of-its-image) | The YouTube tile throws away about half its image | XS |
| [V19](#v19--the-live-pulse-kills-the-about-tiles-hover-shadow) | The live pulse kills the About tile's hover shadow step | XS |
| [V18](#v18--the-latest-tiles-emblem-field-is-88-empty-and-the-page-has-four-timestamp-treatments) | Latest emblem field is 88% empty; four timestamp treatments | S |
| [V8](#v8--smooth-scrolling-is-global-and-unguarded-by-reduced-motion) | Smooth scroll is global and ignores reduced motion | XS |
| [V22](#v22--the-now-date-chip-names-a-keyframe-that-does-not-exist) | The `/now` date chip names a keyframe that doesn't exist | XS |
| [V23](#v23--the-tracking-wide-token-is-declared-twice) | `--tracking-wide` is declared twice; the documented value never applies | XS |
| [V24](#v24--the-reduced-motion-lift-reduction-is-dead-on-the-two-tiles-it-targets) | The reduced-motion lift reduction is dead on the two tiles it targets | XS |
| [N19](#n19--the-1200px-auto-open-breakpoint-is-off-by-one) | The 1200px auto-open breakpoint is off by one | XS |
| [V25](#v25--dead-code-inventory) | Dead code: 7 keyframes, ~16 utility classes, 5 unreachable tile variants | M |
| [V17](#v17--the-now-tiles-title-length-sets-the-height-of-the-whole-hero) | The Now tile's title length sets the height of the whole hero | S |
| [N16](#n16--the-showcase-filter-ui-is-dead-code-but-its-url-parameter-still-filters) | The showcase filter UI is dead code, but `?types=` still filters | S |
| [N5](#n5--nowarchive-is-reachable-only-from-now) | `/now/archive` reachable only from `/now` | XS |
| [N6](#n6--two-prose-links-still-point-at-the-legacy-media-path) | Two prose links still point at legacy `/media/` | XS |
| [M3](#m3--no-robotstxt) | No `robots.txt` | XS |

---

## Navigation

### N1 — Every internal navigation is gated behind a ~1.14s animation

`src/scripts/transition.ts:346-378` replaces Astro's loader on
`astro:before-preparation` and **awaits the animation before allowing the DOM
swap**:

```js
const original = e.loader;
e.loader = async () => {
  await cardPhase(stat);          // resolves after T_IN + T_HOLD
  ...
  startWipe(stat, resolveSwap).catch(() => resolveSwap());
  await Promise.all([swapGate, original()]);
};
```

The constants at `src/scripts/transition.ts:224-226` are `T_IN = 520`,
`T_HOLD = 340`, `T_WIPE = 620`. `cardPhase` resolves at 860ms; the wipe releases
the swap when `leadX > W * 0.48`, which works out to p ≈ 0.451 of the wipe
(≈280ms) at both 1440×900 and 390×844. So:

- **≈1.14s** after the click before the new page's DOM is swapped in.
- **≈1.48s** before the overlay clears.

The site is static; the actual fetch is tens of milliseconds. The animation is
therefore almost all of the perceived latency, and it fires on **every** internal
navigation — including browser Back and Forward, where a sub-second response is
the thing users most rely on. (On `/showcase` it compounds N10: each Back is both
a full document traverse *and* a 1.1s animation.)

The reduced-motion escape is correct (`prefersReducedMotion()` at
`transition.ts:339`, checked at `:361`), so this is not an accessibility bug —
it's a pacing bug.

Fix options, cheapest first:
1. ~~Don't gate the swap: call `original()` immediately and let the wipe run
   alongside it.~~ **Tried, reverted — see the note below.**
2. Cut the constants — the card phase is 58% of the total and reads as a pause.
3. Gate it to once per session, exactly as the Traces burst already does with
   `sessionStorage`, so hopping back and forth across sections doesn't replay it.

**Note on option 1 (this was wrong, and shipping it proved it).** Removing the
swap gate does not just shorten the transition, it destroys it: with the swap
immediate, the card plays over the page that has *already* been swapped in, and
the wipe then sweeps over content that is already visible. The wipe stops
covering anything — so the effect is both shorter *and* pointless, and cutting
the durations to match (200/90/300ms) reduced the card to a 290ms flicker, i.e.
it removed the thing the effect exists to show. Reverted.

What the original code got wrong was not the gate, it was *when the fetch
started*: it awaited `cardPhase()` first and only then called `original()`, so
the request's latency was added on top of the animation instead of hidden behind
it. Starting the fetch first and keeping the gate gets both: the card covers the
fetch, and the wipe covers the swap. The fix for this finding is therefore
"parallelise the fetch and skip the effect on history traversals", not "remove
the animation from the critical path".

### N10 — SplitView's Back button corrupts history: Forward dies

`eventBindings.ts:121-130` — the `popstate` handler restores the detail panel by
**clicking the list item**:

```ts
if ((e as PopStateEvent).state?.slug) {
  const item = sv.querySelector(`[data-slug="${(e as PopStateEvent).state.slug}"]`);
  item?.click();
}
```

The item's click handler (`eventBindings.ts:110-114`) calls
`loadContent(slug, elements, state, idleManager)` with **no options**, so
`pushHistory` takes its default of `true` (`contentLoader.ts:46`), and
`contentLoader.ts:82-84` then runs `history.pushState({ slug }, '', path)`.
`pushState` truncates everything forward of the current index.

Repro (desktop, `/showcase` auto-opens the newest entry):

1. Click A → `/showcase/a/`. Click B → `/showcase/b/`. History:
   `[/showcase, /showcase/a/, /showcase/b/]` @2.
2. Press **Back** → A renders correctly, but A's load immediately pushes:
   the stack becomes `[/showcase, /showcase/a/, /showcase/a/]` @2, and
   `/showcase/b/` is **destroyed**.
3. **Forward is now dead.** The visitor cannot return to B.
4. Press **Back again** → the browser moves to index 1, which holds the *same*
   `/showcase/a/` URL, so nothing changes and the same entry re-renders. A third
   Back is needed to reach the list.

Two related defects in the same path:

- **The re-entrancy guard is misplaced.** `contentLoader.ts:53-55` returns early
  on `state.isAnimating`, but `state.isAnimating = true` only happens at
  `contentLoader.ts:102` — *after* `contentArea.innerHTML = ...` at `:81`. So
  rapid clicks during the fetch are not blocked; two fetches race and the slower
  response can win, leaving entry X's body under entry Y's URL.
- **The pushed state has no `index` key**, so Astro's `ClientRouter` treats each
  of these Backs as its own traverse
  (`node_modules/astro/dist/transitions/router.js:393` `if (ev.state === null) return;`)
  and re-fetches the whole document. The shelf page gets this right by pushing
  `null` (`shelf/index.astro:790`), which the router ignores.

Separate instance, same area: on a standalone detail route, open `/showcase/a`
directly, click B, press Back — `eventBindings.ts:131-138` clears the DOM but
never resets `state.currentSlug` (still `'b'`), so pressing Forward hits
`contentLoader.ts:50`'s `if (slug === state.currentSlug) return;` and shows a
permanent empty "Choose an entry" placeholder at URL `/showcase/b/`. Focus also
falls to `<body>` because the focused heading was inside the emptied node.

Fix: give the popstate restore a `loadContent(..., { pushHistory: false })` path
(or a dedicated `restore()` that doesn't go through a synthetic click), move the
`isAnimating` guard before the fetch, reset `currentSlug` when clearing, and push
`null` state like the shelf does.

### N11 — Under reduced motion, closing the shelf quick-view permanently dims the page

`shelf/index.astro:769` hides **both** the panel and the backdrop from a
`transitionend` event on the panel:

```ts
panel.addEventListener('transitionend', () => {
  panel.hidden = true;
  backdrop.hidden = true;
}, { once: true });
```

`shelf/index.astro:579`, inside the reduced-motion block:

```css
.shelf-panel { transition: none; }
```

With no transition there is no `transitionend`, so `backdrop.hidden = true` never
runs. The backdrop is `position: fixed; inset: 0; z-index: 90` with
`rgba(0, 0, 0, 0.5)` (`shelf/index.astro:392-398`).

Repro: enable Reduce Motion → open `/shelf` → click any card → press ESC.
The panel translates off-screen and body scrolling is restored, but the page
**stays dimmed forever and every click on the wall is swallowed** by the
invisible backdrop. Clicking the backdrop just re-runs `closePanel()` and
registers another listener that will never fire. The only surviving pointer route
is the NavPill, which happens to sit above the backdrop (`z-index: 100` vs `90`).
The panel is also left `hidden=false` and merely translated away, so its ✕ and
"Open full entry" remain in the tab order as invisible off-screen targets.

Secondary, on any motion setting: close then re-open within the 300ms slide-out.
Adding `is-open` back reverses the transition, the still-registered
`{ once: true }` listener fires when the revert completes, and it hides the panel
*while it is open* — leaving `body.style.overflow = 'hidden'` with an invisible
dialog.

Fix: don't use `transitionend` as a state machine. Hide on a `setTimeout` matched
to the transition duration, or read `prefers-reduced-motion` in JS and hide
synchronously in that branch.

### N12 — Nested `<main>` landmarks on `/showcase` and `/novel`

`BaseLayout.astro:59` already wraps every page's slot in `<main id="main-content">`:

- `SplitViewLayout.astro:85` — `<main class="split-view__detail">`
- `novel/[...slug].astro:160` — `<main class="novel-page novel-desk">`
- `novel/[...slug].astro:231` — `<main class="novel-page novel-reading">`

Three pages therefore ship two `<main>` landmarks, which is invalid HTML and makes
landmark navigation ambiguous on the two largest surfaces. This contradicts an
explicit decision elsewhere in the same codebase — `about.astro:117-118`: "A
`<div>`, not `<main>`: BaseLayout already wraps the slot in `<main>`, and a nested
one is invalid and duplicates the landmark."

Same area: `#main-content` is a plain `<main>` with no `tabindex`, so the skip
link does not reliably move focus into the content (Safari in particular leaves
focus where it was).

### N13 — The shelf dialog claims `aria-modal` but does not trap focus

`shelf/index.astro:125-131`:

```astro
<aside id="shelf-panel" class="shelf-panel" hidden role="dialog"
       aria-modal="true" aria-label="Entry detail" tabindex="-1">
```

`openPanel` correctly moves focus in (`:742`) and `closePanel` restores it
(`:779`), and Escape is handled (`:800`). But nothing is made inert: there is no
`inert`, no `aria-hidden` on siblings, and no Tab containment (the only
`aria-hidden` attributes in the file are on decorative spans at `:72,114,116` and
on the backdrop at `:124`). So Tab from the panel's last control walks onto the
NavPill and then the wall cards *behind* the dimmed backdrop. An
`aria-modal="true"` dialog that leaks Tab is worse than a plain panel, because AT
is told the rest of the page is unavailable while the keyboard can still reach it.

### N14 — Modified clicks are swallowed on both client-side nav surfaces

`shelf/index.astro:785` intercepts card clicks with no modifier guard:

```ts
card.addEventListener('click', e => {
  const slug = card.dataset.slug;
  if (!slug) return;
  e.preventDefault();
  ...
```

and `eventBindings.ts:111` calls `e.preventDefault()` unconditionally on SplitView
list items. So ⌘/Ctrl-click a shelf card or a showcase entry and, instead of a new
tab, the current tab opens the panel. This is inconsistent *within the same file*:
the shelf filter bar does guard (`shelf/index.astro:669`):

```ts
if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
```

Both surfaces are the only way to reach their entries, so the standard
"open in a new tab" gesture is unavailable exactly where you'd want it.

### N15 — `/showcase` detail loses your scroll, and on mobile has no way back

The detail scroller is `.split-view__detail` (`SplitViewLayout.astro:400`
`overflow-y: auto`), but `contentLoader.ts:81` only replaces its child's
contents — nothing resets `scrollTop`. Combined with
`contentLoader.ts:94` `heading.focus({ preventScroll: true })` (which explicitly
*prevents* the browser from correcting it), reading a long entry then clicking
another leaves you mid-article with the new title above the fold.

On mobile it is worse, because the list leaves the layout entirely —
`SplitViewLayout.astro:698` `.split-view.has-selection .split-view__list { display: none; }`.
Tap an entry while scrolled partway down the list, and you land at that offset
inside the newly revealed detail, mid-entry. There is **no "back to list"
control** in the layout: `SplitViewLayout.astro:31` is a bare `<NavPill />`.

The other two detail families do get one — `shelf/[...slug].astro:78`
`<NavPill backLink="/shelf" backLabel="Shelf" />` and
`novel/[...slug].astro:154-155`. Showcase is the odd one out, and it's the one
where the list is hidden on mobile.

Also on `/showcase`: the desktop auto-open loads the newest entry with
`{ pushHistory: false }` (`splitView/index.ts:132`), so clicking that
already-displayed entry does nothing at all — no URL change, no visual change,
via the early return at `contentLoader.ts:50`.

### N2 — `/traces` is reachable from exactly one link, on one page, and not by a normal click

Two independent problems compound here.

**1. It is not in the nav.** `NavPill.astro:12-19` defines six sections and Traces
is not one of them. Verified inbound `href="/traces"` across the whole source
tree: **one**, at `index.astro:261` (the homepage bar). Live page counts:

| page | links to /traces |
|---|---|
| `/` | 1 (the bar) |
| `/about`, `/shelf`, `/showcase`, `/novel`, `/now`, `/traces` | 0 |

**2. Even that one link doesn't go there for JS users.** `index.astro:2792-2800`
cancels the default action and opens a modal instead:

```ts
tab.addEventListener('click', (e) => {
  const evt = e as MouseEvent;
  if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey || evt.button !== 0) return;
  e.preventDefault();
  ...
  openTracesModal(...);
});
```

So the server-rendered `/traces` page is reachable only by ⌘/Ctrl-clicking the
bar, or by typing the URL. The modal has no "open the full page" link, and no
footer or nav links to it either.

**3. It has no active nav state.** `NavPill.astro:20-23` matches nothing on
`/traces`, so the one page whose entire purpose is an invitation to sign shows six
unhighlighted nav items and no `aria-current="page"`.

A guestbook with a bespoke danmaku UI is effectively an orphan. `/about`'s Connect
section is the natural second home for it — it already carries the "Send mail to
be read on stream" line.

### N9 — There is no 404 page

Neither `src/pages/404.astro` nor `public/404.html` exists. Verified live:

```
GET https://www.ninjaruss.net/this-page-does-not-exist  ->  404
body: "The page could not be found / NOT_FOUND / sfo1::twvm2-..."
```

So every dead URL — a typo, a removed slug, an old inbound link — lands on
Vercel's bare text page with **zero site navigation**: no nav bar, no link home,
no styling. For a site whose whole design language is a menu screen, that's the
one screen with no menu. A minimal `404.astro` using `BaseLayout` (which supplies
the skip link and lets `NavPill` render) fixes it.

### N3 — The custom cursor's active state misses the four biggest tiles

`src/scripts/cursor.ts:1-2`:

```js
const TILE_SELECTOR =
  '.bento-tile--interactive, .logo-tile, .image-tile, .title-tile, .traces-bar, .traces-bullet, .traces-modal__close';
```

Every homepage tile passes `variant="dark"` or `variant="highlight"`; only Novel
and Stream pass `interactive`. Verified in `dist/client/index.html`:

| tile | shipped classes | cursor reacts? |
|---|---|---|
| Now | `--highlight` | **no** |
| Journal (Writing/Showcases) | `--highlight --core` | **no** |
| Media Log / Shelf | `--dark --core` | **no** |
| Latest | `--dark` | **no** |
| Novel | `--dark --interactive` | yes |
| About / Stream | `--dark --interactive` | yes |
| MAL, Spotify, Email | `.logo-tile` | yes |
| YouTube | `.image-tile` | yes |
| Title tile | `.title-tile` | yes — but it isn't a link |

Also absent from the selector: `.nav-bar__item` (the global nav, on every
non-home page), `.shelf-card` (the entire `/shelf` wall), `.list-item`
(SplitView), `.scene-row` and `.binder-row` (`/novel`).

The net effect is a cursor that enlarges and glows over the *least* prominent
tiles and does nothing over the nav or the shelf wall — and it reacts over the
title tile, which is decorative. This is the same defect class CLAUDE.md records
for `initializeTilt()` leading with `.bento-tile--interactive`; `initializeTilt`
was fixed, `cursor.ts` was not.

Fix: drive it off something that can't go stale — `e.target.closest('a[href], button')` —
instead of a hand-maintained class list.

### N4 — Four names for two sections

`NavPill.astro:12-19` against what each destination calls itself:

| nav label | href | page `<title>` | page h1 | kicker |
|---|---|---|---|---|
| Home | `/` | `*in spite of it all*` | `Ninjaruss` | — |
| Showcase | `/showcase` | `Showcase — ninjaruss` | `Showcase` | `showcases` |
| **VN** | `/novel` | `Remember Rain — ninjaruss` | `Remember Rain` | `visual novel` |
| Shelf | `/shelf` | `Shelf — ninjaruss` | `Shelf` | `catalog` |
| About | `/about` | `About — ninjaruss` | `NINJARUSS` | `profile` |
| Now | `/now` | `Now — ninjaruss` | `Now` | `snapshot` |

Three names for one section: nav says **VN**, the homepage tile says **Visual
Novel**, the page says **Remember Rain** — the string "VN" never appears on the
page it points to. Shelf has three: the tile reads "Shelf / Media Log"
(`index.astro:399-400`), the kicker reads `catalog`, the h1 reads `Shelf`, and the
default meta description still says "media logs" (`BaseLayout.astro:17`).

Kicker case is also inconsistent — `Traces` is capitalised; `profile`, `catalog`,
`showcases`, `visual novel`, `snapshot` are lowercase.

The bigger gap: **writing has no nav entry at all.** The journal tile's header
reads label `Writing` + title `Notes` (`index.astro:283-284`) for the same thing,
and the rows are Substack posts. Verified outbound links to
`ninjaruss.substack.com`: present on `/` and `/about`, **zero** on `/shelf`,
`/showcase`, `/novel`. Since Substack is where the site's prose lives, a visitor
browsing showcases or the novel has no route to it.

### N5 — `/now/archive` is reachable only from `/now`

One inbound link sitewide. Acceptable for a secondary archive, but it means the
Now section's own history is a one-way branch.

### N6 — Two prose links still point at the legacy `/media/` path

A crawl of every internal `href` across the 142 built HTML pages found exactly two
links with no static target, both authored prose:

- `src/content/shelf/persona-4-golden.md:15` → `[most relatable character to my core being](/media/marie)`
- `src/content/showcase/marie-video-essay.md:9` → `[Why is that?](/media/marie)`

These work only because `/media/[...slug]` 301s to `/shelf/[...slug]` — and the
chain is now three steps, since `/shelf/marie` itself bounces through the JS
redirect described in N7. A reader clicking that cross-reference is removed from
the essay they were reading and dropped onto the wall with a dialog open.

### N7 — 31 routes ship HTTP 200 meta-refresh instead of 301, and are advertised in the sitemap

Three prerendered routes call `Astro.redirect(..., 301)`, which in a static build
degrades to a meta-refresh document:

- `src/pages/favorites.astro:4` → `/shelf`
- `src/pages/favorites/[...slug].astro:12` → `/shelf/${slug}` (10 URLs)
- `src/pages/novel/[...slug].astro:56` → `/novel#${topSlug}` (~20 folder URLs)

Verified live and in the build:

```
GET /favorites       -> 200, <title>Redirecting to: /shelf</title>, meta refresh
GET /favorites/marie -> 200, <title>Redirecting to: /shelf/marie</title>
```

All 31 are listed in `sitemap-0.xml`, and each serves a bare, unstyled
"Redirecting from … to …" body with no nav and no `--nav-clearance`.

This is precisely the failure CLAUDE.md documents and fixes for `/notes/*` by
making that route server-rendered — "a meta-refresh HTML document, which feed
readers ignore and search engines discount". `/media`, `/status`, `/stream` and
`/journal` are *real* 301s because they come from `astro.config.mjs` `redirects`;
`/favorites` and the novel folder stubs are the odd ones out.

Fix: `export const prerender = false` on those routes, as `/notes/[...slug].astro`
already does.

**Related, in the shelf family:** `shelf/[...slug].astro:33` is a
`window.location.replace('/shelf?open=' + slug)` bounce, so `/shelf/<slug>` is
never actually shown to a JS visitor, while all 29 URLs sit in the sitemap as real
pages. Consequences: the panel's own "Open full entry →" CTA
(`shelf/index.astro:720`) navigates to a URL that bounces back to the panel the
visitor is already looking at; `location.replace` + the `replaceState` at
`shelf/index.astro:810` collapse the visit into a single history entry, so a
visitor arriving from a shared link has **no wall entry behind them** — Back
leaves the site rather than returning to `/shelf`. The bounce is documented as
deliberate; the CTA loop, the missing history entry, and the sitemap listing are
not.

---

## Visual

### V1 — Display type loads through a 3-hop waterfall and swaps in after first paint

`src/styles/typography.css:4`:

```css
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
```

That `@import` survives bundling — it is the first statement of
`dist/client/_astro/_slug_.BO0luyjJ.css`. The browser must therefore: fetch the
render-blocking stylesheet → parse it → *then* discover the Google Fonts CSS
(11.6KB) → *then* fetch the woff2 files. There is **no `rel="preconnect"`,
`dns-prefetch`, or `rel="preload"` anywhere** in `src/` or `public/` (verified by
grep). Google's stylesheet is a second render-blocking request in that chain.

`display=swap` means text paints immediately in the generic fallback
(`--font-display: 'Archivo Black', sans-serif`) and swaps when the font lands.
On this site that is not a cosmetic detail: the hero wordmark, every tile title
and the entire nav are Archivo Black, so **the page's identity reflows on every
visit.**

Also: 8 weights are requested. `Syne` weight 800 is never used — the weight
census across `src/` is `700×15, 500×4, 900×3, 400×3, 600×2`, and the three `900`
sites (`shelf/index.astro:172,477`, `shelf/[...slug].astro:122`) are all on
`--font-display` (Archivo Black, single-weight), so Syne 800 is dead payload.

Fix:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...">
```
…drop `800` from the Syne axis, and add `size-adjust`/`ascent-override` metrics on
the fallback so the swap doesn't move the wordmark. (Self-hosting the three faces
would remove the third-party round trip entirely.)

### V20 — Opening the media lightbox leaves no visible cursor at all

This is a live, reproducible bug on both `/showcase` routes, and it is the exact
failure the code's own comment says it was written to prevent.

- `global.css:198` — `#cursor { position: fixed; … z-index: 9999; }`
- `MediaLightbox.astro:22` — `.media-lightbox { position: fixed; inset: 0; z-index: 9999; }`
- `MediaLightbox.astro:41` — the backdrop is `inset: 0` with `rgba(0, 0, 0, 0.95)`
- `global.css:169-172` — `html.has-custom-cursor, html.has-custom-cursor * { cursor: none !important; }`

Both elements are `position: fixed` at `z-index: 9999`, and neither has a
stacking-context-creating ancestor, so they compete in the root context and
**tree order decides**. `#cursor` is the first child of `<body>`
(`BaseLayout.astro:56`); the lightbox renders later inside `<main>`
(`SplitViewLayout.astro:119`). So the lightbox — and its 95%-opaque backdrop —
paints **over** the dot, while `cursor: none !important` removes the native
pointer. Result: **no pointer of any kind is visible**, and
`.media-lightbox__backdrop { cursor: pointer }` (`:42`) is dead for the same
reason.

The escape hatch exists but keys on the wrong thing. `global.css:180-187` restores
the native cursor with `:has(dialog[open])` — and the lightbox is a **`<div
role="dialog">`** (`MediaLightbox.astro:6`), not a `<dialog>`, so the selector
never matches. The comment above it (`global.css:174-179`) describes precisely
this symptom: "the fixed-position cursor dot, which just vanished underneath it."

Fix: add `.media-lightbox.is-active` to that `:has()` guard, or convert the
lightbox to a real `<dialog>` (which would also give it top-layer promotion and
fix the z-index tie by construction).

### V11 — The Traces modal is built from unreset browser form controls

This is the highest-visibility defect on the homepage, because the Traces modal is
what the primary CTA opens.

**No `color-scheme` is declared anywhere** (grep across `src/` and `public/`: no
matches), and **there is no `button`/`input` reset anywhere** (grep for
`appearance:`, `font: inherit`, or a bare `button {` rule: no matches). So the UA
light-mode palette paints every unstyled control, and form controls do not inherit
`font`:

- `index.astro:2117-2127` — `.traces-modal__close` sets only `min-width`,
  `min-height`, `color` and `font-size`. With no `background` and no `border`, the
  browser paints `buttonface` (≈`#efefef`) with a 2px outset bevel. The glyph is
  `--color-text-muted` `#a0a0a0` on that plate → **2.27:1**: a light-grey ✕ on a
  light-grey rounded button, inside a modal whose body is `#111111`
  (`index.astro:2087`).
- `index.astro:2185-2193` — the name/message inputs set `color`, `background`,
  `border` and `font-size` but **no `font-family`** → they render in the UA default
  (Arial), directly under labels set in Archivo Black 12px uppercase and beside
  `--font-mono` timestamps. A third typeface inside one dialog.
- `index.astro:2203-2213` (and the same rule at `traces.astro:129-139`) — the
  "Sign" submit sets `background`, `color`, `font-family`, but **no `font-size` and
  no `border`** → it renders at the UA default 13.33px (not on the type scale at
  all) inside a 2px grey outset bevel, wrapped around the gold fill. The same word
  "Sign" in the bar above is 11px (`index.astro:2042`).

Fix: one global reset — `button, input, textarea, select { font: inherit; }`, plus
`background: none; border: none;` on `.traces-modal__close` and
`.traces-form__submit`, and `color-scheme: dark` on `:root` as a backstop.

### V10 — The hero tagline renders at 2.30:1

`index.astro:803-813`:

```css
.title-tile__description {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  opacity: 0.45;
}
```

Ground is `--color-black` (`index.astro:726`). `#a0a0a0` at `.45` over `#000`
composites to `#484848` → **2.30:1**. It only clears on hover (`:816-821`,
`opacity: 1` → 8.03:1), i.e. the line is legible only while the pointer is over a
tile that does nothing. At 12px, uppercase, with 0.12em tracking, it is below the
4.5:1 floor and below even 3:1.

This isn't a taste call by the repo's own standard: CLAUDE.md records removing the
arc's stat colour from this page *because* `#a855f7` measured 4.40:1 at 11px —
under AA. A 2.30:1 line inside the `<h1>`'s own tile is worse than the thing that
was already rejected.

Fix: `opacity: 0.45` → `0.75` (≈5.6:1), keeping the hover sharpening.

### V2 — The Latest tile can show a mid-word truncated excerpt with a raw URL

`src/pages/index.astro:135,142,151` build the rotating tile's copy with a hard
140-character slice. Decoded from the shipped `data-entries` attribute in
`dist/client/index.html`:

```
title: Utasync - Learn Japanese through Music
excerpt (140 chars): "No more stalling... the web app is now live for Utasync!
(https://utasync.ninjaruss.net) This was my first foray towards utilizing LLMs (Lar"
```

Three problems in one string: it is cut **mid-word** (`Lar`), there is **no
ellipsis**, and a **raw URL** is inline. The tile rotates every 11s, so this is
the excerpt a visitor sees roughly a third of the time.

The branch is also inconsistent with its sibling: the showcase branch wraps the
body in `stripMarkdown(...)` (`index.astro:142`) while both Substack branches use
`substackPosts[n].description.slice(0, 140)` with no stripping (`:135,151`).

Fix: slice on a word boundary (`lastIndexOf(' ')`) and append `…`; run the
Substack descriptions through the same `stripMarkdown` the showcase branch already
imports.

### V3 — The only form field on the site is nearly invisible at rest

`src/pages/traces.astro:110`:

```css
border: var(--border-thin) solid var(--color-border);   /* #3a3a3a */
background: var(--color-bg-elevated);                    /* #181818 */
```

Measured: border `#3a3a3a` on field fill `#181818` = **1.56:1**; field fill
`#181818` against the page ground `#0a0a0a` = **1.11:1**. WCAG 1.4.11 asks for
3:1 on the boundary of a UI component, so at rest the field is essentially
undelimited — you see a bare row until you focus it (the gold `focus-visible`
outline at `:116` is correct).

Fix: `--color-border-strong` only reaches 2.20:1 against the field's own fill —
still short — so this wants a gold-dim hairline (`--color-gold-dim` `#d4b82a`
measures 9.04:1 against `#181818`) at the `--border-hairline` width.

### N17 — The `/showcase` list is dimmed twice over, measuring 2.00:1

Two independent container opacities **multiply**, and both are live:

- `SplitViewLayout.astro:997-998` — `.split-view__list.is-scrolled { opacity: 0.7 }`
  (toggled by `eventBindings.ts:157` as you scroll the list)
- `SplitViewLayout.astro:1003-1004` — `.list-item:not(.is-active) { opacity: 0.6 }`
  (`has-selection` is server-rendered on detail routes via
  `SplitViewLayout.astro:22,33`, and JS-added on auto-open)

0.7 × 0.6 = **0.42 effective**, over the list's `#181818` ground
(`SplitViewLayout.astro:137`):

| element | dimmed only (0.6) | dimmed + scrolled (0.42) | needs |
|---|---|---|---|
| `.list-item__meta-text` (dates, 11px, `--color-text-subtle`) | `#5f5f5f` → **2.80:1** | `#4a4a4a` → **2.00:1** | 4.5:1 |
| `.list-item__subtitle` (12px, `--color-text-muted`) | `#6a6a6a` → **3.26:1** | `#515151` → **2.24:1** | 4.5:1 |
| `.list-item__title` (14px) | `#9d9d9d` → 6.52:1 | `#757575` → **3.84:1** | 4.5:1 |

`--color-text-subtle` is fine on its own (5.49:1 on `#181818`); the failures come
entirely from the two opacity wrappers stacked on top of a token chosen to just
clear AA. Two dimming mechanisms were designed independently and never composed.

Fix: keep one dimming mechanism, or relax the non-active dim to `0.8`.

### V21 — The active nav item has no perceivable focus indicator

`NavPill.astro:126-129`:

```css
.nav-bar__item:focus-visible { outline: 2px solid var(--color-gold); outline-offset: -2px; }
```

`NavPill.astro:132-135`:

```css
.nav-bar__item--active { background: var(--color-gold); color: var(--color-black); }
```

`outline-offset: -2px` draws the ring **inside** the border box, so it lands on the
element's own gold fill: **`#ffe52c` on `#ffe52c` = 1.00:1.** Nothing else changes
either — the active item's text is already black at rest, and
`NavPill.astro:137-139` sets `.nav-bar__item--active::before { display: none }`,
which removes the gold sweep that gives every *other* nav item its focus feedback.

So the one nav item a keyboard user is most likely to land on (the current page)
has no visible focus state at all. WCAG 1.4.11 / 2.4.11 want ≥3:1. Fix: use a
non-gold ring on gold grounds (`--color-black` reads 16.5:1 there), keeping
`outline-offset: -2px`.

Same pattern exists at `SplitViewLayout.astro:289-299` for
`.split-view__type-pill.is-selected` — latent rather than live, because
`showSearch={false}` on both `/showcase` routes means that pill never renders
(see N16).

### N18 — The active list row's focus ring is clipped away

`ListItem.astro:60` gives `.list-item` a `clip-path`, and `global.css:244-248`
puts the focus ring outside the border box:

```css
:focus-visible { outline: var(--border-medium) solid var(--color-gold); outline-offset: 2px; }
```

`clip-path` clips everything the element paints, including its own outline, and
the polygon spans exactly the border box — so with `outline-offset: 2px` the ring
is **never painted**. The repo already knows this trap and documents it twice
(`index.astro:681` for `.logo-tile`; `about.css:58`), and there it is compensated
by a `.p4g-sweep`.

Here it is compensated for ordinary rows (the sweep at `ListItem.astro:83-86`) but
**not for the active row**: `ListItem.astro:117-119` sets
`.list-item.is-active::before { content: none }`, killing the sweep, and the text
is already `--color-black` (`:121-124`). So focus on the active row changes nothing
visible except a small `→` glyph — which is itself gold on the gold active
background (`ListItem.astro:238` on `:114`), i.e. also 1.00:1 at rest.

Fix: give the active row a distinguishable focus treatment that doesn't rely on
`outline` (a black inset ring, or a border-color change).

### V22 — The `/now` date chip names a keyframe that does not exist

`src/pages/now.astro:154`:

```css
animation: p3r-animate 400ms var(--animation-easing) 300ms backwards;
```

`grep -rn "@keyframes p3r-animate" src/` returns **zero matches**. The name exists
only as a *class* (`transitions.css:141` `.p3r-animate { animation: p3r-entrance … }`).
An `animation` shorthand naming an unresolvable keyframe is invalid, so the
declaration is discarded and **the `/now` gold date chip never animates in** —
unlike both of its siblings, which correctly use `p3r-animate-left`
(`now.astro:137,162`).

Secondary proof that it slipped through: `now.astro:333-338` lists
`.now__updated` in the reduced-motion `animation: none` block, so that selector was
always dead code. Fix: `p3r-entrance`.

### V23 — The tracking-wide token is declared twice

- `global.css:100` — `--tracking-wide: 0.12em;`
- `typography.css:39` — `--tracking-wide: 0.05em;`

`BaseLayout.astro:3-4` imports `global.css` then `typography.css`, same `:root`,
same specificity — so **`0.05em` wins and `global.css:100` is dead.** CLAUDE.md
documents the intended value as `0.12em` ("CTAs, status badges, the hero
tagline"), and `global.css:95-98` says the two tokens "replaced eight ad-hoc
values". All five consumers (`index.astro:811, 1272, 1311, 1334, 2112`) silently
render at 0.05em — which is now **numerically identical to `--tracking-label`**
(`global.css:99`), collapsing the deliberate two-step scale into one step.

Fix: delete `typography.css:39`.

### V24 — The reduced-motion lift reduction is dead on the two tiles it targets

`bento.css:106-110`, inside the reduced-motion block:

```css
.bento-tile--interactive:hover,
.bento-tile--interactive:focus-visible { transform: translate(-2px, -2px); }
```

`bento.css:194-201`:

```css
.bento-tile--dark:hover, .bento-tile--dark:focus-visible, .bento-tile--dark:has(:focus-visible) {
  transform: translate(-4px, -4px);
  …
}
```

Both are specificity (0,2,0), and `:194` is **later in the file**, so the full 4px
lift wins. The only two `--interactive` elements in the repo are
`index.astro:324` and `:357` — and both also carry `bento-tile--dark`. So the
reduced-motion damping never applies to the tiles it was written for.

Fix: move the reduced-motion rule after `:194`, or add `.bento-tile--dark` to it.

### N19 — The 1200px auto-open breakpoint is off by one

- `SplitViewLayout.astro:644` — `@media (max-width: 1200px) { .split-view { grid-template-columns: 380px 1fr; } }` → **2 tracks**
- `src/utils/splitView/index.ts:142` — `window.matchMedia('(min-width: 1200px)')`

At **exactly 1200px both are true**. The JS then runs `tryAutoOpen`, whose guard
requires ≥3 computed grid tracks — impossible against the 2-track layout CSS has
already applied. So at exactly 1200px, `/showcase`'s newest-entry auto-open
**never fires**, despite the comment at `index.ts:135-138` claiming that case is
handled. This is also the only `min-width` in the repo that isn't
documented-breakpoint + 1; everywhere else the pairing is correct (e.g.
`bento.css:433` `max-width: 768px` with `index.astro:1781` `min-width: 769px`).

Fix: make the JS query `(min-width: 1201px)`.

### V25 — Dead code inventory

Verified by grep count across all 20 style sources plus templates (each name
appears exactly once — its own declaration — and zero times in markup or scripts):

**Dead `@keyframes` (7):** `transitions.css:9,20,32,43,123` (`p3r-sweep-out`,
`p3r-sweep-in`, `p3r-slide-in`, `p3r-slide-out`, `p3r-diagonal-reveal`) and
`index.astro:1149,1154` (`radar-ping` — which CLAUDE.md records being cut — plus
`now-pulse`, a second orphan the note doesn't mention; the live dot uses
`dot-breathe` at `index.astro:1140`).

**Dead classes:** `global.css:263` `.sr-only`; `global.css:288-298` `.p4g-label`
and `typography.css:106-116` `.label` (byte-identical to each other, both unused,
both duplicating the live `.p4g-tab`); `typography.css` `.text-sm`/`.text-xs`/
`.text-muted`/`.text-gold`; `transitions.css:133-138` `.stagger-1`…`.stagger-6`
(templates set `--stagger-delay` inline instead); `typography.css:43-85` the
`.h1`–`.h6` class halves; `index.astro:1948` `.traces-bullet__time` (confirming
CLAUDE.md's "bullets carry name + message only").

**Unreachable tile variants:** `BentoTile.astro:23-24` builds the class from a
`size` prop, and the repo's only two `<BentoTile>` call sites (`index.astro:240`,
`:396`) pass no `size` — so `--span-3x2`, `--dominant`, `--medium-wide`,
`--medium-tall` and `--static` can never be emitted. (`--small`, the default, is an
empty rule.)

**One overridden rule pair worth knowing:** `bento.css:87-104` styles
`.bento-tile--interactive:hover` at (0,2,0), and `bento.css:194-201` styles
`.bento-tile--dark:hover` at the same specificity but later — and the only two
`--interactive` elements are both `--dark`. So `:87-104` never takes effect (this
is the same collision as V24). Also `bento.css:69-73` transitions `opacity`, but
`:80-84` replaces the whole list for `--interactive`, dropping it — and those two
tiles are exactly the ones neighbour-dimming sets to `opacity: 0.45`, so they snap
instead of easing.

**Unused custom properties** (`var(--x)` referenced zero times): `global.css:35`
`--color-gold-dark`, `:36` `--color-panel`, `:75` `--opacity-subtle`, `:93`
`--shadow-soft`, `:121` `--stagger-increment`, `typography.css:13` `--text-2xs`
(declared as "the hard floor for any text on screen", then never used), and
`typography.css:38` `--tracking-normal`. The four `--breakpoint-*` tokens
(`global.css:69-72`) are structurally unusable — `var()` cannot appear in a media
query.

### V4 — Neighbour dimming fires from a non-interactive element

`src/styles/bento.css:16-20` dims every other tile whenever any tile is hovered:

```css
.bento-grid:has(:is(.bento-tile, .logo-tile, .title-tile, .image-tile, .traces-bar):hover)
  :is(...):not(:hover) {
  opacity: 0.45;
  filter: brightness(0.75);
}
```

`.title-tile` is in that list, but the title tile is a plain `<div>` with no
`href` (`index.astro:171-179`) — it is decoration. It also spans four of the six
columns in row 1. So merely moving the pointer toward the top of the page past the
wordmark **blanks the rest of the page**, implying an interaction that isn't there.

The dimmed state measures **1.68–1.74:1** for muted text — fine as a deliberate
focus effect, but it means the whole page strobes between readable and unreadable
as the pointer crosses the grid.

Fix: drop `.title-tile` from both the `:has()` and the `:not()` lists, or apply
the dim only to genuinely interactive tiles. `bento.css:27-31`'s
`:focus-visible` twin has the same issue.

### V5 — Tile subtitles are below AA at rest

The subtitles are `opacity: .6` by design (CLAUDE.md notes they were made
always-visible precisely so they could be read at rest). Measured, they don't
reach AA at that opacity:

| text | ground | effective | ratio | verdict (12px needs 4.5) |
|---|---|---|---|---|
| `--color-text-muted` `#a0a0a0` @ .6 | `#111111` | `#676767` | **3.34:1** | fail |
| `--color-text-muted` @ .6 | `#1a1a1a` | `#6a6a6a` | **3.22:1** | fail |
| `--color-text-subtle` `#8f8f8f` @ .6 | `#181818` | `#5f5f5f` | **2.78:1** | fail |
| `--color-text` `#f5f5f5` @ .6 | `#181818` | `#9d9d9d` | 6.55:1 | passes |
| on-gold black @ .7 (highlight/mail) | `#ffe52c` | `#4d450d` | 7.59:1 | passes |

Sites, checked against what actually ships: `.logo-tile__description`
(`index.astro:698`, `opacity: .6`) renders **three times** — MAL, Spotify and
Email (`index.astro:461,478,493`, all confirmed in `dist/client/index.html`).
MAL and Spotify sit on the dark ground and fail; the Email tile is the gold
`--highlight` case (`index.astro:663-664`, `.7`) and passes at 7.59:1.

At rest the muted tokens are 6.1–7.2:1 opaque, so the opacity is what costs the
contrast — not the palette.

**One refinement:** the first pass of this audit also flagged
`.bento-tile__description` (`bento.css:383`) at the same opacity. That rule is
currently **unreachable**: `BentoTile.astro:35` is the only renderer of the class,
and the repo's single description-bearing call site (`index.astro:245`, the Now
tile) is `variant="highlight"`, where the black-on-gold `.7` case applies and
passes. So it is a latent hazard, not a live failure — any future
`--dark`/`--interactive` tile that passes a `description` fails immediately.

Fix: raise the dark-ground subtitles to `.75`–`.8` (≈4.3–4.7:1), or use
`--color-text` at `.6`, which the `--highlight` variant already does and which
lands at 6.5:1.

### V6 — Traces bullet metadata is under AA

`index.astro:1950` (`.traces-bullet__time`, `opacity: .65`) and `:1957`
(`.traces-bullet--echo`, `opacity: .62`), both at `--text-floor` (11px), measure
**3.70:1** and **3.49:1**. These are secondary by intent, but they carry real
information (who said it, when). Fix: same as V5 — nudge the opacity up.

### V7 — Journal tile dates are a hair under AA

`index.astro:1064`: `.journal-tile__date { font-size: var(--text-floor); opacity: 0.55 }`
on black text over the gold field. Black at `.55` over `#ffe52c` = `#736714` →
**4.48:1** at 11px (needs 4.5:1). It misses by 0.02; `opacity: .6` clears it.

### V14 — The About tile prints markdown asterisks from your source

`index.astro:381` renders `{currentArc.decision}` raw, and
`src/utils/currentArc.ts:68` joins the paragraph without stripping anything. The
source, `src/content/sessions/_quests.md`:

> Feeling the momentum of posting multiple videos, I now need to loop `*Is the Order a Rabbit?*` until I can mostly understand at least one episode. いきましょ！！！

So the tile renders `*Is the Order a Rabbit?*` **with literal asterisks** — a stray
character mid-sentence, not an emphasis or a stylistic bullet. The 4-line clamp
(`index.astro:1287-1290`) also cuts the paragraph *(computed ≈92–96 of 153
characters visible)*, so the Japanese tail never renders.

`stripMarkdown` is already imported in this file (`index.astro:9`) but used only
for the showcase excerpt at `:142`. Fix: wrap this one too, and raise the clamp.

### V12 — Four inline stagger-delay declarations never apply

`index.astro:185` (YouTube), `:452` (MAL), `:469` (Spotify), `:486` (Email) each
carry `style="--stagger-delay: …ms"` and `class="… p3r-animate"`. But
`.p3r-animate` is specificity (0,1,0) (`transitions.css:141-144`) while
`.bento-grid > *:nth-child(n)` is (0,2,0) (`transitions.css:187-203`) — the
positional rule wins both the `animation` shorthand *and* `animation-delay`. So
the four inline variables are inert, and the tiles play `p3r-entrance-scale` from
the `:nth-child` schedule instead of the intended `p3r-entrance` ripple.

Fix: delete the four inline declarations (the `:nth-child` schedule already covers
them) or move the intended delays into `:nth-child` rules.

### V13 — At ≤480px the YouTube tile stays above all owned content

`index.astro:1840-1848` intends to float owned content above the external service
tiles:

```css
/* Single column: float owned content (Journal/Now/Novel/Latest…)
   above the external service tiles… */
.image-tile--youtube { order: 2; }
.logo-tile { order: 2; }
```

But `order` only reorders siblings **within one grid container**, and the YouTube
tile lives inside the *inner* grid: `index.astro:166-167` opens
`<div class="hero-band"><div class="bento-grid">` and the YouTube tile is a child
of that inner grid (`:184`), whose only siblings are the title tile and the Now
tile. So `.logo-tile { order: 2 }` moves MAL/Spotify/Email to the end of the
*outer* grid, while YouTube's `order: 2` does nothing relative to the outer grid —
the whole hero band still precedes the journal/novel/About/Shelf tiles.

Rendered single-column order: **title, Now, YouTube, Traces bar, journal, novel,
About, Shelf, Latest, MAL, Spotify, Email.** The most image-heavy element on a
phone sits above every piece of owned content, which is exactly what the comment
says it should not. `min-height: 150px` (`:1846`) also survives, keeping it the
largest single block in the first screen.

Fix: move the YouTube tile out of the hero band in the markup — it's the only
reason the band wraps a non-hero tile.

### V16 — Eleven gold kicker chips, three insets, two sizes

Five separate rules draw the same gold chip silhouette with different geometry
*(heights computed from padding + inherited 1.6 line-height)*:

| chip | instances | edge inset | height | type |
|---|---|---|---|---|
| `.bento-tile__label` (`bento.css:342-357`) | 6 | **16px** | **27.2px** | 12px |
| `.logo-tile__kicker` (`index.astro:602-615`) | 3 | **0px** | **23.2px** | 12px |
| `.yt-tile__chip` (`index.astro:1396-1409`) | 1 | 4px | 21.6px | 11px |
| `.journal-tile__showcase-tab` (`index.astro:886-906`) | 1 | 48px | 22.0px band in a 44px box | 11px |
| `.traces-bar__send` (`index.astro:2036-2047`) | 1 | 2px | 21.6px | 11px |

Most visible in row 4, where the Shelf tile's `.bento-tile__label` sits directly
beside the MAL tile's `.logo-tile__kicker`: two identical-looking gold chips, 8px
apart, **16px out of alignment** and **4px different in height**. And in the
journal tile the two column headers are in the *same tile* — "WRITING" (12px) and
"SHOWCASES" (11px) sit ~8px apart on the baseline.

CLAUDE.md asserts these are "one silhouette" with "only colours swapped"; the type
sizes, paddings and insets were never unified. Fix: one shared geometry (a
`--kicker-pad` token) and both labels at `--text-xs`.

### V15 — The YouTube tile throws away about half of its image

`index.astro:1387-1394`:

```css
.yt-tile__avatar { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
```

Every child of the tile is absolutely positioned, so the tile contributes **no
intrinsic height** and simply stretches to whatever the row demands — and there is
no `aspect-ratio` on `.image-tile--youtube`.

*(computed)* The slot is therefore ≈185×206 at desktop — a **0.90:1** box for a
**640×360 (1.78:1)** source, so `cover` keeps ~51% of the image width. At ≤768px
the tile becomes ~652×200 (**3.26:1**) and `cover` keeps ~55% of the *height*
instead. One asset, two breakpoints, roughly half of it discarded in mutually
perpendicular directions. The comment at `index.astro:188-190` — "`object-fit:
cover` into a tall-ish slot means the 16:9 source is scaled by height" — is
inverted at desktop, where the slot is taller than the source and so scales by
width.

Fix: give the tile `aspect-ratio: 16 / 9` (or use a square channel avatar so the
crop is intentional on both axes).

### V19 — The live pulse kills the About tile's hover shadow

`index.astro:1180-1190` gives `.stream-tile.is-live` an
`animation: stream-tile-pulse 2.5s ease-in-out infinite` whose keyframes animate
`box-shadow`. CSS animations resolve after normal author declarations, so while
the animation runs it **outranks** `.bento-tile--dark:hover`'s
`box-shadow: var(--shadow-hard-hover)` (`bento.css:194-201`).

Net effect: in the one state where this tile is most prominent, hovering it lifts
and recolours but **the shadow never steps** — worth noting because the hover
signature is documented as a package ("paired with a lift, a shadow step to
`--shadow-hard-hover`, and a gold border").

Separately, the live state adds up to **4 infinite animations** — the tile pulse
(2.5s), a full-perimeter page border sweep (4s, `index.astro:544-552`), and two
badge breathes (1.5s, `:1342-1352`) — on top of the ~17 the repo records as its
ceiling ("Treat that as the ceiling — adding an ambient loop means removing one").
Two of the four are red, and the perimeter sweep is the largest moving surface on
the page.

Fix: animate something `:hover` doesn't own (border or `filter`), or
`animation-play-state: paused` on hover; and make the live loops mutually
exclusive.

### V18 — The Latest tile's emblem field is 88% empty, and the page has four timestamp treatments

*(computed)* `.latest-tile__emblem-wrap` (`index.astro:1576-1587`) is `width: 34%`
and full tile height; the emblem inside is `width: 100%; aspect-ratio: 1;
max-height: 100%` (`:1603-1607`) with `align-items: center`. Because the adjacent
Shelf tile's poster strip (two rows of 2:3 posters, `:1087-1100`) sets the shared
`--span-2x2` row height, the emblem resolves to roughly **70×70 inside a ~118×346
field — about a ninth of its area**, with the rest empty dark panel and a gold
hairline tracing the full seam. The text column opposite is
`justify-content: space-between` (`:1558-1564`), leaving a large void between the
excerpt and the date.

And four timestamp treatments on one page: `.latest-date` 12px
`formatDate()` (`:555-560`), `.journal-tile__date` 11px `shortDate()` (`:1059-1065`),
`.traces-list__date` 14px (`:2256-2260`), `.traces-park__time` 11px
(`:1998-2002`). The journal row and the Latest tile show **the same Substack
post's date** at 11px and 12px in different formats.

Fix: cap the Shelf strip to one row of four (drops both tiles ~120px), or let the
emblem fill its field (`align-items: stretch; height: 100%; object-fit: contain`).
And pick one timestamp slot.

### V17 — The Now tile's title length sets the height of the whole hero

`index.astro:244` renders the latest now-entry's title into a 1×1 tile, and
`.bento-tile__title` (`bento.css:359-365`) has no clamp. `bento.css:6` is
`grid-auto-rows: minmax(100px, auto)`, so the row is exactly as tall as its
tallest content.

The current title, `"Time Flows Quickly, Yet I Slowly Become"`
(`content/now/2026-09.md:2`, 38 chars), *(computed)* wraps to ~4 lines at
`--text-xl` in a 185px column, filling the tile to zero slack and setting the
height of the entire hero row — which then makes the wordmark tile (4 columns
wide, holding ~84px of content) mostly empty and stretches the YouTube tile into
the crop described in V15. A longer monthly title, e.g. `"L-file - Usogui database
launch!"` (`content/now/2026-02.md:2`), would push the whole hero taller.

Fix: clamp `.home-now-tile .bento-tile__title` to 2 lines with the full string in
`title`, or drop it a step to `--text-lg`.

### V8 — Smooth scrolling is global and unguarded by reduced motion

`BaseLayout.astro:75`:

```css
html { scroll-behavior: smooth; }
```

Not wrapped in `@media (prefers-reduced-motion: no-preference)`, and the
reduced-motion block later in the same file (`:112`) only disables the skip-link
transition. Two consequences:

1. Anchor jumps on long pages animate — `/novel`'s desk anchors
   (`/novel#characters`, `/novel#manuscript`) and `/shelf`'s legacy
   `#section-<type>` links scroll smoothly for someone who asked for less motion.
2. `src/utils/splitView/index.ts:90` calls
   `activeItem.scrollIntoView({ block: 'nearest' })` with **no `behavior`**, so it
   inherits `scroll-behavior: smooth` from `<html>` and animates anyway — the call
   looks safe but isn't. `contentLoader.ts:64` asks for `'smooth'` explicitly.

Fix: wrap the `html` rule in `@media (prefers-reduced-motion: no-preference)`, and
in JS pick the behaviour from `matchMedia('(prefers-reduced-motion: reduce)')`
rather than relying on the inherited value.

### V9 — Homepage weight (informational, not alarming)

Homepage critical path: **113KB raw / 25.6KB gzip**.

| asset | raw | gzip |
|---|---|---|
| `index.html` | 21.7KB | 4.8KB |
| `index.CD8yNLZm.css` (homepage scoped styles) | 35.9KB | 5.7KB |
| `_slug_.BO0luyjJ.css` (shared base: tokens + bento + fonts `@import`) | 23.4KB | 4.9KB |
| `ClientRouter…js` | 15.4KB | 5.4KB |
| `index…js` (homepage client script) | 12.0KB | 4.3KB |
| `BaseLayout…js` (cursor + transitions) | 4.9KB | 2.3KB |

In bytes this is fine. The notable shape is that `index.CD8yNLZm.css` — one page's
scoped `<style>` inside a 2970-line `index.astro` — is the largest CSS file in the
build, larger than the entire shared design system. Worth knowing before adding
another tile-specific block to it.

### N16 — The showcase filter UI is dead code, but its URL parameter still filters

`showSearch={false}` is passed on **both** SplitView routes
(`showcase/index.astro:20`, `showcase/[...slug].astro:43`), and it gates all the
filter chrome (`SplitViewLayout.astro:50,98`). So no search box, type pills or
clear-all button renders anywhere on the site.

But `splitView/index.ts:78-83` still *reads* `?types=` from the URL and
`filterEngine.ts:10` still applies it. A hand-made or bookmarked
`/showcase?types=film` therefore silently filters the visible list with no UI to
see the filter or clear it. Either delete the `showSearch` gate and the filter
modules, or keep the parameter out of the read path while the UI is off.

---

## Sharing & metadata

### M1 — `og:image` is an SVG, so link previews have no image

`BaseLayout.astro:24`: `const resolvedOgImage = ogImage ?? '/social-default.svg'`.
`public/` contains exactly one social asset, `social-default.svg` (1200×630 —
correct dimensions). `twitter:card` is declared `summary_large_image`
(`BaseLayout.astro:48`).

X/Twitter, Facebook, LinkedIn, Slack, Discord, and iMessage **do not render SVG
for `og:image`**. Every share of this site therefore shows a bare link with no
preview image, while the markup promises a large one. Verified: no `.png`/`.jpg`
exists at `public/`'s top level, and no page passes a raster `ogImage`.

Fix: render `social-default.svg` to a 1200×630 PNG (keep the SVG as the source),
point the default at it, and add `og:image:width`/`og:image:height` and
`og:image:alt`.

### M2 — The homepage title is `*in spite of it all*`

`BaseLayout.astro:23`:

```js
const fullTitle = title === 'Home' ? '*in spite of it all*' : `${title} — ${siteTitle}`;
```

Verified live: `<title>*in spite of it all*</title>`, and `og:title` /
`twitter:title` both inherit it. Every other page is `X — ninjaruss`. So a
bookmark, a browser tab, or a shared link to the homepage shows **literal asterisks
and never the word "ninjaruss"** — while the page's own `<h1>` says `Ninjaruss`.

The tagline is good; it just shouldn't be the title string.
`in spite of it all — ninjaruss` keeps the voice and restores the identity. (The
special case is also keyed on the literal string `'Home'`, which is fragile — a
`titleSuffix` prop would be sturdier.)

### M3 — No `robots.txt`

`public/` contains only `favicon.svg`, `images/`, and `social-default.svg`. So
`/robots.txt` 404s (verified live) and nothing points crawlers at
`sitemap-index.xml`.

### M4 — Heading outline skips h2 on the homepage, and is absent on three pages

Verified heading structure of the shipped HTML:

| page | headings |
|---|---|
| `/` | `h1`, then 6 × `h3` — **no h2** |
| `/about` | h1, 6 × h2, 3 × h3 |
| `/novel` | h1, 4 × h2, 7 × h3 |
| `/now` | h1, h2 |
| `/shelf` | h1 only |
| `/showcase` | h1 only |
| `/traces` | h1 only |

On the homepage the tile titles are `h3` (`BentoTile.astro:32`) directly under the
`h1`, skipping a level — and the tiles are siblings of the title tile, not children
of anything, so `h2` is the correct level. On `/shelf` (29 items), `/showcase` and
`/traces` there is no structure at all below the h1, so screen-reader users get a
heading list of exactly one item on the site's largest content pages.

Related: `/about`'s `<h1>` is the literal string `NINJARUSS` while every other
page's h1 is title-case (`Shelf`, `Showcase`, `Now`, `Remember Rain`) — and
`typography.css:49` already applies `text-transform: uppercase` to every `h1`, so
the source string is redundant.

---

## Deliberately not changed

Verified as sound; listed so they don't get re-litigated:

- **The 301s that exist are real.** `/status`, `/stream`, `/journal`, `/media` all
  return true 301s in production (checked live); `/rss.xml` 308s to the Substack
  feed; `/notes/*` 301s to the right Substack post. `/favorites` and the novel
  folder stubs are the exceptions (N7).
- **The mobile nav.** Full-width at ≤768px with `flex: 1 1 24%`, wrapping to two
  rows plus a full-width back-link row, with no overflow at 375px, and it
  publishes `--nav-clearance` on `astro:page-load` *and* `resize`.
- **Nav order and active state.** `SECTIONS` is one constant and never reorders;
  `isActive` is correct on every route including `/showcase/[slug]`, `/novel/*`,
  `/now/archive` and `/now/<slug>`, handling trailing slashes and sub-paths.
  `/traces` is the sole exception (N2).
- **SplitView's focus handoff** is thoughtful — `contentLoader.ts:91-95` sets
  `tabindex="-1"` on the entry heading and focuses it with `preventScroll`. The
  gaps around it (N10, N13, N15) are separate.
- **The shelf panel's focus restore and Escape handling**
  (`shelf/index.astro:742,779,800`) are correct; its problems are the
  reduced-motion backdrop (N11) and the missing trap (N13), not its focus
  *entry/exit* logic.
- **The `@import` is not the only font problem** — but `display=swap` *is* present,
  so there is no invisible-text window. The issue is the reflow, not missing text.
- **The title tile's tagline above and below the wordmark**, the two-zone traces
  bar, the sampled (non-constant) traces intervals, the 11s Latest cycle, and the
  no-shame invariants in the rain gauge and the shelf wall tiers — all
  deliberate and load-bearing.
- **`/rss.xml` existing only in `vercel.json`** (production-only) and the
  autodiscovery tag pointing straight at Substack — documented, and no page links
  to it.
- **The shelf wall's hover-only title plates.** Documented as deliberate ("Touch
  users get titles in the quick-view panel instead"). Worth knowing that this is
  JS-dependent: with no JS, mobile gets a wall of untitled posters, since the
  fallback `/shelf/[slug]` route is itself a `window.location.replace` bounce.

---

## Appendix A — Measurements

All ratios are WCAG 2.x: `(L1 + 0.05) / (L2 + 0.05)` over sRGB relative luminance
with the 0.04045 linearisation breakpoint. Opacity-reduced text is composited
against its actual ground before measuring.

Opaque resting text, for reference — the palette itself is strong:

| pair | ratio |
|---|---|
| `--color-text` `#f5f5f5` on `#111111` | 17.32:1 |
| `--color-text-muted` `#a0a0a0` on `#111111` | 7.22:1 |
| `--color-text-subtle` `#8f8f8f` on `#111111` | 5.84:1 |
| `--color-gold` `#ffe52c` on `#000000` | 16.50:1 |
| `#000000` on `--color-gold` | 16.50:1 |
| `--color-gold-dim` `#d4b82a` on `#181818` | 9.04:1 |
| `--color-border` `#3a3a3a` on `#111111` | 1.66:1 |
| `--color-border-strong` `#505050` on `#111111` | 2.34:1 |

The failures above are all introduced by `opacity` on top of a passing palette, or
by a border token never sized for a component boundary.

Reproduce:

```bash
npm run build
# heading structure + meta, from the build
grep -oE '<h[1-6]' dist/client/index.html | sort | uniq -c
# font waterfall: currently no matches
grep -rn preconnect src/ public/
# UA form controls: currently no matches
grep -rn "color-scheme\|font: inherit" src/ public/
# the shipped Latest-tile excerpt
grep -o 'data-entries="[^"]*"' dist/client/index.html | head -c 400
# 200 meta-refresh instead of 301
curl -sD - -o /dev/null https://www.ninjaruss.net/favorites | head -1
# no 404 page
curl -s -o /dev/null -w '%{http_code}\n' https://www.ninjaruss.net/this-page-does-not-exist
```

---

## Appendix B — CLAUDE.md drift found during this audit

CLAUDE.md is the map this audit navigated by, so the places where it no longer
matches the code are worth recording — they cost time and can lead a fix astray.

| CLAUDE.md says | Actually |
|---|---|
| "The arc card (`.arc-card`) — the first block in `/about`'s main column, above the hook" and "Arc-card CSS lives in `about.css`; `status.css` was deleted" | `/about` has **no arc card at all** (verified: live `/about` contains no `arc-card` and no `Arc I`). The markup is at `now.astro:74-86` and its CSS at `now.astro:191-259`, and only `/now` imports `parseCurrentArc` (`now.astro:7,35`). The whole "Sessions & the /about arc card" section describes a page that no longer has it. |
| "`typography.css` — Fonts (Archivo Black, **Inter**, JetBrains Mono)" | `typography.css:9` loads **Syne** (`--font-body: 'Syne', …`). Inter is not loaded anywhere. |
| "`p3r-entrance-scale` is still used directly by `.entry-grid`/`.bento-grid` children" | Half true. `.bento-grid` lives; `.entry-grid` has **0** template/script references — 12 CSS occurrences and one comment only. |
| "Micro-caps letter-spacing is `--tracking-label` or `--tracking-wide` — nothing in between", and the two tokens "replaced eight ad-hoc values (.06/.08/.1/.12/.14/.16/.18em)" | 34 raw `letter-spacing` values remain against 39 tokenized — including `.14em` (×6), `.12em` (×6), `.1em` (×4), `.08em` (×3) and `.06em` (×2), i.e. exactly the values named as replaced. And `--tracking-wide` is dead (V23), so the "two steps" are currently one. |
| "`--text-2xs` (10px) … is the hard floor for any text on screen" | `--text-2xs` is **never used** — no text renders at 10px. (Verified separately: nothing renders below the 11px `--text-floor` either, so the floor holds in practice.) |
| Accessibility: "Focus-visible gold rings, prefers-reduced-motion respected, 44px minimum touch targets" | Tap targets and the reduced-motion coverage largely hold (two real gaps: V8, V24). The focus-ring half does **not** hold in three measured places: V21 (1.00:1), N18 (clipped), and the gold-on-gold active states. |

---

## Resolution log

All 47 findings, what was actually changed, and how it was verified. "Decision"
means the finding was resolved by changing the *documented intent* to match the
right behaviour rather than by changing code — flagged so it isn't mistaken for
a fix.

### P0

| # | Finding | Fix | Verified by |
|---|---|---|---|
| N1 | Every internal navigation gated behind a ~1.14s animation | `transition.ts`: **the fetch now starts in parallel with the card** (the old code fetched only *after* `await cardPhase()`, adding request latency on top of the animation), the wipe's midpoint still releases the swap so the DOM exchange happens under the slab, history traversals return early via `e.navigationType === 'traverse'`, the swap gate got a fail-safe release so a canvas failure can't strand navigation, and the timings were **restored to 520/340/620** after a shorter revision made the card a 290ms flicker. Wall time ≈1.14s to the swap (860ms card + wipe midpoint), as before — but with fetch latency absorbed rather than added | build; timing math recomputed (card 860ms, swap 1140ms, clears 1480ms) |
| N10 | SplitView Back corrupts history | `contentLoader.ts` pushes `null` state (so Astro's ClientRouter ignores it) and gained `clearContent()` which resets `currentSlug`; the popstate handler now resolves the slug from the URL and calls `loadContent(…, { pushHistory: false, scroll: false, focusHeading: false })` instead of synthesising a click; the `isAnimating` guard was replaced by a real `isLoading` flag set *before* the fetch | build; grep `pushState(null` = 1 |
| N11 | Reduced motion + shelf quick-view bricks the wall | `closePanel` now hides on whichever comes first — `transitionend` or a timeout derived from the element's own computed `transition-duration` — with a guarded `finalizeHide()` and a pending-hide cancel on re-open | build; 5 `finalizeHide` references |
| V11 | Traces modal built from unreset UA controls | `global.css`: `color-scheme: dark`, `button,input,select,textarea { font: inherit; color: inherit; letter-spacing: inherit }`, `button { background: none; border: none }`, and a focus-visible ring for form controls. `.traces-modal__close` and `.traces-form__submit` given their own affordance + `font-size: var(--text-sm)` | `color-scheme:dark` and `font:inherit` present in built CSS |
| M1 | `og:image` is an SVG | Added `scripts/build-og-image.mjs` (sharp) producing `public/social-default.png` (1200×630, 9.5KB); `BaseLayout` default switched, plus `og:image:width/height/alt` | built HTML shows the PNG + dimensions |
| N2 | `/traces` reachable from one link, not by a normal click | Added `/traces` and `Writing` (→ Substack, external) to `NavPill` (now 8 items, wrap breakpoint raised to 1024px so the wider bar can't overflow); added a "Full page →" link to the traces modal | built nav shows all 8 items; `/traces` now matches `aria-current` |
| V20 | Media lightbox leaves no cursor at all | `global.css`: the `cursor: none` rule is now *suspended* while a modal surface is open (`:not(:has(dialog[open])):not(:has(.media-lightbox.is-active))`) rather than forcing `cursor: auto !important` back — which also preserves each element's own `cursor` (the backdrop's `pointer`) | built CSS contains the guard |
| V1 | Display type swaps in after first paint | `@import` removed from `typography.css`; `BaseLayout` loads the fonts via `<link rel="stylesheet">` with two `preconnect`s; Syne 800 dropped from the axis; metric-matched `@font-face` fallbacks added (computed from real font metrics via `@capsizecss/unpack`, reproducible with `scripts/build-font-fallbacks.mjs`) | 2 preconnects, 0 remaining `@import`, 0 requests for Syne 800, 4 fallback-face references in built CSS |

### P1

| # | Finding | Fix | Verified by |
|---|---|---|---|
| V10 | Hero tagline at 2.30:1 | `opacity: .45 → .75` (≈5.6:1) | built CSS |
| N17 | `/showcase` list dimmed twice (2.00:1) | `.split-view__list.is-scrolled` `opacity: .7 → .92`, so nothing compounds past readability | built CSS |
| V21 | Active nav item has no focus indicator | Ring colour `--color-gold → --color-black` (black reads 16.5:1 on the gold fill). Same fix applied to the selected filter pill (latent) | built CSS |
| N18 | Active list row's focus ring clipped away | `.list-item:focus-visible` gets `outline: none` + an inset `box-shadow` ring (clip-path-safe), with a black variant for the active row and a black arrow | built CSS |
| N9 | No 404 page | New `src/pages/404.astro` using `BaseLayout` + `NavPill`, with the six site routes and six recent entries as real destinations | `dist/client/404.html` exists with the right title/h1 |
| M2 | Homepage `<title>` is `*in spite of it all*` | New `displayTitle` prop on `BaseLayout` replaces the `title === 'Home'` magic string; homepage passes `in spite of it all — ninjaruss` | `<title>in spite of it all — ninjaruss</title>` |
| M3 | No `robots.txt` | Added `public/robots.txt` with `Allow: /`, `Disallow: /api/`, and the sitemap reference | `dist/client/robots.txt` |
| M4 | Heading outline skips h2 | `BentoTile` renders `h2` (tiles are siblings of the h1); the four hardcoded `h3` tile titles in `index.astro` updated too | homepage is now 1×h1 + 6×h2 |
| N12 | Nested `<main>` landmarks | `<main>` → `<div>` in `SplitViewLayout` (detail panel) and `novel/[...slug].astro` (both views), with a comment citing the existing `about.astro` precedent | 1 `<main>` per page |
| N13 | Shelf dialog claims `aria-modal` but leaks Tab | Focus containment added to the panel's keydown handler (queries focusables per keypress, since prose is injected after open; also catches focus that has already escaped) | build; guard present |
| N14 | ⌘-click swallowed | `isModifiedClick()` guard exported from `splitView/eventBindings.ts` and applied there plus the shelf wall's card handler | build; both guards present |
| N15 | `/showcase` detail loses scroll, no mobile way back | `loadContent` gained `scroll` (resets the panel's `scrollTop` on a normal selection, skips it on a traversal); `SplitViewLayout` now passes `backLink={initialSlug ? '/' + section : undefined}` | build |
| V2 | Mid-word truncated excerpt with a raw URL | New `excerpt()` helper in `index.astro`: runs `stripMarkdown` then cuts on a word boundary and appends `…`. Applied to all three Latest entries | built data-entries: `…towards utilizing LLMs…` (136 chars, was `(Lar` at 140) |
| V3 | Only form field nearly invisible at rest | Input borders → `--border-hairline solid var(--color-gold-dim)` (9.04:1 against the fill), in both `traces.astro` and the modal, plus a gold border on focus | built CSS |
| N3 | Custom cursor misses the biggest tiles | `cursor.ts` selector is now `a[href], button, .traces-bar, .traces-bullet, [role="button"]` — derived from element type so it cannot go stale | selector read back |
| V4 | Neighbour dimming fires from decoration | `.title-tile` dropped from all three dimming rules (hover, focus-visible, and the reduced-motion reset) | grep: no `.title-tile` left in `bento.css` dimming |
| V13 | ≤480px YouTube tile above owned content | **Decision + partial fix.** Moving the tile out of `.hero-band` would break the documented desktop row-1 layout, and the band exists so the ~40px traces bar can have its own row. So the misleading comment was replaced with an accurate one, and the mobile `min-height` dropped 150px → 96px so it stops being the largest block on the first screen | built CSS |
| N4 | Four names for two sections | Nav now says "Visual Novel" (matching the homepage tile and the page kicker); `/shelf`'s kicker `catalog → media log` (matching the tile's "Media Log"); `/traces`' kicker lowercased to match its peers; Writing + Traces added to the nav | built nav labels |

### P2

| # | Finding | Fix | Verified by |
|---|---|---|---|
| N7 | 31 routes ship 200 meta-refresh and are in the sitemap | `/favorites` and `/favorites/[...slug]` moved to `astro.config.mjs` `redirects` (real 301s via the adapter) and the two page files deleted; the 12 novel folder stubs are computed at config time from `buildNovelTree()` and filtered out of the sitemap. (Folder URLs keep the meta-refresh because their destination is a `#fragment`, which Vercel can't express — documented in the config.) | sitemap 143 → 120 URLs, no favorites, no redirect stubs; no `/favorites` page emitted |
| V5 | Tile subtitles below AA at rest | `.logo-tile__description` `opacity: .6 → .75`. The `.bento-tile__description` case was re-verified as currently unreachable (only `variant="highlight"` renders one, where it passes at 7.59:1) and is documented as a latent hazard | built CSS |
| V6 | Traces bullet metadata under AA | `.traces-bullet__time` `.65 → .8`, `.traces-bullet--echo` `.62 → .72`, `.traces-park__time` `.6 → .75` | built CSS |
| V7 | Journal dates 4.48:1 | `opacity: .55 → .6` | built CSS |
| V8 | Smooth scroll ignores reduced motion | `html { scroll-behavior: smooth }` wrapped in `@media (prefers-reduced-motion: no-preference)` — which also covers SplitView's `scrollIntoView` calls, since they inherit the value | built CSS |
| V12 | Four inline `--stagger-delay` never apply | Removed all four (YouTube, MAL, Spotify, Email); the `:nth-child` schedule already sequences them | 0 `stagger-delay` left in `index.astro` |
| V14 | About tile prints markdown asterisks | `stripMarkdown(currentArc.decision)`; the helper was already imported | built HTML |
| V15 | YouTube tile discards ~half its image | The asset really is 640×360 (checked with sharp). At ≤768px the tile now uses `aspect-ratio: 16 / 9; max-height: 340px` instead of `min-height: 200px` (a 3.26:1 slot, which threw away ~45% of the height). The desktop portrait slot is documented as a deliberate centre-crop | built CSS |
| V16 | Eleven kicker chips, three insets, two sizes | `.logo-tile__kicker` inset `0 → var(--space-md)` and vertical padding `--space-2xs → --space-xs`, making it geometry-identical to `.bento-tile__label` (16px inset, 4px padding, 27.2px tall, same left/right padding) | rules read back and matched |
| V17 | Now tile's title sets the hero height | `.home-now-tile--clamped .bento-tile__title` clamped to 2 lines (`-webkit-line-clamp`); the full title remains on the element's `title` attribute | built CSS |
| V18 | Latest emblem field 88% empty; four timestamp treatments | Emblem wrap `align-items: stretch` and the emblem `height: 100%` (was `width: 100%; aspect-ratio: 1` centred); `.latest-date` 12px → `--text-floor` and `.traces-list__date` 14px → `--text-floor`, so all four timestamps share one slot | built CSS |
| V19 | Live pulse kills the hover shadow | `animation-play-state: paused` on hover/focus of `.stream-tile.is-live`, restoring the shadow step and stopping the page moving under the pointer | built CSS |
| V22 | `/now` chip names a nonexistent keyframe | `p3r-animate → p3r-entrance` | `p3r-entrance 400ms` present |
| V23 | `--tracking-wide` declared twice | Duplicate removed from `typography.css`; the single declaration in `global.css` (0.12em) now applies, restoring the two-step scale | 1 declaration, 0 in typography.css |
| V24 | Reduced-motion lift reduction dead | Moved to the end of `bento.css` so it actually outranks `.bento-tile--dark:hover`, and extended to cover `--dark` | one `translate(-2px, -2px)` at file end |
| N19 | 1200px auto-open off by one | `matchMedia('(min-width: 1200px)') → (min-width: 1201px)` | build |
| N16 | Filter UI dead but `?types=` still filters | The URL filter read is gated on filter chrome actually existing; `applyFilters` still runs (with no filters) because `tryAutoOpen` reads its `is-filtered` class | build |
| N5 | `/now/archive` reachable only from `/now` | **Decision:** unchanged. It is a depth-2 page reached from `/now`, which is a nav item — a normal, discoverable shape rather than a defect | — |
| N6 | Two prose links point at legacy `/media/` | Both retargeted to `/shelf/marie` | grep |
| V9 | Homepage weight (informational) | **No change** — recorded as context. Row kept for completeness | — |
| M3 | No `robots.txt` | See P1 above | — |
| V25 | Dead code inventory | Removed: 7 dead `@keyframes` (`p3r-sweep-out/in`, `p3r-slide-in/out`, `p3r-diagonal-reveal`, `radar-ping`, `now-pulse`), `.p3r-animate-wipe`, `.stagger-1…6`, `.sr-only`, `.p4g-label`, `.label`, `.text-sm/.text-xs/.text-muted/.text-gold`, the `.h1`–`.h6` class halves, the empty `.bento-tile--small` rule, all `.entry-grid` rules (no template emits it), two dead focus-fragment selectors, and 9 unused custom properties (`--color-gold-dark`, `--color-panel`, `--opacity-subtle`, `--opacity-heavy`, `--shadow-soft`, `--stagger-increment`, `--tracking-normal`, `--text-2xs`, four `--breakpoint-*`). **Retained:** the `dominant`/`medium-wide`/`medium-tall`/`span-3x2`/`static` tile variants — unreachable by the *current* call sites but documented parts of `BentoTile`'s API, so deleting them would remove capability rather than dead weight | build + 216 tests after each batch |

### Net effect on the shipped output

| metric | before | after |
|---|---|---|
| sitemap URLs | 143 | 120 |
| URLs serving 200 meta-refresh *and* listed in the sitemap | 31 | 0 |
| requests to Google Fonts before first paint | 3 sequential | 1 (2 preconnected) |
| display-font weights requested | 8 | 7 |
| heading structure, homepage | h1 + 6×h3 | h1 + 6×h2 |
| `<main>` landmarks on `/showcase` and `/novel` | 2 | 1 |
| internal navigation blocked by an animation | ~1.14s + fetch latency, every time | ~1.14s with the fetch absorbed behind the card; **0** on Back/Forward |
| `npx astro check` errors | 12 | 10 |
