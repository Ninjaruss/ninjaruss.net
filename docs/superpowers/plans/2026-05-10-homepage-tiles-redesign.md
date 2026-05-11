# Homepage Tiles Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage stream tile with a mini pentagram radar chart, swap the Twitch image tile for a YouTube channel tile (Twitch live swap), and lift low-contrast text in stream.css.

**Architecture:** All changes are in `src/pages/index.astro` (frontmatter data, HTML, scoped CSS, client-side JS) and `src/styles/stream.css` (contrast-only). No new files are created. Stream data is computed at build time using existing utilities from `src/utils/stream.ts`.

**Tech Stack:** Astro 5, TypeScript, SVG, CSS animations, `/api/live-status` polling

---

## File Map

| File | What changes |
|------|-------------|
| `src/styles/stream.css` | Bump 10 low-contrast color values |
| `src/pages/index.astro` | Frontmatter: import stream utils + compute radar data; HTML: stream tile, YouTube tile; CSS: new tile styles, remove old stream tile CSS; JS: update `applyLiveState` |

---

## Task 1: stream.css — contrast pass

**Files:**
- Modify: `src/styles/stream.css`

- [ ] **Step 1: Apply color replacements**

In `src/styles/stream.css`, make these exact replacements (each is a `color:` declaration):

| Selector(s) | Find | Replace with |
|---|---|---|
| `.j-section-sub` (line ~484) | `color: #444;` | `color: #777;` |
| `.bd-close` (line ~849) | `color: #444;` | `color: #777;` |
| `.bd-arcana` (line ~880) | `color: #444;` | `color: #777;` |
| `.bd-memory-when` (line ~983) | `color: #444;` | `color: #777;` |
| `.bond-arcana-label` (line ~777) | `color: #555;` | `color: #777;` |
| `.bd-rank-date` (line ~950) | `color: #555;` | `color: #777;` |
| `.mail-sub` (line ~1008) | `color: #555;` | `color: #777;` |
| `.s-date-month` (line ~287) | `color: #666;` | `color: #888;` |
| `.bond-affinity` (line ~787) | `color: #666;` | `color: #888;` |
| `.bd-affinity` (line ~893) | `color: #666;` | `color: #888;` |
| `.bd-section-label` (line ~962) | `color: rgba(255, 229, 44, 0.35);` | `color: rgba(255, 229, 44, 0.6);` |

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```
Expected: `build complete` with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/stream.css
git commit -m "fix(stream): lift low-contrast text colors for legibility

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: index.astro — frontmatter data

**Files:**
- Modify: `src/pages/index.astro` (frontmatter only, lines 1–95)

- [ ] **Step 1: Add stream imports to the existing import block**

In the `---` frontmatter block, after the existing imports (around line 7), add:

```ts
import { tallyStats, buildRadarPoints, STAT_ORDER } from '../utils/stream';
```

- [ ] **Step 2: Add stream data computation**

After the existing `novelLastModifiedISO` line (~line 85), before the closing `---`, add:

```ts
// Stream tile data
const streamSessions = await getCollection('stream', ({ data }) => !data.draft);
const streamTallies = tallyStats(streamSessions, 'all');
const streamMaxVal = Math.max(1, ...Object.values(streamTallies).map(v => v ?? 0));
const streamDataPoints = buildRadarPoints(streamTallies, streamMaxVal, 50, 50, 42);
const streamSessionCount = streamSessions.length;

const leadingStat = STAT_ORDER.reduce((best, s) =>
  (streamTallies[s] ?? 0) > (streamTallies[best] ?? 0) ? s : best,
  STAT_ORDER[0]
);

const STAT_COLORS = {
  Determination: { hex: '#ff4040', rgb: '255,64,64'   },
  Insight:       { hex: '#4ab0ff', rgb: '74,176,255'  },
  Chaos:         { hex: '#2dd4bf', rgb: '45,212,191'  },
  Sincerity:     { hex: '#ffe52c', rgb: '255,229,44'  },
  Expression:    { hex: '#a855f7', rgb: '168,85,247'  },
} as const;
const leadingColor = STAT_COLORS[leadingStat];

// Vertex data: geometry + per-stat count, used in SVG template
const STAT_VERTICES = [
  { stat: 'Determination', abbrev: 'DET', cx: 50,    cy: 8,    lx: 50,  ly: -4,  countY: 4,   anchor: 'middle', color: '#ff4040' },
  { stat: 'Insight',       abbrev: 'INS', cx: 89.95, cy: 37.0, lx: 107, ly: 34,  countY: 41,  anchor: 'start',  color: '#4ab0ff' },
  { stat: 'Chaos',         abbrev: 'CHA', cx: 74.69, cy: 84.0, lx: 85,  ly: 97,  countY: 104, anchor: 'middle', color: '#2dd4bf' },
  { stat: 'Sincerity',     abbrev: 'SIN', cx: 25.31, cy: 84.0, lx: 15,  ly: 97,  countY: 104, anchor: 'middle', color: '#ffe52c' },
  { stat: 'Expression',    abbrev: 'EXP', cx: 10.05, cy: 37.0, lx: -7,  ly: 34,  countY: 41,  anchor: 'end',    color: '#a855f7' },
] as const;
```

- [ ] **Step 3: Verify TypeScript**

```bash
npm run build 2>&1 | tail -20
```
Expected: clean build (stream data is appended but not yet in HTML).

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): compute stream radar data at build time

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: index.astro — stream tile HTML

**Files:**
- Modify: `src/pages/index.astro` (HTML section, ~lines 187–210)

- [ ] **Step 1: Replace the old stream tile block**

Find and remove this entire block (lines ~187–210):

```html
      <a
        id="stream-tile"
        href="/stream"
        class="bento-tile bento-tile--full bento-tile--small bento-tile--dark bento-tile--interactive bento-tile--span-1x2 stream-tile"
      >
        <div class="stream-tile__body">
          <div class="stream-tile__text">
            <div class="stream-tile__name">NINJARUSS_</div>
            <div class="stream-tile__desc">twitch · session log</div>
          </div>
          <div
            id="stream-watch-btn"
            class="stream-watch-btn"
            role="link"
            tabindex="-1"
            aria-label="Watch live on Twitch"
            data-href="https://twitch.tv/ninjaruss_"
            hidden
          >
            <span class="stream-watch-btn__dot"></span>
            Watch<br />Live
          </div>
        </div>
      </a>
```

Replace with:

```astro
      <a
        id="stream-tile"
        href="/stream"
        class="bento-tile bento-tile--dark bento-tile--interactive bento-tile--span-1x2 stream-tile"
        style={`--st-accent: ${leadingColor.hex}; --st-accent-rgb: ${leadingColor.rgb};`}
      >
        <div class="st-header">
          <div class="st-label">Stream Log</div>
          <div class="st-title">Ninjaruss</div>
          <div class="st-sub">{streamSessionCount} session{streamSessionCount !== 1 ? 's' : ''} logged</div>
          {streamSessionCount > 0 && (
            <div class="st-top-stat">
              <div class="st-top-stat-tri"></div>
              <div class="st-top-stat-name">{leadingStat}</div>
            </div>
          )}
        </div>

        <div class="st-radar-wrap">
          <svg viewBox="-30 -16 160 128" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <!-- ghost R=50 -->
            <polygon fill="none" stroke="rgba(255,229,44,0.07)" stroke-width="1"
              points="50,0 97.56,34.6 79.39,90.5 20.61,90.5 2.44,34.6"/>
            <!-- guide rings 25/50/75% of R=42 -->
            <polygon fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.8"
              points="50,39.5 59.99,46.8 56.17,58.5 43.83,58.5 40.01,46.8"/>
            <polygon fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"
              points="50,29 69.97,43.5 62.34,67.0 37.66,67.0 30.03,43.5"/>
            <polygon fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"
              points="50,18.5 79.96,40.3 68.52,75.5 31.48,75.5 20.04,40.3"/>
            <!-- outer pentagon R=42 -->
            <polygon fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="0.8"
              points="50,8 89.95,37.0 74.69,84.0 25.31,84.0 10.05,37.0"/>
            <!-- axes -->
            {STAT_VERTICES.map(v => (
              <line x1="50" y1="50" x2={v.cx} y2={v.cy}
                stroke="rgba(255,255,255,0.07)" stroke-width="0.8"/>
            ))}
            <!-- pentagram star diagonals V0→V2→V4→V1→V3 -->
            <polygon fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"
              stroke-dasharray="3 3"
              points="50,8 74.69,84.0 10.05,37.0 89.95,37.0 25.31,84.0"/>
            <!-- data polygon -->
            <polygon class="st-data-poly" fill="rgba(255,229,44,0.12)"
              stroke="#ffe52c" stroke-width="2" points={streamDataPoints}/>
            <!-- vertex dots -->
            {STAT_VERTICES.map(v => {
              const count = streamTallies[v.stat as keyof typeof streamTallies] ?? 0;
              const active = count > 0;
              return (
                <circle
                  cx={v.cx} cy={v.cy}
                  r={active ? 3.5 : 2.5}
                  fill={v.color}
                  opacity={active ? 1 : 0.22}
                  class={active ? 'st-active-dot' : undefined}
                />
              );
            })}
            <!-- stat labels + counts -->
            {STAT_VERTICES.map(v => {
              const count = streamTallies[v.stat as keyof typeof streamTallies] ?? 0;
              const active = count > 0;
              return (
                <>
                  <text
                    x={v.lx} y={v.ly}
                    text-anchor={v.anchor}
                    fill={v.color}
                    font-size="7.5"
                    font-family="monospace"
                    font-weight={active ? '700' : '400'}
                    opacity={active ? 0.9 : 0.55}
                  >{v.abbrev}</text>
                  <text
                    x={v.lx} y={v.countY}
                    text-anchor={v.anchor}
                    fill={v.color}
                    font-size="6"
                    font-family="monospace"
                    opacity={active ? 0.7 : 0.45}
                  >×{count}</text>
                </>
              );
            })}
          </svg>
        </div>

        <div class="st-footer">
          <div class="st-footer-icon" aria-hidden="true">→</div>
          <div class="st-footer-label">View Log</div>
          <span id="st-live-badge" class="st-live-badge" hidden>LIVE</span>
        </div>
      </a>
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -20
```
Expected: clean build (tile will look unstyled until CSS is added in Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): stream tile HTML — pentagram radar chart

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: index.astro — stream tile CSS

**Files:**
- Modify: `src/pages/index.astro` (`<style>` block)

- [ ] **Step 1: Remove old stream tile CSS**

Find and delete the following entire CSS blocks inside `<style>` (lines ~764–878):

- `.stream-tile { ... }` and `.stream-tile:not(.is-live):hover { ... }`
- `.stream-tile.is-live { ... }`
- `@keyframes stream-tile-pulse { ... }`
- `.stream-tile__body { ... }`
- `.stream-tile__text { ... }`
- `.stream-tile__name { ... }` and `.stream-tile.is-live .stream-tile__name { ... }`
- `.stream-tile__desc { ... }` and `.stream-tile.is-live .stream-tile__desc { ... }`
- `.stream-watch-btn { ... }` and `.stream-watch-btn[hidden] { ... }`
- `@keyframes stream-btn-breathe { ... }`
- `.stream-watch-btn__dot { ... }`
- `@keyframes stream-dot-flash { ... }`

Also remove these lines from the `@media (prefers-reduced-motion: reduce)` block (~line 1115):
```css
    .stream-tile.is-live         { animation: none; }
    .stream-watch-btn             { animation: none; }
    .stream-watch-btn__dot        { animation: none; }
```

- [ ] **Step 2: Add new stream tile CSS**

In place of the removed block (still inside `<style>`, around the `/* ─── Stream Tile ─────────── */` comment), add:

```css
  /* ─── Stream Tile ────────────────────────────────────── */
  .stream-tile {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .stream-tile:not(.is-live):hover {
    border-color: var(--color-gold);
    box-shadow: var(--shadow-hard);
  }

  .stream-tile.is-live {
    border-color: #ff4040;
    background: #181212;
    box-shadow: 4px 4px 0 rgba(255,64,64,.35), 0 0 28px rgba(255,64,64,.12);
    animation: stream-tile-pulse 2.5s ease-in-out infinite;
  }

  @keyframes stream-tile-pulse {
    0%, 100% { box-shadow: 4px 4px 0 rgba(255,64,64,.35), 0 0 24px rgba(255,64,64,.12); }
    50%       { box-shadow: 4px 4px 0 rgba(255,64,64,.5),  0 0 40px rgba(255,64,64,.22); }
  }

  /* Header */
  .st-header {
    padding: 14px 14px 12px 12px;
    border-bottom: 1px solid #1a1a1e;
    border-left: 2px solid var(--st-accent, #777);
    background: linear-gradient(135deg, rgba(var(--st-accent-rgb, '119,119,119'), .06) 0%, transparent 55%);
    flex-shrink: 0;
  }

  .st-label {
    font-size: .58rem;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: rgba(255,229,44,.45);
    margin-bottom: 4px;
  }

  .st-title {
    font-size: 1rem;
    font-weight: 800;
    font-family: system-ui, sans-serif;
    color: #f0f0f0;
    line-height: 1.1;
  }

  .st-sub {
    font-size: .58rem;
    color: #777;
    letter-spacing: .1em;
    margin-top: 3px;
  }

  .st-top-stat {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
  }

  .st-top-stat-tri {
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 6px solid var(--st-accent, #777);
    opacity: .7;
    flex-shrink: 0;
    margin-bottom: 1px;
  }

  .st-top-stat-name {
    font-size: .56rem;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--st-accent, #777);
    opacity: .65;
  }

  /* Radar */
  .st-radar-wrap {
    flex: none;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
  }

  .st-radar-wrap::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px, transparent 3px,
      rgba(0,0,0,.15) 3px, rgba(0,0,0,.15) 4px
    );
    pointer-events: none;
  }

  .st-radar-wrap svg {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Footer */
  .st-footer {
    padding: 10px 16px;
    border-top: 1px solid #1a1a1e;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .st-footer-icon {
    font-size: .6rem;
    color: rgba(255,229,44,.25);
  }

  .st-footer-label {
    font-size: .55rem;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: #777;
  }

  .st-live-badge {
    margin-left: auto;
    font-size: .5rem;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: #ff4040;
    border: 1px solid rgba(255,64,64,.4);
    border-radius: 3px;
    padding: 2px 5px;
    animation: st-badge-breathe 1.5s ease-in-out infinite;
  }

  .st-live-badge[hidden] { display: none; }

  @keyframes st-badge-breathe {
    0%, 100% { opacity: 1; }
    50%       { opacity: .45; }
  }
```

- [ ] **Step 3: Add animations inside the reduced-motion media query**

Animations must be conditionally applied. Wrap the two SVG animation keyframes and their selectors inside the appropriate guard. Add to the existing `@media (prefers-reduced-motion: no-preference)` block (or create one if absent):

```css
  @media (prefers-reduced-motion: no-preference) {
    .st-data-poly {
      animation: st-data-breathe 3s ease-in-out infinite;
    }

    .st-active-dot {
      animation: st-dot-pulse 3s ease-in-out infinite;
    }

    @keyframes st-data-breathe {
      0%, 100% { opacity: 1;   filter: drop-shadow(0 0 4px rgba(255,229,44,.4)); }
      50%       { opacity: .78; filter: drop-shadow(0 0 11px rgba(255,229,44,.7)); }
    }

    @keyframes st-dot-pulse {
      0%, 100% { r: 3.5px; }
      50%       { r: 5px; }
    }
  }
```

Also add these lines to the existing `@media (prefers-reduced-motion: reduce)` block:
```css
    .stream-tile.is-live  { animation: none; }
    .st-live-badge        { animation: none; }
```

- [ ] **Step 4: Verify dev server**

```bash
npm run dev
```

Open `http://localhost:4321`. The stream tile should show the pentagram radar with header, labels, and footer. Check:
- Header has red left-border accent (if DET or EXP is leading stat)
- Leading stat name appears with triangle
- SVG fills tile width with no excessive vertical gap
- Footer shows "→ View Log" (no Live badge yet)

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): stream tile CSS and animations

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: index.astro — YouTube channel tile

**Files:**
- Modify: `src/pages/index.astro` (HTML + CSS)

- [ ] **Step 1: Replace the YouTube tile HTML**

Find and replace this block (~lines 110–124):

```html
      <div class="image-tile image-tile--twitch p3r-animate" style="--stagger-delay: 100ms;">
        <a href="https://www.twitch.tv/ninjaruss_" target="_blank" rel="noopener noreferrer" aria-label="Watch on Twitch">
          <img
            src="https://static-cdn.jtvnw.net/previews-ttv/live_user_ninjaruss_-440x248.jpg"
            alt="Twitch stream preview"
            class="image-tile__img"
            onerror="this.style.display='none'"
          />
          <div class="image-tile__twitch-overlay">
            <svg class="image-tile__twitch-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
            </svg>
          </div>
        </a>
      </div>
```

Replace with:

```html
      <a
        id="yt-tile"
        href="https://www.youtube.com/@Ninjaruss"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ninjaruss on YouTube"
        class="image-tile image-tile--youtube p3r-animate"
        style="--stagger-delay: 100ms;"
      >
        <!-- Default: YouTube channel -->
        <div class="yt-tile__content">
          <svg class="yt-tile__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
          </svg>
          <div class="yt-tile__label">Ninjaruss</div>
          <div class="yt-tile__sub">YouTube</div>
        </div>
        <!-- Live overlay: shown via .is-twitch-live class -->
        <div class="yt-tile__live-overlay" aria-hidden="true">
          <img
            class="yt-tile__preview"
            src="https://static-cdn.jtvnw.net/previews-ttv/live_user_ninjaruss_-440x248.jpg"
            alt="Live stream preview"
          />
          <div class="yt-tile__live-badge">LIVE</div>
        </div>
      </a>
```

- [ ] **Step 2: Replace the YouTube tile CSS**

In the `<style>` block, find and remove these blocks (lines ~880–958):

- `/* Image Tile */` section: `.image-tile { ... }` through `.image-tile:active { ... }`
- `.image-tile a { ... }`
- `.image-tile__img { ... }` and `.image-tile:hover .image-tile__img { ... }`
- `/* Twitch Overlay */` section through `.image-tile--twitch:hover .image-tile__twitch-icon { ... }`

Also remove from responsive blocks:
```css
    .image-tile {
      grid-column: span 2;
      min-height: 200px;
    }
    .image-tile__twitch-icon { ... }
```
(lines ~1131–1139 and ~1161–1164)

Add in their place (in the main `<style>` block, after the stream tile CSS):

```css
  /* ─── YouTube / Live Tile ────────────────────────────── */
  .image-tile--youtube {
    grid-column: span 1;
    grid-row: span 1;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: var(--border-thick) solid var(--color-border-strong);
    background: var(--color-bg-elevated);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition:
      transform var(--transition-fast),
      box-shadow var(--transition-fast),
      border-color var(--transition-fast);
    box-shadow: var(--shadow-hard);
  }

  .image-tile--youtube:hover {
    transform: translate(-4px, -4px);
    box-shadow: var(--shadow-hard-hover);
    border-color: #ff0000;
  }

  .image-tile--youtube:active {
    transform: translate(0, 0);
    box-shadow: var(--shadow-hard-sm);
  }

  /* Default: YouTube channel content */
  .yt-tile__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px;
    z-index: 1;
    transition: opacity var(--transition-base);
  }

  .image-tile--youtube.is-twitch-live .yt-tile__content {
    opacity: 0;
    pointer-events: none;
  }

  .yt-tile__icon {
    width: 36px;
    height: 36px;
    color: #ff0000;
    filter: drop-shadow(0 0 8px rgba(255,0,0,.4));
    transition: transform var(--transition-base), filter var(--transition-base);
  }

  .image-tile--youtube:hover .yt-tile__icon {
    transform: scale(1.15);
    filter: drop-shadow(0 0 14px rgba(255,0,0,.65));
  }

  .yt-tile__label {
    font-family: var(--font-display);
    font-size: .6rem;
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .yt-tile__sub {
    font-family: var(--font-mono);
    font-size: .5rem;
    color: #777;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  /* Live overlay — hidden until .is-twitch-live */
  .yt-tile__live-overlay {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-base);
  }

  .image-tile--youtube.is-twitch-live .yt-tile__live-overlay {
    opacity: 1;
    pointer-events: auto;
  }

  .yt-tile__preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .yt-tile__live-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: #ff4040;
    color: #fff;
    font-family: var(--font-mono);
    font-size: .5rem;
    font-weight: 700;
    letter-spacing: .14em;
    padding: 3px 7px;
    border-radius: 3px;
    animation: yt-live-pulse 1.5s ease-in-out infinite;
  }

  @keyframes yt-live-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: .5; }
  }
```

Add responsive overrides (inside the existing `@media (max-width: 768px)` block):
```css
    .image-tile--youtube {
      grid-column: span 2;
      min-height: 200px;
    }
```

And inside `@media (max-width: 480px)`:
```css
    .image-tile--youtube {
      grid-column: span 1;
    }
```

Add to `@media (prefers-reduced-motion: reduce)`:
```css
    .yt-tile__live-badge { animation: none; }
    .image-tile--youtube { transition: none; }
```

- [ ] **Step 3: Verify dev server**

```bash
npm run dev
```

Open `http://localhost:4321`. Check:
- YouTube tile shows red YouTube icon + "Ninjaruss" label + "YouTube" sub-label
- Hover shows red border + icon scale
- Live overlay is hidden (no Twitch live signal in dev)

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): YouTube channel tile with live swap

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: index.astro — update applyLiveState JS

**Files:**
- Modify: `src/pages/index.astro` (`<script>` block, ~lines 1180–1210)

- [ ] **Step 1: Replace the applyLiveState function**

Find and replace the `applyLiveState` function (~lines 1194–1203):

```ts
  function applyLiveState(isLive: boolean, twitchLive: boolean): void {
    const tile      = document.getElementById('stream-tile') as HTMLAnchorElement | null;
    const watchBtn  = document.getElementById('stream-watch-btn') as HTMLElement | null;
    const container = document.getElementById('page-container');
    if (!tile) return;
    tile.classList.toggle('is-live', isLive);
    container?.classList.toggle('is-live', isLive);
    // Watch Live button only appears when Twitch is live (primary stream platform)
    if (watchBtn) watchBtn.hidden = !twitchLive;
  }
```

Replace with:

```ts
  function applyLiveState(isLive: boolean, twitchLive: boolean): void {
    const streamTile = document.getElementById('stream-tile') as HTMLAnchorElement | null;
    const container  = document.getElementById('page-container');
    const liveBadge  = document.getElementById('st-live-badge') as HTMLElement | null;
    const ytTile     = document.getElementById('yt-tile') as HTMLAnchorElement | null;

    streamTile?.classList.toggle('is-live', isLive);
    container?.classList.toggle('is-live', isLive);

    if (liveBadge) liveBadge.hidden = !isLive;

    if (ytTile) {
      ytTile.classList.toggle('is-twitch-live', twitchLive);
      ytTile.href = twitchLive
        ? 'https://twitch.tv/ninjaruss_'
        : 'https://www.youtube.com/@Ninjaruss';
      ytTile.setAttribute('aria-label', twitchLive
        ? 'Watch Ninjaruss live on Twitch'
        : 'Ninjaruss on YouTube');
    }
  }
```

- [ ] **Step 2: Remove the initializeStreamWatchBtn function and its call**

Find and delete the entire `initializeStreamWatchBtn` function (~lines 1291–1306):

```ts
  let streamWatchBtnHandler: ((e: Event) => void) | null = null;

  function initializeStreamWatchBtn(): void {
    const btn = document.getElementById('stream-watch-btn');
    if (!btn) return;
    if (streamWatchBtnHandler) {
      btn.removeEventListener('click', streamWatchBtnHandler);
    }
    streamWatchBtnHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const href = (btn as HTMLElement).dataset.href ?? 'https://twitch.tv/ninjaruss_';
      window.open(href, '_blank', 'noopener,noreferrer');
    };
    btn.addEventListener('click', streamWatchBtnHandler);
  }
```

Also find and remove the call to `initializeStreamWatchBtn()` (anywhere it appears in the `document.addEventListener('astro:page-load', ...)` callback).

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -20
```
Expected: clean build with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(home): wire live state to YouTube tile and stream badge

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Final verification

- [ ] **Step 1: Full build check**

```bash
npm run build 2>&1 | grep -E "error|warning|✓"
```
Expected: `✓ build complete`, no errors.

- [ ] **Step 2: Dev server visual check**

```bash
npm run dev
```

Open `http://localhost:4321` and verify:
1. **Stream tile** — pentagram renders with correct colors, ×N counts visible, header accent matches leading stat, "View Log" footer text is legible (not near-invisible)
2. **YouTube tile** — shows red YouTube icon, "Ninjaruss" label, "YouTube" sub, correct link on hover
3. **Stream page** — open `/stream` and confirm the contrast-lifted text (bond arcana labels, date lines, section labels) are all readable against the dark background
4. **No regressions** — other tiles (Showcase, Notes, Media, Latest, Novel) render normally

- [ ] **Step 3: Simulate live state in browser console**

On `http://localhost:4321`, open DevTools console and run:

```js
// Simulate Twitch live
document.getElementById('yt-tile').classList.add('is-twitch-live');
document.getElementById('yt-tile').href = 'https://twitch.tv/ninjaruss_';
document.getElementById('stream-tile').classList.add('is-live');
document.getElementById('st-live-badge').hidden = false;
```

Verify:
- YouTube tile switches to Twitch preview image + LIVE badge
- Stream tile gets red border + pulse animation
- LIVE badge appears in stream tile footer
- Reset: `document.getElementById('yt-tile').classList.remove('is-twitch-live'); document.getElementById('stream-tile').classList.remove('is-live'); document.getElementById('st-live-badge').hidden = true;`

- [ ] **Step 4: Final commit**

If any small fixes were needed during visual check, stage and commit them:

```bash
git add src/pages/index.astro src/styles/stream.css
git commit -m "fix(home): visual adjustments from final verification

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
