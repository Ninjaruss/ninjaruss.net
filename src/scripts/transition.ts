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

// ── Stat card data ────────────────────────────────────────────────────────────

export type StatName = 'Determination' | 'Insight' | 'Expression' | 'Sincerity' | 'Chaos';

export interface StatCard {
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
  while (size > 5) {
    ctx.font = `bold ${size}px monospace`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 0.5;
  }
  return size;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

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

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, -cw / 2 + 5, -ch / 2 + 5, cw - 10, ch - 10, 4);
  ctx.stroke();

  if (img) {
    const ew = cw * 0.38;
    ctx.shadowBlur = 0;
    ctx.drawImage(img, -ew / 2, -ch * 0.06 - ew / 2, ew, ew);
  }

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

function cardGeometry(): { cw: number; ch: number; restX: number; restY: number } {
  const cw = Math.min(136, W * 0.145);
  return { cw, ch: cw * 1.4, restX: W * 0.5, restY: H * 0.455 };
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

// ── Animation constants ───────────────────────────────────────────────────────

const T_IN         = 520;              // ms — card entry + rotation settle
const T_HOLD       = 340;              // ms — card bob/sway at rest
const T_WIPE       = 620;              // ms — wipe sweeps, card exits
const ENTRY_ANGLE  = -18 * Math.PI / 180;  // -18° — card entry path angle
const REST_ROT     = -0.14;           // -8° — card resting rotation

// ── Phase: card entry + hold ──────────────────────────────────────────────────

/**
 * Animates card entering from top-left and holding at rest.
 * Resolves after T_IN + T_HOLD ms.
 */
function cardPhase(color: string): Promise<void> {
  return new Promise((resolve) => {
    if (!ctx) { resolve(); return; }

    const { cw, ch, restX, restY } = cardGeometry();

    // Entry start: off-screen top-left, positioned along the -18° diagonal
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

    const color = statForPath(toPath).color;

    const original = e.loader;
    e.loader = async () => {
      // Phase 1: card entry + hold (T_IN + T_HOLD ms)
      await cardPhase(color);

      // Phase 2: wipe covers screen while new page loads in parallel.
      // onMidpoint fires when the lead edge passes W*0.48 — providing visual
      // cover for the DOM swap. We wait for both: midpoint reached AND page
      // fetched. .catch ensures a GPU/canvas error can't hang navigation.
      let resolveSwap!: () => void;
      const swapGate = new Promise<void>((r) => { resolveSwap = r; });

      startWipe(color, resolveSwap).catch(() => resolveSwap());
      await Promise.all([swapGate, original()]);
    };
  });
}

if (typeof window !== 'undefined') init();
