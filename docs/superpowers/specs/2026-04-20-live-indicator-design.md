# Live Streaming Indicator — Design Spec

**Date:** 2026-04-20
**Status:** Approved

---

## Overview

Add a live streaming indicator to the homepage that shows when the user is broadcasting on YouTube or Twitch. Two surfaces change when live: a dedicated tile in the bento grid and an animated border around the entire page container.

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

**Live — Twitch**
- Label: `● Live` (purple badge, flashing)
- Title: `Ninjaruss`
- Handle: `ninjaruss_`
- Platform indicator: `Twitch`
- Footer: `watch live now →`
- Link: `https://www.twitch.tv/ninjaruss_`
- Style: purple border (`#9146ff`), dark purple tint background, pulsing purple glow shadow

### Priority

If both platforms are live simultaneously, YouTube takes precedence.

---

## Page Border

A flowing gradient border wraps the homepage container (`.container`) when live. Implemented as a CSS `outline` or pseudo-element — no layout shift.

- **YouTube live:** red → orange → gold gradient flowing left-to-right (`#ff4040` → `#ff6a1a` → `#ffe52c`)
- **Twitch live:** purple gradient flowing left-to-right (`#9146ff` → `#bf94ff` → `#9146ff`)
- **Offline:** no border / border invisible
- Animation: `background-position` sweep, 4s linear infinite, `background-size: 300% 100%`
- Respects `prefers-reduced-motion`: border present but static (no animation) when reduced motion is set

---

## Detection — Client-Side API Polling

Both platforms are polled from the browser on page load and every 60 seconds.

### YouTube

- API: YouTube Data API v3 — `search.list` endpoint
- Parameters: `part=id`, `channelId=<kaima-mask channel ID>`, `type=video`, `eventType=live`
- A non-empty `items` array means the channel is live
- API key restricted to `ninjaruss.net` referrer in Google Cloud Console

### Twitch

- API: Twitch Helix — `GET /streams?user_login=ninjaruss_`
- Requires a Twitch Client ID (app access token, public)
- A non-empty `data` array means the channel is live

### Implementation Notes

- Both API keys stored in a config object in a new `src/utils/liveStatus.ts` module (or inline in the homepage `<script>` block)
- Polling via `setInterval` (60 000ms), cleared on page unload / view transition teardown
- Initial check fires immediately on load (no 60s wait for first render)
- On API error / network failure: silently stay in offline state (no UI error shown)
- State stored in module-level variables; DOM updated via class toggles on the tile and container

---

## Components & Files Changed

| File | Change |
|------|--------|
| `src/pages/index.astro` | Replace 2× `bento-tile--static` with live tile markup; add live border class to `.container`; add polling script |
| `src/styles/global.css` or scoped `<style>` | Live tile variant styles (red/purple states, border animation) |

No new components required — tile is self-contained markup in `index.astro`.

---

## Accessibility

- Live badge uses `aria-live="polite"` so screen readers announce the state change
- Tile is an `<a>` tag (links to stream URL) when live; a `<div>` with `role="status"` when offline
- `prefers-reduced-motion`: animations disabled; border remains as static colored outline
- Color is not the only indicator — text label (`● Live` / `not streaming`) conveys state independently of color
