import type { SplitViewElements, SplitViewState } from './types';
import type { IdleManager } from './idleManager';
import { triggerEmblemFlip } from './emblemAnimation';
import { initMediaLightbox } from './mediaHandlers';

/**
 * Load detail content for a given slug
 */
export async function loadContent(
  slug: string,
  elements: SplitViewElements,
  state: SplitViewState,
  idleManager: IdleManager
): Promise<void> {
  const { splitView, contentArea, listItems } = elements;

  if (slug === state.currentSlug) return;

  // Wait for any ongoing animation to complete
  if (state.isAnimating) {
    return; // Ignore rapid clicks while animating
  }

  const isFirstLoad = state.currentSlug === null;

  listItems.forEach((i) => i.classList.remove('is-active'));
  const activeItem = splitView.querySelector(`[data-slug="${slug}"]`) as HTMLElement | null;
  if (activeItem) {
    activeItem.classList.add('is-active');
    // Scroll the active item into view with smooth behavior
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  splitView.classList.add('has-selection', 'is-loading');
  contentArea.classList.remove('is-active');

  try {
    const response = await fetch(`/${state.section}/${slug}/`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const entryContent = doc.querySelector('.entry');

    if (entryContent) {
      contentArea.innerHTML = entryContent.outerHTML;
      contentArea.classList.add('is-active');
      history.pushState({ slug }, '', `/${state.section}/${slug}/`);
      state.currentSlug = slug;

      const heading = contentArea.querySelector('h1, h2, .entry__title') as HTMLElement;
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }

      setTimeout(() => initMediaLightbox(), 50);

      // Trigger emblem card flip animation
      // Skip animation on first load to avoid placeholder flash
      state.isAnimating = true;
      await triggerEmblemFlip(doc, isFirstLoad);
      state.isAnimating = false;

      // Start floating for newly loaded content
      idleManager.startFloating();
    }
  } catch (error) {
    console.error('Failed to load content:', error);
    window.location.href = `/${state.section}/${slug}/`;
  } finally {
    splitView.classList.remove('is-loading');
  }
}
