import { getFiltersFromURL } from './urlState';

/**
 * Apply filters to list items based on current URL params
 */
export function applyFilters(
  listItems: HTMLElement[],
  noResults: HTMLElement
): void {
  const { search, tags, types } = getFiltersFromURL();
  const query = search.toLowerCase().trim();
  let visibleCount = 0;

  listItems.forEach((item) => {
    const title = item.querySelector('.list-item__title')?.textContent?.toLowerCase() || '';
    const itemTags = item.dataset.tags?.split(',').filter(Boolean) || [];
    const itemType = item.dataset.contentType || '';
    const searchContent = item.dataset.searchContent?.toLowerCase() || '';

    // Search in title OR body content
    const matchesSearch = !query || title.includes(query) || searchContent.includes(query);
    const matchesTags = tags.size === 0 || itemTags.some((tag) => tags.has(tag));
    const matchesType = types.size === 0 || types.has(itemType);

    const isVisible = matchesSearch && matchesTags && matchesType;
    item.classList.toggle('is-filtered', !isVisible);
    if (isVisible) visibleCount++;
  });

  noResults.hidden = visibleCount > 0;
}
