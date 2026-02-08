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
  const {
    searchInput, typesList, typeToggle, typeDropdown, typeClear,
    tagsList, tagsToggle, tagsDropdown, tagsClear, clearAllButton,
    listItems, noResults
  } = elements;

  // Search input
  searchInput.addEventListener('input', () => {
    const { tags, types } = getFiltersFromURL();
    updateURL(searchInput.value, tags, types, clearAllButton);
    applyFilters(listItems, noResults);
    idleManager.stopFloating();
  });

  // Tags toggle
  tagsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = tagsToggle.getAttribute('aria-expanded') === 'true';
    tagsToggle.setAttribute('aria-expanded', String(!isExpanded));
    tagsDropdown.hidden = isExpanded;

    // Close type dropdown when opening tags
    if (!isExpanded) {
      typeToggle.setAttribute('aria-expanded', 'false');
      typeDropdown.hidden = true;
    }
  });

  // Tag pill clicks (event delegation)
  tagsList.addEventListener('click', (e) => {
    const pill = (e.target as HTMLElement).closest('.split-view__tag-pill') as HTMLElement;
    if (!pill) return;

    const tag = pill.dataset.tag;
    if (!tag) return;

    const { search, tags, types } = getFiltersFromURL();

    if (tags.has(tag)) {
      tags.delete(tag);
      pill.classList.remove('is-selected');
    } else {
      tags.add(tag);
      pill.classList.add('is-selected');
    }

    tagsToggle.classList.toggle('has-selection', tags.size > 0);
    updateURL(search, tags, types, clearAllButton);
    applyFilters(listItems, noResults);
  });

  // Clear tags
  tagsClear.addEventListener('click', () => {
    const { search, types } = getFiltersFromURL();
    updateURL(search, new Set(), types, clearAllButton);
    tagsList.querySelectorAll('.split-view__tag-pill').forEach((p) => {
      p.classList.remove('is-selected');
    });
    tagsToggle.classList.remove('has-selection');
    applyFilters(listItems, noResults);
  });

  // Type toggle
  typeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = typeToggle.getAttribute('aria-expanded') === 'true';
    typeToggle.setAttribute('aria-expanded', String(!isExpanded));
    typeDropdown.hidden = isExpanded;

    // Close tags dropdown when opening type
    if (!isExpanded) {
      tagsToggle.setAttribute('aria-expanded', 'false');
      tagsDropdown.hidden = true;
    }
  });

  // Type pill clicks (event delegation)
  typesList.addEventListener('click', (e) => {
    const pill = (e.target as HTMLElement).closest('.split-view__type-pill') as HTMLElement;
    if (!pill) return;

    const type = pill.dataset.type;
    if (!type) return;

    const { search, tags, types } = getFiltersFromURL();

    if (types.has(type)) {
      types.delete(type);
      pill.classList.remove('is-selected');
    } else {
      types.add(type);
      pill.classList.add('is-selected');
    }

    typeToggle.classList.toggle('has-selection', types.size > 0);
    updateURL(search, tags, types, clearAllButton);
    applyFilters(listItems, noResults);
  });

  // Clear types
  typeClear.addEventListener('click', () => {
    const { search, tags } = getFiltersFromURL();
    updateURL(search, tags, new Set(), clearAllButton);
    typesList.querySelectorAll('.split-view__type-pill').forEach((p) => {
      p.classList.remove('is-selected');
    });
    typeToggle.classList.remove('has-selection');
    applyFilters(listItems, noResults);
  });

  // Clear all filters
  clearAllButton.addEventListener('click', () => {
    const { search } = getFiltersFromURL();
    updateURL(search, new Set(), new Set(), clearAllButton);

    tagsList.querySelectorAll('.split-view__tag-pill').forEach((p) => {
      p.classList.remove('is-selected');
    });
    tagsToggle.classList.remove('has-selection');

    typesList.querySelectorAll('.split-view__type-pill').forEach((p) => {
      p.classList.remove('is-selected');
    });
    typeToggle.classList.remove('has-selection');

    applyFilters(listItems, noResults);
  });
}

/**
 * Bind global event listeners (called once)
 */
export function bindGlobalEvents(section: string): void {
  if ((window as any).__splitViewGlobalHandlers) return;
  (window as any).__splitViewGlobalHandlers = true;

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const tagsToggle = document.querySelector('.split-view__tags-toggle') as HTMLElement | null;
    const tagsDropdown = document.querySelector('.split-view__tags-dropdown') as HTMLElement | null;
    const typeToggle = document.querySelector('.split-view__type-toggle') as HTMLElement | null;
    const typeDropdown = document.querySelector('.split-view__type-dropdown') as HTMLElement | null;

    if (tagsToggle && tagsDropdown && !tagsToggle.contains(e.target as Node) && !tagsDropdown.contains(e.target as Node)) {
      tagsToggle.setAttribute('aria-expanded', 'false');
      tagsDropdown.hidden = true;
    }

    if (typeToggle && typeDropdown && !typeToggle.contains(e.target as Node) && !typeDropdown.contains(e.target as Node)) {
      typeToggle.setAttribute('aria-expanded', 'false');
      typeDropdown.hidden = true;
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const search = document.querySelector('.split-view__search') as HTMLInputElement | null;
    const tagsToggle = document.querySelector('.split-view__tags-toggle') as HTMLElement | null;
    const tagsDropdown = document.querySelector('.split-view__tags-dropdown') as HTMLElement | null;
    const typeToggle = document.querySelector('.split-view__type-toggle') as HTMLElement | null;
    const typeDropdown = document.querySelector('.split-view__type-dropdown') as HTMLElement | null;

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
      if (tagsToggle && tagsDropdown) {
        tagsToggle.setAttribute('aria-expanded', 'false');
        tagsDropdown.hidden = true;
      }
      if (typeToggle && typeDropdown) {
        typeToggle.setAttribute('aria-expanded', 'false');
        typeDropdown.hidden = true;
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
