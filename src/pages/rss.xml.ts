import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getJournalItems } from '../utils/journal';
import { stripMarkdown } from '../utils/content';

// Excerpt-only by design: the feed is a doorbell, the site is the room.
// Full posts (and the P4G presentation) live at the linked page.
const EXCERPT_MAX = 300;

function excerptOf(body: string): string {
  const text = stripMarkdown(body).replace(/\s+/g, ' ').trim();
  if (text.length <= EXCERPT_MAX) return text;
  const cut = text.slice(0, EXCERPT_MAX);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

export async function GET(context: APIContext) {
  const items = await getJournalItems();
  return rss({
    title: 'ninjaruss — journal',
    description: 'Notes and showcases from ninjaruss.net — in spite of it all.',
    site: context.site!,
    items: items.map(({ entry, type, href }) => ({
      title: entry.data.title,
      link: href,
      description: excerptOf(entry.body),
      categories: [type],
      ...(entry.data.publishedAt ? { pubDate: entry.data.publishedAt } : {}),
    })),
  });
}
