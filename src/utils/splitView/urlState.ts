import type { FilterState } from './types';

/**
 * Parse filter state from URL query parameters
 */
export function getFiltersFromURL(): FilterState {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search') || '';
  const tagsParam = params.get('tags') || '';
  const typesParam = params.get('types') || '';

  return {
    search,
    tags: tagsParam ? new Set(tagsParam.split(',').filter(Boolean)) : new Set<string>(),
    types: typesParam ? new Set(typesParam.split(',').filter(Boolean)) : new Set<string>(),
  };
}

/**
 * Update URL with current filter state using History API
 */
export function updateURL(
  search: string,
  tags: Set<string>,
  types: Set<string>,
  clearAllButton?: HTMLElement | null
): void {
  const params = new URLSearchParams(window.location.search);

  if (search) {
    params.set('search', search);
  } else {
    params.delete('search');
  }

  if (tags.size > 0) {
    params.set('tags', Array.from(tags).sort().join(','));
  } else {
    params.delete('tags');
  }

  if (types.size > 0) {
    params.set('types', Array.from(types).sort().join(','));
  } else {
    params.delete('types');
  }

  const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  history.replaceState(null, '', newURL);

  // Show/hide clear all button based on active filters
  if (clearAllButton) {
    const hasActiveFilters = tags.size > 0 || types.size > 0;
    clearAllButton.hidden = !hasActiveFilters;
  }
}
