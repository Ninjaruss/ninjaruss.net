export interface SplitViewElements {
  splitView: HTMLElement;
  searchInput: HTMLInputElement;
  typesList: HTMLElement;
  typeToggle: HTMLElement;
  typeDropdown: HTMLElement;
  typeClear: HTMLElement;
  typeFilter: HTMLElement;
  tagsList: HTMLElement;
  tagsToggle: HTMLElement;
  tagsDropdown: HTMLElement;
  tagsClear: HTMLElement;
  tagsFilter: HTMLElement;
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
