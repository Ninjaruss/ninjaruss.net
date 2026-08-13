/**
 * Profile card data layer for /about.
 *
 * Pure by design: vitest cannot resolve the `astro:content` virtual module, so
 * nothing in this file may import it. The Zod schema is built from `astro/zod`
 * (a real subpath export of the astro package) rather than the re-export on
 * `astro:content`, which keeps it loadable in a plain node test run.
 */

/**
 * The profile collection is a singleton, but a collection is still a list.
 * Prefer the entry literally named `about`; otherwise take the alphabetically
 * first so the page renders something deterministic rather than throwing.
 */
export function pickProfile<T extends { id: string }>(entries: readonly T[]): T | null {
  if (entries.length === 0) return null;
  const named = entries.find(e => e.id.replace(/\.mdx?$/, '') === 'about');
  if (named) return named;
  return [...entries].sort((a, b) => a.id.localeCompare(b.id))[0];
}
