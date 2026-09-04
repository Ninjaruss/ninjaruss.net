# ninjaruss.net

Personal website for fragments, media, and showcase. Built with Astro, styled with vanilla CSS, inspired by Persona 4 Golden's UI aesthetic.

## Structure

Top-level sections (the NavPill):

- `/` — Homepage with the P4G-inspired bento grid
- `/showcase` — Project inquiries as a bare split-view list (no search/filter)
- `/novel` — "Remember Rain", the in-progress **visual novel** (writer's-desk UI; route keeps the `/novel` path)
- `/shelf` — Media log: anime, manga, film, series, music, games, characters
- `/about` — Profile card with current-arc status and mailbox
- `/now` — Current focus snapshot (history at `/now/archive`)

Writing lives on Substack (`https://ninjaruss.substack.com`) — this site serves
no note prose. `/rss.xml` 301s to the Substack feed, and `/notes/[slug]` (plus
bare `/notes`) 301s to the matching Substack post, or the Substack archive as
a fallback.

Legacy redirects: `/journal` → `/showcase`, `/notes/*` → Substack, `/media` →
`/shelf`, `/favorites` → `/shelf`, `/status` → `/about`, `/stream` → `/about`.
Detail routes (`/showcase/[slug]`, `/shelf/[slug]`) are live.

## Commands

```sh
npm run dev      # Start dev server at localhost:4321
npm run build    # Build to ./dist/
npm run preview  # Preview build locally
npm run test     # Run vitest unit tests
```

Deploys to Vercel via the `@astrojs/vercel` adapter.

## Content

Content lives in `src/content/` as Markdown files. Each collection has its own schema defined in `src/content/config.ts`.

## Design

- **Colors**: P4G gold (`#ffe52c`) primary on a near-black background, light text
- **Typography**: Archivo Black for display headings, Inter for body, JetBrains Mono for labels/data
- **Layout**: CSS Grid bento system with modular panels; shared `.p4g-*` utility vocabulary
