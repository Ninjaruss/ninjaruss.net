# Design: Rename `media` → `shelf` + Content Indicator

**Date:** 2026-05-19  
**Status:** Approved

---

## Overview

Two changes to the media section of ninjaruss.net:

1. **Rename** the `media` collection and route to `shelf` — a personal-collection feel that doesn't conflict semantically with the `stream` page (live activity).
2. **Content indicator** — cards with written notes get a gold glow border; empty cards dim to 0.55 opacity, making the presence/absence of a note immediately visible in the grid.

---

## Part 1: Rename `media` → `shelf`

### Scope

Full rename: content collection folder, Astro collection config, all pages, utilities, and components that reference the old name. Old `/media` URLs stay alive via 301 redirects.

### Files to move

| From | To |
|------|----|
| `src/content/media/` (29 .md files) | `src/content/shelf/` |
| `src/pages/media/index.astro` | `src/pages/shelf/index.astro` |
| `src/pages/media/[...slug].astro` | `src/pages/shelf/[...slug].astro` |

### Files to update

| File | Change |
|------|--------|
| `src/content/config.ts` | Collection name `media` → `shelf` |
| `src/utils/collections.ts` | `SectionName` union type, `allMedia` type alias, `getCollection('media')` call |
| `src/components/RelatedContent.astro` | `section: 'media'` prop string, `CollectionEntry<'media'>` type, `entry.type === 'media'` guard |
| `src/pages/index.astro` | `getCollection('media')` call, bento tile `href="/media"` → `"/shelf"`, label `"Media"` → `"Shelf"`, `recentMedia` href template |
| `src/pages/favorites.astro` | Redirect target: `/media?fav=1` → `/shelf?fav=1` |
| `src/pages/favorites/[...slug].astro` | `getCollection('media')` call, redirect target `/media/${slug}` → `/shelf/${slug}` |
| `src/pages/shelf/index.astro` | All `/media` URL strings → `/shelf`, page title/description, `getCollection` call |
| `src/pages/shelf/[...slug].astro` | All `/media` URL strings → `/shelf`, `getCollection` call, NavPill back-link |
| `astro.config.mjs` | Add `redirects` entries (see below) |

### Redirects (astro.config.mjs)

```js
redirects: {
  '/media':          '/shelf',
  '/media/[...slug]': '/shelf/[...slug]',
}
```

These produce 301 responses for any old bookmarked or externally-linked URLs.

### What does NOT change

- The `content_type` field values (`anime`, `manga`, `film`, etc.)
- `isFavorite` field and the `★ favorites` filter
- Filter logic (`filterEngine.ts`) — no route awareness, unaffected
- Quick-view panel behavior and overlay JS
- NavPill component itself — only the `backLink`/`backLabel` props in the slug page change
- Any CSS class names (they already use `media-card`, `media-grid`, etc. as UI names — these stay as-is to avoid a sprawling CSS rename)

---

## Part 2: Content indicator

### Detection

In `src/pages/shelf/index.astro`, import `hasMinimalContent` from `src/utils/content.ts`.

When building `entryData`:
```ts
hasContent: !hasMinimalContent(entry.body),
```

`hasMinimalContent(body)` returns `true` when body is empty/near-empty (< 20 chars after stripping). Negating it gives `true` when a real note exists.

### Server-rendered markup

Add class to each card `<a>` element:
```astro
class:list={['media-card', { 'media-card--has-note': !hasMinimalContent(entry.body) }]}
```

### CSS

Added inside the `<style>` block of `shelf/index.astro`:
```css
.media-card--has-note {
  border-color: rgba(255, 229, 44, 0.5);
  box-shadow: 0 0 12px rgba(255, 229, 44, 0.15), inset 0 0 0 1px rgba(255, 229, 44, 0.1);
}
.media-card:not(.media-card--has-note) {
  opacity: 0.55;
}
```

### entryData JSON

Also include `hasContent` in the serialized `entryData` so the quick-view panel can optionally reflect it (e.g., show/hide a "read note →" link based on whether content exists).

---

## Out of scope

- Renaming CSS class prefixes (`media-card`, `media-grid`) — cosmetic only, no user-visible impact
- Adding a filter for "has note" — not requested
- Changing the page display title beyond "Shelf" (no subtitle or tagline changes)
- Updating `CLAUDE.md` — treated as a separate maintenance step

---

## Testing

After implementation:
1. `npm run build` — confirms schema and static path generation pass
2. Visit `/shelf` — grid renders, filter bar works, cards show glow/dim correctly
3. Visit `/shelf/[slug-with-content]` — detail page loads
4. Visit `/media` — browser follows 301 to `/shelf`
5. Visit `/media/persona-4-golden` — follows 301 to `/shelf/persona-4-golden`
6. Visit `/favorites` — still redirects to `/shelf?fav=1`
7. `npm run test` — existing unit tests pass
