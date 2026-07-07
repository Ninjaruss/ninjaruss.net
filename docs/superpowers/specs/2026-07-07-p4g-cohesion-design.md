# P4G Thematic Cohesion & Style Pass — Design Spec

**Date:** 2026-07-07
**Status:** Approved
**Approach:** Vocabulary-first system pass — build reusable P4G style moves into the design system, then apply them consistently across site chrome, content pages, and the homepage bento grid.

## Goal

Make the interface more thematically cohesive by giving every surface the same Persona 4 Golden design dialect: diagonal energy, bold menu-screen typography, and motion flair. Chrome gets loud; prose stays calm.

**In scope:** site-wide chrome (section headers, NavPill), content pages (list items, entry headers, shelf filter bar), homepage bento tiles.
**Out of scope:** Novel and Stream pages (their bespoke styles stay), halftone/texture treatments, background dot grid, custom cursor, prose styling, any layout restructuring.

## Section 1: The P4G vocabulary layer

New tokens in `src/styles/global.css`:

```css
--skew-display: -6deg;   /* display-type slant */
--skew-accent: -12deg;   /* sweep panel slant */
--skew-rule: -30deg;     /* underline bar slant */
--cut-sm: 6px;           /* parallelogram cut distance, small */
--cut-md: 12px;          /* parallelogram cut distance, medium */
```

All motion reuses existing `--animation-easing`, `--transition-*`, and `--animation-*` tokens. No new timing values.

New utility classes in `global.css`, adjacent to the existing `.p4g-label`:

| Class | Effect |
|---|---|
| `.p4g-heading` | Italic, skewed (`--skew-display`), uppercase display type with tight tracking — the menu-screen title look. Gold terminal period added per-use via markup (`<span>`), not the utility. |
| `.p4g-tab` | Angled gold label bar: black text on gold, one slanted edge via `clip-path: polygon(...)` using `--cut-sm`. Evolution of `.p4g-label`. |
| `.p4g-underline` | Skewed (`--skew-rule`) gold underline bar, gradient fade to transparent on the right, sweeps in on entrance (scaleX from left origin). |
| `.p4g-sweep` | Hover pattern: gold `::before` panel slides in diagonally (translateX + skewX), content flips to black. Transform-only. |
| `.p4g-cut` | Parallelogram silhouette via `clip-path` using `--cut-sm`/`--cut-md`. |

**Technical constraint (document in utility comments):** `clip-path` clips `box-shadow`. Any cut element needing the hard gold shadow must use `filter: drop-shadow()` on a wrapper element instead.

## Section 2: Site-wide chrome

- **Section headers** (`src/layouts/SectionLayout.astro`) — variant A, full treatment:
  - `.p4g-tab` kicker above the title (e.g. "FRAGMENTS" over "NOTES"). Kicker text passed as a new optional prop; falls back to nothing.
  - Title gets `.p4g-heading` slant + gold terminal period.
  - Replace the thick `border-bottom` rule with `.p4g-underline`, animating in on page entrance.
  - Existing gold glow text-shadow stays.
- **NavPill** (`src/components/NavPill.astro`):
  - Silhouette unchanged (pill shape stays).
  - Hover upgrades from flat background swap to diagonal gold sweep (`.p4g-sweep` pattern adapted to pill radius).
  - Home diamond icon gets a quick spin-flash on hover.
- **Background & cursor:** unchanged.

## Section 3: Content pages — loud chrome, calm prose

- **ListItem** (`src/components/ListItem.astro`):
  - Hover: diagonal gold sweep replaces the soft gradient; text flips to black; existing translateX nudge kept.
  - Shape: subtle `.p4g-cut` parallelogram.
  - `is-active`: stays solid gold fill, gains the same cut silhouette.
  - `.list-item__type` badges get the angled-edge cut to match kicker tabs.
- **EntryHeader** (`src/components/EntryHeader.astro`):
  - Entry title gets `.p4g-heading` slant + swept underline.
  - Kicker tab shown when a content type exists.
  - Tag pills and date display unchanged.
- **EntryBody / `.prose`:** untouched. No skew, gold, or motion inside prose.
- **Shelf filter bar** (`src/pages/shelf`): filter pills get the sweep hover; active pill stays solid gold.

## Section 4: Homepage bento

- **Core tiles** (Showcase, Notes, Shelf):
  - Tile titles use `.p4g-heading` slanted italic.
  - Hover adds a gold corner-cut reveal (top-right triangle sliding in via transform) on top of existing lift + hard shadow.
  - Section labels inside tiles become mini kicker tabs.
- **Title tile:** site title gets the full header treatment — homepage reads as the "main menu."
- **Signal/logo/static tiles:** shared hover timing and label styling only; they stay visually secondary to core tiles.

## Section 5: Motion & accessibility

- All new motion is transform-only (compositor-friendly) and uses existing easing/duration tokens.
- `prefers-reduced-motion: reduce`: sweeps become instant background swaps, underline entrance renders static, corner reveals appear without travel. Same end states, no motion.
- `:focus-visible` gold rings draw on the unclipped bounding box; clip-path must never hide focus indicators.
- Contrast: black-on-gold everywhere gold is a fill.

## Error handling

Pure CSS pass — no new JS, no new data flow. Failure modes are visual only:
- Browsers without `clip-path` support (negligible in 2026) render square edges; all content remains readable and interactive.
- No behavior change when JS is disabled; all treatments are CSS-only.

## Testing & verification

1. `npm run build` passes (schema/route validation).
2. `npm run test` passes (existing vitest suite; no JS changes expected).
3. Visual pass in dev server across `/`, `/notes`, `/showcase`, `/shelf`, and one detail page each, at mobile (375px), tablet (768px), and desktop (1280px) widths.
4. Reduced-motion spot check (emulate `prefers-reduced-motion`).
5. Keyboard-focus walk on nav pill, list items, and filter pills to confirm visible focus rings.
