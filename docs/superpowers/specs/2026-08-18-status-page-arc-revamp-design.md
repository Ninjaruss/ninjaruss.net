# /status: Kill the Pause-Menu Log, Rebuild as a Persona Arc Card

**Date:** 2026-08-18
**Status:** Approved (brainstorm walkthrough with Russ, incl. visual companion mockups)
**Supersedes:** `2026-07-29-status-pause-menu-design.md` and `2026-08-03-status-protagonist-redesign-design.md`. Those specs' design invariants that still apply — stats never decay, no streaks/shame states, no absence counters — remain in force and are restated below. Everything else in those specs (the four-screen pause menu, the Log screen, the stat radar, the Quests board UI, the Bonds detail-panel screen) is retired by this spec.

## Why

The pause-menu `/status` required a hand-written markdown session log after every
stream to stay current, and it stopped being kept current — the log became homework
competing with the actual work (writing, Japanese practice) it was meant to reflect.
Rather than trying to lower the friction of that loop again, this spec removes the
loop entirely and replaces `/status` with something smaller: a viewer-facing page
built around the site's real narrative premise (livestreams as episodes in a real
person's "Persona protagonist" life) instead of a maintained stat sheet.

Reframed audience: viewers, not Russ. The page's job is "what chapter of his life is
this, and what's he currently deciding" — not "how many sessions has he logged."

## Part 1 — Kill scope

Delete entirely:

- The pause-menu frame: left-column Status/Log/Quests/Bonds menu, hash routing
  (`/status#log` etc.), the no-JS stacked fallback for that frame, mobile tab-row
  behavior for it.
- The **Log** screen and everything that renders individual `sessions` entries.
- The **Quests** screen (the rendered board — see Part 2 for what of `_quests.md`
  survives as a *data source*, unrendered as a full board).
- The **Bonds** screen (the interactive S.Link detail-panel view).
- `status.css`'s pause-menu chrome (frame, menu, screen-switch styles, radar,
  donut, log entry, quest card, bond panel styles).
- From `src/utils/sessions.ts`: `tallyStats`, `buildRadarPoints`, `buildGuidePoints`,
  `applyLogScale`, `scaleAllTallies`, `parseStreamIdeas`, `parseQuestFile`,
  `parseQuestMenu`, `buildDonutArcs`, `computeLevel(totalSessions)`, `STAT_ORDER`,
  `STAT_ADJECTIVES`, `STAT_PHRASES` — and any other export that exists solely to
  feed the screens above. Confirm via grep before deleting each export; don't
  remove anything still referenced elsewhere.

Keep, unchanged:

- `src/content/sessions/_protagonist.md` + `parseProtagonist()`.
- `src/pages/api/live-status.ts` (Twitch/YouTube live check).
- `STAT_COLORS` and the `StatName` type from `utils/sessions.ts` — still consumed
  by `scripts/transition.ts`'s per-route card-flip transition (a static route→stat
  color mapping, unrelated to session tallies) and by the new arc card (Part 2).
  If `utils/sessions.ts` ends up gutted enough that keeping the file feels wrong,
  `STAT_COLORS`/`StatName` may move to a small dedicated module — implementation's
  call, not a design requirement.
- The `social-links` collection/schema (reused in Part 2, rendered differently).
- `src/content/sessions/*.md` (the historical session log files) — left in the repo
  as an inert archive. Nothing reads them after this change. Pruning them is
  explicitly out of scope for this spec; revisit separately if desired.

## Part 2 — New `/status` page

Same URL and NavPill slot ("Status"). Single flat screen — no tabs, no hash
routing, no screen-switch JS. Top to bottom:

### 1. Identity header

Unchanged: portrait / name / epithet from `_protagonist.md`, gold-bordered frame,
quiet silhouette empty state.

### 2. Arc card (the headline)

The page's one piece of "content." Whole-card treatment, accent-colored by the
arc's stat:

- Card border, kicker background, and the "updated" stamp all use the arc's stat
  color from `STAT_COLORS`.
- An emblem badge — the existing stat PNG (`/images/emblems/<stat>.png`), sized
  ~46px, centered on a dark (`--color-surface-1`-ish) circular plate with a border
  + soft glow in the stat's color. The dark plate is required for contrast: the
  emblem PNGs are opaque-white-background line art, illegible at small sizes and
  liable to wash out against pale stat colors (Insight, Sincerity) if dropped
  directly onto the accent color.
- Kicker: "CURRENT ARC · `<STAT NAME>`" (uppercase, skewed, matches `.p4g-tab`
  vocabulary) next to/above the badge.
- Arc title (display type, e.g. "Arc II — Learning to Speak").
- "ACTIVE DECISION" label + a short prose paragraph — the current thing chat/the
  narrative is weighing. This is editorial, written by Russ; there is no live
  poll/vote integration — the "decided with chat's help" framing is narration, not
  a mechanic to build.
- "updated `<month year>`" stamp in the stat color — a fact, never "N days ago"
  (no-shame invariant carried forward).

**Data source:** a new `## Current Arc` section added to
`src/content/sessions/_quests.md`, e.g.:

```markdown
## Current Arc

**Arc:** Arc II — Learning to Speak
**Stat:** Insight
**Updated:** August 2026

Chat's split on whether Rain confronts Vesper directly or keeps stalling. Leaning
confront, after two streams of leaning that way.
```

`Stat` must be one of the five `StatName` values (case-insensitive match against
`STAT_COLORS` keys is fine; fall back to no accent color / neutral gold border if
absent or unrecognized — never a hard build error over a typo in a hand-edited
file). The existing "The Question" / "Active" / "Ideas — `<Stat>`" / "Completed"
sections stay in `_quests.md` as Russ's own private planning scaffold; **none of
them render on `/status` anymore.** A small parser (e.g. `parseCurrentArc`) reads
only the new section; the old `parseQuestFile` can be deleted once nothing calls it
(check `_quests.md`'s other sections aren't read by anything else first).

Expected update cadence: every few weeks/months, by hand — not per-stream. This is
the cadence Russ already committed to for the arc/decision text; there is no
additional logging loop introduced by this spec.

### 3. Supporting row

Two small, near-zero-maintenance items side by side beneath the arc card:

- **`LV n` chip** — plain, neutral gold, no stat coloring (this number isn't
  stat-specific). Computed at build time from total word count across:
  - the novel manuscript's story words only (`computeNovelStats(tree).storyWords`
    — outline/planning docs in Story Plan, Characters, World do **not** count), plus
  - journal `notes` + `showcase` entry body text (stripped of markdown/HTML,
    word-counted the same way `countWords` works for novel content).

  This total only grows as a side effect of writing Russ is already doing for the
  site — no new authoring, no decay, monotonic by construction. Exact curve
  (`level = floor(sqrt(totalWords / K))` or similar) and the constant `K` are an
  implementation detail to tune for reasonable early pacing; not fixed by this spec.

- **"Find me elsewhere" strip** — a compact, flat (non-interactive-detail-panel)
  rendering of the `social-links` collection: label + link per entry, no expandable
  lore/rank-gauge/arcana treatment from the old Bonds screen. Just enough to point
  a new viewer at Twitch/YouTube/Discord/etc.

## Part 3 — Homepage Stream tile

The existing dark 1×2 "Stream" tile (`#stream-tile`, links to `/status`) currently
renders a donut chart of session-stat tallies. Once sessions stop being tagged by
stat, that donut would go stale exactly the way the Log did, just less visibly.

Replace its content with:

- The existing live-now indicator (pulsing `--color-live` border when live) —
  unchanged, still fed by `/api/live-status.ts`.
- A one-line teaser of the current arc (arc title, or arc title + stat name),
  pulled from the same `## Current Arc` section in `_quests.md`, linking to
  `/status`.

Remove: `tallyStats`/`buildDonutArcs`/`STAT_ORDER`/leading-stat-adjective-and-phrase
logic currently in `index.astro` for this tile, once nothing else needs it.

## Testing

- Unit (vitest, pure modules only): a `parseCurrentArc`-style parser for the new
  `_quests.md` section (present/absent/malformed `Stat` value); the word-count
  level function (monotonicity, zero-input floor); existing `parseProtagonist`
  and novel word-count utilities remain covered and unchanged.
- Build: `npm run build` passes with the pause-menu code, `status.css`'s old
  sections, and the removed `utils/sessions.ts` exports deleted (no dangling
  imports).
- Manual: `/status` renders with a `Current Arc` section present, absent, and with
  an unrecognized `Stat` value (neutral fallback, no crash); homepage Stream tile
  shows the arc teaser + live indicator at desktop and mobile widths; the
  `/novel`-style route-based transition card effect (`scripts/transition.ts`)
  still fires correctly on navigation (regression check — it imports
  `STAT_COLORS` from the same module being trimmed).

## Non-goals

- No live poll/vote integration for "the active decision" — editorial text only.
- No revival of per-session stat tagging or a stat radar/donut anywhere.
- No changes to the `sessions` collection schema or its historical files.
- No pruning of historical `sessions/*.md` files (separate future decision).
- No changes to `_protagonist.md`'s mechanism or the live-status API.
