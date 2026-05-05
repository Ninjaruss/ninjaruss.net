export interface FilterState {
  type: string;
  favOnly: boolean;
}

export interface FilterableEntry {
  slug: string;
  type: string;
  isFavorite: boolean;
}

const VALID_TYPES = new Set([
  'all', 'anime', 'manga', 'film', 'series', 'music', 'book', 'game', 'character', 'other',
]);

export function filterEntries<T extends FilterableEntry>(entries: T[], state: FilterState): T[] {
  return entries.filter((entry) => {
    if (state.type !== 'all' && entry.type !== state.type) return false;
    if (state.favOnly && !entry.isFavorite) return false;
    return true;
  });
}

export function parseFilterState(search: string): FilterState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const rawType = params.get('type') ?? 'all';
  const type = VALID_TYPES.has(rawType) ? rawType : 'all';
  const favOnly = params.get('fav') === '1';
  return { type, favOnly };
}

export function buildFilterURL(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.type !== 'all') params.set('type', state.type);
  if (state.favOnly) params.set('fav', '1');
  const str = params.toString();
  return str ? `?${str}` : '';
}
