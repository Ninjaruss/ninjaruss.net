# ninjaruss.net

Personal website for fragments, reflections, and showcase. Built with Astro, styled with vanilla CSS, inspired by Persona 4 Golden's UI aesthetic.

## TODO:
- Fix dimming when scrolling for media page; it should not dim when scrolling the left sidebar. it should dim the left sidebar when scrolling main markdown content (or focused on main markdown content)
- Allow seeing full image of emblem
- Fix the date for the now bento grid tile to show the proper x days ago; it seems to add an extra day for whatever day I set publishedAt for
- Move the type label from the main content to the left side bar next to their title; ensure spacing is consistent
- In related content, show the media type instead of the content list type (instead of media, show anime, manga, etc.) 
- Remove empty space where tags should be if there are no tags available
- Fix the favorites cards issue where if I hover over a card, I can position it where the top border doesn't really show
- Fix issue when initial loading a page the styles don't load for related content until the page is reloaded


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
