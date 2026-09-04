/** The publication writing now lives on. The site links out; it does not mirror. */
export const SUBSTACK_URL = 'https://ninjaruss.substack.com';
export const SUBSTACK_FEED_URL = `${SUBSTACK_URL}/feed`;
export const SUBSTACK_ARCHIVE_URL = `${SUBSTACK_URL}/archive`;

export interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

const ITEM_RE = /<item\b[^>]*>([\s\S]*?)<\/item>/g;

/** Named entities beyond the basic five that Substack's HTML payloads commonly carry. */
const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
};

/**
 * Undo the XML/HTML entities a feed generator emits: the five basic XML
 * entities, decimal (`&#8220;`) and hex (`&#x2014;`) numeric entities, and a
 * handful of common named ones. Anything else is left alone.
 *
 * `&amp;` MUST be decoded last — decoding it earlier would double-decode
 * deliberately-escaped input like `&amp;#8220;` (meant to display literally
 * as `&#8220;`) into a curly quote.
 *
 * Never throws: a malformed/out-of-range numeric entity is left as-is rather
 * than crashing the build.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      const code = parseInt(hex, 16);
      return isValidCodePoint(code) ? String.fromCodePoint(code) : match;
    })
    .replace(/&#(\d+);/g, (match, dec) => {
      const code = parseInt(dec, 10);
      return isValidCodePoint(code) ? String.fromCodePoint(code) : match;
    })
    .replace(/&(nbsp|hellip|mdash|ndash);/g, (match, name) => NAMED_ENTITIES[name] ?? match)
    .replace(/&amp;/g, '&');
}

/** Guard against a code point `String.fromCodePoint` would throw on. */
function isValidCodePoint(code: number): boolean {
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff;
}

/** Read one child element out of an <item> block, unwrapping CDATA. */
function tagText(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`));
  if (!m) return '';
  const raw = m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1');
  return decodeEntities(raw).trim();
}

/**
 * Minimal RSS reader for the Substack feed.
 *
 * Hand-rolled rather than pulling an XML dependency: the shape of a Substack
 * item is narrow and stable, and this runs at build time on one known feed.
 * It must never throw — a homepage tile is not worth failing a build over.
 */
export function parseSubstackFeed(xml: string): SubstackPost[] {
  try {
    const posts: SubstackPost[] = [];
    for (const match of xml.matchAll(ITEM_RE)) {
      const block = match[1];
      const link = tagText(block, 'link');
      if (!link) continue; // an item we cannot link to is not useful
      posts.push({
        title: tagText(block, 'title'),
        link,
        pubDate: tagText(block, 'pubDate'),
        description: tagText(block, 'description').replace(/<[^>]+>/g, '').trim(),
      });
    }
    return posts;
  } catch {
    return [];
  }
}

/**
 * Build-time read of the Substack feed.
 *
 * Every failure path returns [] on purpose: the homepage tiles guard on an
 * empty result and fall back to showcase-only. A Substack outage, a network
 * blip, or an offline build must not fail `npm run build`.
 */
export async function fetchSubstackPosts(limit = 5): Promise<SubstackPost[]> {
  try {
    const res = await fetch(SUBSTACK_FEED_URL);
    if (!res.ok) return [];
    return parseSubstackFeed(await res.text()).slice(0, limit);
  } catch {
    return [];
  }
}
