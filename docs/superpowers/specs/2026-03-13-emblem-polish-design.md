# Emblem Polish & Consistency Design

**Date:** 2026-03-13
**Status:** Approved
**Scope:** EmblemCard visual polish + consistency across all surfaces

---

## Context

The site's EmblemCard component is used across multiple surfaces (SplitView panel, mobile badge, Favorites grid/detail, Related Content) but with inconsistent visual treatment and behavior. Related Content uses a plain static `<img>` while all other contexts use the interactive EmblemCard. The card face itself lacks visual depth — flat border, no backdrop treatment, generic glow — which undersells the P4G aesthetic.

Goals:
1. Polish the EmblemCard to feel premium and distinctively P4G
2. Unify all emblem surfaces under one component with canonical size tokens
3. Introduce a cinematic auto-flip reveal on page enter

---

## Section 1: Card Face Redesign

### Changes to `EmblemCard.astro`

**Geometric inset frame**
Add an `::before` pseudo-element to `.emblem-card__inner` at `inset: 6px` with `border: 1px solid rgba(255, 229, 44, 0.25)` and matching `border-radius`. This creates a thin gold rule inside the card edge — a structural framing device.

**Corner gradient overlay**
Add an `::after` pseudo-element to `.emblem-card__inner` with diagonal radial gradients at two corners (`rgba(255,229,44,0.15)` → transparent) for subtle corner luminance.

**Radial glow backdrop behind emblem**
Add a `.emblem-bg` div (absolute, centered, ~110px circle) with `radial-gradient(circle, rgba(255,229,44,0.12) 0%, transparent 70%)`. This lifts the emblem SVG off the flat black face.

**Emblem drop-shadow**
Apply `filter: drop-shadow(0 0 8px rgba(255,229,44,0.5)) drop-shadow(0 0 3px rgba(255,229,44,0.8))` to the emblem `<img>` element.

**Breathing glow pulse (idle)**
CSS `@keyframes pulse` animation on `box-shadow` of `.emblem-card__inner`: alternates between `0 0 20px rgba(255,229,44,0.12)` and `0 0 35px rgba(255,229,44,0.22)` over 3s ease-in-out infinite. This is intentionally kept active under `prefers-reduced-motion` because it involves only `box-shadow` (no transform), making it a safe decorative exception.

**Shimmer — two distinct behaviors:**
- **Periodic shimmer** (`.emblem-shimmer` div, `@keyframes shimmer`): fires every 4s with a 1.5s initial delay. An absolutely-positioned div traverses the card face via `left: -100% → 140%` using a diagonal `linear-gradient` of `rgba(255,229,44,0.06)`. Disabled under `prefers-reduced-motion`.
- **Hover shimmer** (`@keyframes shimmer-once`): fires once on mouse enter (0.6s duration). Applied via `:hover .emblem-shimmer` overriding the periodic animation. The periodic animation resumes after mouse leave. These are the same `.emblem-shimmer` element, switching between two named `@keyframes` on hover.

### Canonical Size Tokens

Add a `size` prop to `EmblemCard.astro`: `'xs' | 'sm' | 'md'` (default `'md'`). Rendered as `data-size={size}` on the root `.emblem-card` element.

| Token | Max-width | Usage |
|-------|-----------|-------|
| `xs`  | 60px      | SplitView mobile badge |
| `sm`  | 120px     | Related Content thumbnails |
| `md`  | 240px     | SplitView desktop panel, Favorites grid, Favorites detail |

**JS suppression for `xs`:** Inside `initEmblemTilt()` and `initEmblemFloat()` in `EmblemCard.astro`'s `<script>`, check `card.dataset.size === 'xs'` and return early. This prevents importing tilt/float behavior on the small badge where it would be imperceptible.

The inset frame, radial glow, and shimmer scale naturally with card dimensions via percentage units where possible.

---

## Section 2: Animation Polish

### Flip easing — three application sites

The spring easing must be applied in **all three** places that set a flip transition:

1. **CSS in `EmblemCard.astro`** — the `.emblem-card__flipper` transition property (used for simple class-toggle flips):
   - **Before:** `cubic-bezier(0.4, 0, 0.2, 1) 600ms`
   - **After:** `cubic-bezier(0.34, 1.56, 0.64, 1) 550ms`

2. **Inline `style.transition` in `src/utils/splitView/emblemAnimation.ts`** — `triggerEmblemFlip()` hardcodes its own transition string (overrides CSS). This must also be updated to `cubic-bezier(0.34, 1.56, 0.64, 1) 550ms`. Failure to update this site means SplitView-triggered flips will not use the spring easing.

3. **Inline `style.transition` reset in `handleMouseLeave` in `EmblemCard.astro`** (tilt cleanup handler) — resets the flipper's transition after a hover interaction with the old hardcoded string. Must be updated to `cubic-bezier(0.34, 1.56, 0.64, 1) 550ms`. If missed, any flip triggered after a hover interaction will use the old easing.

Note: There is also a `.emblem-card { transition: transform 600ms... }` rule governing the float container's `translateY` fallback. This governs the float, **not** the flip — leave it unchanged.

### Auto-flip on page enter

**Definition:** The card starts back-face-up, then automatically flips to reveal the emblem as a cinematic entrance — using the same spring easing.

**Integration with existing `triggerEmblemFlip()`:**
The existing `triggerEmblemFlip(doc, skipAnimation)` in `emblemAnimation.ts` drives SplitView flips. The `skipAnimation=true` path (used on `isFirstLoad` in `contentLoader.ts`) currently adds `is-flipped` instantly. This is the path to modify:

- Rename the parameter from `skipAnimation` to `instant: boolean`.
- In `emblemAnimation.ts`: when `instant=false`, wait ~300ms then fire the spring-easing flip; when `instant=true`, flip immediately (existing behavior).
- In `contentLoader.ts`, the call changes from `triggerEmblemFlip(doc, isFirstLoad)` to `triggerEmblemFlip(doc, !isFirstLoad)`:
  - First load (`isFirstLoad=true`): passes `instant=false` → cinematic 300ms delayed flip
  - Subsequent selections (`isFirstLoad=false`): passes `instant=true` → immediate flip (unchanged)

**Favorites detail page** (`src/pages/favorites/[...slug].astro`):
- Replace `isInitiallyFlipped={true}` with a client-side `<script>` that fires on `astro:page-load` (to work with Astro's View Transitions ClientRouter): `setTimeout(() => card.classList.add('is-flipped'), 300)`.
- The 300ms is measured from `astro:page-load`, **not** `DOMContentLoaded`. This ensures the flip starts after the `.p3r-animate` stagger entrance (the emblem wrapper has `--stagger-delay: 50ms`), so the card is visible and positioned before the flip fires (~250ms after the card's entrance animation).

### Tilt on hover
Existing tilt remains. Add:
- `box-shadow` intensifies on hover: `0 0 40px rgba(255,229,44,0.3), 6px 6px 0 rgba(255,229,44,0.2)`
- Hover shimmer fires once on mouse enter (see shimmer section above)

### Idle float with synced shadow
The existing float is entirely **JS-driven** via `requestAnimationFrame` using the `--float-y` CSS custom property. To sync shadow breathing:

- In the `animateFloat()` RAF loop in `EmblemCard.astro`'s script, alongside setting `--float-y`, also set a `--float-glow` custom property: `0` at bottom, `1` at peak (derived from the same sine value).
- In CSS: `box-shadow: 0 0 calc(20px + var(--float-glow, 0) * 15px) rgba(255,229,44,calc(0.12 + var(--float-glow, 0) * 0.1))`.
- Do **not** use CSS `@keyframes` for this — keep it JS-driven alongside `--float-y`.

### `prefers-reduced-motion`
- Disables: flip transition (instant), float translateY (`--float-y` stays 0), tilt transform, periodic shimmer, hover shimmer
- Keeps: glow pulse `@keyframes` on `box-shadow` (intentional — shadow-only, no transform, acceptable exception per design decision)

---

## Section 3: Consistency Rollout

### Flip behavior per context

| Context | Behavior | Reasoning |
|---------|----------|-----------|
| SplitView desktop panel | Auto-flip on first load (~300ms delay via updated `skipAnimation` path in `contentLoader.ts`) | Cinematic reveal on page load |
| SplitView mobile badge | Same — shares `triggerEmblemFlip` path | Matches desktop |
| Favorites grid | `isInitiallyFlipped=true`, no entrance animation | Grid scanning — emblems visible immediately |
| Favorites detail | Auto-flip on `astro:page-load` + 300ms delay | Detail page is an event; emblem reveal is the hero moment |
| Related Content | Always shows emblem, no flip | Navigation element — identify quickly |

### Related Content (`RelatedContent.astro`)

Replace the static `<img>` thumbnail with a styled emblem div that replicates the card face treatment at `sm` size. This is **not** the full `EmblemCard` component (avoids importing 3D/JS machinery into a nav context) — it's a lightweight CSS-only replica:

- `aspect-ratio: 63/88`, `background: #0d0d0d`
- `::before` inset frame at `inset: 4px`
- `.emblem-bg` radial glow div (absolute, centered)
- Emblem `<img>` with `filter: drop-shadow(0 0 5px rgba(255,229,44,0.45))`
- No tilt, no float, no flip, no lightbox
- **No-emblem fallback:** if `entry.data.emblem` is undefined, use `/images/emblems/default.svg` (consistent with how `EmblemCard.astro` handles a missing `emblemSrc`). The styled div always renders.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/EmblemCard.astro` | Add `size` prop + `data-size` attr; inset frame; radial glow; emblem drop-shadow; periodic + hover shimmer; glow pulse; spring flip easing (CSS); `--float-glow` in RAF loop; tilt glow boost; `xs` JS suppression |
| `src/utils/splitView/emblemAnimation.ts` | Update inline `style.transition` to spring easing; update `skipAnimation=true` path to trigger delayed cinematic flip (~300ms) instead of instant flip |
| `src/utils/splitView/contentLoader.ts` | Update `isFirstLoad` call to `triggerEmblemFlip` to pass new delayed-flip flag |
| `src/components/RelatedContent.astro` | Replace static `<img>` with styled emblem div (card face treatment, css-only) |
| `src/pages/favorites/[...slug].astro` | Remove `isInitiallyFlipped={true}`; add `astro:page-load` + 300ms auto-flip script |

---

## Verification

1. `npm run dev` — visit `/media`, wait for page load, confirm emblem auto-flips ~300ms after the SplitView content appears
2. Select a different entry in SplitView — confirm emblem does NOT re-flip (flip only on first load)
3. Visit `/notes` and `/showcase` — same first-load auto-flip
4. Visit `/favorites` — emblems show immediately with no flip animation; hover shows glow/shimmer
5. Visit a `/favorites/[slug]` — emblem auto-flips ~300ms after `astro:page-load`
6. Open any detail page with related content — emblem thumbnails show inset frame + radial glow treatment
7. Resize to **≤1200px** viewport — confirm mobile badge (60px) auto-flips on page load; confirm no tilt/float on badge
8. Enable `prefers-reduced-motion` in OS settings — confirm no transforms fire anywhere; confirm glow pulse still animates
9. `npm run build` — confirm no TypeScript errors on the new `size` prop
