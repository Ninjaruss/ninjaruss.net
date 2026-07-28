# Tagless Journal — Codex as the Thematic Map

**Date:** 2026-07-28
**Status:** Approved

## Problem

Tags on notes carried almost no information: `life` covered 16 of 22 notes (73%), making
the tag filter equivalent to "All". Alternatives explored (thematic tags, mode-of-writing
tags, P4G bond/archetype presentation) all reintroduce a classification duty at write
time, which fights how the site's author works (lumper; dictation-driven; hates filing).

Site-specific insight: the access jobs tags were failing at are already covered — or
better covered — by instruments the site owns.

## Decision

Remove tags entirely. Cover each access job with a dedicated instrument:

| Job | Instrument |
|---|---|
| Find a specific note | Existing search (⌘K, stripped full text) + date-sorted excerpt list |
| Browse by theme | **The Codex** — sole thematic surface (AI-derived, self-updating) |
| Wander between related notes | `collections` field + existing RelatedContent |
| Serendipity | New **"draw a card"** — random note reveal, YGO card-back flip |

Explicit calls (approved):
- Showcases lose tags too (a tag row surviving only for `web dev (2)` recreates the junk drawer).
- The draw pool is **notes only** (showcases are projects, not fate) and excludes drafts.
- The `tags` field is **dropped from the schema outright** — no deprecation period.

## Changes

### 1. Remove tags (subtraction)
- Frontmatter: delete `tags:` from all notes and showcases.
- `src/content/config.ts`: remove `tags` from `sharedSchema`.
- Journal filter UI: remove the tag pill row; keep search + type segmented control
  (All / note / showcase). Remove `?tags=` URL param handling (`urlState`,
  `filterEngine`, `filterUI` in `src/utils/splitView/`); unknown params fall back to
  the unfiltered list, so old `?tags=` links degrade gracefully.
- Entry display: remove `TagList` chips from entry headers (`EntryHeader.astro`);
  delete `TagList.astro` if nothing else consumes it.
- Tests: update filter tests — tag filtering removed, type filtering stays.

### 2. Promote the Codex to official map (one link)
- Journal split-view placeholder (the build-time stats screen) gains a
  "browse by theme → CODEX" line linking to `/codex` (via `placeholderStats` or
  adjacent markup in `SplitViewLayout.astro`).
- No other Codex changes. Workflow: run `npm run codex` occasionally; review the
  `codex.json` diff before committing.

### 3. Thread real clusters via collections (editorial, no code)
- Add `collections: ['japan']` to the six Japan notes (Reason for Japan, Japan's
  Special Aura, JP Journal, Vibe Learning, Real Weeb, Waifus).
- Thread other clusters only when genuinely felt — lazy, opt-in, never mandatory.
- RelatedContent already renders these links; no code changes.

### 4. Draw a card (the one addition)
- Desktop: a deck rendered with the existing YGO card-back asset sits in the journal
  placeholder panel. Click → 3D flip (reuse EmblemCard's flip animation) reveals a
  random non-draft note's emblem + title; click-through opens the entry via the
  normal split-view `loadContent` path.
- Mobile (≤900px): the placeholder is hidden, so render a small "DRAW" control near
  the search bar that navigates to a random note.
- `prefers-reduced-motion`: instant reveal, no flip.
- Draw pool test: notes only, drafts excluded.

## Non-goals

- No Bonds/rank UI (dies with tags; accumulation framing lives in the Codex
  loose-threads tray and the novel rain gauge).
- No new Codex features, no nav changes, no schema additions.
- No curated ordered reading routes (revisit only if a real sequence emerges).

## Verification

- Full vitest suite + build green.
- Live checks (desktop + mobile): journal filter row shows search + type only; no
  tag chips on entries; codex link present in placeholder; draw works on both
  layouts and respects reduced motion; old `/journal?tags=life` URL degrades to
  the plain list.
