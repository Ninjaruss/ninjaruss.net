/**
 * Initialize lightbox for images/videos in prose content
 * Called after content loads
 */
export function initMediaLightbox(): void {
  const proseImages = document.querySelectorAll('.split-view__content .prose img');
  proseImages.forEach((img) => {
    if ((img as HTMLElement).dataset.lightboxInit === 'true') return;
    (img as HTMLElement).dataset.lightboxInit = 'true';

    img.addEventListener('click', () => {
      const src = (img as HTMLImageElement).src;
      const alt = (img as HTMLImageElement).alt || '';
      if (src && window.openMediaLightbox) {
        window.openMediaLightbox(src, alt, 'image');
      }
    });
  });

  const proseVideos = document.querySelectorAll('.split-view__content .prose video');
  proseVideos.forEach((video) => {
    if ((video as HTMLElement).dataset.lightboxInit === 'true') return;
    (video as HTMLElement).dataset.lightboxInit = 'true';

    video.addEventListener('click', () => {
      const src = (video as HTMLVideoElement).src ||
                  (video as HTMLVideoElement).querySelector('source')?.src || '';
      if (src && window.openMediaLightbox) {
        window.openMediaLightbox(src, '', 'video');
      }
    });
  });
}
