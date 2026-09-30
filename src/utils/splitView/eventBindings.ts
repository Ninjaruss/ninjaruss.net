import type { SplitViewElements, SplitViewState } from './types';
import type { IdleManager } from './idleManager';
import { getFiltersFromURL, updateURL } from './urlState';
import { applyFilters } from './filterEngine';
import { loadContent, clearContent } from './contentLoader';

/** Does this click mean "let the browser handle it" (new tab, download, …)? */
export function isModifiedClick(e: MouseEvent): boolean {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

/** Normalises a path for comparison — `/showcase/a` and `/showcase/a/` match. */
function normalisePath(p: string): string {
  return p.replace(/\/+$/, '') || '/';
}

/**
 * Resolves which list item (if any) the current URL points at. Used by popstate,
 * where the history entry's state can no longer be trusted to carry the slug:
 * SplitView pushes `null` so Astro's ClientRouter ignores its entries (see
 * contentLoader), so the URL is the source of truth.
 */
function slugForCurrentPath(elements: SplitViewElements): string | null {
  const here = normalisePath(window.location.pathname);
  const match = elements.listItems.find((item) => {
    const href = item.getAttribute('href');
    return href ? normalisePath(href) === here : false;
  });
  return match?.dataset.slug ?? null;
}

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
      // Let modified clicks through to the browser. ⌘/Ctrl-click "open in a new
      // tab" is the standard gesture on a list of links, and this handler used to
      // swallow it unconditionally. The shelf filter bar guards the same way.
      if (isModifiedClick(e)) return;
      e.preventDefault();
      const slug = item.dataset.slug;
      if (slug) await loadContent(slug, elements, state, idleManager);
    });
  });

  // Browser back/forward (attach once per section)
  if (!(window as any)[`__splitViewPopstate_${state.section}`]) {
    (window as any)[`__splitViewPopstate_${state.section}`] = true;

    window.addEventListener('popstate', () => {
      const sv = document.querySelector('.split-view') as HTMLElement | null;
      if (!sv || sv.dataset.section !== state.section) return;

      /* Restore from the URL, not from event.state: SplitView now pushes `null`
         state so Astro's ClientRouter leaves these entries alone. */
      const slug = slugForCurrentPath(elements);

      if (slug) {
        /* The critical bit — restoring must NOT push. This used to go through
           the list item's own click handler (item.click()), which inherited
           pushHistory: true, so every Back pushed a new entry: that truncated
           the forward stack (killing Forward outright) and made a second Back
           re-render the same URL instead of leaving the entry. scroll: false
           keeps the visitor's own reading position on a traversal, and
           focusHeading: false avoids yanking focus on Back. */
        loadContent(slug, elements, state, idleManager, {
          pushHistory: false,
          scroll: false,
          focusHeading: false,
        });
      } else {
        clearContent(elements, state);
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
