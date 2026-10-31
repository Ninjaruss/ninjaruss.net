# Shared Life map UI

Content-free server renderer, browser controller, CSS, and original schematic
Fukuoka artwork. Used by `/life` and vendored verbatim by the private life-archive
project. No private repository dependency, filesystem reads, provider calls,
analytics, credentials, or map-service requests exist in this package.

The caller supplies validated flat records and a local `hrefForRecord` adapter.
The public site passes only its reviewed snapshot; the private reader uses its
own explicit adapter. This is presentation reuse, never a data synchronization
path. Public map metadata is part of the separately approved public draft.

`region.mapKey` binds a region note to `fukuoka` or `fukuoka-{chuo,hakata,higashi,
minami,jonan,sawara,nishi}`. Other root regions become additional maps. Region
parents create drill-down navigation. `place.position: {x,y}` uses 0–100 manual
coordinates within the place's OWN region; descendant positions are never
plotted on an ancestor map. Unpositioned places remain in the accessible list.

The artwork is an original continuous overhead city illustration: Hakata Bay,
coastline, rivers, park/lake, city blocks, railway, and simplified landmarks.
Muted water/land colors separate geography from the black-and-gold destination
menus. Ward tags select destinations rather than claiming accurate boundaries.
The scene is stored once in SVG definitions and reused by each selection panel.

Landmark orientation was checked against the [JNTO Fukuoka city map](https://partners-pamph.jnto.go.jp/simg/pamph/690.pdf),
and names against the city's [area directory](https://showcase.city.fukuoka.lg.jp/en.html).
This is compressed illustrative geography, not street directions or a boundary
dataset. The base geography does not claim any visits or personal connections.

Fragment links work without JS. Enhancement provides selected panels, history,
arrow-key navigation in the area menu, and Escape to the parent map. SVG marker
coordinates avoid inline style attributes under the private CSP. No external
assets are loaded. Reduced-motion CSS disables transitions.

To update the private copy, run `npm run ui:sync` in life-archive. `npm run ui:check`
verifies all four vendored files byte-for-byte against this source. Its deployed
build uses only the committed copy, with no dependency on a sibling checkout.


The optional `minimal: true` presentation omits the area-button menu and gold
prompt bar. One persistent illustrated city stays above changing area context;
`data-map-area` lets the controller highlight the correct ward for smaller regions
and places. Default presentation is unchanged. The private map-led Life reader
uses this option; its note/search/inspector data stays entirely in the private
project. Shared rendering does not imply public publication.

Minimal presentation includes one location breadcrumb/Back strip and a gold
selection pointer. Keyboard focus and selected location remain distinct; repeated
initialization preserves the strip's focused node. Original static headings/Back
links remain as script-free fallback content.
