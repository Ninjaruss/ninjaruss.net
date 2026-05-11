# Homepage Tiles Redesign

**Date:** 2026-05-10
**Scope:** `src/pages/index.astro`, `src/styles/stream.css`

---

## Overview

Three changes to the homepage bento grid:

1. **Stream log tile** (rows 2–3, col 5–6, 1×2) — replace the current plain-text stream tile with a mini pentagram radar chart showing real stat tallies.
2. **YouTube channel tile** (row 1, col 5, 1×1) — replace the Twitch-always-on image tile with a YouTube channel tile that swaps to a Twitch live preview when the stream is active.
3. **Contrast pass on `stream.css`** — lift several near-invisible text colors that blend into the dark background.

---

## 1. Stream Log Tile

### Final Design (v12b)

- **Header**: `Stream Log` label / `Ninjaruss` title / session count subtext / leading-stat row with upward CSS triangle + full stat name
- **Radar**: Compact SVG (`height: auto`, `viewBox="-30 -16 160 128"`), scanline texture overlay
- **Data polygon**: 3-second breathing glow animation (`data-breathe`)
- **Active dots**: 3-second radius pulse (`dot-pulse`) on stats with the highest tally
- **Stat labels**: DET / INS / CHA / SIN / EXP at R=58, with `×N` counts below each
- **Footer**: `→ View Log`

### Data (computed at build time in `index.astro`)

```ts
const sessions = await getCollection('stream', e => !e.data.draft);
const tallies  = tallyStats(sessions, 'all');          // from src/utils/stream.ts
const maxVal   = Math.max(1, ...Object.values(tallies).map(v => v ?? 0));
const dataPoints = buildRadarPoints(tallies, maxVal, 50, 50, 42);
const sessionCount = sessions.length;

// Leading stat (first in STAT_ORDER if tied)
const leadingStat = STAT_ORDER.reduce((best, s) =>
  (tallies[s] ?? 0) > (tallies[best] ?? 0) ? s : best
, STAT_ORDER[0]);
```

### Stat color map

```ts
const STAT_COLORS = {
  Determination: { hex: '#ff4040', rgb: '255,64,64' },
  Insight:       { hex: '#4ab0ff', rgb: '74,176,255' },
  Chaos:         { hex: '#2dd4bf', rgb: '45,212,191' },
  Sincerity:     { hex: '#ffe52c', rgb: '255,229,44' },
  Expression:    { hex: '#a855f7', rgb: '168,85,247' },
};
```

### SVG geometry (all coordinates: center = (50, 50))

**Vertex positions at R=42** (use `buildGuidePoints(1.0, 50, 50, 42)` or hardcode):
| Stat | cx | cy |
|------|----|----|
| DET (V0, top) | 50 | 8 |
| INS (V1, upper-right) | 89.95 | 37.0 |
| CHA (V2, lower-right) | 74.69 | 84.0 |
| SIN (V3, lower-left) | 25.31 | 84.0 |
| EXP (V4, upper-left) | 10.05 | 37.0 |

**Layer order (back → front):**
1. Ghost pentagon R=50 — `stroke="rgba(255,229,44,0.07)"` `stroke-width="1"`
2. Guide ring 25% R=10.5 — `stroke="rgba(255,255,255,0.05)"` `stroke-width="0.8"`
3. Guide ring 50% R=21 — `stroke="rgba(255,255,255,0.06)"` `stroke-width="0.8"`
4. Guide ring 75% R=31.5 — `stroke="rgba(255,255,255,0.06)"` `stroke-width="0.8"`
5. Outer pentagon R=42 — `stroke="rgba(255,255,255,0.09)"` `stroke-width="0.8"`
6. Five axes (center → each vertex) — `stroke="rgba(255,255,255,0.07)"` `stroke-width="0.8"`
7. Pentagram star diagonals (V0→V2→V4→V1→V3) — dashed `stroke-dasharray="3 3"` `stroke="rgba(255,255,255,0.06)"`
8. Data polygon — `fill="rgba(255,229,44,0.12)"` `stroke="#ffe52c"` `stroke-width="2"` + `data-breathe` animation
9. Vertex dots — colored per stat, active dots (value > 0) get `dot-pulse` animation
10. Stat labels + `×N` counts — at R=58 positions

**Label positions (R=58):**
| Stat | x | y | anchor |
|------|---|---|--------|
| DET | 50 | -4 | middle |
| INS | 107 | 34 | start |
| CHA | 85 | 97 | middle |
| SIN | 15 | 97 | middle |
| EXP | -7 | 34 | end |

Count `×N` labels sit 8 SVG units below each name label.

### Animations

```css
@keyframes data-breathe {
  0%, 100% { opacity: 1;   filter: drop-shadow(0 0 4px rgba(255,229,44,.4)); }
  50%       { opacity: .78; filter: drop-shadow(0 0 11px rgba(255,229,44,.7)); }
}
@keyframes dot-pulse {
  0%, 100% { r: 3.5px; }
  50%       { r: 5px; }
}
```

Both are 3s ease-in-out infinite. Wrap in `@media (prefers-reduced-motion: no-preference)`.

### Contrast values

| Element | Value |
|---------|-------|
| Session count subtext `.st-sub` | `#777` |
| Footer label `.st-footer-label` | `#777` |
| Inactive stat labels (opacity) | `0.55` |
| Inactive `×N` count (opacity) | `0.45` |
| Active `×N` count (opacity) | `0.70` |

### Live state

The tile keeps the existing `.is-live` class behavior (red border, pulse animation from existing CSS). When Twitch is live, a small `LIVE` badge becomes visible in the footer area. The existing `applyLiveState` JS function handles this — add a toggle for `#st-live-badge` alongside the existing watch button logic.

The old `stream-watch-btn` is removed from the tile HTML. A `st-live-badge` span replaces it.

### HTML skeleton

```html
<a id="stream-tile" href="/stream"
   class="bento-tile bento-tile--dark bento-tile--interactive bento-tile--span-1x2 stream-tile">

  <div class="st-header" style={`--st-accent: ${leadingColor.hex}; --st-accent-rgb: ${leadingColor.rgb};`}>
    <div class="st-label">Stream Log</div>
    <div class="st-title">Ninjaruss</div>
    <div class="st-sub">{sessionCount} session{sessionCount !== 1 ? 's' : ''} logged</div>
    {sessionCount > 0 && (
      <div class="st-top-stat">
        <div class="st-top-stat-tri"></div>
        <div class="st-top-stat-name">{leadingStat}</div>
      </div>
    )}
  </div>

  <div class="st-radar-wrap">
    <svg viewBox="-30 -16 160 128" preserveAspectRatio="xMidYMid meet">
      <!-- layers 1–10 per spec above, points computed server-side -->
    </svg>
  </div>

  <div class="st-footer">
    <div class="st-footer-icon">→</div>
    <div class="st-footer-label">View Log</div>
    <span id="st-live-badge" class="st-live-badge" hidden>LIVE</span>
  </div>

</a>
```

CSS variables `--st-accent` and `--st-accent-rgb` drive `border-left` and gradient on `.st-header`.

---

## 2. YouTube Channel Tile

### Default state

- Links to `https://www.youtube.com/@Ninjaruss`
- Centered YouTube play-button icon (SVG inline, red `#ff0000`)
- `NINJARUSS` label in small monospace caps
- `YouTube` sub-label
- Same `image-tile` shell, new class `image-tile--youtube`

### Twitch live state

When `twitchLive` is true, `applyLiveState` adds class `is-twitch-live` to `#yt-tile` and updates `href` to `https://twitch.tv/ninjaruss_`. CSS shows the live overlay (Twitch preview image + LIVE badge), hides the default channel content.

Preview URL: `https://static-cdn.jtvnw.net/previews-ttv/live_user_ninjaruss_-440x248.jpg`

The LIVE badge uses the existing red styling pattern (`#ff4040`).

### applyLiveState additions

```js
const ytTile = document.getElementById('yt-tile') as HTMLAnchorElement | null;
if (ytTile) {
  ytTile.classList.toggle('is-twitch-live', twitchLive);
  ytTile.href = twitchLive
    ? 'https://twitch.tv/ninjaruss_'
    : 'https://www.youtube.com/@Ninjaruss';
}
const liveBadge = document.getElementById('st-live-badge') as HTMLElement | null;
if (liveBadge) liveBadge.hidden = !isLive;
```

Remove the old `stream-watch-btn` toggle from the function.

---

## 3. stream.css Contrast Pass

Replace all near-invisible text colors (≤ 2.5:1 contrast ratio on `#0a0a0c`):

| Selector(s) | Before | After |
|-------------|--------|-------|
| `.j-section-sub`, `.bd-close`, `.bd-arcana`, `.bd-memory-when` | `#444` | `#777` |
| `.bond-arcana-label`, `.bd-rank-date`, `.mail-sub` | `#555` | `#777` |
| `.s-date-month`, `.bond-affinity`, `.bd-affinity` | `#666` | `#888` |
| `.bd-section-label` | `rgba(255,229,44,0.35)` | `rgba(255,229,44,0.6)` |

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/index.astro` | Stream tile HTML + CSS + JS; YouTube tile HTML + CSS + JS |
| `src/styles/stream.css` | Contrast lift on 10 selectors |
