# Novel Desk: Story-First Redesign

**Date:** 2026-08-04
**Route:** `/novel` (desk landing only — reading pages untouched beyond incidental polish)
**Goal:** Make the script (Manuscript) the visual hero of the desk; keep the page flat,
easy to navigate, and free of unnecessary complexity.

## Problem

The current desk treats Manuscript as one of four equal text lists in a 2-column
CSS-columns index. At desktop height the story lands below the fold, under
Characters. The index is visually flat (thin rules, plain lists) compared to the
site's angular gold language, and scene titles get no framing at all.

## Design

Single flat page, four bands top to bottom:

1. **Header** — unchanged (VISUAL NOVEL tab, "Remember Rain", `p4g-underline`,
   script/outline word stats).
2. **Top row** (`.desk-top`, 2-col grid, stacks ≤768px): the synopsis intro panel
   (`.desk-about`, "read from the start →" CTA stays inside) on the left; the
   latest-scene paper sheet (`.desk-sheet`) on the right as a bookmark card.
   With no synopsis doc, the sheet spans full width and the `.desk-restart`
   fallback link renders as today.
3. **SCRIPT** (`.desk-script`, `id="manuscript"`, full width) — VN
   chapter-select list. Arcs (Manuscript subfolders, binder order) are group
   headers with per-arc word counts; root Manuscript files (if any) render as
   an untitled first group. Each scene is a `.scene-row` link: continuous
   scene number (01, 02, … in reading order — same order as prev/next),
   title, word count right-aligned. Gold sweep on hover/focus (`.p4g-sweep`
   move), ≥44px targets. The latest-edited scene carries a small gold
   "latest" chip tying it to the bookmark sheet.
4. **BINDER** (`.desk-binder`, 3-col grid, stacks ≤768px) — Characters /
   Story Plan / World as compact dark panels (`.binder-panel`,
   `id={group.slug}`): warm mono header + count, sublabels for subfolders,
   plain file lists. Same content as today, visually subordinate to SCRIPT.

## Invariants kept

- Anchor IDs `#manuscript`, `#characters`, `#story-plan`, `#world` still exist
  (folder URLs 301 to `/novel#<slug>`; NavPill back-links target them).
- No-shame framing: word counts as accumulation; dates only as plain facts.
- Flat navigation, no flavor text, no new page layers.
- No-JS unaffected: everything is plain links; the only script remains the rain
  canvas.
- Reduced motion: sweep transition disabled (inherited from `.p4g-sweep` rules
  or mirrored locally).

## Implementation surface

- `src/pages/novel/[...slug].astro` — desk branch only: split the Manuscript
  group out of `indexGroups`; precompute script arc groups with numbered rows,
  per-arc word counts, and a latest-scene flag.
- `src/styles/novel.css` — replace `.desk-layout`/`.desk-index` (columns) with
  `.desk-top`, `.desk-script`/`.desk-arc`/`.scene-row`, `.desk-binder`/
  `.binder-panel`. Warm palette stays; gold reserved for accents/active states.
- `CLAUDE.md` — update the Novel Pages description.
- No util/API changes; no new tests needed (pure presentation; existing
  `novel.test.ts` covers the data helpers).

## Out of scope

Reading-page layout, rain canvas behavior, novel.ts utilities, mobile nav.
