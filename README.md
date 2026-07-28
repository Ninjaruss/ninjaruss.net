# ninjaruss.net

Personal website for fragments, media, and showcase. Built with Astro, styled with vanilla CSS, inspired by Persona 4 Golden's UI aesthetic.

## Structure

Top-level sections (the NavPill):

- `/` — Homepage with the P4G-inspired bento grid
- `/journal` — Notes + showcases merged into one filterable split-view list
- `/novel` — "Remember Rain", the in-progress **visual novel** (writer's-desk UI; route keeps the `/novel` path)
- `/shelf` — Media log: anime, manga, film, series, music, games, characters
- `/stream` — Stream log as a P4G status screen (session stats, sessions, mailbox)
- `/now` — Current focus snapshot (history at `/now/archive`)
- `/codex` — AI-synthesized "second brain" of concepts drawn from the site's writing

Also served: `/rss.xml` (excerpt-only journal feed) and `/about` (301 to the current
identity note — no static About page by design).

Legacy redirects: `/notes` → `/journal?types=note`, `/showcase` → `/journal?types=showcase`,
`/media` → `/shelf`, `/favorites` → `/shelf`. Detail routes (`/notes/[slug]`,
`/showcase/[slug]`, `/shelf/[slug]`) are live.

## Commands

```sh
npm run dev      # Start dev server at localhost:4321
npm run build    # Build to ./dist/
npm run preview  # Preview build locally
npm run test     # Run vitest unit tests
npm run codex    # AI-condense site content into src/data/codex.json
```

Deploys to Vercel via the `@astrojs/vercel` adapter.

## Content

Content lives in `src/content/` as Markdown files. Each collection has its own schema defined in `src/content/config.ts`.

## Design

- **Colors**: P4G gold (`#ffe52c`) primary on a near-black background, light text
- **Typography**: Archivo Black for display headings, Inter for body, JetBrains Mono for labels/data
- **Layout**: CSS Grid bento system with modular panels; shared `.p4g-*` utility vocabulary
