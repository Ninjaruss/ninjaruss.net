# Media Modal — Full Entry Design

**Date:** 2026-05-12

## Goal

Replace the quick-view panel on `/media` with a full-entry modal. When the overlay is open, the browser URL should be `/media/[slug]`. Navigating directly to `/media/[slug]` should open the overlay on the media grid rather than showing a standalone detail page.

---

## Scope

Two files change:
- `src/pages/media/[...slug].astro` — add client-side redirect script
- `src/pages/media/index.astro` — update overlay content, URL/history management, and entryData shape

---

## 1. `[...slug].astro` — Client-Side Redirect

Add a `<script>` tag injected at build time with the entry's slug:

```html
<script>window.location.replace('/media?open=SLUG');</script>
```

- Fires immediately on browser navigation, redirecting to the media index with `?open=SLUG`
- `fetch()` calls from the overlay do not execute scripts, so the overlay can still extract `.entry__content` from these pages
- No-JS users see the full existing detail page unchanged (acceptable degradation)

No other changes to `[...slug].astro`.

---

## 2. `entryData` JSON Shape

Add two fields:

```ts
type EntryData = {
  slug: string;
  title: string;
  type: string;
  isFavorite: boolean;
  emblem: string;
  tags: string[];
  publishedAt: string | null;   // added — ISO date string
  updatedAt: string | null;     // added — ISO date string
  // excerpt removed
};
```

`excerpt` is removed since it was only used in the old quick-view. `publishedAt`/`updatedAt` are used to render a date line in the overlay without needing to parse the fetched HTML.

---

## 3. Overlay Content

**Remove:** `ov-full-link` button ("View full entry →") and its CSS.

**Overlay content panel renders:**
1. Type label (mono, muted)
2. Title (gold, large)
3. Tags
4. Date line — formatted `publishedAt`, with "Updated" suffix if `updatedAt` differs
5. Full prose — fetched from `/media/[slug]`, `.entry__content` extracted via `DOMParser`

Related content is excluded from the modal (cross-collection HTML is complex to transplant and adds little value in this context).

---

## 4. URL and History Management

### Two opening paths

**A. Card click (normal)**

```
card click
  → history.pushState(null, '', `/media/${slug}`)
  → openOverlay(slug, entry)
  → overlayPushedHistory = true
```

Close (X / ESC / backdrop):
```
history.back()   // returns to previous URL naturally (e.g. /media?type=anime)
overlayPushedHistory = false
```

**B. Direct URL / redirect (`?open=slug`)**

```
page loads with ?open=slug in URL
  → history.replaceState(null, '', `/media/${slug}`)  // clean URL immediately
  → openOverlay(slug, entry)
  → overlayPushedHistory = false
```

Close:
```
history.replaceState(null, '', '/media' + currentFilterURL)
// no extra history entry; Back button goes to wherever user came from
```

### Browser Back button

A `popstate` listener fires when the user presses Back while the overlay is open:

```js
window.addEventListener('popstate', () => {
  if (!overlay.hidden) closeOverlay({ fromPop: true });
});
```

`fromPop: true` signals `closeOverlay` to skip calling `history.back()` again (avoids double-navigation).

### `overlayPushedHistory` flag

Tracks whether the overlay was opened via `pushState` (card click) or `replaceState` (redirect). `closeOverlay` reads this to decide whether to call `history.back()` or `history.replaceState`.

---

## 5. What Does Not Change

- Card `<a href>` attributes stay as `/media/${slug}` — clicking without JS navigates to the detail page, which then redirects via JS. With JS, the click is intercepted before navigation.
- Filter tab logic and `updateFilterURL` remain unchanged.
- The `?open=slug` query-param path is kept as the redirect target from `[...slug].astro` — the index page handles it and immediately replaces the URL with the clean slug path.
- Poster image, overlay layout (left poster / right content), animations, focus trap, and keyboard handling are unchanged.

---

## Non-Goals

- Server-side redirects (not feasible in static Astro without platform config)
- Related content in the modal
- Fragment JSON endpoints
- SSG slug-page copies of the full grid
