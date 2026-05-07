# Quests File — Move to /content/stream/

**Date:** 2026-05-06

## Problem

`quest-menu.md` lives at `src/content/quest-menu.md` (content root) and is read via `readFileSync` with a hardcoded path. It should live alongside the stream content files in `src/content/stream/` for easier editing.

## Constraint

Astro's content collection system validates every `.md` file in `src/content/stream/` against the stream schema (title, publishedAt, stats, summary, memorable). The quests file doesn't match that schema.

## Solution

Name the file `_quests.md`. Astro automatically excludes `_`-prefixed files from content collection indexing — no schema changes, no filter logic, no frontmatter required.

## Changes

1. **Move file**: `src/content/quest-menu.md` → `src/content/stream/_quests.md`
2. **Update path**: `stream/index.astro:64` — change `readFileSync` argument from `'src/content/quest-menu.md'` to `'src/content/stream/_quests.md'`

## Non-changes

- `src/content/config.ts` — untouched
- Stream collection queries — untouched
- `parseQuestMenu` utility — untouched
- All existing stream session log files — untouched
