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
