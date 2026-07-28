import type { FilterState } from './types';

/**
 * Parse filter state from URL query parameters
 */
export function getFiltersFromURL(): FilterState {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search') || '';
  const typesParam = params.get('types') || '';

  return {
    search,
    types: typesParam ? new Set(typesParam.split(',').filter(Boolean)) : new Set<string>(),
  };
}

/**
 * Update URL with current filter state using History API
 */
export function updateURL(
  search: string,
  types: Set<string>,
  clearAllButton?: HTMLElement | null
): void {
  const params = new URLSearchParams(window.location.search);

  if (search) {
    params.set('search', search);
  } else {
    params.delete('search');
  }

  // Drop any legacy ?tags= param the moment the user interacts with filters
  params.delete('tags');

  if (types.size > 0) {
    params.set('types', Array.from(types).sort().join(','));
  } else {
    params.delete('types');
  }

  const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  history.replaceState(null, '', newURL);

  // Show/hide clear all button based on active filters
  if (clearAllButton) {
    clearAllButton.hidden = types.size === 0;
  }
}
