# remember-rain

A plugin for working on **Remember Rain**, the visual novel, without losing work.

## The problem it solves

Remember Rain is authored in Scrivener. The site's copy at `src/content/novel/`
is **compile output** — Scrivener overwrites it on every export.

So every AI-assisted edit made to `src/content/novel/**` is a booby trap: it
looks like a normal repo edit, it builds, it deploys, and then the next export
replaces it with the author's older Scrivener text. No conflict, no warning.

This has already happened. When this plugin was written the export was **4,607
words behind the package** in scene prose, because scenes had been drafted in
Scrivener after the last export.

The package itself is fully machine-readable, and this plugin reads and writes it:

| What | Where |
|---|---|
| Binder tree, titles, order, labels, statuses | `Remember Rain.scrivx` (XML) |
| Document bodies | `Files/Data/<UUID>/content.rtf` |
| Index-card briefs | `Files/Data/<UUID>/synopsis.txt` |

## What it adds

**Two skills.**

- **`scriv`** — the bridge. Read and write the package; knows the scene-handle
  convention, the prose format, the label states, and the source-of-truth rule.
- **`scene`** — the drafting companion. Assembles the brief for one scene card
  from the card's own synopsis plus The Spine and the law documents, and carries
  the drafting protocol (one card forward, the stuck ladder, `{TK}`).

**One script**, `scripts/scriv.py` — Python 3, standard library only, macOS
(it uses `textutil`, Apple's own RTF parser, the same one Scrivener uses).

## Install

Repo-local, so it travels with the project. Point a harness at it:

**Codex** — add `plugins/remember-rain` as a marketplace source, or symlink the
skills into `~/.codex/skills/`:

```bash
ln -s "$PWD/plugins/remember-rain/skills/scriv" ~/.codex/skills/scriv
ln -s "$PWD/plugins/remember-rain/skills/scene" ~/.codex/skills/scene
```

**Claude Code** — same idea, under `~/.claude/skills/`.

The script needs no install; the skills tell the agent to call it.

## Usage

```bash
S=plugins/remember-rain/scripts/scriv.py

python3 $S doctor                        # health, counts, is Scrivener open?
python3 $S list --arc "Arc 2"            # every scene card and its state
python3 $S brief "Arc 2 - Mirror/1 The open door"
python3 $S next                          # next unwritten card, spine order
python3 $S write "<card>" --from draft.md --label Drafting
python3 $S synopsis "<card>" --from brief.md
python3 $S label "<card>" Drafting
python3 $S backups                       # list backups
python3 $S restore 0 --yes               # revert to a backup
```

Override the package location with `--project` or `$RR_SCRIV`.

## Why it is safe to let this write

Every mutating command, in order:

1. **Refuses while Scrivener is running.** Scrivener keeps the binder in memory
   and writes it out on save, so a change made underneath it is discarded or
   corrupt. There is no override, on purpose.
2. **Duplicates the whole package** (1.5 MB) into `Scrivener Backup/` first.
3. **Verifies its own write** by decoding the result back through `textutil` and
   comparing it to the intended text. On any mismatch it restores the original
   and fails.

Verified against the real package: the RTF writer preserves each document's own
font, tab stops and margins, and round-trips byte-exactly for ASCII, curly
quotes, em-dashes, braces, backslashes, CJK and astral emoji. Package structure
is byte-identical apart from the intended file.

The tool deliberately has **no command to add, rename, move or delete cards**.
Structural changes belong in Scrivener's UI, by the author.

## Important

Writing into the package does **not** update ninjaruss.net. The author still
re-exports from Scrivener. Any agent finishing a write should say so rather than
claim the site has changed.

## Layout

```
plugins/remember-rain/
├── .codex-plugin/plugin.json     Codex manifest
├── .claude-plugin/plugin.json    Claude Code manifest
├── skills/scriv/SKILL.md         the bridge
├── skills/scene/SKILL.md         the drafting companion
└── scripts/
    ├── scriv.py                  the CLI
    └── scrivlib.py               package I/O and the safety model
```
