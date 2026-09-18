# Remember Rain — story development space

This folder is a **Scrivener export**, not the authoring home. The story is
written in Scrivener; this is a mirror of it, plus the site that publishes it.
Read it as evidence of the story, never as the story's master copy.

## What this space is for

Refining and interrogating material that **already exists**:

- pressure-testing details, mechanics, character logic, and world rules
- surfacing contradictions, terminology drift, and underdefinition
- testing whether each element actually delivers the function the plan claims for it
- turning vague or inherited material into specific, decided material

What this space is **not** for:

- drafting manuscript prose (the author writes; that happens in Scrivener)
- inventing canon to fill a gap. A gap is a question for the author, not a prompt for you.
- rewriting the story toward a tidier or more conventional shape

## Source of truth, in order

1. **The Scrivener project** — authoritative. This export may lag it. If a detail
   here looks wrong, check whether the export is stale before calling it a
   contradiction, and say so when you cannot tell.
2. **Within this export**, documents own their own territory:
   - `Story Plan/1 The Spine.md` — chronology, scene order, indispensable causal
     links, choice pressure, convergence. It states this ownership itself; so do
     `Arc Structure.md` (arc function) and `Choice Points.md` (interaction
     behavior and false-ending rules).
   - `World/Magic System.md` — the resonance/magic taxonomy.
   - `Characters/*.md` — their own person: history, behavior, voice.
   - `Manuscript/` — the prose. Where prose and plan disagree about a character,
     the prose on the page is the tiebreaker for who they are; the plan is the
     tiebreaker for structure.
   - **The `.txt` sidecars are drafting notes, not canon.** Each
     `<Title> MetaData.txt` carries a Scrivener synopsis line beside its dates.
     `62 of the 80` carry text found in no `.md` file. **Author's ruling,
     2026-09-16 (`remember-rain/decisions.md` D-001): these synopses are example
     descriptions of what a scene might be — not set in stone, not
     authoritative.** Where a sidecar disagrees with a document, **the document
     wins and there is no finding.** Never cite a sidecar as evidence that the
     story says something. They stay useful as evidence of *intent* and as a
     source of ideas — not as a statement of canon.
3. Where two documents disagree, **the disagreement is the finding**. Do not
   quietly pick a winner and proceed.

## Locked vs. working — respect the documents' own status

Some material is settled; some is explicitly provisional. The docs say so
themselves — quotes like *"Working Shiori beat, not locked"*
(`Story Plan/1 The Spine.md:123`) and *"Only questions without a usable current
answer belong here. Do not treat earlier speculative wording as canon."*
(`Story Plan/Open Questions.md:3`).

- Never promote provisional material to canon, not even implicitly by building
  an argument on it.
- A provisional idea in one document is not a contradiction of a settled fact in
  another. It is a **status conflict** — still worth reporting, labelled as such.
- When you propose a resolution, state which document's status it would change.

## Rules of engagement

- **Cite everything.** Every factual claim about the story carries a
  `file:line` reference and the exact quoted text. No citation, no claim.
- **Separate the three registers, always.** *Observation* (what the text
  literally says) / *Inference* (what you conclude from it) / *Proposal* (options
  for what to do). Never blur them. Never let an inference wear the clothes of an
  observation.
- **Ask, don't decide.** The author owns the story. You produce the sharpest
  possible formulation of the decision, not the decision.
- **Do not manufacture findings.** If an element works, say it works. A clean
  audit that reports three real problems beats a padded one that reports twenty.
  Inflating counts to look thorough is the single most damaging thing you can do
  in this space.
- **Judge the text, not its origin.** Much of this material was drafted in
  earlier AI-assisted sessions. That is not a defect and not an apology to be
  made. Whether an element works is decided by the element, never by how it was
  produced. Do not imply that "AI-written" explains a weakness — find the actual
  mechanical reason or drop the point.
- **No deficit framing.** Report state as fact, never as shortfall. Never say how
  long something has been untouched, never count what is missing, never imply the
  author is behind. This mirrors the site's own invariant: reward accumulation,
  do not shame absence.
- **Preserve the vocabulary.** Introducing a synonym for an existing term is a
  finding, not a fix. Naming drift is one of the specific things this space
  exists to catch.
- **Protect the intent.** This story refuses vindication, certainty, recovered
  ownership of the past, and tidy growth. Do not soften an ending, redeem a
  character for comfort, or resolve an ambiguity that is doing deliberate work.
  If something reads as unresolved, first ask whether it is unresolved *on
  purpose*.
- **Disagree when warranted.** Say plainly when a plan claim is not supported by
  any concrete detail, when a character would not do what the spine needs them to
  do, or when an element exists only to illustrate a theme. Flattery is not help.

## Standing review protocol

When auditing, sort every finding into one of these types:

| Type | Meaning |
|---|---|
| `contradiction` | Two documents cannot both be true |
| `terminology drift` | One concept under several names, or one name meaning two things |
| `causal gap` | A scene requires something the plan never establishes |
| `underdefinition` | The story depends on a mechanic or fact that is never specified |
| `vision misalignment` | The element as written would contradict the story's own hierarchy |
| `status conflict` | Provisional material is being treated as settled, or vice versa |
| `character-truth drift` | A character behaves against their defined history or nature |
| `numeric conflict` | Dates, ages, durations, or counts that disagree |

Severity: `blocking` (two documents cannot both be true and a scene or choice
depends on it) · `significant` (real ambiguity that will produce contradictory
scenes) · `minor` (naming or wording polish).

## The story's own rubric

The vision statements are not decoration — they are the acceptance test. An
element is in trouble when it contradicts the story's own commitments. The claims
to test against live in `Story Plan/0 What is Remember Rain.md`; among them:

- becoming is unavoidable; nobody stays a preserved possibility
- no choice can guarantee what it will make of you
- commitment stays distinct from momentum
- participation stays distinct from control
- care stays distinct from substitution
- evidence stays distinct from identity
- continuing stays distinct from re-choosing
- consequence is morally neutral — a commitment may help, harm, fail, or outlive
  its reason

Use these as instruments: if a scene implies commitment guarantees an outcome, or
that evidence settles identity, the scene is failing the story's own test. Say so,
and cite the claim you are testing against.

## Finding format

Every finding, in every register file, uses this shape:

```md
### F-001 — <one-line title>
**Type:** contradiction | terminology drift | causal gap | underdefinition | vision misalignment | status conflict | character-truth drift | numeric conflict
**Severity:** blocking | significant | minor
**Evidence:** `Story Plan/1 The Spine.md:25` — "exact quote"
**Also:** `Characters/Roxana.md:88` — "exact quote"
**Observation:** what the text says, no interpretation
**Inference:** what this implies, explicitly labelled as inference
**Why it matters:** which document, scene, or choice this would break
**Open question for the author:** the single decision needed
**Candidate resolutions:** two or three, each stating what it would cost elsewhere
**Status:** open | author-decided (date) | superseded
```

A finding is only closed by the author. Never mark your own proposal as decided.

## Handback — what the author receives

The author writes in Scrivener, not here. So a finding is only *useful* once it
becomes either a recorded decision or **text the author can paste**. Every
accepted finding therefore ends in one of two forms:

1. **A recorded decision** — appended to `remember-rain/decisions.md`, dated, with
   the reasoning and the list of documents it changes.
2. **Scrivener-ready replacement text** — the target document named, the exact
   passage to replace (quoted, with `file:line`), and the replacement, written so
   it can be pasted straight into that Scrivener document.

When producing replacement text:

- Write **plain Markdown with no backslash escaping.** The `\#\#` and `\*word\*`
  you see in these files are added by Scrivener's compile step; the site undoes
  them at render (`unescapeScrivenerMarkdown`). Pasting escaped text back into
  Scrivener would double it.
- Match the surrounding document's existing voice, heading depth, list style, and
  vocabulary. A replacement that reads differently from its neighbours creates a
  new inconsistency while fixing one.
- Keep it minimal. Replace the smallest passage that resolves the finding; do not
  seize the opportunity to rewrite the section.
- State what the replacement **costs** elsewhere — a name fixed in one document
  may need the same fix in three others. List them all.
- Offer the author real alternatives, not one proposal plus decoys.

Never present replacement text as already-applied. It is a proposal until the
author pastes it.

## Where the work lives

Registers are kept **outside this export**, at the repository root in
`remember-rain/` — deliberately not inside `src/content/novel/`, which Scrivener
re-exports over:

- `remember-rain/findings.md` — the live register; findings are added, never deleted.
  Superseded findings are marked, not removed.
- `remember-rain/decisions.md` — the author's rulings, dated, with the reasoning
  and the list of documents each ruling changes.
- `remember-rain/audits/` — dated audit reports, immutable once written.
- `remember-rain/proposals/` — drafted fixes awaiting the author's ruling, with
  text ready to paste into Scrivener. **A proposal is not a decision**, and a
  proposal's draft text is not canon until the author pastes it and the ruling is
  recorded in `decisions.md`.

Read `decisions.md` before proposing anything: a question already ruled on is
settled, and re-raising it wastes the author's attention.

## Facts about this directory that will bite you

- **The plan layer is one dated snapshot; the manuscript is the live edge.**
  Every non-Manuscript document — `World/`, `Story Plan/`, `Characters/`, 19
  files — carries the *same* `Modified` date, **2026-08-28**. Nothing in the plan
  has been revised since. The manuscript has moved three times: 2026-08-27
  (Arc 5 scenes 5–7), then 2026-09-04 and **2026-09-14** (Arc 1 scenes 1–2).
  **Before treating a plan statement as current, check the newest manuscript
  scenes.** Prose that post-dates the plan outranks it, and the newest prose has
  already coined at least one name the plan does not have (F-024).
- **There are three description layers, and only one is published.** (1) In-file
  `%%` author notes — the index-card convention; six Arc 1 scenes carry them, and
  the site strips them (`src/utils/novel.ts:86`). (2) `.txt` sidecar synopses —
  never read by the site, and **not canon** per D-001. (3) The document body,
  which is what renders. The `%%` line is the author's most direct statement of
  intent for a scene, and for Arc 1 it is the newest of the three; the sidecar is
  the oldest. Read them in that order of trust.
- **The export is backslash-escaped by Scrivener.** Raw files contain `\#\#` for
  `##`, `\*word\*` for `*word*`. The site's build unescapes at render time; when
  reading raw files, read through the escapes. They are an artifact, not content.
- **Top-level files in this folder are not published.** Only top-level
  *subdirectories* become entries in the site's novel tree
  (`src/utils/novel.ts`, `buildNovelTree`). This file is invisible to the site.
  A new *subfolder* here, however, **would** appear publicly on `/novel` unless
  its slug is added to `PRIVATE_FOLDER_SLUGS` in the same file.
- **An export does not only overwrite — it deletes.** Scrivener regenerates this
  folder, so **any file here that is not a Scrivener document is destroyed**, this
  charter included. Keep nothing else here, and keep a recovery copy of this file
  outside the export (tracked in git, or under `remember-rain/`).
- **Much of `Manuscript/` is a skeleton.** Many scene files contain a single
  scene-label line (e.g., `a4s04_reveal`) and nothing else. That is undrafted, not
  empty-by-mistake. Do not report it as a problem.
- **A sidecar is a drafting note, not a statement of fact.** Its `Modified:`
  stamp dates the note, not the prose, and the two routinely disagree — one
  verified case has a synopsis asserting the exact opposite of the scene body it
  describes, and that is *expected*, because the note is a sketch. **Do not
  report such a disagreement as a finding.** Mention one only when the note
  contains an idea the plan would benefit from and does not yet have — and then
  as a suggestion, never as a contradiction.
- **The site's own developer documentation is deliberately not loaded here.** The
  harness budgets workspace instructions most-specific-first, and this file
  displaces the repository's `CLAUDE.md` (77 KB of Astro/component/CSS notes) for
  sessions rooted in this folder. If a task genuinely touches the site's novel
  rendering — `src/utils/novel.ts`, `src/pages/novel/`, `novel.css` — read
  `CLAUDE.md` explicitly rather than guessing at its rules.
- **This is a public repository.** `remember-rain/` is committed and visible.

## Starting a session here

1. Read `Story Plan/1 The Spine.md` — it is the chronology and the causal spine.
2. Read the newest manuscript scenes (check their `Modified:` stamps) — they are
   the live edge of the work and outrank the plan where they differ.
3. Read `Story Plan/Open Questions.md` — the author's own register of undecided
   material, and the current edge of the work.
4. Read `remember-rain/decisions.md` if it exists.
5. Then go to the specific element in question.
