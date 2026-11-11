interface Note {
  slug: string;
  data: { draft?: boolean; publishedAt?: Date; title: string };
}

/** Japanese practice has its own page; undated notes belong at the end. */
export function publicNotes<T extends Note>(entries: T[]): T[] {
  return entries.filter(entry => !entry.data.draft && entry.slug !== 'jp-journal')
    .sort((a, b) => (b.data.publishedAt?.getTime() ?? -Infinity) - (a.data.publishedAt?.getTime() ?? -Infinity)
      || a.data.title.localeCompare(b.data.title));
}
