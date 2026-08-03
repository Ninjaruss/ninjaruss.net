# /status Protagonist Redesign + Markdown-Only Logging

**Date:** 2026-08-03
**Status:** Approved (interview + design walkthrough with Russ)
**Supersedes:** the mirror-loop portions of `2026-07-29-status-pause-menu-design.md`. That spec's design invariants (stats never decay, no streaks/shame states, quests only from `_quests.md`) remain in force and are restated below.

## Goal

Make /status feel like watching a real-life Persona protagonist's save file, with zero
clutter — and make feeding it as easy as the workflow Russ already uses for notes:
write a markdown file in VS Code, commit, done. Everything on the page must either
express accumulated progress to viewers or get out of the way. Nothing may measure
or display absence.

## Part 1 — Logging becomes plain markdown (mirror loop deleted)

The mirror loop (capture → export prompt → DeepSeek → import → commit) is removed
entirely. A session is a hand-written `.md` file in `src/content/sessions/`, exactly
like a note. The existing `sessions` schema is unchanged (`title`, `publishedAt`,
`stats`, `summary`, `memorable`, `streamed`, `reflection`, `nextStep`, `quest`,
`draft`).

### Deletions

- `src/components/MirrorStrip.astro` (and its use in `/status`)
- `src/pages/api/mirror/` (export.ts, import.ts, log.ts)
- `src/utils/mirror/` (fsOps.ts, github.ts, log.ts, prompt.ts, schema.ts)
- `scripts/mirror/` (cli.ts, export.ts, import.ts, Mirror.command)
- npm scripts: `mirror`, `mirror:export`, `mirror:import`
- `docs/mirror-setup.md`; mirror sections of CLAUDE.md
- Mirror-related tests in `src/tests/` (mirror, streamTile references to the strip if any)
- `MIRROR_TOKEN` / `MIRROR_GITHUB_TOKEN` env vars become unused (Russ removes them
  from Vercel at leisure; nothing reads them after this change)

### Additions

- `.vscode/ninjaruss.code-snippets` — a `session` snippet: expands to the full
  frontmatter skeleton with `publishedAt` defaulted to today (`$CURRENT_YEAR-…`)
  and tab-stops through `title` → `stats` → `summary` → `memorable` → `streamed`.
  Optionally a `note` snippet for notes frontmatter while we're in there.
- `src/content/sessions/_protagonist.md` — a non-collection file (underscore-prefixed,
  like `_quests.md`) holding character-sheet data Russ edits by hand:
  ```yaml
  name: NINJARUSS
  epithet: the fool who left for Japan
  portrait: /images/emblems/portrait.png   # optional; slot renders empty state if absent
  ```
  Parsed by a small pure utility (`parseProtagonist`) with tests; missing file or
  fields degrade gracefully (name falls back to "NINJARUSS", epithet/portrait hidden).

## Part 2 — /status pause-menu hub

### Frame

Full P4G pause-menu layout replacing the current single-scroll page:

- Left column: four skewed menu items — **Status / Log / Quests / Bonds** — styled
  with the existing P4G vocabulary (`p4g-tab`-like gold active state, `--skew-accent`,
  corner cuts). One screen visible at a time on the right.
- Switching is client-side; each screen has a URL hash (`/status#log`, `/status#quests`,
  `/status#bonds`; `#status` or no hash = Status). Hash updates on switch; deep links
  and back/forward work.
- **No-JS fallback:** all four screens render server-side and stack vertically; the
  menu items are plain anchor links to the sections. JS hides the inactive screens
  and upgrades the anchors to instant switches.
- Top bar: the P4G date strip showing today's date (styled like the game calendar).
  **No day counter** — deliberate: a counter measures elapsed time, not effort, and
  would be the page's only shame mechanic. Progress is expressed exclusively by
  earned things (level, XP, radar, log).
- Keep: mail strip (zero upkeep) and the live-stream indicator behavior if present.
- Reduced motion: all screen transitions honor `prefers-reduced-motion`.
- Mobile (≤900px): menu column becomes a horizontal skewed tab row above the stage;
  screens remain one-at-a-time. `--nav-clearance` bottom padding as elsewhere.

### Screen 1 — Status (the character sheet, default screen)

- **Portrait** (from `_protagonist.md`), gold-bordered frame; empty state is a quiet
  silhouette, never an error.
- **Name + epithet** — name in slanted display type, epithet as an italic sub-line.
- **Level + XP bar** — derived from total non-draft sessions ever logged (monotonic;
  never decays). RPG curve: early levels fast, later slow.
  Formula: `level = floor(sqrt(totalSessions * 4))`, minimum 1; XP bar shows progress
  from the current level's session threshold to the next, with the label
  "next: N sessions" (always forward-looking — never "days since" or "sessions
  behind"). ~30 sessions today ≈ LV 10–11. Pure function in `src/utils/sessions.ts`
  (`computeLevel(totalSessions)` returning `{ level, intoLevel, needed }`), unit-tested.
- **Current objective strip** — first Active quest from `_quests.md`
  (`parseQuestFile(...).active[0]`), rendered as a gold-edged objective banner.
  Absent Active quests → strip hidden.
- **Stat radar** — the existing radar with recent/all-time toggle and stat emblems,
  restyled to fit the sheet (geometry/utils unchanged: `tallyStats`,
  `buildRadarPoints`, `scaleAllTallies`).

### Screen 2 — Log

- Sessions newest-first as diary entries: date, title, stat badges in stat colors,
  `summary`, and `memorable` as a styled pull-quote. `streamed: true` gets a small
  `--color-live` marker. `reflection`/`nextStep`/`quest` render when present
  (reflection as body text, nextStep as a forward-pointing line).
- No pagination initially (~30 entries); revisit if the list grows past ~100.

### Screen 3 — Quests

- Rendered from `_quests.md` via the existing `parseQuestFile` (sections: The
  Question / Active / Ideas — <Stat> / Completed). Quests only ever come from this
  file — no AI, no generated quests (unchanged invariant).
- Layout: "The Question" as an epigraph at the top; Active as gold-edged quest
  cards; Ideas grouped under stat-colored headings (stream ideas live here — same
  file, same screen; `parseStreamIdeas` display folds into the Ideas grouping);
  Completed as a dimmed ledger at the bottom.

### Screen 4 — Bonds

- The `social-links` collection as an S.Link screen: name, arcana, affinity,
  rank gauge (0–5), stat-colored accent when `stat` is set, `lore` expandable
  per bond (tap/click to expand; no hover-only reveal). `img` shown when present.

### Aesthetic rules

- Reuse the existing P4G vocabulary only: gold `#ffe52c` on near-black, skew tokens,
  corner cuts, `.p4g-sweep` hover with `:focus-visible` parity. No new colors beyond
  the existing stat colors. Diagonal-language rule applies (no decorative slashes on
  single-zone panels).
- `stream.css` is rewritten (or replaced by `status.css`) for the new layout;
  homepage stream tile (`#stream-tile`) is untouched by this spec.
- No-shame invariant is a hard acceptance criterion: nothing on any screen may
  display elapsed idle time, streaks, or absence counts.

## Part 3 — Sitewide polish pass (phase 2, separate plan)

After /status ships: an audit-first sweep of home, journal, shelf, novel, codex,
and now pages. Screenshot each at desktop + mobile widths, compare against the P4G
vocabulary and the new /status quality bar, and produce a concrete fix list
(spacing, typography consistency, mobile behavior, focus states) for Russ to
approve before any changes are applied. Out of scope for this spec beyond this
commitment; it gets its own plan.

## Testing

- Unit (vitest, pure modules only): `computeLevel` curve + monotonicity;
  `parseProtagonist` (missing file/fields); existing sessions utils unchanged
  and still covered; quest parsing already covered.
- Build: `npm run build` passes with mirror code deleted (no dangling imports,
  API routes gone, env vars unread).
- Manual: /status with JS disabled (stacked fallback), hash deep links,
  reduced-motion, mobile ≤900px, empty states (no portrait, no Active quest).

## Non-goals

- No changes to the sessions schema or existing session files.
- No AI anywhere in the logging path.
- No day counter, streaks, or any absence-measuring UI.
- No homepage tile changes (stream tile stays as-is).
