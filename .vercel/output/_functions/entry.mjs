import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_TTpQafNc.mjs';
import { manifest } from './manifest_B3SUZpRZ.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/live-status.astro.mjs');
const _page2 = () => import('./pages/api/twitch-live.astro.mjs');
const _page3 = () => import('./pages/favorites.astro.mjs');
const _page4 = () => import('./pages/favorites/_---slug_.astro.mjs');
const _page5 = () => import('./pages/notes.astro.mjs');
const _page6 = () => import('./pages/notes/_---slug_.astro.mjs');
const _page7 = () => import('./pages/novel/_---slug_.astro.mjs');
const _page8 = () => import('./pages/now/archive.astro.mjs');
const _page9 = () => import('./pages/now.astro.mjs');
const _page10 = () => import('./pages/now/_---slug_.astro.mjs');
const _page11 = () => import('./pages/shelf.astro.mjs');
const _page12 = () => import('./pages/shelf/_---slug_.astro.mjs');
const _page13 = () => import('./pages/showcase.astro.mjs');
const _page14 = () => import('./pages/showcase/_---slug_.astro.mjs');
const _page15 = () => import('./pages/stream.astro.mjs');
const _page16 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/live-status.ts", _page1],
    ["src/pages/api/twitch-live.ts", _page2],
    ["src/pages/favorites.astro", _page3],
    ["src/pages/favorites/[...slug].astro", _page4],
    ["src/pages/notes/index.astro", _page5],
    ["src/pages/notes/[...slug].astro", _page6],
    ["src/pages/novel/[...slug].astro", _page7],
    ["src/pages/now/archive.astro", _page8],
    ["src/pages/now.astro", _page9],
    ["src/pages/now/[...slug].astro", _page10],
    ["src/pages/shelf/index.astro", _page11],
    ["src/pages/shelf/[...slug].astro", _page12],
    ["src/pages/showcase/index.astro", _page13],
    ["src/pages/showcase/[...slug].astro", _page14],
    ["src/pages/stream/index.astro", _page15],
    ["src/pages/index.astro", _page16]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "ec4de0c3-1b8d-4b5b-a821-b10c18596fbb",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
