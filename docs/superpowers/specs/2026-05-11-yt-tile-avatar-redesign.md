# YouTube Tile Avatar Redesign

**Date:** 2026-05-11
**Status:** Approved

## Goal

Replace the current YouTube tile's icon-based default state with a full-bleed channel avatar image, and unify the hover reveal across both the default (not live) and live streaming states using a consistent slide-up strip pattern.

## Current State

The YouTube tile (`#yt-tile`, `.image-tile--youtube`) in `src/pages/index.astro` has two states:

- **Default:** Centered YouTube icon SVG + "Ninjaruss" label + "YouTube" sublabel on a dark background
- **Live (`.is-twitch-live`):** Twitch stream thumbnail fills the tile; LIVE badge in top-left; default content fades out

Hover currently: translate lift + red border only.

## New Design

### Default State (not live)

- YouTube channel avatar image (`/images/logos/yt-avatar.jpg`) fills the tile full-bleed via `<img>` with `object-fit: cover`
- No text or icon visible at rest

### Default Hover

1. Subtle red tint overlay fades in (`rgba(255,0,0,0.1)`)
2. Strip slides up from the bottom containing:
   - YouTube icon SVG (red, with drop-shadow glow)
   - "Ninjaruss" (name, uppercase mono, white)
   - "YouTube" (sub-label, uppercase mono, muted)
3. Strip background: gradient from `rgba(0,0,0,0.92)` at bottom to transparent
4. Existing translate lift (`-4px, -4px`) + red border-color on hover retained

### Live State (`.is-twitch-live`)

- Twitch stream thumbnail continues to fill the tile full-bleed (no change to existing thumbnail logic)
- LIVE badge retained in top-left corner (pulsing red)

### Live Hover

Same strip slides up from bottom, but content changes to:
- Twitch icon SVG (purple `#9146ff`, with drop-shadow glow)
- "Ninjaruss" (name)
- "Watching live →" (sub-label, muted red)

Red tint + translate lift retained identically to default hover.

## Assets

- **Required:** `public/images/logos/yt-avatar.jpg` — YouTube channel avatar, saved by user from their channel page
- Twitch thumbnail URL unchanged: `https://static-cdn.jtvnw.net/previews-ttv/live_user_ninjaruss_-440x248.jpg`

## Files Changed

- `src/pages/index.astro` — replace `yt-tile__content` markup with `<img>` avatar + new strip HTML; add strip to live overlay
- Scoped CSS in `index.astro` — update `.image-tile--youtube` styles; add `.yt-tile__strip` and `.yt-tile__tint` styles; remove old icon/label/sub styles that are no longer used

## Hover Transition Spec

- Strip: `transform: translateY(100%) → translateY(0)`, `transition: 0.26s cubic-bezier(0.16,1,0.3,1)`
- Tint: `opacity: 0 → 1`, `transition: 0.2s`
- Both triggered by `.image-tile--youtube:hover`
- Live state uses same selectors since strip is inside the tile regardless of live class
