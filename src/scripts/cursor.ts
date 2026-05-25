const TILE_SELECTOR =
  '.bento-tile--interactive, .logo-tile, .image-tile, .title-tile';

function init(): void {
  const dot = document.getElementById('cursor');
  if (!dot) return;

  document.addEventListener('mousemove', (e) => {
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
  });

  // Event delegation — works across navigations without rebinding
  document.addEventListener('mouseover', (e) => {
    const overTile = !!(e.target as Element).closest(TILE_SELECTOR);
    dot.classList.toggle('cursor--active', overTile);
  });
}

// Guard: module scripts deduplicate in browsers, but be explicit
if (!(window as any).__cursorInit) {
  (window as any).__cursorInit = true;
  init();
}
