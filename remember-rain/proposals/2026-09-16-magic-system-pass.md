# Proposal — `World/Magic System.md` pass · 2026-09-16

The highest-leverage pass in the register. Eleven live findings are reachable
from this one document, including F-003, F-005, and six of the twelve element
blockers. Fixing the rules first retires a chunk of the decision queue instead of
adding to it.

**Nothing in this file has been applied.** Every block below is a proposal until
you paste it. The target document is untouched.

## How to use this

- **Part 1 — Ready to paste.** Seven fixes whose shape is determined by the
  document's own existing rules. Review, veto any invented specific listed under
  each item, paste.
- **Part 2 — Needs your ruling.** Five forks where the story genuinely could go
  two ways. Text is drafted for each branch, so a ruling is a paste and not a
  writing job.
- **Part 3 — Ripple.** Everything outside `Magic System.md` that each fix
  requires, so no document is left contradicting the new rule.

**Convention:** blocks are plain Markdown, **unescaped** — Scrivener adds the
backslashes at compile time, so paste these as-is.

## Reading the document changed the diagnosis

The audit reported that `Magic System.md` was thin. Reading it end to end, most
of it is not thin at all — it is unusually well specified, and it already
contains the mechanism for several findings the audit called gaps:

- **E-004 is already answered in outline.** `:49` states that under extreme
  pressure a passive may break into the world without an Imprint, and names
  Roxana's prison spark as the example. The missing piece is only *who pays*.
- **E-003 needs a clause, not a new rule.** `:25` hedges with "its *ordinary*
  expression is personal", and `:49` already describes the unordinary case. What
  is missing is one sentence saying a broken-out passive is perceptible to
  others.
- **F-003 has its precedent two lines away.** `:131` already does exactly the
  needed move for the goggles — "the bond is resonant rather than
  autobiographical" — and simply never does it for the Split.
- **E-010 has its template in the same section.** `:67` gives Claire a complete
  load-and-recovery model. Rain's bullet at `:57` is one line by comparison. The
  document knows how to do this; Rain's entry was never finished.

So this is less "write the missing world-rule" and more "finish four sentences
and write one genuinely absent section." **The genuinely absent section is
correction** (E-001), and it is the reason this pass is worth doing.

**Counts:** 12 findings addressed — 7 mechanical, 5 decisions.

## Reconciliation note · added 2026-09-16

This proposal was written before **D-002** (the character-sheet altitude trim, same
day) landed in the package. That trim already wrote two things into
`World/Magic System.md`:

- a paragraph after the one-expression rule — *"Practical applications of a single
  expression … are facets of that expression, not separate powers"* — which is what
  settles the Pursuer's one-vs-four-expressions ambiguity;
- **Rain's and Roxana's full symptom ladders** in the Costs section, moved in from
  the character sheets so nothing was lost when those sheets were trimmed to
  pointers.

So, when reading this proposal:

- **Line references below are pre-trim.** The added paragraph and the two ladders
  shift what follows them — roughly **+2** below the one-expression rule and **+6**
  below the cost bullets. Content references still resolve; where a number matters,
  re-locate it by the quoted text, not the line.
- **Item 3 is revised below** to *replace* the Rain ladder already present rather
  than add a second Rain cost passage beside it. **Apply the revised item 3.**
- Nothing else collides: the ladders cover Rain and Roxana only, and Claire's
  paragraph was already in the document.

---

# Part 1 — Ready to paste

## 1. E-003 + E-004 · Passive breakouts: perceptibility, bounds, and who pays

**The gap:** `:25` says "the owner is the only person who directly perceives it,"
but Roxana perceives Rain's Ghost and accepts its hand in Arc 3 (`Spine.md:73`).
`:49` permits a passive to "break into the world" but never says that makes it
perceptible, and says the breakout is "severely costly" without saying to whom.

**Where:** replace the single paragraph at `World/Magic System.md:49`.

**Paste this:**

```md
Under extreme emotional or physical pressure, a passive may briefly break into the world without an Imprint. This is uncontrolled, difficult to repeat, and severely costly. Roxana's spark in the prison is the main example.

A passive that has broken into the world is perceptible to anyone present, not only to its owner. This is the sole exception to the owner-only rule. The breakout does not transfer the passive: it remains the owner's, it returns to the owner, and the owner remains its only perceiver once it withdraws.

A breakout costs its owner first and pays whether or not anyone accepts it. The cost falls on the faculty the breakout expressed, as a narrowing, an exhaustion, or a period in which the passive will not answer. A second person who acts on a broken-out passive pays through their own system for whatever they express, and pays nothing for the borrowing itself. No one's cost is discharged by another's.

Breakouts are bounded by three conditions. The pressure must be extreme, the breakout must be brief, and it must not be repeatable on demand. A breakout cannot be trained, scheduled, or produced by exposure alone, and it cannot be lent, sold, or deliberately given. No character may produce one at will.
```

**What this invents** (veto any of these individually):

- That a broken-out passive is perceptible to anyone present — the *sole*
  exception to the owner-only rule.
- That the owner pays first regardless of acceptance.
- The specific shape of the owner's cost (narrowing / exhaustion / the passive
  refusing to answer).
- The explicit prohibition on lending, selling, or deliberately giving a
  breakout.

**Why this shape:** it resolves both findings with the document's existing rule
rather than a new one. Rain's Ghost breaking out is *Rain's* breakout, so he pays
— which removes the "lender pays nothing" problem, because nothing was ever lent.
Roxana's acceptance then produces *her* breakout, the raw spark, which `:49`
already names. Two breakouts, one each, both paid for.

**Watch the coupling:** the owner's cost wording here touches the Ghost's dimming,
which is E-012 in Part 2. Settle E-012 first, or in the same sitting, so the two
do not disagree about what dims the Ghost.

## 2. E-009 · Kinds of memory

**The gap:** `:121` says "factual access and felt ownership remain distinct" and
`:129` calls Rain's survival "downstream encodings outside Vesper's
autobiographical target" — but no document says what the classes *are*, so
`:127`'s emphatic 100% reads as assertion rather than mechanics.

**Where:** new subsection under `#### Shatter` / before `### Melt`, or at the end
of `#### Intact Shard and Archive`.

**Paste this:**

```md
#### Kinds of Memory

Extraction sorts by kind, and only one kind is Vesper's target.

**Autobiographical memory** is first-person experiential access: the lived relationship, fear, choice, emotion, and connected context. It is what makes a record feel like something that happened to you. Vesper's prism stores this, and a complete extraction takes all of it.

**Semantic knowledge** is propositional: what happened, who was present, in what order. It does not require the holder to have been there. A person can hold accurate semantic knowledge of an event they never experienced, and can lose semantic knowledge of an event they lived.

**Procedural knowledge** is knowing how: trained movement, practised response, learned sequence. It is expressed rather than recalled.

Vesper extracts autobiographical memory. Semantic and procedural knowledge are not targets and are not stored, because they were never inside the target. Nothing shields them and no one arranges for them to survive; they are simply a different kind of thing. This is why Rain can recount the adventure precisely and cannot inhabit it. The account was always semantic.
```

**What this invents:** the three class names; the claim that semantic and
procedural knowledge are not stored rather than merely surviving; the closing
application to Rain.

**Why this shape:** it converts `:127`'s assertion into a consequence, which is
what the audit's option 1 asked for, and it needs no new mechanism.

## 3. E-010 · Rain's load and recovery

**The gap:** `:57` gives Rain one line where `:67` gives Claire a full model, and
two climaxes depend on impairment being present. The audit called this the
blocking one.

**Where:** *revised by the reconciliation note above.* The D-002 trim already moved
Rain's symptom ladder into the Costs section as a standalone paragraph. **Replace
that ladder paragraph** with the consolidated model below — do not add a second Rain
cost passage beside it.

**Paste this:**

```md
For Rain, load accumulates on two channels. The ordinary Clone disrupts sensory anchoring for as long as it is sustained, escalating from blur and ringing through disorientation, proprioceptive instability, severe sensory degradation, and collapse, and it clears within hours of use. Perfect Clone impairs felt authorship and action initiation, and that impairment accumulates across uses rather than within one use: the friction is between Rain's decision and his real body's initiation of it, so each use widens a gap the next one widens further.

Perfect Clone friction clears over days of not using it, not hours, and does not clear at all while use continues. It is specific to the counterfeit: the ordinary Clone does not compound it, and switching back down does not discharge what the Perfect Clone has already spent.

The practical floor is that Rain can always decide correctly. What degrades is the interval between deciding and beginning. At high accumulated load he knows the correct response and begins it too late to matter — and he cannot detect this from the inside, because the decision still feels immediate. Others can see it. He cannot.
```

**What this invents:** the hours-versus-days timescales; that switching expressions
does not discharge accumulated friction; that the impairment is undetectable from
the inside.

**Why this shape:** the last paragraph is doing the most work. `Spine.md:115` says
"He knows the correct response and begins it too late," and `Spine.md:99` has Rain
mistake the impairment for relief. Both need him to be unable to feel the cost
accumulating — otherwise he would simply stop. This also explains why he does not
fall back to the ordinary Clone, which was the audit's objection to this option.

## 4. E-029 · What burning a shard is

**The gap:** `:95` gives shatter (returns the memory) and `:99` gives Melt
(destroys it), then `Spine.md:123` has Roxana *burn* Aster's shard — a third
operation with no definition.

**Where:** new subsection immediately after `#### Shatter`.

**Paste this:**

```md
#### Shatter, and What Burning Is

Shatter returns the memory to its original owner, so it requires an owner to return it to: a living recipient with the autobiographical architecture the record came from. Shattering a shard whose owner has died has nothing to return it to.

Burning is what a shard undergoes when its owner is gone. It is a shatter performed with the flame, and the difference is entirely in the destination. The record leaves the archive and the world at the same time. The memory is neither restored nor destroyed — it ends without a recipient, and there is nothing to access afterwards, by anyone, Vesper included.

Burning is available only to someone holding a shard whose owner cannot receive it. It cannot erase a living person's memory, which remains Melt's operation, and it does not require Vesper's faculty.
```

**What this invents:** the living-recipient requirement for shatter; the burning
operation and its bounds.

**Why this shape:** Aster is dead, so shatter is meaningless for his shard — that
is the whole reason a third operation needed to exist, and the document had never
said so. This makes Roxana's act a genuine relinquishment rather than Melt
performed on someone else, avoiding the audit's warning that option 2 would read
as retaliation. It also gives the finale gesture a mechanical meaning: she ends a
record that had nowhere to go back to.

## 5. F-003 · The Split is outside the autobiographical target

**The gap:** `:127` forbids "secret autobiographical fragment", `:103` in Rain's
file calls the Split "Rain's record of past failure", and `Spine.md:121` has
Vesper offering to remove it three scenes *after* a total extraction. The
document already solved this exact problem for the goggles at `:131` and never
applied it to the Split.

**Where:** insert into `### Rain's Final Extraction`, immediately after the
goggles paragraph at `:131`.

**Paste this:**

```md
The Split is not autobiographical content. It is an expression of Rain's passive: involuntary resonance in his own voice, patterned by failure rather than stored as a memory. It sits outside the autobiographical target and survives the extraction for the same reason the goggles' bond does.

Vesper can still offer to remove it, because removing it does not require extraction. An established bond or passive expression can be separately disrupted, and that is the operation he is offering — not a memory removal. His offer is real and within his means. What he cannot do is take it as part of the autobiographical target.
```

**What this invents:** classifying the Split as a passive expression.

**Why this shape:** this is the only branch of the audit's three that changes
nothing downstream. Option 2 (the Split is taken at scene 5) requires rebuilding
Arc 5 scene 8; option 3 (Vesper's offer is misleading) makes Vesper lie, against
`Characters/1 Vesper.md:29` ("Asks permission every time and means it"). This
branch also has its authority already written: `:147` states that an established
bond survives memory loss "unless something separately disrupts the resonant
relationship" — so Vesper's offer needs no new power.

Note this does **not** decide whether the Ghost and Split are separate beings,
which `Story Plan/Themes and Motifs.md:85` deliberately refuses to decide. It
classifies the Split's *kind*, not its ontology.

## 6. F-007 · "stasis" means two things

**The gap:** `:17` pairs "correction and stasis" as a world condition;
`Story Plan/Themes and Motifs.md:85` says "The Perfect Clone is perfected stasis,
not growth." One word, two referents.

**Fix — two substitutions, no new rule.**

Replace at `World/Magic System.md:17`:

```md
The island's volcanic water retains an unusually high concentration because the Sacred Water loop circulates through a largely closed natural system. Its circulation can periodically produce conditions in which new manifestations remain possible five years after the Flare. Whether the reservoir is depleting, persistent, or periodically inert—and how correction affects its circulation—remains unsettled.
```

Replace at `Story Plan/Themes and Motifs.md:85`:

```md
**Drafting risk:** The Perfect Clone is perfected counterfeit presence, not growth. Never decide whether the Ghost or Split are separate beings.
```

**Why this shape:** "perfected counterfeit presence" is already the author's own
vocabulary — `Themes and Motifs.md:165` defines `seamless` as "the Perfect Clone;
perfected counterfeit presence." So this removes the collision by reusing an
existing term rather than coining one. If correction is then resolved in Part 2 as
a defined phenomenon, "stasis" becomes free to be defined properly later.

## 7. F-017 · "borrowed loadout" contradicts Melt

**The gap:** `Spine.md:51` says Vesper "displays another borrowed loadout over
breakfast," but `:113` states that Melt "does not transfer the original emotion,
relationship, worldview, Deviation, or lived meaning." A loadout implies
capabilities; Melt produces mannerisms.

**Where:** `Story Plan/1 The Spine.md:51`.

**Paste this:**

```md
- **8 · The Melt** — Vesper displays another borrowed movement over breakfast: a stance, a phrase, a hand with no remembered lesson behind it. Roxana accepts his steadying hand. He extracts and Melts a memory-network tied to her pain and unyielding behavior.
```

**Why this shape:** "a small stance, phrase, hand movement, or reflex with no
remembered lesson behind it" is verbatim from `Themes and Motifs.md:103`, so the
replacement speaks the document's own established language. Keep the rest of the
bullet unchanged.

---

# Part 2 — Needs your ruling

Each fork below has drafted text for every branch, so ruling is a paste.

## 8. E-001 · What correction is — **the big one**

Three ways to go. I recommend branch 1, and I think the evidence is fairly
one-sided: `Characters/1 Vesper.md:63` says "The correction scales his ordinary
fixing gesture to the city," and `World/Locations.md:25` pairs "the correction
apparatus and water loop." Both point at *Vesper's own faculty, delivered by
infrastructure*.

**Note the interaction with item 9 (E-002):** this decision determines whether
correction can touch Rain personally. Rule on these two together.

### Branch 1 — Correction is Vesper's faculty delivered by water *(recommended)*

**Where:** new section, after `### Costs` and before `### Extraction and Glass`.

```md
### Correction

Correction is Vesper's own faculty delivered through infrastructure instead of through his hands. The apparatus at the caldera vents the effect into the Sacred Water loop, and the loop carries it through the city's supply. What he does to one person at contact range, the loop does to a district at exposure range.

The water is the contact. That is why correction needs no touch, and it is also why correction is imprecise where his hands are precise. His hands can isolate one memory-network; the loop cannot, so what a corrected district loses is wanting in general — the appetite for a thing rather than the record of it. A corrected district is not emptied. Its residents continue, and stop initiating.

**Boundary.** The boundary is the edge of the loop's current reach. It is measured rather than decreed: it moves as circulation carries the effect further, and a full lap of the Circuit Line makes the change legible by showing the same stations in two different states.

**Apparatus.** The correction apparatus is an installation at the caldera, coupled to the loop. It is physically ordinary, and it is the only thing that makes correction city-scale. Vesper corrects a person; the apparatus corrects a city. Breaking it stops the loop carrying the effect. Vesper survives its destruction.

**On the person.** Exposure degrades wanting in proportion to time and concentration. It is gradual, and it is not extraction: nothing is stored, nothing is carried away, and no one can read what a corrected person has lost. Removal from exposure is the only thing that slows it.

- Correction requires Vesper's faculty and the loop together. Neither alone corrects a district.
- Correction removes wanting, not memory. A corrected person can still say what happened and cannot say what they want.
- Correction is not reversible by Vesper. He can restore what he extracted. He cannot restore what the loop thinned.
- The apparatus is the objective because it is the only city-scale component.
```

**What this invents:** the water as delivery medium; that correction removes
wanting in general rather than specific records; that correction is irreversible
even by Vesper; boundary as measured reach.

**Cost:** `World/History.md:27` says the correction "reaches an anchor station only
after the amnesty is refused" — under this rule the advance is physical, so that
timing becomes an arrangement of the timeline rather than a rule. That is ordinary
plotting and needs no fix, but it should stop being written as if the mechanism
gates on plot.

**Also required:** `:69` says "Deviations do not permanently rewrite the physical
world. Vesper's alteration of memory and identity is the exception." Correction
removes *wanting*, which is arguably identity, so extend that exception to name
correction explicitly.

### Branch 2 — Correction is stasis, not extraction

The apparatus suppresses circulation in the loop; corrected districts lose
wanting indirectly, and Vesper's direct extraction is a separate personal act.

**Cost:** `Story Plan/0 What is Remember Rain.md:5` — "someone who can remove
memory and wanting" — then names two different agents doing two different things,
and Arc 4's corrected districts stop demonstrating Vesper's power at all. The
Horror modulation loses its escalating antagonist.

### Branch 3 — Correction stays deliberately unexplained

Institutional weather, never mechanised.

**Cost:** Arc 5's objective becomes "break a thing we have declined to define,"
and `World/Magic System.md:3` cannot keep claiming to be current canon while
omitting the force that drives three arcs. I do not recommend this branch unless
the opacity is itself the intent.

## 9. E-002 · Does correction reach Rain personally?

`Spine.md:85` says "Rain thins in corrected districts." Because the protagonist is
named for the weather and `Themes and Motifs.md:61` uses "thins" of rain in the
same arc, the sentence currently reads both ways and can be drafted neither way.

### Branch A — weather only *(recommended default, lowest risk)*

```md
- **2 · The boundary** — A full lap makes the correction measurable. The same stations appear twice; the boundary moves between passes. The rain thins in corrected districts. Roxana begins the drills needed to sustain Undying Flame and learn Starborne without treating the advanced mode as physical restoration.
```

**Cost:** Arc 4 then contains no direct personal consequence of correction for
Rain. His pressure is the Perfect Clone and his parents' silence. If that is
already the intent, this is simply the honest wording.

### Branch B — personal, with a mechanism

Only coherent if E-001 branch 1 is chosen. Exposure thins wanting in proportion to
time and concentration, so Rain crossing corrected districts is being thinned,
and `Spine.md:99`'s "easier feeling of letting the projection act" acquires a
second cause.

```md
- **2 · The boundary** — A full lap makes the correction measurable. The same stations appear twice; the boundary moves between passes. Rain thins in corrected districts, and does not name what is happening to him. Roxana begins the drills needed to sustain Undying Flame and learn Starborne without treating the advanced mode as physical restoration.
```

**Cost:** Rain is partially corrected before the finale, so `:127`'s "100% of
Rain's autobiographical target" needs a sentence saying correction and extraction
take different things and do not overlap. It also gives Arc 4 a second cause for
his state, which muddies `Spine.md:115`'s single causal chain.

### Branch C — deliberately ambiguous

Leave the sentence and let players read either way.

**Cost:** the direct-contact rule becomes unreliable in the reader's hands, and
`:127`'s absolute claim starts to look negotiable. I would not take this branch
unless the ambiguity is load-bearing, and nothing suggests it is.

## 10. E-012 · What the Ghost's dimming means

**The evidence is lopsided.** Two sources assign dimming to the Perfect Clone's
cost (`Themes and Motifs.md:81`, and `Spine.md:99` where Rain mistakes it for
relief), and one assigns it to the pitfall countdown (`Choice Points.md:29`).
Recommendation: keep dimming as the Clone's cost and signal the pitfall
differently.

### Branch A — one scale, two readers *(recommended)*

Dimming is always Clone cost. The pitfall clock is signalled by the Ghost's
*position* — its direction, or how far it leads — rather than its brightness.

**Where:** one line in `Story Plan/Themes and Motifs.md:81`, and the pitfall
signal re-stated in `Story Plan/Choice Points.md:29`.

```md
**Progression:** The Ghost guides without solving. It dims as repeated Perfect Clone use impairs Rain's felt authorship and action initiation, then can recover as that temporary impairment does. Its dimming is never a warning and never a countdown. The Split is unmarked early and italicized after the mountain. In the finale Rain uses the open-hand gesture without summoning the Ghost.
```

**Cost:** `Choice Points.md:29` must be rewritten to carry the pitfall signal on a
different channel. This is the smaller rewrite, and it protects `Spine.md:99`,
which needs dimming to be misreadable as relief.

### Branch B — split the signals

Clone cost becomes flicker or doubled vision; dimming becomes exclusively the
pitfall clock.

**Cost:** `Themes and Motifs.md:81` and `Characters/0 Rain.md:101` both need
rewriting, and the Clone's cost loses its one visible tell — which is a problem,
because item 3 makes the impairment undetectable from the inside. The tell has to
exist for the *player* to read. This branch removes it.

## 11. F-005 · Claire's Imprint

Five characters, four named Imprints. `:41` requires a bonded Imprint for
deliberate Deviation use, and Claire runs two deviations to destruction in Arc 5
scene 4.

**My recommendation improves on the audit's here.** The audit treated the lens as
problematic because it is written as an accommodation. But `:15` already permits
the answer: "A single event can pattern both the person undergoing or enacting
the transition and objects materially involved in it." The lens was materially
involved in the collapse — `Characters/Claire.md:75` calls it what "turns an
auditory wound into something visual and legible." So no earlier, unnamed
transition is needed.

### Branch A — the lens is the Imprint *(recommended)*

**Where:** add to `Characters/Claire.md` in the Imprint area, and no change is
needed in `Magic System.md` at all.

```md
**Imprint — the lens.** It was patterned at the collapse, and the magic system already permits this: a single event can pattern both the person undergoing the transition and the objects materially involved in it. The lens was materially involved, so the same event that left her the Static also left her the lens. This is why her Deviation is available to her deliberately, and why losing the lens costs her the Deviation as well as the accommodation.
```

**Cost:** it puts her assistive device at risk, which raises the stakes of Arc 5
scene 4. That is a gain, not a loss, and `Characters/Claire.md:103` already
anticipates it: "Removing the lens is an act under uncertainty, not an instant
recovery."

### Branch B — an unnamed fifth object

Add a new object to `Characters/Claire.md`. **Cost:** it must then appear or be
referenced in the manuscript, and none currently does.

### Branch C — Claire is exempt

Record an exception at `:41`. **Cost:** the system's clean chain at `:33`
acquires its first exception, and `:145` must be amended. This is the branch that
costs the document most and gains the story least.

---

# Part 3 — Ripple

Documents outside `Magic System.md` that each fix touches. Nothing here should be
applied before its Part 1 or Part 2 counterpart.

| Fix | Also changes |
|---|---|
| 1 · breakouts | `Characters/0 Rain.md` (the Ghost's transfer is a breakout), `Characters/Roxana.md:53` (name her spark a breakout) |
| 2 · memory kinds | none — formalises `:121`/`:129` |
| 3 · Rain's load | `Story Plan/1 The Spine.md:115` is now *supported* rather than asserted; no edit |
| 4 · burning | `Story Plan/1 The Spine.md:123` gains its meaning; no edit. `Manuscript/Dead Ends/*` unaffected |
| 5 · the Split | `Characters/0 Rain.md:103` — "record of past failure" → passive expression |
| 6 · stasis | `Story Plan/Themes and Motifs.md:85` (in block) |
| 7 · loadout | `Story Plan/1 The Spine.md:51` (in block) |
| 8 · correction | `:69` exception must name correction; `World/History.md:27`'s plot-gated advance re-grounded; `World/Locations.md` boundary description; `Story Plan/Open Questions.md:51` can close |
| 9 · thins | `Story Plan/1 The Spine.md:85`; branch B also needs `World/Magic System.md:127` |
| 10 · dimming | `Story Plan/Choice Points.md:29`; possibly `Characters/0 Rain.md:101` |
| 11 · Claire | `Characters/Claire.md` only |

**Open Questions this pass can close:** `Story Plan/Open Questions.md:51` ("What
is the exact relationship between correction, stasis, and weakening water
circulation?") is answered by item 8 branch 1 plus item 6. `:43` ("Can the same
Imprint resonate strongly with more than one person…") is untouched but adjacent
to item 1 — worth deciding in the same sitting.

## What this pass does not do

Ten live findings stay open and need invention rather than specification:
E-011, E-013, E-017, E-018, E-021, E-023, E-024, E-025, E-026, E-028. Most belong
to the second cluster — scenes that promise to *show* something and supply nothing
that shows it — and that work is yours, not the space's.

**Status:** proposal complete · nothing applied · awaiting rulings on items 8–11
