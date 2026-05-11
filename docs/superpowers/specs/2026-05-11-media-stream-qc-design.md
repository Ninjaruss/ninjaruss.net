# QC: Media & Stream Pages

**Date:** 2026-05-11
**Scope:** Bug fixes + missing features for `/media` and `/stream`. No architecture refactor.

---

## Section 1 — Media page: structural bugs

**Files:** `src/pages/media/index.astro`

1. Replace `<main class="media-page">` with `<div class="media-page">`. `BaseLayout` already wraps content in `<main id="main-content">`; nesting a second `<main>` is invalid HTML.
2. Remove `data-animate` attribute from the wrapper element — no CSS or JS references it.
3. Fix `var(--color-text-muted)` → `var(--color-muted)` in `.qv-excerpt`. The design system has `--color-muted`; `--color-text-muted` is undefined and silently breaks the excerpt text color.
4. Merge the two `<style>` blocks into one. The page currently splits page-structure styles and quick-view content styles into separate tags.

---

## Section 2 — Media page: missing features

**Files:** `src/pages/media/index.astro`

1. **Emblem in quick-view panel.** CLAUDE.md specifies the panel shows: emblem, type, title, tags, excerpt, link. The `openPanel()` function omits the emblem. Add an `<img>` using `entry.emblem` as the source, with an empty `alt` (decorative). Style it consistently with the existing `.qv-*` classes — circular, ~80px, centered above the type label.

2. **ESC key handler.** When the quick-view panel is open, pressing Escape should call `closePanel()`. Add a `keydown` listener on `document` inside `initMediaFilters`. Track panel open state with a boolean so the handler only fires when relevant.

3. **Animation reset on filter.** `applyFilters()` currently sets `--card-index` on visible cards but the `card-in` animation has already fired and won't replay. After updating visibility, reset the animation on each newly-visible card by: removing the animation, forcing a reflow (`void card.offsetWidth`), then restoring it. This matches the pattern used in the stream page's `enterItems()`.

4. **Reduced-motion.** Add `@media (prefers-reduced-motion: reduce)` to disable or instant-play `card-in`. The stream page already has this pattern; the media page is missing it.

---

## Section 3 — Stream page: bugs and correctness

**Files:**
- `src/content/stream/2026-05-08-normal-walking-stream.md`
- `src/content/stream/2026-05-10-jp-fairy-tales.md`
- `src/content/config.ts`
- `src/pages/stream/index.astro` (template guard)
- `src/styles/stream.css`

1. **Wrong publishedAt dates.** Both files have `publishedAt: 2026-05-06` despite their filenames indicating 2026-05-08 and 2026-05-10 respectively. Fix to match the filename dates. This directly affects entry sort order and date display in the journal.

2. **`memorable` required → optional.** Schema currently: `memorable: z.string()`. Change to `z.string().optional()`. In the template, guard the `.j-entry-memo` block: only render if `entry.data.memorable` is truthy.

3. **Dead CSS.** Remove the following rules from `stream.css` — they are styled but no corresponding HTML exists:
   - `.s-obj-due`, `.s-obj-due-date`, `.s-obj-due-days` (planned due-date UI, never built)
   - `.bond-stat-icon` (icon inside bond emblem, replaced by direct `<img>`)

4. **Unused CSS variables.** Remove `:root { --stat-determination: ...; --stat-insight: ...; ... }` block. These variables are defined but never consumed — all stat colors are injected via inline `style` attributes from `STAT_META`.

5. **Missing `role="tablist"`.** The `.s-tabs` container already has tab buttons with `role="tab"` and `aria-selected`, but the container itself lacks `role="tablist"`. Add it to complete the ARIA pattern.

---

## Out of scope

- Stream color system refactor (consolidating `STAT_META`, `SIL_FILTERS`, CSS vars) — working, no user-visible bugs
- Moving `colorBg()`/`hexToSilMatrix()` to `stream.ts` — internal organization, no user-visible effect
- Bonds panel content — only `sample.md` with `draft: true` exists; this is a content gap, not a code bug
- Radar vertex keyboard navigation — low-priority, not breaking
