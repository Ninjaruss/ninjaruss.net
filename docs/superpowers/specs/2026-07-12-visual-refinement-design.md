# Visual Refinement Design — Six Areas

**Date:** 2026-07-12
**Status:** Approved
**Source:** Full-site visual audit (desktop + mobile sweep of every page), interviewed area by area.

## Overview

A site-wide refinement pass addressing the six weakest visual areas found in the audit,
ranked by impact. No new colors, no new tile variants, no decorative copy — every change
uses the existing P4G vocabulary (`p4g-tab`, `p4g-underline`, `p4g-sweep`, corner cuts)
and respects the standing invariants: no-shame mechanics, functional labels only,
`prefers-reduced-motion` parity, `:hover`/`:focus-visible` pairing, WCAG AA contrast.

## 1. Split-view auto-open fix + placeholder upgrade (`/journal`, `/codex`)

**Bug (confirmed live):** `initSplitView` auto-opens the newest entry on desktop only,
detecting desktop via `getComputedStyle(splitView).gridTemplateColumns` having ≥3 tracks
(`src/utils/splitView/index.ts:113-119`). When init runs from `DOMContentLoaded`, the
stylesheet may not be applied yet, the check reads no grid, and auto-open silently skips.
Reproduced: page sits initialized (`__splitViewInitialized: true`) with 3 columns applied
and no active entry.

**Fix:** defer the layout detection by one `requestAnimationFrame` (or equivalent
styles-resolved check) before reading `gridTemplateColumns`. Keep the principle of
detecting the *applied layout*, not the viewport width.

**Placeholder upgrade:** replace the "CHOOSE AN ENTRY" panel with a functional stats
block styled in the P4G vocabulary (`p4g-tab` label + skewed heading + `p4g-underline`):

- Entry count and type split (journal: notes / showcases; codex: concepts / source entries)
- Newest-entry date ("newest: Jun 25, 2026" — a fact, not time-since)
- The existing ⌘K search hint, kept
- Data rendered server-side at build (it's already available to the layout); no client fetch
- One shared treatment parameterized per section; still shown on mobile landings and
  zero-result filter states (zero-result keeps the existing "no results" message priority)

## 2. Mobile NavPill — two-row wrap

At ≤768px the 7-item bar currently crams into one row: colliding labels, sub-44px targets.

- Items wrap into two rows (4 + 3), each row ≥44px tall
- Corner-cut silhouette and hard gold shadow (drop-shadow wrapper) preserved
- Optional back-link slot unaffected (it appends; wrap handles overflow naturally)
- **Clearance guarantee:** pages take bottom padding driven by the nav's measured height —
  the nav sets a CSS custom property (e.g. `--nav-clearance`) on load/resize, plus
  `env(safe-area-inset-bottom)`. The taller bar must never cover list items, footers, or
  the last lines of novel reading pages. Extends the existing scroll-pane clearance fix
  (commit `2f1432b`).

## 3. Logo tiles — kicker chips + corner cut + hover sweep (A + C)

MAL / Spotify / Email tiles currently read as plain grey boxes beside the crafted tiles.

- Angled black-on-gold kicker chip per tile with a functional role label:
  MAL → `WATCHLIST`, Spotify → `LISTENING`, Email → `CONTACT`
- Corner-cut silhouette to match neighboring interactive tiles (they already have the
  corner hover triangle; ensure the silhouette + chip don't collide with it)
- Hover/focus: existing `.p4g-sweep` diagonal wash; `:focus-visible` parity
- Brand logos remain the visual hero; no new colors introduced

## 4. Homepage tile density

**Novel tile (rain gauge):** the rain/mist animation becomes the full-tile-height
centerpiece — the empty middle is sky. Stats (story words gold, outline words grey)
stay pinned at the bottom. All existing states preserved: `is-raining` scaled by
`--rain-strength`, `is-misting` sparse drizzle, `is-waiting` static line; reduced-motion
gets a static frame. Invariant: never red, never counts absent days.

**Journal tile (gold notes field):** show 6–7 note rows instead of 5 with compact row
height, so the list fills the field. Date column alignment and the seam-clearance
`padding-right` rules unchanged; row count chosen so the field bottom is reached without
crowding at 1024px+ widths.

## 5. Shelf wayfinding — full p4g-tab treatment

- Section headers (ANIME, MANGA, …) get the unified pattern: angled black-on-gold tab +
  skewed uppercase heading + gold underline — same grammar as Journal/Novel page headers
- Sticky jump bar items become small angled tabs; the active section renders as a solid
  gold tab (replacing the 3px underline), mirroring the NavPill active state
- Sticky behavior, anchor links, and scroll tracking unchanged; AA contrast maintained

## 6. Stream + Now polish

**Stream:** tighten the sidebar — the portrait anchors directly below the tab list
(or the sidebar shrinks to content) so the gap reads as deliberate negative space.
No new content or motifs.

**Now:** header and prose share one centered column with a ~65–70ch measure. The
quote-bar treatment on paragraphs is kept; only the asymmetric gutter goes.

## Out of scope

- Novel desk / reading pages (fresh redesign, holds up)
- Shelf card grid and quick-view panel
- Any nav restructuring beyond the mobile wrap
- New colors, variants, icon systems, or decorative motifs

## Testing

- Existing vitest suites should pass untouched (changes are presentational; no utility
  module contracts change)
- Auto-open fix: unit-test the deferred detection where feasible; verify live at desktop
  and mobile widths, both direct-load and view-transition navigation paths
- Browser verification per surface at 375px / 768px / 1280px: nav clearance on long list
  pages and novel reading pages, journal/codex landing (auto-open + placeholder via
  zero-result filter), homepage tiles hover + reduced-motion, shelf jump bar active
  states, stream sidebar, now column
