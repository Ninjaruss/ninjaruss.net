/**
 * Renders public/social-default.svg to public/social-default.png (1200x630).
 *
 * Why a raster copy exists at all: X/Twitter, Facebook, LinkedIn, Slack, Discord
 * and iMessage all refuse SVG for `og:image`. When the default was the .svg,
 * every share of the site rendered as a bare link with no preview image — while
 * `twitter:card` promised a large one. The SVG stays the editable source; the
 * PNG is what BaseLayout points og:image / twitter:image at.
 *
 * Usage: node scripts/build-og-image.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const svgPath = fileURLToPath(new URL('public/social-default.svg', root));
const pngPath = fileURLToPath(new URL('public/social-default.png', root));

const svg = await readFile(svgPath);

/* density: the SVG declares width/height in user units, so scale density to land
   on exactly 1200x630 regardless of the source viewBox units. */
const png = await sharp(svg, { density: 96 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();

await writeFile(pngPath, png);

const meta = await sharp(png).metadata();
console.log(
  `wrote ${pngPath} — ${meta.width}x${meta.height}, ${meta.format}, ${(png.length / 1024).toFixed(1)}KB`
);
