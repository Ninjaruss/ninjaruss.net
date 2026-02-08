import type { SplitViewElements, SplitViewState } from './types';
import { getFiltersFromURL } from './urlState';
import { applyFilters } from './filterEngine';
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
  const typesList = splitView.querySelector('.split-view__type-list') as HTMLElement | null;
  const typeToggle = splitView.querySelector('.split-view__type-toggle') as HTMLElement | null;
  const typeDropdown = splitView.querySelector('.split-view__type-dropdown') as HTMLElement | null;
  const typeClear = splitView.querySelector('.split-view__type-clear') as HTMLElement | null;
  const typeFilter = splitView.querySelector('.split-view__type-filter') as HTMLElement | null;
  const tagsList = splitView.querySelector('.split-view__tags-list') as HTMLElement | null;
  const tagsToggle = splitView.querySelector('.split-view__tags-toggle') as HTMLElement | null;
  const tagsDropdown = splitView.querySelector('.split-view__tags-dropdown') as HTMLElement | null;
  const tagsClear = splitView.querySelector('.split-view__tags-clear') as HTMLElement | null;
  const tagsFilter = splitView.querySelector('.split-view__tags-filter') as HTMLElement | null;
  const clearAllButton = splitView.querySelector('.split-view__clear-all-filters') as HTMLElement | null;
  const noResults = splitView.querySelector('.split-view__no-results') as HTMLElement | null;
  const contentArea = splitView.querySelector('.split-view__content') as HTMLElement | null;
  const listItems = Array.from(splitView.querySelectorAll('.list-item')) as HTMLElement[];
  const navContainer = splitView.querySelector('.split-view__nav') as HTMLElement | null;
  const listPanel = splitView.querySelector('.split-view__list') as HTMLElement | null;
  const detailPanel = splitView.querySelector('.split-view__detail') as HTMLElement | null;

  if (!searchInput || !typesList || !typeToggle || !typeDropdown || !typeClear || !typeFilter ||
      !tagsList || !tagsToggle || !tagsDropdown || !tagsClear || !tagsFilter ||
      !clearAllButton || !noResults || !contentArea) {
    console.error('Split view: missing required elements');
    return null;
  }

  return {
    splitView,
    searchInput,
    typesList,
    typeToggle,
    typeDropdown,
    typeClear,
    typeFilter,
    tagsList,
    tagsToggle,
    tagsDropdown,
    tagsClear,
    tagsFilter,
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
  populateTags(elements.tagsList, elements.listItems, initialTags, elements.tagsFilter, elements.tagsToggle);
  populateTypes(elements.typesList, elements.listItems, initialTypes, elements.typeFilter, elements.typeToggle);
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
  }
}
