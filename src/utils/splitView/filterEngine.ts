import { getFiltersFromURL } from './urlState';

/**
 * Apply filters to list items based on current URL params
 */
export function applyFilters(
  listItems: HTMLElement[],
  noResults: HTMLElement | null
): void {
  const { search, types } = getFiltersFromURL();
  const query = search.toLowerCase().trim();
  let visibleCount = 0;

  // Ignore URL types no list item carries (stale/hand-edited ?types=) — fall back to All
  const knownTypes = new Set(
    listItems.map((item) => item.dataset.contentType || '').filter(Boolean)
  );
  const activeTypes = new Set([...types].filter((t) => knownTypes.has(t)));

  listItems.forEach((item) => {
    const title = item.querySelector('.list-item__title')?.textContent?.toLowerCase() || '';
    const itemType = item.dataset.contentType || '';
    const searchContent = item.dataset.searchContent?.toLowerCase() || '';

    // Search in title OR body content
    const matchesSearch = !query || title.includes(query) || searchContent.includes(query);
    const matchesType = activeTypes.size === 0 || activeTypes.has(itemType);

    const isVisible = matchesSearch && matchesType;
    item.classList.toggle('is-filtered', !isVisible);
    if (isVisible) visibleCount++;
  });

  if (noResults) noResults.hidden = visibleCount > 0;

  // Update "visible / total" count display
  const countEl = document.getElementById('split-count');
  if (countEl) {
    countEl.textContent =
      visibleCount === listItems.length ? `${visibleCount}` : `${visibleCount} / ${listItems.length}`;
  }
}
