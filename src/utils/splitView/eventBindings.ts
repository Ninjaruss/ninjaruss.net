import type { SplitViewElements, SplitViewState } from './types';
import type { IdleManager } from './idleManager';
import { getFiltersFromURL, updateURL } from './urlState';
import { applyFilters } from './filterEngine';
import { loadContent } from './contentLoader';

/**
 * Bind filter-related event listeners
 */
export function bindFilterEvents(
  elements: SplitViewElements,
  state: SplitViewState,
  idleManager: IdleManager
): void {
  const { searchInput, typesList, clearAllButton, listItems, noResults } = elements;
  // A bare surface renders no filter chrome — nothing to bind. Selection and
  // content loading are bound separately in bindListEvents and are unaffected.
  if (!searchInput || !typesList || !clearAllButton) return;

  // Reflect a type selection onto the segmented control (single-select)
  const syncTypePills = (types: Set<string>) => {
    typesList.querySelectorAll<HTMLElement>('.split-view__type-pill').forEach((p) => {
      const isSelected = p.dataset.type === '' ? types.size === 0 : types.has(p.dataset.type || '');
      p.classList.toggle('is-selected', isSelected);
      p.setAttribute('aria-pressed', String(isSelected));
    });
  };

  // Search input
  searchInput.addEventListener('input', () => {
    const { types } = getFiltersFromURL();
    updateURL(searchInput.value, types, clearAllButton);
    applyFilters(listItems, noResults);
    idleManager.stopFloating();
  });

  // Type pill clicks — segmented single-select; "All" (data-type="") or
  // re-clicking the active type clears the filter
  typesList.addEventListener('click', (e) => {
    const pill = (e.target as HTMLElement).closest('.split-view__type-pill') as HTMLElement | null;
    if (!pill) return;

    const type = pill.dataset.type ?? '';
    const { search, types } = getFiltersFromURL();
    const next = type && !types.has(type) ? new Set([type]) : new Set<string>();

    syncTypePills(next);
    updateURL(search, next, clearAllButton);
    applyFilters(listItems, noResults);
  });

  // Clear all filters (types; search stays)
  clearAllButton.addEventListener('click', () => {
    const { search } = getFiltersFromURL();
    updateURL(search, new Set(), clearAllButton);
    syncTypePills(new Set());
    applyFilters(listItems, noResults);
  });
}

/**
 * Bind global event listeners (called once)
 */
export function bindGlobalEvents(section: string): void {
  if ((window as any).__splitViewGlobalHandlers) return;
  (window as any).__splitViewGlobalHandlers = true;

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const search = document.querySelector('.split-view__search') as HTMLInputElement | null;

    if ((e.metaKey || e.ctrlKey) && e.key === 'k' && search) {
      e.preventDefault();
      search.focus();
    }

    if (e.key === 'Escape') {
      if (search && document.activeElement === search && search.value) {
        search.value = '';
        const params = new URLSearchParams(window.location.search);
        params.delete('search');
        const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        history.replaceState(null, '', newURL);
        window.dispatchEvent(new Event('filterschanged'));
      }
    }
  });

  // Listen for filter changes to reapply
  window.addEventListener('filterschanged', () => {
    const sv = document.querySelector('.split-view');
    if (sv) {
      sv.dispatchEvent(new CustomEvent('applyfilters'));
    }
  });
}

/**
 * Bind list item and navigation event listeners
 */
export function bindListEvents(
  elements: SplitViewElements,
  state: SplitViewState,
  idleManager: IdleManager
): void {
  const { splitView, contentArea, listItems, listPanel, detailPanel, navContainer, noResults } = elements;

  // List item clicks
  listItems.forEach((item) => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      const slug = item.dataset.slug;
      if (slug) await loadContent(slug, elements, state, idleManager);
    });
  });

  // Browser back/forward (attach once per section)
  if (!(window as any)[`__splitViewPopstate_${state.section}`]) {
    (window as any)[`__splitViewPopstate_${state.section}`] = true;

    window.addEventListener('popstate', (e) => {
      const sv = document.querySelector('.split-view') as HTMLElement | null;
      if (!sv || sv.dataset.section !== state.section) return;

      const content = sv.querySelector('.split-view__content') as HTMLElement | null;
      const items = Array.from(sv.querySelectorAll('.list-item')) as HTMLElement[];

      if ((e as PopStateEvent).state?.slug) {
        const item = sv.querySelector(`[data-slug="${(e as PopStateEvent).state.slug}"]`) as HTMLElement;
        item?.click();
      } else {
        sv.classList.remove('has-selection');
        if (content) {
          content.classList.remove('is-active');
          content.innerHTML = '';
        }
        items.forEach((i) => i.classList.remove('is-active'));
      }
    });
  }

  // Listen for custom filter apply event
  splitView.addEventListener('applyfilters', () => {
    applyFilters(listItems, noResults);
  });

  // Scroll detection for visual hierarchy
  if (detailPanel && listPanel) {
    let scrollTimeout: number | null = null;

    detailPanel.addEventListener('scroll', () => {
      const isScrolled = detailPanel.scrollTop > 10;

      if (scrollTimeout) clearTimeout(scrollTimeout);

      scrollTimeout = window.setTimeout(() => {
        listPanel.classList.toggle('is-scrolled', isScrolled);
      }, 50);
    });
  }

  // Keyboard navigation
  navContainer?.addEventListener('keydown', (e: KeyboardEvent) => {
    const visibleItems = listItems.filter((item) => !item.classList.contains('is-filtered'));
    if (visibleItems.length === 0) return;

    const activeItem = visibleItems.find((item) => item === document.activeElement || item.classList.contains('is-active'));
    const currentIndex = activeItem ? visibleItems.indexOf(activeItem) : -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = currentIndex < visibleItems.length - 1 ? currentIndex + 1 : 0;
        visibleItems[nextIndex].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleItems.length - 1;
        visibleItems[prevIndex].focus();
        break;
      case 'Enter':
      case ' ':
        if (document.activeElement?.classList.contains('list-item')) {
          e.preventDefault();
          (document.activeElement as HTMLElement).click();
        }
        break;
      case 'Home':
        e.preventDefault();
        visibleItems[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        visibleItems[visibleItems.length - 1]?.focus();
        break;
    }
  });
}
