import type { CodexConcept } from './schema';

/**
 * Keep concept URLs stable across AI runs: if a new concept has the same name
 * (case-insensitive) as an old concept but a different slug, rewrite it to the
 * old slug and fix any `related` refs that pointed at the new slug. Skips the
 * rename when it would collide with a slug already used in the new set.
 */
export function stabilizeSlugs(
  oldConcepts: CodexConcept[],
  newConcepts: CodexConcept[]
): CodexConcept[] {
  const oldByName = new Map(oldConcepts.map(c => [c.name.toLowerCase(), c.slug]));
  const result = newConcepts.map(c => ({ ...c, related: [...c.related] }));
  const taken = new Set(result.map(c => c.slug));
  const renames = new Map<string, string>();

  for (const c of result) {
    const oldSlug = oldByName.get(c.name.toLowerCase());
    if (oldSlug && oldSlug !== c.slug && !taken.has(oldSlug)) {
      renames.set(c.slug, oldSlug);
      taken.delete(c.slug);
      taken.add(oldSlug);
      c.slug = oldSlug;
    }
  }

  for (const c of result) {
    c.related = c.related.map(rel => renames.get(rel) ?? rel);
  }
  return result;
}
