# Stream Status Page Design

**Date:** 2026-05-07  
**Status:** Approved

---

## Overview

A dedicated `/stream` page that functions as a live "character sheet" for the streamer — surfacing personal stats, social bonds, and current focus in a Persona 5 Royal aesthetic. The page is sidebar-navigated with three panels: Status, Bonds, and Quests.

---

## Layout

A fixed full-viewport layout with two regions:

- **Sidebar** (220px, fixed) — logo, three nav tabs with an animated gold indicator that slides between them
- **Content area** (flex: 1) — shared header (session title, live badge, portrait) + swappable panel below

Navigation is client-side tab switching with no page reload. The active panel is shown; others are `display: none`.

### Header

Contains: session title (e.g. "STREAM SESSION"), live status badge, and a portrait image. Future enhancement: portrait image changes per active panel.

---

## Status Panel

Displays the streamer's five personal stats on a pentagonal radar chart.

### Stats

| Stat | Color | Meaning |
|------|-------|---------|
| Determination | `#ff4040` (red) | Drive, persistence, follow-through |
| Insight | `#4ab0ff` (blue) | Depth of thought, pattern recognition |
| Expression | `#a855f7` (purple) | Creative output, design, writing |
| Sincerity | `#ffe52c` (gold) | Honesty, emotional presence |
| Chaos | `#20d4aa` (teal) | Improvisation, disruption, surprise |

### Radar Chart

SVG pentagon, ~400×360 viewport. Each vertex hosts a stat with:

- **Resting state:** small colored dot (r=7) with glow filter
- **Hover state:** dot fades out; a larger circle (r=20) fades in showing the stat's PNG emblem as a colored silhouette, plus a faint colored halo
- Silhouette effect: SVG filter chain — grayscale then `feColorMatrix` uses inverted luminance as alpha with constant stat color output (works cleanly for white-background PNGs)
- Stat number, name label, and keyword phrase render outside each circle; text anchors shift per vertex to avoid overlap

### Stat Scaling — Logarithmic Soft Cap

Stats use a logarithmic compression curve so early gains feel fast and meaningful while long-term accumulation stays visually balanced on the radar.

- Each stream session contributes raw points to one or more stats based on what happened
- Raw points convert to a display value via a log curve: `display = log_base(1 + raw) * scale_factor`
- A defined ceiling (e.g. 100 display points) represents "mastery" — attainable but requiring sustained effort
- The radar polygon is normalized to this ceiling, so all-time play never breaks the visual balance
- Early sessions feel like fast growth; sessions 30+ contribute meaningfully but compress toward the cap
- Exact base and scale factor are tuned at implementation time against real session data

### Objective Strip

A slim strip above the radar showing the current focus/goal for the session or arc. Styled with a gold left-border accent.

---

## Bonds Panel

Displays the streamer's named bonds — recurring presences in their creative life (collaborators, concepts, characters, communities).

### Bond List

Left column: list of bonds. Each row shows:
- Bond name
- Arcana label (thematic category)
- Affinity tagline
- Rank pip indicators (I–V)
- Row accent color from the bond's associated stat

Clicking a row opens the detail panel. Clicking the active row closes it.

### Detail Panel

Slides in from the right (`width: 0 → 300px`, `cubic-bezier(0.16,1,0.3,1)`). The list column shrinks to accommodate it within the fixed viewport — no overflow, no scroll on the outer container.

Detail panel contents:
- **Emblem** — bond's image with colored border/glow matching its stat
- **Arcana** — category label
- **Name** — in the bond's stat color
- **Affinity** — short descriptor tagline
- **Stat badge** — pill showing linked stat with colored dot
- **Rank row** — "RANK II" label (colored) + five pip indicators (filled = reached)
- **Reached date** — "Reached · Month Year" in subdued monospace; records when this rank was attained
- **About** — lore paragraph describing the bond's nature
- **Last Session** — memory of the most recent meaningful interaction + recency ("3 days ago")

### Rank System

Ranks are **manual milestone markers (I–V)**, not grind counters. Each rank represents a real story beat — a moment of deepened understanding, a completed collaboration, a shift in the relationship. They are set by the streamer intentionally, not incremented automatically.

This keeps ranks meaningful: Rank V is not "you streamed 50 times," it's "something real happened."

---

## Quests Panel

Displays active and completed quests/projects. Design to be specified in a follow-up spec.

---

## Visual Design

- Background: `#060608`
- Sidebar: `#0f0f12` with `1px solid #1a1a1e` right border
- Gold accent: `#ffe52c`
- Font: JetBrains Mono / Courier New (monospace throughout)
- All interactive states use gold glow: `0 0 12px rgba(255,229,44,0.08)`
- Animations: `cubic-bezier(0.16,1,0.3,1)` for panels; `cubic-bezier(0.16,1,0.3,1)` for tab indicator

---

## Future Enhancements

- **Per-panel portrait images** — the header portrait changes when switching between Status, Bonds, and Quests tabs
- **Session history** — line chart showing stat trends over time (complement to the radar's all-time snapshot)
- **Bond emblem uploads** — unique artwork per bond rather than shared stat emblems

---

## Files Affected (Implementation)

- `src/pages/stream.astro` — new page
- `src/styles/stream.css` — existing file (already has some stream styles)
- `src/components/` — new components for RadarChart, BondsList, BondDetail, StatVertex
- `src/content/` — new data source for bonds and session logs (schema TBD)
- `public/images/emblems/` — stat emblem PNGs (already exist)
- `public/images/bonds/` — bond portrait images (to be added)
