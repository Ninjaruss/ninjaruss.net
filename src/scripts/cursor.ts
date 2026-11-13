/* Anything genuinely interactive, derived from the element type rather than a
   class list. The original was a hand-maintained list of homepage tile classes
   that drifted out of sync with the markup and then outlived it entirely; this
   cannot go stale the same way.

   The 2026-11-13 dead-code pass dropped the two leftover class hooks that were
   still in here: `.traces-bar` (TracesBar renders `.traces`, so it never
   matched) and `.traces-bullet` (a real class, but always on an `<a href>`,
   so `a[href]` already covers it). Both were inert regardless — TracesBar only
   appears on the homepage, which hides the custom cursor entirely. */
const TILE_SELECTOR = 'a[href], button, [role="button"]';

// Only take over the cursor on hover-capable (pointer) devices, and only once
// JS is confirmed running. CSS hides the native cursor via
// `html.has-custom-cursor`; until this class lands the native pointer stays
// visible, so a script failure never leaves the page with no cursor at all.
function shouldHideNativeCursor(): boolean {
  return typeof matchMedia !== 'function' || matchMedia('(hover: hover)').matches;
}

// Astro's view transitions reset <html>'s attributes on every swap (they are
// copied from the incoming page, which has no runtime class), so this must be
// re-applied after each navigation — not just on first load. Same reason the
// NavPill re-publishes --nav-clearance on navigation.
function applyCursorClass(): void {
  if (shouldHideNativeCursor()) {
    document.documentElement.classList.add('has-custom-cursor');
  }
}

function bindListeners(dot: HTMLElement): void {
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

// Guard: module scripts deduplicate in browsers, but be explicit.
if (!(window as any).__cursorInit) {
  (window as any).__cursorInit = true;
  // The dot carries transition:persist, so this reference stays valid across
  // view transitions and its listeners only need binding once.
  const dot = document.getElementById('cursor');
  if (dot) {
    bindListeners(dot);
    applyCursorClass(); // initial load
    // astro:after-swap fires before the new page paints, so re-adding the class
    // here keeps the native cursor from flashing back in mid-navigation.
    document.addEventListener('astro:after-swap', applyCursorClass);
  }
}
