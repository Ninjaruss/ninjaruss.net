# Accessibility and personality review — October 7, 2026

Assessment only; no site code or content changed.

## Judgment

Keep the gold/black palette, angular tabs, emphatic headings, personal language,
and desktop list/detail composition. The site already feels authored. Improve
the visitor's ability to understand the choices, read comfortably, and control
what happens. Accessibility does not require replacing the visual identity.

The strongest missed opportunity is orientation: the homepage names destinations
but gives limited context about the person and the work behind them. The About
page's “What I make” section already supplies useful explanations. Bring a small
amount of that clarity to the entrance, without replacing the author's voice.

## Evidence and limits

Reviewed the public homepage, Showcase list and selected entry, Shelf wall and
quick view, About, and novel landing page. Used browser accessibility trees,
screenshots, keyboard interaction, rendered CSS measurements, and relevant
source. Viewports inspected included 1440px, 390px, and 320px. The September 30
audit was read as historical evidence, not accepted as current verification.

This is a focused review, not a WCAG conformance audit. No VoiceOver listening,
full route crawl, performance benchmark, form submission, 200% text zoom, or
complete reduced-motion runtime test was performed. Reduced-motion safeguards
were inspected in source. Tests/build were not run because there was no
implementation. Existing unrelated working-tree changes were left alone.

## Fix before aesthetic refinement

1. **Shelf quick view leaks reverse keyboard focus.** Opened Persona 4 Golden
   from the Shelf, then pressed Shift+Tab on the initially focused dialog.
   Focus moved to the Yusei Fudo card behind it (`inDialog: false`). The trap
   handles the first/last child but misses the dialog container itself.
   Handle that initial focus state and make background content inert, or use
   native dialog behavior. Keep the quick-view design.
   Source: `src/pages/shelf/index.astro:751` and `:863–897`.

2. **Mobile navigation clips labels.** At 320px on About, each nav cell measured
   73.75px; the rendered “Visual Novel” span measured about 101px. The label is
   clipped by the item's overflow rule. “Showcase” is cramped too. Use a layout
   that accommodates labels (wrapping, fewer columns, or a clearly labelled
   section-menu control), rather than shrinking the text again. The existing
   44px minimum height is worth preserving.
   Source: `src/components/NavPill.astro:210` and its nowrap/overflow rules.

3. **Homepage updates need visitor control.** Latest changes its title, excerpt,
   date, image, and actual link destination every 11 seconds. No visible pause
   control was present. Traces also rotates. Reduced-motion handling exists,
   but visitors should not need to alter an OS preference to stop changing
   content. Prefer a stable Latest item or explicit next/previous controls;
   otherwise provide a persistent pause. Pausing only during focus/hover is
   useful protection but not a complete substitute for a pause control.
   Source: `src/pages/index.astro:2446–2485`.
   Standard: [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

4. **Selection dims other readable choices too far.** Settled rendered CSS
   confirmed opacity .45 plus brightness .75 on unselected homepage tiles.
   White over #111, composited onto the body's #0a0a0a, calculates to about
   2.92:1 on a flat background. Texture can change the precise pixel result.
   This is below even the 3:1 large-text threshold; smaller supporting text is
   more demanding. Emphasize selection with gold, border, arrow, or movement
   while retaining readable unselected choices. Recheck complete interaction
   states, not only resting colors.
   Source: `src/styles/bento.css:21–35`.
   Standard: [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

5. **Mobile Showcase lacks a contextual return after client selection.** On a
   fresh mobile `/showcase`, selecting Utasync hid the list and focused its h2.
   No dedicated return-to-list control appeared. The global Showcase link and
   browser Back remain routes out, so this is not a dead end. The dedicated
   back link is rendered only when the server receives `initialSlug`, which
   misses selection from the index. Update it with selection state; retain a
   meaningful accessible page heading when the list's h1 is hidden.
   Source: `src/layouts/SplitViewLayout.astro:36`, `:713`;
   `src/utils/splitView/contentLoader.ts:75`.

6. **Homepage reflow needs a targeted follow-up.** Browser measurements showed
   document scroll widths above the 320px and 390px viewport widths, varying
   with responsive layout/interaction timing. One 320px observation had the
   hero/grid extending to approximately x=467. This needs isolation of settled
   layout, entering/tilting transforms, and cycling content before choosing a
   fix. Do not conceal the symptom with global overflow clipping.
   Standard: [WCAG Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow).

## Make the site easier to enter

- **Give newcomers a small amount of context.** The wordmark and “In spite of
  it all…” express attitude, but not what someone can find here. A short
  orientation line and a visible route to About could bridge that gap. Writing,
  videos, Japanese learning, and things made are already present; the author
  should choose which relationship between them belongs at the entrance.
- **Pair personal names with clear descriptions.** Keep Shelf and Traces, but
  make “media log” and “guestbook” visible wherever the names act as navigation.
  Traces already has a useful accessible name on the homepage; sighted readers
  also benefit from that explanation. Explain that Writing opens Substack.
- **Use purposeful project summaries.** Showcase currently cuts the first
  suitable body line at 90 characters. The live list displays a raw `>` on
  L-file and a URL/mid-word cutoff on Utasync. A short authored summary and
  status would explain what each project does, while leaving the journal body
  intact. This is a presentation/content decision, not permission to rewrite.
- **Choose the novel entrance's audience.** Mobile visitors encounter
  Characters, Story Plan, and World before Script. This serves an open
  workbench. For readers, a premise, explicit work-in-progress status, and a
  “Start reading” route should precede optional planning material. If the
  workbench is deliberate, explain that expectation at the top. This review
  does not assess or modify the story; Scrivener remains its content authority.
- **Clarify Now versus Latest.** Now is a dated personal update; Latest rotates
  writing and project entries, including an older article. These are useful
  roles, but the distinction needs to be visible and Latest should be stable.

## Directions to choose, not assumptions to implement

- **Personal hub:** introduce the person briefly, then offer reading, watching,
  projects, and interests as distinct choices. Broadest welcome; no single body
  of work leads.
- **Creator entrance:** lead with one selected piece to read/watch, followed by
  the larger menu. Clear first action; curation becomes a maintenance choice.
- **Open workbench:** lead with current pursuits and works in progress, explain
  their status, then invite exploration. Strong process identity; visitors
  expecting finished work need explicit expectations.

Recommendation: start with the personal hub unless the author chooses a more
specific audience. Fix the confirmed interaction barriers first. Keep the
game-menu selection language and let quiet reading surfaces coexist with it.

## Checkpoint

Established: preserve the P4G-inspired system and split-view identity; review
scope only. Proposed: the remedies and three entrance directions above.
Completed: focused live/source review and keyboard reproduction. Unresolved:
preferred first impression; exact reflow cause; full assistive-technology and
zoom verification. Next action: choose the entrance emphasis, then implement a
bounded accessibility pass with keyboard, reflow, motion, tests, and build checks.
