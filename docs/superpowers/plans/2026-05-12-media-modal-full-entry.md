# Media Modal Full Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the quick-view overlay with a full-entry modal, add path-based URL routing (`/media/slug` in the address bar when open), and make direct navigation to `/media/[slug]` open the overlay on the grid.

**Architecture:** Two files change. `[...slug].astro` gains an inline redirect script so browser visits go to `/media?open=slug`; `fetch()` from the overlay ignores it since scripts don't execute in fetched HTML. The media index overlay gets full content (type, title, tags, dates, prose), path-based history pushState/replaceState, and a popstate listener for the Back button.

**Tech Stack:** Astro 5, TypeScript, vanilla DOM/History API, existing `buildFilterURL` utility.

---

## File Map

| File | Change |
|------|--------|
| `src/pages/media/index.astro` | entryData shape, overlay HTML/CSS, URL+history management |
| `src/pages/media/[...slug].astro` | add inline redirect script |

---

### Task 1: Update `entryData` shape in `index.astro`

Remove `excerpt`, add `publishedAt` and `updatedAt`. Update the TypeScript type in the `<script>` block to match.

**Files:**
- Modify: `src/pages/media/index.astro`

- [ ] **Step 1: Update server-side entryData mapping (frontmatter, lines 13–21)**

Replace the existing `entryData` mapping with:

```ts
const entryData = sortedMedia.map((entry) => ({
  slug: entry.slug,
  title: entry.data.title,
  type: entry.data.content_type,
  isFavorite: entry.data.isFavorite ?? false,
  emblem: entry.data.emblem ?? '/images/emblems/default.svg',
  tags: entry.data.tags ?? [],
  publishedAt: entry.data.publishedAt?.toISOString() ?? null,
  updatedAt: entry.data.updatedAt?.toISOString() ?? null,
}));
```

- [ ] **Step 2: Update `EntryData` TypeScript type (script block, lines 454–463)**

Replace the existing `EntryData` type with:

```ts
type EntryData = {
  slug: string;
  title: string;
  type: string;
  isFavorite: boolean;
  emblem: string;
  tags: string[];
  publishedAt: string | null;
  updatedAt: string | null;
};
```

- [ ] **Step 3: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: build completes with no errors. Ignore any unrelated warnings.

- [ ] **Step 4: Commit**

```bash
git add src/pages/media/index.astro
git commit -m "feat(media): add dates to entryData, remove excerpt"
```

---

### Task 2: Update overlay content — remove link, add date line

Remove the "View full entry →" button and its CSS. Add a date formatter and a date line in the overlay content.

**Files:**
- Modify: `src/pages/media/index.astro`

- [ ] **Step 1: Add `formatEntryDate` helper at module level**

Add this function at module level, directly after the existing `esc` function (outside `initMediaPage`):

```ts
function formatEntryDate(publishedAt: string | null, updatedAt: string | null): string {
  if (!publishedAt) return '';
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
  const pubStr = new Date(publishedAt).toLocaleDateString('en-US', opts);
  if (updatedAt) {
    const pub = new Date(publishedAt);
    const upd = new Date(updatedAt);
    if (upd > pub) {
      const updStr = upd.toLocaleDateString('en-US', opts);
      return `${pubStr} · Updated ${updStr}`;
    }
  }
  return pubStr;
}
```

- [ ] **Step 2: Update `openOverlay` — replace innerHTML template**

In `openOverlay`, replace the `overlayContent.innerHTML = ...` block with:

```ts
const dateStr = formatEntryDate(entry.publishedAt, entry.updatedAt);

overlayContent.innerHTML = `
  <p class="ov-type">${esc(entry.type)}</p>
  <h2 class="ov-title">${esc(entry.title)}</h2>
  ${entry.tags.length
    ? `<div class="ov-tags">${entry.tags.map((t) => `<span class="ov-tag">${esc(t)}</span>`).join('')}</div>`
    : ''}
  ${dateStr ? `<p class="ov-date">${esc(dateStr)}</p>` : ''}
  <div class="ov-loading" id="ov-prose">Loading…</div>
`;
```

- [ ] **Step 3: Remove `.ov-full-link` CSS block from the `<style>` section**

Delete the entire `.ov-full-link` and `.ov-full-link:hover` rules (approximately lines 396–416):

```css
/* DELETE THIS ENTIRE BLOCK */
.ov-full-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-gold);
  border: 1px solid var(--color-gold-dim, rgba(255,229,44,0.3));
  border-radius: 4px;
  padding: 6px 12px;
  transition: background 150ms, border-color 150ms;
  text-decoration: none;
  align-self: flex-start;
}
.ov-full-link:hover {
  background: rgba(255, 229, 44, 0.08);
  border-color: var(--color-gold);
}
```

- [ ] **Step 4: Add `.ov-date` CSS rule**

Add after `.ov-loading` styles:

```css
.ov-date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-muted);
  margin: 0;
}
```

- [ ] **Step 5: Build to verify**

```bash
npm run build
```

Expected: builds cleanly.

- [ ] **Step 6: Commit**

```bash
git add src/pages/media/index.astro
git commit -m "feat(media): full-entry overlay — date line, remove quick-view link"
```

---

### Task 3: Refactor URL and history management in overlay JS

Replace the `updateOpenURL` / `clearOpenURL` functions with `history.pushState` (card click) and `history.replaceState` (redirect path). Add a popstate listener for the Back button.

**Files:**
- Modify: `src/pages/media/index.astro` (`<script>` block only)

- [ ] **Step 1: Add `overlayPushedHistory` flag**

At the top of `initMediaPage`, alongside the existing `let previouslyFocused` declaration, add:

```ts
let overlayPushedHistory = false;
```

- [ ] **Step 2: Delete `updateOpenURL` and `clearOpenURL` functions**

Remove both of these functions entirely from the script (they are no longer called):

```ts
// DELETE
function updateOpenURL(slug: string) { ... }

// DELETE  
function clearOpenURL() { ... }
```

- [ ] **Step 3: Update the card click handler to push history before opening**

Replace the existing card click handler inside `if (overlay)`:

```ts
cards.forEach((card) => {
  card.addEventListener('click', (e) => {
    const slug = card.dataset.slug;
    if (!slug) return;
    const entry = entryMap.get(slug);
    if (!entry) return;
    e.preventDefault();
    previouslyFocused = card;
    history.pushState(null, '', `/media/${slug}`);
    overlayPushedHistory = true;
    openOverlay(slug, entry);
  });
});
```

- [ ] **Step 4: Update `openOverlay` — remove history call**

In `openOverlay`, delete the `updateOpenURL(slug)` call (it was just before `fetch(...)`). The function should no longer touch history.

- [ ] **Step 5: Rewrite `closeOverlay` to use history flag**

Replace the entire `closeOverlay` function. The `fromPop` parameter prevents calling `history.back()` again when the popstate listener already triggered the close — avoiding a double navigation:

```ts
function closeOverlay(fromPop = false) {
  if (!overlay) return;
  overlay.hidden = true;
  document.body.style.overflow = '';
  activeFetch?.abort();

  if (!fromPop) {
    if (overlayPushedHistory) {
      history.back();
    } else {
      const filterURL = buildFilterURL({ type: activeType, favOnly });
      history.replaceState(null, '', '/media' + filterURL);
    }
  }
  overlayPushedHistory = false;

  previouslyFocused?.focus();
  previouslyFocused = null;
}
```

Note: we set `overlay.hidden = true` before calling `history.back()`. The `history.back()` fires a `popstate` event asynchronously; by then the overlay is already hidden, so the popstate listener's `!overlay.hidden` guard prevents a second call.

- [ ] **Step 6: Add popstate listener (Back button support)**

Add this inside `if (overlay)`, after the existing `document.addEventListener('keydown', ...)` block:

```ts
window.addEventListener('popstate', () => {
  if (!overlay.hidden) closeOverlay(true);
}, { signal: pageCleanup!.signal });
```

- [ ] **Step 7: Update `initialOpen` block to use replaceState**

Replace the existing `if (initialOpen)` block at the bottom of `if (overlay)`:

```ts
if (initialOpen) {
  const entry = entryMap.get(initialOpen);
  if (entry) {
    history.replaceState(null, '', `/media/${initialOpen}`);
    overlayPushedHistory = false;
    previouslyFocused = grid.querySelector<HTMLElement>(`[data-slug="${initialOpen}"]`) ?? document.body as HTMLElement;
    openOverlay(initialOpen, entry);
  }
}
```

- [ ] **Step 8: Build to verify**

```bash
npm run build
```

Expected: builds cleanly. No TypeScript errors about missing `updateOpenURL`, `clearOpenURL`, or mismatched types.

- [ ] **Step 9: Commit**

```bash
git add src/pages/media/index.astro
git commit -m "feat(media): path-based URL routing for overlay (/media/slug)"
```

---

### Task 4: Add redirect script to `[...slug].astro`

When a browser navigates directly to `/media/[slug]`, redirect to `/media?open=slug`. The fetch from the overlay ignores this script since `fetch()` does not execute scripts.

**Files:**
- Modify: `src/pages/media/[...slug].astro`

- [ ] **Step 1: Add the redirect script inside `<BaseLayout>`**

In `[...slug].astro`, add immediately after the opening `<BaseLayout ...>` tag (before `<div class="media-detail">`):

```astro
<script define:vars={{ entrySlug: entry.slug }}>
  window.location.replace('/media?open=' + encodeURIComponent(entrySlug));
</script>
```

Note: `define:vars` on a `<script>` tag makes it inline automatically in Astro. The variable is serialized as a `const` at the top of the script block.

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

Expected: builds cleanly. Each `/media/[slug]` page now includes the redirect script in its output HTML.

- [ ] **Step 3: Manual browser test — direct navigation**

```bash
npm run preview
```

Open `http://localhost:4321/media` in a browser. Confirm:
1. Click a media card → URL changes to `/media/[slug]` → overlay opens with type, title, tags, date line, and loaded prose
2. Click X or press Escape → URL changes back to `/media` (or `/media?type=...` if filter was active) → overlay closes
3. Click a card, then press the browser Back button → overlay closes, URL returns to `/media`

Open `http://localhost:4321/media/[any-slug]` directly (pick a real slug from the grid). Confirm:
4. Page briefly shows the detail page then redirects to `/media?open=[slug]` → URL becomes `/media/[slug]` → overlay is open with full content
5. "View full entry" link is gone from the overlay

- [ ] **Step 4: Commit**

```bash
git add src/pages/media/[...slug].astro
git commit -m "feat(media): redirect /media/slug to overlay on direct navigation"
```
