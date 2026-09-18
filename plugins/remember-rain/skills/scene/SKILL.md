---
name: scene
description: Run a Remember Rain drafting session on one Scrivener scene card — assemble the brief, help with the actual writing, and write the result back into the package. Use when the author wants to draft, continue, or work on a scene of the visual novel Remember Rain, asks "what do I write next", "let's work on the novel", names a scene, or wants help with prose, dialogue, or a beat in Remember Rain. Pairs with the scriv skill, which owns the file I/O.
---

# Drafting a Remember Rain scene

Remember Rain is a **visual novel in first draft**. The story bible is complete
(28 design tickets, all resolved); the manuscript is not. Of 50 scene cards, 13
have prose. The work is writing the other 37.

The plan's own warning, worth repeating to yourself: *this project's theme is
paralysis by infinite potential, and preferring more planning to any drafting is
the failure mode.* Help the author write. Do not help them plan.

## A session

```bash
S=plugins/remember-rain/scripts/scriv.py

python3 $S next                 # the next unwritten card in spine order
python3 $S brief "<card>"       # the assembled brief — read this first
python3 $S read "<card>"        # the card's current body, if any
python3 $S write "<card>" --from draft.md --label Drafting
```

Load the **scriv** skill for the file I/O rules, the scene-handle convention and
the safety model. This skill is about the writing.

## Read the brief before anything else

`scriv brief` assembles, for one card:

- **the author's own index-card brief** — written into Scrivener's synopsis
  field, and the single most important input. It carries the beats, the target
  length, the plants, the POV and the cast. It is not a summary; it is the
  instruction.
- **The Spine's mandate for this scene** — the chronological owner of the story.
- **cast, POV and place**, resolved to the character documents.
- **the laws that bind the scene** — read them, do not guess at them.
- **neighbouring cards and their state**, so the scene connects.

The brief is authoritative. If what the author asks for in conversation
contradicts it, say so rather than silently picking one.

### The law documents, and what each is for

Read these from the package (`scriv read "Story Plan/Themes and Motifs"` etc.).
Do not restate them from memory — they are maintained and they move.

| Document | What it governs |
|---|---|
| `Story Plan/1 The Spine` | scene order, causal links, what this scene must accomplish |
| `Story Plan/Themes and Motifs` | **Gold Vocabulary** (a *closed* set — six words, no more) and **Global Drafting Risks** |
| `Story Plan/Choice Points` | protected non-choices, pitfalls, the interaction law |
| `Story Plan/Arc Structure` | what each arc does; the arc's central question |
| `World/Magic System` | hard rules and limits of Deviations, Imprints, extraction |
| `Characters/<name>` | the person's arc, tells, register, and what they cannot do |

## How to help — the part that is easy to get wrong

The author's standing instruction is explicit, and it is the whole job:

> Prefer examining my attempt, expanding possibilities, or supplying missing
> knowledge before performing the central creative act. Critique important prose,
> scenes, and character decisions before replacing them. Preserve useful
> struggle; briefly flag cumulative outsourcing and identify a worthwhile part
> for me to attempt.

So, in practice:

- **If the author has written something, work on what they wrote.** Diagnose,
  sharpen, offer alternatives. Do not swap in your own version unless asked.
- **If the author is stuck**, offer two or three genuinely different moves with
  what each costs — not one polished answer. Let them choose.
- **If a planned beat is thin**, supply the missing knowledge (what the bible
  says, what a character would actually do) instead of inventing new plot.
- **Never resolve a theme by having a character state it.** The bible's rule:
  express themes through behaviour, choices and changed meanings; do not force
  characters to prove a thesis.
- **Leave viable artistic choices to the author.** Distinguish what their
  material implies, what they want to explore, and what you are suggesting.
  Repetition does not make your suggestion canon.
- **Flag cumulative outsourcing** if the author has handed you the whole scene
  several times running, and name one part worth their own attempt.

### Voice and register, at minimum

- First person past, immediate. **No retrospective frame** — no narrator looking
  back, no *I didn't know it then*. A Rain who is telling you this has already
  settled his relationship to it, which the ending's whole cost says he cannot do.
- **The Split** lives unmarked inside Rain's narration in Arcs 1–2, gains one
  italicised line at the Arc 3 awakening, and from then on italics are permanent.
  It is never explained, and never resolved into self-talk or a separate entity.
- **Evil never raises its voice.** It arrives as offers, forms, referrals,
  renovations and schedules. Violence belongs to the desperate and the good.
- Every character's ability cost is paid in their own currency. A cost that
  feels flat is usually in the wrong register — the test is *is this their
  pain*, not *is this painful enough*.
- The gold motif is a **closed vocabulary** and every motif must be perceptible
  without it. Check `Themes and Motifs` before using colour at all.

## The stuck ladder

When the scene will not move, descend one rung at a time. **Never choose a rung —
take the next one.** That is what makes it a protocol instead of a decision made
while tired.

1. **Write it badly.** Most stalls are a refusal to type the bad version. Flat
   dialogue, clumsy prose and thin stage direction are pre-authorized. Do not
   negotiate, and do not polish.
2. **`{TK}` whatever is blocking.** Do not go look it up, do not decide it.
3. **Drop to a beat summary and finish the card anyway** —
   `{TK beat: they argue, she walks out}` — continuing at that fidelity to the
   end of the scene.
4. **Stop for the day.** One obligation: leave `{TK next: ...}` so resuming costs
   nothing.

Rung 3 is the load-bearing one: a summarised scene is *bad*, it is not
*unfinished*. A first draft is allowed to be bad and is not allowed to be
unfinished.

## Session shape

One session = **one card moved forward**. Any words count; forty on a bad night
is a session. There is no word target and no timer, and neither is a quota —
a missed quota is the shame state this whole project is built to avoid.

Draft **chronologically through the spine**, Arc 1 → Arc 5. When a later scene
is burning, dictate it into the `📥 Inbox`: that is idea-building, not
out-of-order drafting, and the card still gets written in sequence.

Never present progress as a count of days absent, a streak, or a deadline.
Show words that only go up, or nothing. When idle, the correct tone is
invitation — *the rain waits* — never a verdict.

## Before you say you are done

- The body opens with the card's **existing scene handle**, unchanged.
- `{TK}` is used wherever something is genuinely unresolved, and nowhere as a
  hedge.
- The scene does what the index-card brief and The Spine say it must do.
- Nothing contradicts a law document you read.
- Say plainly that **the author must re-export in Scrivener** for ninjaruss.net
  to show the change.
