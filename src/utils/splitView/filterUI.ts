/**
 * Populate types dropdown and restore selected state
 */
export function populateTypes(
  typesList: HTMLElement,
  listItems: HTMLElement[],
  selectedTypes: Set<string>,
  typeFilter: HTMLElement,
  typeToggle: HTMLElement
): void {
  const allTypes = new Set<string>();
  listItems.forEach((item) => {
    const type = item.dataset.contentType;
    if (type) allTypes.add(type);
  });

  const sortedTypes = Array.from(allTypes).sort();
  typesList.innerHTML = sortedTypes
    .map((type) => {
      const isSelected = selectedTypes.has(type);
      return `<button class="split-view__type-pill ${isSelected ? 'is-selected' : ''}" type="button" data-type="${type}">${type}</button>`;
    })
    .join('');

  typeFilter.style.display = sortedTypes.length === 0 ? 'none' : '';
  typeToggle.classList.toggle('has-selection', selectedTypes.size > 0);
}

/**
 * Populate tags dropdown and restore selected state
 */
export function populateTags(
  tagsList: HTMLElement,
  listItems: HTMLElement[],
  selectedTags: Set<string>,
  tagsFilter: HTMLElement,
  tagsToggle: HTMLElement
): void {
  const allTags = new Set<string>();
  listItems.forEach((item) => {
    const tags = item.dataset.tags?.split(',').filter(Boolean) || [];
    tags.forEach((tag) => allTags.add(tag));
  });

  const sortedTags = Array.from(allTags).sort();
  tagsList.innerHTML = sortedTags
    .map((tag) => {
      const isSelected = selectedTags.has(tag);
      return `<button class="split-view__tag-pill ${isSelected ? 'is-selected' : ''}" type="button" data-tag="${tag}">${tag}</button>`;
    })
    .join('');

  tagsFilter.style.display = sortedTags.length === 0 ? 'none' : '';
  tagsToggle.classList.toggle('has-selection', selectedTags.size > 0);
}
