import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { publicNotes } from '../utils/notes';
import { stripMarkdown } from '../utils/content';

export const prerender = true;
export async function GET(context: APIContext) {
  const entries = publicNotes(await getCollection('notes'));
  return rss({
    title: 'Ninjaruss — Writing',
    description: 'Personal essays, reflections, and notes by Ninjaruss.',
    site: context.site!,
    items: entries.filter(entry => entry.data.publishedAt).map(entry => ({
      title: entry.data.title,
      pubDate: entry.data.publishedAt,
      link: `/notes/${entry.slug}`,
      description: entry.data.description ?? stripMarkdown(entry.body).slice(0, 300),
    })),
  });
}
