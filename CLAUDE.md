# CLAUDE.md

This file provides guidance for Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

**ninjaruss.net** is a personal website built with Astro 5, featuring a Persona 4 Golden-inspired dark UI aesthetic. It's a static site for fragments, media, and experiments—organized around philosophical notes, media consumption logs, and inquiry-driven projects.

## Build & Development Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build static site to ./dist/
npm run preview   # Preview production build locally
npm run test      # Run vitest unit tests (13 files, 195 tests)
npm run astro     # Direct Astro CLI access

# Life snapshot tooling — see the Life section for the review contract.
npm run life:check  -- /path/to/public.json                  # validate, print SHA256
npm run life:import -- /path/to/public.json --approve <sha>  # write src/data/life.json
```

## Architecture

### Directory Structure

```
src/
├── components/       # Reusable Astro components
├── content/          # Content collections (Markdown/MDX)
│   ├── config.ts     # Zod schema definitions
│   ├── shelf/        # Anime, manga, films, series, characters, music, etc.
│   ├── notes/        # Philosophical fragments
│   ├── novel/        # "Remember Rain" novel (Scrivener export — Characters, Manuscript, Story Plan, World)
│   ├── now/          # "Now" page snapshots (current focus)
│   ├── profile/       # Single entry; only its links[] is still read (see Life)
│   └── showcase/     # Projects as inquiries
├── data/             # life.json — the reviewed public Life snapshot. EMPTY by
│                     #   default; written only by `npm run life:import`
├── layouts/          # Page layout templates
├── pages/            # File-based routing
├── scripts/          # Browser entry points (cursor, transition, life)
├── styles/           # Global CSS (no frameworks)
├── tests/            # Vitest unit tests (13 files, 195 tests — novel, content,
│                     #   notes, shelfWall, traces, lifeExport, lifeMap, ...)
└── utils/            # Shared utilities (content, collections, notes, dates,
                      #   novel, life*, traces*, splitView/)

packages/
└── life-ui/          # Content-free Life map renderer + artwork, vendored
                      #   verbatim by a separate private project (see Life)
scripts/               # Node tooling: life-import, add-image, OG/font builders
```

### Key Patterns

- **Content Collections**: All content uses Zod-validated schemas in `src/content/config.ts`
- **Split-View Layout**: List/detail pattern with client-side content fetching
- **Static Generation**: All routes pre-rendered at build time
- **Vanilla CSS**: Design system via CSS custom properties, no utility frameworks

## Content Collections Schema

All collections share a base schema (defined in `sharedSchema`):
- `title` (required string)
- `collections` (string array for cross-referencing, defaults to [])
- `publishedAt` (optional date)
- `updatedAt` (optional date)
- `draft` (boolean, defaults to false, filters from production)
- `emblem` (optional string, path to page-specific emblem image)
- `description` (optional string, used for meta/OG description)
- `image` (optional string, path to social share image)

Collection-specific extensions:
- **shelf**: adds `content_type: 'anime' | 'manga' | 'film' | 'series' | 'music' | 'book' | 'game' | 'character' | 'other'`, `isFavorite: boolean` (defaults to false), and `tags` (string array, defaults to []) — shelf is the only collection with tags
- **notes**: uses sharedSchema without extensions (no tags; relatedness via `collections`), plus an optional `substackUrl` (`z.string().url().optional()` — optional only so a half-written entry doesn't fail the build). Historically the slug→Substack redirect map; `substackUrl` is now **provenance only** and controls no navigation, rendering or feed. `jp-journal` is rendered at `/japanese-journal` (see the Writing section below — there is no longer a Substack section)
- **showcase**: uses sharedSchema without extensions
- **now**: simplified schema with `title` (defaults to 'Now'), `publishedAt` (required), `updatedAt`, `draft`
- **profile**: single entry backing `/about` — `hook` (required), `credentials[]`, `makes[]` (`{label, blurb, href}`), `makesMore` (`{text, href}`), `subjects[]` (`{group, items[]}`), `connect`, `links[]` (`{label, href, primary}`). Every string is `.min(1)` — a blank field is a build error, not a silently empty card. Schema is defined in `src/utils/profile.ts` and imported into `config.ts` (not inline) so it stays unit-testable. Body markdown was the ABOUT prose. Deliberately has **no** `draft` field: it's a singleton the author edits directly. **Mostly unused as of 2026-11-13**: `/life` reads only `links[]` (filtered to drop the YouTube and Writing labels). Every other field is still Zod-validated on each build and rendered nowhere — see the Life section

## Layouts

| Layout | Purpose |
|--------|---------|
| `BaseLayout.astro` | Foundation wrapper with meta, styles, view transitions |
| `SplitViewLayout.astro` | Three-panel list/detail/emblem interface with client-side navigation and emblem card sidebar. Optional `kicker` prop; renders the unified P4G section header (`p4g-tab` + `p4g-heading` + `p4g-underline`; the page title is the `<h1>` and the entry title in the detail panel is the `<h2>` beneath it, on the list route and the standalone detail routes alike) — the same header pattern is replicated on the Now, Now-archive, and Novel pages; optional `showSearch` prop (default `true`) gates the whole `.split-view__filter` block (search input + segmented type control) — `/showcase` renders it `false` and is bare: no search, no type pills, no draw deck, no RSS icon. (`placeholderStats` and `showDraw` — the build-time stats `<dl>` and the draw-a-card deck/mobile DRAW button — were removed with `/journal` in the September Substack migration, which the Writing section has since superseded) |

## Component Inventory

### Structural
- `BentoGrid.astro` — A bare `<div class="bento-grid">` with a slot and an optional extra `class`. On the homepage it is used only as that slot wrapper; `#personal-hub .grid` overrides its grid entirely (see the Homepage section).
- `TracesBar.astro` — The homepage guestbook ticker; see the Traces section.
- `NavPill.astro` — Fixed bottom-left P4G angled nav bar (`.nav-bar`, corner-cut clip-path, hard gold shadow via `drop-shadow` wrapper). **CORRECTION (2026-11-13 audit): four items, not eight.** The menu is Home / About (`/life`) / Now / Shelf, each with a solid-gold active-page highlight (`.nav-bar__item--active` + `aria-current="page"`, via a shared `startsWith` match on the item's `match` array). The previous entry listed Home/Showcase/Visual Novel/Shelf/About/Now/Traces/Writing and an off-site Substack item; none of that is in the component. Writing, Projects, Remember Rain, Traces and Japanese journal are reachable from the homepage header, the homepage cards and the homepage footer site map instead, which is why they are not menu items — the deliberate trade is a menu you can read at a glance against one more hop from a deep page. A **second** table in the component maps those off-menu destinations to labels (`/notes` → "Writing", `/showcase` → "Projects", `/novel` → "Remember Rain", `/traces` → "Guestbook", `/japanese-journal` → "Japanese journal", else "Explore") for one purpose only: naming the visitor's current location in the collapsed mobile `<summary>`. It sets no `aria-current` and adds no link. Optional `backLink`/`backLabel` props append a back link. Hidden on the homepage; rendered on `/life` and every other non-home page. **Labels match what each destination calls itself** — the rule that retired "VN" for "Remember Rain", a string that actually appears on the page it points to. Both a `.nav-bar__desktop` strip and a `.nav-bar__mobile` `<details>` disclosure are rendered server-side and swapped by CSS at **1200px** (not 1024px): below it the bar goes full-width and the disclosure's `<summary>` shows the current-location label beside "Menu ☰", opening a 2-column grid of 48px targets above itself (`max-height: 65dvh`, scrollable), with the back link spanning both columns. `initNavigation()` publishes the nav's measured height +16px as `--nav-clearance` on `<html>` via a `ResizeObserver`, consumed by page bottom paddings (`life.css`, `novel.css`, `ReadingLayout`, `SplitViewLayout`, `traces.astro`, `404.astro`) so the bar never covers content — each with its own fallback default, so a script failure doesn't collapse the padding.

### Homepage — `#personal-hub`

**CORRECTION (2026-11-13 audit): the bento-tile homepage is gone.** Everything
this section used to describe — the `.journal-tile` with its diagonal seam, the
`.latest-tile` cycle, `#stream-tile`, the `.novel-tile` rain gauge,
`.logo-tile`s for MAL/Spotify/mail, `initializeTilt()`,
`initializeNovelRain()`, `initializeMailTile()`,
`initializeJournalTileNav()`, `.hero-band`, the span classes and the ~17
infinite-animation "motion budget" — was deleted when the homepage was
rewritten from scratch. Verified by grepping `src/` and `scripts/`: not one of
those classes or functions exists any more. Four recent passes over the
replacement are recorded in `docs/audits/2026-11-12-homepage-card-balance.md`,
and the navigation pass landed as commit `030d78c`.

`src/pages/index.astro` now renders one page-sized component: a `#personal-hub`
wrapper holding, in order, `.intro-row`, the card `.grid`, `.guestbook-row`
(just `<TracesBar />`), and `.footer`. No `BentoTile`, no tile variants, no
kickers, no corner triangles. It is ~720 lines, most of it CSS.

**Where the CSS lives, and why it is `is:global`.** Almost all of the
homepage's CSS is a single `<style is:global>` block inside `index.astro`, with
every rule prefixed `#personal-hub`. `TracesBar.astro` does the same thing for
its own markup. That is deliberate, not laziness: Astro's scoped CSS only tags
elements present in that component's own server-rendered template, so a scoped
rule could never reach `.grid` (the root of the `<BentoGrid>` component),
`.traces` (the root of `<TracesBar>`), or the trace rows TracesBar builds with
`document.createElement`. The old file solved this by sprinkling `:global(...)`
per selector; this one takes the whole block global and uses the `#personal-hub`
id as the scope instead. **Consequence worth knowing:** TracesBar's styles are
written as `#personal-hub .traces…`, so the component renders unstyled anywhere
except the homepage.

**Local token aliases.** `#personal-hub` opens by remapping the site tokens onto
short local names — `--gold`, `--bg`, `--surface`, `--ink`, `--text`, `--muted`,
`--line` onto `--color-gold`, `--color-bg-deep`, `--color-bg-elevated`,
`--color-black`, `--color-text`, `--color-text-muted`,
`--color-border-strong` — and sets `color-scheme: dark`, a dotted
`radial-gradient` ground, and `font: 16px/1.6 var(--font-body)`. The hub's own
rules then use the short names. This is an alias layer over the design system,
not a second palette: the Code Style rule still holds, and a new colour belongs
in `global.css` and then in this map. A handful of one-off hexes do sit inline
(`#958721` writing hairlines, `#111719`/`#1d2625` novel ground, `#57605a` rain,
`#b3a249` poster frames, `#191919` traces strip) — they are card-local
atmosphere, not tokens, and shouldn't be copied outward.

**`.intro-row`** — `minmax(0, 2fr)` / `minmax(300px, 1fr)`, stacking to one
column at ≤700px.
- `.header` is the gold-bordered identity card: the page's `<h1>` (NINJARUSS),
  `.motto`, `.intro` prose capped at `65ch`, and an `.about-links` nav to
  `/life` and `/life#contact`. The contact link's address is assembled
  client-side by `setupContact()` on first pointerenter/focus/touchstart (the
  same bot-scrape mitigation the old mail tile used, re-armed on
  `astro:page-load`); `mailbox@ninjaruss.net` is never in the served HTML. Note
  the About destination is **`/life`**, not `/about` — `/about` is a 301 to it.
- `.now` is a whole-card `<a href="/now">`: chip, the latest `now` entry's
  title, its date, a one-sentence excerpt, and a `.now-read` call to action
  pinned to the bottom with `margin-top: auto`. The excerpt is computed at
  build from the entry's **own first real paragraph** (first block that is
  neither blank nor starting `#`/`<`, run through `stripMarkdown`, then cut at
  the first sentence end) rather than a `description` field — the point is not
  to add a second summary that has to be kept in sync with the update itself.

**`.grid` — six cards, one 5/7 seam.** `<BentoGrid class="grid">` emits
`class="bento-grid grid"`, and `#personal-hub .grid` re-declares
`grid-template-columns: repeat(12, minmax(0, 1fr))`. The id selector outranks
`bento.css`'s own 6-column `.bento-grid` rule, so BentoGrid is being used here
as a plain slot wrapper, not for its grid.

| Row | Left (`span 5`) | Right (`span 7`) |
|-----|-----------------|------------------|
| 1 | `.writing` → `/notes` | `.video` → YouTube |
| 2 | `.projects` → `/showcase` | `.novel` → `/novel` |
| 3 | `.japanese-journal` → `/japanese-journal` | `.shelf` → `/shelf` |

All three rows share the **same** 5/7 split on purpose. The rows previously
split 5/7, 6/6 and 8/4, which put the vertical seam at a different x on every
row; Japanese journal moved left and Shelf moved right to line them up. At
701–1023px every child goes `span 6` (one blanket rule, `#personal-hub .grid >
*`); at ≤700px the grid collapses to one column and `grid-column: auto`.

**One destination per card, and the whole card goes there.** Half the cards used
to be whole-card links and half were `<section>`s where only the heading was
clickable — yet every card carried the same hover lift, so the page promised a
click target it did not always honour. Now `.now`, `.japanese-journal` and
`.shelf` are `<a>` roots outright, and `.writing`, `.video`, `.projects` and
`.novel` are `<section aria-labelledby>` whose heading link carries
`.tile-link`, which stretches over the card via `::after { inset: 0; z-index: 1
}`. Inner links that must keep their own destinations — `.post` rows,
`.project` rows, `.video-actions` — are raised above it by one `:is()` rule at
`z-index: 2`. Heading arrows sit **beside** their titles (they used to be
`space-between`-pushed up to 440px away, so title and arrow read as unrelated
elements).

Two traps this creates, both already paid for once:
- `.novel`'s children get `position: relative` so they paint above
  `.rain-field`, but **deliberately no `z-index`** — being positioned and later
  in the DOM is enough, and leaving them at `auto` lets the stretched link
  (z-index 1) sit on top of `.premise` instead of under it. Adding a `z-index`
  there traps the overlay.
- `.projects .tile-intro` and the novel's children previously carried
  `z-index`/`position` rules that covered or trapped the overlay; they were
  removed, not worked around.

**Off-site links are marked.** Every outbound link pairs a `↗` glyph with an
`.offsite` span ("on YouTube", "external link") that is visually hidden by the
usual clip-path recipe — the glyph says it to sighted readers, the span says it
to screen readers. Off-site and on-site destinations were previously
indistinguishable.

**`.writing` is the one gold card.** Gold ground, `--ink` text, and every
gold-on-gold treatment inverts for it: focus outline, hover border, and the
corner notch all flip to `--ink` (a gold panel is invisible on gold — the same
inversion the old mail tile needed). It also sets `container-type: inline-size`
and a `@container (min-width: 420px)` query so post dates sit beside titles when
the card is wide enough and below them when it is not — a container query, not a
viewport one, because the card's width does not track the viewport's across the
three breakpoints.

**Hover/focus signature.** One rule for everything: `:is(.tile, .traces)` on
hover or `:is(:focus-visible, :has(:focus-visible))` lifts
`translateY(-3px)`, takes a gold border and steps the shadow to
`--shadow-hard-hover`, and the 16px bottom-right notch (`.tile:after`, a
`clip-path` triangle painted in the page background) flips to gold. Hover is
gated behind `(hover: hover) and (pointer: fine)`; `prefers-reduced-motion`
drops the transition and the transform. This replaces the old
`.bento-tile__corner` triangle as the site's tile hover language — the notch
cuts *out* of the corner rather than sliding *into* it, but it is the same
angular P4G move.

**No ambient motion, and no tilt.** `.rain-field` is six static `<i>` hairlines
at hand-placed percentages — no JS, no keyframes. The only looping animation
anywhere on the page is the Traces ticker, which pauses on hover and focus.
There is no mouse-tilt: `initializeTilt()` no longer exists (`cursor.ts` only
mentions it in a comment about the bug class it used to have). The hub also
forces the native pointer back on — `html.has-custom-cursor:has(#personal-hub)`
sets `cursor: auto !important` and hides `#cursor` — so the custom cursor dot is
a rest-of-site treatment only.

**`.footer` is a site map.** The page used to end in two outbound links and no
way back in. It now has a `.footer-site` nav listing every on-site destination
(Writing, Projects, Remember Rain, Shelf, Japanese journal, Now, Traces, About,
Contact) and a separate `.footer-elsewhere` nav for YouTube, Twitch,
MyAnimeList and Spotify, each marked `.offsite`.

**Dead code the rewrite left behind — cleared 2026-11-13.** For the record, so
nobody goes looking for these:
- `src/components/BentoTile.astro` — **deleted.** It was imported by nothing.
- `src/styles/bento.css` — cut from 491 lines to just the `.bento-grid`
  primitive. The whole `.bento-tile*` variant/span/kicker/corner family,
  `.logo-tile`, `.latest-tile`, `.title-tile`, `.image-tile` and the
  neighbour-dimming `:is()` pair are gone. The dimming rule had been dead on
  its own terms anyway: its selectors included `.traces-bar` while TracesBar
  renders `.traces`.
- `cursor.ts`'s `TILE_SELECTOR` — the leftover `.traces-bar` (never matched)
  and `.traces-bullet` (always on an `<a href>`, so already covered) hooks were
  dropped; it is now `'a[href], button, [role="button"]'`.
- `src/pages/api/live-status.ts`, `src/pages/api/twitch-live.ts` and their
  `liveStatus.ts` / `twitchStatus.ts` / `twitchToken.ts` utilities — **deleted**
  with `liveStatus.test.ts` and the `parseTwitchLiveResponse` block in
  `sessions.test.ts`. They were a complete, working YouTube/Twitch polling
  chain whose only consumer was the deleted `#stream-tile`. Restoring a live
  badge means rewriting the polling and re-adding `TWITCH_CLIENT_ID`,
  `TWITCH_CLIENT_SECRET`, `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID`.
`src/pages/api/` now holds only the two Traces endpoints.

### List/Detail
- `ListItem.astro` — Left panel items in SplitViewLayout
- `EntryHeader.astro` — Entry title, dates, emblem trigger (`data-page-emblem` attr signals SplitView to flip card); no tag row (notes/showcase have no tags)
- `EntryBody.astro` — Wraps entry prose in `.entry__content.prose`; renders nothing if `hasContent` is false

### Content
- `TagList.astro` — Tag pills display (shelf detail pages only — shelf is the only tagged collection)
- `DateDisplay.astro` — Published/updated date display with optional size variants
- `EmblemCard.astro` — 3D flippable card component with mouse-tracking tilt effect (Yu-Gi-Oh card backing style, aspect ratio 63:88)
- `MediaLightbox.astro` — Fullscreen media popup
- `RelatedContent.astro` — Cross-referenced entries via collections field, relevance-scored card grid (max 6 items)

## Design System

### CSS Files
- `global.css` — Design tokens, colors, spacing, shadows
- `typography.css` — Fonts (**Archivo Black, Syne, JetBrains Mono** — not Inter; see below), type scale, metric-matched fallback `@font-face`s
- `fonts.css` — **GENERATED** by `node scripts/build-fonts.mjs`; do not hand-edit. Self-hosted `@font-face` rules for Archivo Black, Syne and JetBrains Mono (latin + latin-ext only — the site has no Cyrillic/Greek/Vietnamese text, and none of these families covers CJK, so Japanese has always fallen through to the system stack). The woff2 files are byte-for-byte the ones Google serves, moved to `public/fonts/`: a delivery change, not a type change. It replaced a render-blocking `<link>` to fonts.googleapis.com that pointed at a *second* third-party origin, so no woff2 URL was discoverable until that stylesheet returned. `BaseLayout` now preloads only Syne 400 and Archivo Black latin; `unicode-range` and weight matching keep the rest unfetched unless rendered.
- `bento.css` — Just the `.bento-grid` primitive behind `BentoGrid.astro` (23 lines; the dead tile families were removed 2026-11-13). The homepage's CSS is **not** here — it lives in `index.astro`'s own `<style is:global>` block, and `#personal-hub .grid` overrides every property in this file
- `transitions.css` — P4G-style animations and view transitions
- `novel.css` — Novel writer's-desk UI (gold/black/brown; desk landing, folder pages, paper/ink reading pages, sepia rain canvas)
- `life.css` — The `/life` page (`.life__*`). Imported directly by `life/index.astro` and `life/[id].astro`, not by `BaseLayout`

### Key CSS Variables
```css
/* Colors */
--color-gold: #ffe52c;           /* Primary accent (P4G yellow) */
--color-bg-base: #111111;        /* Main background */
--color-text: #f5f5f5;           /* Primary text */
--color-live: #ff4040;           /* Live/stream red (badges, borders) */
--color-live-rgb: 255, 64, 64;   /* For rgba() alpha variants */
--color-gold-rgb: 255, 229, 44;  /* For rgba() alpha variants */

/* Near-black surface scale, darkest first (dividers, panel fills, borders) */
--color-surface-1: #141416;
--color-surface-2: #1a1a1a;
--color-surface-3: #2a2a2a;

/* Two-tier heading scale — a surface picks one, nothing in between */
--text-page-title: clamp(2.5rem, 6vw, 3.5rem);  /* the h1 naming the surface */
--text-panel-title: 1.5rem;                     /* a heading inside a panel */

/* Radii — deliberately angular (P4G cuts corners, doesn't round them) */
--radius-xs: 2px;
--radius-sm: 3px;
--radius-md: 4px;
--radius-lg: 6px;

/* Shadows (gold glow effect) */
--shadow-hard: 4px 4px 0 rgba(255, 229, 44, 0.3);
--shadow-glow: 0 0 20px rgba(255, 229, 44, 0.15);

/* Animation */
--animation-easing: cubic-bezier(0.16, 1, 0.3, 1);

/* Micro-caps tracking — two steps only, nothing in between */
--tracking-label: 0.05em;   /* ordinary micro-caps */
--tracking-wide:  0.12em;   /* CTAs, status badges, the hero tagline */
--animation-base: 400ms;
```

### P4G Vocabulary Utilities (global.css)
Reusable menu-screen moves — prefer these over bespoke CSS for new surfaces:
- `.p4g-heading` — slanted uppercase display type (`--skew-display`)
- `.p4g-tab` — angled black-on-gold kicker label bar
- `.p4g-underline` — skewed gold underline, sweeps in on entrance
- `.p4g-sweep` — diagonal gold fill on hover/focus (children auto-lifted above panel)
- `.p4g-cut` — parallelogram silhouette via clip-path
- Tokens: `--skew-display: -6deg`, `--skew-accent: -12deg`, `--skew-rule: -30deg`, `--cut-sm: 6px`, `--cut-md: 12px`
- Caveat: `clip-path` clips `box-shadow` — cut elements needing the hard gold shadow use `filter: drop-shadow()` on a wrapper
- Convention: every `:hover` treatment gets `:focus-visible` parity (comma-paired selectors)
- Diagonal-language rule: full slash/seam treatments are reserved for tiles with two real content zones (Journal, Latest, Shelf collage). Single-zone tiles carry the motif only via the corner-cut hover triangle — don't add decorative slashes.

### Animation Classes
- `.p3r-animate` — Standard entrance (translateY + fade)
- `.p3r-animate-left` — Left entrance
- Use `--stagger-delay` for sequencing
- (`p3r-entrance-scale` is used directly by `.bento-grid` children. The `.entry-grid` rules that paired with it were dead — no template ever emitted that class — and were removed in the 2026-09 audit.)

## Responsive Breakpoints

- `480px` — Mobile
- `768px` — Tablet
- `900px` — SplitView collapse point
- `1024px` — Small desktop
- `1200px` — Desktop

## Pages & Routes

### Content Collection Pages
- `/showcase` — `SplitViewLayout`, `section="showcase"`, showcase entries only, sorted by `updatedAt`/`publishedAt` descending. **Bare** (`showSearch={false}`): no search, no type control, no draw deck, no RSS icon — `populateTypes` already hides the type control when fewer than two types are present, so nothing extra was needed there for the single-type list. Removing the draw deck means `/showcase` now **auto-opens its newest entry on desktop** on load — the deck was the only thing that used to suppress SplitViewLayout's ordinary auto-open behavior (see Important Implementation Detail 1). Dissolved from the old `/journal`, which merged notes + showcases into one date-sorted list; notes moved to Substack at the time (and have since been restored on-site — see the Writing section), so the merge had nothing left to merge. (The old featured strip linking `/novel` and `/status` (then `/stream`) was removed earlier; those live in the NavPill now.)
- `/notes/[...slug]` — Static on-site note reading pages; see Writing below.
- `/showcase/[slug]` — Individual project detail pages (left panel shows the showcase-only list, `section="showcase"`)
- `/shelf` — Flat 'wall' collage of every entry (size = favorite/written/logged tier) with a sticky type-filter bar and inline quick-view panel. Progressive enhancement: cards link to `/shelf/[slug]` without JS; JS intercepts clicks to push `/shelf/[slug]` into history and open the panel instead (`?open=slug` supported for legacy links only).
- `/shelf/[slug]` — Individual shelf detail pages

### Legacy Routes (301 Redirects)
- `/about`, `/status` and `/stream` → all redirect to `/life` (`astro.config.mjs` `redirects`). `/status` and `/stream` were retargeted when About became `/life`, so each is a direct hop rather than a chain. See the Life section.
- `/journal` and `/writing` → `/notes`.
- `/notes/jp-journal` → `/japanese-journal`. Other public notes render locally.
- `/rss.xml` is a local RSS endpoint; no redirect.
- `/favorites` → redirects to `/shelf` (the `?fav=1` filter no longer exists). Now a real 301 from `astro.config.mjs`. It used to be a prerendered page calling `Astro.redirect(…, 301)`, which a static build cannot express — so it served a **200 meta-refresh** document with a bare body, and all eleven `/favorites/*` URLs were listed in the sitemap as real pages.
- `/favorites/[slug]` → redirects to `/shelf/[slug]`
- `/media` → redirects to `/shelf` (via `astro.config.mjs` redirects)
- `/media/[...slug]` → redirects to `/shelf/[...slug]`

### Novel Pages
- `/novel` — "Remember Rain" writer's desk, story-first (top row: synopsis intro panel + "read from the start" CTA beside the latest-scene paper sheet; SCRIPT chapter-select hero — arcs with word counts, numbered scene rows, gold sweep hover, `latest` chip; BINDER row of Characters / Story Plan / World panels; anchors per folder)
- `/novel/[folder]/.../[file]` — Focused reading pages; folder-only URLs (e.g. `/novel/characters`) 301-redirect to the matching desk anchor (`/novel#characters`)

### Utility Pages
- `/` — Homepage: the `#personal-hub` layout (intro row + six-card 12-column grid + Traces ticker + footer site map). See the Homepage section
- `/life` — the About page (replaces `/about`, which 301s here). Hand-written profile prose plus a dormant record-driven half (Memories / Calendar / People / map) fed by one reviewed JSON snapshot. **See the Life section for the whole system** — the pipeline, the shared map package and the snapshot contract are the parts that matter before editing it.
- `/now` — Latest "Now" entry (current focus)
- `/now/archive` — Historical "Now" entries list

## Writing (restored November 11, 2026)

Writing now lives on this site. This supersedes the September Substack migration
and any remaining historical references below.

- `/notes` is the Writing archive, newest original publication date first.
- `/notes/[...slug]` — Static on-site note reading pages; see Writing below.
  dates, an archive link, and adjacent-note navigation. Unknown notes return 404.
- `publicNotes()` in `src/utils/notes.ts` excludes drafts and `jp-journal`.
  Undated notes are listed last without fabricated dates.
- `/japanese-journal` remains the separate practice page; its old note URL
  redirects there.
- `/journal` and `/writing` redirect to `/notes`.
- `/rss.xml` is a real local RSS feed of dated, non-draft notes. The homepage,
  profile/About and global RSS discovery all link locally.
- Historical `substackUrl` frontmatter is preserved as provenance only. It does
  not control navigation, rendering or the feed. No external fetch is needed.
- The four-item global menu remains Home / About / Now / Shelf. Writing is
  accessible from Home and About and has its own archive/adjacent navigation.
- The restored note bodies and original dates are unchanged. Existing public
  Substack posts have not been removed or edited.

### Shelf Page Features (`/shelf`)
- **The Wall**: one flat dense-packed collage of every non-draft entry (no per-type
  sections). CSS grid, `grid-auto-flow: dense`, fine-grained rows + integer spans;
  size = affection tier from existing frontmatter (`wallTier` in
  `src/utils/shelfWall.ts`): favorite → large (gold ring + hard gold shadow),
  written-about → medium, bare log → small. **No dimming anywhere** — small is the
  quiet tier (no-shame invariant). Posters render ~2:3, music ~1:1 (`wallShape`);
  span numbers live in the page CSS (`.shelf-card--<shape>-<tier>`), overridden at
  ≤768px. Order: newest first, undated last (`sortWall`).
- **Pinned look**: every item carries a deterministic ±1.5° rotation seeded from its
  slug (`wallRotation`, inline `--rot`). Titles are hidden at rest; a skewed title
  plate (clamped to 3 lines) + the corner-cut gold triangle appear on hover/focus
  (rotation eases to 0). The entrance animation uses `animation-fill-mode: backwards`,
  NOT `both` — a filling animation outranks `:hover`/`:focus-visible` forever and
  would silently kill the straighten-and-lift (same trap as `.media-card`, see Code
  Style Notes). Under reduced motion the rotation stays (static pose) but
  entrance/hover motion is disabled.
- **Filter bar** (`.shelf-jumpbar`, same angled-tab silhouette as the old jump bar):
  tabs are client-side type filters with counts (All + present types, single-select,
  solid gold active tab, `aria-current="page"`). Filtering toggles the `hidden`
  attribute on cards — `.shelf-card[hidden] { display: none }` is required because the
  base rule is `display: block`. URL state via `?type=` + `replaceState`; legacy
  `#section-<type>` links map onto the filter and the hash is stripped; unknown types
  fall back to All (`resolveInitialFilter` in `shelfWall.ts` owns this resolution, and
  an invalid `?type=` is left in the URL rather than scrubbed unless a hash was also
  present). Modified clicks (Cmd/Ctrl/Shift/Alt/middle) are passed through to the
  browser so the tabs still open in a new tab. Filtering re-staggers the entrance
  animation. No-JS: the bar's links just reload the unfiltered page (every entry is
  still a plain `<a>` to its detail route).
- **Quick-view panel**: unchanged — clicking a `.shelf-card` intercepts navigation,
  pushes `/shelf/[slug]` into history, and slides in a panel from the right showing
  emblem, type, title, tags, excerpt, and a link to the full entry. ESC/✕/backdrop
  closes. `?open=[slug]` still opens it on load for legacy links. ≤900px it becomes a
  full-height bottom sheet (poster capped at 40vh, CTA held above `--nav-clearance`).
  Its init runs BEFORE `initFilter()` on purpose: `initFilter`'s `replaceState` would
  otherwise strip the `open` param out of `location.search` before it is read.
- Cards are `<a>` tags linking to `/shelf/[slug]` (works without JS) — the standalone
  detail page redirects (`window.location.replace`) back to `/shelf?open=slug` when JS
  is available, so the quick-view panel is the JS-enabled experience.
- Entry data pre-rendered as JSON in the `data-entries` attribute — no client fetch.
- The character hero carousel, section headers/dividers, jump-bar scrollspy, and
  `.shelf-card--dim` were all removed in the 2026-08 wall redesign, and
  `src/utils/shelf.ts`/`sortShelfSection` retired with them. Wall logic lives in
  `src/utils/shelfWall.ts`, tested in `src/tests/shelfWall.test.ts`.
- The `/favorites` route 301-redirects to `/shelf` (the old `?fav=1` filter is long gone).

## Life (`/life`) — replaces `/about`

**CORRECTION (2026-11-13 audit): `/about` is gone.** It is a 301 to `/life`, as
are `/status` and `/stream`. The profile-card page CLAUDE.md used to describe
(hook + credential lines + WHAT I MAKE + SUBJECTS I EXPLORE + ABOUT prose + NOW
+ CONNECT, with the arc card on top) does not exist. `src/styles/about.css` was
orphaned by that change and was **deleted** in the 2026-11-13 dead-code pass —
`/life` uses `src/styles/life.css`.
The route's framing survived the rewrite ("a profile that has a status, not a
status screen that has a profile", all output and links rather than biography);
almost none of its markup did.

### What `/life` actually renders

`src/pages/life/index.astro`, `<div class="life life--about" data-life>`:
1. `.life__intro` — framed portrait (from `_protagonist.md` via
   `parseProtagonist()`, which still degrades to `DEFAULT_PROTAGONIST` on a
   missing file), the protagonist name as the `<h1>`, a hand-written
   introduction, and a "Say hello" jump link.
2. `.life__perspective` — one hand-written paragraph.
3. `#making` "Along the way" — **three hand-written `<section>`s** (Fukuoka,
   the Marie essay, Utasync), each ending in a link to the thing it describes
   (`/now/2026-11`, `/showcase/marie-video-essay`, `/showcase/utasync`), then
   two `.life__context` navs: "What I make" (`/novel`, YouTube, `/notes`,
   `/showcase`) and "Updates and practice" (`/now`, `/japanese-journal`).
   This copy is **in the page template**, not in a collection.
4. `#memories` / `#calendar` / `#people` — the record-driven half (see below).
5. `#places` — a `<details>` disclosure wrapping the server-rendered Life map.
6. `#contact` footer — `#life-mail` (assembled client-side) plus
   `profile.links` filtered to drop the `YouTube` and `Writing` labels, since
   the context navs above already carry those.

**The record-driven half is currently dormant, and that is the expected state.**
Every one of those three sections is gated on `records.length > 0`, and
`src/data/life.json` **does not exist** (`src/data/` is an empty directory), so
`loadLifeExport()` returns `{ schemaVersion: 1, records: [] }` and the live page
shows only items 1–3, 5 and 6. The map renders with no markers. Do not read a
blank Memories section as a bug — it means no snapshot has been published yet.
The per-section `.life__quiet` empty-state strings ("I haven't shared any
memories here yet.") were therefore **unreachable** — the outer `records.length
> 0` gate and the inner `length === 0` ternary contradicted each other — and
the dead inner branches plus the `.life__quiet` rule in `life.css` were removed
on 2026-11-13. Rendered output did not change. If you ever want those empty
states to show, the change is to drop the *outer* gate, which is a design
decision about whether an empty section is worth a heading.

### The public-snapshot pipeline

This is the part worth understanding before touching anything here. `/life`
never reads a private source; it reads one reviewed, hash-approved JSON file.

- `src/utils/lifeExport.ts` — the **v1 public contract**, a Zod
  `discriminatedUnion` over five record kinds: `experience` (dated, with
  `people`/`places`/`events` reference arrays), `person`, `place` (a `region`
  ref plus optional 0–100 `position: {x,y}`), `event` (`places` refs), and
  `region` (optional `parent`, optional `mapKey`). Every object is `.strict()`
  — an unknown field is a **parse error**, not a silently dropped one, which is
  the whole point: a private field cannot ride along unnoticed. A
  `superRefine` then enforces referential integrity (every ref must resolve to
  a record of the right kind), unique ids, unique region `mapKey`s, and no
  cycles in the region hierarchy. `canonicalLifeExport()` emits a
  deterministic serialization — keys sorted, record order and every string
  including whitespace preserved — so a review hash is stable.
- `src/utils/lifeData.ts` — `loadLifeExport()` reads only
  `src/data/life.json`; **ENOENT means "nothing shared yet" and returns an
  empty bundle, but malformed content throws and fails the build** rather than
  quietly hiding records that were meant to be public. Plus
  `linkedLifeRecords()` (an entry's outbound refs, resolved) and
  `lifeEncounters()` (the inverse — every experience that links *to* this
  record, newest first).
- `scripts/life-import.ts` — the only writer. `life:check <file>` validates and
  prints a SHA256; `life:import <file> --approve <sha256>` refuses unless the
  hash matches what was reviewed. It writes to a `randomUUID` temp file with
  `flag: 'wx'` and `rename`s into place, and **refuses to follow a symlink** at
  either the destination or its parent. Errors never echo input values, because
  a rejected file may contain secrets. It does not deploy. The script and its
  `life:check` / `life:import` npm aliases are both committed.

### `packages/life-ui/` — shared map UI outside `src/`

A content-free local package (`life-map.mjs` server renderer, `life-map.js`
browser controller, `life-map.css`, `fukuoka.mjs` artwork) imported by
`life/index.astro` with a relative `../../../packages/…` path. It is
**vendored verbatim** by a separate private life-archive project, which is why
it exists as a package at all: the caller supplies validated flat records and
its own `hrefForRecord` adapter, so this is presentation reuse and
deliberately **not** a data-synchronization path. Read
`packages/life-ui/README.md` before editing — it records the `mapKey` binding
vocabulary (`fukuoka`, `fukuoka-{chuo,hakata,higashi,minami,jonan,sawara,nishi}`),
the rule that a descendant region's coordinates are never plotted on an
ancestor's map, the fragment-link no-JS fallback, that SVG markers avoid inline
`style` attributes to satisfy the private project's CSP, and the byte-for-byte
`ui:check` contract on the private side. The artwork is original illustrative
geography — not boundaries, not directions.

### `/life/[id]` — one page per record

`getStaticPaths()` over the same snapshot, so with no snapshot there are **zero
such routes**. Each renders a kind tab, title, date (experiences only), the
body split on blank lines, then Connections (`linkedLifeRecords`), Places &
regions (children by `region`/`parent`), and Encounters (`lifeEncounters`). The
back link targets the parent section anchor on `/life` via a kind→anchor map
(`experience`→`memories`, `person`→`people`, `place`/`event`/`region`→`places`).

### Client script

`src/scripts/life.ts` does two small things, both idempotent via a
`data-ready`/`textContent` guard and both re-run on `astro:page-load`:
`initLife()` opens the `#places` disclosure when the hash is `places` or
targets anything inside it (a `<details>` does not open itself for a fragment
inside it, so deep links into the map would otherwise land on a closed
element), removing its `hashchange` listener on `astro:before-swap`; and
`initLifeMail()` fills `#life-mail`, which ships `hidden` with a `<noscript>`
obfuscated-text fallback. The email address is never in the served HTML — the
same pattern as the homepage's `setupContact()`.

### What is left of the old `profile` collection

`pickProfile()` is still called, but **only `profile.links` is read**. `hook`,
`credentials`, `makes`, `makesMore`, `subjects`, `connect` and the body
markdown are validated on every build and rendered nowhere. (`nowLine()` was
the other export; it had no caller and was deleted 2026-11-13.)
`src/content/profile/about.md`
also carries an `# EXPIRES OCTOBER 2026` comment over copy its author already
flagged as going stale. Deciding whether to trim the schema to `links` or to
surface that copy again on `/life` is a content call, not a cleanup.

## Visual Novel System ("Remember Rain")

Remember Rain is a **visual novel** in progress (the project committed to a VN-first direction — see [[remember-rain-project]] in memory). The `/novel` route (URL and content folders keep the `novel`/`manuscript` names; only the visible framing says "visual novel") serves it with its own UI, separate from content collections.

- **Content location**: `src/content/novel/` — Scrivener export structure with top-level folders (`Characters`, `Manuscript`, `Story Plan`, `World`). The manuscript prose (the story) lives under `Manuscript/` (arc subfolders); everything else is outline. The story-folder slug is defined once as `STORY_FOLDER_SLUG` in `src/utils/novel.ts`. Each `.md` file may have a sidecar `<Title> MetaData.txt` with Scrivener-format `Created:` / `Modified:` dates.
- **Build utility**: `src/utils/novel.ts` — `buildNovelTree()` reads the directory at build time and returns a `NovelTree` (recursive `NovelFolder`/`NovelFile` types). Files are slugified and markdown is pre-rendered to HTML via `marked`. Two Scrivener-specific cleanups run before `marked`: `unescapeScrivenerMarkdown()` undoes the compile step's blanket backslash-escaping, and `stripSceneLabel()` removes a scene document's leading `aNsNN_slug` line (`a1s01_road_less_traveled`, `a4d01_commute`, `a3v02_life`) — that label is the drafting handle, kept out of the title so the title can stay human-readable for this site, so it must not leak into body HTML, excerpts, or word counts. A label-only card correctly renders as empty. Top-level folders in `PRIVATE_FOLDER_SLUGS` (currently `inbox`) are excluded from the tree — the Inbox is the author's unsorted scratch front door and never belongs on the public desk.
- **Routing**: `src/pages/novel/[...slug].astro` renders two static views from `getStaticPaths()`: `/novel` (desk landing, story-first — spec: docs/superpowers/specs/2026-08-04-novel-desk-story-first-design.md. Top row `.desk-top` (2-col grid, stacks ≤768px; `--solo` when only one child): the optional `.desk-about` intro panel — rendered from the Story Plan doc found by `findSynopsisDoc()` (slug `synopsis` / `what-is-remember-rain` / `about` / `overview` / `premise`, currently `Story Plan/0 What is Remember Rain.md`), stretched to match the sheet with its "read from the start" CTA (to `findFirstScene()`, first Manuscript file in binder order) pinned to the panel bottom via `margin-top: auto`; falls back to a small `.desk-restart` link under the sheet when no synopsis doc exists — beside the latest scene as a cream paper sheet with excerpt. Then `.desk-script` (`id="manuscript"`) — the chapter-select hero: arcs (Manuscript subfolders; root files as an untitled first group) as mono headers with per-arc word counts, each scene a `.scene-row p4g-sweep` link (skewed number chip with continuous reading-order numbering, title, word count — count hidden ≤768px; the latest-edited scene carries a gold `latest` chip). Then `.desk-binder` — Characters / Story Plan / World as `.binder-panel`s (3-col grid, stacks ≤768px), each `id={slug}` so folder-URL redirects keep landing on their anchor. Panel headers carry doc count + summed word count; every row is `.binder-row__title` plus a `.binder-row__hook` — the document's own opening line, extracted at build by `hookOf()`, 130 chars, cut on the first sentence end when one fits, clamped to two lines. `hookOf` drops headings, then skips two kinds of useless opening block when real prose follows: a **wholly-italic** paragraph (this binder's provenance notes / "replaced by ticket N" asides are all italic leads) and a line that merely **restates the doc's own title**. Hover/focus is a gold left rule + 4px indent, not a background sweep — the binder stays subordinate to the script) and `/novel/[folder]/.../[file]` (focused reading page — paper treatment for Manuscript scenes, ink for everything else, prev/next page-turn links in tree order). Folder and intermediate subfolder URLs 301-redirect (`Astro.redirect`) to the matching desk anchor (`/novel#characters`); reading-page breadcrumbs and the NavPill back link point at those anchors. No client-side rendering — plain links + view transitions; the only script is the sepia rain canvas (static frame under reduced motion).
- **UI**: "Writer's desk" — gold/black/brown palette (`--novel-*` tokens in `novel.css`), P4G header pattern, dates always shown as facts ("edited …", never time-since — no-shame invariant). Story vs. outline split is visual: Manuscript scenes render on paper, outline docs in ink. Flat by design: two layers only (desk → reading page), no folder pages, no decorative copy (the sheet kicker is the functional "latest scene").
- **Homepage stats**: `computeNovelStats(tree)` returns `{ storyWords, outlineWords, lastSceneModified, lastOutlineModified }` for the rain-gauge tile — story = top-level `Manuscript` folder (`STORY_FOLDER_SLUG`), outline = everything else; sidecar `Modified:` dates preferred, filesystem `mtime` fallback (`NovelFile.mtime`), all anchored to UTC.
- **Testing**: `src/tests/novel.test.ts` covers `slugify`, `parseMetaData`, `buildNovelTree`, `countWords`, `computeNovelStats`, `flattenFolderFiles`, `findRecentFiles`, `findSynopsisDoc`, and `findFirstScene` via vitest.
- **Ordering (binder order)**: The Scrivener export carries no binder-order data (no `.scrivx`, no order field in the sidecars), so `buildNovelTree` orders siblings by a **leading numeric filename prefix** (`parseOrderPrefix`): `1 Rain intro.md`, `2 Claire and Roxana save Rain.md`, … render in that order, and the number is stripped from both the display title and the URL slug (→ "Rain intro", `/novel/manuscript/arc-1-fugitive/rain-intro`). Works on files and folders at every level. A 1–3 digit prefix + separator (space/`.`/`-`/`_`/`)`) is treated as order; 4-digit years stay part of the title. Un-prefixed siblings fall back to natural (numeric-aware) alphabetical order, so `Arc 2` precedes `Arc 10` without prefixes. Number the exported files to reproduce the Scrivener binder order.
- **Adding content**: Drop `.md` files into the appropriate `src/content/novel/` subfolder. Scrivener MetaData.txt sidecars are auto-read if present (numbered sidecars like `1 Rain intro MetaData.txt` and prefix-stripped names both resolve); other `.txt` files are silently skipped.

## Traces

A public guestbook: visitors leave a short name + one-line message. Neon
Postgres-backed (`traces_messages` table, provisioned via the Vercel
Marketplace `neon` integration — `DATABASE_URL` and the connection is
lazy-initialized in `src/utils/tracesDb.ts` to stay build-safe). The site is
otherwise fully static; only the Traces routes opt into on-demand rendering
(`export const prerender = false`): `GET`/`POST /api/traces` (list, with an
optional `?limit=`, and submit — both live in the same
`src/pages/api/traces/index.ts`) and the admin-only `DELETE
/api/traces/[id]` (gated by an `x-admin-key` header checked against
`TRACES_ADMIN_KEY`). `/traces` (`src/pages/traces.astro`) is the canonical,
no-JS-safe destination — full form + full list, server-rendered.
**Deleting via curl needs an explicit `-H "Content-Type: application/json"`**
— Astro's default `security.checkOrigin` CSRF guard blocks `DELETE` requests
whose Content-Type is form-like (including curl's default when none is set),
with the generic error "Cross-site DELETE form submissions are forbidden";
this only surfaces on the real deployment, not `astro dev`/`vercel dev`.

**Anti-abuse (all invisible, no CAPTCHA)**: a honeypot field (`website`,
silently no-ops rather than erroring), Vercel BotID (`checkBotId()`
server-side, fails open on error — see `vercel.json`'s proxy rewrites and
`initBotId()` called client-side in `traces.astro` only — the homepage no
longer submits anything, so its old `index.astro` call went with the rewrite),
a per-IP rate limit (`hashIp()`/`isRateLimited()` in `src/utils/traces.ts`,
5 min window, `ip_hash` never stores the raw IP), a length cap (name 40 /
message 100 chars), and a narrow, intentionally-not-general-purpose
blocklist (`BLOCKED_TERMS` in the same file — self-harm-incitement phrases
only; extend it directly rather than treating it as a profanity filter).

**Homepage — `TracesBar.astro`, a paused-on-hover ticker.** **CORRECTION
(2026-11-13 audit): the danmaku homepage treatment is gone.** The bullets that
flew right-to-left, the two-zone `.traces-current`/`.traces-lane` split, the
parked `.traces-park` line and its 7s cross-fade, `buildTracesSpawnQueue`,
`pumpTracesLane`/`queueTracesBullet`, `tracesLaneFreeAt`, the gap/speed jitter
constants, `tracesFlightAllowed()`, the one-per-session arrival burst, the
`<dialog>` modal with its count header, and the `.hero-band` layout wrapper all
went with the homepage rewrite. Verified by grep: none of those names survive
in `src/`. That was the sixth redesign (pills → fixed-corner ticker →
full-width wall → danmaku over the hero → danmaku in the bar → this); the
reasoning recorded for the earlier ones is history now, not current behaviour.

What exists instead is `src/components/TracesBar.astro`, rendered once on the
homepage inside `.guestbook-row`. It is a single strip: a `.traces-title` link
to `/traces`, a `.traces-lane`, and a gold `.sign` button also to `/traces`.
- **Server-rendered state is the empty state.** The template ships
  `.traces-fallback` ("A few words from people passing through.") with the
  track `hidden`. That is the no-JS state, the pre-fetch state, and the
  API-failure state — the `catch` deliberately does nothing, so the invitation
  and the canonical `/traces` link stay usable. With a successful fetch and
  zero rows it becomes "Be the first to leave a few words."
- **One client fetch**, `/api/traces?limit=15`, then rows are built with
  `document.createElement` (never `innerHTML`) with each field type-checked and
  the id validated as a safe positive integer before use. Each row links to
  `/traces#trace-<id>`, so the bar is a deep index into the canonical list.
- **The seamless loop is a cloned list.** `.traces-messages` is cloned into a
  `.traces-echo` copy that is `aria-hidden` with every link `tabIndex = -1`:
  the loop closes visually without repeating messages to screen readers or
  adding duplicate keyboard stops.
- **Duration is measured, not guessed.** A `ResizeObserver` on both the lane
  and the list publishes `--traces-distance` (the list's real width, with
  `min-width` forced to at least the lane's) and `--traces-duration =
  distance / 35` — a constant ~35px/s, so a long backlog scrolls for longer
  rather than faster.
- **Hover and focus pause it**, via `animation-play-state: paused` on
  `:hover`/`:focus-within`. `:focus-within` goes further and turns the lane
  into a real `overflow-x: auto` scroller with `animation: none`, because a
  focused row has to be brought into view and the browser cannot scroll to
  something a `transform` is moving.
- **Setup is idempotent and cleans up.** A `data-ready` flag guards re-entry,
  and an `AbortController` plus `observer.disconnect()` fire on
  `astro:before-swap` so a view transition does not leak the fetch, the
  observer or the motion listener.
- **≤700px** the strip becomes a 2-column grid with the lane on its own second
  row under a top hairline. **`prefers-reduced-motion`** stops the animation,
  hides the echo copy, makes the lane a scroller and lets rows wrap
  (`white-space: normal`, `max-width: min(65ch, 75vw)`) — the messages are
  still all there, just read by scrolling instead of waiting.
- **Styling gotcha**: TracesBar's `<style is:global>` prefixes every rule
  `#personal-hub`, so the component is unstyled outside the homepage. See the
  Homepage section for why the homepage CSS is global rather than scoped.

**Timestamps**: `/traces` shows full date **and time**
(`formatTraceTimestamp`, "Aug 25, 2026 · 3:41 PM UTC"). Traces are submission
instants, not editorial content dates, so this intentionally departs from the
sitewide date-only `formatDate()` (see `src/utils/tracesFormat.ts`). The
homepage ticker carries **no timestamp at all** — a timestamp on a moving row
is unreadable noise, and dropping it makes each row narrower, which is width
the lane spends on spacing instead. `formatTraceTimestampCompact()` was the
homepage's compact form ("aug 25 · 3:41pm"); it had no caller after the
homepage rewrite and was deleted on 2026-11-13.

**Anti-abuse footprint on the homepage**: none. `initBotId()` is called only in
`traces.astro` now — the homepage ticker is read-only, and the submit form lives
exclusively on `/traces`.

## Sessions & the arc card (now on `/now`)

The `sessions` collection logs work sessions (Japanese, writing, streams) as
hand-written markdown — create a `.md` in `src/content/sessions/` (VS Code
snippet: type `session` + Tab). These files are currently an inert historical
archive: nothing reads them anymore (see below), so creating new ones is
optional bookkeeping, not something any page depends on.

**Second correction (2026-11-13 audit):** `/about` itself no longer exists — it
is a 301 to `/life` (see the Life section), and `/life` carries no arc card
either. So every "`/about`" below should be read as the historical page, not a
current destination; the arc card's only home is `/now`.

The arc card that now lives on **`/now`** — not `/about`; see the correction below — traces back to `/status`
(spec: docs/superpowers/specs/2026-08-18-status-page-arc-revamp-design.md),
which was rebuilt 2026-08 from a four-screen session-log pause menu into a
single flat screen, because the log required per-stream maintenance that
competed with the actual writing/Japanese-learning work it was meant to
reflect. `/status` was then merged into `/about`
(spec: docs/superpowers/specs/2026-08-19-about-status-merge-design.md) once it
became clear the two pages were two one-screen answers to "who is this?" that
already shared the protagonist header, the profile links, and the mailbox —
only the arc card and the `LV n` chip were unique to `/status`. Both `/status`
and `/stream` now 301 to `/life`. The surviving framing: the About page is a
profile that has a status, not a status screen that has a profile — and it's
still viewer-facing, not a personal tracker: the arc card's job is "what
chapter of the story is this, and what's currently being decided" — not "how
many sessions has Russ logged."

- **Arc card** (`.arc-card`) — **this is on `/now`, not `/about`.**
  CORRECTION (2026-09-30 audit): everything this bullet used to claim about
  `/about` was stale. Verified against the live site: `/about` contains no
  `arc-card` element and no arc content at all, while `/now` contains both. The
  markup lives at `now.astro:74-86`, its CSS at `now.astro:191-259`, and only
  `now.astro` imports `parseCurrentArc()` (`now.astro:7,35`). `about.css`
  contained no `.arc-card` rule either, and that file no longer exists (deleted
  2026-11-13). **Further correction (2026-11-13):** the
  homepage About tile (`#stream-tile`) that used to teaser the same `_quests.md`
  section no longer exists — the homepage rewrite deleted it, and nothing on the
  homepage reads `_quests.md` now. Apart from where it
  lives, the rest of this bullet describes the card accurately. Whole-card accent-colored by the arc's stat (border/kicker/
  updated stamp use `STAT_COLORS`), with a stat emblem badge
  (`/images/emblems/<stat>.webp`, 160px) on a dark circular plate for contrast (the
  emblem PNGs are opaque-white-background line art and wash out if dropped
  directly on a pale accent color like Insight). Sourced from a
  `## Current Arc` section in `_quests.md` (`**Arc:**`/`**Stat:**`/
  `**Updated:**` fields + a decision paragraph), parsed by
  `parseCurrentArc()` (`src/utils/currentArc.ts`). An absent or incomplete
  section hides the card entirely rather than rendering blanks; an
  unrecognized `Stat` value degrades to a neutral gold accent rather than
  failing the build. Hand-edited, expected to change every few weeks/months —
  not per-stream. The rest of `_quests.md` (The Question / Active / Ideas —
  `<Stat>` / Completed) is Russ's private planning scaffold and is **not**
  rendered anywhere. `status.css` was deleted in the merge, and its arc-card
  rules never moved into `about.css` (itself since deleted) — they live in
  `now.astro`'s scoped style block (see the correction above).
- **Identity header** and **"find me elsewhere" links row** — no longer
  `/status`-specific; both survive on `/life` as `.life__intro` (portrait/name
  from `_protagonist.md`, parsed by `parseProtagonist()`,
  `src/utils/protagonist.ts`; missing file/fields degrade to defaults) and the
  `#contact` footer's `profile.links` strip — not the `social-links`
  collection, which models Bonds/confidants (`arcana`/`affinity`/`rank`/`lore`)
  and has no real entries.
- **The `LV n` chip is gone.** It was a byproduct stat for a screen that no
  longer exists. `src/utils/level.ts` and `src/tests/level.test.ts` sat
  unimported and still passing for months; both were **deleted** in the
  2026-11-13 dead-code pass.
- **Mailbox strip** — now `/life`'s `#contact` footer:
  address assembled client-side into `#life-mail` (never in served HTML, filled
  by `initLifeMail()` in `src/scripts/life.ts`) with a `<noscript>`
  obfuscated-text fallback. The "Send mail to be read on stream" line kept from
  `/status`'s old mailbox strip is **gone** — the footer is now just "Say hello"
  plus links. Historically kept because the homepage's
  mail link pointed at it as its no-JS fallback. (The homepage's mail affordance is now the `.about-links`/footer Contact link to `/life#contact`, assembled client-side by `setupContact()`; there is no `#mail-tile`.)

`STAT_COLORS`/`STAT_ORDER`/`StatName`/`hexToRgbTriplet` are all that remain in
`src/utils/sessions.ts` — everything else (tallying, radar/donut geometry,
quest-file parsing, the log-scale level curve) was deleted with the pause
menu. `STAT_COLORS` is still consumed by `scripts/transition.ts`'s per-route
page-transition card effect (a static route→stat color mapping, unrelated to
session tallies) and by the arc card above. It is **not** read by the homepage at
all any more — the About tile that used to carry a (deliberately gold, not
stat-hued) accent was deleted in the homepage rewrite.

**Gone (2026-11-13 audit):** the homepage Stream tile (`#stream-tile`) that
carried the live-now indicator and the arc teaser was deleted in the homepage
rewrite, and the live-status/Twitch endpoints it polled were deleted in the
same day's dead-code pass (see the Homepage section).

The `social-links` collection/schema is unused by any page as of 2026-08 (it
has one `draft: true` sample entry) — a future Bonds/confidants feature is a
separate decision, not part of this page.

## Utility Modules

| File | Exports | Purpose |
|------|---------|---------|
| `src/utils/content.ts` | `stripMarkdown()`, `hasMinimalContent()` | Strip markdown AND raw HTML for excerpts + client-side search; detect empty entries. Entities a renderer emits (`&amp; &lt; &gt; &quot; &#39;`) are **decoded, not blanked** — blanking them turned every "the author&#39;s notes" into "the author s notes" in excerpts and the search index; exotic entities still collapse to a space |
| `src/utils/collections.ts` | `getAllCollections()` → `{ allShelf, allNotes, allShowcase }` | Fetch all non-draft entries; `SectionName = 'shelf' \| 'notes' \| 'showcase'` |
| `src/utils/notes.ts` | `publicNotes()` | Public-note filtering and original publication ordering |

| `src/utils/dates.ts` | `formatDate()`, `shouldShowUpdatedDate()` | Date formatting and update-date display logic |
| `src/utils/novel.ts` | `buildNovelTree()`, `slugify()`, `parseMetaData()`, `parseOrderPrefix()`, `unescapeScrivenerMarkdown()`, `stripSceneLabel()`, `countWords()`, `computeNovelStats()`, `flattenFolderFiles()`, `findRecentFiles()`, `findSynopsisDoc()`, `findFirstScene()` | Scrivener-backed novel content loader + rain-gauge stats + desk recency/intro helpers |
| `src/utils/sessions.ts` | `STAT_ORDER`, `StatName`, `STAT_COLORS`, `hexToRgbTriplet()` | The shared stat vocabulary/colors — the only place the five stat hexes are written (`now.astro`'s arc card and `scripts/transition.ts`'s page-transition card read `STAT_COLORS`; the homepage About tile deliberately does **not** — see below). Tallying/radar/donut/quest-parsing/level-curve logic that used to live here was deleted in the 2026-08 `/status` rebuild (see the Sessions section above) |
| `src/utils/protagonist.ts` | `parseProtagonist()`, `DEFAULT_PROTAGONIST` | Minimal frontmatter reader for `_protagonist.md` (name/epithet/portrait); missing file/fields degrade to defaults. Consumed by `/life`'s header |
| `src/utils/profile.ts` | `profileSchema`, `pickProfile()`, `ProfileData` | Profile-collection data layer — Zod schema (from `astro/zod`, **not** `astro:content`, so vitest can load it) and singleton entry selection. `/life` calls `pickProfile()` and reads only `links[]`. `nowLine()` lived here until the 2026-11-13 dead-code pass |
| `src/utils/lifeExport.ts` | `lifeExportSchema`, `canonicalLifeExport()`, `LifeExport` | The v1 public Life snapshot contract — strict discriminated union over 5 record kinds, referential-integrity/uniqueness/cycle checks, and a deterministic serializer for review hashes. See the Life section |
| `src/utils/lifeData.ts` | `loadLifeExport()`, `linkedLifeRecords()`, `lifeEncounters()`, `LifeRecord` | Reads the one snapshot at `src/data/life.json` (absent → empty bundle; malformed → build failure) and resolves records' forward and reverse links |
| `src/utils/shelfWall.ts` | `wallTier()`, `wallShape()`, `wallClass()`, `wallRotation()`, `sortWall()`, `resolveInitialFilter()` | /shelf wall logic — affection tiers, shape/span classes, slug-seeded rotation, ordering, filter-URL resolution |
| `src/utils/splitView/` | (11 modules) | Modular SplitViewLayout client JS — see `index.ts` for entry point |
| `src/utils/traces.ts` | `tracesMessageSchema`, `parseTracesInput()`, `sanitizeText()`, `hashIp()`, `isRateLimited()`, `containsBlockedTerm()`, `BLOCKED_TERMS`, `NAME_MAX_LENGTH`, `MESSAGE_MAX_LENGTH`, `RATE_LIMIT_WINDOW_MS` | Traces validation/hash/rate-limit/blocklist — see Traces section |
| `src/utils/tracesDb.ts` | `insertMessage()`, `listMessages()`, `countMessages()`, `lastSubmissionByIpHash()`, `deleteMessage()`, `TraceRow` | Traces database access layer (Neon, lazy-initialized) |
| `src/utils/tracesFormat.ts` | `formatTraceTimestamp()` | Zero-import timestamp formatting for `traces.astro`'s list. The lowercase `formatTraceTimestampCompact()` served the old homepage wall bullets and was deleted 2026-11-13 (the ticker shows no timestamps) |

The `splitView/` directory is modular: `contentLoader`, `emblemAnimation`, `eventBindings`, `filterEngine`, `filterUI`, `idleManager`, `mediaHandlers`, `proseImageTilt`, `types`, `urlState`. (`drawCard` — the notes-only draw pool — was deleted with the draw-a-card deck in the September Substack migration; see the Writing section, which supersedes it.)

## Astro Integrations

- `@astrojs/mdx` — MDX support (`.mdx` files work in all content collections)
- `@astrojs/sitemap` — Auto-generates `/sitemap-index.xml` at build time
- `@astrojs/vercel` — Deployment adapter; the site deploys on Vercel (`wrangler.jsonc` is a Cloudflare static-assets config not referenced by any npm script — Vercel is the live target)
- Site URL: `https://ninjaruss.net` (set in `astro.config.mjs`)

## Build Warnings (expected vs. real)

- `[glob-loader] Duplicate id "..."` warnings with no actual duplicate files = stale cache; fix with `rm -rf .astro node_modules/.astro` and rebuild. Verify with `ls src/content/shelf | sort | uniq -d` before hunting further.
- One deprecation warning about defining collections in `src/content.config.ts` is expected: `src/content/novel/` lives inside `src/content/` but is not a content collection (read directly by `buildNovelTree()`). Relocating it is a known deferred task.

## Important Implementation Details

1. **SplitViewLayout JavaScript**: Three-panel layout (list/detail/emblem) with client-side fetch for detail content, History API for navigation, search filtering (Cmd/Ctrl+K to focus search) when `showSearch` is true, emblem card flipping on content selection, falls back gracefully without JS. `contentLoader.loadContent` fetches by each list item's own `href` (not the page section). On load with no slug in the URL, auto-opens the newest visible entry — desktop layout only (detected via the applied grid columns, not viewport width) and without pushing history or moving focus; detection retries on a setTimeout loop (20 × 75ms then 20 × 250ms, ~6.5s total) because styles can land after init and rAF is suspended in background tabs, and is re-kicked once on window `load` and once when the `(min-width: 1200px)` media query flips true (embedded panes can report 0×0 at init), with a `splitView.isConnected` guard stopping stale timers after view-transition swaps (`src/utils/splitView/index.ts`; `loadContent` accepts `{ pushHistory, focusHeading }` options). **`/showcase` now auto-opens its newest entry on desktop** — the old `/journal` route was the one place that suppressed this, by rendering the draw-a-card deck (`showDraw`) in the placeholder instead; both the deck and `showDraw` were deleted with the notes merge (see the Writing section), and nothing replaced the suppression, so the ordinary auto-open behavior now applies.

1b. **SplitView mobile (≤900px) stacked layout**: the list panel flows at natural height (`.split-view__nav` has `max-height: none` — the page scrolls; an inner scroller left a dead band above the bottom nav) with `--nav-clearance` bottom padding, and the empty detail pane is `display: none` until a selection exists (`has-selection` is server-set on detail routes like `/showcase/[slug]` and client-set on tap, so both flows show the detail). Auto-open remains desktop-only. The `.split-view__content .prose` right inset in that breakpoint exists to clear the fixed `.emblem-badge` (60px + its offset) — removing it puts the badge back on top of the text.

2. **View Transitions**: Uses Astro's ClientRouter with custom P4G-style slide animations. `#transition-canvas` is a replaced element sized by its `width`/`height` attributes (`resizeCanvas()` in `src/scripts/transition.ts`) — a percentage in CSS can't size it, and measuring from `window.innerWidth` (scrollbar-inclusive) reintroduces horizontal page overflow; use `documentElement.clientWidth`.

   **The choreography is load-bearing — read this before touching the timings.** `src/scripts/transition.ts` stages every internal navigation in three parts, and the order is what makes it read as a transition rather than as two unrelated animations:

   - The **fetch starts first**, in parallel with the card (`const fetched = original()`).
   - The **card plays over the OLD page** — the only time it is legible against a still background.
   - The **wipe sweeps, and its midpoint releases the swap** (`resolveSwap`), so the DOM exchange happens *underneath* the slab. The canvas is `position: fixed` with `transition:persist`, so it keeps drawing across the swap and uncovers the new page as it exits.

   Timings are `T_IN 520 + T_HOLD 340 + T_WIPE 620` = 1480ms, of which 860ms is the card being *seen*. That block is the only knob. Two regressions worth not repeating: cutting `T_HOLD` makes the card a flicker (the card is the point of the effect), and **removing the swap gate destroys the effect entirely** — with the swap immediate, the card plays over the already-swapped page and the wipe then sweeps over content that is already visible, so it covers nothing. The original code's actual flaw was subtler: it awaited `cardPhase()` *before* calling `original()`, so request latency was added on top of the animation instead of hidden behind it. Fetch early, gate the swap.

   Two deliberate skips: history traversals (`e.navigationType === 'traverse'`) return early so Back/Forward are instant, and `prefersReducedMotion()` opts out entirely. The swap gate also has a fail-safe release — `startWipe` resolves *without* firing `onMidpoint` on its `if (!ctx)` early returns, which would otherwise leave the gate pending forever and strand navigation behind a completed fetch.

3. **Draft Filtering**: All collection queries should filter `draft !== true`

4. **Accessibility**: Focus-visible gold rings, prefers-reduced-motion respected, 44px minimum touch targets

5. **Now Page**: Dynamically renders the latest entry from the `now` collection. To update, add a new markdown file to `src/content/now/` with `publishedAt` frontmatter. Archive available at `/now/archive`. The homepage's `.now` card shows the latest entry's title, date and a build-time first-sentence excerpt of its body.

6. **Homepage cards**: see the Homepage section. The short version: six cards on a 12-column grid sharing one 5/7 seam, each with exactly one destination reached by a stretched `.tile-link::after` overlay, inner links raised above it; CSS in `index.astro`'s `<style is:global>` block, prefixed `#personal-hub`. There is no Latest tile, no client-side content cycling and no ambient animation on the page.

6b. **NavPill**: four items — Home / About (`/life`) / Now / Shelf — rendered on every non-home page. `/showcase/[slug]`, `/notes/*` and the other off-menu destinations are not menu items; they only set the collapsed mobile `<summary>` label (see the component inventory). Hidden on the homepage, which has its own header links and footer site map.

7. **Shelf Wall**: `/shelf` is one flat dense-packed collage (not SplitViewLayout, no per-type sections) where an entry's size expresses affection — favorites large with a gold ring, written-about medium, bare logs small, nothing dimmed. See the Shelf Page Features section above for the full model.

8. **Related Content System**: Uses `collections` field in frontmatter for cross-referencing. Calculates relevance scores based on matching collections, displays up to 6 related entries in card grid at bottom of detail pages. Shows emblem thumbnail, section badge, and title.

9. **EmblemCard 3D Tilt**: Interactive mouse-tracking tilt effect with `requestAnimationFrame` for smooth performance. Max 15-degree tilt, scale 1.03 on hover. Only activates on `(hover: hover)` devices. Respects `prefers-reduced-motion`. 3D flip animation reveals Yu-Gi-Oh card backing.

10. **Date Display**: Uses `updatedAt` from frontmatter if present. `shouldShowUpdatedDate()` only renders "Last Edited" when `updatedAt > publishedAt`. `formatDate()` always uses UTC to avoid timezone drift.

11. **Content Search**: Uses `stripMarkdown()` function to remove code blocks, links, headings, formatting, raw HTML tags, and HTML entities for client-side search (prose comparisons like `a < b` are preserved — the tag regex requires a letter or `/` after `<`). Truncates to 500 chars for search index.

## Image Assets

### Shelf posters (`/public/images/media/`)
- All `.webp`, max 640px wide, quality 80 (animated WebP for the former GIFs — sharp with `{ animated: true }` preserves frames). Keep new posters in this format/budget; the directory went 15MB → 4.3MB in the 2026-07 optimization pass and page weight is the shelf's main perf lever.
- `.shelf-card` carries a diamond-watermark background (inline SVG data URI) so a card whose poster is still loading — or missing — reads as intentional, not broken.

### Screenshots and diagrams (`/public/images/showcase/`)
- All `.webp`, **max 1600px on the long edge, quality 80**. Prose is ~700px
  wide and these open in `MediaLightbox`, so 1600 is the 2x retina budget plus
  room to zoom a diagram; text and ER diagrams stay legible (checked by eye, not
  assumed). Source PNGs ran 2900–3840px and up to 2.2MB each — the 2026-11-13
  pass took the directory from 21MB to 2.0MB with no visible change.
- Prose images get `width`/`height`, `decoding="async"` and `loading="lazy"`
  (all but the first, which may be the LCP element) added at build time by
  `src/utils/rehypeProseImages.mjs`, wired in as a `markdown.rehypePlugins`
  entry. Don't hand-write those attributes in markdown — but an explicit one
  always wins over the plugin.

### Stat emblems (`/public/images/emblems/<stat>.webp`)
- **160px, quality 88.** The floor is set by `scripts/transition.ts`, which
  draws them onto `#transition-canvas` at `cw * 0.56` where `cw` maxes at 200 —
  so up to 112px, and the canvas has no DPR scaling. 96px was tried first and
  under-resolved that draw. The `/now` arc badge shows them at 32px.

### Logos (`/public/images/logos/`)
- `myanimelist.svg` — MyAnimeList logo for external link tile
- `spotify.svg` — Spotify logo for external link tile

### Emblems (`/public/images/emblems/`)
All placeholder emblems share the same card template (dark card, gold gradient frame, icon in the center emblem area). The set is deliberately small — four ninja-themed types plus the fallback; don't grow it per-note, pick the closest theme. Renderer gotcha baked into the set: never stroke an axis-aligned `<line>` with the gold gradient — a zero-area bbox makes `objectBoundingBox` gradients unpaintable in strict renderers; use gradient-filled `<rect>`s or non-axis-aligned paths instead.
- `default.svg` — "N" card (fallback; also the identity note)
- `scroll.svg` — Inner-work reflections (the default for most notes)
- `torii.svg` — Japan / weeb life
- `flame.svg` — Drive, goals, growth ("clear mind, burning soul")
- `shuriken.svg` — Ninjaruss identity / online presence
- Content-specific emblems stored per entry (WebP)

### Card Assets
- `/public/images/ygo-card-backing.webp` — Yu-Gi-Oh style card backing texture for EmblemCard reverse. It renders on **every** detail page, so it is the one asset whose size is paid site-wide; it was a 1.1MB PNG until the 2026-11-13 pass took it to 58KB.

## Adding New Content

1. Create `.md` file in appropriate `src/content/` subdirectory (shelf, notes, showcase, now)
2. Include required frontmatter matching collection schema
3. Add `emblem: '/images/emblems/your-emblem.svg'` for custom emblem (optional)
4. Use the `collections` field to cross-reference related content (enables RelatedContent component) — this is the way to relate notes to each other (e.g. the six Japan notes threaded via `collections: ["japan"]`). Notes/showcase have no `tags`; only shelf entries take a `tags` array (displayed on shelf cards/detail)
5. Set `draft: true` while working, remove for publishing
6. For shelf entries: Set `isFavorite: true` to mark the entry as a curated highlight — on `/shelf` it renders at the large wall tier with a gold ring + hard gold shadow and a `★` prefix in its title plate (see Shelf Page Features; optional, defaults to false)
7. Run `npm run build` to validate schema

### Content Type Guidelines
- **Shelf**: All reviews, consumption logs, and inspirational content (anime, manga, film, series, music, book, game, character, other)
  - Set `isFavorite: false` (or omit) for reviews/notes that appear only in /shelf
  - Set `isFavorite: true` for curated highlights — large wall tier with a gold ring + hard gold shadow on `/shelf` (see Shelf Page Features)
- **Notes**: On-site essays, reflections and notes. Keep original publication/edit dates; see Writing above.
- **Showcase**: Project inquiries and experiments
- **Now**: Current focus snapshots (time-based)

## Code Style Notes

- Prefer editing existing components over creating new ones
- Maintain P4G aesthetic (gold accents, bold typography, dark backgrounds)
- Use existing CSS variables rather than hardcoded values. Specifically: gold and
  live-red alpha values are `rgba(var(--color-gold-rgb), a)` / `rgba(var(--color-live-rgb), a)`
  — the raw triplets appear only in `global.css`, which defines them; near-black
  greys come from `--color-surface-1/2/3` and text greys from
  `--color-text-muted` / `--color-text-subtle`; page and panel headings use
  `--text-page-title` / `--text-panel-title`; and the five stat hexes live only
  in `STAT_COLORS` (`src/utils/sessions.ts`)
- `aria-current` is `"page"` or absent — never `"false"` (AT reads the attribute's
  presence, and `"false"` is a token, not an absence)
- Micro-caps letter-spacing is `--tracking-label` or `--tracking-wide` — nothing
  else. The old bento homepage carried eight ad-hoc values
  (.06/.08/.1/.12/.14/.16/.18em) on what is visually one thing: a small
  uppercase mono chip
- There is no LIVE badge on the site any more. Both treatments
  (`.st-live-badge` on the About tile, `.yt-tile__live-badge` on the YouTube
  tile) went with the homepage rewrite, along with the `live-badge-breathe`
  keyframe; `--color-live`/`--color-live-rgb` survive as tokens and are still
  the right colour if a live indicator comes back. The lesson that put them on
  one shared rule still holds: two surfaces that can be live in the same moment
  must not disagree about what "live" looks like
- Follow stagger animation pattern (50ms-100ms increments) for lists and grids
- Keep components minimal and composable
- Use `collections` field for cross-referencing content (enables RelatedContent component)
- EmblemCards should use 63:88 aspect ratio (standard card dimensions)
- Logo tiles use 48x48px SVG logos with hover effects (gold border + glow + translate)
- Respect `prefers-reduced-motion` in all animations
- Use `requestAnimationFrame` for smooth JavaScript-driven animations
- Client-side filtering should reset stagger animations on filter change
- `.media-card` has `animation: card-in ... fill-mode: both`; use `filter: opacity(N)` not `opacity: N` to dim cards — plain `opacity` is overridden by the animation after it completes. Sharper version of the same trap: `both`/`forwards` keeps outranking `:hover`/`:focus-visible` forever, not just at the moment it completes — when a fill only exists to hide an element through its stagger delay, use `backwards` instead (`.shelf-card`'s entrance)
- `border-color` on `.media-card` is dead CSS — the actual card border lives on `.media-card__poster`; target that child for border effects
