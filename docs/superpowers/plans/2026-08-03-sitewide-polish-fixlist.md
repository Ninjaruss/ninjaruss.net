# Sitewide Polish — Audited Fix List (Phase 2)

Approved 2026-08-03 (all four batches). Source: read-only audit of every page at
1280×800 and 375×812 against the P4G vocabulary and the /status quality bar.
Executed batch-by-batch with per-batch review. Spec commitment:
`docs/superpowers/specs/2026-08-03-status-protagonist-redesign-design.md` Part 3.

Numbers refer to the audit findings. File:line references were verified at
commit 70f2ea7 (main); they may drift a few lines as batches land.

## Batch A — Broken (11 fixes)

- A1 (#2, P1): Homepage Latest tile "X days ago" counter (`src/pages/index.astro:437`,
  logic `:1937-1949`, styles `:572-588`) violates the no-shame invariant — replace
  with the absolute date (`formatDate(updatedAt || publishedAt)`).
- A2 (#9, P1): `/notes/*` mobile — fixed `.emblem-badge` (SplitViewLayout.astro:857-865)
  overlays prose with no inset. Give `.split-view__content .prose` right padding ≤900px
  or dock the badge in flow.
- A3 (#42/#43, P1): /status radar vertices (`status/index.astro:253`, handler `:680-688`)
  and quest idea strips (`:396`, handler `:672-677`) are mouse-only — add
  tabindex/role/keydown per the `.bond-row` pattern, with :focus-visible styles.
- A4 (#10/#11, P1/P2): /journal filter controls — type pills 112×20, search 278×28,
  DRAW 61×20, clear-all 26×26 (SplitViewLayout.astro:337-345, :301, :802, :386-396) —
  min-height 44px on all.
- A5 (#17, P2): /shelf jump bar hides 4/7 sections at 375 with scrollbar suppressed
  (shelf/index.astro:254-268) — add right-edge mask fade + scroll-snap.
- A6 (#20, P2): /shelf quick-view panel at ≤900px — full-height sheet, poster capped
  ~40vh, "Open full entry" above the NavPill.
- A7 (#23, P2): Novel reading pages — NavPill back link clipped ("MANUSCRIP") at 375
  (NavPill.astro:91, :169-176) — arrow-only cell or own row at ≤768px.
- A8 (#46, P2): /status Log screen has no filter-clear affordance — add one
  (visible when filtered, e.g. a ✕ beside the "Session Log · Stat" label).
- A9 (#1, P2): Homepage +3px horizontal overflow — `#transition-canvas` needs
  width:100%/height:100% (global.css:339-344) and buffer sized from
  documentElement.clientWidth (transition.ts:112).
- A10 (#44, P2): /status date strip is baked at build (`new Date()` in prerendered
  frontmatter, status/index.astro:122-127). Fix: render it client-side from the same
  strip markup (tiny inline update on load; keep server value as fallback text).
- A11 (#51, P2): /status mobile menu 3+1 wrap → `grid-template-columns: repeat(2, 1fr)`
  ≤900px (status.css:898-901). Also #52: `.s-toggle-btn` 23px tall / `.bd-close` 28px →
  44px targets.

## Batch B — Consistency (7 fixes)

- B1 (#34/#41): One section-label vocabulary — collapse status's three
  (.j-section-label/.s-panel-label/.q-section-label) into one shared pattern aligned
  with `.p4g-tab`; decide novel/shelf variants deliberately.
- B2 (#13): Two-tier heading scale — page title 56px / panel title 24px as tokens;
  align journal/codex/novel/shelf/now.
- B3 (#12/#28): Heading hierarchy — SplitView page title becomes h1, fetched entry
  title h2 (journal + codex outlines currently H2→H1→H2).
- B4 (#18/#48): aria-current="page" (or absent) everywhere — shelf jumpbar
  (shelf/index.astro:89, :909, selector :300) and status menu (status/index.astro:175,
  :578) currently use "true"/"false".
- B5 (#3): Homepage stream tile labels "Stream"/"Stream Log" → "Status"/"Status Log"
  (index.astro:299-306); ids/classes stay.
- B6 (#37): Stat-color table defined once (export from src/utils/sessions.ts), consumed
  by index.astro, status/index.astro (×2 copies), transition.ts.
- B7 (#35/#36 + #4): Token sweep — rgba(255,229,44,…) ×60 → rgba(var(--color-gold-rgb),…);
  rgba(255,64,64,…) → --color-live-rgb; introduce --color-surface-1/2/3 +
  --color-text-muted/dim for the off-palette greys (status.css + index.astro worst);
  fix .st-sessions contrast (#555 @9.28px → token ≥11px, ≥4.5:1).

## Batch C — Keyboard & motion (3 sweeps)

- C1 (#38): :focus-visible parity sweep — priority: bento.css tile language (50:1
  hover:focus), stream-tile stat reveal, related-card, EmblemCard, shelf hovers
  (#22), prose links. Comma-pair per repo convention.
- C2 (#16): Prose media lightbox keyboard access (mediaHandlers.ts:11/:25) — copy the
  EmblemCard pattern (role=button, tabindex, Enter/Space).
- C3 (#39): prefers-reduced-motion guards — MediaLightbox entrance, now/archive +
  now/[slug] arrow transforms, TagList, BaseLayout:93, typography.css:199.

## Batch D — Polish (rest)

- D1 (#5/#27/#30/#52): Text floors — nothing below 10px decorative / 11px functional
  (worst: .yt-tile__strip-sub 7.2px).
- D2 (#6/#19/#25/#30/#32): Remaining sub-44px targets — title-tile who?, journal tile
  rows/head/tab, shelf hero buttons + links, novel CTAs, codex chips, now-archive back.
- D3 (#45/#49/#50): Dead CSS — will-change ×3 in status.css, #vglow filter,
  .sheet-level double-skew (drop the extra skewX, keep p4g-cut).
- D4 (#40): yt-avatar.jpg 1280×720 served for 177px slot — resize/srcset.
- D5 (#24/#21/#33/#15/#14): Breadcrumb nowrap-per-crumb, shelf section count gutter,
  now date-chip clearance, list-row baseline alignment + mobile date placement,
  journal desktop placeholder duplicate card-back (drop the resting emblem card or
  the deck visual — one card back at a time).
- D6 (#8/#29/#26/#31/#47/#7): Smaller calls — corner overhang note, codex header
  chrome parity with journal, desk-index label alignment with the vocabulary,
  codex list-row geometry, no-JS bonds detail (render lore server-side, e.g.
  <details>), journal-tile div nav (leave as-is; note only).

## Deferred / decisions taken

- Status #47 no-JS bonds detail: implement server-side <details> render in D6.
- #7 journal tile div navigation: keep (inner anchors are the keyboard route).
- 1px skew subpixel on .q-section-label at 375: leave (invisible, no scrollbar).
