# Card Transition Emblems Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `☆` / `THE FOOL` on the page-transition card with per-route stat emblems (PNG) and names drawn from the stream stat system.

**Architecture:** All changes are confined to two files — `src/scripts/transition.ts` (data table, new exports, updated draw logic) and `src/tests/transition.test.ts` (replace `accentColor` tests, add new tests). A `STAT_CARDS` lookup table and `ROUTE_STATS` prefix list drive a new `statForPath()` export that replaces `accentColor()`. Emblem PNGs are pre-loaded at `init()` time; `drawCard()` receives the loaded image and stat name as arguments.

**Tech Stack:** TypeScript, Canvas 2D API, Vitest

---

## Files

| File | Change |
|---|---|
| `src/scripts/transition.ts` | Add data table, `statForPath`, `computeTextFit`, image preload; update `drawCard`, `cardPhase`, `startWipe`, `init` |
| `src/tests/transition.test.ts` | Remove `accentColor` tests; add `statForPath` and `computeTextFit` tests |

---

## Task 1: Add `statForPath` and `computeTextFit` exports (TDD)

**Files:**
- Modify: `src/scripts/transition.ts`
- Modify: `src/tests/transition.test.ts`

- [ ] **Step 1: Replace `accentColor` tests with failing tests for `statForPath` and `computeTextFit`**

Open `src/tests/transition.test.ts`. Replace the entire `describe('accentColor', ...)` block (lines 62–81) with the following two describe blocks. Leave all other tests untouched.

```ts
describe('statForPath', () => {
  it('returns Insight for /notes', () => {
    expect(statForPath('/notes').color).toBe('#4ab0ff');
    expect(statForPath('/notes').name).toBe('INSIGHT');
  });
  it('returns Insight for /notes/slug', () => {
    expect(statForPath('/notes/live-without-regret').color).toBe('#4ab0ff');
  });
  it('returns Expression for /novel', () => {
    expect(statForPath('/novel').color).toBe('#a855f7');
    expect(statForPath('/novel').name).toBe('EXPRESSION');
  });
  it('returns Expression for /novel/characters/rain', () => {
    expect(statForPath('/novel/characters/rain').color).toBe('#a855f7');
  });
  it('returns Sincerity for /shelf', () => {
    expect(statForPath('/shelf').color).toBe('#ffe52c');
    expect(statForPath('/shelf').name).toBe('SINCERITY');
  });
  it('returns Sincerity for /shelf/slug', () => {
    expect(statForPath('/shelf/some-anime').color).toBe('#ffe52c');
  });
  it('returns Chaos for /stream', () => {
    expect(statForPath('/stream').color).toBe('#2dd4bf');
    expect(statForPath('/stream').name).toBe('CHAOS');
  });
  it('returns Determination for /showcase', () => {
    expect(statForPath('/showcase').color).toBe('#ff4040');
    expect(statForPath('/showcase').name).toBe('DETERMINATION');
  });
  it('returns Sincerity for /now', () => {
    expect(statForPath('/now').color).toBe('#ffe52c');
    expect(statForPath('/now').name).toBe('SINCERITY');
  });
  it('returns Sincerity for /', () => {
    expect(statForPath('/').color).toBe('#ffe52c');
  });
  it('does not match /nowhere as /now', () => {
    expect(statForPath('/nowhere').color).toBe('#ff4040'); // fallback: Determination
  });
  it('returns Determination fallback for unknown route', () => {
    expect(statForPath('/unknown/deep/path').color).toBe('#ff4040');
    expect(statForPath('/unknown/deep/path').name).toBe('DETERMINATION');
  });
  it('img is null in test environment (images never preloaded)', () => {
    expect(statForPath('/shelf').img).toBeNull();
  });
});

describe('computeTextFit', () => {
  // Mock ctx: measureText returns text.length * 8 per char (predictable math)
  const mockCtx = {
    font: '',
    measureText: (text: string) => ({ width: text.length * 8 }),
  } as unknown as CanvasRenderingContext2D;

  it('returns basePx when text fits within maxWidth', () => {
    // 'CHAOS' = 5 chars * 8 = 40px, maxWidth 100 → fits at basePx 7
    expect(computeTextFit(mockCtx, 'CHAOS', 100, 7)).toBe(7);
  });
  it('returns reduced size when text exceeds maxWidth', () => {
    // 'DETERMINATION' = 13 chars * 8 = 104px, maxWidth 76 → must shrink
    const size = computeTextFit(mockCtx, 'DETERMINATION', 76, 7);
    expect(size).toBeLessThan(7);
    expect(size).toBeGreaterThanOrEqual(5);
  });
  it('never returns below 5', () => {
    // tiny maxWidth forces it to floor
    const size = computeTextFit(mockCtx, 'DETERMINATION', 1, 7);
    expect(size).toBe(5);
  });
});
```

Update the import line at the top of the test file to include the new exports:

```ts
import {
  easeOut5,
  easeIO,
  easeInQ,
  easeRotSettle,
  easeDecel,
  statForPath,
  computeTextFit,
  isSamePage,
  computeWipeGeometry,
} from '../scripts/transition';
```

- [ ] **Step 2: Run tests — confirm new tests fail, existing pass**

```bash
npm run test
```

Expected: `statForPath` and `computeTextFit` tests fail with "not a function" / import errors. All easing/geometry/isSamePage tests still pass.

- [ ] **Step 3: Add data structures, `statForPath`, `computeTextFit`, and `loadedImages` to `transition.ts`**

In `src/scripts/transition.ts`, replace the `accentColor` function (lines 19–22) with the following block. Keep everything else untouched.

```ts
// ── Stat card data ────────────────────────────────────────────────────────────

type StatName = 'Determination' | 'Insight' | 'Expression' | 'Sincerity' | 'Chaos';

interface StatCard {
  color: string;
  name: string;
  emblemPath: string;
}

const STAT_CARDS: Record<StatName, StatCard> = {
  Determination: { color: '#ff4040', name: 'DETERMINATION', emblemPath: '/images/emblems/determination.png' },
  Insight:       { color: '#4ab0ff', name: 'INSIGHT',       emblemPath: '/images/emblems/insight.png'       },
  Expression:    { color: '#a855f7', name: 'EXPRESSION',    emblemPath: '/images/emblems/expression.png'    },
  Sincerity:     { color: '#ffe52c', name: 'SINCERITY',     emblemPath: '/images/emblems/sincerity.png'     },
  Chaos:         { color: '#2dd4bf', name: 'CHAOS',         emblemPath: '/images/emblems/chaos.png'         },
};

const ROUTE_STATS: [string, StatName][] = [
  ['/notes',    'Insight'],
  ['/novel',    'Expression'],
  ['/shelf',    'Sincerity'],
  ['/stream',   'Chaos'],
  ['/showcase', 'Determination'],
  ['/now',      'Sincerity'],
  ['/',         'Sincerity'],
];

const loadedImages: Partial<Record<StatName, HTMLImageElement>> = {};

export function statForPath(pathname: string): StatCard & { img: HTMLImageElement | null } {
  const key = ROUTE_STATS.find(([prefix]) =>
    prefix === '/'
      ? pathname === '/'
      : pathname === prefix || pathname.startsWith(prefix + '/')
  )?.[1] ?? 'Determination';
  return { ...STAT_CARDS[key], img: loadedImages[key] ?? null };
}

export function computeTextFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  basePx: number
): number {
  let size = basePx;
  ctx.font = `bold ${size}px monospace`;
  while (ctx.measureText(text).width > maxWidth && size > 5) size -= 0.5;
  return size;
}
```

- [ ] **Step 4: Run tests — all should pass**

```bash
npm run test
```

Expected: all tests pass including the new `statForPath` and `computeTextFit` suites.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/transition.ts src/tests/transition.test.ts
git commit -m "feat: add statForPath and computeTextFit exports, replace accentColor"
```

---

## Task 2: Update `drawCard()` — remove shine, replace ☆/THE FOOL with emblem + name

**Files:**
- Modify: `src/scripts/transition.ts`

- [ ] **Step 1: Update `drawCard()` signature and body**

In `src/scripts/transition.ts`, replace the entire `drawCard` function (the block starting at `function drawCard(` through its closing `}`) with the following:

```ts
function drawCard(
  cx: number, cy: number, cw: number, ch: number,
  rot: number, color: string, alpha: number,
  name: string, img: HTMLImageElement | null
): void {
  if (!ctx || alpha <= 0) return;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;

  // Card drop shadow + gradient fill
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

  // Inner border
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, -cw / 2 + 5, -ch / 2 + 5, cw - 10, ch - 10, 4);
  ctx.stroke();

  // Emblem image — centered slightly above mid-card
  if (img) {
    const ew = cw * 0.38;
    ctx.shadowBlur = 0;
    ctx.drawImage(img, -ew / 2, -ch * 0.06 - ew / 2, ew, ew);
  }

  // Stat name — white with drop shadow, sized to fit inside inner border
  const maxTextWidth = cw - 2 * (5 + 8);
  const fontSize = computeTextFit(ctx, name, maxTextWidth, 7);
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${fontSize}px monospace`;
  (ctx as any).letterSpacing = '1.5px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 0, ch * 0.34);
  ctx.shadowBlur = 0;
  (ctx as any).letterSpacing = '0px';

  ctx.restore();
}
```

- [ ] **Step 2: Run tests — all should still pass (drawCard is not directly unit-tested)**

```bash
npm run test
```

Expected: all tests pass. The draw function is exercised visually, not in unit tests.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/transition.ts
git commit -m "feat: update drawCard to render stat emblem and name, remove shine"
```

---

## Task 3: Thread stat through `cardPhase`, `startWipe`, and `init`

**Files:**
- Modify: `src/scripts/transition.ts`

- [ ] **Step 1: Update `cardPhase()` signature and its two `drawCard` calls**

`cardPhase` currently accepts `color: string`. Update it to accept the full stat object and destructure inside:

Find `function cardPhase(color: string): Promise<void>` and replace the entire function:

```ts
function cardPhase(stat: StatCard & { img: HTMLImageElement | null }): Promise<void> {
  return new Promise((resolve) => {
    if (!ctx) { resolve(); return; }
    const { color, name, img } = stat;

    const { cw, ch, restX, restY } = cardGeometry();

    const startX = -cw * 1.5;
    const startY = restY - (restX - startX) * Math.tan(Math.abs(ENTRY_ANGLE));

    let startTs: number | null = null;

    function tick(ts: number): void {
      if (!ctx) { canvas?.getContext('2d')?.clearRect(0, 0, W, H); resolve(); return; }
      if (startTs === null) startTs = ts;
      const elapsed = ts - startTs;

      ctx.clearRect(0, 0, W, H);

      if (elapsed < T_IN) {
        const p   = elapsed / T_IN;
        const ep  = easeDecel(p);
        const rp  = easeRotSettle(p);
        const cx  = startX + (restX - startX) * ep;
        const cy  = startY + (restY - startY) * ep;
        const rot = ENTRY_ANGLE + (REST_ROT - ENTRY_ANGLE) * rp;
        drawCard(cx, cy, cw, ch, rot, color, Math.min(1, p * 8), name, img);
        requestAnimationFrame(tick);
      } else if (elapsed < T_IN + T_HOLD) {
        const p    = (elapsed - T_IN) / T_HOLD;
        const bob  = Math.sin(p * Math.PI) * 2.2;
        const sway = Math.sin(p * Math.PI * 0.65) * 0.006;
        drawCard(restX, restY + bob, cw, ch, REST_ROT + sway, color, 1, name, img);
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

- [ ] **Step 2: Update `startWipe()` signature and its `drawCard` call**

Find `function startWipe(color: string, onMidpoint: () => void): Promise<void>` and replace the entire function:

```ts
function startWipe(
  stat: StatCard & { img: HTMLImageElement | null },
  onMidpoint: () => void
): Promise<void> {
  return new Promise((resolve) => {
    if (!ctx) { resolve(); return; }
    const { color, name, img } = stat;

    const { cw, ch, restX, restY } = cardGeometry();
    const { slant, travel } = computeWipeGeometry(W, H);

    let startTs: number | null = null;
    let midpointFired = false;

    function tick(ts: number): void {
      if (!ctx) { canvas?.getContext('2d')?.clearRect(0, 0, W, H); resolve(); return; }
      if (startTs === null) startTs = ts;
      const elapsed = Math.min(ts - startTs, T_WIPE);
      const p      = elapsed / T_WIPE;
      const ep     = easeIO(p);
      const leadX  = ep * travel - slant;

      ctx.clearRect(0, 0, W, H);
      drawWipe(leadX, color);

      const exitX  = restX + ep * W * 0.6;
      const exitY  = restY - ep * H * 0.06;
      const rot    = REST_ROT + ep * (ENTRY_ANGLE * 1.8 - REST_ROT);
      const alpha  = 1 - easeInQ(Math.max(0, (p - 0.32) / 0.68));
      drawCard(exitX, exitY, cw, ch, rot, color, alpha, name, img);

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

- [ ] **Step 3: Update `init()` — call `preloadImages()`, use `statForPath()`**

Find `function init(): void` and replace it:

```ts
function preloadImages(): void {
  for (const [stat, meta] of Object.entries(STAT_CARDS) as [StatName, StatCard][]) {
    const img = new Image();
    img.src = meta.emblemPath;
    img.onload = () => { loadedImages[stat as StatName] = img; };
  }
}

function init(): void {
  if ((window as any).__transitionInit) return;
  (window as any).__transitionInit = true;

  initCanvas();
  preloadImages();

  document.addEventListener('astro:before-preparation', (event: Event) => {
    const e = event as any;
    const fromPath: string = e.from?.pathname ?? window.location.pathname;
    const toPath: string   = e.to?.pathname   ?? '';

    if (isSamePage(fromPath, toPath)) return;
    if (prefersReducedMotion()) return;
    if (!canvas || !ctx) return;

    const stat = statForPath(toPath);

    const original = e.loader;
    e.loader = async () => {
      await cardPhase(stat);

      let resolveSwap!: () => void;
      const swapGate = new Promise<void>((r) => { resolveSwap = r; });

      startWipe(stat, resolveSwap).catch(() => resolveSwap());
      await Promise.all([swapGate, original()]);
    };
  });
}
```

- [ ] **Step 4: Run tests — all should pass**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 5: Build to confirm no TypeScript errors**

```bash
npm run build
```

Expected: clean build, no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/transition.ts
git commit -m "feat: wire stat emblems and names through cardPhase, startWipe, and init"
```
