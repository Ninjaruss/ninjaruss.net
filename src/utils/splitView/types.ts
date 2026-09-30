export interface SplitViewElements {
  splitView: HTMLElement;
  /** Filter chrome is absent on bare surfaces (e.g. /showcase) — all nullable. */
  searchInput: HTMLInputElement | null;
  /** Segmented type control (.split-view__types); hidden when <2 types */
  typesList: HTMLElement | null;
  clearAllButton: HTMLElement | null;
  noResults: HTMLElement | null;
  contentArea: HTMLElement;
  listItems: HTMLElement[];
  navContainer: HTMLElement | null;
  listPanel: HTMLElement | null;
  detailPanel: HTMLElement | null;
}

export interface FilterState {
  search: string;
  types: Set<string>;
}

export interface SplitViewState {
  section: string;
  currentSlug: string | null;
  isAnimating: boolean;
  /** True while a detail fetch is in flight. Guards against two overlapping
   *  fetches resolving out of order (the winner would otherwise be whichever
   *  response arrived last, leaving entry X's body under entry Y's URL). */
  isLoading: boolean;
  isIdle: boolean;
  resumeTimer: number | null;
}

// Extend Window for global APIs
declare global {
  interface Window {
    __splitViewInitialized?: boolean;
    __splitViewGlobalHandlers?: boolean;
    __splitViewIdleHandlers?: boolean;
    openMediaLightbox?: (src: string, alt: string, type: 'image' | 'video') => void;
  }
}

export {};
