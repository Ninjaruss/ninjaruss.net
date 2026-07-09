import type { SplitViewElements, SplitViewState } from './types';
import { getFiltersFromURL } from './urlState';
import { applyFilters } from './filterEngine';
import { loadContent } from './contentLoader';
import { populateTypes, populateTags } from './filterUI';
import { createIdleManager, initIdleEventListeners, initEmblemHoverListeners } from './idleManager';
import { bindFilterEvents, bindGlobalEvents, bindListEvents } from './eventBindings';

// Re-export utilities that are needed externally
export { initMediaLightbox } from './mediaHandlers';
export { initProseImageTilt } from './proseImageTilt';

/**
 * Query all required elements for split view
 */
function queryElements(splitView: HTMLElement): SplitViewElements | null {
  const searchInput = splitView.querySelector('.split-view__search') as HTMLInputElement | null;
  const typesList = splitView.querySelector('.split-view__types') as HTMLElement | null;
  const tagsList = splitView.querySelector('.split-view__tags') as HTMLElement | null;
  const clearAllButton = splitView.querySelector('.split-view__clear-all-filters') as HTMLElement | null;
  const noResults = splitView.querySelector('.split-view__no-results') as HTMLElement | null;
  const contentArea = splitView.querySelector('.split-view__content') as HTMLElement | null;
  const listItems = Array.from(splitView.querySelectorAll('.list-item')) as HTMLElement[];
  const navContainer = splitView.querySelector('.split-view__nav') as HTMLElement | null;
  const listPanel = splitView.querySelector('.split-view__list') as HTMLElement | null;
  const detailPanel = splitView.querySelector('.split-view__detail') as HTMLElement | null;

  if (!searchInput || !typesList || !tagsList || !clearAllButton || !noResults || !contentArea) {
    console.error('Split view: missing required elements');
    return null;
  }

  return {
    splitView,
    searchInput,
    typesList,
    tagsList,
    clearAllButton,
    noResults,
    contentArea,
    listItems,
    navContainer,
    listPanel,
    detailPanel,
  };
}

/**
 * Initialize split view functionality
 */
export function initSplitView(): void {
  const splitView = document.querySelector('.split-view') as HTMLElement | null;
  if (!splitView) return;

  // Prevent duplicate initialization
  if ((splitView as any).__splitViewInitialized) return;
  (splitView as any).__splitViewInitialized = true;

  const elements = queryElements(splitView);
  if (!elements) return;

  const section = splitView.dataset.section || '';
  const initialSlug = splitView.dataset.initialSlug || null;

  // Initialize state
  const state: SplitViewState = {
    section,
    currentSlug: initialSlug,
    isAnimating: false,
    isIdle: false,
    resumeTimer: null,
  };

  // Initialize idle manager
  const idleManager = createIdleManager(splitView, state);

  // Restore filter state from URL
  const { search: initialSearch, tags: initialTags, types: initialTypes } = getFiltersFromURL();
  elements.searchInput.value = initialSearch;
  populateTags(elements.tagsList, elements.listItems, initialTags);
  populateTypes(elements.typesList, elements.listItems, initialTypes);
  // Reflect restored (non-search) filters on the clear button
  elements.clearAllButton.hidden = initialTags.size === 0 && initialTypes.size === 0;
  applyFilters(elements.listItems, elements.noResults);

  // Mark initial active item
  if (initialSlug) {
    const activeItem = splitView.querySelector(`[data-slug="${initialSlug}"]`) as HTMLElement | null;
    if (activeItem) {
      activeItem.classList.add('is-active');
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }

  // Bind all events
  bindFilterEvents(elements, state, idleManager);
  bindGlobalEvents(section);
  bindListEvents(elements, state, idleManager);

  // Initialize idle event listeners
  initIdleEventListeners(elements.detailPanel, idleManager.stopFloating);
  initEmblemHoverListeners(state, idleManager.startFloating);

  // Start floating if initial content is loaded
  if (initialSlug) {
    idleManager.startFloating();
  } else {
    // No slug in the URL — auto-open the newest visible entry so visitors
    // land on content instead of the empty placeholder. URL stays untouched
    // until the user actually selects something. Desktop only: in the
    // single-column layout .has-selection collapses the list panel, which
    // must stay visible — detect the applied layout, not the viewport.
    const isDesktopLayout =
      getComputedStyle(splitView).gridTemplateColumns.trim().split(/\s+/).length >= 3;
    const firstVisible = elements.listItems.find(item => !item.classList.contains('is-filtered'));
    const firstSlug = firstVisible?.dataset.slug;
    if (isDesktopLayout && firstSlug) {
      loadContent(firstSlug, elements, state, idleManager, { pushHistory: false, focusHeading: false });
    }
  }
}
