# Decision log — Remember Rain

The author's rulings. A finding is closed only here.

Each entry records **what was decided**, **why**, and **which documents change** —
because a decision that does not name its consequences will be silently
contradicted by the next document that was never updated.

A decision is authoritative until it is explicitly superseded. When superseding,
add a new entry rather than editing the old one.

---

## How to read this log

- **Decided** — settled. Do not re-open without new evidence.
- **Superseded by D-xxx** — replaced; follow the newer entry.
- **Provisional** — the author is trying a direction and has explicitly not
  locked it. Treat as working material, not canon.

---

## Log

### D-001 — The `.txt` sidecar synopses are drafting notes, not canon · 2026-09-16

**Closes:** F-001, F-002, F-004, F-008, F-013, F-014, F-018, F-021, F-022, F-023
(all dissolved). **Narrows:** F-006.

**Decided:** The Scrivener synopsis lines in the `<Title> MetaData.txt` sidecars
are drafting notes. They are **not set in stone and are merely examples** of what
a scene might be. They are not authoritative, they are not a canon layer, and
they do not constrain the story. Where a sidecar disagrees with a `.md` document,
**the document governs and there is no finding to report.**

Consequences applied:

- Findings whose only contradiction was sidecar-versus-document are dissolved.
  Three of them (F-001, F-002, F-004) were blocking, and two concerned the
  story's most important sentence and one of its most important scenes. They are
  not problems.
- F-006 narrows: "the System" appears in no `.md` file, so the canon conflict is
  between "the Ministry" and "Nimbus" only.
- The space charter (`src/content/novel/AGENTS.md`) asserted the opposite in two
  places — the source-of-truth list and the directory-facts list. Both corrected.
- The register's claim that the sidecars were "a second canon layer" is retracted.

**Reasoning (author's):** the synopses exist as drafting notes and are examples,
not settled text.

**What this ruling does not change:**

- The element audit is untouched. It cites no sidecar at all — all 30 of its
  findings rest on `.md` files, so nothing there was decided by this.
- Sidecars remain genuine evidence of *intent*, and a useful source of ideas. They
  are simply never evidence of canon, and never proof that the story says
  something.
- The site correctly ignores them (`parseMetaData` reads dates only). No change
  needed there.

**Standing rule for this space:** never cite a sidecar as evidence that the story
says something. Report a sidecar's idea only as a suggestion about what the plan
might benefit from — never as a contradiction.

**Status:** decided

### D-002 — Character-sheet altitude trim applied to the package · 2026-09-16

**Closes:** the character-sheet trim proposals (`proposals/2026-09-17-character-direction-lock.md`, `proposals/2026-09-17-character-sheet-trim.md`).

**Decided:** The character sheets were over-specified at mechanical altitude. The
following is applied directly to the Scrivener package (the source of truth), not
to the compile output:

- Exact heights removed from all six main character sheets. The two that carry
  function (Vesper's slightness, the Pursuer's largest silhouette) already live in
  each Visual Anchors.
- The full escalation ladders were consolidated into `World/Magic System.md`'s
  Costs section (Claire's was already there; Rain's and Roxana's were moved in so
  nothing is lost), and the sheets now point to it with one-line cost notes.
- The Pursuer's four named vapor effects (Sheath / Vent / Shape-redirect /
  Projectile defense) were compressed into one `**Vapor control**` line, and the
  "practical applications of one expression are facets of it, not separate powers"
  clarification was added to `World/Magic System.md`.

**Reasoning:** the framework was already unified; the remaining problem was
altitude, not structure. Mechanics belong in `World/Magic System.md`; the sheets
keep direction (Contradiction, Question, beats, Do Not Flatten). Applied by the
agent via `scriv.py write` with the author's confirmation; the site mirror
refreshes on the author's next Scrivener export.

**Documents to update:**
- `Characters/0 Rain` — height removed; Clone ladder → pointer
- `Characters/1 Vesper` — height removed
- `Characters/Claire` — height removed; cost bullet + escalation → pointer
- `Characters/Roxana` — height removed; Starborne ladder → pointer
- `Characters/Shiori` — height removed
- `Characters/The Pursuer` — height removed; four vapor effects → one line
- `World/Magic System` — clarification + Rain's and Roxana's cost ladders

**Status:** decided

### D-003 — Correction, the Ghost's dimming, and Claire's Imprint · 2026-09-16

**Closes:** E-001, E-002, E-012, F-005 — items 8–11 of the `Magic System` pass
(`proposals/2026-09-16-magic-system-pass.md`).

**Decided:**

- **Correction is Vesper's own faculty delivered by the water loop** (item 8,
  Branch 1). The apparatus at the caldera vents the effect into the Sacred Water
  loop, and the loop does to a district what his hands do to a person. Correction
  removes wanting, not memory; it is not reversible by him; breaking the apparatus
  stops the loop carrying it.
- **Correction does not reach Rain personally** (item 9, Branch A).
  `Story Plan/1 The Spine.md` now reads "The rain thins in corrected districts" —
  the thinning is weather and water, not the protagonist.
- **The Ghost's dimming is always Perfect Clone cost, never a pitfall countdown**
  (item 10, Branch A). `Themes and Motifs.md` now says so explicitly; the pitfall
  signal moved off brightness and onto position in `Choice Points.md`.
- **Claire's Imprint is the lens** (item 11, Branch A), patterned at the collapse —
  the same event that left her the Static. Losing the lens now costs her the
  Deviation as well as the accommodation.

**Reasoning (author's):** Branch 1 makes the antagonist and the world-damage one
thing — the city's correction is Vesper's care with no limit on its reach. Branch A
keeps Arc 4's causal chain single. The dimming ruling is the reading two of three
sources already carried. The lens-as-Imprint needs no new object.

**Documents to update:**
- `World/Magic System.md` — new `### Correction` section; the "physical world"
  exception now names correction
- `Story Plan/1 The Spine.md` — "The rain thins in corrected districts"
- `Story Plan/Themes and Motifs.md` — dimming is never a warning or a countdown
- `Story Plan/Choice Points.md` — pitfall signal moved from brightness to position
- `Characters/Claire.md` — the lens named as her bonded Imprint

**What this ruling does not decide:** who operates the correction apparatus —
Vesper alone, or the state with him as the engine. `World/Locations.md` needed no
change; it already stated the apparatus-and-loop break, the thinning rain, and the
train-measured advance. Part 1 items 1–7 of the pass remain unruled.

**Status:** decided

<!--
Template:

### D-002 — <one-line decision>  ·  <date>
**Closes:** F-00x
**Decided:** what is now true
**Reasoning:** why this over the alternatives
**Documents to update:**
- `Story Plan/…md` — what changes
- `Characters/…md` — what changes
**Status:** decided
-->
