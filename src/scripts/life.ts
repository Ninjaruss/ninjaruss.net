// Keep this imported browser entry point out of the global script scope.
export {};

function initLife() {
  const root = document.querySelector<HTMLElement>('[data-life]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const map = root.querySelector<HTMLDetailsElement>('[data-life-map-disclosure]');
  function revealMap() {
    if (!root?.isConnected || !map) return;
    const hash = window.location.hash.slice(1);
    const destination = document.getElementById(hash);
    if (hash === 'places' || (destination && map.contains(destination))) {
      map.open = true;
      destination?.scrollIntoView({ block: 'start' });
    }
  }
  revealMap();
  window.addEventListener('hashchange', revealMap);
  document.addEventListener('astro:before-swap', () => window.removeEventListener('hashchange', revealMap), { once: true });
}

function initLifeMail() {
  const link = document.querySelector<HTMLAnchorElement>('#life-mail');
  if (!link || link.textContent) return;
  const address = ['mailbox', ['ninjaruss', 'net'].join('.')].join('@');
  link.textContent = 'Email me';
  link.href = `mailto:${address}`;
  link.hidden = false;
}

function init() { initLife(); initLifeMail(); }
init();
document.addEventListener('astro:page-load', init);
