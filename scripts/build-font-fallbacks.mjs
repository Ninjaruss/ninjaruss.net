/**
 * Regenerates the metric-matched fallback @font-face values in
 * src/styles/typography.css.
 *
 * Why: `display: swap` paints text in the fallback face immediately and swaps
 * when the webfont arrives. Unless the fallback's metrics match, that swap
 * reflows the layout — on this site it moved the hero wordmark, every tile
 * title and the entire nav on every cold load.
 *
 * How: for each webfont, fetch its real metrics from the Google-hosted woff2
 * (@capsizecss/unpack parses them), then scale a local Arial to match its
 * average advance width and vertical metrics.
 *
 *   size-adjust      = (font.xWidthAvg / font.unitsPerEm)
 *                      ÷ (fallback.xWidthAvg / fallback.unitsPerEm)
 *   ascent-override  = (font.ascent  / font.unitsPerEm) ÷ size-adjust
 *   descent-override = (|font.descent| / font.unitsPerEm) ÷ size-adjust
 *   line-gap-override= (font.lineGap / font.unitsPerEm) ÷ size-adjust
 *
 * size-adjust is the ratio of the *webfont* to the *fallback*, so a face wider
 * than Arial gets a value above 100% (the fallback is scaled up to match it).
 *
 * Usage: node scripts/build-font-fallbacks.mjs
 */
import { fromUrl } from '@capsizecss/unpack';

/* Arial regular, from @capsizecss/metrics (Helvetica is metrically identical,
   which is why `local('Arial')` also resolves on macOS). */
const FALLBACK = {
  name: 'Arial',
  unitsPerEm: 2048,
  ascent: 1854,
  descent: -434,
  lineGap: 67,
  xWidthAvg: 913,
};

/* The latin subset of each face, as served by the Google Fonts CSS API. */
const FETCHES = [
  {
    label: 'Archivo Black',
    fallbackFamily: 'Archivo Black Fallback',
    cssUrl: 'https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap',
  },
  {
    label: 'Syne',
    fallbackFamily: 'Syne Fallback',
    cssUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@400&display=swap',
  },
];

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

/** Pulls the woff2 URL for the `latin` subset out of a Google Fonts response. */
function latinWoff2(css) {
  for (const block of css.split('/*')) {
    if (!/^\s*latin\s*\*/i.test(block)) continue;
    const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    if (url) return url[1];
  }
  throw new Error('no latin woff2 found in the Google Fonts response');
}

const pct = (n) => `${(Math.round(n * 10000) / 100).toFixed(2)}%`;

const fallbackRatio = FALLBACK.xWidthAvg / FALLBACK.unitsPerEm;
const results = [];

for (const face of FETCHES) {
  const css = await fetch(face.cssUrl, { headers: { 'user-agent': UA } }).then((r) => r.text());
  const metrics = await fromUrl(latinWoff2(css));

  const fontRatio = metrics.xWidthAvg / metrics.unitsPerEm;
  const sizeAdjust = fontRatio / fallbackRatio;

  results.push({
    ...face,
    sizeAdjust: pct(sizeAdjust),
    ascentOverride: pct(metrics.ascent / metrics.unitsPerEm / sizeAdjust),
    descentOverride: pct(Math.abs(metrics.descent) / metrics.unitsPerEm / sizeAdjust),
    lineGapOverride: pct(metrics.lineGap / metrics.unitsPerEm / sizeAdjust),
    metrics,
  });
}

for (const r of results) {
  console.log(`/* ${r.label} — unitsPerEm ${r.metrics.unitsPerEm}, xWidthAvg ${r.metrics.xWidthAvg} */`);
  console.log('@font-face {');
  console.log(`  font-family: '${r.fallbackFamily}';`);
  console.log(`  src: local('${FALLBACK.name}');`);
  console.log(`  size-adjust: ${r.sizeAdjust};`);
  console.log(`  ascent-override: ${r.ascentOverride};`);
  console.log(`  descent-override: ${r.descentOverride};`);
  console.log(`  line-gap-override: ${r.lineGapOverride};`);
  console.log('}');
  console.log();
}

console.log('Paste the blocks above into src/styles/typography.css.');
console.log(
  'JetBrains Mono needs no override: monospace fallbacks (Menlo, Courier) already advance at ~0.6em.'
);
