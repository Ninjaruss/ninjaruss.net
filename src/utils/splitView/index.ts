import type { SplitViewElements, SplitViewState } from './types';
import { getFiltersFromURL } from './urlState';
import { applyFilters } from './filterEngine';
import { loadContent } from './contentLoader';
import { populateTypes } from './filterUI';
import { createIdleManager, initIdleEventListeners, initEmblemHoverListeners } from './idleManager';
import { bindFilterEvents, bindGlobalEvents, bindListEvents } from './eventBindings';
import { pickDrawCandidate } from './drawCard';

// Re-export utilities that are needed externally
export { initMediaLightbox } from './mediaHandlers';
export { initProseImageTilt } from './proseImageTilt';

/**
 * Query all required elements for split view
 */
function queryElements(splitView: HTMLElement): SplitViewElements | null {
  const searchInput = splitView.querySelector('.split-view__search') as HTMLInputElement | null;
  const typesList = splitView.querySelector('.split-view__types') as HTMLElement | null;
  const clearAllButton = splitView.querySelector('.split-view__clear-all-filters') as HTMLElement | null;
  const noResults = splitView.querySelector('.split-view__no-results') as HTMLElement | null;
  const contentArea = splitView.querySelector('.split-view__content') as HTMLElement | null;
  const listItems = Array.from(splitView.querySelectorAll('.list-item')) as HTMLElement[];
  const navContainer = splitView.querySelector('.split-view__nav') as HTMLElement | null;
  const listPanel = splitView.querySelector('.split-view__list') as HTMLElement | null;
  const detailPanel = splitView.querySelector('.split-view__detail') as HTMLElement | null;

  if (!searchInput || !typesList || !clearAllButton || !noResults || !contentArea) {
    console.error('Split view: missing required elements');
    return null;
  }

  return {
    splitView,
    searchInput,
    typesList,
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
  const { search: initialSearch, types: initialTypes } = getFiltersFromURL();
  elements.searchInput.value = initialSearch;
  populateTypes(elements.typesList, elements.listItems, initialTypes);
  // Reflect restored (non-search) filters on the clear button
  elements.clearAllButton.hidden = initialTypes.size === 0;
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
    // Retried on a timer: styles can land after init (dev serves them via JS
    // modules), and requestAnimationFrame is throttled or suspended entirely in
    // background/non-rendering tabs — setTimeout still fires there. 20 fast
    // attempts, then a slower tail (~6.5s total) for pages that load styles
    // late; window "load" additionally re-kicks it once. Polling only ever
    // starts on ≥1200px viewports (gate below), where the 3-track layout is
    // guaranteed to eventually apply — so the poll can't run dry against a
    // legitimately-mobile layout. A detached splitView means the page was
    // swapped away — stop.
    const tryAutoOpen = (attempt: number) => {
      if (!splitView.isConnected || state.currentSlug !== null) return;
      const isDesktopLayout =
        getComputedStyle(splitView).gridTemplateColumns.trim().split(/\s+/).length >= 3;
      if (!isDesktopLayout) {
        if (attempt < 40) setTimeout(() => tryAutoOpen(attempt + 1), attempt < 20 ? 75 : 250);
        return;
      }
      const firstVisible = elements.listItems.find(item => !item.classList.contains('is-filtered'));
      const firstSlug = firstVisible?.dataset.slug;
      if (firstSlug) {
        loadContent(firstSlug, elements, state, idleManager, { pushHistory: false, focusHeading: false });
      }
    };
    // Viewports below the 1200px breakpoint (SplitViewLayout.astro's tablet
    // media query drops the 3-column grid to 2 columns, and below 900px it
    // collapses to a single stacked column) can never satisfy the >=3-column
    // check above — skip the poll entirely rather than running it dry. The
    // query-change listener covers viewports that only become desktop-wide
    // after init (embedded panes can even report 0×0 at load); tryAutoOpen's
    // own guards make every extra kick a no-op once content is open.
    const desktopQuery = window.matchMedia('(min-width: 1200px)');
    const kickAutoOpen = () => {
      if (desktopQuery.matches) tryAutoOpen(0);
    };
    kickAutoOpen();
    if (document.readyState !== 'complete') {
      window.addEventListener('load', kickAutoOpen, { once: true });
    }
    desktopQuery.addEventListener('change', kickAutoOpen, { once: true });
  }

  // --- Draw a card (journal serendipity) ---
  const drawDeck = splitView.querySelector('[data-draw-deck]') as HTMLElement | null;
  const drawMobile = splitView.querySelector('[data-draw-mobile]') as HTMLElement | null;

  const drawPool = () =>
    elements.listItems
      .filter((item) => !item.classList.contains('is-filtered'))
      .map((item) => ({
        slug: item.dataset.slug || '',
        type: item.dataset.contentType || '',
        href: item.getAttribute('href') || '',
        title: item.querySelector('.list-item__title')?.textContent || '',
        emblem: item.dataset.emblem || '/images/emblems/default.svg',
      }));

  if (drawDeck) {
    const deckButton = drawDeck.querySelector('.split-view__draw-deck') as HTMLElement;
    const faceButton = drawDeck.querySelector('.split-view__draw-face') as HTMLButtonElement;
    const faceEmblem = drawDeck.querySelector('.split-view__draw-emblem') as HTMLImageElement;
    const faceTitle = drawDeck.querySelector('.split-view__draw-title') as HTMLElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let drawnSlug: string | null = null;

    // One draw per visit by design: the deck hides once the face is revealed.
    // The exclusion slug only matters for double-activation during the flip.
    const draw = () => {
      const picked = pickDrawCandidate(drawPool(), Math.random, drawnSlug ?? undefined);
      if (!picked) return;
      drawnSlug = picked.slug;
      faceEmblem.src = picked.emblem;
      faceTitle.textContent = picked.title;
      faceButton.setAttribute('aria-label', `Open "${picked.title}"`);
      const reveal = () => {
        drawDeck.classList.remove('is-flipping');
        deckButton.hidden = true;
        faceButton.hidden = false;
        faceButton.focus();
      };
      if (reduceMotion.matches) {
        reveal();
      } else {
        drawDeck.classList.add('is-flipping');
        setTimeout(reveal, 200);
      }
    };

    deckButton.addEventListener('click', draw);
    faceButton.addEventListener('click', () => {
      if (!drawnSlug) return;
      const item = splitView.querySelector(`[data-slug="${drawnSlug}"]`) as HTMLElement | null;
      item?.click(); // normal selection path: history push, active state, load
    });
  }

  if (drawMobile) {
    // Only meaningful in the stacked layout, where the placeholder (and its
    // deck) is hidden — reveal it there and keep desktop to the deck. The
    // attribute stays in charge (not a media query) because attribute-hidden
    // beats CSS display rules.
    const stackedQuery = window.matchMedia('(max-width: 900px)');
    // Self-removing: the MediaQueryList is window-scoped and would otherwise
    // retain a detached button across view-transition swaps.
    const syncDrawMobile = () => {
      if (!drawMobile.isConnected) {
        stackedQuery.removeEventListener('change', syncDrawMobile);
        return;
      }
      drawMobile.hidden = !stackedQuery.matches;
    };
    syncDrawMobile();
    stackedQuery.addEventListener('change', syncDrawMobile);
    drawMobile.addEventListener('click', () => {
      const picked = pickDrawCandidate(drawPool(), Math.random);
      if (picked?.href) window.location.href = picked.href;
    });
  }
}
