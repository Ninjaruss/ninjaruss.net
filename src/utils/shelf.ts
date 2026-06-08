export type SortableEntry = {
  isFavorite: boolean;
  hasContent: boolean;
  date: Date | null;
};

export function sortShelfSection<T extends SortableEntry>(entries: T[]): T[] {
  const byDate = (a: T, b: T) =>
    (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0);

  const favs       = entries.filter(e =>  e.isFavorite).sort(byDate);
  const reviewed   = entries.filter(e => !e.isFavorite &&  e.hasContent).sort(byDate);
  const unreviewed = entries.filter(e => !e.isFavorite && !e.hasContent).sort(byDate);

  return [...favs, ...reviewed, ...unreviewed];
}
