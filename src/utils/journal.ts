import { getCollection, type CollectionEntry } from 'astro:content';
import { mergeJournalEntries as mergePure, type JournalType } from './journalMerge';

export type { JournalType };

export interface JournalItem {
  entry: CollectionEntry<'notes'> | CollectionEntry<'showcase'>;
  type: JournalType;
  href: string;
}

/** Merge notes + showcase into one date-sorted journal list (pure; unit-tested). */
export function mergeJournalEntries(
  notes: CollectionEntry<'notes'>[],
  showcase: CollectionEntry<'showcase'>[]
): JournalItem[] {
  return mergePure(notes, showcase) as JournalItem[];
}

/** Fetch all non-draft notes + showcase entries as a merged journal list. */
export async function getJournalItems(): Promise<JournalItem[]> {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  const showcase = await getCollection('showcase', ({ data }) => !data.draft);
  return mergeJournalEntries(notes, showcase);
}
