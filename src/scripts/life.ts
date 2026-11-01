// Keep this imported browser entry point out of the global script scope.
export {};

function initLife() {
  const root = document.querySelector<HTMLElement>('[data-life]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const panels = [...root.querySelectorAll<HTMLElement>('[data-life-panel]')];
  const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-life-link]')];
  function select() {
    if (!root?.isConnected) return;
    const hash = window.location.hash.slice(1);
    const destination = document.getElementById(hash);
    const selected = destination?.closest<HTMLElement>('[data-life-panel]')?.id
      ?? (panels.some(panel => panel.id === hash) ? hash : 'making');
    panels.forEach(panel => { panel.hidden = panel.id !== selected; });
    links.forEach(link => {
      if (link.hash === `#${selected}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (destination && hash.startsWith('day-')) destination.scrollIntoView({ block: 'start' });
  }
  select();
  window.addEventListener('hashchange', select);
  document.addEventListener('astro:before-swap', () => window.removeEventListener('hashchange', select), { once: true });
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
