/**
 * Initialize lightbox for images/videos in prose content
 * Called after content loads
 */

/**
 * Make a prose media element behave like a button for keyboard users.
 * Same pattern as EmblemCard: role="button" + tabindex="0" + Enter/Space,
 * preventDefault on Space so the page doesn't scroll under the lightbox.
 */
function makeActivatable(el: HTMLElement, label: string, open: () => void): void {
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', label);

  el.addEventListener('click', open);
  el.addEventListener('keydown', (e) => {
    const key = (e as KeyboardEvent).key;
    if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      open();
    }
  });
}

export function initMediaLightbox(): void {
  const proseImages = document.querySelectorAll('.split-view__content .prose img');
  proseImages.forEach((node) => {
    const img = node as HTMLImageElement;
    if (img.dataset.lightboxInit === 'true') return;
    img.dataset.lightboxInit = 'true';

    const open = () => {
      const src = img.src;
      const alt = img.alt || '';
      if (src && window.openMediaLightbox) {
        window.openMediaLightbox(src, alt, 'image');
      }
    };

    // role="button" replaces the img role, so the alt text stops being
    // announced as image content — fold it into the accessible name.
    const label = img.alt ? `View full size: ${img.alt}` : 'View image full size';
    makeActivatable(img, label, open);
  });

  const proseVideos = document.querySelectorAll('.split-view__content .prose video');
  proseVideos.forEach((node) => {
    const video = node as HTMLVideoElement;
    if (video.dataset.lightboxInit === 'true') return;
    video.dataset.lightboxInit = 'true';

    const open = () => {
      const src = video.src || video.querySelector('source')?.src || '';
      if (src && window.openMediaLightbox) {
        window.openMediaLightbox(src, '', 'video');
      }
    };

    // A <video controls> is already focusable and owns Enter/Space (play/pause);
    // overriding it with button semantics would break its native controls, so
    // those keep click-to-open only. Controls-less videos get the button pattern.
    if (video.hasAttribute('controls')) {
      video.addEventListener('click', open);
    } else {
      makeActivatable(video, 'View video full size', open);
    }
  });
}
