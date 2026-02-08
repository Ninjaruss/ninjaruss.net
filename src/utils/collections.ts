import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type SectionName = 'media' | 'notes' | 'showcase';

export interface AllCollections {
  allMedia: CollectionEntry<'media'>[];
  allNotes: CollectionEntry<'notes'>[];
  allShowcase: CollectionEntry<'showcase'>[];
}

/**
 * Fetch all non-draft entries from all content collections
 * Used for RelatedContent component
 */
export async function getAllCollections(): Promise<AllCollections> {
  const [allMedia, allNotes, allShowcase] = await Promise.all([
    getCollection('media', ({ data }) => !data.draft),
    getCollection('notes', ({ data }) => !data.draft),
    getCollection('showcase', ({ data }) => !data.draft),
  ]);

  return { allMedia, allNotes, allShowcase };
}

/**
 * Get sorted entries for a specific section (by publishedAt descending)
 */
export async function getSortedEntries<T extends SectionName>(
  section: T
): Promise<CollectionEntry<T>[]> {
  const entries = await getCollection(section, ({ data }) => !data.draft);
  return entries.sort((a, b) =>
    new Date(b.data.publishedAt || 0).getTime() -
    new Date(a.data.publishedAt || 0).getTime()
  ) as CollectionEntry<T>[];
}
