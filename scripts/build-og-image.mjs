/** Regenerate the default link preview with `node scripts/build-og-image.mjs`. */
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicPath = (path) => fileURLToPath(new URL(`../public/${path}`, import.meta.url));
const width = 1200;
const height = 630;
const gold = '#ffe52c';
const background = '#0a0a0a';

const artwork = await sharp(publicPath('images/identity/ttgl-pointing-960.webp'))
  .resize(height, height)
  .png()
  .toBuffer();

// The diagonal cut echoes the homepage tiles and leaves room for the pointing pose.
const panel = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1.2" fill="#28251a"/>
      </pattern>
    </defs>
    <path d="M0 0H686L556 630H0Z" fill="${gold}"/>
    <path d="M0 0H679L549 630H0Z" fill="${background}"/>
    <path d="M0 0H679L549 630H0Z" fill="url(#dots)"/>
    <path d="M64 205H153L145 211H64Z" fill="${gold}"/>
  </svg>
`);

const title = await sharp({ text: {
  text: `<span foreground="${gold}"><i>NINJARUSS</i></span>`,
  font: 'Archivo Black 82',
  fontfile: publicPath('fonts/archivo-black-400-latin.woff2'),
  rgba: true,
} }).png().toBuffer();

const motto = await sharp({ text: {
  text: '<span foreground="#f5f5f5"><i>In spite of it all...</i></span>',
  font: 'Syne 38',
  fontfile: publicPath('fonts/syne-400-latin.woff2'),
  rgba: true,
} }).png().toBuffer();

const domain = await sharp({ text: {
  text: '<span foreground="#ccc7b5">ninjaruss.net</span>',
  font: 'Syne 27',
  fontfile: publicPath('fonts/syne-400-latin.woff2'),
  rgba: true,
} }).png().toBuffer();

await sharp({ create: { width, height, channels: 3, background } })
  .composite([
    { input: artwork, left: width - height, top: 0 },
    { input: panel, left: 0, top: 0 },
    { input: title, left: 64, top: 239 },
    { input: motto, left: 64, top: 331 },
    { input: domain, left: 64, top: 540 },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(publicPath('social-ninjaruss.jpg'));
