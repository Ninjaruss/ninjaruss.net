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

/** Undo the five XML entities a feed generator emits. Anything exotic is left alone. */
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
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
