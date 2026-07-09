# Homepage & Flow Refinement — Design

**Date:** 2026-07-08
**Status:** Approved by owner (interview-driven design session)

## Problem

A design review of ninjaruss.net found two classes of problems:

1. **Homepage density/hierarchy** — the largest tiles carry the least information
   (Showcase mostly empty yellow, Now tile shows only a month, Novel tile has dead
   space, TOP tile wastes a cell on a page that barely scrolls), and the Latest tile
   duplicates the Notes tile's first entry.
2. **Navigation flow** — Novel and Stream are unreachable once you leave the
   homepage (`/stream` has no NavPill at all), the Notes tile's list rows look
   clickable but aren't, and there are too many top-level destinations.

Additionally, `stripMarkdown()` leaks raw HTML (e.g. `<iframe ...`) into list
excerpts and the search index.

A meta-constraint from the owner: the site should motivate continued work on the
novel **without shame mechanics** (deadline counters trigger the exact avoidance
pattern they're meant to fix). Reward accumulation and lower the friction of
returning; never count absence.

## Design

### 1. Journal — merge Showcase + Notes

One section replaces two, at the **list level only**. Content collections stay
separate on disk; entry URLs do not move.

- **New route `/journal`**: a SplitViewLayout page listing `notes` + `showcase`
  entries together, sorted by date descending.
- **Type filter** alongside existing search/tag filtering: All / Inquiries
  (showcase) / Fragments (notes). Implemented in the existing
  `src/utils/splitView/` filter modules as a new facet.
- **Detail routes unchanged**: `/notes/[slug]` and `/showcase/[slug]` keep
  working exactly as today. No content moves, no slugs change.
- **Redirects**: `/notes` → `/journal?type=fragment`, `/showcase` →
  `/journal?type=inquiry` (301s, matching the existing legacy-redirect pattern).
- **Featured cards for Novel and Stream**: a compact two-card featured strip
  pinned above the entry list (not mixed into it, so date sorting stays clean),
  linking to `/novel` and `/stream` — everything made/maintained is reachable
  through one door.

### 2. NavPill — 4 items, everywhere

- Items: **HOME / JOURNAL / SHELF / NOW**.
- `/stream` gains the NavPill and **loses the "NINJARUSS" home button**; its
  internal Status/Journal/Bonds/Mailbox sidebar is untouched. (Note: the Stream
  page's internal "Journal" sidebar item is unrelated to the new /journal route;
  keep labels as-is unless it proves confusing.)
- `/novel` keeps the NavPill it already has (items updated to the new four).
- No mobile overflow handling needed at 4 items.

### 3. Homepage grid rebalance (desktop, 6 columns)

- **Row 1** — unchanged: Title (4×1), YouTube (1×1), Now (1×1).
- **Rows 2–3** — **Journal 4×2** (cols 1–4, single dominant core tile, yellow
  highlight treatment), **Novel 1×2** (col 5, promoted), **Stream 1×2** (col 6).
- **Rows 4–5** — Media Log 2×2 (cols 1–2), **Latest 2×2** (cols 3–4), col 5:
  MAL (r4) + quote (r5), col 6: Spotify (r4) + **email tile** (r5, replaces TOP).
- The TOP (back-to-top) tile is removed entirely.
- Mobile stacking order follows the grid order above.

### 4. Journal tile (4×2 core)

- Kicker `JOURNAL`, heading "Inquiries & Fragments" (copy easily changeable).
- List of ~5 most recent entries across both collections, **each row a real
  deep link** to its entry, with a small type badge per row (INQUIRY / FRAGMENT).
- Thumbnail/emblem row along the bottom (carried over from the Showcase tile).
- Tile header links to `/journal`. The tile must not be a single wrapping `<a>`
  (nested anchors are invalid); restructure so header and rows are separate links.

### 5. Novel tile — rain gauge (1×2, rows 2–3)

Motivation display designed around reward accumulation, not absence counting.

**Two word counts, unequal billing:**
- **Story words** — total words under the top-level `Scenes/` folder — the big
  gold number.
- **Outline words** — everything else (Characters, Locations, Lore, Themes) —
  smaller, grey, beneath it.

**Rain states (driven by recency):**
- Recent scene writing → full rain animation.
- Recent outline-only work → faint drizzle/mist.
- Neither within ~14 days → still state: a static droplet + "the rain waits."
- Intensity eases down over the ~14-day window. **Never red, never a count of
  days absent.**

**Implementation:**
- Extend `src/utils/novel.ts` with a helper returning
  `{ storyWords, outlineWords, lastSceneModified, lastOutlineModified }`,
  computed at build time from `buildNovelTree()` (word counts from markdown
  bodies; timestamps from the max `Modified:` sidecar date per branch, falling
  back to file mtime where no sidecar exists).
- The two timestamps are embedded in the tile as data attributes; a tiny inline
  script computes the current state client-side so it stays honest between
  deploys.
- Rain is a lightweight CSS animation (site precedent: the `/novel` canvas
  background). `prefers-reduced-motion` → static droplet + text, no animation.
- Existing "last touched" breadcrumb (e.g. "Characters › Gamer") is kept.

### 6. Other homepage tile changes

- **Now tile**: shows the latest now-entry's title (e.g. "Potential man must
  die.") plus date, instead of bare month/year.
- **Latest tile (now 2×2)**: shows the most recent entry **not already listed
  in the Journal tile**; gains a one-line excerpt under the title.
- **Media Log tile**: denser collage of up to 8 recent covers in two rows;
  the "4 ENTRIES" line is dropped.
- **YouTube tile**: angled P4G kicker chip ("YOUTUBE") overlaid on a corner of
  the full-bleed avatar; existing Twitch-live swap behavior unchanged.
- **Quote tile**: the rotation excludes "Live without regret." (duplicates the
  header tagline).
- **Email tile** (new, 1×1, replaces TOP): `mailto:` link styled like the
  MAL/Spotify logo tiles (centered icon, label, one-line blurb).

### 7. Bug fix — stripMarkdown HTML leak

`stripMarkdown()` in `src/utils/content.ts` additionally strips raw HTML tags,
fixing the `<iframe width="560"...` leak in the "Marie - Video Essay" showcase
list excerpt. Covered by a new vitest case.

## Error handling / edge cases

- Novel helpers must tolerate: missing `Scenes/` folder (storyWords = 0, still
  state), files without sidecar metadata (fall back to mtime), empty novel tree.
- Journal type filter with a `?type=` value that matches nothing falls back to All.
- Latest tile: if every recent entry is already in the Journal tile list, fall
  back to the most recent entry overall (duplication beats an empty tile).
- Redirects preserve the existing legacy-redirect conventions in
  `astro.config.mjs` / redirect pages.

## Testing

- `npm run test` (vitest): new cases for stripMarkdown HTML stripping and the
  novel word-count/timestamp helper (story vs outline attribution, sidecar
  fallback, empty-folder edge cases).
- `npm run build`: schema + route validation, confirms redirects and
  `getStaticPaths` still enumerate correctly.
- Visual verification via the dev preview at desktop (1280) and mobile (375)
  widths: grid layout, rain gauge states (force via data attributes), NavPill on
  all pages including /stream, Journal filter behavior, reduced-motion fallback.

## Out of scope

- Any redesign of the /shelf, /novel reader, or /stream page internals.
- Folding Now into Journal (decided against: /now stays standalone).
- Changes to content collection schemas or entry frontmatter.
