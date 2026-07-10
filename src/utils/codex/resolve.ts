import type { CodexData } from './schema';

export interface ResolvedEntry {
  id: string;
  title: string;
  href: string;
  collection: string;
  publishedAt: string | null;
  excerpt: string;
}

export interface ResolvedConcept {
  slug: string;
  name: string;
  synthesis: string;
  entries: ResolvedEntry[];
  related: { slug: string; name: string }[];
}

export interface ResolvedCodex {
  generatedAt: string | null;
  concepts: ResolvedConcept[];
  droppedRefs: string[];
  looseThreads: ResolvedEntry[];
}

/**
 * Pure structural layer: marries the committed interpretation (codex.json)
 * with the live content (entryMap built at build time). Facts always come
 * from entryMap, so a stale codex.json can never show a wrong date/excerpt.
 */
export function resolveCodex(
  codex: CodexData | null,
  entryMap: Map<string, ResolvedEntry>
): ResolvedCodex {
  if (!codex) {
    return { generatedAt: null, concepts: [], droppedRefs: [], looseThreads: [] };
  }

  const nameBySlug = new Map(codex.concepts.map(c => [c.slug, c.name]));
  const droppedRefs: string[] = [];
  const assigned = new Set<string>();

  const concepts: ResolvedConcept[] = codex.concepts.map(concept => {
    const entries: ResolvedEntry[] = [];
    for (const ref of concept.entries) {
      const resolved = entryMap.get(ref);
      if (resolved) {
        entries.push(resolved);
        assigned.add(ref);
      } else {
        droppedRefs.push(ref);
      }
    }
    entries.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
    return {
      slug: concept.slug,
      name: concept.name,
      synthesis: concept.synthesis,
      entries,
      related: concept.related
        .filter(slug => nameBySlug.has(slug))
        .map(slug => ({ slug, name: nameBySlug.get(slug)! })),
    };
  });

  const looseThreads = [...entryMap.values()]
    .filter(e => !assigned.has(e.id) && e.publishedAt !== null && e.publishedAt > codex.generatedAt)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

  return { generatedAt: codex.generatedAt, concepts, droppedRefs, looseThreads };
}
