# Interactive UI — Cursor & Page Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a gold dot cursor with tile hover effect and a Persona-style diagonal card + wipe page transition to ninjaruss.net.

**Architecture:** The cursor is a persisted `<div>` in BaseLayout driven by a vanilla JS module. The transition is a persisted `<canvas>` also in BaseLayout, animated with Canvas 2D, hooked into Astro's ClientRouter `astro:before-preparation` lifecycle via `event.intercept()`. Both scripts are TypeScript modules in a new `src/scripts/` directory. The existing CSS view transition animations (`::view-transition-old/new`) are removed to prevent conflicts.

**Tech Stack:** Astro 5 ClientRouter, Canvas 2D API, Vitest, TypeScript — no new npm packages.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/scripts/cursor.ts` | Cursor positioning + tile hover detection |
| Create | `src/scripts/transition.ts` | All transition logic: pure utils, drawing, phases, Astro hooks |
| Create | `src/tests/transition.test.ts` | Unit tests for exported pure functions |
| Modify | `src/layouts/BaseLayout.astro` | Add cursor div, canvas, script imports |
| Modify | `src/styles/global.css` | `cursor: none`, cursor div base styles |
| Modify | `src/styles/transitions.css` | Remove `::view-transition-old/new` animations |

---

## Task 1: Remove Conflicting View Transition Animations

**Files:**
- Modify: `src/styles/transitions.css:55-76`

The existing `::view-transition-old(root)` and `::view-transition-new(root)` CSS animations will run alongside our canvas transition and cause a visible double-transition. Replace them with `animation: none`.

- [ ] **Step 1: Replace the view transition animation rules**

In `src/styles/transitions.css`, find and replace lines 55–76 (the `::view-transition-old(root)` and `::view-transition-new(root)` blocks) with:

```css
/* Page transitions handled by canvas in BaseLayout — disable default animations */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
}
```

Keep everything else in the file (keyframe definitions, `.p3r-animate` classes, bento stagger rules) — those are used by page components and are not affected.

- [ ] **Step 2: Verify dev server still builds**

```bash
npm run dev
```

Expected: server starts, no CSS errors in console.

- [ ] **Step 3: Commit**

```bash
git add src/styles/transitions.css
git commit -m "style: disable default view transition animations in favour of canvas transition"
```

---

## Task 2: Cursor Styles and DOM Element

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add `cursor: none` and cursor div styles to `global.css`**

Open `src/styles/global.css`. Find the `body` rule and add `cursor: none`. Then append the following block anywhere after the body rule:

```css
/* ── Custom cursor ──────────────────────────────── */
body {
  cursor: none;
}

#cursor {
  position: fixed;
  width: 7px;
  height: 7px;
  background: var(--color-gold);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 8px rgba(255, 229, 44, 0.9);
  transition: width 120ms, height 120ms, box-shadow 120ms;
}

#cursor.cursor--active {
  width: 5px;
  height: 5px;
  box-shadow: 0 0 14px rgba(255, 229, 44, 1), 0 0 28px rgba(255, 229, 44, 0.4);
}

@media (hover: none) {
  #cursor { display: none; }
}
```

- [ ] **Step 2: Add cursor div to `BaseLayout.astro`**

Open `src/layouts/BaseLayout.astro`. Inside `<body>`, before the `<a href="#main-content"...>` skip link, add:

```astro
<div id="cursor" aria-hidden="true" transition:persist></div>
```

The full body open should now look like:

```astro
<body>
  <div id="cursor" aria-hidden="true" transition:persist></div>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <main id="main-content" class="page">
    <slot />
  </main>
</body>
```

- [ ] **Step 3: Verify cursor div appears**

```bash
npm run dev
```

Open `http://localhost:4321`. The default cursor should be hidden. The gold dot `#cursor` div should be visible in DevTools Elements panel.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro
git commit -m "feat: add custom cursor div and styles"
```

---

## Task 3: Cursor Script

**Files:**
- Create: `src/scripts/cursor.ts`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create `src/scripts/cursor.ts`**

```typescript
const TILE_SELECTOR =
  '.bento-tile--interactive, .logo-tile, .image-tile, .title-tile';

function init(): void {
  const dot = document.getElementById('cursor');
  if (!dot) return;

  document.addEventListener('mousemove', (e) => {
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
  });

  // Event delegation — works across navigations without rebinding
  document.addEventListener('mouseover', (e) => {
    const overTile = !!(e.target as Element).closest(TILE_SELECTOR);
    dot.classList.toggle('cursor--active', overTile);
  });
}

// Guard: module scripts deduplicate in browsers, but be explicit
if (!(window as any).__cursorInit) {
  (window as any).__cursorInit = true;
  init();
}
```

- [ ] **Step 2: Import the script in `BaseLayout.astro`**

Add the following `<script>` tag inside `<body>` in `src/layouts/BaseLayout.astro`, after the closing `</main>` tag:

```astro
<script>
  import '../scripts/cursor';
</script>
```

- [ ] **Step 3: Verify cursor behavior in browser**

```bash
npm run dev
```

Open `http://localhost:4321`. Confirm:
- Gold dot follows the mouse
- Dot shrinks and brightens when hovering any bento tile
- Dot returns to normal when leaving the tile

- [ ] **Step 4: Commit**

```bash
git add src/scripts/cursor.ts src/layouts/BaseLayout.astro
git commit -m "feat: add cursor follow and tile hover effect"
```

---

## Task 4: Transition Canvas Element

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add canvas styles to `global.css`**

Append to `src/styles/global.css`:

```css
/* ── Transition canvas ──────────────────────────── */
#transition-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
}
```

- [ ] **Step 2: Add canvas element to `BaseLayout.astro`**

Inside `<body>`, after the cursor div, add:

```astro
<canvas id="transition-canvas" aria-hidden="true" transition:persist></canvas>
```

The body should now open as:

```astro
<body>
  <div id="cursor" aria-hidden="true" transition:persist></div>
  <canvas id="transition-canvas" aria-hidden="true" transition:persist></canvas>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <main id="main-content" class="page">
    <slot />
  </main>
</body>
```

- [ ] **Step 3: Verify canvas is in the DOM**

```bash
npm run dev
```

Check DevTools — `#transition-canvas` should be present, fixed, 0×0 (no drawn content yet), above all other elements (`z-index: 1000`).

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro
git commit -m "feat: add persisted transition canvas to BaseLayout"
```

---

## Task 5: Transition Pure Utilities + Tests

**Files:**
- Create: `src/scripts/transition.ts` (pure exports only — no DOM code yet)
- Create: `src/tests/transition.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/transition.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  easeOut5,
  easeIO,
  easeInQ,
  easeRotSettle,
  easeDecel,
  accentColor,
  isSamePage,
  computeWipeGeometry,
} from '../scripts/transition';

describe('easeOut5', () => {
  it('returns 0 at t=0', () => expect(easeOut5(0)).toBe(0));
  it('returns 1 at t=1', () => expect(easeOut5(1)).toBe(1));
  it('is front-loaded: 0.5 input > 0.9 output', () => {
    expect(easeOut5(0.5)).toBeGreaterThan(0.9);
  });
  it('stays between 0 and 1 for t in (0,1)', () => {
    expect(easeOut5(0.3)).toBeGreaterThan(0);
    expect(easeOut5(0.3)).toBeLessThan(1);
  });
});

describe('easeIO', () => {
  it('returns 0 at t=0', () => expect(easeIO(0)).toBe(0));
  it('returns 0.5 at t=0.5', () => expect(easeIO(0.5)).toBe(0.5));
  it('returns 1 at t=1', () => expect(easeIO(1)).toBe(1));
  it('is symmetric: easeIO(0.3) ≈ 1 - easeIO(0.7)', () => {
    expect(easeIO(0.3)).toBeCloseTo(1 - easeIO(0.7), 10);
  });
});

describe('easeInQ', () => {
  it('returns 0 at t=0', () => expect(easeInQ(0)).toBe(0));
  it('returns 1 at t=1', () => expect(easeInQ(1)).toBe(1));
  it('is back-loaded: 0.5 input < 0.1 output', () => {
    expect(easeInQ(0.5)).toBeLessThan(0.1);
  });
});

describe('easeRotSettle', () => {
  it('returns 0 at t=0', () => expect(easeRotSettle(0)).toBe(0));
  it('returns 1 at t=1', () => expect(easeRotSettle(1)).toBe(1));
  it('is slower than easeOut5 at midpoint', () => {
    expect(easeRotSettle(0.5)).toBeLessThan(easeOut5(0.5));
  });
});

describe('easeDecel', () => {
  it('returns ~0 at t=0', () => expect(easeDecel(0)).toBeCloseTo(0, 5));
  it('returns ~1 at t=1', () => expect(easeDecel(1)).toBeCloseTo(1, 5));
  it('covers 88% of distance in first 55% of time', () => {
    expect(easeDecel(0.55)).toBeCloseTo(0.88, 2);
  });
  it('output increases monotonically', () => {
    expect(easeDecel(0.3)).toBeLessThan(easeDecel(0.6));
    expect(easeDecel(0.6)).toBeLessThan(easeDecel(0.9));
  });
});

describe('accentColor', () => {
  it('returns blue for /novel', () => {
    expect(accentColor('/novel')).toBe('#7a8fff');
  });
  it('returns blue for /novel/characters/rain', () => {
    expect(accentColor('/novel/characters/rain')).toBe('#7a8fff');
  });
  it('returns gold for /', () => {
    expect(accentColor('/')).toBe('#ffe52c');
  });
  it('returns gold for /shelf', () => {
    expect(accentColor('/shelf')).toBe('#ffe52c');
  });
  it('returns gold for /notes/live-without-regret', () => {
    expect(accentColor('/notes/live-without-regret')).toBe('#ffe52c');
  });
  it('returns gold for /showcase', () => {
    expect(accentColor('/showcase')).toBe('#ffe52c');
  });
});

describe('isSamePage', () => {
  it('returns true for identical pathnames', () => {
    expect(isSamePage('/shelf', '/shelf')).toBe(true);
  });
  it('returns false for different pathnames', () => {
    expect(isSamePage('/shelf', '/notes')).toBe(false);
  });
  it('returns false for / vs /shelf', () => {
    expect(isSamePage('/', '/shelf')).toBe(false);
  });
});

describe('computeWipeGeometry', () => {
  it('slant increases with H', () => {
    const a = computeWipeGeometry(1000, 500);
    const b = computeWipeGeometry(1000, 1000);
    expect(b.slant).toBeGreaterThan(a.slant);
  });
  it('travel is larger than W', () => {
    const { travel } = computeWipeGeometry(1440, 900);
    expect(travel).toBeGreaterThan(1440);
  });
  it('slabW = W * 0.28 + slant', () => {
    const W = 1440, H = 900;
    const { slant, slabW } = computeWipeGeometry(W, H);
    expect(slabW).toBeCloseTo(W * 0.28 + slant, 10);
  });
  it('slant is positive', () => {
    const { slant } = computeWipeGeometry(1440, 900);
    expect(slant).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm run test -- --reporter=verbose src/tests/transition.test.ts
```

Expected: all tests FAIL with "Cannot find module '../scripts/transition'".

- [ ] **Step 3: Create `src/scripts/transition.ts` with pure exports**

```typescript
// ── Easing functions ─────────────────────────────────────────────────────────

export const easeOut5 = (t: number): number => 1 - Math.pow(1 - t, 5);

export const easeIO = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeInQ = (t: number): number => t * t * t * t;

export const easeRotSettle = (t: number): number => 1 - Math.pow(1 - t, 2.2);

export const easeDecel = (t: number): number => {
  if (t < 0.55) return easeOut5(t / 0.55) * 0.88;
  return 0.88 + easeIO((t - 0.55) / 0.45) * 0.12;
};

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Card + wipe accent color keyed to destination pathname. */
export function accentColor(pathname: string): string {
  return pathname.startsWith('/novel') ? '#7a8fff' : '#ffe52c';
}

/** Guard: skip transition when navigating to the current page. */
export function isSamePage(from: string, to: string): boolean {
  return from === to;
}

/**
 * Wipe slab geometry at -8°.
 * slabW: total parallelogram width (viewport fraction + skew compensation)
 * slant: horizontal offset caused by the angle across full height
 * travel: total distance the slab lead edge must travel to clear the screen
 */
export function computeWipeGeometry(
  W: number,
  H: number
): { slant: number; slabW: number; travel: number } {
  const WIPE_ANGLE = -8 * Math.PI / 180;
  const slant = H * Math.tan(Math.abs(WIPE_ANGLE));
  const slabW = W * 0.28 + slant;
  const travel = W + slabW + slant * 2;
  return { slant, slabW, travel };
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm run test -- --reporter=verbose src/tests/transition.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/transition.ts src/tests/transition.test.ts
git commit -m "feat: add transition pure utilities with tests"
```

---

## Task 6: Card and Wipe Drawing Functions

**Files:**
- Modify: `src/scripts/transition.ts`

These functions are not unit-tested (Canvas 2D has no test-friendly output). Visual verification happens in Task 9.

- [ ] **Step 1: Append canvas state and drawing functions to `src/scripts/transition.ts`**

Add the following after the existing exports:

```typescript
// ── Canvas module state ───────────────────────────────────────────────────────

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let W = 0;
let H = 0;

function initCanvas(): void {
  canvas = document.getElementById('transition-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas(): void {
  if (!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

function roundRect(
  c: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

function drawCard(
  cx: number, cy: number, cw: number, ch: number,
  rot: number, color: string, alpha: number
): void {
  if (!ctx || alpha <= 0) return;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;

  ctx.shadowColor = `rgba(${r},${g},${b},0.55)`;
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 8;

  const grad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch * 0.3);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(0.25, color);
  grad.addColorStop(1, `rgba(${r},${g},${b},0.88)`);
  ctx.fillStyle = grad;
  roundRect(ctx, -cw / 2, -ch / 2, cw, ch, 7);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const sheen = ctx.createLinearGradient(-cw / 2, -ch / 2, cw * 0.1, ch * 0.15);
  sheen.addColorStop(0, 'rgba(255,255,255,0.4)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  roundRect(ctx, -cw / 2, -ch / 2, cw, ch, 7);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, -cw / 2 + 5, -ch / 2 + 5, cw - 10, ch - 10, 4);
  ctx.stroke();

  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.font = `${cw * 0.36}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('☆', 0, -ch * 0.06);

  ctx.shadowBlur = 0;
  ctx.font = `${cw * 0.095}px monospace`;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillText('THE FOOL', 0, ch * 0.34);

  ctx.restore();
}

function drawWipe(leadX: number, color: string): void {
  if (!ctx) return;
  const WIPE_ANGLE = -8 * Math.PI / 180;
  const { slant, slabW } = computeWipeGeometry(W, H);

  ctx.save();
  ctx.transform(1, 0, Math.tan(WIPE_ANGLE), 1, 0, 0);

  ctx.fillStyle = color;
  ctx.globalAlpha = 0.14;
  ctx.fillRect(leadX - slabW - slabW * 0.18, 0, slabW * 0.18, H);

  ctx.globalAlpha = 1;
  ctx.fillRect(leadX - slabW, 0, slabW, H);

  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(leadX - 2, 0, 2, H);

  ctx.restore();
}
```

- [ ] **Step 2: Confirm tests still pass (no regressions)**

```bash
npm run test -- --reporter=verbose src/tests/transition.test.ts
```

Expected: all tests still PASS (the new code is not imported by tests).

- [ ] **Step 3: Commit**

```bash
git add src/scripts/transition.ts
git commit -m "feat: add card and wipe drawing functions"
```

---

## Task 7: Animation Phase Functions

**Files:**
- Modify: `src/scripts/transition.ts`

- [ ] **Step 1: Append phase constants and `cardPhase` to `src/scripts/transition.ts`**

```typescript
// ── Animation constants ───────────────────────────────────────────────────────

const T_IN         = 520;              // ms — card entry + rotation settle
const T_HOLD       = 340;              // ms — card bob/sway at rest
const T_WIPE       = 620;              // ms — wipe sweeps, card exits
const ENTRY_ANGLE  = -18 * Math.PI / 180;  // card entry path angle
const REST_ROT     = -0.14;           // -8° — card resting rotation

// ── Phase: card entry + hold ──────────────────────────────────────────────────

/**
 * Animates card entering from top-left and holding at rest.
 * Resolves after T_IN + T_HOLD ms.
 */
function cardPhase(color: string): Promise<void> {
  return new Promise((resolve) => {
    if (!ctx) { resolve(); return; }

    const cw = Math.min(136, W * 0.145);
    const ch = cw * 1.4;
    const restX = W * 0.5;
    const restY = H * 0.455;

    // Entry start: off-screen top-left, positioned along the -18° diagonal
    const startX = -cw * 1.5;
    const startY = restY - (restX - startX) * Math.tan(Math.abs(ENTRY_ANGLE));

    let startTs: number | null = null;

    function tick(ts: number): void {
      if (!ctx) { resolve(); return; }
      if (startTs === null) startTs = ts;
      const elapsed = ts - startTs;

      ctx.clearRect(0, 0, W, H);

      if (elapsed < T_IN) {
        const p   = elapsed / T_IN;
        const ep  = easeDecel(p);        // position: fast lunge then slow settle
        const rp  = easeRotSettle(p);    // rotation: slower, settle is visible
        const cx  = startX + (restX - startX) * ep;
        const cy  = startY + (restY - startY) * ep;
        const rot = ENTRY_ANGLE + (REST_ROT - ENTRY_ANGLE) * rp;
        drawCard(cx, cy, cw, ch, rot, color, Math.min(1, p * 8));
        requestAnimationFrame(tick);
      } else if (elapsed < T_IN + T_HOLD) {
        const p    = (elapsed - T_IN) / T_HOLD;
        const bob  = Math.sin(p * Math.PI) * 2.2;
        const sway = Math.sin(p * Math.PI * 0.65) * 0.006;
        drawCard(restX, restY + bob, cw, ch, REST_ROT + sway, color, 1);
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
        resolve();
      }
    }

    requestAnimationFrame(tick);
  });
}
```

- [ ] **Step 2: Append `startWipe` to `src/scripts/transition.ts`**

```typescript
// ── Phase: wipe sweep + card exit ────────────────────────────────────────────

/**
 * Sweeps the diagonal wipe across the screen while the card exits right.
 * Calls `onMidpoint` once when the wipe lead edge passes W*0.48 — this is
 * the signal for Astro to proceed with the DOM swap.
 * Resolves when the wipe is fully off-screen and canvas is cleared.
 */
function startWipe(color: string, onMidpoint: () => void): Promise<void> {
  return new Promise((resolve) => {
    if (!ctx) { resolve(); return; }

    const cw = Math.min(136, W * 0.145);
    const ch = cw * 1.4;
    const restX = W * 0.5;
    const restY = H * 0.455;
    const { slant, travel } = computeWipeGeometry(W, H);

    let startTs: number | null = null;
    let midpointFired = false;

    function tick(ts: number): void {
      if (!ctx) { resolve(); return; }
      if (startTs === null) startTs = ts;
      const elapsed = Math.min(ts - startTs, T_WIPE);
      const p      = elapsed / T_WIPE;
      const ep     = easeIO(p);
      const leadX  = ep * travel - slant;

      ctx.clearRect(0, 0, W, H);
      drawWipe(leadX, color);

      // Card drifts right, tilts back past entry angle as wipe sweeps it away
      const exitX  = restX + ep * W * 0.6;
      const exitY  = restY - ep * H * 0.06;
      const rot    = REST_ROT + ep * (ENTRY_ANGLE * 1.8 - REST_ROT);
      const alpha  = 1 - easeInQ(Math.max(0, (p - 0.32) / 0.68));
      drawCard(exitX, exitY, cw, ch, rot, color, alpha);

      if (!midpointFired && leadX > W * 0.48) {
        midpointFired = true;
        onMidpoint();
      }

      if (elapsed < T_WIPE) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
        resolve();
      }
    }

    requestAnimationFrame(tick);
  });
}
```

- [ ] **Step 3: Confirm tests still pass**

```bash
npm run test -- --reporter=verbose src/tests/transition.test.ts
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/transition.ts
git commit -m "feat: add cardPhase and startWipe animation functions"
```

---

## Task 8: Astro Lifecycle Integration

**Files:**
- Modify: `src/scripts/transition.ts`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Append the `init` function to `src/scripts/transition.ts`**

```typescript
// ── Astro lifecycle ───────────────────────────────────────────────────────────

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function init(): void {
  // Guard: browsers deduplicate module scripts by URL, but be explicit
  if ((window as any).__transitionInit) return;
  (window as any).__transitionInit = true;

  initCanvas();

  document.addEventListener('astro:before-preparation', (event: Event) => {
    const e = event as any;
    const fromPath: string = e.from?.pathname ?? window.location.pathname;
    const toPath: string   = e.to?.pathname   ?? '';

    if (isSamePage(fromPath, toPath)) return;
    if (prefersReducedMotion()) return;
    if (!canvas || !ctx) return;

    const color = accentColor(toPath);

    e.intercept(async () => {
      // Phase 1: card entry + hold (T_IN + T_HOLD ms)
      await cardPhase(color);

      // Phase 2: wipe start + page load in parallel.
      // The wipe resolves onMidpoint (a promise gate) when leadX passes W*0.48.
      // The intercept resolves once BOTH the gate AND the loader complete —
      // at that point Astro swaps the DOM while the wipe is still running.
      let resolveSwap!: () => void;
      const swapGate = new Promise<void>((r) => { resolveSwap = r; });

      startWipe(color, resolveSwap);          // runs in background via rAF
      await Promise.all([swapGate, e.loader()]); // wait for midpoint + fetch
      // → intercept returns; Astro swaps DOM under the wipe cover
    });
  });
}

init();
```

- [ ] **Step 2: Import the transition script in `BaseLayout.astro`**

Add a second `<script>` import in `src/layouts/BaseLayout.astro`, after the cursor import:

```astro
<script>
  import '../scripts/cursor';
</script>
<script>
  import '../scripts/transition';
</script>
```

- [ ] **Step 3: Run the dev server and trigger a navigation**

```bash
npm run dev
```

Open `http://localhost:4321`. Click any internal link (e.g., the Notes tile). Confirm:
- The gold dot cursor is still present
- The tarot card animates in from the top-left
- Card settles at roughly -8° tilt
- Wipe sweeps left-to-right at -8°
- Page content changes mid-wipe
- New page is revealed as the wipe trailing edge passes
- Canvas clears cleanly after the transition

- [ ] **Step 4: Test the novel page (blue accent)**

Navigate to `/novel`. Confirm:
- Card and wipe are blue (`#7a8fff`) instead of gold

- [ ] **Step 5: Test reduced motion**

In Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`. Click an internal link. Confirm: immediate page swap, no canvas animation.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/transition.ts src/layouts/BaseLayout.astro
git commit -m "feat: wire page transition to Astro ClientRouter lifecycle"
```

---

## Task 9: Full Integration Verification + Build Check

- [ ] **Step 1: Run the full test suite**

```bash
npm run test
```

Expected: all existing tests pass plus new transition tests pass. No regressions.

- [ ] **Step 2: Run a production build**

```bash
npm run build
```

Expected: build completes with no errors or TypeScript complaints.

- [ ] **Step 3: Preview the production build**

```bash
npm run preview
```

Open `http://localhost:4321`. Repeat the navigation checks from Task 8 Step 3-5 against the production build.

- [ ] **Step 4: Check same-page guard**

Click the currently-active nav link (e.g., click Notes while on Notes). Confirm: no transition fires.

- [ ] **Step 5: Check browser back/forward**

Navigate forward to a few pages, then use the browser back button. Confirm: transition fires on back navigation too (same `astro:before-preparation` hook handles it).

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete interactive UI — cursor and page transition"
```
