// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

import { join } from 'node:path';

import { buildNovelTree } from './src/utils/novel.ts';

/**
 * Folder-only URLs under /novel (e.g. /novel/characters, /novel/manuscript/arc-3-prisoner).
 *
 * src/pages/novel/[...slug].astro renders these as `Astro.redirect(…)`, but it
 * must stay prerendered for the ~70 real reading pages, and a prerendered
 * Astro.redirect degrades to a meta-refresh document served with HTTP 200 — a
 * redirect search engines discount, advertised in the sitemap as a thin page.
 * (CLAUDE.md records exactly this failure being fixed for /notes/* by making that
 * route server-rendered, which is not an option here without turning every
 * reading page into a function.)
 *
 * The URLs resolve to `/novel#<folder-slug>` — a fragment destination, which
 * Vercel's redirect config cannot express — so they keep the meta-refresh, but
 * they are excluded from the sitemap below rather than advertised as real pages.
 */
const novelTree = await buildNovelTree(join(process.cwd(), 'src/content/novel'));
const novelFolderSlugs = new Set();

/* NovelTree is a Record<slug, NovelFolder>; each folder holds `files` plus a
   Record<slug, NovelFolder> of `subfolders`. Every folder — top-level and nested
   — is routable as a folder-only URL. */
(function collectFolders(folder, trail) {
  novelFolderSlugs.add(`/novel/${trail.join('/')}/`);
  for (const sub of Object.values(folder.subfolders)) {
    collectFolders(sub, [...trail, sub.slug]);
  }
})({ subfolders: novelTree }, []);

export default defineConfig({
  site: 'https://ninjaruss.net',
  adapter: vercel(),
  integrations: [
    mdx(),
    sitemap({
      /**
       * Keep redirect stubs out of the sitemap. A sitemap should list pages; a
       * URL whose entire body is "Redirecting from … to …" is the opposite of
       * what a crawler should be pointed at, and every one of these was listed.
       *
       * /favorites and /favorites/<slug> are gone from here entirely — they are
       * real 301s now (see `redirects`), so they are not routes any more.
       */
      filter: (page) => {
        const { pathname } = new URL(page);
        return !novelFolderSlugs.has(pathname);
      },
    }),
  ],
  redirects: {
    '/media': '/shelf',
    '/media/[...slug]': '/shelf/[...slug]',
    /* /stream → /status → /about happened over two renames. Both point
       straight at /about so there is no redirect chain. */
    '/stream': '/about',
    '/status': '/about',
    /* The journal merged notes + showcases. Notes moved to Substack, so the
       merge had nothing left to merge — showcase is what survived. */
    '/journal': '/showcase',
    /* The favourites filter (`?fav=1`) no longer exists on /shelf. These used to
       be prerendered pages calling Astro.redirect(…, 301) — which a static build
       cannot express, so each served a 200 meta-refresh document with a bare
       body, and all eleven were listed in the sitemap. As `redirects` entries
       the Vercel adapter emits true 301s, the same way /media and /status work. */
    '/favorites': '/shelf',
    '/favorites/[...slug]': '/shelf/[...slug]',
  },
});
