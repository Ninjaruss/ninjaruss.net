export type JournalType = 'inquiry' | 'fragment';

export interface JournalItem {
  entry: {
    slug: string;
    data: {
      title: string;
      tags: string[];
      updatedAt?: Date;
      publishedAt?: Date;
    };
  };
  type: JournalType;
  href: string;
}

const effectiveDate = (e: { data: { updatedAt?: Date; publishedAt?: Date } }) =>
  new Date(e.data.updatedAt || e.data.publishedAt || 0).getTime();

/** Merge notes + showcase into one date-sorted journal list (pure; unit-tested). */
export function mergeJournalEntries(
  notes: JournalItem['entry'][],
  showcase: JournalItem['entry'][]
): JournalItem[] {
  const items: JournalItem[] = [
    ...notes.map(e => ({ entry: e, type: 'fragment' as const, href: `/notes/${e.slug}` })),
    ...showcase.map(e => ({ entry: e, type: 'inquiry' as const, href: `/showcase/${e.slug}` })),
  ];
  return items.sort((a, b) => effectiveDate(b.entry) - effectiveDate(a.entry));
}
