# Interactive UI — Cursor & Page Transition Design

**Date:** 2026-05-25
**Status:** Approved

---

## Overview

Two focused interactive additions to ninjaruss.net:

1. **Custom cursor** — gold dot that responds to tile hover
2. **Page transition** — Persona-style diagonal card entry followed by a diagonal wipe

Neither requires Three.js. Both use Canvas 2D (transition) and CSS/JS (cursor). The scope was deliberately narrowed from an initial Three.js exploration after establishing that the homepage's existing CSS tilt, glow, and animation system already covers what Three.js would add for tile interaction.

---

## Feature 1: Custom Cursor

### Behavior

- `cursor: none` applied to `body` globally
- A single `<div id="cursor">` fixed to the page, positioned via JS `mousemove`
- **Default state:** 7px circle, `#ffe52c` (gold), subtle glow (`box-shadow: 0 0 8px rgba(255,229,44,0.9)`)
- **Hover state** (over any interactive tile): shrinks to 5px, glow intensifies (`0 0 14px rgba(255,229,44,1), 0 0 28px rgba(255,229,44,0.4)`)
- No ring, no trail, no other states

### Implementation

- Cursor `<div>` added once in `BaseLayout.astro` (persists across view transitions)
- Inline `<script>` in BaseLayout handles `mousemove` positioning
- Tile hover detection: `mouseenter`/`mouseleave` on `.bento-tile--interactive`, `.logo-tile`, `.image-tile`, `.title-tile` adds/removes `.cursor--over-tile` class
- CSS transitions on `width`, `height`, `box-shadow` at 120ms for snap feel
- `pointer-events: none` on the cursor element

### Accessibility

- No functional impact — purely visual
- Hidden from screen readers (no ARIA role)
- On touch devices (`hover: none` media query), cursor div is hidden entirely

---

## Feature 2: Page Transition

### Visual Design

A tarot card enters the screen before a diagonal wipe sweeps across, replacing one page with another. Card and wipe share the same diagonal language.

**Angles:**
- Card entry path: -18° (along the wipe diagonal)
- Card rest rotation: -8° (settled, readable as a card at rest)
- Wipe angle: -8° (unified with card rest angle)

**Colors:** Card and wipe color match destination page accent:
- Most pages: `#ffe52c` (gold)
- Novel pages (`/novel`, `/novel/[...slug]`): `#7a8fff` (blue)

### Animation Sequence

| Phase | Duration | What happens |
|-------|----------|--------------|
| Entry | 520ms | Card enters from top-left off-screen, traveling along -18° diagonal path. Position eases with steep deceleration (`easeDecel`). Rotation eases separately and more slowly (`easeRotSettle`) from -18° down to -8°, so the "settling" is visibly distinct from the travel. Alpha fades in quickly. |
| Hold | 340ms | Card rests at center (`W*0.5`, `H*0.455`). Gentle vertical bob (`sin` wave, ±2.2px) and slight rotation sway (±0.006 rad). |
| Wipe | 620ms | Diagonal slab sweeps left-to-right at -8°. Card drifts right ahead of the wipe, rotating back past -18° as it's swept away. Card alpha fades out from 32% progress onward. Content swap happens when wipe lead edge crosses `W*0.48`. New page fades in as wipe trailing edge reveals it. |

**Total:** ~1,480ms

### Wipe Geometry

```
WIPE_ANGLE = -8° = -0.14 rad
SLANT      = H * tan(8°)          // horizontal offset caused by angle
SLAB_W     = W * 0.28 + SLANT     // total slab width including skew
TRAVEL     = W + SLAB_W + SLANT*2 // full travel distance off screen
```

The slab is drawn using a 2D shear transform (`ctx.transform(1, 0, tan(angle), 1, 0, 0)`) so it renders as a true parallelogram without perspective distortion.

A soft shadow slab (14% opacity, 18% of SLAB_W wide) precedes the main slab. A 2px white leading edge line marks the slab boundary.

### Card

```
CW = min(136, W * 0.145)   // width, scales with viewport
CH = CW * 1.4              // height (same aspect ratio as transition card)
```

Card appearance:
- Linear gradient fill: white → accent color → accent color at 88% opacity
- Top-left radial highlight sheen (rgba white, 40% → 0%)
- Inner border inset 5px, white at 22% opacity
- Centered `☆` glyph, `THE FOOL` arcana label at bottom
- Drop shadow + colored glow matching accent

### Easing Functions

```js
easeOut5     = t => 1 - (1-t)^5         // position: fast lunge
easeRotSettle = t => 1 - (1-t)^2.2      // rotation: slower settle (card visibly comes to rest)
easeIO       = t => cubic ease-in-out   // wipe sweep
easeInQ      = t => t^4                 // card exit alpha fade
easeDecel    = t => easeOut5 first 55%, then easeIO remainder
               // moves 88% of distance in first 55% of time, then settles
```

### Implementation

**Canvas element:** A single `<canvas id="transition-canvas">` in `BaseLayout.astro`:
- `position: fixed; inset: 0; pointer-events: none; z-index: 1000`
- Above all page content, below nothing
- Persists across navigations (no re-render on view transition)

**Astro integration:** Hook into the ClientRouter lifecycle:
- `astro:before-preparation` — intercept navigation, fire transition animation, resolve when animation reaches the content-swap point
- `astro:page-load` — clean up canvas at end of transition

The existing ClientRouter slide animations are disabled. The transition canvas handles the visual change entirely.

**Trigger scope:** All in-site `<a>` clicks that Astro's ClientRouter would handle, including browser back/forward. All navigation uses the same full transition.

**Reduced motion:** When `prefers-reduced-motion: reduce`, skip transition entirely. Page swaps instantly.

**Same-page guard:** If destination URL matches current URL, no transition fires.

---

## Files Affected

| File | Change |
|------|--------|
| `src/layouts/BaseLayout.astro` | Add `#cursor` div, `#transition-canvas`, cursor script, transition module import |
| `src/styles/global.css` | Add `body { cursor: none }`, cursor div base styles |
| `src/scripts/cursor.ts` | New — cursor positioning and tile hover detection |
| `src/scripts/transition.ts` | New — full transition animation, Astro lifecycle hooks, easing functions, card draw, wipe draw |

The transition logic is self-contained in `transition.ts` with no external dependencies. Canvas 2D only — no Three.js, no additional npm packages.

---

## Out of Scope

- Three.js on the homepage (CSS tilt/glow system already handles tile interaction)
- Novel page canvas upgrade (decided not to pursue)
- Background geometric overlays on any page (slashes, brackets, diamonds — rejected during design)
- Cursor ring or trail effects
