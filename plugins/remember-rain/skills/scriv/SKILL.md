---
name: scriv
description: Read and write the live Remember Rain Scrivener package (.scriv), which is the source of truth for the novel. Use this whenever a task touches Remember Rain content — drafting a scene, editing the story bible, checking what a card says, or mirroring a change back. Also use it to reject the common mistake of editing src/content/novel/ directly, which is compile output and gets overwritten on export. Triggers on "Remember Rain", "the novel", "the visual novel", "the novel folder", scene names (Rain, Vesper, Roxana, Claire, Shiori, the Pursuer), and Scrivener.
---

# The Remember Rain Scrivener bridge

## The rule that matters most

**`/Users/ninjaruss/Documents/Remember Rain.scriv` is the source of truth.
`src/content/novel/` in the repo is compile output.**

Scrivener exports the package into `src/content/novel/` on demand. Every export
overwrites that folder. So an edit made to `src/content/novel/**` survives until
the next export and then vanishes — silently, with no conflict and no warning.

This has already cost real work: the repo export is currently **4,607 words
behind the package** in scene prose, because scenes were drafted in Scrivener
after the last export.

Therefore:

- **Never edit `src/content/novel/**` to change Remember Rain content.** Use
  `scriv write`.
- Reading `src/content/novel/**` is fine for *site code* (Astro pages, the
  `src/utils/novel.ts` build), because that is genuinely what the site serves.
  For *story content*, read the package — it is never stale.
- Site code and story content are different jobs. Do not let one write into the
  other's territory.

## Commands

The tool is `plugins/remember-rain/scripts/scriv.py` (Python 3, standard
library only, macOS — it uses `textutil`, Apple's own RTF parser).

```bash
S=plugins/remember-rain/scripts/scriv.py

python3 $S doctor                       # health, counts, whether Scrivener is open
python3 $S list [--arc "Arc 2"] [--json] # every scene card: label, words, stub/drafted
python3 $S read "<card>"                # body + the card's index-card brief
python3 $S brief "<card>"               # assemble the drafting brief for one scene
python3 $S next                         # next unwritten card in spine order
python3 $S write "<card>" --from f.md [--label Drafting]
python3 $S synopsis "<card>" --from f.md
python3 $S label "<card>" Raw|Drafting|Done
python3 $S backups                      # list package backups
python3 $S restore <n> [--yes]          # back up current state, then restore
```

`<card>` is a UUID, a `Folder/Title` path (`Manuscript/Arc 2 - Mirror/8 The melt`),
or a title unique across the binder. Ambiguous references error rather than guess.

## The safety model

Every mutating command, in order:

1. **Refuses if Scrivener is running.** Scrivener holds the binder in memory and
   writes it out on save, so a write underneath a running app is discarded or
   corrupt. If this fires, ask the author to quit Scrivener — do not work around it.
2. **Duplicates the whole package** (2 MB) to `Scrivener Backup/` before writing.
3. **Verifies its own write** by decoding the result back through `textutil` and
   comparing to the intended text. On any mismatch it restores the original and
   fails. Nothing is left half-written.

Verified behaviour: the RTF writer preserves each document's own font, tab stops
and margins, and round-trips byte-exactly for ASCII, curly quotes, em-dashes,
braces, backslashes, CJK and astral emoji.

**After writing to the package, the author must re-export in Scrivener** for
`ninjaruss.net` to reflect the change. Say so when you finish a write; do not
claim the site has updated.

## Scene card format

Each scene card's **first line is its drafting handle**, and the card's
`Title` is deliberately human-readable so the site can display it.

| Form | Used for | Example |
|---|---|---|
| `aNsNN_slug` | spine scene N of arc N | `a2s08_melt` |
| `aNvNN_slug` | Arc 3 optional life (vignette) | `a3v02_life` |
| `aNdNN_slug` | pitfall / dead-ending card | `a4d01_commute` |

**Preserve the card's existing first line when you rewrite a body.** Read the
card before writing it; if the body already opens with a handle, keep that exact
line. Never invent or "correct" a handle — a changed handle breaks the author's
convention and the export's scene labels.

Seven cards still predate this format and open with `#### Scene: ...`,
`Context: ...`, or `[old intro]` instead. Flag them rather than silently
converting; ticket 17 owns that cleanup.

### Prose conventions (decided in ticket 03)

- **Prose first.** Write as the author already writes. An unattributed paragraph
  is Rain's interior voice and needs no markup.
- A paragraph opening with `"` is spoken aloud.
- `[lowercase_key: value]` **alone on its own line** is a stage direction. Never
  mid-paragraph.
- One idea per paragraph — the format assumes one paragraph becomes one textbox.
- `%%` at the start of a line is an author-private comment; the export strips it,
  so it never reaches the site.
- **Unresolved unknowns are `{TK ...}`** in prose (`{TK beat: they argue, she
  walks out}`, `{TK next: ...}`), never a blank and never a prose-shaped
  placeholder like `*(To be determined.)*`. `{TK` is a saved search in Scrivener.
- Base tense is **first person past**. Present tense is reserved for
  unmediated immediacy — live interior thought, and the tank/void/dilation
  sequences. It is rationed; do not let it leak.
- Second person is an absent presence addressed (Rain to the Split) plus Arc 5's
  void. Third person happens **exactly once, ever**: the Arc 5 refusal.

## Labels are the progress signal

`Raw` (grey) → `Drafting` (yellow) → `Done` (green). Set a card to `Drafting`
when it has a real body and `Done` when the author says it is finished. Do not
promote a card on your own judgement call — that is the author's marker.

## What not to do

- Do not restructure the binder, rename cards, create cards, or delete anything.
  This tool deliberately has no command for it; those changes belong in
  Scrivener's own UI, by the author.
- Do not edit `src/content/novel/**` for story content.
- Do not claim Scrivener has been opened and verified. Package-level parity is
  not the same as the app reading it back.
