# Novel Page Design — Remember Rain

**Date:** 2026-04-05  
**Status:** Approved

---

## Overview

A dedicated page for the novel "Remember Rain" that renders Scrivener-exported markdown files from `src/content/novel/`. The page uses a Memory Shards visual metaphor — inspired by Vesper's glass shard mechanic — where each folder is a floating glass fragment. The experience is fully immersive; the shard aesthetic persists throughout all navigation states.

---

## Architecture & Data

### File Reading

- All novel content is read at build time using Node's `fs` module (no Astro content collection)
- A utility function (`src/utils/novel.ts`) recursively walks `src/content/novel/` and builds a data tree
- MetaData.txt sidecar files are parsed for `Created:` and `Modified:` dates and attached to each entry
- `.txt` files are never surfaced to the user
- The full data tree is serialized as JSON into a `<script>` tag on the page — no client-side fetches

### Data Tree Shape

```ts
type NovelFile = {
  slug: string;         // url-safe kebab-case of filename
  title: string;        // filename without extension
  body: string;         // markdown pre-rendered to HTML at build time
  created: string | null;
  modified: string | null;
  path: string[];       // folder path segments, e.g. ['lore', 'magic-system']
}

type NovelFolder = {
  slug: string;
  title: string;
  files: NovelFile[];
  subfolders: Record<string, NovelFolder>;
}

type NovelTree = Record<string, NovelFolder>; // keyed by top-level folder slug
```

### Top-Level Folders

| Folder | Slug | Current Files |
|---|---|---|
| Characters | `characters` | Rain |
| Locations | `locations` | Setting |
| Lore | `lore` | Magic System/ (subfolder) → Magic Overview, Character Ability Table |
| Scenes | `scenes` | (empty) |
| Themes | `themes` | Focus Questions |

Nested folders (e.g. `Lore/Magic System/`) are represented as subfolders in the tree and reflected in the URL.

---

## Routing

### Route File

`src/pages/novel/[...slug].astro` — single catch-all route handling all `/novel/*` URLs.

### URL Structure

```
/novel                                          # scatter view
/novel/characters                               # Characters folder open
/novel/characters/rain                          # Rain file content
/novel/locations/setting                        # Setting file content
/novel/lore                                     # Lore folder open
/novel/lore/magic-system                        # Magic System subfolder open
/novel/lore/magic-system/magic-overview         # Magic Overview content
/novel/scenes                                   # Scenes folder (empty state)
/novel/themes/focus-questions                   # Focus Questions content
```

`getStaticPaths()` generates a path for every folder, subfolder, and file at build time. Navigating within the page uses `history.pushState()` — no full reloads. Visiting a URL directly works; the page reads `slug` from props and initializes to the correct shard state on load. Browser back/forward works via `popstate` listener.

---

## Visual Design

### Shard System

Five folder shards, all from the same irregular glass fragment shape family — same visual DNA, subtle proportion differences. Each shard has:

- Semi-transparent accent fill (8% opacity)
- Full-opacity accent border (1.5px)
- Folder name in `JetBrains Mono`, uppercase, letter-spaced
- Seeded rotation (-4° to +4°) and position — consistent across visits, not re-randomized

### Folder Identity

| Folder | Accent Color | Rationale |
|---|---|---|
| Characters | `#ffe52c` gold | identity, the protagonist |
| Locations | `#7ab8ff` blue | rain, water, the city |
| Lore | `#ff8822` orange | the Flare, magic, fire |
| Scenes | `#ff6666` red | action, tension, drama |
| Themes | `#aaaaff` purple | philosophy, memory, abstraction |

### Three Shard States

**1. Idle (scatter view)**
- All 5 folder shards float on dark background
- Mouse-tracking tilt on hover (`requestAnimationFrame`, max 10°, scale 1.02)
- Only active on `(hover: hover)` devices

**2. Folder selected**
- Clicked shard stays in place, scales up briefly, then splits into file sub-shards (one per document in that folder/subfolder)
- File sub-shards use the same accent color as the parent folder, slightly smaller shape variants
- Other folder shards translate to screen edges as ghost fragments (20% opacity, still clickable to switch folders)
- If a folder has subfolders, sub-shard labels show subfolder name; clicking opens that subfolder's files

**3. File open**
- Selected file sub-shard expands to fill the reading area
- Shard border and accent color remain as the frame
- Content (title, dates, markdown body) sits inside the shard shape via `clip-path`
- Other file sub-shards shrink to ghost size at screen edges
- Folder ghost shards remain at screen edges — clicking jumps directly to that folder

### Content Display (file open state)

- Title (large, accent color)
- Created date + Modified date (small, muted — using existing `DateDisplay` component style)
- Markdown body rendered as HTML (using existing prose styles)
- Content scrolls vertically inside the shard frame

---

## Interaction & Animation

All animations respect `prefers-reduced-motion`.

| Transition | Duration | Easing |
|---|---|---|
| Scatter → folder open (shard split) | 400ms, 50ms stagger | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Other shards drift to edges | 400ms | ease-out |
| File sub-shard → expand to content | 350ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Hover tilt | `requestAnimationFrame` | — |
| Back navigation | reverse of above | same |

Browser back/forward button triggers `popstate` — state is restored from URL without animation re-play (snap to state).

---

## Mobile (below 768px)

- Shards render as full-width vertical cards, stacked
- Hover tilt disabled
- Tap folder card → file list expands below it as a sub-list
- Tap file → full-screen content view with a back button
- URL behavior identical to desktop

---

## File Structure

```
src/
├── pages/
│   └── novel/
│       ├── index.astro           # /novel — scatter view (all folder shards)
│       └── [...slug].astro       # /novel/* — folder/file states
├── utils/
│   └── novel.ts                  # fs-based tree builder + MetaData parser
└── styles/
    └── novel.css                 # shard styles, animations (new file)
```

No new components required — reuses `DateDisplay` for dates and existing prose CSS for markdown body.

---

## Out of Scope

- Draft/publish filtering via Status field (deferred)
- Search within novel content
- Cross-linking between novel entries
- Editing content from the browser
