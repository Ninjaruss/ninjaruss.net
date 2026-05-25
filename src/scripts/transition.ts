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
