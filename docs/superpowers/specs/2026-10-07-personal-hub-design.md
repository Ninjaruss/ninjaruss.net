# Personal hub — design exploration

Date: October 7, 2026
Revised: October 8, 2026 — retain the original full-width Traces bar and restore
illustrated surfaces, texture, posters, atmosphere, and asymmetric composition.
Status: personal hub, retained bento grid, and roughly equal main pursuits chosen.
The concrete revised arrangement and introductory wording remain proposals.

## Current direction — balanced bento

The author asked to retain the bento grid and chose roughly equal weight for
Writing, Videos, Projects, and Remember Rain. This supersedes the writer-led
headline and the earlier focused-menu recommendation below.

- Introduction: Ninjaruss wordmark, existing motto, a short orientation sentence,
  and clearly visible About/contact links. A gold frame and hard shadow reconnect
  it to the original title tile. No pursuit leads the headline.
- Traces: keep the original narrow full-width guestbook bar directly beneath the
  introduction. Show the personal name alongside a plain Guestbook label, with a
  clear Leave a trace action. The preview shows the existing invitation state;
  it contains no invented visitor messages. Actual message presentation should
  remain readable and visitor-controlled if browsing/rotation is offered.
- Main grid: four tiles with equal desktop footprints and heading scale. Gold
  Writing/Remember Rain panels sit diagonally opposite dark Videos/Projects
  panels. This color arrangement is proposed; equal prominence is established.
- Each tile has a distinctive interior suited to its content: article links,
  channel image, project summaries, or a novel premise/status. The image is kept
  subordinate to the channel description rather than dominating the page.
- Now and Shelf form a smaller supporting row; social links sit below. Traces
  is no longer duplicated as a tile in that row.
- Mobile stacks complete tiles with wrapping labels and visible destination
  links. No rotating content, neighbor dimming, or required hover.

The newest proposal is shown in thread-scoped `illustrated-bento-hub.html`.
The author found the equal rectangles too visually plain and asked to see an
evolution of the original. The revised design uses the original channel artwork,
Shelf poster assets, project emblems, background dots, hard shadows, angled tabs,
and static rain/mist. Paired 5/7 and 7/5 column spans give the four main pursuits
comparable prominence without requiring identical rectangles. Shelf/Now use 8/4.
The original image framing is preserved at 16:9. Native links remain visible.

The brief orientation sentence and some descriptive UI wording remain proposals.
Rain is static in this preview; animation is not required to convey atmosphere.
The Traces bar shows the invitation state, not fabricated guestbook entries.
Message browsing behavior still needs a concrete implementation decision.
Earlier `bento-personal-hub.html` and `personal-hub.html` are retained as
exploration, not as the current recommendation. No production change was made.

## Purpose

Introduce Ninjaruss briefly and offer understandable routes into writing, videos,
projects, and Remember Rain. Keep Now, Shelf, and Traces as secondary destinations.
Use the existing site language rather than a new identity system.

## Visual plan

Palette: existing gold #ffe52c, black #000000, deep background #0a0a0a, raised
surface #181818, primary text #f5f5f5. The preview uses #b8b8b8 supporting text
and #505050 separators; implementation should use appropriate existing semantic
tokens, verified against their actual backgrounds.

Type: Archivo Black for the wordmark and section headings; Syne for prose and
navigation. Left alignment throughout. Gold identifies selected choices and
actions. Unselected choices remain readable. Angular selection and italic display
headings preserve the menu language. No automatic cycling or neighbor dimming.

The generic portfolio treatment was rejected in planning: no job-title pitch,
services grid, statistics, or identical project cards. The existing desire to be
a writer and the site's varied pursuits provide the content structure.

## Earlier arrangements — superseded exploration

**Focused menu (recommended for identity continuity)**

Introduction → left menu / right preview → Now, Shelf, Traces → quieter social links.
Writing is the default preview. Choosing another category changes its preview
without navigating; a clearly named action opens the actual destination. Mobile
stacks the preview under a wrapping two-column menu. Selection is explicit, with
no disappearance of the other choices.

This retains the game-menu feeling but asks visitors to select a category to see
its fuller explanation. Implementation needs progressive enhancement: the routes
must remain available without JavaScript. The preview's buttons demonstrate the
selection, not the final no-JS architecture.

**Open overview (recommended for immediate discoverability)**

Introduction → gold writing field beside always-visible videos, projects, and
Remember Rain routes → secondary destinations. Mobile becomes a single column.
It takes fewer interactions to understand the range but has less of the active
menu experience and a longer mobile page.

## Copy provenance

- “What I actually want is to be a writer” came directly from the existing About
  content. It is no longer the proposed homepage headline following the choice
  to give the main pursuits roughly equal prominence.
- “In spite of it all…” remains the existing motto.
- “Writing, videos, Japanese, and things I build along the way” is proposed
  orientation copy, not approved author wording.
- Article titles/excerpts, project names, and the Remember Rain description derive
  from existing site material. No story content was authored or edited.
- Now's September 2026 date reflects the reviewed update, not an assertion that
  the author's circumstances are unchanged. Do not infer Japan arrival status.

## Access and behavior

Use normal pointer behavior and visible focus. No looping motion, link rotation,
or dimming. Main controls meet 44px minimum height. Labels wrap at narrow widths.
Off-site destination names identify Substack, YouTube, and Twitch. In production,
preserve native modified clicks, browser history, semantic navigation and a
meaningful h1; implement a robust responsive/no-JS flow.

The earlier focused-menu preview announced selection with a polite live region.
The current bento uses native links and requires no panel-selection announcement.

## Checkpoint

October 8, 2026 — implementation authorized by the author.

Chosen: illustrated asymmetric bento hub; roughly equal prominence for Writing,
Videos, Projects, and Remember Rain; framed wordmark, original channel artwork,
Traces bar, project emblems, Shelf posters, dots, hard shadows, and static rain.
The latest source-checked synopsis is approved, using “accepting them comes at a
cost” rather than implying every refuge explicitly asks for a surrender.

Implemented in `src/pages/index.astro`: native destination links, latest three
Substack posts with a feed-failure fallback, separate YouTube/Twitch actions,
the approved novel synopsis, two featured projects, Shelf, dated Now link, and
About/contact. Homepage automatic rotation, hover-only content, tile entrances,
and neighbor dimming are removed. Uses the existing BentoGrid, BaseLayout,
fonts, colors, and shadow tokens. Story source and compiled novel content are
untouched. The guestbook invitation links to the existing full guestbook.

Checked: 216 tests pass; initial production build passes. Running Astro page
loads all seven images, reflows without horizontal overflow at 320px and 768px,
provides at least 44px-tall link targets, and shows keyboard focus on the skip
link. Novel link reaches `/novel`. Traces link reaches `/traces`, but the local
page errors because its database connection string is absent, so submission is
not verified. Final production build and diff whitespace check pass after the style corrections.
At 1280px, viewport and document widths both measure 1280px; all tiles remain
fully opaque with no entrance animations. About me receives a visible 3px gold
keyboard outline. Desktop and 320px screenshots were inspected.

Next: review the local implementation. No deployment
or Git push has been performed.

October 8 follow-up: the author found the full synopsis too long for a new
visitor. The homepage now shows a 44-word introduction and retains the approved
full synopsis in a native details/summary disclosure. It works without JavaScript
and keeps the novel destination available while collapsed. Verified mouse
expansion and Space-key collapse with visible focus, 320px reflow without
overflow, desktop appearance, 216 passing tests, production build, and
`git diff --check`.

October 8 interaction follow-up: author requested consistent tile flair. All hub
tiles and the Traces bar now lift 3px, strengthen the hard shadow, and highlight
the border on mouse hover or visible keyboard focus within. The corner cut
changes to gold (black on the gold Writing tile). Neighbors remain fully opaque.
Hover movement is limited to fine pointers; reduced-motion disables movement
and transitions while preserving the border/shadow selection. Browser verified
hover lift, black Writing border, all neighbor opacities at 1, and keyboard
selection of the YouTube artwork. Tests (216), build, and whitespace check pass.

October 8 simplification: author found the full-synopsis disclosure redundant.
Removed it; the short premise and Explore Remember Rain link remain. The longer
approved copy remains in conversation/design history, not duplicated in the tile.

Final delivery: author requested a push. Homepage plus this design record and
the accessibility review are the commit scope. Latest verification: 216 tests,
production build, whitespace check, and inspected running homepage pass.
Unrelated AGENTS.md, Remember Rain working material, and .DS_Store edits remain
outside the commit. Production deployment is not yet verified.
