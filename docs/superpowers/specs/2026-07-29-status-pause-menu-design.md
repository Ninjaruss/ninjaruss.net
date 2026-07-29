# Status Page — "The Pause Menu" Design

**Date:** 2026-07-29
**Status:** Approved pending user review

## Problem

Russ wants to progress Japanese and writing (Remember Rain), but experiences no
emotional momentum *during* the work — "the good feelings I should be getting are
delayed and received in hindsight" (notes/loser-behavior). The avoidance pattern
defers small mundane actions (notes/avoidance). Classic gamification (points,
streaks, XP) is explicitly rejected: it is extrinsic, and the research says it
erodes exactly the intrinsic ownership he prizes (notes/subtle-progress rejects
the "Geass" fix for the same reason).

Target chosen: **momentum in the moment** — the process itself starts paying off
at the time of doing, not in hindsight. Secondary: an outward identity artifact
others can see.

## Research grounding (what the design must honor)

1. **Overjustification effect** — Deci, Koestner & Ryan 1999 meta-analysis
   (128 studies): expected/contingent tangible rewards undermine intrinsic
   motivation (d ≈ −0.28 to −0.40). → No points-for-action, no streaks, no
   unlockable rewards.
2. **Informational vs. controlling feedback** (Cognitive Evaluation Theory):
   feedback that reflects already-chosen action and signals competence *enhances*
   intrinsic motivation. → Everything on screen is a mirror of choices already
   made; nothing dangles a future reward to compel action.
3. **Implementation intentions** — Gollwitzer & Sheeran meta-analysis (94 tests,
   d = 0.65): pre-deciding when/where/how dramatically improves initiation and
   shields against distraction. → The pre-session intention ritual is the
   system's primary engine, not decoration.
4. **Flow preconditions** (Csikszentmihalyi): clear proximal goal + immediate
   feedback + challenge-skill balance. → Intention supplies the goal; the
   completion ritual supplies immediate feedback.
5. **Fogg / Tiny Habits "Shine"**: habits wire via immediate *felt* positive
   emotion, not repetition. The celebration must be bodily and instant — a UI
   animation is only a cue, never the reward itself.
6. **Progress monitoring** — Harkin et al. 2016 meta-analysis (138 studies):
   monitoring promotes attainment, strongest when *physically recorded* and
   *public*. → Sessions are logged as committed markdown and rendered publicly.
7. **Rumination hazard** — Trapnell & Takahashi line: self-reflection predicts
   self-rumination, which cancels reflection's benefit. Russ's profile (shadow
   self-doubt, avoidance) is high-risk. → All reflection is bounded, batched,
   and must terminate in exactly one next step.
8. **Observation/choking**: being watched impairs complex unfamiliar tasks.
   → Sessions are the unit, streaming is optional flavor, never the frame.

## Design principles (invariants)

- **Mirror, not machine.** The system reflects; it never compels. No directive
  it issues can originate outside Russ's own written quests.
- **No shame states.** Stats never decay. No "days since," no calendar heatmap,
  no red absence indicators. (Same invariant as the novel rain gauge.)
- **Reward is felt, then echoed.** The real reward is the physical celebration
  at completion; the logger flourish is a cue; the site's stat tick is an echo.
- **Reflections are footnotes to action, not monuments.** Bounded, batched,
  end in one next step, displayed adjacent to the action they advance.
- **The system must earn its UI.** No visual investment until the loop proves
  it creates momentum (Phase 0/1 gate).
- **48-hour test.** Any active quest must be startable within 48 hours.
  Unfalsifiable life-questions are epigraphs, not quests.

## Core loop

1. **Intention (start, ~10s).** Name one implementation intention ("after
   lunch, I read Wagotabi 20 min at my desk"). Optionally drawn from the quest
   idea pool. Phase 0: spoken/written by hand. Phase 1: `mirror start "..."`.
2. **Do the work.** Nothing watches. Streaming optional.
3. **Celebration (end, instant).** Physical, genuine (Fogg's Shine). Paired
   with one keystroke: `mirror done "rough one-liner"` — appends the raw line
   to a local sessions file and plays the rank-up flourish (audio + terminal
   flourish) as the cue.
4. **Mirror (batched, every few days, deliberate ritual).**
   - `npm run mirror:export` → writes `mirror-prompt.txt`: recent raw session
     lines + quest menu + strict output contract (per-session stat tags,
     summary, a 2–3 sentence bounded reflection ending in exactly one next
     step; anti-rumination rules baked into the prompt).
   - Russ pastes into DeepSeek chat (or any chatbot), copies the JSON reply.
   - `npm run mirror:import` → validates against schema, writes
     `src/content/sessions/*.md` entries, updates quest state. Reviewed via
     `git diff`, committed. Identical trust model to the codex manual mode.

No API keys, no local model, no cost. Model-agnostic by construction.

## Rename

- Collection `stream` → `sessions`. Existing entries gain `streamed: true`.
  Schema: existing stream fields + optional `streamed` (bool, default false),
  optional `reflection` (string, the bounded mirror synthesis), optional
  `nextStep` (string), optional `quest` (string ref).
- Page `/stream` → `/status` with 301 redirect (site convention). NavPill item
  "Stream" → "Status".
- Homepage stream tile → Status tile (donut stays; red live-pulse stays for
  actual live streams).
- `_quests.md` stays the quest source of truth, structured as: Epigraph, Active
  (max 3), Ideas per stat, Completed (append-only, dated).

## Stats model

The existing five stats are kept verbatim: Determination, Insight, Expression,
Sincerity, Chaos. Tally/log-scale logic in `src/utils/stream.ts` (to be renamed
`sessions.ts`) is unchanged. Additions:

- **Named ranks:** 5 ranks per stat, thresholds on the log-scaled value at
  even quintiles (>0, ≥20, ≥40, ≥60, ≥80 of the 100 ceiling). Rank names are
  authored by Russ in `src/data/ranks.json`; until authored, bars render
  without rank names — no placeholder words.
- **No visible raw numbers by default**; counts available on hover/tooltip.
- **No decay, ever.**

## `/status` page layout (Phase 2)

Top-to-bottom, P4G vocabulary throughout (`p4g-tab`, `p4g-heading`, angled
cuts, gold/black):

1. **Epigraph strip** — tab `THE QUESTION`, the singular-goal question set as a
   chapter title. Not a task; no checkbox.
2. **Portrait row** — left: existing radar chart; right: five stats
   Persona-style (stat name, rank name, thin log-scaled bar).
3. **Active quests panel** — max 3 angled cards: quest text, stat chip, and the
   latest mirror `nextStep` pinned to the quest it advances. Collapsed idea
   pool per stat below.
4. **Session log** — reverse-chron: date, one-line summary, stat chips,
   `streamed` badge, `memorable` line. Click opens entry (existing pattern).
5. **Completed quests shelf** — permanent, append-only, dated. Bottom of page.

Reflection text (`reflection`) renders inside its session entry only.
`nextStep` renders on the quest card only. Nothing reflective gets a permanent
prominent surface.

## Phases (strict gates)

- **Phase 0 — today, zero code.** Intention ritual + physical celebration +
  rough line appended to a plain text file by hand. Starts immediately; nothing
  blocks on implementation.
- **Phase 1 — the loop (a day or two of build).** `mirror` CLI (`start`,
  `done` with flourish), `mirror:export` / `mirror:import` scripts, collection
  rename + schema additions, minimal quest-state handling. No visual work
  beyond what the rename forces.
- **Gate:** run the loop ~2 weeks. If it demonstrably creates momentum,
  proceed. If not, revisit — do not build the UI as consolation.
- **Phase 2 — the status screen.** `/status` rebuild per layout above, rank
  names authored, homepage tile update.

## Error handling

- `mirror:import` validates strictly (zod, like codex): malformed model output
  is rejected with a readable error; nothing is written on failure.
- Unknown stat names in model output are dropped with a warning (existing
  `tallyStats` behavior already ignores unknowns).
- The site build must succeed with zero sessions, missing ranks file, or
  missing quest sections (empty-state rendering, same tolerance as codex).

## Testing

- Rename preserves all existing `stream.ts` unit tests (retargeted to
  `sessions.ts`).
- New pure-logic tests: quest menu parse (extended structure), rank threshold
  mapping, import validation (accept/reject fixtures), export prompt assembly.
- Page-level: `/status` renders with fixtures; `/stream` 301s.

## Non-goals

- No XP, levels, streaks, deadlines, daily quests, or completion percentages.
- No local model / Ollama / API integration (manual paste workflow only).
- No automatic capture from apps (Anki/Migaku etc.) — out of scope.
- No changes to the novel, codex, shelf, or journal systems beyond the tile.

## Addendum (2026-07-29): Button-based loop — Mirror strip

Approved extension: the loop must be operable without typing terminal commands.
Two surfaces, one physics constraint: the live static site cannot write to the
repo, and localStorage on ninjaruss.net is a different bucket than localhost.
The bridge is clipboard, not a backend (consistent with the codex trust model;
no auth, no server state).

**Live ninjaruss.net/status — capture + celebration (works on phone):**
- Mirror strip with: ▶ Set intention (prompt → localStorage line, exact
  mirror-log.md format), ★ Session complete (prompt → localStorage line +
  the flourish: P4G gold sweep + rank-up sound, WebAudio-synthesized — the
  celebration cue now fires where the user is), ⧉ Copy log (clipboard, then
  offers clear). Each visitor's localStorage is their own; strangers only ever
  write to their own browser. No data leaves the device.

**Local dev localhost:4321/status — the file-writing panel:**
- Same strip, plus dev-only powers via Astro API routes (`prerender = false`,
  handlers return 404 unless `import.meta.env.DEV`):
  - logging buttons write directly to `mirror-log.md`
  - paste box: merge phone-copied log lines (validated by `parseLogLines`,
    deduped exact-line)
  - Copy DeepSeek prompt (same export logic + mark file, to clipboard)
  - Paste DeepSeek reply (same `validateMirrorResponse`, writes session files,
    shows what was written; git diff review unchanged)
- `Mirror.command` double-clickable launcher (starts dev server if needed,
  opens /status) so "go to the site" is one click.

The CLI remains as plumbing; scripts and API routes share the same extracted
core (single source of truth for export/import/append file operations).
Component isolation: the strip is one self-contained `MirrorStrip.astro`.
