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

### D-004 — Arc 3: the dream of copies, and how the escape crosses · 2026-09-16

**Closes:** E-003, E-004, E-008, F-010 (the suit-self is the Split's unmarked form,
so the two terms are now linked).

**Decided:**

- **The mountain is figurative (E-008).** It is the figure of what Rain has
  relinquished: a copy of himself for every life he lived and left. Its size is
  the size of his renunciation, not a mechanical score.
- **The Split is the doubting voice, and the replica is the form it wears.**
  Before the mountain it is unmarked and appears as whichever life's Rain he is
  inside; the copies it wore are what the mountain holds; after the mountain it is
  marked and italicized. This settles nothing about whether it is another entity
  or only Rain — `Characters/0 Rain.md` still forbids settling that.
- **The void's encounter belongs to Rain, not to the replica's accusation.** Rain
  readies an answer, the replica fades before he can give one, and **Rain** calls
  it a coward for leaving. The word lands outward and inward at once.
- **Empathic Burn is starved, not suppressed.** The faculty is not itself
  suppressed by a deprivation pod; it goes quiet because everyone near her is
  suppressed, leaving nothing to echo. It registers only what exceeds that.
- **Roxana registers Rain's change first**, knows she is not alone, and — sealed
  in and unable to reach him — accepts the offered hand. The spark is hers.

**Reasoning (author's):** the recognition never has to call the dream false. A
dream populated entirely by Rain cannot answer him, which is the experiential form
of `Story Plan/1 The Spine.md`'s "cannot acquire consequences outside themselves."
Rain has never faced a person who could refuse him; in the dream there is finally
no one else, and the escape crosses to the one real person still signalling.

**Documents to update:**
- `Story Plan/1 The Spine.md` — the void encounter, the lives, the mountain, the hand
- `Characters/0 Rain.md` — the Split's unmarked form; the mountain's copies
- `Characters/Roxana.md` — Empathic Burn's behaviour under suppression; the breakout's occasion
- `Story Plan/Choice Points.md` — the graveyard's weight
- `World/Magic System.md` — indirect registration of a passive

**Consequences:**
- **E-003** resolves: another person does not *directly* perceive a passive; the
  route is indirect, through their own resonance.
- **E-004** dissolves: nothing is lent, so there is no lender. The spark is
  Roxana's own breakout and it "nearly empties her."
- **E-008** resolves as figurative — and load-bearing, because the mountain is how
  Rain recognises the dream.

**Status:** decided

### D-005 — Vesper's only offer is removal · 2026-09-16

**Closes:** nothing numbered — a design ruling, like D-002. It answers the gap that
`Characters/1 Vesper.md` had no mechanics section at all.

**Decided:**

- **Removal is Vesper's only operation.** Extraction takes the record, Melt
  destroys it, the correction takes wanting itself. He cannot help anyone carry
  anything. His kindness and his violence are the same gesture, which is why he
  never looks like a threat and always is one.
- **Shatter is the exception and he withholds it** — the one thing he could do that
  is not a subtraction, and it costs him his own access and hands the outcome back
  to someone else.
- **His combat is the archive, not his body.** A few records he judged useful
  (Aster among them), reproduced consciously — exact and slightly late, never
  fluent. Contact is his win condition; source interference is his cost. He cannot
  be out-fought, only out-spent.
- **Claire's refusal gains its floor.** He offers removal of the Static, and with it
  the record of why she began. She would accept help carrying it; he has only
  subtraction to give. Her refusal is a fact about him, not a stubbornness in her.

**Reasoning (author's):** one property of the antagonist answers two problems at
once — why he is a threat without a combat profile, and why a capable character
declines to fight him. It also makes Arc 2's *not yet*, Claire's refusal, and Rain's
refusal of the Split removal into the same beat performed three times.

**Documents to update:**
- `Characters/1 Vesper.md` — new `### Archive as Technique` section
- `Story Plan/1 The Spine.md` — the Claire refusal clause at Arc 5 scene 2

**What this did not require:** `Characters/Claire.md` already carried both tiers —
the reason and the meaning. The Split refusal (`1 The Spine.md:121`) and *not yet*
(`:47`) also needed no change; the principle makes them the same beat without
editing a word.

**What this does not decide:** which other records Vesper holds. Aster is the only
one named.

**Status:** decided

### D-006 — Kinds of memory: record versus faculty · 2026-09-16

**Closes:** E-009 — item 2 of the `Magic System` pass.

**Decided:** A new `#### Kinds of Memory` section defines the three classes the
document already used without defining — autobiographical memory (extraction's only
target), semantic knowledge, and procedural knowledge — and states the principle
that closes E-009:

- **A shard is a record; knowledge is a faculty.** What extraction moves is the
  autobiographical record. Semantic and procedural knowledge are faculties, never
  records, so extraction is not aimed at them.
- **Vesper's use of a record is reading, not acquisition.** He can read a shard's
  context, chronology, emotion, and learned information, and may reproduce what it
  teaches — deliberately, as external evidence. Reading a record of a skill is not
  acquiring the skill.
- **Nothing shields the faculties.** They survive because they were never inside
  the target, which satisfies the no-shield rule the 100% claim depends on.

**Reasoning (author's):** the section defines vocabulary the document was already
using, and the record/faculty split turns the 100% claim from an assertion into a
consequence. It also lands on the story's own rubric — evidence stays distinct from
identity.

**Documents to update:**
- `World/Magic System.md` — new `#### Kinds of Memory`, before `Intact Shard and Archive`

**What this corrected:** the first draft said semantic and procedural knowledge were
"not stored," which contradicted the shard's "learned information," the claim that a
record "teaches," and `Characters/1 Vesper.md`'s archive access. The record/faculty
framing replaces it and requires no change to those passages.

**What this does not decide:** whether reading a held shard requires contact. The
documents describe access with no contact requirement, while extraction requires
direct contact. The likely reading is that contact takes a record from a person and
the prism reads one already held — but it remains unstated.

**Status:** decided

### D-007 — Rain's load and recovery · 2026-09-16

**Closes:** E-010 — item 3 of the `Magic System` pass.

**Decided:** Rain's cost gains a full model in `### Costs`, parallel to Claire's,
replacing the standalone ladder that the D-002 trim had moved in from his file:

- **Two channels.** The ordinary Clone disrupts sensory anchoring — blur and ringing
  through disorientation, proprioceptive instability, severe sensory degradation,
  collapse — and clears within hours of use. Perfect Clone impairs felt authorship
  and action initiation, and that impairment accumulates across uses rather than
  within one.
- **Recovery is asymmetric.** The ordinary Clone clears in hours; Perfect Clone
  friction clears over days, and not at all while use continues. The ordinary Clone
  does not compound it, and switching back down does not discharge what the Perfect
  Clone has already spent.
- **The floor: he always decides correctly.** What degrades is the interval between
  deciding and beginning. At high accumulated load he knows the correct response and
  begins it too late to matter — and cannot detect this from the inside, because the
  decision still feels immediate. Others can see it. He cannot.

**Reasoning (author's):** `Story Plan/1 The Spine.md` has him mistake the impairment
for relief and begin too late. Both need him unable to feel the cost accumulating —
otherwise he would simply stop — and that undetectability is also what explains why
he never falls back to the ordinary Clone.

**Documents to update:**
- `World/Magic System.md` — the Rain model in `### Costs`

**Coupling:** this is what lets D-003 stand. The dimming Ghost is the *visible* tell
of the Perfect Clone's cost — which is why the player can read the impairment even
though Rain cannot. The two rulings are load-bearing on each other.

**Status:** decided

### D-008 — Rain's preparation, openness, and uneven participation · 2026-11-27

**Decided:** The author approved four targeted character refinements after exploring
Rain's behavior and reviewing the existing sheet:

- Rain can recognize what he wants and understand an answer while struggling to
  apply it. He makes an immediate attempt feel like a commitment of his whole
  future and resources; research and planning can postpone direct experience.
- Disappointment after an imperfect attempt precedes his gradual recognition
  that he chose and tried while unready. Preserve real prior efforts rather than
  treating him as someone who has never begun.
- He wants honesty and deep connection, considers the burden on the listener,
  and can disclose a difficulty without turning it into a concrete request.
  Difficulty answering concerns consequential personal choices, not quiet rooms
  in general.
- He enjoys the company of people who make and do things. That attraction need
  not always become self-comparison. The stopped notebook is a particular motif,
  not a claim that he has made no other creative efforts.

**Reasoning:** Commitment to living means entering and responding to the present
experience without first securing readiness or justifying an entire future.
Persistence includes learning, help, accountability, and changing an approach;
it does not require spending every resource or defending every past decision.

**Applied:** `Characters/0 Rain` in the live Scrivener package, then synchronized
to `src/content/novel/Characters/0 Rain.md`. No manuscript prose, ability rules,
plot events, locked callbacks, or ending changed.

**Still open:** The Spine's claim that every earlier decision avoided consequence
and the Ghost's exact contribution to commitment were explicitly excluded from
this revision. Surrender conditions and Shiori revisions remain unresolved.
No candidate resolution of those questions is adopted here.

**Status:** decided

### D-009 — Vesper's judgment of effort and bounded working questions · 2026-11-27

**Decided:** The author requested a bounded sheet update before returning to
Arc 1. Preserve these established character choices:

- Vesper genuinely admires driven people and wants to support effort.
- He can erase Rain's real attempts when they do not produce the result he
  expects, reinforcing Rain's own tendency to discount his efforts.
- Extraordinary recall reinforces Vesper's belief that he understands human
  nature. That belief does not make his interpretations final or another
  person's next response inevitable.

**Provisional, explicitly not adopted as settled motives:** reducing suffering
as his overriding priority; needing his own help to feel worthwhile; whether
he recognizes the correction's loss of initiative or makes exceptions its
mechanism cannot preserve; and the formulation that he trusts his understanding
more than another person's unfinished desire to change.

**Reasoning:** Preserve the author's discoveries without requiring an Arc 2
draft or a complete new philosophy before finishing Arc 1. The established
compassion and controlling certainty remain the foundation. Working questions
must not become additional plot requirements or conclusions about Rain's risks.

**Applied:** `Characters/1 Vesper` in the live Scrivener package, synchronized to
`src/content/novel/Characters/1 Vesper.md`. History, existing plot beats, abilities,
ending, and guardrails remain unchanged. The separate climax rationale issue
and the correction's tradeoff remain open.

**Status:** decided for the bounded edits above; listed hypotheses remain open.

### D-010 — Arc 1's decisive-leap expectation and overlooked efforts · 2026-11-27

**Decided:** The author selected expectation options 1 and 3 and approved targeted
planning updates: invite hope that one decisive departure will finally make
Rain's life begin, while gradually revealing real efforts that he and the reader
may initially undervalue. The leap changes circumstances without completing his
transformation or becoming his first-ever meaningful act.

**Reasoning:** An attempt that appears foolish can open experience unavailable
through preparation alone. That does not prove this particular act necessary,
wise, or exempt from accountability. Rain cannot guarantee correctness or outcome;
he can attempt, listen, learn, answer for harm, and revise his approach. Preserve
the adventure's attraction, humor, and absurdity.

**Applied:**
- `Story Plan/Arc Structure` — records the chosen reader expectation and its limits.
- `Story Plan/1 The Spine` — records its use within the existing Arc 1 sequence.
- Arc 1 `0 Rain intro`, `3 The morning after`, `4 The charge lands`, and
  `8 The trail` — author-private drafting comments only: existing effort before
  the theft, hesitation after the leap, an attempted difficult call, and a further
  choice without vindication.
- Matching local website mirrors synchronized from these source edits.

**Preserved:** All existing scene prose and handles, scene order, synopses,
abilities, later-arc Spine text, and locked ending. No invented prior achievement,
new event, explanatory speech, or literal change of narrator is required.

**Still open:** Identification and accusation mechanics; cooperation and surrender
conditions; the reason to leave home; the closing motive; the Ghost's exact
contribution to commitment; Shiori revisions; and the separate climax rationale.
Other suggested expectation traps and wider narrative evolutions are not adopted.

**Status:** decided

### D-011 — Roxana's acceptance and independent capability · 2026-11-28

**Decided:** The author clarified that Roxana feels she must prove she can do
things alone because she believes independent capability is the condition for
being accepted. Approved a targeted revision of her existing sheet:

- Center the contradiction and question on whether she remains wanted when
  others see what she cannot manage alone. Usefulness remains one strategy for
  security, rather than her sole motive.
- Preserve the real strength and pleasure in resourcefulness, adapting to limits,
  care, and renewed attempts. Neither competence nor generosity is automatically
  a bid for acceptance.
- Replace universal inability to receive with difficulty trusting help that
  overlooks her existing effort. Allow varied responses across people and offers.
- Keep Vesper's intervention a real harmful experience; receiving one hand cannot
  settle her conflict. Later capability must not prove she never needed help.

**Still exploratory:** Which kinds of help feel exposing, and whether she accepts
needs in others that she believes would make her own presence unacceptable. These
are marked working questions, not universal behavioral rules. No new origin,
mentor, medical history, or relationship event is established.

**Applied:** `Characters/Roxana` in live Scrivener, synchronized to the local
`src/content/novel/Characters/Roxana.md` mirror. Opening, core psychology, growth,
and prison beat's emotional emphasis revised. Objective plot events, existing
relationships, condition, powers, visual anchors, and ending preserved. All other
Scrivener bodies and manuscript prose remain unchanged.

**Follow-up alignment:** `Story Plan/0 What is Remember Rain` still presents
usefulness and its former question as her central formulation; `Themes and Motifs`
still foregrounds indispensability. Those summaries were not rewritten by this
character-sheet edit. Their character interpretation should defer to the revised
sheet; a broader consistency pass remains separate.

**Status:** decided for the targeted edits; listed working questions remain open.

### D-012 — Claire's certainty and responsibility for foreseeable harm · 2026-11-28

**Decided:** The author accepted the recommended emphasis: Claire seeks certainty
because she struggles to forgive herself for consequences she believes she should
have foreseen. Her primary response when an informed decision ends badly is that
she should have prevented it; distrust of her own judgment can follow.

- Distinguish an accurate, useful model from a guarantee that nobody will be hurt.
  Her effective action and satisfaction in solving problems remain real.
- Describe the cycle in which bad outcomes prompt further calculation, temporary
  relief, and increasing decision burden when certainty cannot be obtained.
- Separate the building's flaw, dismissal of her warning, and scapegoating from
  Claire's own interpretation of failing to prevent the disaster. Remove the
  suggestion that being correct caused it or that greater humility is established
  as the missing preventive action. The existing history events remain intact.
- Her development distinguishes what she could reasonably know, what she should
  learn or repair, and what she could never guarantee. Limits do not excuse actual
  mistakes, and good reasoning is not something she must abandon.

**Applied:** `Characters/Claire` in live Scrivener and its local website mirror.
The broad always-late contradiction was replaced with the conditions under which
she seeks an impossible guarantee. The Roxana relationship sentence now reflects
D-011's concern with independent capability rather than indispensability alone.

**Preserved:** Actual backstory paragraph, all seven plot beats, ability mechanics,
costs, visual anchors, honesty, accommodations, accepted help, and the uncured
ending. No new traumatic event, ordinary taste, dialogue, or relationship event.
Other characters and manuscript prose were not edited.

**Follow-up alignment:** The general story overview still uses the earlier
"almost never wrong and almost never in time" shorthand. The revised character
sheet governs its interpretation; broader overview alignment remains separate.

**Status:** decided

### D-013 — Claire's attachment to approaching certainty · 2026-11-28

**Decided:** The author approved making the research process itself more rewarding
and compelling for Claire, alongside D-012's fear of foreseeable harm.

- Useful discoveries supply relief, capability, and a sense of nearing readiness.
  Another variable provides a clear task while acting exposes the uncertainty
  investigation cannot eliminate.
- A new consideration can reopen a settled question. She can have sufficient
  evidence for a reasonable decision and still prefer further investigation for
  the feeling it provides. Self-blame after an outcome can intensify this cycle,
  but the attraction also operates before failure.
- Preserve genuinely necessary research, curiosity, satisfaction, and successful
  problem-solving. Her ability repeatedly yields useful answers, making the
  boundary between inquiry and avoidance harder to recognize.
- Distinguish approaching clarity from the existing Click at model completion,
  and temporary relief from permanent certainty. No new mechanical reward or
  clinical diagnosis is established.

**Applied:** Three psychological passages in `Characters/Claire`, in live
Scrivener and the local website mirror: an observable tendency to reopen a
question, the reinforced research loop, and recognition of when investigation
postpones the next useful action.

**Preserved:** D-012's responsibility motive, actual backstory, all seven plot
beats, relationships, ability mechanics including the Click, visual anchors,
guardrails, and uncured ending. No new event or scene prose. Existing broader
overview alignment remains separate.

**Status:** decided

### D-014 — Vesper's accompaniment, authority, and provisional consent · 2026-11-28

**Decided:** The author approved the bounded review refinements:

- Broaden his central question to caring without deciding what another person's
  life must become. Their participation need not look like verifiable improvement.
- Preserve genuine listening, comfort, practical help, and pleasure in kindness.
  His controlling turn concerns losing trust in unresolved accompaniment when he
  believes intervention can produce a better, verifiable result.
- Replace blanket inability to help anyone carry anything with the distinction
  between ordinary support and subtractive treatment. Shatter's description is
  scoped to restoration, without changing how it works.
- Consistently mark asking-through-forms at city scale as a working proposal,
  matching the status in `World/Locations`. Individual concern with permission
  remains; household authorization and the bridge to city-scale treatment are
  unresolved, not silently decided by this wording.

**Still provisional:** Satisfaction from seeing an intervention work and its
possible connection to needing his effort to matter. This elaborates the working
question rather than adopting a hidden motive. His value hierarchy and attitude
toward the correction's loss remain open.

**Applied:** `Characters/1 Vesper` in live Scrivener and its local website mirror.
No changes to `World/Locations`, the correction's mechanics, or other source
documents. Existing backstory, eight plot beats, relationships, extraction and
combat rules, visual anchors, and ending preserved. No new scene requirement,
biographical event, or literal narrative viewpoint change.

**Status:** decided for the bounded edits; listed proposals remain open.

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
