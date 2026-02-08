/**
 * Initialize 3D tilt effect on prose images
 */
export function initProseImageTilt(): void {
  const proseImages = document.querySelectorAll('.split-view__content .prose img');

  proseImages.forEach((img) => {
    if ((img as HTMLElement).dataset.tiltInit === 'true') return;
    (img as HTMLElement).dataset.tiltInit = 'true';

    let rafId: number | null = null;

    function handleMouseMove(e: MouseEvent) {
      const rect = img.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      // Max 5 degree tilt (subtle)
      const rotateY = (mouseX / (rect.width / 2)) * 5;
      const rotateX = -(mouseY / (rect.height / 2)) * 5;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        (img as HTMLElement).style.transform = `
          perspective(800px)
          rotateY(${rotateY}deg)
          rotateX(${rotateX}deg)
          scale(1.03)
        `;
      });
    }

    function handleMouseLeave() {
      if (rafId) cancelAnimationFrame(rafId);
      (img as HTMLElement).style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
    }

    if (window.matchMedia('(hover: hover)').matches) {
      img.addEventListener('mousemove', handleMouseMove as EventListener);
      img.addEventListener('mouseleave', handleMouseLeave);
    }
  });
}
