# Remember Rain — development registers

Working files for the Remember Rain development space in the DeepSeek Harness.
This folder is the space's **durable memory**; the chat is not.

## What lives here

| File | Role |
|---|---|
| `findings.md` | The live register. Every finding, with status. Findings are added and superseded, never deleted. |
| `decisions.md` | The author's rulings. Dated, with reasoning and the documents each one changes. |
| `audits/` | Dated audit reports. Immutable once written — a later audit supersedes, it does not edit. |
| `proposals/` | Drafted fixes awaiting a ruling, with text ready to paste into Scrivener. A proposal is not a decision, and its draft text is not canon until the author pastes it. |

The rules the space works by — source of truth, evidence requirements, finding
format, handback contract — live in the space charter at
`src/content/novel/AGENTS.md`, which the harness loads automatically for any
session rooted in the story folder.

## Why this folder is outside the export

The story folder `src/content/novel/` is a Scrivener compile target. Anything
written there is at the mercy of the next export, so all durable work lives here
instead, at the repository root.

**One exception, and it is deliberate:** the charter itself must sit at
`src/content/novel/AGENTS.md`, because the harness loads workspace instructions
from the session's own directory tree. That placement is also what gives the
space a story-only context — the instruction loader ranks the most specific file
first and drops broader files whole, so this one file displaces the repository's
77 KB of site-development notes.

**If an export ever deletes it**, restore with:

```bash
git checkout -- src/content/novel/AGENTS.md
```

That only works once the file is committed. If it is not yet committed and the
file is gone, tell the agent in a session — the charter is regenerable from this
folder's description of it.

## How a session here should go

1. Read `decisions.md`. A question already ruled on is settled; re-raising it
   wastes attention.
2. Read `findings.md` for what is open.
3. Do the work against the story files, citing `file:line`.
4. Append new findings to `findings.md`; write the raw report to `audits/`.
5. Hand back Scrivener-ready replacement text for anything the author accepts,
   and record accepted rulings in `decisions.md`.

## A note on what this space is not

The story is written in Scrivener. This space refines and interrogates material
that already exists — it does not draft the manuscript, and it does not invent
canon to fill a gap. A gap is a question for the author.
