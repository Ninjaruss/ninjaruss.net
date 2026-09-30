import type { SplitViewElements, SplitViewState } from './types';
import type { IdleManager } from './idleManager';
import { triggerEmblemFlip } from './emblemAnimation';
import { initMediaLightbox } from './mediaHandlers';

/**
 * Sync page-level metadata (title, description, OG tags) from a fetched document
 */
function syncPageMeta(doc: Document): void {
  // Title
  const newTitle = doc.title;
  if (newTitle) document.title = newTitle;

  // Helper to sync a single <meta> tag by attribute selector
  const syncMeta = (selector: string, attr: 'content') => {
    const src = doc.head.querySelector(selector) as HTMLMetaElement | null;
    const dst = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (src && dst) dst[attr] = src[attr];
  };

  syncMeta('meta[name="description"]', 'content');
  syncMeta('meta[property="og:title"]', 'content');
  syncMeta('meta[property="og:description"]', 'content');
  syncMeta('meta[property="og:image"]', 'content');
  syncMeta('meta[property="og:type"]', 'content');
  syncMeta('meta[property="og:url"]', 'content');
  syncMeta('meta[name="twitter:title"]', 'content');
  syncMeta('meta[name="twitter:description"]', 'content');
  syncMeta('meta[name="twitter:image"]', 'content');

  // Canonical URL
  const srcCanonical = doc.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  const dstCanonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (srcCanonical && dstCanonical) dstCanonical.href = srcCanonical.href;
}

/**
 * Load detail content for a given slug
 */
export async function loadContent(
  slug: string,
  elements: SplitViewElements,
  state: SplitViewState,
  idleManager: IdleManager,
  options: { pushHistory?: boolean; focusHeading?: boolean; scroll?: boolean } = {}
): Promise<void> {
  const { pushHistory = true, focusHeading = true, scroll = true } = options;
  const { splitView, contentArea, listItems, detailPanel } = elements;

  if (slug === state.currentSlug) return;

  // Ignore a second load while one is in flight. The old guard read
  // state.isAnimating, which was only set to true AFTER the fetch resolved and
  // the DOM had already been replaced — so it never blocked the race it was
  // written for. See the isLoading reset in the finally block.
  if (state.isLoading) return;
  state.isLoading = true;

  const isFirstLoad = state.currentSlug === null;

  listItems.forEach((i) => i.classList.remove('is-active'));
  const activeItem = splitView.querySelector(`[data-slug="${slug}"]`) as HTMLElement | null;
  if (activeItem) {
    activeItem.classList.add('is-active');
    // `behavior: 'smooth'` is explicit here, but note the *inherited* case: any
    // scrollIntoView without a behavior honours html { scroll-behavior: smooth }
    // (BaseLayout), where that rule is now gated on
    // prefers-reduced-motion: no-preference.
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const activeHref = activeItem?.getAttribute('href');
  const path = activeHref ?? `/${state.section}/${slug}/`;

  splitView.classList.add('has-selection', 'is-loading');
  contentArea.classList.remove('is-active');

  try {
    const response = await fetch(path);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const entryContent = doc.querySelector('.entry');

    if (entryContent) {
      contentArea.innerHTML = entryContent.outerHTML;
      contentArea.classList.add('is-active');

      /* Reset the detail panel's scroll. The scroller is the panel itself, not
         the element whose contents we just replaced, so nothing reset it before —
         and combined with focus({ preventScroll: true }) below, reading a long
         entry then clicking another left you mid-article with the new title above
         the fold. Skipped when restoring from popstate, where the visitor's own
         position is theirs to keep. */
      if (scroll && detailPanel) detailPanel.scrollTop = 0;

      if (pushHistory) {
        /* `null` state on purpose. SpreadView pushes real history entries, and
           Astro's ClientRouter treats any non-null state without its own `index`
           key as one of its owns traversals (router.js: `if (ev.state === null)
           return;`) — so it re-fetched and swapped the whole document on Back,
           replaying the page transition and scrolling to top. The shelf wall
           pushes null for exactly this reason. */
        history.pushState(null, '', path);
        // Sync page metadata from the fetched document
        syncPageMeta(doc);
      }
      state.currentSlug = slug;

      if (focusHeading) {
        const heading = contentArea.querySelector('h1, h2, .entry__title') as HTMLElement;
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        }
      }

      setTimeout(() => initMediaLightbox(), 50);

      // Trigger emblem card flip animation
      // Skip animation on first load to avoid placeholder flash
      state.isAnimating = true;
      await triggerEmblemFlip(doc, !isFirstLoad);
      state.isAnimating = false;

      // Start floating for newly loaded content
      idleManager.startFloating();
    }
  } catch (error) {
    console.error('Failed to load content:', error);
    window.location.href = path;
  } finally {
    splitView.classList.remove('is-loading');
    state.isLoading = false;
  }
}

/**
 * Clears the detail panel back to the empty "Choose an entry" state.
 *
 * Also resets `currentSlug`. Without that, a Forward press after Back hits the
 * `slug === state.currentSlug` early return above and renders nothing at all —
 * leaving the URL claiming an entry while the panel stays empty, permanently.
 */
export function clearContent(elements: SplitViewElements, state: SplitViewState): void {
  const { splitView, contentArea, listItems } = elements;
  splitView.classList.remove('has-selection');
  contentArea.classList.remove('is-active');
  contentArea.innerHTML = '';
  listItems.forEach((i) => i.classList.remove('is-active'));
  state.currentSlug = null;
}
