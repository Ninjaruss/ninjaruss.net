# Shelf Wall Redesign — Design Spec

**Date:** 2026-08-04
**Status:** Approved (brainstorming session, direction G "poster wall" → pinned variant)

## Problem

The current `/shelf` is a competent but generic poster grid: seven near-identical
sections in a row (monotonous scroll), P4G language visible only on hover, more
than half the cards dimmed to 52% opacity (16 of 29 at time of writing), and a
character hero panel whose rounded corners and circular buttons sit outside the
site's angular vocabulary.

## Concept

`/shelf` becomes **the Wall**: a single dense collage of every entry, replacing
the per-type sections entirely. Size expresses affection — the page's version of
the site-wide no-shame invariant:

| Tier | Rule (existing frontmatter only) | Look |
|------|----------------------------------|------|
| Large | `isFavorite: true` | ~3-column span, gold outline + hard gold drop-shadow |
| Medium | not favorite, has written content (`!hasMinimalContent(body)`) | ~2-column span |
| Small | bare log (neither) | ~1-column span, full opacity — **no dimming anywhere** |

The wall is "pinned by hand": every item carries a small deterministic rotation.
Favorites are the loudest things on the page; nothing is ever punished for being
a bare log — small is quiet, not shamed.

## Layout

- **Grid:** CSS grid, `grid-auto-flow: dense` so packing fills holes — no JS
  masonry. Column tracks `repeat(auto-fill, minmax(~88px, 1fr))`; fine-grained
  `grid-auto-rows` (on the order of 8–12px) so integer row spans can approximate
  each shape within a few percent (`object-fit: cover` absorbs the remainder).
- **Shapes:** posters (anime, manga, film, series, book, game, character, other)
  render ~2:3; music renders ~1:1. Span table lives in `shelfWall.ts` (single
  source of truth, unit-tested); exact row/column numbers are tuned during
  implementation against the real grid — the acceptance criteria are "posters
  read as 2:3, music reads as square, no ragged holes."
- **Order:** newest first by `updatedAt ?? publishedAt`; undated entries last,
  tie-broken by title. Deterministic at build; dense packing may visually
  reorder neighbors, which is accepted.
- **Rotation:** ±1.5° max, seeded from the slug by a pure hash function
  (`wallRotation(slug)`) so it is stable across builds and per-item unique.
  Rotations are static CSS transforms and remain under
  `prefers-reduced-motion` (they don't move); entrance stagger and hover
  motion are disabled under reduced motion per site convention.
- **Mobile (≤768px):** same wall with smaller units; the small tier stays at or
  above ~72px wide — comfortably over the 44px touch-target floor.

## Item anatomy

- Each item is a real `<a href="/shelf/[slug]">` (no-JS safe), with
  `aria-label` = title (screen-reader scanning unaffected by hidden titles).
- **At rest:** artwork only. Favorites: 2px gold outline (offset 2px) + hard
  gold `drop-shadow` (P4G `--shadow-hard` values via `filter`, since outlines
  don't clip). The diamond-watermark loading background is kept.
- **Hover/focus-visible:** rotation eases to 0° with a slight lift; the
  corner-cut gold triangle slides into the top-right (site-wide hover
  signature); a skewed black title plate with gold left edge slides up from the
  bottom-left, `★`-prefixed for favorites. All hover treatments have
  `:focus-visible` parity (comma-paired selectors, per convention).
- **Touch:** no hover state; titles appear in the quick-view panel on tap.
  Accepted trade-off (chosen explicitly).

## Filter bar

The sticky jump bar keeps its visual identity (angled tabs, solid gold active
tab, right-edge fade, scroll-snap) but becomes a **filter**:

- Tabs: `ALL · <n>` plus one per present content type with counts.
- Single-select. Clicking a type hides non-matching items and resets the
  entrance stagger (site convention for client-side filtering). Active tab gets
  `aria-current` semantics matching the current implementation ("page" or
  absent — never "false").
- URL state: `?type=<content_type>` via `replaceState`; invalid values fall
  back to All. Legacy `#section-<type>` deep links map onto the corresponding
  filter on load, then the hash is stripped.
- No-JS: the full unfiltered wall renders (grid + rotations are pure CSS).
  The filter bar is rendered but inert without JS; this replaces the old
  anchor-link fallback and is accepted because every entry remains reachable
  as a plain link on the one page.

## Unchanged

- Quick-view panel: card click intercepted, `pushState` to `/shelf/[slug]`,
  panel slides in; ESC/✕/backdrop/popstate close; `?open=` legacy param;
  ≤900px bottom-sheet variant; `/shelf/[slug]` detail page and its
  JS-redirect-back behavior.
- Page header (P4G tab/heading/underline + count pill), NavPill, RSS, sitemap.
- Entrance animation: existing `card-in` keyframes + capped stagger delay.
- Eager-load policy: first ~8 items eager, rest lazy.

## Deleted

- Character hero carousel: markup, styles, `initCharacterHero()`, and the
  `characterData` serialization.
- Section headers, section counts, diagonal `shelf-divider`s.
- Jump-bar IntersectionObserver scrollspy (`initJumpbar` observer logic; the
  edge-fade logic is kept).
- `.shelf-card--dim` and the dim-card concept.

## Files

- `src/pages/shelf/index.astro` — bulk of the change (markup, styles, script).
- `src/utils/shelfWall.ts` — **new** pure module: tier assignment
  (`wallTier(entry)`), span table (`wallSpan(tier, contentType)`), rotation
  seed (`wallRotation(slug)`), wall ordering (`sortWall(entries)`), filter
  param validation. No astro imports (vitest-compatible).
- `src/tests/shelfWall.test.ts` — **new**: tier rules, span table shape
  ratios, rotation determinism/range/spread, ordering (dates, undated-last,
  title tiebreak), filter validation.
- `src/utils/shelf.ts` — `sortShelfSection` likely absorbed/replaced by
  `sortWall`; keep or retire per implementation findings.
- `CLAUDE.md` — rewrite the Shelf Page Features section (grid model, filter
  bar, tiers, deletions).

## Acceptance criteria

1. Every non-draft shelf entry appears on the wall exactly once; favorites are
   visibly large with gold outline + hard shadow; no entry is dimmed.
2. Posters read as 2:3, music as square; no ragged holes in the packed grid at
   1200px, 900px, 768px, and 375px widths.
3. Rotation is stable across reloads/builds and within ±1.5°.
4. Filter tabs show correct counts, filter correctly, write `?type=`, and
   restore from both `?type=` and legacy `#section-*` URLs.
5. Keyboard: every item reachable, focus-visible shows the title plate +
   corner triangle; panel flow unchanged.
6. No-JS: full wall renders, every item navigates to its detail page.
7. `npm run test` passes with the new `shelfWall` suite; `npm run build`
   succeeds.
