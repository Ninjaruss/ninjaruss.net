import { describe, it, expect } from 'vitest';
import { renderLifeMap } from '../../packages/life-ui/life-map.mjs';
import type { LifeMapRecord } from '../../packages/life-ui/life-map.mjs';
import { lifeExportSchema } from '../utils/lifeExport';

const data = (): LifeMapRecord[] => [
  {id:'city',kind:'region',title:'Fukuoka notes',body:'Reviewed city.',mapKey:'fukuoka'},
  {id:'ward',kind:'region',title:'Chuo notes',body:'Reviewed area.',parent:'city',mapKey:'fukuoka-chuo'},
  {id:'district',kind:'region',title:'A smaller area',body:'Reviewed area.',parent:'ward'},
  {id:'cafe',kind:'place',title:'Sample cafe',body:'Reviewed place.',region:'ward',position:{x:30,y:45}},
  {id:'nested-place',kind:'place',title:'Nested venue',body:'Reviewed place.',region:'district',position:{x:80,y:10}},
  {id:'person',kind:'person',title:'Reviewed pseudonym',body:'Reviewed profile.'},
  {id:'visit',kind:'experience',title:'Reviewed encounter',body:'Reviewed text.',date:'2026-10-21',people:['person'],places:['cafe'],events:[]},
];
const render = (records = data()) => renderLifeMap({records,hrefForRecord:record=>`/life/${record.id}`});
describe('shared Life map', () => {
  it('provides seven selectable Fukuoka areas and a native-link fallback without personal records', () => {
    const html = render([]);
    for (const name of ['Nishi','Sawara','Chuo','Jonan','Minami','Hakata','Higashi']) expect(html).toContain(`Explore ${name}`);
    expect(html).toContain('Stylized area map · not to scale');
    expect(html).toContain('href="#life-map-fukuoka-chuo"');
    expect(html).not.toContain('Reviewed pseudonym');
  });
  it('supports a map-led presentation without area tabs while preserving selectable destinations', () => {
    const html = renderLifeMap({records:[],minimal:true,hrefForRecord:record=>`/life/${record.id}`});
    expect(html).not.toContain('aria-label="Map areas"');
    expect(html).not.toContain('life-map__top');
    expect(html).toContain('class="life-map__overview life-map__board life-map__board--city"');
    expect(html).toContain('data-map-area="fukuoka-chuo"');
    expect(html).toContain('aria-label="Explore Chuo"');
    expect(html).toContain('href="#life-map-fukuoka-chuo"');
  });
  it('connects an area to places, entries, and people through caller-supplied local URLs', () => {
    const html = render();
    for (const value of ['life-map-place-cafe','life-map-region-district','Reviewed encounter','Reviewed pseudonym','href="/life/visit"']) expect(html).toContain(value);
    expect(html).toContain('data-map-initial="life-map-fukuoka"');
  });
  it('keeps child-region coordinates out of the parent map while preserving the destination list', () => {
    const ward = render().split('id="life-map-fukuoka-chuo"')[1].split('<section class="life-map__panel"')[0];
    expect(ward).toContain('class="life-map__pin" href="#life-map-place-cafe"');
    expect(ward).not.toContain('class="life-map__pin" href="#life-map-place-nested-place"');
    expect(ward).toContain('Nested venue');
  });
  it('positions markers with SVG attributes compatible with strict CSP and keeps an accessible list', () => {
    const html = render();
    expect(html).toContain('transform="translate(');
    expect(html).not.toContain('style=');
    expect(html).not.toContain('onclick=');
    expect(html).toContain('class="life-map__list"');
  });
  it('labels series-only context and respects a specifically recorded different venue', () => {
    const records = data();
    records.push({id:'series',kind:'event',title:'Recurring series',body:'Reviewed series.',places:['cafe']});
    records.push({id:'via-series',kind:'experience',title:'Series-only note',body:'Reviewed note.',date:'2026-10-20',people:[],places:[],events:['series']});
    records.push({id:'elsewhere',kind:'experience',title:'Explicitly elsewhere',body:'Reviewed note.',date:'2026-10-19',people:[],places:['somewhere-else'],events:['series']});
    const ward = render(records).split('id="life-map-fukuoka-chuo"')[1].split('<section class="life-map__panel"')[0];
    expect(ward).toContain('Series-only note');
    expect(ward).toContain('no specific place is recorded on this entry');
    expect(ward).not.toContain('Explicitly elsewhere');
  });
  it('supports other regions and local back navigation without guessing geographic positions', () => {
    const records: LifeMapRecord[] = [{id:'elsewhere',kind:'region',title:'Another region',body:'A note.'}];
    const html = renderLifeMap({records,initialRegionId:'elsewhere',hrefForRecord:record=>`/life/${record.id}`});
    expect(html).toContain('data-map-initial="life-map-region-elsewhere"');
    expect(html).toContain('Other maps');
    expect(html).toContain('← Map overview');
  });
  it('escapes content and rejects unsafe links, IDs and coordinates', () => {
    const records = data(); records[3].title = '<img src=x onerror=bad()>';
    expect(render(records)).toContain('&lt;img');
    expect(render(records)).not.toContain('<img src=x');
    expect(()=>renderLifeMap({records:data(),hrefForRecord:()=> 'javascript:alert(1)'})).toThrow();
    expect(()=>render([{id:'../secret',kind:'region',title:'Bad'}])).toThrow();
    const invalid = data(); invalid[3].position = {x:101,y:0};
    expect(()=>render(invalid)).toThrow();
  });
  it('accepts explicitly reviewed map keys and rejects duplicate bindings or private metadata', () => {
    expect(lifeExportSchema.safeParse({schemaVersion:1,records:data()}).success).toBe(true);
    const duplicate = data(); duplicate[1].mapKey = 'fukuoka';
    expect(lifeExportSchema.safeParse({schemaVersion:1,records:duplicate}).success).toBe(false);
    const privateField = data(); Object.assign(privateField[0],{sourcePath:'/private/raw.md'});
    expect(lifeExportSchema.safeParse({schemaVersion:1,records:privateField}).success).toBe(false);
  });
});
