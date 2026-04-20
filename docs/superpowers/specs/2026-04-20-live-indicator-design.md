# Live Streaming Indicator — Design Spec

**Date:** 2026-04-20
**Status:** Approved

---

## Overview

Add a live streaming indicator to the homepage that shows when the user is broadcasting on YouTube. Two surfaces change when live: a dedicated tile in the bento grid and an animated border around the entire page container.

---

## Tile

### Placement

Replace the two decorative `bento-tile--static` elements in row 5, columns 3–4 with a single 2×1 (`bento-tile--span-2x1`) live tile. No other grid changes required.

### States

**Offline (default)**
- Label: `Stream`
- Title: `KAIMA 悔魔`
- Handle: `@kaima-mask`
- Footer: `not streaming right now`
- Style: standard dark tile, gold hard-shadow, no animation

**Live — YouTube**
- Label: `● Live` (red badge, flashing)
- Title: `KAIMA 悔魔`
- Handle: `@kaima-mask`
- Platform indicator: `YouTube`
- Footer: `watch live now →`
- Link: `https://www.youtube.com/@kaima-mask`
- Style: red border (`#ff4040`), dark red tint background, pulsing red glow shadow

---

## Page Border

A flowing gradient border wraps the homepage container (`.container`) when live. Implemented as a pseudo-element — no layout shift.

- **Live:** red → orange → gold gradient flowing left-to-right (`#ff4040` → `#ff6a1a` → `#ffe52c`)
- **Offline:** border invisible
- Animation: `background-position` sweep, 4s linear infinite, `background-size: 300% 100%`
- Respects `prefers-reduced-motion`: border present but static (no animation)

---

## Detection — Client-Side API Polling

### YouTube

- API: YouTube Data API v3 — `search.list` endpoint
- Parameters: `part=id`, `channelId=UCjgsr8Oki5_CPwx53tdnwCg`, `type=video`, `eventType=live`
- A non-empty `items` array means the channel is live
- API key via `import.meta.env.PUBLIC_YOUTUBE_API_KEY` (stored in `.env.local`, never committed)
- Key restricted to `ninjaruss.net` referrer in Google Cloud Console

### Implementation Notes

- Polling via `setInterval` (60 000ms), cleared on page unload / view transition teardown
- Initial check fires immediately on load (no 60s wait for first render)
- On API error / network failure: silently stay in offline state (no UI error shown)
- State managed via class toggles on the tile element and `.container`

---

## Components & Files Changed

| File | Change |
|------|--------|
| `src/pages/index.astro` | Replace 2× `bento-tile--static` with live tile markup; add live border to `.container`; add polling script |
| Scoped `<style>` in `index.astro` | Live tile styles (red live state, border animation) |
| `.env.local` | Add `PUBLIC_YOUTUBE_API_KEY` |

No new components required — tile is self-contained markup in `index.astro`.

---

## Accessibility

- Live badge region uses `aria-live="polite"` so screen readers announce state changes
- Tile is an `<a>` tag (links to stream) when live; a `<div role="status">` when offline
- `prefers-reduced-motion`: animations disabled; border remains as a static colored outline
- Color is not the only indicator — text label (`● Live` / `not streaming`) conveys state independently
