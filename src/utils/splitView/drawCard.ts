/**
 * Draw-a-card pool logic (journal serendipity). Pure — DOM-free, rng injected
 * for testability. Drafts never reach the pool: they aren't rendered at all.
 */
export interface DrawCandidate {
  slug: string;
  type: string;
}

export function pickDrawCandidate<T extends DrawCandidate>(
  items: T[],
  random: () => number,
  excludeSlug?: string
): T | null {
  const notes = items.filter((i) => i.type === 'note');
  if (notes.length === 0) return null;
  const pool = notes.filter((i) => i.slug !== excludeSlug);
  const from = pool.length > 0 ? pool : notes;
  return from[Math.floor(random() * from.length)];
}
