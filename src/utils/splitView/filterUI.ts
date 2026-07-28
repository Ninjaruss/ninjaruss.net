/**
 * Populate the type facet — an always-visible segmented control:
 * [All] [type] [type]… with per-type counts. Single-select; "All" = no filter.
 */
export function populateTypes(
  typesList: HTMLElement,
  listItems: HTMLElement[],
  selectedTypes: Set<string>
): void {
  const counts = new Map<string, number>();
  listItems.forEach((item) => {
    const type = item.dataset.contentType;
    if (type) counts.set(type, (counts.get(type) || 0) + 1);
  });

  // URL may carry stale/unknown types (e.g. legacy ?types=fragment) — drop them
  selectedTypes.forEach((t) => {
    if (!counts.has(t)) selectedTypes.delete(t);
  });

  // Fewer than two types — nothing to segment
  if (counts.size < 2) {
    typesList.hidden = true;
    typesList.innerHTML = '';
    return;
  }

  const sortedTypes = Array.from(counts.keys()).sort();
  const pill = (type: string, label: string, count: number, selected: boolean) =>
    `<button class="split-view__type-pill ${selected ? 'is-selected' : ''}" type="button" data-type="${type}" aria-pressed="${selected}">${label}<span class="split-view__pill-count">${count}</span></button>`;

  typesList.innerHTML = [
    pill('', 'All', listItems.length, selectedTypes.size === 0),
    ...sortedTypes.map((type) => pill(type, type, counts.get(type)!, selectedTypes.has(type))),
  ].join('');
  typesList.hidden = false;
}
