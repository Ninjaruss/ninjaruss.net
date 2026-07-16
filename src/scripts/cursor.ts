const TILE_SELECTOR =
  '.bento-tile--interactive, .logo-tile, .image-tile, .title-tile';

function init(): void {
  const dot = document.getElementById('cursor');
  if (!dot) return;

  // Only take over the cursor on hover-capable (pointer) devices, and only
  // once JS is confirmed running. CSS hides the native cursor via
  // `html.has-custom-cursor`, so until this class lands the native pointer
  // stays visible — the page is never left with no cursor if this fails.
  if (typeof matchMedia !== 'function' || matchMedia('(hover: hover)').matches) {
    document.documentElement.classList.add('has-custom-cursor');
  }

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
