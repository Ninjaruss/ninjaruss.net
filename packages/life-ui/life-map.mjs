import { FUKUOKA_AREAS, FUKUOKA_KEYS, renderFukuokaScene } from './fukuoka.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const target = key => `life-map-${key}`;
const regionKey = region => FUKUOKA_KEYS.has(region.mapKey) ? region.mapKey : `region-${region.id}`;
const choice = (key, label, extra = '') => `<a href="#${target(key)}" data-map-choice data-astro-reload ${extra}>${esc(label)}</a>`;
const safeHref = href => {
  if (typeof href !== 'string' || !/^\/(?!\/)/.test(href) || /[<>"'\s\\]/.test(href)) throw Error('Map record links must be safe local paths');
  return esc(href);
};

// A presentation-only contract. Callers supply their own validated records and
// local record URLs. There are no filesystem, network, auth, or provider imports.
/**
 * Fields consumed by the shared renderer. This presentation type does not
 * replace either caller's validation or publication boundary.
 * @typedef {Object} LifeMapRecord
 * @property {string} id
 * @property {'region'|'place'|'person'|'experience'|'event'} kind
 * @property {string} title
 * @property {string} [body]
 * @property {string} [mapKey]
 * @property {string} [parent]
 * @property {string} [region]
 * @property {{x: number, y: number}} [position]
 * @property {string} [date]
 * @property {string[]} [people]
 * @property {string[]} [places]
 * @property {string[]} [events]
 * @property {string[]} [regions]
 */

/**
 * @param {{
 *   records?: LifeMapRecord[],
 *   hrefForRecord: (record: LifeMapRecord) => string,
 *   initialRegionId?: string,
 *   instanceLabel?: string,
 *   minimal?: boolean
 * }} options
 */
export function renderLifeMap({ records = [], hrefForRecord, initialRegionId, instanceLabel = 'Explore the map', minimal = false }) {
  if (typeof hrefForRecord !== 'function') throw Error('Map needs a local record-link adapter');
  const byId = new Map();
  for (const record of records) {
    if (typeof record.id !== 'string' || !idPattern.test(record.id) || byId.has(record.id)) throw Error('Map requires unique safe record IDs');
    byId.set(record.id, record);
  }
  const regions = records.filter(record => record.kind === 'region');
  const places = records.filter(record => record.kind === 'place');
  const entries = records.filter(record => ['experience','event'].includes(record.kind));
  const children = region => regions.filter(record => record.parent === region.id);
  const scope = roots => {
    const ids = new Set(roots.map(record => record.id));
    const queue = [...ids];
    for (let i = 0; i < queue.length; i++) for (const region of regions) if (region.parent === queue[i] && !ids.has(region.id)) { ids.add(region.id); queue.push(region.id); }
    return ids;
  };
  const scopePlaces = roots => { const ids = scope(roots); return places.filter(place => ids.has(place.region)); };
  const rootsForKey = key => regions.filter(region => region.mapKey === key);
  const boundRegions = regions.filter(region => FUKUOKA_KEYS.has(region.mapKey));
  const unboundRoots = regions.filter(region => !FUKUOKA_KEYS.has(region.mapKey) && !region.parent);
  const link = record => `<a class="life-map__record" href="${safeHref(hrefForRecord(record))}"><strong>${esc(record.title)}</strong>${record.date ? `<time datetime="${esc(record.date)}">${esc(record.date)}</time>` : ''}</a>`;
  const list = (items, kind) => `<ul class="life-map__list">${items.map(record => `<li>${choice(kind === 'place' ? `place-${record.id}` : regionKey(record), record.title)}</li>`).join('')}</ul>`;
  const wardSvg = active => `<svg class="life-map__city" viewBox="0 0 1000 650" role="group" aria-label="Fukuoka area selection"><use href="#life-map-city-art"/><g class="map-destinations">${FUKUOKA_AREAS.map(area => `<a class="map-destination${active === area.key ? ' is-selected' : ''}" href="#${target(area.key)}" data-map-choice data-astro-reload aria-label="Explore ${area.name}" transform="translate(${area.x} ${area.y})"><rect class="map-destination-hit" x="-103" y="-64" width="173" height="90"/><path class="map-selection-cursor" d="M-98 -56 -79 -44 -98 -32Z"/><path class="map-destination-stem" d="M0 -22V-5"/><circle class="map-destination-dot" cy="-4" r="6"/><path class="map-destination-tag" d="M-65 -64H70L61 -24H-74Z"/><text class="map-destination-name" y="-37" text-anchor="middle">${area.name}</text><text class="map-destination-japanese" y="21" text-anchor="middle">${area.japanese}</text></a>`).join('')}</g></svg>`;
  const plot = destinations => `<svg class="life-map__plot" viewBox="0 0 1000 650" role="group" aria-label="Manually positioned places">${destinations.filter(place => place.position).map(place => {
    const {x,y} = place.position;
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) throw Error('Map positions must be between 0 and 100');
    const px = 85 + x * 8.3, py = 55 + y * 5.4;
    const label = place.title.length > 20 ? `${place.title.slice(0,19)}…` : place.title;
    return `<a class="life-map__pin" href="#${target(`place-${place.id}`)}" data-map-choice data-astro-reload transform="translate(${px} ${py})" aria-label="Open ${esc(place.title)}"><rect x="-78" y="-28" width="156" height="56"/><text text-anchor="middle" y="6">${esc(label)}</text></a>`;
  }).join('')}</svg>`;
  const linkedEntries = (regionIds, placeIds) => entries.flatMap(entry => {
    const direct = (entry.regions ?? []).some(id => regionIds.has(id)) || (entry.places ?? []).some(id => placeIds.has(id));
    if (direct) return [{...entry,uiVia:[]}];
    if ((entry.places ?? []).length) return [];
    const via = (entry.events ?? []).map(id => byId.get(id)).filter(event => event?.kind === 'event' && (event.places ?? []).some(id => placeIds.has(id)));
    return via.length ? [{...entry,uiVia:via}] : [];
  }).sort((a,b) => (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title));
  const peopleFor = items => { const ids = new Set(items.flatMap(entry => entry.people ?? [])); return records.filter(record => record.kind === 'person' && ids.has(record.id)); };
  const context = (items, emptyText) => minimal && !items.length ? '' : `<section class="life-map__history"><h4>Entries</h4>${items.length ? items.map(entry => `<div>${link(entry)}${entry.uiVia.length ? `<p class="life-map__quiet">${minimal ? 'Series context: ' : 'Connected through '} ${entry.uiVia.map(event => `<a href="${safeHref(hrefForRecord(event))}">${esc(event.title)}</a>`).join(', ')}${minimal ? '; place unrecorded.' : '; no specific place is recorded on this entry.'}</p>` : ''}</div>`).join('') : `<p class="life-map__quiet">${emptyText}</p>`}</section>${peopleFor(items).length ? `<section><h4>People in these entries</h4><div class="life-map__people">${peopleFor(items).map(link).join('')}</div></section>` : ''}`;
  const areaFor = region => {
    const seen = new Set();
    while (region && !seen.has(region.id)) {
      seen.add(region.id);
      if (FUKUOKA_AREAS.some(area=>area.key===region.mapKey)) return region.mapKey;
      region = byId.get(region.parent);
    }
    return '';
  };
  const panel = (key, title, backKey, backLabel, body, area = '') => `<section class="life-map__panel" id="${target(key)}" data-map-panel data-map-area="${area}"><header class="life-map__heading">${backKey ? choice(backKey, `← ${backLabel}`, 'data-map-back') : ''}<h3 tabindex="-1">${esc(title)}</h3></header>${body}</section>`;
  const regionBody = (region, destinations, descendants) => {
    const positioned = region ? destinations.filter(place => place.region === region.id) : destinations;
    return `${minimal && !positioned.some(place=>place.position) ? '' : `<div class="life-map__board">${plot(positioned)}${!positioned.some(place => place.position) ? `<p class="life-map__board-note">${destinations.length ? 'Choose a destination from the list below.' : 'No places linked to this area yet.'}</p>` : ''}</div>`}${descendants.length ? `<section><h4>Smaller regions</h4>${list(descendants, 'region')}</section>` : ''}<section><h4>Places</h4>${destinations.length ? list(destinations, 'place') : minimal ? '' : '<p class="life-map__quiet">No places linked to this area yet.</p>'}</section>${region ? `<p>${link(region)}</p>` : ''}`;
  };

  const homePlaces = scopePlaces(boundRegions);
  let panels = panel('fukuoka', 'Fukuoka', null, null, ` ${minimal ? '' : `<div class="life-map__board life-map__board--city">${wardSvg(null)}</div>`}${minimal ? '' : '<p class="life-map__caption">Stylized area map · not to scale. Select a destination to explore.</p>'}${unboundRoots.length ? `<section><h4>Other maps</h4>${list(unboundRoots, 'region')}</section>` : ''}${homePlaces.length ? `<section><h4>Places across Fukuoka</h4>${list(homePlaces, 'place')}</section>` : ''}${rootsForKey('fukuoka')[0] ? link(rootsForKey('fukuoka')[0]) : ''}${context(linkedEntries(scope(boundRegions),new Set(homePlaces.map(place=>place.id))), 'No entries linked to Fukuoka yet.')}`);
  for (const area of FUKUOKA_AREAS) {
    const roots = rootsForKey(area.key), ids = scope(roots), destinations = scopePlaces(roots);
    const descendants = roots.flatMap(children).filter(region => !FUKUOKA_KEYS.has(region.mapKey));
    const items = linkedEntries(ids, new Set(destinations.map(place => place.id)));
    panels += panel(area.key, `${area.name} / ${area.japanese}`, 'fukuoka', 'Fukuoka', ` ${minimal ? '' : `<div class="life-map__board life-map__board--city">${wardSvg(area.key)}</div>`}${destinations.length || descendants.length || roots.length ? regionBody(roots[0], destinations, descendants) : minimal ? '' : '<p class="life-map__quiet">No places linked to this area yet.</p>'}${context(items, 'No entries linked to this area yet.')}`, area.key);
  }
  for (const region of regions.filter(region => !FUKUOKA_KEYS.has(region.mapKey))) {
    const parent = byId.get(region.parent), destinations = places.filter(place => place.region === region.id);
    const ids = scope([region]), allPlaces = scopePlaces([region]);
    panels += panel(regionKey(region), region.title, parent ? regionKey(parent) : 'fukuoka', parent?.title ?? 'Map overview', `${regionBody(region, destinations, children(region))}${context(linkedEntries(ids, new Set(allPlaces.map(place => place.id))), 'No entries linked to this region yet.')}`, areaFor(region));
  }
  for (const place of places) {
    const region = byId.get(place.region);
    const items = linkedEntries(new Set(), new Set([place.id]));
    panels += panel(`place-${place.id}`, place.title, region ? regionKey(region) : 'fukuoka', region?.title ?? 'Map overview', `<p class="life-map__description">${esc((place.body ?? '').slice(0,500))}</p>${link(place)}${context(items, 'No entries linked to this place yet.')}`, areaFor(region));
  }
  const initial = byId.get(initialRegionId);
  const toolbar = `<div class="life-map__top"><span>Choose your destination</span><span aria-hidden="true">◆</span></div><nav class="life-map__menu" aria-label="Map areas" data-map-options>${choice('fukuoka','Fukuoka')}${FUKUOKA_AREAS.map(area => choice(area.key,area.name)).join('')}${unboundRoots.map(region => choice(regionKey(region),region.title)).join('')}</nav>`;
  const info = minimal ? '' : '<p class="life-map__help">Select an area, then a place. Arrow keys move through the area menu; Escape returns to the parent map.</p><p class="life-map__source">Area names: <a href="https://showcase.city.fukuoka.lg.jp/en.html">Fukuoka City</a>. Place positions are manually arranged within their region. Unpositioned places remain in the destination list.</p>';
  return `<div class="life-map${minimal ? ' life-map--minimal' : ''}" data-life-map data-map-initial="${target(initial?.kind === 'region' ? regionKey(initial) : 'fukuoka')}" aria-label="${esc(instanceLabel)}"><svg class="life-map__assets" aria-hidden="true" width="0" height="0"><defs><g id="life-map-city-art">${renderFukuokaScene()}</g></defs></svg>${minimal ? `<nav class="life-map__context" aria-label="Location" data-map-context hidden><a class="life-map__context-back" data-map-context-back aria-label="Back">←</a><ol data-map-context-trail></ol></nav><div class="life-map__overview life-map__board life-map__board--city">${wardSvg(null)}</div>` : toolbar}${panels}${info}</div>`;
}
