/**
 * Trigger emblem card flip animation - single 360° spin to the right
 * Sequence: emblem (front) → card back → new emblem (front)
 * Returns a promise that resolves when animation completes
 */
export function triggerEmblemFlip(doc?: Document, skipAnimation = false): Promise<void> {
  return new Promise((resolve) => {
    const emblemCards = document.querySelectorAll('[data-emblem-card]');
    if (emblemCards.length === 0) {
      resolve();
      return;
    }

    // Extract emblem source from fetched page if available
    const pageEmblem = doc?.querySelector('[data-page-emblem]');
    const emblemSrc = pageEmblem?.getAttribute('data-src') || '/images/emblems/default.svg';

    const totalDuration = 800; // Total duration for full 360° spin

    // If skipping animation (first load), just update the image directly
    if (skipAnimation) {
      emblemCards.forEach((card) => {
        const frontImg = card.querySelector('[data-emblem-front]') as HTMLImageElement;
        if (frontImg && emblemSrc) {
          frontImg.src = emblemSrc;
        }
        card.classList.add('is-flipped');
      });
      resolve();
      return;
    }

    emblemCards.forEach((card) => {
      const frontImg = card.querySelector('[data-emblem-front]') as HTMLImageElement;
      const flipper = card.querySelector('.emblem-card__flipper') as HTMLElement;
      if (!flipper) return;

      // Disable transitions FIRST, then modify classes/styles
      flipper.style.transition = 'none';
      card.classList.remove('is-flipped');
      flipper.style.transform = 'rotateY(180deg)';

      // Force reflow
      void flipper.offsetWidth;

      // Single smooth spin from 180deg to 540deg (full 360°)
      flipper.style.transition = `transform ${totalDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      flipper.style.transform = 'rotateY(540deg)';

      // Update image near end (after card backing shown, before new emblem visible)
      setTimeout(() => {
        if (frontImg && emblemSrc) {
          frontImg.src = emblemSrc;
        }
      }, totalDuration * 0.5);

      // After animation completes, normalize to 180deg (540 % 360 = 180)
      setTimeout(() => {
        flipper.style.transition = 'none';
        flipper.style.transform = 'rotateY(180deg)';
        card.classList.add('is-flipped');

        // Re-enable transitions after a frame to avoid conflicts
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            flipper.style.transition = '';
            resolve();
          });
        });
      }, totalDuration);
    });
  });
}
