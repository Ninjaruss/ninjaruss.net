/**
 * Pure logic for the /shelf "pinned wall" — tier, shape, span-class mapping,
 * deterministic rotation, and ordering.
 * No astro imports (vitest can't resolve astro:content).
 */

export type WallTier = 'large' | 'medium' | 'small';
export type WallShape = 'poster' | 'square';

/** Size = affection: favorite > written-about > bare log. Never a shame signal. */
export function wallTier(e: { isFavorite: boolean; hasContent: boolean }): WallTier {
  if (e.isFavorite) return 'large';
  if (e.hasContent) return 'medium';
  return 'small';
}

export function wallShape(contentType: string): WallShape {
  return contentType === 'music' ? 'square' : 'poster';
}

/** CSS modifier class carrying the grid spans (numbers live in the page CSS). */
export function wallClass(tier: WallTier, shape: WallShape): string {
  return `shelf-card--${shape}-${tier}`;
}

/**
 * Deterministic per-item rotation in [-1.5, 1.5] degrees, 0.1° steps,
 * seeded from the slug (djb2-xor) so it is stable across builds.
 */
export function wallRotation(slug: string): number {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) {
    h = ((h * 33) ^ slug.charCodeAt(i)) >>> 0;
  }
  return ((h % 31) - 15) / 10;
}

export type WallSortable = { title: string; date: Date | null };

/** Newest first; undated entries last, tie-broken by title. Non-mutating. */
export function sortWall<T extends WallSortable>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const ad = a.date?.getTime() ?? null;
    const bd = b.date?.getTime() ?? null;
    if (ad !== null && bd !== null && ad !== bd) return bd - ad;
    if (ad !== null && bd === null) return -1;
    if (ad === null && bd !== null) return 1;
    return a.title.localeCompare(b.title);
  });
}
