# Stream Page Design

**Date:** 2026-05-06  
**Route:** `/stream`  
**Related change:** KAIMA tile → Ninjaruss_ stream tile (links to `/stream`, Twitch live detection)

---

## Overview

A Persona 4/5-inspired "Velvet Room" single-page experience documenting the ninjaruss_ Twitch stream. Five tab panels, fully viewport-height, no body scroll. Content is Markdown-driven via Astro content collections built at deploy time.

---

## Stats

Five stats, each with a color and tagline:

| Stat | Color | Hex | Tagline |
|------|-------|-----|---------|
| Determination | Red | `#ff4040` | *The will to continue* |
| Insight | Blue | `#4ab0ff` | *Seeing through the noise* |
| Expression | Purple | `#a855f7` | *Making something from nothing* |
| Sincerity | Gold | `#ffe52c` | *Meaning what you say* |
| Chaos | Teal | `#2dd4bf` | *Embracing the unexpected* |

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  chrome bar: NINJARUSS_ [Status][Quests][Log][Bonds][Velvet]  │
├────────────────────────────────────────────────────────┤
│ header: session title + date range                     │
├──────────────┬─────────────────────────────────────────┤
│              │                                         │
│  VN Sprite   │   Active panel content                  │
│  (220px)     │                                         │
│  full-height │                                         │
│  bleeds from │                                         │
│  bottom edge │                                         │
└──────────────┴─────────────────────────────────────────┘
```

- **Left column:** 220px fixed, full-height VN portrait image bleeding from the bottom edge
- **Right column:** flex-1, hosts whichever tab panel is active
- **No body scroll** — panels are absolutely positioned within the right column

---

## Tabs

### 1. Status
- **Left subcolumn:** SVG pentagram/radar chart (260px, built at render time from tallied stats)
- **Right subcolumn:** Ranked stat list (1–5 by count)
  - Each row: rank number · stat name · tagline keyword · "Filtering log →" active-state tag · count (large mono)
  - Recent (last 10 streams) / All-time toggle above the list
  - All-time dashed polygon overlaid behind the recent solid polygon on the radar chart
  - Clicking a stat navigates to Log tab with that stat pre-filtered

### 2. Quests
- Renders content from `src/content/quest-menu.md` (single file, not a collection)
- Markdown with headings = quest categories, list items = individual quests
- Read at build time via a utility function, not a content collection

### 3. Log
- Chronological list of stream entries (most recent first)
- Each entry: title, date, summary, stat chips (colored), memorable quote
- Filter bar at top: one pill per stat + "All". Pre-filtered when navigating from Status tab click
- Entries from `src/content/stream/` collection

### 4. Bonds
- Card grid of social-link entries from `src/content/social-links/` collection
- Each card: name, arcana, affinity, rank (1–5 as filled/empty circles)

### 5. Velvet
- Minimal: large styled title + contact email displayed as styled mono text

---

## Content Collections

### `stream`
```typescript
{
  title: string,          // stream session title
  publishedAt: date,      // date of stream (required)
  stats: string[],        // e.g. ["Determination", "Insight"]
  summary: string,        // one-sentence summary
  memorable: string,      // memorable quote from the session
  draft: boolean,         // defaults to false
}
```

### `social-links`
```typescript
{
  name: string,           // person's name/handle
  arcana: string,         // Persona arcana (e.g. "The Tower")
  affinity: string,       // one-word descriptor
  rank: number,           // 1–5
  lastInteraction: string, // freeform date string
  draft: boolean,
}
```

### Quest Menu
Single file at `src/content/quest-menu.md` — not a collection. Read via `fs.readFileSync` + `marked` at build time in a utility function `src/utils/stream.ts`.

---

## Utilities (`src/utils/stream.ts`)

- `tallyStats(entries, mode: 'recent' | 'all')` — counts stat occurrences; `recent` = last 10 by `publishedAt`
- `buildRadarPath(tallies, maxVal, cx, cy, r)` — returns SVG polygon points for the pentagram
- `parseQuestMenu(markdown)` — parses quest-menu.md into `{ category: string, quests: string[] }[]`

---

## Twitch Live Detection (`src/utils/twitchStatus.ts`)

```typescript
export function parseTwitchLiveResponse(data: unknown): boolean
```

Client-side polling (every 5 min) hits:
```
GET https://api.twitch.tv/helix/streams?user_login=ninjaruss_
Headers: Client-ID: {PUBLIC_TWITCH_CLIENT_ID}
         Authorization: Bearer {PUBLIC_TWITCH_ACCESS_TOKEN}
```

Returns `true` if `data.data.length > 0` (stream is live).

Env vars: `PUBLIC_TWITCH_CLIENT_ID`, `PUBLIC_TWITCH_ACCESS_TOKEN`

---

## Homepage Tile Update

The current KAIMA tile (lines ~186–211 of `src/pages/index.astro`) becomes the Ninjaruss_ stream tile:
- Link changes from `https://www.youtube.com/@kaima-mask` → `/stream`
- "Watch Live" button links to `https://twitch.tv/ninjaruss_`
- Live detection switches from YouTube Data API → Twitch Helix API
- Tile label/copy updated to reflect the ninjaruss_ stream
- `src/utils/liveStatus.ts` keeps `parseYouTubeLiveResponse` (used elsewhere or simply replaced by `twitchStatus.ts`)

---

## Styles

New file `src/styles/stream.css`. Key decisions:
- Dark Velvet Room palette: `#0a0a0c` base, blue-violet atmospheric accents
- All five stat colors as CSS custom properties
- Viewport-height shell, tab panels `position: absolute; inset: 0`
- VN sprite `object-fit: cover; object-position: top center`, bleeds from bottom
- Radar chart SVG rendered inline with `viewBox="0 0 300 300"`
- Respects `prefers-reduced-motion`

---

## Files Created / Modified

| Action | Path |
|--------|------|
| Create | `src/pages/stream/index.astro` |
| Create | `src/styles/stream.css` |
| Create | `src/utils/stream.ts` |
| Create | `src/utils/twitchStatus.ts` |
| Create | `src/content/stream/` (directory + sample entry) |
| Create | `src/content/social-links/` (directory + sample entry) |
| Create | `src/content/quest-menu.md` |
| Modify | `src/content/config.ts` (add `stream` + `social-links` schemas) |
| Modify | `src/pages/index.astro` (update KAIMA → stream tile) |
