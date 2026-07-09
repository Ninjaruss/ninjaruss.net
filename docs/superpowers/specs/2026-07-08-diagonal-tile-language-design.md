# Diagonal tile language — Journal, Latest, Shelf

**Date:** 2026-07-08
**Status:** Approved for planning
**Surface:** Homepage bento grid (`src/pages/index.astro`), scoped styles + markup only

## Motivation

The journal tile reads as a flat list: no focal point, weak P4G menu-screen
energy, and the three showcase emblems are buried as 56px thumbnails under the
note rows. The fix — a diagonal "slash split" — is strong enough that it should
become a small shared language across the grid rather than a one-off, but only
on tiles that genuinely have two content zones to separate. A slash on a
single-zone tile is decoration; if every tile gets one it stops meaning
anything.

## Scope

| Tile | Treatment |
|------|-----------|
| Journal (4×2, core) | Full slash split — gold notes field / black showcase field |
| Latest (2×2, dark) | Quiet split — deeper-black emblem field, gold hairline seam |
| Shelf (2×2, dark) | Angled bleed edge — poster collage tucks under a diagonal header edge |

**Explicitly out of scope:** Stream (donut body has no second zone), Now
(single text block), Novel (rain-gauge mood invariant — never decorate it),
YouTube (full-bleed art already carries the angled chip), logo tiles (too
small). The corner-cut hover triangle already gives every interactive tile the
diagonal motif at small scale.

## Shared vocabulary

- All seams come from the same angle family as the existing tokens
  (`--skew-rule: -30deg`, `--cut-sm`/`--cut-md`). Seams are drawn with
  `clip-path` polygons; remember `clip-path` clips `box-shadow`, so any cut
  element needing the hard gold shadow keeps it on a `filter: drop-shadow()`
  wrapper (existing convention).
- Visual hierarchy of the three: Journal is the loud statement (gold/black
  mass), Latest is the quiet echo (line, not mass), Shelf is a single cut with
  no new color. Gold *fill* stays reserved for core/highlight tiles.
- Every `:hover` treatment gets `:focus-visible` parity (existing convention).
- `prefers-reduced-motion` disables any seam movement.

## Journal tile (full slash split)

**Structure.** Root stays a 4×2 `div.journal-tile` (no nested anchors; links
are leaves). Two layered fields: gold base; black overlay clipped with a
diagonal — approximately `polygon(66% 0, 100% 0, 100% 100%, 58% 100%)`.

**Left field (gold, ~60%):**
- Black kicker tab `JOURNAL` (`.p4g-tab` styling) + "Notes" heading
  (p4g-heading treatment). The combined "Notes & Showcases" heading and the
  description sentence are removed; the two side tabs carry the naming.
- The existing five deep-link rows with right-aligned muted dates, unchanged.

**Right field (black, ~40%):**
- Gold kicker tab `SHOWCASES`.
- The three `recentShowcase` entries upgraded from bare 56px emblem thumbnails
  to emblem + title rows: 40–44px emblem with border (gold border for the most
  recent entry, grey for the others) + project title in light text.

**Click model.**
- Notes header cluster → `/journal?types=note`
- `SHOWCASES` tab → `/journal?types=showcase`
  (Both wired to the segmented type filter on /journal.)
- Note rows and showcase rows keep per-entry deep links.

**Hover & motion.**
- Corner-cut triangle stays as the tile hover signature. The top-right corner
  now sits on the black field, so the triangle must be gold (the tile's
  current black triangle — correct for gold-background tiles — would vanish
  on black).
- Rows keep invert-on-hover, mirrored per side: black-bg/gold-text on the gold
  side; gold-bg/black-text on the black side.
- On tile hover the seam shifts ~2% leftward via `clip-path` transition;
  disabled under `prefers-reduced-motion`.

**Data.** No new server data. `recentJournal` (5 rows) and `recentShowcase`
(3 entries with `title`, `emblem`, `href`) already exist in `index.astro`.

## Latest tile (quiet split)

- Stays dark. The right ~35% becomes a deeper-black angled field
  (`clip-path` polygon) holding the emblem art; a thin gold hairline traces
  the seam (a skewed 1–2px element or border along the polygon edge).
- The entry-cycling behavior (7s interval, `.is-cycling` fade) is untouched;
  the emblem swaps inside its angled field.
- Text zone (label, title, excerpt, days-ago) unchanged on the left.

## Shelf tile (angled bleed edge)

- No second panel and no new colors. The header zone (SHELF kicker + "Media
  Log" heading) gets an angled bottom edge; the 8-cover collage tucks
  underneath the diagonal instead of sitting in a straight-edged block.
- Implementation sketch: clip the collage container's top edge with a
  diagonal polygon (or clip the header field's bottom edge), using the shared
  angle family.

## Responsive

Below the grid collapse points, tall narrow tiles can't carry a steep
diagonal: all three seams flatten to a near-horizontal slice (small-angle
polygon) as tiles stack, so the identity survives without eating vertical
space. Journal halves stack: gold notes block on top, black showcases below.
Tap targets (tabs, rows) stay ≥44px on coarse pointers.

## Accessibility

- Link labels: side tabs are real links with clear text (`Notes`,
  `Showcases`); showcase rows carry visible titles (no more icon-only links —
  the current `aria-label`-only emblem links become emblem + visible text).
- Focus-visible parity on all new hover treatments.
- Color contrast: light text on the black field ≥ AA; muted grey borders on
  non-recent showcase emblems are decorative only.

## Verification

- `npm run build` passes; no schema or utility changes expected.
- Preview checks: desktop grid (seams render, links route to filtered journal
  views, hover states), mobile stack (flattened seams, no horizontal
  overflow), `prefers-reduced-motion` (no seam movement), keyboard focus
  order (notes header → note rows → showcases tab → showcase rows).
- CLAUDE.md: rewrite the Journal-tile bullet, extend Latest/Shelf bullets, and
  note the diagonal-language rule (two-zone tiles only) in the design system
  section.

## Decisions log

- Slash split chosen over "twin panels" and "inset card" variants (mockups
  reviewed 2026-07-08).
- Split-identity focal model chosen over featured-entry hero, showcase cards,
  and heading-as-statement.
- Half-headers deep-link to filtered journal views (`?types=note` /
  `?types=showcase`) rather than both linking to plain `/journal`.
- Diagonal scope delegated to implementer judgment; restraint rule applied —
  two-zone tiles only (Journal, Latest, Shelf).
