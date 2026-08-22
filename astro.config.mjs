// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://ninjaruss.net',
  adapter: vercel(),
  integrations: [mdx(), sitemap()],
  redirects: {
    '/media': '/shelf',
    '/media/[...slug]': '/shelf/[...slug]',
    /* /stream → /status → /about happened over two renames. Both point
       straight at /about so there is no redirect chain. */
    '/stream': '/about',
    '/status': '/about',
  },
});