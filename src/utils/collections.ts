import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type SectionName = 'shelf' | 'notes' | 'showcase';

export interface AllCollections {
  allShelf: CollectionEntry<'shelf'>[];
  allNotes: CollectionEntry<'notes'>[];
  allShowcase: CollectionEntry<'showcase'>[];
}

/**
 * Fetch all non-draft entries from all content collections
 * Used for RelatedContent component
 */
export async function getAllCollections(): Promise<AllCollections> {
  const [allShelf, allNotes, allShowcase] = await Promise.all([
    getCollection('shelf', ({ data }) => !data.draft),
    getCollection('notes', ({ data }) => !data.draft),
    getCollection('showcase', ({ data }) => !data.draft),
  ]);

  return { allShelf, allNotes, allShowcase };
}
