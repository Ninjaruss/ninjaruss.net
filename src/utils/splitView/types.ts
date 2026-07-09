export interface SplitViewElements {
  splitView: HTMLElement;
  searchInput: HTMLInputElement;
  /** Segmented type control (.split-view__types); hidden when <2 types */
  typesList: HTMLElement;
  /** Inline tag pill row (.split-view__tags); hidden when no tags */
  tagsList: HTMLElement;
  clearAllButton: HTMLElement;
  noResults: HTMLElement;
  contentArea: HTMLElement;
  listItems: HTMLElement[];
  navContainer: HTMLElement | null;
  listPanel: HTMLElement | null;
  detailPanel: HTMLElement | null;
}

export interface FilterState {
  search: string;
  tags: Set<string>;
  types: Set<string>;
}

export interface SplitViewState {
  section: string;
  currentSlug: string | null;
  isAnimating: boolean;
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
