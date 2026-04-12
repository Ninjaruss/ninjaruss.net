/**
 * Trigger emblem card flip animation.
 *
 * instant=false (first load): 300ms delayed simple flip (back → front, spring easing).
 * instant=true  (subsequent): immediate full 360° spin revealing the new emblem.
 *
 * Returns a promise that resolves when animation completes.
 */
export function triggerEmblemFlip(doc?: Document, instant = true): Promise<void> {
  return new Promise((resolve) => {
    const emblemCards = document.querySelectorAll('[data-emblem-card]');
    if (emblemCards.length === 0) {
      resolve();
      return;
    }

    const pageEmblem = doc?.querySelector('[data-page-emblem]');
    const emblemSrc = pageEmblem?.getAttribute('data-src') || '/images/emblems/default.svg';

    // Cinematic first-load reveal: update src then flip after 300ms entrance delay
    if (!instant) {
      emblemCards.forEach((card) => {
        const frontImg = card.querySelector('[data-emblem-front]') as HTMLImageElement;
        if (frontImg && emblemSrc) frontImg.src = emblemSrc;
      });
      setTimeout(() => {
        emblemCards.forEach((card) => {
          card.classList.add('is-flipped');
        });
        resolve();
      }, 300);
      return;
    }

    // Subsequent content change: full 360° spin (back → new emblem)
    const totalDuration = 800;

    emblemCards.forEach((card) => {
      const frontImg = card.querySelector('[data-emblem-front]') as HTMLImageElement;
      const flipper = card.querySelector('.emblem-card__flipper') as HTMLElement;
      if (!flipper) return;

      // Disable transitions, force to 180deg (showing front), then animate to 540deg
      flipper.style.transition = 'none';
      card.classList.remove('is-flipped');
      flipper.style.transform = 'rotateY(180deg)';

      // Force reflow
      void flipper.offsetWidth;

      flipper.style.transition = `transform ${totalDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
      flipper.style.transform = 'rotateY(540deg)';

      // Update image early in the backing-visible window.
      // Spring easing is fast: the front re-emerges at ~25% of totalDuration (~200ms),
      // so 0.5 is too late. 0.15 lands at ~120ms — solidly mid-backing, ~70° before reveal.
      setTimeout(() => {
        if (frontImg && emblemSrc) frontImg.src = emblemSrc;
      }, totalDuration * 0.15);

      // Normalize to 180deg after spin completes
      setTimeout(() => {
        flipper.style.transition = 'none';
        flipper.style.transform = 'rotateY(180deg)';
        card.classList.add('is-flipped');

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
