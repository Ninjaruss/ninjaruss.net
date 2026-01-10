# ninjaruss.net

Personal website for fragments, reflections, and showcase. Built with Astro, styled with vanilla CSS, inspired by Persona 4 Golden's UI aesthetic.

## Structure

- `/` — Homepage with P4G-inspired bento grid
- `/reflections` — Notes on anime, manga, films
- `/notes` — Philosophical fragments
- `/showcase` — Projects framed as inquiries
- `/now` — Current focus snapshot

## Commands

```sh
npm run dev      # Start dev server at localhost:4321
npm run build    # Build to ./dist/
npm run preview  # Preview build locally
```

## Content

Content lives in `src/content/` as Markdown files. Each collection has its own schema defined in `src/content/config.ts`.

## Design

- **Colors**: Golden-yellow (#F5C518) primary, charcoal text, cream background
- **Typography**: Archivo Black for headings, Inter for body
- **Layout**: CSS Grid bento system with modular panels
