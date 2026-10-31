const initialized = new WeakSet();
function updateContext(root, selected, panels) {
  const strip = root.querySelector('[data-map-context]');
  if (!strip || strip.dataset.mapContext === selected.id) return;
  const trail = strip.querySelector('[data-map-context-trail]');
  const chain = [], seen = new Set();
  let panel = selected;
  while (panel && !seen.has(panel.id)) {
    seen.add(panel.id); chain.unshift(panel);
    const parent = panel.querySelector('[data-map-back]')?.getAttribute('href');
    panel = panels.find(item=>'#'+item.id === parent);
  }
  const label = item => {
    const title = item.querySelector('h3').textContent.trim();
    return item.dataset.mapArea && item.id === `life-map-${item.dataset.mapArea}` ? title.split(' / ')[0] : title;
  };
  trail.replaceChildren(...chain.map(item=> {
    const li = document.createElement('li');
    const current = item === selected;
    const name = document.createElement(current ? 'span' : 'a');
    name.textContent = label(item);
    if (current) {
      name.setAttribute('aria-current','location'); name.tabIndex = -1;
      name.setAttribute('data-map-context-current','');
    } else { name.href = '#'+item.id; name.setAttribute('data-astro-reload',''); }
    li.append(name); return li;
  }));
  const back = strip.querySelector('[data-map-context-back]');
  const parent = chain.at(-2);
  back.hidden = !parent;
  if (parent) {
    back.href = '#'+parent.id; back.setAttribute('aria-label',`Back to ${label(parent)}`);
    back.setAttribute('data-astro-reload','');
  } else back.removeAttribute('href');
  strip.dataset.mapContext = selected.id;
  strip.hidden = false;
  root.dataset.contextReady = 'true';
  root.querySelectorAll('.life-map__heading [data-map-back]').forEach(link=> {
    link.tabIndex = -1; link.setAttribute('aria-hidden','true');
  });
}
function selectMap(root, moveFocus = false) {
  const hash = location.hash.slice(1);
  const panels = [...root.querySelectorAll('[data-map-panel]')];
  const selected = panels.find(panel => panel.id === hash) ?? panels.find(panel => panel.id === root.dataset.mapInitial) ?? panels[0];
  panels.forEach(panel => { panel.hidden = panel !== selected; });
  updateContext(root,selected,panels);
  if (root.querySelector('.life-map__overview')) root.querySelectorAll('.map-destination').forEach(link=>link.classList.toggle('is-selected',link.getAttribute('href') === `#life-map-${selected.dataset.mapArea}`));
  root.querySelectorAll('[data-map-choice]').forEach(link => {
    if (link.getAttribute('href') === `#${selected.id}`) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
  if (moveFocus && selected.id === hash) {
    root.scrollIntoView({block:'start',behavior:'instant'});
    (root.querySelector('[data-map-context-current]') ?? selected.querySelector('h3')).focus({preventScroll:true});
  }
  root.dataset.mapReady = 'true';
}
export function initLifeMaps() {
  document.querySelectorAll('[data-life-map]').forEach(root => {
    selectMap(root);
    if (initialized.has(root)) return;
    initialized.add(root);
    root.addEventListener('keydown', event => {
      const menu = event.target.closest('[data-map-options]');
      if (menu && ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key)) {
        const links = [...menu.querySelectorAll('a')], index = links.indexOf(document.activeElement);
        if (index < 0) return;
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length-1 : (index + (['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 1) + links.length) % links.length;
        event.preventDefault(); links[next].focus();
      }
      if (event.key === 'Escape') {
        const back = root.querySelector('[data-map-panel]:not([hidden]) [data-map-back]');
        if (back) { event.preventDefault(); back.click(); }
      }
    });
  });
}
initLifeMaps();
document.addEventListener('astro:page-load',initLifeMaps);
window.addEventListener('hashchange',()=>document.querySelectorAll('[data-life-map]').forEach(root=>selectMap(root,true)));
