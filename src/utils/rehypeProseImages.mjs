import { createRequire } from 'node:module';
import { join } from 'node:path';

/**
 * Markdown prose images ship as a bare `<img src>`: no dimensions, so the
 * browser cannot reserve space and every one of them shifts the text below it
 * when it decodes (CLS); and no `loading`, so a showcase entry with nine
 * screenshots fetches all nine before the first paragraph is readable.
 *
 * This adds, at build time:
 *   - width/height, read from the file itself, so the box is reserved. The
 *     attributes are the image's INTRINSIC size; `.prose img { width: 100% }`
 *     still scales it, and the pair only supplies the aspect ratio.
 *   - loading="lazy" on every image except the first in a document. The first
 *     one is often above the fold, and lazy-loading an LCP candidate delays it.
 *   - decoding="async", so decode never blocks the main thread.
 *
 * Author-set attributes always win — an explicit `loading="eager"` in the
 * markdown is left alone.
 *
 * Dimensions need sharp (installed by Astro for its image service). If it is
 * ever unavailable this degrades to attribute-only: the lazy/decoding hints
 * still apply and the build still succeeds, rather than failing over a
 * progressive enhancement.
 */

let sharp = null;
try {
  sharp = createRequire(import.meta.url)('sharp');
} catch {
  /* dimensions skipped; see above */
}

/** Cache per build — the same poster appears in many entries. */
const sizeCache = new Map();

async function intrinsicSize(src) {
  if (!sharp) return null;
  if (sizeCache.has(src)) return sizeCache.get(src);

  let size = null;
  try {
    const { width, height } = await sharp(join(process.cwd(), 'public', src)).metadata();
    if (width && height) size = { width, height };
  } catch {
    /* missing or unreadable (e.g. a remote src that slipped past the filter) */
  }
  sizeCache.set(src, size);
  return size;
}

/** Collect every <img> element in the hast tree, in document order. */
function collectImages(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (node.type === 'element' && node.tagName === 'img') out.push(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectImages(child, out);
  }
  return out;
}

export function rehypeProseImages() {
  return async (tree) => {
    const images = collectImages(tree);

    for (const [i, node] of images.entries()) {
      const props = (node.properties ??= {});
      const src = props.src;

      /* Only local, non-SVG rasters: an SVG has no meaningful intrinsic size to
         reserve, and a remote src cannot be measured at build time. */
      if (typeof src !== 'string' || !src.startsWith('/') || src.endsWith('.svg')) continue;

      if (props.decoding === undefined) props.decoding = 'async';
      /* The first image may be the LCP element — never defer it. */
      if (props.loading === undefined && i > 0) props.loading = 'lazy';

      if (props.width === undefined && props.height === undefined) {
        const size = await intrinsicSize(src);
        if (size) {
          props.width = size.width;
          props.height = size.height;
        }
      }
    }
  };
}

export default rehypeProseImages;
