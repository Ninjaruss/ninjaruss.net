# /mind — Second-Brain Encyclopedia — Design

**Date:** 2026-07-09
**Status:** Approved pending final review

## Purpose

A new site section that condenses the site's content (notes, showcase, shelf, now, novel Themes/Lore) into a wiki/encyclopedia of the author's thinking. Goal: "bring out the best of my thoughts / make things more apparent for me" — the concepts themselves, and the connections between entries, are the discovery.

## Approach

Hybrid of build-time aggregation and AI condensation:

- **Structural layer (build time, always current):** Astro resolves every factual detail — entry titles, dates, excerpts, links — live from the content collections on each build. It can never drift.
- **Interpretive layer (AI pass, run on demand):** `npm run mind` invokes the `claude` CLI headlessly to propose the concept taxonomy, assign entries to concepts, and write synthesis paragraphs. Output is a committed data file reviewed via `git diff` before commit — nothing publishes unseen.

Staleness can only ever mean "a new entry isn't filed into a concept yet" — never a wrong date, dead link, or stale excerpt.

## Data contract

`src/data/mind.json`, committed, Zod-validated at build:

```jsonc
{
  "generatedAt": "2026-07-09T00:00:00Z",
  "concepts": [
    {
      "slug": "identity",            // stable across runs where possible
      "name": "Identity",
      "synthesis": "You keep circling…",  // markdown, 2–4 sentences
      "entries": ["notes/on-discipline", "shelf/persona-4"],  // "<collection>/<slug>" refs; novel refs use "novel/<path>"
      "related": ["discipline", "japanese-study"]
    }
  ]
}
```

## AI pass — `npm run mind`

Script: `scripts/mind-condense.mjs`.

1. Gather all non-draft entries from `notes`, `showcase`, `shelf`, `now`, plus the novel's top-level `Themes` and `Lore` folders. Strip markdown to plain text (reuse `stripMarkdown`).
2. Invoke `claude -p` with structured JSON output. Prompt directives:
   - Propose **6–12 concepts** — the AI picks the natural number within the range.
   - Synthesis in **second person** ("You keep returning to…"), 2–4 sentences per concept, surfacing through-lines, tensions, and how the thinking has shifted over time.
   - Assign every entry to at least one concept.
   - Existing `mind.json` (if present) is provided so concept slugs are preserved where the concept survives — URLs stay stable.
3. Validate: every entry ref resolves to a real entry, slugs well-formed, count within range, every entry assigned. On failure, print errors and leave the old file untouched.
4. Write `mind.json`. The user reviews the diff and commits — this is the veto step.

No API key management: uses existing Claude Code CLI auth (any paid subscription or an `ANTHROPIC_API_KEY` with pay-as-you-go credits).

### Manual mode (no paid AI access required)

The CLI call is optional. The same script supports a copy/paste workflow with any chatbot (DeepSeek, free claude.ai, etc.):

- `npm run mind -- --export` — gathers the corpus, wraps it in the same prompt (JSON output format + existing concept slugs for URL stability), and writes it to a single text file for pasting into any model.
- `npm run mind -- --import <file>` — takes the model's JSON reply and runs the exact same validation as CLI output (entry refs resolve, slugs well-formed, every entry assigned, count in range). On failure it reports the specific problems and leaves `mind.json` untouched; on success it writes the file for the usual diff review.

Because validation gatekeeps and the build re-resolves all facts from real content, a sloppy free-model response can never corrupt the site — worst case is re-paste and retry. The default no-flag invocation (`npm run mind`) remains the one-command CLI path.

### Missing-synthesis fallback

A concept whose `synthesis` is empty or missing renders its excerpt timeline without the synthesis block (no error, no placeholder text). This keeps hand-edited or partially-filled `mind.json` files fully usable.

## Pages

### `/mind` (index)

- SplitViewLayout (existing pattern): left panel lists concepts with entry counts; right panel shows the selected concept detail. Auto-opens the first/most-recently-touched concept on desktop, per existing SplitView behavior.
- Unified P4G header: `MIND` tab, "second brain" kicker.
- **Loose-threads tray:** entries published after `generatedAt` that belong to no concept render as a small "loose threads (n)" section — raw material awaiting condensation, with a `npm run mind` hint. Accumulation framing only; never shows time-since-last-run or any absence/shame metric (rain-gauge invariant).

### `/mind/[slug]` (concept page)

Top to bottom:

1. Concept heading (P4G header pattern).
2. **Synthesis block** — the AI paragraph, visually distinct: gold left rule, "condensed <date>" stamp in JetBrains Mono. Honest about being a generated layer.
3. **Sources timeline** — date-sorted excerpt cards for the concept's entries, each badged with its collection (note / showcase / shelf / now / novel) and linking to the original page. Excerpts via `stripMarkdown`, resolved at build time.
4. **Related concepts** — chip row linking to sibling concept pages.

## Navigation

- **NavPill:** add MIND (7 items: Home / Journal / Novel / Shelf / Stream / Now / Mind), `match: ['/mind']` for active-state highlighting on `/mind/*`.
- **Homepage Mind tile:** 2×1 tile in a new grid row — shows concept count plus a client-side rotating synthesis line (one sentence at a time), using the Latest tile's gold-sweep cycling pattern; cycling skipped under `prefers-reduced-motion`. Exact grid placement adjustable during implementation once visible.

## Error handling

- Missing or Zod-invalid `mind.json` → build still succeeds; `/mind` renders an empty state ("the mind is unformed — run `npm run mind`"). No homepage tile crash: tile falls back to a static link.
- Entry refs pointing at deleted/drafted entries are dropped at build with a console warning.
- Draft entries are excluded from both the AI corpus and rendering.

## Testing

`src/tests/mind.test.ts` (vitest), covering pure logic kept free of `astro:content` imports (same pattern as `journalMerge`):

- Entry-ref parsing/resolution and dropped-ref behavior.
- Loose-thread detection (published-after-`generatedAt` ∧ unassigned).
- Slug-stability merge between an old and new AI result.
- Zod schema acceptance/rejection cases.

## Out of scope (possible follow-ups)

- Constellation/graph view of the concept map.
- Scheduled/CI runs of the AI pass.
- Per-concept manual synthesis overrides.
- Tuning the concept-count range as the corpus grows.

## Decisions log

| Decision | Choice |
| --- | --- |
| Condensation model | Build-time aggregation skeleton + AI synthesis layer |
| Taxonomy source | AI proposes and maintains it (committed, reviewable) |
| AI pass mechanism | `npm run mind` via headless `claude` CLI |
| Corpus | notes + showcase + shelf + now + novel Themes/Lore |
| Layout | Encyclopedia (SplitViewLayout list/detail) |
| Name | `/mind`, "MIND" |
| Nav | NavPill item + homepage 2×1 rotating-line tile |
| Concept count | 6–12, AI decides within range |
| Synthesis voice | Second person |
| Staleness signal | "Loose threads" tray on /mind |
