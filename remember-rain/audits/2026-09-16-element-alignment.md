# Remember Rain — Element Alignment Audit

**Question tested:** for each major element, does the concrete detail as written deliver the function the author's own planning documents claim for it?

**Sources read in full:** `Story Plan/` (all 8 documents), `World/` (History, Locations, Magic System), `Characters/` (all 9 documents incl. `Asylum Patients/Gamer.md`), and every drafted file in `Manuscript/` (`0 Rain intro`, `1 The road less traveled`, `2 The vault`, `3 The charge lands`, `6 Claire and Roxana save Rain`, `Arc 3/2 True silence`, `Arc 5/5 The extraction`, `Arc 5/6 The void`, `Arc 5/7 The return`) plus the 44 scene labels.

## Reading conventions used in this document

- **Quotes are given unescaped.** The raw files carry Scrivener compile escapes (`\#\#`, `\*word\*`). Per `AGENTS.md`, those are an artifact, not content, so quotes below show the readable form. Line numbers are 1-based in the raw file as it exists on disk.
- **`remember-rain/decisions.md` does not exist** as of this audit, and neither does `remember-rain/findings.md`. No finding below re-raises a question the author has already ruled on.
- **Export staleness:** `AGENTS.md` states the Scrivener project is authoritative and this export may lag it. Where a finding could plausibly be a stale-export artifact (E-015 in particular), that is said explicitly rather than treated as settled.
- **Register discipline:** every finding separates **Observation** (what the text says) / **Inference** (what I conclude, labelled as inference) / **Why it matters** / **Candidate resolutions** (options, never decisions). Where a document marks something as working, speculative, or open, that status is respected and reported as status, never promoted to canon. No finding resolves an ambiguity by choosing an answer; where two readings exist, both are stated and the choice is left to the author.

**Type vocabulary** is the one requested for this audit (`gap`, `hierarchy conflict`, `inert element`, `unearned effect`, `load-bearing uncertainty`), with the `AGENTS.md` standing-protocol type given in parentheses for handoff into the register.

---

## Part A — Mechanics and world

### E-001 — Correction is the horror engine, the Arc 4 clock, and the Arc 5 objective, and no document says what it is

**Element:** Correction / the correction apparatus
**Claimed function:** `Story Plan/0 What is Remember Rain.md:23` — "Horror supplies the increasing pressure as correction makes the city easier, quieter, and less alive." Also `Story Plan/1 The Spine.md:7` — "Horror supplies the increasing pressure as correction advances regardless of local wins and finally succeeds against Rain through extraction."
**What the detail actually establishes:**
- `Characters/1 Vesper.md:11` — "antagonist; caregiver, extractor, and architect of the correction"
- `Characters/1 Vesper.md:63` — "The correction scales his ordinary fixing gesture to the city."
- `World/History.md:27` — "The correction advances through accepted relief; it reaches an anchor station only after the amnesty is refused, and breaking the apparatus stops the loop itself."
- `World/Locations.md:25` — "When the correction apparatus and water loop break, the eruption and clean rain are physical consequences rather than the universe approving Rain's choice."
- `Story Plan/1 The Spine.md:85` — "A full lap makes the correction measurable. The same stations appear twice; the boundary moves between passes."
- The taxonomy-owning document contains the word "correction" exactly once, and only to bracket it as unresolved: `World/Magic System.md:17` — "and how correction and stasis affect its circulation—remains unsettled."
**Type:** gap (protocol: `underdefinition`)
**Severity:** blocking
**Observation:** Three documents use correction as a city-scale administered phenomenon with a measurable advancing spatial boundary, an apparatus, and an effect on water circulation. `World/Magic System.md` — which owns the mechanics of memory and wants — defines extraction only as an act performed "through direct contact" (`World/Magic System.md:73`), and states that "Deviations do not permanently rewrite the physical world. Vesper's alteration of memory and identity is the exception." (`World/Magic System.md:69`). No document states how a single eighteen-year-old's touch-based extraction becomes a boundary that takes districts, or which institution operates the apparatus. `World/History.md:21` attributes the Imprint Vault and the deprivation pods to Nimbus under Ministry contracts, but connects neither institution to correction. The advance of the boundary is keyed to a plot event — "it reaches an anchor station only after the amnesty is refused" (`World/History.md:27`) — rather than to any stated process.
**Inference:** I infer that correction is intended to be a delivery system (most plausibly water-borne, given `World/Locations.md:25` pairs "the correction apparatus and water loop" and `Story Plan/Open Questions.md:51` asks about "correction, stasis, and weakening water circulation"), and that this has simply never been written down. I infer also that the narrative-gated advance is a structural guarantee rather than a diegetic mechanism, since no document describes anyone deciding when the boundary moves.
**Why it matters:** Arc 4's entire dramatic clock is the boundary's advance; Arc 5's objective is the apparatus; the story's declared Horror modulation is correction. If correction is extraction-at-scale, it contradicts the direct-contact rule the extraction mechanics rest on, and it casts doubt on `World/Magic System.md:127`'s absolute claim that Rain's extraction is a bounded, personal act. If correction is a separate mechanism, it is a second world-rule that no document taxonomises, and `World/Magic System.md` is not the complete magic reference it claims to be (`World/Magic System.md:3` — "Current canon").
**Open question for the author:** Is correction the same faculty as extraction delivered by infrastructure, or a distinct phenomenon the apparatus merely channels — and if it is the same faculty at city scale, what happened to the direct-contact requirement?
**Candidate resolutions:**
1. *Correction is water-borne extraction*: the Sacred Water loop carries Vesper's effect as a medium; direct contact remains the only route to a *complete* extraction. Cost: `World/Magic System.md` gains a delivery section, and `World/History.md:27`'s "only after the amnesty is refused" must be re-grounded or dropped as an authorial guarantee.
2. *Correction is stasis, not extraction*: the apparatus removes wanting indirectly by suppressing circulation, and Vesper's direct extraction is a separate, personal act. Cost: the vision's phrase "someone who can remove memory and wanting" (`Story Plan/0 What is Remember Rain.md:5`) then names two different agents, and Arc 4's corrected districts no longer demonstrate Vesper's power.
3. *Correction stays deliberately unexplained as institutional weather*. Cost: the genre architecture's claim that "Horror supplies the increasing pressure" loses its escalating antagonist, and the Arc 5 objective ("breaks the correction apparatus") has no defined thing to break.
**Status:** open

---

### E-002 — "Rain thins in corrected districts" is either a world rule or a weather note, and the two readings break different things

**Element:** Correction's effect on a person
**Claimed function:** `Story Plan/0 What is Remember Rain.md:7` — "moves through an asylum, a sensory-deprivation prison, and a city accepting painless correction, he must act without receiving proof that action will make him exceptional or safe."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:85` — "Rain thins in corrected districts."
- `Story Plan/Themes and Motifs.md:61` — "Heavy rain continues through Arcs 1–3, then thins as the correction spreads. Corrected districts in Arc 4 are dry and quiet."
- `Story Plan/Themes and Motifs.md:63` — "**Carriers:** Rain's suspended movement, the city's water system, the correction boundary, and the final train."
**Type:** gap (protocol: `underdefinition`)
**Severity:** significant
**Observation:** The sentence "Rain thins in corrected districts" is the only statement of what correction does to a person on the page. The corpus uses "thins" of weather in the same arc (`Story Plan/Themes and Motifs.md:61`), and the protagonist's name is the weather's name, so the sentence is readable as either (a) Rain the person is diminished by proximity to corrected space, or (b) the rain thins where correction has advanced. No document distinguishes them. The character files record no arc-4 effect on Rain from correction; `Characters/0 Rain.md` attributes his Arc 4 impairment entirely to the Perfect Clone (`Characters/0 Rain.md:101`).
**Inference:** I infer reading (a) would require a distance-based effect on a person, which sits against extraction's direct-contact rule (`World/Magic System.md:73`) and would mean Rain is partially corrected before the finale — a fact that changes what Vesper's extraction actually takes. I infer reading (b) is the harmless one, and that the phrase was most likely written as weather with the name-pun doing double duty.
**Why it matters:** If (a), the direct-contact rule is broken a second time and Rain's Arc 4 state needs a second cause alongside the Clone, which would muddy the spine's single stated causal chain into the extraction (`Story Plan/1 The Spine.md:115`). If (b), then Arc 4 contains no personal consequence of correction for the protagonist at all — the arc's pressure on him is the Clone and his parents' silence only, and "city accepting painless correction" stays scenery. Either way the sentence cannot currently be drafted literally.
**Open question for the author:** Does correction reach Rain personally in Arc 4, or is "thins" the weather thinning while he watches?
**Candidate resolutions:**
1. *Weather only*: rewrite to "The rain thins in corrected districts." Cost: one less direct pressure on Rain; the line stops saying anything about him.
2. *Personal and unexplained*: keep the ambiguity deliberately and let players read it either way. Cost: the direct-contact rule becomes unreliable in the reader's hands, and Arc 5's "100%" claim (`World/Magic System.md:127`) starts to look negotiable.
3. *Personal with a mechanism*: correction's boundary degrades wanting in proportion to exposure, as a partial, non-extractive effect. Cost: `World/Magic System.md` must add a graded-exposure rule, and the specificity of Vesper's precision (`World/Magic System.md:75`) is diluted.
**Status:** open

---

### E-003 — The Ghost is perceived and used by someone who is not its owner, and no rule permits a passive to transfer

**Element:** The Ghost (Rain's passive) / Roxana's escape
**Claimed function:** `Story Plan/1 The Spine.md:61` — "His choice sends the Ghost toward Roxana, whose acceptance of help creates the escape." Also `Characters/0 Rain.md:95` — "**The Ghost:** his private passive, a faded-gold figure with an open, upward palm."
**What the detail actually establishes:**
- `World/Magic System.md:25` — "**Passive.** A person's involuntary, uncontrolled resonance. Its ordinary expression is personal; the owner is the only person who directly perceives it."
- `Story Plan/1 The Spine.md:71` — "The Ghost is expelled toward Roxana while Rain remains unaware."
- `Story Plan/1 The Spine.md:73` — "the Ghost offers an open hand that asks nothing. Roxana accepts."
- `Story Plan/1 The Spine.md:99` — "Rain mistakes the dimming Ghost and easier feeling of letting the projection act for relief" (Arc 4, so Rain still perceives it later)
- `Characters/Roxana.md:53` — "She accepts the Ghost's open hand and produces a raw spark without the lighter."
**Type:** hierarchy conflict (protocol: `contradiction`)
**Severity:** blocking
**Observation:** The Ghost is Rain's passive, and the magic system states flatly that "the owner is the only person who directly perceives it." Roxana both perceives it and transacts with it in Arc 3 scene 5. Rain then perceives it again in Arc 4 scene 9. No document states that a passive can be transferred, lent, shared, or perceived by a non-owner, and no document marks the Arc 3 handoff as an exception to the owner-only rule. The adjacent registered question is about Imprints, not passives: `Story Plan/Open Questions.md:43` — "Can the same Imprint resonate strongly with more than one person, and what happens to an existing bond?"
**Inference:** I infer the intended reading is that an extreme event forces a passive to detach and appear to a second person, and that the owner-only sentence in `World/Magic System.md:25` was written for ordinary expression without anticipating this scene. The hedge "ordinary" may be intended to scope the second clause, but it does not clearly do so, and nothing in the story marks the event as extraordinary from the rules' point of view.
**Why it matters:** Arc 3's escape — the mechanism that moves the plot from the prison to the Circuit Line and therefore to the entire back half of the story — depends on this transfer. If it is an unmarked exception, the reader has no rule by which to judge what the Ghost is at the end, when the finale depends on Rain performing its gesture "without summoning" it (`Story Plan/1 The Spine.md:121`). If it violates the rule, a locked constraint is already broken before the finale.
**Open question for the author:** Can a passive detach from its owner and act on a second person — and if so, whose passive is the Ghost for the rest of the story?
**Candidate resolutions:**
1. *Passives can detach under extreme pressure*: add a constraint to `World/Magic System.md` covering involuntary detachment, its cost, and its duration. Cost: `World/Magic System.md:25` must be rewritten, and detachment becomes available to every passive in the cast (Claire's Static, the Pursuer's Furnace) unless bounded.
2. *The Ghost is not Rain's passive in the ordinary sense*: it is an unclassified manifestation, which is why it can be seen by two people. Cost: `Characters/0 Rain.md:95` — "his private passive" — and the closed gold vocabulary (`Story Plan/Themes and Motifs.md:161`, "`faded` — the Ghost; wanting not yet acted on") both need revising.
3. *The handoff is Roxana's perception, not the Ghost's travel*: she experiences her own passive's breakthrough shaped by Rain's presence. Cost: `Story Plan/1 The Spine.md:71`'s "expelled toward Roxana" must be rewritten, and the "external POV cut" scene loses its centrepiece.
**Status:** open

---

### E-004 — The prison spark produces Roxana's Deviation effect through Rain's passive, and the lender pays nothing

**Element:** The prison spark / magic costs
**Claimed function:** `World/Magic System.md:55` — "Every Deviation pays through the same system the user employs. Cost scales with use and cannot be bypassed." Also the locked constraint at `World/Magic System.md:153` — "Costs are real, scale with use, and cannot be bypassed."
**What the detail actually establishes:**
- `World/Magic System.md:49` — "Under extreme emotional or physical pressure, a passive may briefly break into the world without an Imprint. This is uncontrolled, difficult to repeat, and severely costly. Roxana's spark in the prison is the main example."
- `Characters/Roxana.md:79` — "**Empathic Burn:** Roxana involuntarily echoes nearby bodily pain through her own nervous system."
- `Characters/Roxana.md:89` — "**Passive breakout:** in the prison, accepting the Ghost's open hand lets her produce one raw spark without the lighter. It nearly empties her and is not a new reliable technique."
- `Story Plan/1 The Spine.md:73` — "A raw spark passes through the scars and burns through both seals."
**Type:** hierarchy conflict (protocol: `contradiction`)
**Severity:** blocking
**Observation:** The rule anticipates this exact scene and classifies it as a *passive* breaking into the world. Roxana's passive is Empathic Burn, whose defined expression is echoing bodily pain. The effect actually produced is a raw spark that "burns through both seals" — fire, which is the signature of Undying Flame, her *Deviation*, whose deliberate use requires the lighter Imprint (`Characters/Roxana.md:81`, `World/Magic System.md:145`). Separately, the cost falls only on Roxana ("It nearly empties her"); Rain, whose passive is the thing being used, pays nothing, though costs are declared impossible to bypass.
**Inference:** I infer the scene was designed for its emotional shape — accepting help produces the breakthrough that frees them — and that the faculty producing the spark was not checked against the taxonomy. I further infer that no cost was assigned to Rain because the scene is Roxana's, not because a cost was considered and waived.
**Why it matters:** Roxana's Undying Flame and her breakout are the two fire events in the story, and the finale's closing image (she "fills the lighter with her own flame," `Story Plan/1 The Spine.md:123`) depends on the reader being able to tell the unlit-lighter flame apart from an unlit spark. If the spark is visually the same fire, the finale has no distinct register. And if lending a passive is free, `World/Magic System.md:153` is no longer a locked constraint but a statement with an unlisted exception.
**Open question for the author:** What faculty produces the prison spark, and what does Rain pay for it?
**Candidate resolutions:**
1. *The spark is Empathic Burn's breakthrough, not fire*: it manifests as a shared-pain event that lets her move rather than a flame. Cost: `Story Plan/1 The Spine.md:73`'s "burns through both seals" and the "raw spark" language must be rewritten, and the two-seal image loses its obvious mechanism.
2. *The spark is Undying Flame without the Imprint, and Rain pays*: add a cost to Rain (the Ghost dims, or he loses time). Cost: introduces a second user of Roxana's Deviation, which cuts against "The Deviation belongs to the person and is unique to that bonded relationship" (`World/Magic System.md:29`).
3. *The Ghost's hand is the Imprint-equivalent for one use*: Rain's passive substitutes for the missing object, and both pay. Cost: creates a precedent that a passive can stand in for any Imprint, which trivialises the Imprint requirement story-wide.
**Status:** open

---

### E-005 — The Split's first appearance is filed under a term that appears nowhere else in the story

**Element:** The Split
**Claimed function:** `Characters/0 Rain.md:103` — "**The Split:** Rain's record of past failure in his own voice. It is unmarked at first and italicized after the mountain."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:65` — "Rain enters the white void and meets the suit-self that calls him a coward."
- `Story Plan/1 The Spine.md:71` — "The Split receives its first distinct mark."
- `Story Plan/Themes and Motifs.md:79` — "The Split speaks in Rain's voice as a ledger of failure."
- `Manuscript/Arc 3 - Prisoner/2 True silence.md:43` — "A faint sheen in his hair. A pair of square glasses... The loosely hanging dark grey business suit..."
**Type:** gap (protocol: `terminology drift`)
**Severity:** significant
**Observation:** "Suit-self" occurs exactly once in the corpus, at `Story Plan/1 The Spine.md:65`. The word "Split" occurs nowhere in Arc 3 except the mountain scene, where it "receives its first distinct mark." `Characters/0 Rain.md:103` requires the Split to be "unmarked at first," which implies an earlier appearance — and Arc 3 scene 2 is the only candidate. The drafted prose calls the figure "me," "my replica," and "a thorough contradiction of everything I was," and gives it a business suit, glasses, and stubble that Rain does not have.
**Inference:** I infer the suit-self is the Split's unmarked early appearance, and that the Arc 3 drafting handle simply predates the Split's naming. But I cannot confirm this from the text, and the alternative reading — that the void figure is a fourth manifestation distinct from the Split — is equally available, since `Characters/0 Rain.md:91` lists only "The Ghost, Clone, Perfect Clone, and Split."
**Why it matters:** The Split's whole arc is built on an unmarked-to-marked transition (`Story Plan/Themes and Motifs.md:81` — "The Split is unmarked early and italicized after the mountain"). If Arc 3 scene 2 does not establish the Split, then the mountain's "first distinct mark" is actually its first appearance, and the finale's refusal to remove it (`Story Plan/1 The Spine.md:121`) asks the reader to care about a presence introduced two scenes earlier. The appearance detail — a suit, glasses, and professional grooming — also does not obviously match "Rain's record of past failure," since it is the one thing in the void that looks like success.
**Open question for the author:** Is the suit-self the Split's unmarked appearance, or a separate manifestation?
**Candidate resolutions:**
1. *Rename it in the spine*: the Arc 3 scene reads "meets the Split, which calls him a coward." Cost: the drafting handle `a3s02` and any prose already using "suit-self" need the same change, and the scene loses the useful ambiguity about whether it is an entity.
2. *Keep both terms and link them explicitly in `Characters/0 Rain.md`*: "its first appearance, in the void, is unlabelled and takes the form of a suited, groomed self." Cost: `Story Plan/1 The Spine.md` keeps a synonym the register must carry.
3. *Make the suit-self a distinct manifestation*. Cost: `Characters/0 Rain.md:91`'s section heading and `Story Plan/Themes and Motifs.md:159`'s closed gold vocabulary both need a fourth entry.
**Status:** open

---

### E-006 — The three Melts: the mother-Melt does not say whose memory died, and one reading contradicts a stated fact about Vesper

**Element:** The three Melts
**Claimed function:** `Characters/1 Vesper.md:101` — "Only three Melts are intended: his mother; one unknown person used as deliberate proof; and Roxana, intentionally, from distorted compassion and a desire for her unyielding behavior."
**What the detail actually establishes:**
- `Characters/1 Vesper.md:21` — "Five years of experimentation and escalating success have made his conclusions feel complete because he reached them quickly and has forgotten none of the evidence."
- `Characters/1 Vesper.md:43` — "The abandonment became the first memory he could not stop replaying, and he later bonded with the object she had left behind."
- `Characters/1 Vesper.md:45` — "A private fear of resembling her sits beneath that impatience."
- `Characters/1 Vesper.md:85` — "His passive is involuntary high-fidelity replay. His own memories can intrude without invitation"
- `World/Magic System.md:99` — "Melt destroys the autobiographical memory for both the original owner and Vesper. It cannot be restored."
- `World/Magic System.md:113` — "Melt does not transfer the original emotion, relationship, worldview, Deviation, or lived meaning."
- `World/Magic System.md:103` — what survives is listed as "habits and reflexes; practiced movement; speech rhythms; instinctive reactions; bodily preferences or mannerisms."
**Type:** hierarchy conflict (protocol: `underdefinition`)
**Severity:** blocking
**Observation:** "His mother" names a Melt without saying whether the destroyed memory belonged to Vesper or to her. On the reading that Vesper melted his own memory of the abandonment, `Characters/1 Vesper.md:21`'s "has forgotten none of the evidence" is false. On the reading that he melted her memory of abandoning him, she has lost her reason for leaving and remains absent (`Characters/1 Vesper.md:45`) for a reason he destroyed. Under either reading, `Characters/1 Vesper.md:45`'s "private fear of resembling her" must survive a Melt, while `World/Magic System.md:113` excludes emotion and relationship from what Melt leaves behind and `World/Magic System.md:103` lists only procedural and behavioural residue. Separately, `Characters/1 Vesper.md:101`'s "one unknown person used as deliberate proof" states that a Melt was performed instrumentally — to prove something — and no document says what, while `Story Plan/Open Questions.md:15` asks only what each Melt destroyed and what residue remains. The corpus also never states whether Vesper can Melt his own memory, which "extracts... through direct contact" (`World/Magic System.md:73`) does not obviously permit.
**Inference:** I infer the author intends the mother-Melt to be Vesper's own, since it explains why his passive's replay is his defining burden and why the Widower's case (`Characters/The Widower.md:7`, an uncontrollable replay loop removed by Vesper) reads as a self-portrait. I infer the "deliberate proof" Melt exists to give his history a colder act than compassion allows, but its purpose was never fixed.
**Why it matters:** Vesper's whole character is his motivation (`Characters/1 Vesper.md:19` — "His coercion comes from certainty"; `Characters/1 Vesper.md:47` — "Vesper's throughline is premature completion"). If the fear that drives him was destroyed by his own hand, his five years of escalating correction are a man acting on a residue he cannot explain — a different and arguably stronger character — and every line of `Characters/1 Vesper.md:43–47` needs re-reading. If it was her memory he destroyed, then his first correction was his mother, which is a fact the story never uses. The two readings cannot both be drafted.
**Open question for the author:** When the plan says Vesper Melted "his mother," whose autobiographical memory was destroyed — his, or hers?
**Candidate resolutions:**
1. *It was Vesper's own memory*: his fear of her is an unexplained residue, and "has forgotten none of the evidence" is narrowed to the evidence of his experiments. Cost: `Characters/1 Vesper.md:21` and `:45` need rewriting, and `World/Magic System.md:103` may need emotional residue added to what Melt leaves.
2. *It was her memory*: Vesper erased his mother's reason for leaving him; he retains everything. Cost: his mother becomes a live, locatable character rather than an absence, which cuts against `Characters/1 Vesper.md:117` — "His mother never appears in flashback."
3. *The Melt was mutual*: the transition destroyed the shared memory in both. Cost: requires a rule that Melt can span a relationship, which `World/Magic System.md:73`'s single-target framing does not currently support.
**Status:** open

---

### E-007 — The beloved life is described as a preserved possibility and as a life actually lived, and the stated reason for ending it depends on the first description

**Element:** The beloved life and the mountain (Arc 3's exit)
**Claimed function:** `Story Plan/1 The Spine.md:71` — "The beloved life comes last, lasts longest, and is genuinely happy. Rain ends it because a preserved possibility cannot acquire consequences beyond itself, not because it was false or hid a truer self."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:67` — "Time dilation lets Rain live possible lives whole. The first is fully rendered; later lives compress from scenes to paragraphs to lines. They feel real but cannot acquire consequences outside themselves."
- `Story Plan/Arc Structure.md:15` — "**Possibility itself has value.** Rain leaves the beloved life because preserved possibility cannot acquire consequences beyond itself, not because it was false."
- `Story Plan/Choice Points.md:45` — "Rain never ends the beloved life. It remains valuable and does not need to reveal itself as false."
- `Story Plan/0 What is Remember Rain.md:11` — "**Becoming is unavoidable.** People are embodied, limited, conditioned, and continually changed by reality; nobody can remain a perfectly preserved possibility."
- `Story Plan/Choice Points.md:97` — "Rain ends the beloved life himself. Do not make the player click to kill her."
**Type:** hierarchy conflict (protocol: `vision misalignment`)
**Severity:** significant
**Observation:** The reason given for ending the beloved life is that a *preserved possibility* cannot acquire consequences beyond itself. But the same plan says the lives are lived whole, that this one "lasts longest," that it is "genuinely happy," and that Rain "live[s] possible lives whole." A life lived at length, with a person in it whom the plan calls "her," is not a preserved possibility — it is a lived one, with consequences inside it. The vision's claim that "nobody can remain a perfectly preserved possibility" therefore cannot supply the reason for leaving: inside the life, Rain *is* becoming. The only thing the life lacks is external consequence.
**Inference:** I infer the plan is using "preserved possibility" to mean "a possibility that cannot cross the boundary," which is a claim about scope rather than about whether the life was lived. I infer the tier-1 justification was written for the pitfall (a life you refuse to leave) and inherited by the exit (the scene where you do leave), where the wording no longer fits.
**Why it matters:** This is Arc 3's thematic centre and the story's stated answer to what falling means (`Story Plan/What does it mean to fall.md:3` — "Falling is the decision to enter consequence before certainty arrives"). If the beloved life's consequences are real within itself, leaving it is choosing one consequence-set over another, not choosing consequence over preservation — and the vision's own test ("nobody remains a perfectly preserved possibility") is passed by the life he abandons, not by the decision to leave it. The finale also depends on the parallel: Rain's extraction later leaves him with a completed story he cannot inhabit, which is the same structure as a lived life he cannot keep.
**Open question for the author:** Is the beloved life a possibility *preserved* (unentered) or a life *lived* (entered and relinquished) — and if lived, what exactly does Rain preserve by leaving?
**Candidate resolutions:**
1. *Restate the reason as scope*: "Rain ends it because its consequences cannot reach anyone else, not because it was false." Cost: the vision's "preserved possibility" language is no longer quoted as the justification, and Arc 3's thematic line must be rewritten in `Story Plan/Arc Structure.md:15` too.
2. *Make the beloved life genuinely unentered*: it is offered, not lived, and Rain declines before entering it. Cost: it can no longer "last longest" or hold bodies on the mountain (E-008), and the arc loses its time-dilation showcase.
3. *Accept the tension as intentional*: leaving is not superior to staying, and the story says so by refusing to reward it. Cost: needs an on-page marker, since `Story Plan/1 The Spine.md:71`'s causal "because" currently asserts a reason rather than staging a choice between equals.
**Status:** open

---

### E-008 — "The mountain holds the bodies of valuable lives relinquished" has no established referent in a register declared unable to leave traces

**Element:** The mountain (Arc 3)
**Claimed function:** `Story Plan/1 The Spine.md:71` — "The mountain holds the bodies of valuable lives relinquished."
**What the detail actually establishes:**
- `Story Plan/Choice Points.md:81` — "More lives create a larger graveyard on the mountain, but do not unlock a better ending."
- `Story Plan/Choice Points.md:85` — "The dream register cannot introduce plot facts required by the spine. It can reveal emotional truth."
- `Story Plan/1 The Spine.md:67` — "They feel real but cannot acquire consequences outside themselves."
- `Story Plan/1 The Spine.md:75` — "Rain carries her out of Aster's grave." (the prison, in the real world)
- `World/Locations.md:25` — "Its caldera contains the Central Circulation Hub, the strongest natural reservoir in the loop, and the Arc 5 setting."
**Type:** gap (protocol: `underdefinition`)
**Severity:** significant
**Observation:** The mountain in Arc 3 is inside the lives and inside the pod. It accumulates physical remains — "bodies," a "graveyard" whose size tracks how many lives the player entered — in a register the same document says cannot produce consequences beyond itself. No document says whose bodies these are, whether they are the body of the beloved life's person (who is a "her," per `Story Plan/Choice Points.md:97`), whether they are Rain's own discarded lives, or whether the mountain is a dream-place at all. A second grave exists in the same arc in the real world: the prison is "Aster's grave" (`Story Plan/1 The Spine.md:75`). Arc 5 then has a third elevation, "the summit road" toward the caldera (`Story Plan/1 The Spine.md:107`), with no stated relation to Arc 3's mountain.
**Inference:** I infer the mountain is intended as a dream-architecture that makes the cost of entering lives visible — a ledger Rain walks through — and that "bodies" is doing figurative work. I infer the relationship between the Arc 3 mountain, the prison as Aster's grave, and the Arc 5 caldera was never fixed, and that the shared noun is coincidence of both being high ground.
**Why it matters:** Two of the three graves in the story are the same image, and the third is where the story ends. If the mountain's bodies are figurative, then the pitfall rule "More lives create a larger graveyard" is a rule about a picture, and the cost of lingering is aesthetic rather than dramatic — which weakens the only stated difference between entering many lives and entering few. If they are literal, then the dream register does produce a lasting physical fact, contradicting `Story Plan/Choice Points.md:85` and the "cannot acquire consequences outside themselves" rule that the pitfall's logic rests on.
**Open question for the author:** What is on the mountain — a figure of speech, a dream-ledger, or remains — and does anything Rain does inside the lives leave a mark he can return to?
**Candidate resolutions:**
1. *Figurative*: the mountain is where Rain *sees* what he has relinquished, and it persists only while he is inside. Cost: the pitfall's "larger graveyard" has no mechanical weight, and the mountain becomes scenery for a monologue the story has forbidden itself.
2. *Literal but internal*: the bodies are Rain's relinquished selves, visible only to him, and they do not survive the pod. Cost: `Story Plan/1 The Spine.md:71`'s "valuable lives" needs to say whose bodies, and the image risks reading as a soul-count.
3. *Literal and external*: the apparatus materialises them and the mountain is real. Cost: contradicts `Story Plan/Choice Points.md:85`, and the prison-as-Aster's-grave image loses its singularity.
**Status:** open

---

### E-009 — "100%" extraction and surviving semantic knowledge are reconciled by assertion, and no document models what kinds of memory exist

**Element:** Extraction, its completeness, and Rain's surviving knowledge
**Claimed function:** `World/Magic System.md:127` — "Vesper succeeds completely. Direct contact extracts **100% of Rain's autobiographical target**: every lived relationship, fear, choice, emotion, and connected context up to contact. There is no shield, hidden soul, secret autobiographical fragment, incomplete extraction, or protagonist immunity."
**What the detail actually establishes:**
- `World/Magic System.md:129` — "Rain remains factually informed because Arc 3 repeatedly trained his mind through life → completion → life subsequently known as story. That made semantic knowledge unusually independent from autobiographical ownership. The Perfect Clone deepened the same fracture by leaving accurate outcome without felt accomplishment. Those are downstream encodings outside Vesper's autobiographical target, not resistance to it."
- `World/Magic System.md:121` — "Factual access and felt ownership remain distinct. Accurate access to a completed record does not automatically make it feel personally inhabited, and loss of ownership does not make the record inaccurate."
- `Story Plan/1 The Spine.md:117` — "Arc 3 and Perfect Clone have left an independently encoded semantic record, so the completed story remains accurate fact without autobiographical access"
- `Characters/The Widower.md:15` — "He can recount his wife's death fluently—what happened, when, and what he did afterward—without emotional ownership"
**Type:** gap (protocol: `underdefinition`)
**Severity:** significant
**Observation:** The system's guarantee that nothing shielded survives rests on a distinction between "autobiographical target" and "downstream encodings," and the distinction is asserted rather than modelled. No document defines what an encoding is, how semantic knowledge is stored separately from autobiographical memory, why knowing a completed life as a story creates that separation, or what the boundary between the two contains. The Widower demonstrates the same dissociation as an extraction effect (`Characters/The Widower.md:15`), which supports the mechanism being general rather than a protagonist exception — but it also means the story has two unrelated causes (extraction, and living dream lives) producing one identical outcome, with a mechanism described for neither.
**Inference:** I infer the author's intent is that the distinction is real and the "100%" claim is honest, and that the missing piece is a short statement of what the split consists of, not a revision of the outcome. I infer the risk the prohibition on shields was written to close — a reader concluding the extraction was partial — is not closed by the current wording, because the outcome of a complete extraction and a partial one look identical unless the split is defined.
**Why it matters:** The ending's meaning depends entirely on Vesper having taken everything. If a reader concludes Rain kept something, Vesper's victory shrinks, his final error loses its force (`World/Magic System.md:135` — "His evidence is accurate; his error is believing a completed account authorizes the next response"), and the vision's claim that "Vesper remembers Rain's completed past more completely than Rain experiences it himself" (`Story Plan/0 What is Remember Rain.md:37`) becomes arguable. The void's whole premise — "**Only** *you* remains" (`Story Plan/1 The Spine.md:117`) — rests on this too.
**Open question for the author:** What is the difference between autobiographical memory and the "downstream encodings," stated as a rule rather than as an outcome?
**Candidate resolutions:**
1. *Name the split explicitly*: define autobiographical ownership as first-person experiential access and everything else as propositional knowledge, and say which one Vesper's prism stores. Cost: `World/Magic System.md` grows a section, and the Widower must be re-read as a partial demonstration of a general rule rather than a case study.
2. *Make it a trained skill, not a property*: Arc 3 taught Rain a practice (knowing his own life as a story) that survives because it is procedural. Cost: Rain's survival becomes a rare personal achievement, which needs guarding against reading as exactly the "protagonist immunity" `World/Magic System.md:127` forbids.
3. *Leave it unexplained but tie it to an established image*: the notebook and the record motif carry it and no technical claim is made. Cost: `World/Magic System.md:127`'s emphatic "100%" becomes an authorial assertion the mechanics do not support, in a document that claims to be the canon reference.
**Status:** open

---

### E-010 — The Perfect Clone's dose-response and recovery are unspecified, and two climaxes depend on impairment being present in one and absent in the other

**Element:** The Perfect Clone and its cost
**Claimed function:** `Story Plan/1 The Spine.md:115` — "Perfect Clone has worked effectively throughout the approach, but repeated use has compounded the friction between Rain's decision and his real body's initiation. He knows the correct response and begins it too late."
**What the detail actually establishes:**
- `Characters/0 Rain.md:101` — "Repeated use temporarily compounds friction in his want → commit → act pathway: he retains desire and knowledge but loses felt authorship and struggles to initiate action. The dimming Ghost is a symptom of that recoverable impairment, not a finite resource being consumed."
- `Story Plan/1 The Spine.md:119` — "retained semantic and procedural knowledge let him set out the ordinary intangible Clone as the expected target. Vesper commits to the copy while the injured real Rain takes the consequential position, receives the blow, and catches him himself."
- `Characters/0 Rain.md:105` — "Ordinary Clone and Perfect Clone remain alternate expressions, one projection at a time."
- `Story Plan/1 The Spine.md:107` — "Rain is already relying on the Perfect Clone."
- `Story Plan/Open Questions.md:57` — "How long does Rain need to recover from ordinary Clone sensory disruption and Perfect Clone initiation impairment at different loads?"
**Type:** load-bearing uncertainty (protocol: `underdefinition`)
**Severity:** blocking
**Observation:** The spine needs accumulated initiation friction to be *present and decisive* at the extraction (`Story Plan/1 The Spine.md:115`), and then needs Rain to author a scripted Clone behaviour, take a real blow, and catch Vesper three scenes later (`Story Plan/1 The Spine.md:119`). Recovery duration is not stated. It is also not stated whether the friction is specific to the Perfect Clone expression or cumulative across the Deviations of the goggles — which matters because Rain could have used the ordinary Clone during the approach, whose cost is a different one (`Characters/0 Rain.md:99`, sensory anchoring rather than initiation).
**Inference:** I infer the intended shape is that friction accumulates and decays slowly enough to persist across Arcs 4–5, and that the recovery is fast enough (or the demand low enough) to permit scene 7 — but I cannot derive either from the text. I infer the arc-5 approach was written to have the Perfect Clone active at the hinge without a rule preventing Rain from switching expressions to avoid the cost.
**Why it matters:** The single most important plot beat in the story — Vesper obtaining contact — is caused by this cost. If friction decays quickly, the extraction has no cause and the hinge disappears. If it does not decay, Arc 5 scene 7 cannot happen as written, and the finale's demonstration that Rain can still act has no mechanism. The "Ordinary Clone and Perfect Clone remain alternate expressions" rule also means the story must explain why a character capable of switching to the cheap expression kept using the expensive one.
**Open question for the author:** Over what timescale does Perfect Clone initiation friction accumulate and clear, and is it specific to that expression or shared with the ordinary Clone?
**Candidate resolutions:**
1. *Cumulative and slow, with a stated floor*: friction accumulates across both expressions and clears over days, and the extraction occurs inside the window. Cost: Arc 5's elapsed time must be compressed, which has to be reconciled with `Story Plan/1 The Spine.md:105`'s approach sequence.
2. *Expression-specific, with the switch deliberately avoided*: Rain does not switch because the ordinary Clone cannot counterfeit impact, so the Fidelity is worth the cost. Cost: requires an on-page statement of that reasoning, since Rain is otherwise written as someone who avoids risk.
3. *The extraction is caused by the Clone's benefit, not its cost*: the seamless counterfeit is what lets Vesper reach the real body. Cost: rewrites `Story Plan/1 The Spine.md:115` and changes Vesper's win from exploiting impairment to defeating a decoy.
**Status:** open

---

## Part B — Structure, choice, and interaction

### E-011 — The pitfall exit is unlabeled by design, and nothing says how the player takes it

**Element:** The four comfortable exits and the reconvergence rule
**Claimed function:** `Story Plan/Choice Points.md:17` — "> Retreat is a labeled button. Commitment is not." Also `Story Plan/Choice Points.md:19` — "Leaving a pitfall begins through the Ghost, shown without a label or explanation."
**What the detail actually establishes:**
- `Story Plan/Choice Points.md:3` — "`Story Plan/1 The Spine.md` owns scene order; protected story events remain Rain's or another character's actions rather than player branches." (and the same document states it "owns interaction behavior and false-ending rules")
- `Story Plan/Choice Points.md:29` — "The Ghost appears as a possible exit, later and dimmer each time."
- `Story Plan/Choice Points.md:31` — "When the Ghost stops appearing, the trap ending begins."
- `Story Plan/Choice Points.md:33` — "Skipping reaches the ending faster; it does not break the loop."
- `Story Plan/Choice Points.md:61` — "Leaving a pitfall returns to the next spine scene."
- `Story Plan/Choice Points.md:67` — "No hidden morality score."
**Type:** gap (protocol: `causal gap`)
**Severity:** blocking
**Observation:** The document that owns interaction behaviour specifies that the exit exists, that it is unlabeled, that it dims with each cycle, and that when it stops appearing the trap ending begins. It does not specify how the player selects the exit: whether it is a dialogue option that appears among ordinary ones, an environmental interaction, a repeated click on the Ghost, or the absence of a choice. Nor does it specify how many cycles a pitfall runs, whether the count resets on leaving, or whether dimming is per-pitfall or cumulative across all four. `Story Plan/Choice Points.md:67`'s "No hidden morality score" rules out the one feedback channel that would otherwise tell a player they are progressing.
**Inference:** I infer the intended design is that the player learns the Ghost's appearance itself is the exit, and that the countdown is communicated solely by its dimming. I infer the implementation was left open because the design is legible in prose but has not been translated into a choice schema, which is the document's stated job.
**Why it matters:** This is the visual novel's central interaction. Without a specified affordance, the pitfall is either escapable only by guessing (players reach a trap ending without having chosen one, which `Story Plan/Choice Points.md:55` explicitly forbids — "The intended response is recognition and grief, not embarrassment"), or trivially escapable (the unlabeled option is visibly the odd one out, which destroys "shown without a label or explanation"). The scene order in the spine cannot be built until this is fixed, because whether a pitfall is one scene or a variable-length loop determines how many scene documents exist.
**Open question for the author:** What does the player physically do to leave a pitfall, and how many cycles does a pitfall run before the Ghost stops appearing?
**Candidate resolutions:**
1. *The Ghost is a repeatable environmental interaction*: selecting it is always available while it appears, and it dims on each use. Cost: needs a UI affordance that is unobtrusive enough not to read as a labeled retreat button, which is a real art and layout problem.
2. *The exit is a choice node with an unremarkable option*: one option among several is the Ghost, worded without comment. Cost: an unremarkable option in a list is still a labeled button in practice, and `Story Plan/Choice Points.md:17` is undercut.
3. *The exit is a non-choice*: the pitfall advances automatically after a set number of cycles, and "leaving" is continuing to play. Cost: removes player agency from the only mechanic that has any, and `Story Plan/Choice Points.md:83` ("The player chooses when to stop entering lives") is no longer true.
**Status:** open

---

### E-012 — The dimming Ghost carries two incompatible meanings, and one of them is declared to be a symptom that recovers

**Element:** The Ghost's dimming / the pitfall countdown
**Claimed function:** `Story Plan/Choice Points.md:29` — "The Ghost appears as a possible exit, later and dimmer each time." Also `Story Plan/Choice Points.md:31` — "When the Ghost stops appearing, the trap ending begins."
**What the detail actually establishes:**
- `Story Plan/Themes and Motifs.md:81` — "It dims as repeated Perfect Clone use impairs Rain's felt authorship and action initiation, then can recover as that temporary impairment does."
- `Characters/0 Rain.md:101` — "The dimming Ghost is a symptom of that recoverable impairment, not a finite resource being consumed."
- `Story Plan/1 The Spine.md:99` — "Rain mistakes the dimming Ghost and easier feeling of letting the projection act for relief"
- `Story Plan/Choice Points.md:65` — "No penalty for having lingered."
- `Story Plan/Themes and Motifs.md:161` — "`faded` — the Ghost; wanting not yet acted on"
**Type:** hierarchy conflict (protocol: `contradiction`)
**Severity:** significant
**Observation:** Dimming is assigned two causes with opposite implications. In `Story Plan/Choice Points.md` it is the pitfall's clock: monotonic, terminating in the trap ending when it stops. In `Story Plan/Themes and Motifs.md:81` and `Characters/0 Rain.md:101` it is a mechanical cost symptom that recovers with rest and is explicitly "not a finite resource being consumed." A player who has learned the second rule will read Arc 4's dimming Ghost as a Clone-cost warning rather than as the story's one signal that an exit is closing. Separately, if dimming persists across cycles and across pitfalls, it is a state change caused by lingering, which sits against "No penalty for having lingered."
**Inference:** I infer the two meanings were developed independently — the pitfall rules in the interaction document, the Clone cost in the mechanics and character documents — and that Arc 4 scene 9's use of the dimming Ghost (`Story Plan/1 The Spine.md:99`) is the point where they collide, since the scene needs Rain to misread a Clone symptom as relief while the room also needs the player to feel a loop closing.
**Why it matters:** The pitfall rules' fourth rule, "When the Ghost stops appearing, the trap ending begins," is the only stated trigger for all four false endings. If the Ghost can stop appearing for a recoverable mechanical reason, the trigger is ambiguous, and the false ending can begin without the player having lingered — or fail to begin while they have. The final refusal's power also depends on the gesture being performable without the Ghost (`Story Plan/1 The Spine.md:121`), which requires the reader to have a stable idea of what the Ghost's absence means.
**Open question for the author:** Does the Ghost have one dimming scale or two, and does the pitfall countdown share a channel with the Perfect Clone's cost?
**Candidate resolutions:**
1. *Split the signals*: Clone cost shows as flicker or doubled vision; the Ghost's dimming is exclusively the pitfall clock. Cost: `Story Plan/Themes and Motifs.md:81` and `Characters/0 Rain.md:101` both need rewriting, and the Clone's cost loses its visible tell.
2. *One scale, two readers*: dimming is always the Clone cost, and the pitfall's clock is signalled differently (the Ghost's position, its direction, or how far it leads). Cost: `Story Plan/Choice Points.md:29` must be rewritten, and the pitfall loses the one image the rules already share.
3. *Dimming is cumulative and permanent within a pitfall, and recovers on reconvergence*: the cost reading is true, and lingering changes nothing after leaving. Cost: requires stating that reconvergence restores the Ghost, which makes leaving a pitfall visibly consequence-free — the thing `Story Plan/Choice Points.md:63` wants and the drama may not.
**Status:** open

---

### E-013 — The Arc 3 pitfall cannot be left by the declared mechanism, and its "optional" content includes the life the spine requires

**Element:** The Arc 3 pitfall ("Stay in the life") and the reconvergence rule
**Claimed function:** `Story Plan/Choice Points.md:19` — "Leaving a pitfall begins through the Ghost, shown without a label or explanation." Also `Story Plan/Choice Points.md:61` — "Leaving a pitfall returns to the next spine scene."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:71` — "The Ghost is expelled toward Roxana while Rain remains unaware."
- `Story Plan/1 The Spine.md:61` — "His choice sends the Ghost toward Roxana, whose acceptance of help creates the escape."
- `Story Plan/Choice Points.md:83` — "The player chooses when to stop entering lives. Rain ends the beloved life himself."
- `Story Plan/Choice Points.md:75` — "The lives are both optional-content space and the Arc 3 pitfall."
- `Story Plan/1 The Spine.md:71` — "The beloved life comes last, lasts longest, and is genuinely happy."
- `Story Plan/Arc Structure.md:15` — "Can you end every life you could have lived, even the one where you were happy?"
- `Story Plan/Choice Points.md:45` — pitfall 3's spine continuation is "The mountain"
**Type:** hierarchy conflict (protocol: `contradiction`)
**Severity:** blocking
**Observation:** For pitfalls 1, 2, and 4, the entry is a spine scene and the continuation is the next spine scene, so the Ghost can appear inside the pitfall's cycles. For pitfall 3, the continuation *is* the mountain scene, in which the Ghost's defining event is its expulsion toward Roxana — meaning the Ghost leaves Rain as the pitfall is exited. So the exit either requires the Ghost to appear inside the lives before it departs, which no document states, or the Arc 3 pitfall has no Ghost exit at all. Simultaneously, `Story Plan/Choice Points.md:75` calls the lives "optional-content space" while `Story Plan/1 The Spine.md:71` and `Story Plan/Arc Structure.md:15` make the beloved life the arc's required centre, and `Story Plan/Choice Points.md:83` lets the player stop entering lives at any point.
**Inference:** I infer the author's intent is that the Ghost guides Rain out of the lives one cycle at a time and is then spent by the mountain, so the exit and the expulsion are the same movement. I further infer that "optional" was meant to describe the *other* lives and was written loosely enough to cover the beloved one.
**Why it matters:** Arc 3 contains the story's stated thematic centre (`Story Plan/Arc Structure.md:15`, "Possibility itself has value") and the Split's first distinct mark. If the player can end the pitfall before the beloved life, either the beloved life never happens and the arc's claim is never tested, or the player's choice is overridden by the spine — which contradicts `Story Plan/Choice Points.md:83`. And if the Ghost cannot appear inside the lives, the pitfall breaks the one rule all four pitfalls share.
**Open question for the author:** Does the Ghost appear inside the lives to offer the exit, and can the player reach the mountain without living the beloved life?
**Candidate resolutions:**
1. *The Ghost leads Rain out of each life*: it appears at the end of every life as the thing that makes leaving possible, and the beloved life is the last exit it offers before the expulsion. Cost: `Story Plan/1 The Spine.md:71`'s "while Rain remains unaware" needs qualifying, since he would be following it knowingly.
2. *The beloved life cannot be skipped*: it is the pitfall's terminal cycle, and the player's choice is when to *stop entering the others*. Cost: `Story Plan/Choice Points.md:75` must stop calling the lives optional, and `Story Plan/Choice Points.md:79` ("They cannot see every life in one run") needs an exception.
3. *The mountain precedes the expulsion*: the Ghost leads Rain to the mountain, Rain ends the beloved life, and the Ghost departs as a consequence. Cost: requires the Ghost to have been present inside the lives, so option 1's problem recurs; and `Story Plan/1 The Spine.md:61`'s "His choice sends the Ghost toward Roxana" must name which choice.
**Status:** open

---

### E-014 — The false endings' shared closing image needs the notebook in places the story puts it in an evidence tray

**Element:** The four false endings' closing beat
**Claimed function:** `Story Plan/Choice Points.md:57` — "All four close on the notebook with one line written and the book shut. The second line appears only in the true ending."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:63` — "The Pursuer completes forms while Rain's goggles, notebook, and Roxana's lighter are logged into a tray."
- `Story Plan/Themes and Motifs.md:71` — "The notebook is logged at prison intake and returned during escape. Every false ending closes it after one line."
- `Story Plan/1 The Spine.md:75` — "They recover the Imprints from intake."
- `Story Plan/Choice Points.md:85` — "The dream register cannot introduce plot facts required by the spine."
- `Story Plan/Choice Points.md:45` — pitfall 3 is "Stay in the life," entered at "The lives" (inside the pod)
- `Story Plan/1 The Spine.md:125` — "The notebook contains two lines and many blank pages."
**Type:** gap (protocol: `causal gap`)
**Severity:** significant
**Observation:** Pitfall 3 is entered inside the sensory-deprivation pod, during the window in which the notebook is in a state evidence tray. The false-ending image requires Rain to write in it and shut it. Relatedly, the intake tray holds three objects and the escape scene recovers "the Imprints" — a technical term for the goggles and lighter — while `Story Plan/Themes and Motifs.md:71` says the notebook is also returned. The notebook is not an Imprint by the system's definition (`World/Magic System.md:37`), so the spine's recovery clause does not cover it, and no scene says who returns it.
**Inference:** I infer the false-ending image was designed as a single strong motif carried across four endings for the good reason that it makes them comparable, and that the Arc 3 pitfall's physical situation was not checked against it. I infer the notebook simply travels with Rain by default in the author's mental model, and that the tray detail was added later for the intake scene.
**Why it matters:** The false endings are the payoff of the pitfall system, and their shared image is the story's clearest statement that a stopped life produces one line and nothing further. If the Arc 3 ending cannot render the image, one of the four endings has a different shape from the others, and the second-line payoff at the train (`Story Plan/1 The Spine.md:125`) loses its contrast partner. The notebook's return route also belongs to the same chain of custody as the goggles, whose recovery is already duplicated (E-015).
**Open question for the author:** How does Rain have the notebook inside the Arc 3 pitfall, and how and when is it returned to him in the real world?
**Candidate resolutions:**
1. *The notebook is not logged*: only the Imprints and the lighter go into the tray, and the notebook stays with Rain. Cost: `Story Plan/1 The Spine.md:63` and `Story Plan/Themes and Motifs.md:71` both change, and the intake scene loses one visible deprivation.
2. *The Arc 3 ending uses a different object*: the life's own notebook, or the absence of one. Cost: the four endings no longer share an image, which is the thing that makes them a set.
3. *The lives contain the notebook as a dream-object*: consistent within the register, and the real notebook is returned at the escape. Cost: requires deciding whether writing inside a life leaves any trace, which touches E-008.
**Status:** open

---

### E-015 — Arc 3 and Arc 4 both recover the same Imprints

**Element:** The Circuit Line / the escape chain
**Claimed function:** `World/Locations.md:71` — "A looping freight train. Arc 4 uses its repeating stations to measure the correction's advance and hold the amnesty's pressure in motion."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:75` — "Rain's pod opens as Roxana collapses. They recover the Imprints from intake. Rain carries her out of Aster's grave."
- `Story Plan/1 The Spine.md:83` — "Escape into a smoother city. Rain and Roxana board the Circuit Line and recover the goggles and lighter."
- `World/Locations.md:59` — "The goggles are logged as Nimbus property on loan to the state; their later recovery appears on the Arc 4 amnesty manifest as corporate asset recovery dressed as clemency."
- `Story Plan/1 The Spine.md:63` — "Rain's goggles, notebook, and Roxana's lighter are logged into a tray."
**Type:** hierarchy conflict (protocol: `contradiction`)
**Severity:** significant
**Observation:** The goggles and the lighter are logged at intake in Arc 3 scene 1, recovered from intake in Arc 3 scene 6, and then recovered again on boarding the Circuit Line in Arc 4 scene 1. The same two named objects cannot be recovered twice from the same tray unless they were lost in between, which no document states. The Arc 4 amnesty manifest also lists the goggles as property to be surrendered (`Story Plan/1 The Spine.md:95`), which presupposes Rain holds them from Arc 4 scene 1 onward.
**Inference:** I infer one of the two recovery clauses is a leftover from a revision of where the escape chain recovers the Imprints. I cannot tell from this export whether the Scrivener original already resolves it, so this may be a stale-export artifact rather than a live contradiction — but as it stands, the spine contains both clauses.
**Why it matters:** The Imprints are the mechanical precondition for everything the back half of the story does: Roxana cannot move without the lighter, Rain cannot Clone without the goggles, and Arc 5's decisive decoy depends on the goggles' bond surviving extraction (`World/Magic System.md:131`). A duplicated recovery makes the chain of custody of the story's two most load-bearing objects unclear at exactly the point where the plot changes hands — and if the two scenes are merged as redundant, Arc 4 scene 1 loses its stated content and needs a new beat.
**Open question for the author:** Which scene recovers the goggles and lighter, and what does the other one do instead?
**Candidate resolutions:**
1. *Arc 3 recovers them; Arc 4 scene 1 becomes pure transit.* Cost: Arc 4's opening has to establish "a smoother city" without the reunion beat, which currently gives Rain and Roxana their first scene alone together.
2. *Arc 3 leaves them; Arc 4 recovers them.* Cost: Rain spends Arc 3's escape without the goggles, which touches `World/Magic System.md:131`'s bond surviving extraction and weakens the "escaped with nothing" pressure.
3. *Arc 3 recovers the lighter only* (Roxana cannot walk, so the lighter is urgent) *and Arc 4 recovers the goggles*. Cost: requires a stated reason the goggles stayed in the tray, and an on-page consequence of Rain being without them through the escape.
**Status:** open

---

## Part C — Scene-level claims, characters, and unearned effects

### E-016 — The amnesty's expiry is undefined, and expiry is the fourth pitfall's whole premise

**Element:** The amnesty / the fourth pitfall ("Let it expire")
**Claimed function:** `Story Plan/Choice Points.md:47` — "| **4** | **Let it expire** | the decision itself | The amnesty | The unsigned offer | Rain leaves both options open until circumstances close them; the Circuit Line becomes a new commute. |"
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:95` — "The Pursuer presents a genuine exchange: surrender the listed property, including the goggles, and the charges can be resolved."
- `Story Plan/1 The Spine.md:97` — "Rain refuses while the offer is still live. Hours later the corrected boundary takes his home station. The unsigned paperwork remains on the table."
- `Characters/The Pursuer.md:29` — "Does not lie or misstate an offer."
- `Story Plan/Choice Points.md:19` — "The comfortable action can be offered directly: go home, stay, wait, let the offer expire."
- `Story Plan/Open Questions.md:79` — "Which public account leaves Rain a fugitive after the correction apparatus is broken?"
**Type:** gap (protocol: `causal gap`)
**Severity:** significant
**Observation:** The amnesty has a live window and can expire, and the pitfall is named for expiring it. No document states what the expiry is keyed to, how long the window is, or what withdrawing the offer looks like. The only clock in Arc 4 is the correction boundary, which concerns different stakes: the boundary takes districts including Rain's parents', while the amnesty concerns charges and the listed property. `Story Plan/1 The Spine.md:97` has Rain refuse while the offer is live and the boundary arrive hours later, tying the two events in sequence but not in cause.
**Inference:** I infer the intended expiry is the boundary's arrival — the offer lapses because the authority that made it no longer needs it, or because the districts it concerned are gone. I infer this was left implicit because the sequence in Arc 4 scenes 7–8 reads as though the boundary is the deadline.
**Why it matters:** The fourth pitfall's trigger is its name. If expiry has no condition, the false ending "Let it expire" has no moment at which it becomes true, and the player cannot tell when they have stopped deciding versus when the decision was taken from them. The Pursuer's defining trait is that he "does not lie or misstate an offer," which means he would state a deadline — his silence on one is out of character for a man whose whole method is accurate paperwork.
**Open question for the author:** What ends the amnesty window?
**Candidate resolutions:**
1. *The boundary is the deadline*: the offer lapses when the corrected boundary reaches the station where it was made. Cost: the offer's own terms become subordinate to the correction, which makes the Pursuer's precision a formality; and Arc 4 scene 8's "hours later" must be tightened into the same clock.
2. *A stated withdrawal*: the Pursuer names a time or a condition when he presents the offer. Cost: adds a line to Arc 4 scene 7; also makes the pitfall's expiry legible, which is a gain for the false ending and a loss of ambiguity for the true one.
3. *The offer cannot expire; refusing it is the only close*. Cost: removes the fourth pitfall entirely and contradicts `Story Plan/Choice Points.md:9` ("One pitfall appears in each of Arcs 1–4").
**Status:** open

---

### E-017 — Arc 5's four fronts have no viewport, and the arc's decisive beat is interior

**Element:** The Arc 5 convergence / Roxana's rearguard / Shiori's feeds
**Claimed function:** `Story Plan/Arc Structure.md:23` — "Arc 5 is one convergence, not an ensemble climax followed by a second ending. Roxana, Claire, and Shiori are tested while clearing and maintaining the path toward Vesper; their actions make Rain's extraction possible rather than preventing it."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:107` — "Shiori's distributed feeds open the route and keep every front visible."
- `Story Plan/1 The Spine.md:111` — "Roxana holds the last gate against the Pursuer. She loses exchanges, reaches the choice to stop, and re-enters."
- `Characters/Roxana.md:71` — "Their last fight turns repeated choice, not superior force, into the difference."
- `Characters/The Pursuer.md:121` — "Endurance is not the answer. Endurance without re-choosing is momentum."
- `Story Plan/1 The Spine.md:73` — "**5 · The hand** — The only external POV cut."
- `Story Plan/Themes and Motifs.md:135` — "Keep the unattended surveillance system mostly invisible: no camera walls, checkpoints, or central tower."
- `Story Plan/Themes and Motifs.md:145` — "Stopping is not defection or a sudden alliance." and `Characters/The Pursuer.md:117` — "Nobody later identifies the steam's reaction to Rain's question."
**Type:** gap (protocol: `causal gap`)
**Severity:** blocking
**Observation:** The arc has four simultaneous fronts (Rain's ascent, Claire's overwatch, Roxana's rearguard, Shiori's feeds), and the story's only declared external POV cut occurs in Arc 3 — "The only external POV cut" — with no equivalent declared for Arc 5. The single named viewport for the fronts is Shiori's feeds, which the motif document instructs to keep mostly invisible. The distinguishing beat of Roxana's fight is an interior event: she reaches the choice to stop and re-enters. Her opponent's side of the same distinction is, by design, unmarked — the Pursuer does not ally, does not receive a redemption scene, and nobody identifies the steam's reaction to Rain's question. Visually, both parties do the same thing: get up and come back.
**Inference:** I infer the arc was conceived as parallel action with the feeds as the player's window, and that the interiority of Roxana's re-choice was assumed to be deliverable through performance rather than through an established viewpoint rule. I infer the Pursuer's rules — correctly, for his character — removed every external mark that would let the player read his continuation as different in kind from hers.
**Why it matters:** "Continuing stays distinct from re-choosing" is one of the story's five stated separations (`Story Plan/0 What is Remember Rain.md:15`), and Arc 5 scene 3 is where the story spends it. If the player cannot see the difference, the distinction survives only in the planning documents, and Roxana's victory reads as attrition — the exact reading the character file forbids (`Characters/Roxana.md:113` — "Her Arc 5 victory is renewed choice, not greater stamina"). The closure of the Pursuer's arc also depends on the reader understanding that he stopped rather than lost, which no on-page character is permitted to say.
**Open question for the author:** Through whose eyes does the player watch Arc 5's three non-Rain fronts, and what visible thing distinguishes Roxana's return from the Pursuer's continuation?
**Candidate resolutions:**
1. *Rain sees the feeds*: he watches the fronts on Shiori's rig during the climb, so the player's viewpoint is his. Cost: Rain becomes a spectator of other people's arcs in the arc that is supposed to be his convergence, and the feeds stop being invisible.
2. *A second external POV cut*: the arc gets structured cutaways, matching Arc 3 scene 5's existing precedent. Cost: `Story Plan/1 The Spine.md:73`'s "only" must be amended, and the story acquires a second viewpoint convention late.
3. *The distinction is carried by Roxana's body, not her interiority*: her flame's behaviour changes on each return in a way the Pursuer's steam cannot. Cost: needs a stated visual rule for the flame that survives `Characters/Roxana.md:115` — "Starborne carries rather than heals."
**Status:** open

---

### E-018 — Arc 5 asks three characters to spend themselves delivering Rain to an extraction that destroys him, and none of their files says what they think they are doing

**Element:** The Arc 5 convergence / the ensemble's commitment
**Claimed function:** `Story Plan/Arc Structure.md:23` — "Roxana, Claire, and Shiori are tested while clearing and maintaining the path toward Vesper; their actions make Rain's extraction possible rather than preventing it."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:105` — "**Convergence:** There is no pitfall. Shiori's network, Claire's refusal and overwatch, and Roxana's rearguard clear the path toward Vesper. Extraction must fully succeed before the void, return, refusal, clean-rain actions, and outbound train."
- `Characters/Claire.md:99` — "She would accept treatment that helped her carry the Static. Vesper only offers removal."
- `Characters/Claire.md:73` — "**The Static:** the intrusive memory and noise of the collapse. Removing it would also remove the record of why Claire began."
- `Story Plan/1 The Spine.md:109` — "Claire has reached Vesper first. He offers extraction directly; she refuses without Rain witnessing it."
- `Characters/Shiori.md:53` — "She runs the finale's fourth front and spends the rig that has served as an archive of herself."
- `Characters/Roxana.md:113` — "Her Arc 5 victory is renewed choice, not greater stamina or uncomplicated strength."
- `Story Plan/Choice Points.md:19` — "Leaving a pitfall begins through the Ghost, shown without a label or explanation."
- `Story Plan/Themes and Motifs.md:183` — "Prefer missing speeches to translated symbolism."
**Type:** unearned effect (protocol: `character-truth drift`)
**Severity:** significant
**Observation:** Claire refuses extraction for herself on the grounds that removal takes the record of why she began, and then participates in clearing a path to Rain's extraction, which removes the same record from him. Shiori spends the rig that functions as her memory archive. Roxana, whose ability to stand was removed by the same man, holds the last gate so that Rain can reach him. None of the three files states what any of them believes the approach is for — whether they intend Rain to be treated, intend him to refuse, or do not know. The convergence is stated as a fact about their actions, not as a decision any of them made.
**Inference:** I infer the intended reading is that they are not delivering Rain to Vesper but keeping him alive on the way to a choice that belongs to him, consistent with the hierarchy's "participation stays distinct from control." I infer the group plan was written at the level of fronts rather than intentions, which is why the story's stated outcome — extraction succeeding — is nowhere reflected in what the characters expect.
**Why it matters:** `Story Plan/Arc Structure.md:23` claims the arc is "not an ensemble climax followed by a second ending" — the ensemble exists to serve the extraction. That claim only holds if their service is legible as a choice. Without stated intentions, three characters spend irreplaceable parts of themselves for a result the story has already told the reader is a catastrophe, and the reader has no way to tell sacrifice from error. The plan also forbids them a thematic debrief (`Story Plan/Themes and Motifs.md:183`), so the intention cannot be recovered from dialogue after the fact.
**Open question for the author:** What does each of the three believe the approach to Vesper is for, and does any of them expect Rain to be extracted?
**Candidate resolutions:**
1. *They go to end the correction, not to reach Vesper*: extraction is the accident that beats them. Cost: `Story Plan/1 The Spine.md:105`'s "clear the path toward Vesper" must be rephrased, and the arc's fronts need a stated objective about the apparatus instead.
2. *They know, and each has a private reason*: Claire wants the model to be tested, Shiori wants the feeds spent before they are taken, Roxana wants to hit Vesper. Cost: three motivations to establish without speeches, which risks exactly the explanation the motif document forbids.
3. *Nobody knows, including Rain*: the group is moving toward a confrontation whose shape is Vesper's to decide. Cost: Rain's Arc 5 choice pressure ("Can you choose without knowing who that choice proves you are?" — `Story Plan/Arc Structure.md:19`) becomes true for the whole group, which may be a gain, but it makes the arc's action passive.
**Status:** open

---

### E-019 — The Shiori beat is marked provisional, but Arc 5's viewport and Rain's fugitive status both depend on its fixed actions

**Element:** Shiori's Arc 5 beat ("Working Shiori beat, not locked")
**Claimed function:** `Story Plan/1 The Spine.md:123` — "**Working Shiori beat, not locked:** she turns the cameras off and closes something without marking her place; this is a small wager that an unrecorded moment can matter, not a cure or new trust in her memory."
**What the detail actually establishes:**
- `Story Plan/Open Questions.md:33` — "The bookmark formulation is developed but not locked. Its current test is whether evidence-as-re-entry clarifies Shiori without making her a healthy midpoint between Rain and Vesper."
- `Characters/Shiori.md:83` — "Her first major project was an external recording system built after her injury. The state confiscated and scaled it into unattended surveillance infrastructure."
- `Story Plan/1 The Spine.md:107` — "Shiori's distributed feeds open the route and keep every front visible."
- `Story Plan/Arc Structure.md:25` — "It is followed, in order, by the void, Rain's return, his refusal to remove the Split, the apparatus breaking, and brief clean-rain actions for the ensemble."
- `Story Plan/0 What is Remember Rain.md:33` — "Rain also remains publicly a fugitive."
- `Story Plan/Open Questions.md:79` — "Which public account leaves Rain a fugitive after the correction apparatus is broken?"
- `Story Plan/Themes and Motifs.md:127` — "The evidence-as-bookmark interpretation and the Arc 5 no-bookmark wager are a **working direction, not locked canon**."
**Type:** load-bearing uncertainty (protocol: `status conflict`)
**Severity:** significant
**Observation:** The *interpretation* of the beat is marked provisional in two documents, and its content is treated as provisional in the spine. The beat's *actions*, however, are placed in the finale's fixed order by `Story Plan/Arc Structure.md:25`, and they do two non-thematic jobs: the feeds are the arc's only named viewport (E-017), and turning off a state surveillance system that Shiori built — her system is the one "the state confiscated and scaled" — is a candidate explanation for why a publicly wanted man is not caught after the apparatus breaks, which `Story Plan/Open Questions.md:79` leaves open. So the story has come to depend on actions whose purposes beyond theme are stated nowhere, while their meaning is explicitly not canon.
**Inference:** I infer the author marked the *reading* provisional and considers the *action* settled, and that the surveillance-consequence question has not been connected to the cameras-off beat at all. I infer the cameras-off beat currently reads as an intimate gesture whose institutional scale is invisible — which is consistent with `Story Plan/Themes and Motifs.md:135` ("no camera walls, checkpoints, or central tower") and inconsistent with it being a state system.
**Why it matters:** If turning the cameras off contributes to Rain escaping, the ending's requirement that he "remains publicly a fugitive" needs a different account, and open question 79 is really a question about this beat. If it does not, then a character switches off the state's city-wide monitoring in the finale and nothing follows from it — which makes the beat's action decorative while its meaning is provisional, i.e. provisional in both registers. Either way the register should say which of the beat's parts are locked.
**Open question for the author:** Is turning the cameras off a plot action with consequences for Rain's fugitive status, or a private gesture whose only effect is on Shiori?
**Candidate resolutions:**
1. *It is private and partial*: she darkens her own feeds, not the state's, so nothing institutional follows. Cost: `Characters/Shiori.md:83`'s "the state confiscated and scaled it" must be clarified as a system she no longer controls, which reduces what she can switch off.
2. *It is a plot action*: the city's surveillance goes dark and Rain's escape is partly hers. Cost: `Story Plan/Open Questions.md:79` must be answered in terms of this beat, and the ending's "remains publicly a fugitive" needs the manhunt sustained by something other than monitoring.
3. *The action stays, its meaning stays open, and the register says so explicitly*: the spine's wording is changed to separate the locked action from the unlocked reading. Cost: the finale carries a beat whose significance the author has not decided, which is a decision deferred rather than made.
**Status:** open

---

### E-020 — The finale requires a gesture that "uses" the Ghost without summoning it, and the Ghost's state at that moment is nowhere stated

**Element:** The refusal / the open-hand gesture / the Ghost's final state
**Claimed function:** `Story Plan/0 What is Remember Rain.md:27` — "The final test is whether a person can produce another response without requiring finished evidence to authorize it."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:121` — "He uses the open-hand gesture without summoning the Ghost and breaks the correction apparatus."
- `Story Plan/Themes and Motifs.md:81` — "In the finale Rain uses the open-hand gesture without summoning the Ghost."
- `Story Plan/1 The Spine.md:71` — "The Ghost is expelled toward Roxana while Rain remains unaware."
- `Story Plan/1 The Spine.md:99` — "Rain mistakes the dimming Ghost and easier feeling of letting the projection act for relief" (Arc 4, so it is still available then)
- `World/Magic System.md:147` — "An established bond survives autobiographical memory loss unless something separately disrupts the resonant relationship." (bonds — the constraints say nothing about passives)
- `Characters/1 Vesper.md:67` — "Rain produces a response no finished record contained."
**Type:** gap (protocol: `underdefinition`)
**Severity:** significant
**Observation:** "Without summoning the Ghost" distinguishes Rain's gesture from calling a guide, and it is the finale's evidence that the response is his. But no document says whether the Ghost still exists, is present but unused, is with Roxana, or was consumed or removed by the extraction. The corpus establishes that the Ghost left Rain for Roxana in Arc 3, that Rain still perceived it in Arc 4, and that Vesper's extraction removes autobiographical memory while leaving resonant bonds (a rule stated for Imprints, not for passives).
**Inference:** I infer the author's intent is that Rain performs the gesture himself and the Ghost's absence is the point — either because it has gone or because he no longer reaches for it. I infer the ambiguity is unresolved rather than deliberate, since the story elsewhere marks deliberate ambiguity explicitly (`Story Plan/Themes and Motifs.md:85` — "Never decide whether the Ghost or Split are separate beings"), and no such marker is attached to the Ghost's fate.
**Why it matters:** The ending's acceptance test is the reader believing the final response is Rain's. If the Ghost is present and merely unsummoned, a reader can read the finale as the passive acting through him, which fails the test. If the Ghost is gone, then the story's most consistent visual companion disappears without a scene, and the Ghost's handoff to Roxana in Arc 3 has no resolution — she accepted a hand from something that is no longer anyone's. The prism scene also needs a stable answer, since `Characters/1 Vesper.md:125` says Vesper "is neither redeemed nor philosophically annihilated at the end," which depends on what remains of Rain's passive.
**Open question for the author:** At the moment of the refusal, where is the Ghost?
**Candidate resolutions:**
1. *The Ghost is gone*: extraction disrupted the passive, and the gesture is the first thing Rain does without it. Cost: `World/Magic System.md` needs a rule for what extraction does to a passive, and Arc 4's dimming Ghost becomes a countdown to its loss rather than a recoverable symptom (touching E-012).
2. *The Ghost is present and unsummoned*: Rain chooses not to reach for it. Cost: the finale's proof weakens, and the scene needs a visible cue that he could have called it and did not.
3. *The Ghost is with Roxana and stays there*: the handoff in Arc 3 is permanent. Cost: requires stating that a passive does not return to its owner, which makes Roxana's Arc 5 fight happen with a guide present — a significant change to her arc's isolation.
**Status:** open

---

### E-021 — Arc 2's demonstration asserts the kindness it exists to show, and its one concrete detail is neutralized

**Element:** Vesper and the asylum — the courtyard demonstration
**Claimed function:** `Story Plan/1 The Spine.md:39` — "Show Vesper's kindness rather than asserting it. During a courtyard spar, Claire predicts every move and still loses to Roxana's embodied response. Vesper corrects Roxana using Aster's fighting style."
**What the detail actually establishes:**
- `Characters/Roxana.md:41` — "Aster later became her father figure and trainer."
- `Story Plan/Themes and Motifs.md:149` — Aster "remains through Roxana's surname, training, and lighter"
- `Characters/Vesper.md:79` — "**Aster:** Vesper can consciously reproduce what Aster's intact record teaches him. This is archive access, not Melted instinct, and it makes his claim to understand Roxana personally dangerous."
- `Story Plan/1 The Spine.md:49` — "Roxana learns Aster's shard exists in the archive." (Arc 2 scene 7, after the demonstration)
- `Story Plan/Arc Structure.md:13` — "**2 · Mirror** ... **Relief can genuinely help, but successful intervention can begin replacing participation.** The danger is not treatment or repetition by itself; it is the expanding authority to determine what the person may become next."
- `Characters/1 Vesper.md:109` — "No villain-mask-drop scene. His kindness remains real before and after the reveal."
- `Characters/1 Vesper.md:19` — "His warmth, patience of manner, and desire to relieve suffering are real."
**Type:** unearned effect
**Severity:** blocking
**Observation:** The scene's instruction is to show rather than assert a quality, and the scene contains one concrete act: Vesper corrects Roxana using Aster's fighting style. Roxana was trained by Aster, so her style already is Aster's; a correction delivered in her own idiom is not distinguishable on the page from ordinary coaching, and it does not by itself read as kindness rather than technique. The fact that Vesper holds Aster's recorded style is archive access, which Arc 2 scene 7 only later reveals exists, so a first-time player cannot decode the detail as anything. The scene also gives no content for the correction — what is corrected, what changes, how Roxana receives it — and the sparring result (Claire models everything and still loses to Roxana) is about Claire and Roxana, not about Vesper.
**Inference:** I infer the scene is doing two jobs at once — establishing Vesper's warmth and planting his access to Aster — and that the planting job was prioritized, leaving the warmth job without a detail of its own. I infer that "corrects Roxana" was written as a placeholder for an act that has not been chosen. The high value of this finding is that the effect is asserted in the plan's own imperative voice ("Show... rather than asserting it") and the detail provided cannot produce it.
**Why it matters:** Arc 2's thematic development — relief genuinely helps, and authority to determine what comes next is the danger — depends on Vesper being experienced as helpful rather than described as helpful. If the demonstration does not deliver that, the arc's claim rests on the Widower alone, who is a single lunch-table description (`Story Plan/1 The Spine.md:41`) in the same scene block. The reveal then has no warmth to re-read, and `Characters/1 Vesper.md:39`'s design goal — "The same kindness should read differently as its scale becomes clear" — has nothing to re-read.
**Open question for the author:** What does Vesper actually do for Roxana in this scene that is unmistakably kind and unmistakably his?
**Candidate resolutions:**
1. *He fixes something concrete and small*: consistent with `Characters/1 Vesper.md:33` — "Fixes small problems before anyone asks: a latch, a chair, a memory, a city." Cost: small problems are easy to read as caretaking rather than as authority, so the arc's danger has to be carried elsewhere.
2. *He removes a pain Roxana has not mentioned*: her scars, or the Empathic Burn she is absorbing from the room. Cost: he would be using extraction in Arc 2, which makes Arc 2 scene 6's "glass shards himself as an act of trust" no longer the first demonstration, and compresses the arc's escalation.
3. *The kindness is the correction itself, and the discomfort is Roxana's*: she receives help in her dead mentor's idiom without knowing why it fits. Cost: the scene's warmth becomes retroactively sinister for the player too, which spoils the Arc 2 scene 7 reveal and `Characters/1 Vesper.md:109`'s "kindness remains real before and after."
**Status:** open

---

### E-022 — The asylum has one line of description while Arc 2's argument and its pitfall both depend on institutional capacity

**Element:** Vesper and the asylum
**Claimed function:** `Story Plan/0 What is Remember Rain.md:7` — "moves through an asylum, a sensory-deprivation prison, and a city accepting painless correction"
**What the detail actually establishes:**
- `World/Locations.md:61` — "**Abandoned Asylum** — Vesper's sanctuary and treatment space: pleasant, open-doored, and task-oriented. It should feel like a place that offers care and enclosure at the same time."
- `Story Plan/1 The Spine.md:37` — "Begin inside the asylum. It is calm, useful, and voluntary. Rain recognizes missing people and believes their presence may clear him. Residents complete assigned tasks but initiate little of their own."
- `Story Plan/Choice Points.md:43` — pitfall 2: "Rain accepts treatment for the ache of wanting, remains for additional sessions, and gradually lets the asylum determine what needs relief next."
- `Story Plan/Arc Structure.md:13` — "it is the expanding authority to determine what the person may become next."
- `Story Plan/1 The Spine.md:55` — "The Pursuer arrives and wins without raising a hand. Vesper remains understanding."
- `Story Plan/Open Questions.md:11` — "What institution allowed a thirteen-to-eighteen-year-old Vesper to practice, and what did it believe it was authorizing?"
- `Characters/The Widower.md:11` — "Because the first treatment worked, he returned eight more times over the next few years."
**Type:** gap (protocol: `underdefinition`)
**Severity:** significant
**Observation:** The location document gives the asylum one entry of two sentences, and it is the setting for an entire arc, the site of one of the story's four pitfalls, and the source of the disappearances that motivate Arc 1. Nothing states how many residents it holds, who feeds them, how the missing are reported as missing rather than as patients, why the state does not know about an asylum holding people the state is looking for, or how the Pursuer's arrival at the end of Arc 2 is able to take Rain and Roxana into state custody from it. The registered open question concerns what institution authorized Vesper, which is adjacent but not the same question.
**Inference:** I infer the asylum is intended as a genuine shelter that happens to be the antagonist's workshop, so that Arc 2's horror is ordinary comfort rather than confinement — consistent with `World/Locations.md:19` ("The horror is not overt dystopia; things become strangely easier"). I infer that its administrative invisibility was assumed rather than decided, and that the pitfall's "remains for additional sessions" requires a place that keeps people for years without anyone noticing.
**Why it matters:** The pitfall's termination condition is that Rain stops leaving, which requires the asylum to be a place one can stay indefinitely; the Widower's nine treatments over "the next few years" already establishes that. Disappearances sufficient to drive a state investigation (`Story Plan/1 The Spine.md:25`) require the asylum to be where people are seen going and not seen returning — which requires it to be known, at least locally. Both cannot be true without a stated distinction between the asylum as a place and the asylum as a record, and the arc cannot be staged until that distinction exists.
**Open question for the author:** Is the asylum a legally invisible place, a known charity that loses people, or a state-adjacent facility — and who would notice if Rain never left it?
**Candidate resolutions:**
1. *Known and legitimate*: it is a licensed refuge, and the disappearances are explained by patients declining to return to their old lives. Cost: Vesper's operation becomes semi-public, so the arc's secrecy has to come from elsewhere, and the Arc 2 referral is a normal procedure rather than a capture.
2. *Invisible and off-book*: it is unregistered, and the missing are people the state does not track. Cost: the state's aggressive pursuit of Rain becomes harder to square with its indifference to a building full of missing people.
3. *Known to the Ministry and tolerated*: the asylum is where inconvenient cases are quietly sent. Cost: makes Vesper an instrument rather than an architect, which revises `Characters/1 Vesper.md:11` and reduces his autonomy.
**Status:** open

---

### E-023 — Arc 2's and Arc 4's central arguments are carried by two residents who have no documents

**Element:** The Fearless One and the Ruined One
**Claimed function:** `Story Plan/1 The Spine.md:43` — "**4 · The Fearless One** — Show a resident whose removed fear looks like the answer Rain wanted. Give the result practical benefits and a subtler absence." And `Story Plan/1 The Spine.md:45` — "**5 · The Ruined One** — A person who committed once, suffered ruin, and now accepts that the chance is over. Nobody rebuts them. Rain has no answer yet."
**What the detail actually establishes:**
- `Characters/Asylum Patients/` contains one character document, `Gamer.md`. There is no document for the Fearless One or the Ruined One.
- `Story Plan/1 The Spine.md:93` — "He carries the Ruined One's case into his answer: what does her model say about the next attempt after every previous one failed? Claire leaves shaken, not converted."
- `Story Plan/Themes and Motifs.md:23` — "No character is the thesis. Preserve the value inside each distortion."
- `Story Plan/Themes and Motifs.md:57` — "**Drafting risk:** If a contrast cannot produce different actions in the same immediate problem, it is not ready for the draft."
- `Story Plan/Arc Structure.md:19` — "**5 · Proof** | Can you choose without knowing who that choice proves you are?"
**Type:** unearned effect (protocol: `causal gap`)
**Severity:** significant
**Observation:** Two residents carry the two strongest counter-arguments in the story: that fear removal may be the right answer, and that a person who already spent their one chance has a case nobody rebuts. The first is described only as producing "a subtler absence," which is not specified. The second is required three arcs later as the content of Rain's climactic answer to Claire, where its substance does not exist. The pronoun in that climax — "what does **her** model say" — has two available antecedents in the same sentence pair, Claire and the Ruined One, and the Ruined One has no documented model. Every other named asylum resident has a document (`Characters/The Widower.md`, `Characters/Asylum Patients/Gamer.md`).
**Inference:** I infer the two residents were written as functional placeholders — the case for relief, and the case against a further attempt — and that their content was deferred to the drafting stage, where the plan's own rule ("No character is the thesis") will be under pressure because both figures exist to make an argument. I infer "her model" most likely means Claire's, since the sentence's purpose is that Claire leaves shaken, but the prose does not settle it.
**Why it matters:** Arc 2 scene 4 is the story's strongest possible objection to its own thesis, and it is the scene the hierarchy most needs — "Relief that restores that ability is medicine. Relief that removes the person who could later accept, regret, revise, or refuse it is subtraction" (`Story Plan/2 Pessimism of Strength.md:27`). Without a concrete benefit and a concrete subtler absence, the objection is stated rather than made. And Arc 4 scene 6's climax requires Rain to hold a case the story has not written, which means the moment where Rain stops outsourcing to Claire currently has no content.
**Open question for the author:** What specifically did the Fearless One gain, what specifically is subtler about his absence, and what is the Ruined One's case in her own words?
**Candidate resolutions:**
1. *Give both residents documents* at the depth of `Characters/The Widower.md`. Cost: two new Scrivener documents; and naming them risks making them "the thesis" characters the motif document warns against.
2. *Fold both into the Widower's scene*: one resident carries both arguments in sequence. Cost: Arc 2 loses one scene beat, and the Widower's function — the case where Vesper is right — becomes muddied by a case where he is not.
3. *Give the Ruined One a document and leave the Fearless One as a scene image*: her case travels to Arc 4 and needs substance; his need only be seen. Cost: Arc 2 scene 4 stays at the level of staging, and the player must supply the benefit themselves.
**Status:** open

---

### E-024 — Claire's own change list omits the referral she initiates, and the Arc 4 advocate scene has no route from her history to advocacy

**Element:** Claire
**Claimed function:** `Story Plan/Choice Points.md:99` — "Claire refuses Vesper before Rain arrives. Her decision is not available to him or the player." is protected; and `Characters/Claire.md:43` — "Her change is not intuition defeating reason. Evidence carries her as far as it honestly can. She must make the remaining decision herself, accept that a responsible choice may still end badly, and leave other people responsible for choices that belong to them."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:53` — "Claire gives Vesper the procedural word that begins the referral."
- `Characters/Claire.md:45–57` — her seven numbered steps: (1) calculates the group's exit, (2) predicts every move in the spar and loses, (3) follows the archive trail toward silence, (4) returns and makes Vesper's strongest case, (5) Rain refuses to let her supply the answer, (6) reaches Vesper alone and refuses extraction, (7) says *Go* at overwatch. The referral appears in none of them.
- `Characters/Vesper.md:61` — "He hands the group to the state as a referral, not a betrayal speech."
- `Story Plan/1 The Spine.md:91` — "Claire intercepts the train and makes Vesper's best case honestly: existing life is already coercive, the correction asks permission, and relief works. She quotes Vesper using a phrase that belonged to Shiori."
- `Characters/Claire.md:73` — "**The Static:** the intrusive memory and noise of the collapse. Removing it would also remove the record of why Claire began."
- `Characters/Claire.md:99` — "She would accept treatment that helped her carry the Static. Vesper only offers removal."
- `Story Plan/1 The Spine.md:123` — "Claire abandons the appointment she no longer intends to keep." ("appointment" occurs exactly once in the corpus.)
**Type:** unearned effect (protocol: `character-truth drift`)
**Severity:** significant
**Observation:** Step 2 to step 3 skips the referral, the Melt, the still room, and the hand she offers Rain — every interaction she has with Rain between the spar and the train. The single most consequential thing she does to him, giving the state the word that begins his transfer to the deprivation prison, is absent from her own progression list, and `Characters/Vesper.md:61` assigns the act to Vesper instead. Separately, her Arc 4 advocate scene requires her to argue Vesper's case to Rain, and her documented relations do not supply a route to advocacy: she is defined by being right and disbelieved, by supplying certainty rather than relaying it, and by a private attraction to silence that Vesper is the only person able to promise (`Characters/Claire.md:49`). She is also personally excluded from what Vesper offers, since he will not offer her the treatment she would accept. Her file never says she is arguing for something she wants and has ruled out, which is the one thing that would make the scene hers. Finally, the finale assigns her an "appointment" that exists nowhere else.
**Inference:** I infer the referral was left out of her list because it was designed from Vesper's side (his list includes it, `Characters/Vesper.md:61`) and not revisited from hers. I infer the advocate scene's motive was assumed to be honesty — her defining virtue — without deciding why honesty requires her to be Vesper's advocate in particular. I have no inference for the appointment; it appears to be a leftover from a version of the finale in which Claire's Arc 2 referral produced a standing obligation.
**Why it matters:** Claire's arc is "hand the decision back" (`Characters/Vesper.md:73`), and the referral is the maximal case of taking one. If it is not in her arc, her growth has no baseline, and the Arc 4 scene where Rain stops outsourcing to her has nothing of hers to answer. The advocate scene is also the arc's one honest statement of the antagonist's case, so if it is not hers to make, the story's best argument for correction is delivered by a character with no stake in it — a mouthpiece, in a document that forbids characters being the thesis. The dangling appointment is a smaller problem with a large cost: it names a commitment the reader has never seen her make.
**Open question for the author:** What does Claire believe she is doing when she gives Vesper the procedural word, and what brings her to board the Circuit Line to argue his case?
**Candidate resolutions:**
1. *Add the referral to her list as its low point*, making the arc a reversal from taking a decision to returning one. Cost: `Characters/Claire.md:45–57` renumbers and `Characters/Vesper.md:61` must be reconciled so that one character owns the act.
2. *She believed the referral was treatment, not custody*, so her act is a misjudgement rather than a betrayal. Cost: requires the asylum-to-prison handoff to be genuinely ambiguous at the time, which touches E-022's question about what the asylum's status is.
3. *Make the advocate scene explicitly self-implicating*: she is arguing for the thing she wants and will not take. Cost: adds an interior register the character's "Do Not Flatten" list does not currently mention, and risks making her argument weaker rather than stronger by revealing a motive the player can dismiss.
**Also to resolve:** `Story Plan/1 The Spine.md:123`'s "the appointment she no longer intends to keep" needs either a scene that creates it or a different phrase.
**Status:** open

---

### E-025 — Rain's defining unpredictability is stated as an effect on Claire's model and given no action

**Element:** Rain
**Claimed function:** `Story Plan/1 The Spine.md:25` — "Claire has calculated an exit; Rain breaks her model as noise. Roxana holds off the Pursuer long enough for Claire's route to work. Rain contributes little and watches, colliding with an objective that predates him."
**What the detail actually establishes:**
- `Characters/Claire.md:79` — "It can infer intent less reliably from visible evidence, but cannot read minds, see hidden variables, or resolve genuine randomness."
- `Story Plan/1 The Spine.md:113` — "At contact range, without a complete model, she says *Go*."
- `Story Plan/1 The Spine.md:93` — "Rain concedes Claire's evidence and stops asking her to decide."
- `Characters/0 Rain.md:33` — "Struggles to answer in quiet rooms, but moves with sudden commitment in emergencies."
- `Story Plan/1 The Spine.md:71` — "The beloved life comes last... Rain ends it"
**Type:** unearned effect (protocol: `causal gap`)
**Severity:** significant
**Observation:** "Rain breaks her model as noise" names an outcome for Claire's model and no action for Rain. The same sentence says he "contributes little and watches." The story's later payoffs require this trait to have been established: Claire's inability to model him is what makes the overwatch's final *Go* meaningful, and Rain's refusal to let Claire decide is what makes Arc 4 scene 6 land. Arc 1 scene 6 is the only place the trait is set up.
**Inference:** I infer "noise" is intended as a property of Rain rather than an event — something Claire cannot fit — and that the scene was written to establish her model's failure rather than his behaviour. I infer the scene can be drafted with either emphasis, and that the choice determines whether Rain's defining quality is agency (he does something unmodellable) or opacity (he is unreadable), which are different characters.
**Why it matters:** The story's final claim is that a person can produce another response than the record predicts (`Characters/1 Vesper.md:67`). If Rain's unpredictability has no first instance, its last instance is an assertion. If the first instance is passivity rather than action, then the trait the finale celebrates — producing a response — was introduced as an absence of responses, and the two readings contradict each other at the level of character.
**Open question for the author:** In Arc 1 scene 6, what does Rain do that Claire's model did not contain?
**Candidate resolutions:**
1. *He does something decisive and irrational*: consistent with "moves with sudden commitment in emergencies" and directly foreshadows the finale. Cost: sits against "Rain contributes little and watches," so the scene's division of labour must change.
2. *He does nothing, and that is the noise*: the model fails because he does not act where action was predicted. Cost: establishes opacity rather than agency, and the finale's response then needs a separate first instance.
3. *The noise is his refusal to be rescued on her terms*: he declines the calculated exit and is saved anyway when Roxana holds the Pursuer. Cost: requires the scene to give him a reason to refuse something that saves his life, which the documented Rain — who permits help without requesting it (`Characters/0 Rain.md:35`) — does not supply.
**Status:** open

---

### E-026 — Roxana's rearguard runs through a stated physiological ceiling, and the one mechanic that would carry the arc's distinction is unassigned

**Element:** Roxana — the Arc 5 rearguard
**Claimed function:** `Characters/Roxana.md:71` — "Their last fight turns repeated choice, not superior force, into the difference." And `Characters/Roxana.md:113` — "Her Arc 5 victory is renewed choice, not greater stamina or uncomplicated strength."
**What the detail actually establishes:**
- `Characters/Roxana.md:87` — "**Starborne cost:** while the flame carries her, normal physiological pain gating is suppressed. Ungated pain can trigger withdrawal, involuntary tension or release, shaking, disrupted breathing, nausea, disorientation, and collapse. Mental toughness cannot simply overrule those responses."
- `Characters/Roxana.md:79` — "**Empathic Burn:** Roxana involuntarily echoes nearby bodily pain through her own nervous system."
- `Characters/Roxana.md:83` — "**Base cost:** sustaining the flame heightens Roxana's nociceptive sensitivity. Her injuries, scar pain, and incoming Empathic Burn become harder to ignore and can interfere with function."
- `Story Plan/1 The Spine.md:85` — "Roxana begins the drills needed to sustain Undying Flame and learn Starborne without treating the advanced mode as physical restoration."
- `Characters/The Pursuer.md:81` — "**Vent:** a short-to-mid-range directed release that can scald, unbalance, break contact, obscure vision, or clear space."
- `Characters/The Pursuer.md:93` — "Against Roxana he spends far ahead of the projected rate."
- `Characters/Roxana.md:103` — "Her inability to stand is produced by Vesper's memory alteration, not a spinal injury."
**Type:** hierarchy conflict (protocol: `causal gap`)
**Severity:** blocking
**Observation:** To hold the gate, Roxana must sustain Starborne for the duration of a fight against an opponent who remains functional through a five-year non-renewable reserve and whose attacks scald. Sustaining Starborne suppresses the only mechanism that would let her keep functioning while scalded; her injuries, scar pain, and incoming Empathic Burn become harder to ignore on top of that; and the character document states that mental toughness cannot overrule these responses. Drills are said to be needed "to sustain" the advanced expression, but no document says training raises the threshold. Separately, Empathic Burn would make her feel the pain she inflicts — and the rearguard is the one fight in the story where that would matter — and no document assigns it to this scene.
**Inference:** I infer the drills are intended to establish tolerance rather than power, and that the outcome is meant to be that she stops from pain, chooses, and returns. I infer Empathic Burn's absence from the rearguard is an omission rather than a decision, because it is the established mechanic that would convert the fight's visible repetition into a legible difference between her returns and his — each return costs her his pain plus her own, while his continuation costs him only fuel.
**Why it matters:** Arc 5 scene 3 is where the story spends "continuing stays distinct from re-choosing" (`Story Plan/0 What is Remember Rain.md:15`). As written, the fight is won by outlasting a finite resource, which the character file explicitly denies is her victory. The available fix is already canon: Empathic Burn makes each of her returns demonstrably more expensive than his, so re-entering becomes a visible choice rather than a repetition — and that also supplies the missing on-page signal E-017 asks for. Without it, both the fight's outcome and the arc's distinction rest on nothing the player can see.
**Open question for the author:** How long can Roxana sustain Starborne under pain, and does she feel the Pursuer's pain while she fights him?
**Candidate resolutions:**
1. *Bind Empathic Burn into the rearguard*: her returns cost her his pain doubled with her own, and the choice to stop becomes bodily rather than verbal. Cost: makes the fight shorter and more brutal, and requires a stated limit on how much of his pain she receives, which `Story Plan/Open Questions.md:61` currently leaves open.
2. *The drills raise her ceiling in a stated, bounded way*: she can sustain Starborne for a fixed duration, and the fight is structured around it. Cost: introduces a stamina budget the character file says is not her victory, so the budget must be framed as a constraint she works inside rather than a resource she wins with.
3. *She wins by refusing to continue the mode, not by enduring it*: she stops using Starborne at the decisive moment and stands or falls on her own body. Cost: touches `Characters/Roxana.md:103` and the meaning of her inability to stand, and risks reading as the physical restoration the file forbids.
**Status:** open

---

### E-027 — The Pursuer's declared scene question is never posed to him; the choice it names is made by Roxana

**Element:** The Pursuer
**Claimed function:** `Story Plan/Themes and Motifs.md:17` — "| **The Pursuer** | continuity | endurance | Can stopping honor rather than erase the past? |"
**What the detail actually establishes:**
- `Characters/The Pursuer.md:59` — "He does not complete a conversion or choose a new side. His final change is the terminal fact that the old direction can no longer carry him."
- `Characters/The Pursuer.md:93` — "At zero, Furnace permanently ends, abnormal heat vanishes, the steam dissipates, and the greatcoat becomes ordinary wet wool... and he stops walking."
- `Characters/The Pursuer.md:109` — "He never allies, supplies intelligence, joins the heroes, or receives a redemption scene. The gate simply stops being manned."
- `Story Plan/1 The Spine.md:111` — "He can only continue the old burn. He spends ahead of schedule, empties, and stops walking. He does not ally; the gate is simply no longer manned."
- `Characters/The Pursuer.md:55` — "Rain asks whether it is too late to stop; the steam reacts once."
- `Characters/The Pursuer.md:117` — "Nobody later identifies the steam's reaction to Rain's question."
- `Characters/The Pursuer.md:17` — "**Question:** *Is it too late to stop?*"
- `Characters/The Pursuer.md:119` — "His final stop is unrecorded. Nobody thanks him, and he files nothing."
**Type:** inert element
**Severity:** significant
**Observation:** His scene question asks whether stopping can honor rather than erase the past. He is never given a scene in which stopping is available to him as a choice: he empties, which is the end of his capacity rather than a decision. The single moment where the question appears to reach him is Rain asking "whether it is too late to stop," answered by one steam reaction that the text forbids anyone to identify. The scene where someone actually stops and chooses again — the thing the question is about — belongs to Roxana (`Characters/Roxana.md:71`).
**Inference:** I infer the design is deliberate and thematically pointed: he is the man who cannot re-choose, and his question is answered by the story showing that depletion is not stopping. I infer that this leaves his stated question carried entirely by another character's arc, so the Pursuer's own scenes pose a different question — whether the hunt can be completed — which is not the one the motif table assigns him.
**Why it matters:** The Pursuer is Rain's "strongest foil" (`Characters/The Pursuer.md:11`) and the story's embodiment of "endurance without re-choosing." If his question is never posed to him, the contrast between him and Rain is carried by Rain and Roxana instead, and the story's clearest test of the endurance/re-choice distinction is between two characters who both pass it in different ways rather than between one who passes and one who cannot. The story also forbids every on-page marker that would make his stop legible (no alliance, no thanks, no recording, no identified reaction), so the reader's only route to the question is noticing an absence.
**Open question for the author:** Is the Pursuer ever offered the choice to stop, or is his arc specifically that he never is?
**Candidate resolutions:**
1. *He is offered and declines*: an explicit moment in Arc 5 where stopping is possible. Cost: `Characters/The Pursuer.md:109`'s "no redemption scene" becomes harder to preserve, since a declined offer is a scene about the offer.
2. *He is never offered, and the absence is the point*: the story relies on the reader noticing that nobody, including his institution, ever asks him. Cost: the question in the motif table should be reworded as a question the story asks *about* him rather than one he faces.
3. *The steam reaction is the offer*: Rain's question is the only occasion, and the reaction is his answer that nobody reads. Cost: requires deciding what the reaction means, since `Characters/The Pursuer.md:117` forbids anyone in-story from identifying it — the register would need to record the intended meaning for the author's own use.
**Status:** open

---

### E-028 — Aster's death has no stated cause, and the spine promises it as a withheld revelation

**Element:** Aster
**Claimed function:** `Story Plan/Themes and Motifs.md:149` — "**Forms:** Aster is dead before the story begins and remains through Roxana's surname, training, and lighter; Claire's investigation; Vesper's access to his recorded fighting style; the Pursuer's signature on his intake; and the shard Roxana ultimately burns."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:49` — "Roxana learns Aster's shard exists in the archive. She does not yet learn what his survival as a record means about his death."
- `Story Plan/1 The Spine.md:75` — "Rain carries her out of Aster's grave." (the deprivation prison)
- `Characters/The Pursuer.md:53` — "His signature appears on Aster's intake record."
- `World/Magic System.md:99` — "Melt destroys the autobiographical memory for both the original owner and Vesper. It cannot be restored." (memory destroyed; the person not killed)
- `World/Magic System.md:135` — "Vesper therefore wins the extraction and still loses the immediate physical exchange."
- `Story Plan/Open Questions.md:9` — "Where within the five years do his mother's Melt, Shiori's extraction, the unknown Melt, Aster's death, and the Widower's nine treatments fall?" (placement is open; cause is not asked)
- `Story Plan/1 The Spine.md:25` — "Aster's disappearance drives Roxana"
**Type:** gap (protocol: `underdefinition`)
**Severity:** blocking
**Observation:** Aster is dead, extracted, recorded, interned under a signature the Pursuer wrote, and buried in the prison. His death is presented in Arc 2 as a fact whose meaning Roxana will learn later, so an answer is implied to exist. No document states how he died, and his death is not on the open-questions register — the register asks only where in the five years the event falls. Two candidate answers are available from the established facts and they produce incompatible stories: extraction or custody killed him, or he died for reasons unconnected to Vesper's work. The corpus establishes that extraction leaves the owner alive (`World/Magic System.md:135`) and that Rain survives a complete extraction and acts afterward (`Story Plan/1 The Spine.md:119`).
**Inference:** I infer the intended answer is that Aster died in state custody after his record was taken — the prison being his grave, the Pursuer's signature on the intake, and Roxana's unresolved relation to both suit that — and that the connection between extraction and his death is thematic (what was left of him) rather than causal. I infer the causal version was never explicitly ruled out, which matters because it is the version a reader will reach for.
**Why it matters:** If extraction can kill, then Rain's complete extraction is lethal and his survival needs an explanation beyond the semantic-encoding argument (E-009), and Vesper is a killer rather than a man who takes too much — which revises `Characters/1 Vesper.md:113` ("He must be right sometimes"). If custody killed him, the Pursuer's courteous proceduralism sits next to a death he signed for, and Roxana's fight in Arc 5 is against the man whose paperwork buried her father, which the Pursuer's file mentions only as "part of the history Roxana inherits" (`Characters/The Pursuer.md:69`) without the death being established. Roxana's entire motivation (`Story Plan/1 The Spine.md:25`) and the shard's meaning hang on this.
**Open question for the author:** How did Aster die?
**Candidate resolutions:**
1. *State custody, after extraction*: the record was taken, he was interned, and he did not survive the pod. Cost: requires stating why Rain survives what Aster did not, which pushes the burden onto E-009's mechanism.
2. *Extraction-related but not direct*: the removal of what he wanted left him unable to continue, and the death is the consequence the corrected city produces at its extreme. Cost: makes extraction a possible death sentence in the reader's mind, which changes the weight of every offer Vesper makes, including the Widower's.
3. *Unconnected to Vesper*: he died in an accident or by his own hand before or after his record was taken. Cost: requires stating the sequence, and risks making the shard's presence in the archive a coincidence — which weakens Arc 2 scene 7's withheld revelation.
**Status:** open

---

### E-029 — "Roxana burns Aster's shard" is an undefined third operation on a shard, and its two defined counterparts mean opposite things

**Element:** Aster's shard / the clean-rain actions
**Claimed function:** `Story Plan/Themes and Motifs.md:151` — "He begins as missing influence, becomes a preserved record in the archive and prison, and ends as a shard Roxana chooses not to keep."
**What the detail actually establishes:**
- `Story Plan/1 The Spine.md:123` — "Roxana burns Aster's shard and fills the lighter with her own flame."
- `World/Magic System.md:95` — "**Shatter** — Shattering a shard returns the memory to its original owner. Vesper permanently loses access to that record."
- `World/Magic System.md:99` — "**Melt** — Melt destroys the autobiographical memory for both the original owner and Vesper. It cannot be restored."
- `World/Magic System.md:151` — "Imprints and shards are physically ordinary unless a specified effect changes them."
- `World/Magic System.md:79` — "An intact shard is external memory storage. It is a resonantly continuous manifestation associated with Vesper's prism, not a finite chip broken from it."
- `Manuscript/Arc 5 - Proof/5 The extraction.md:7` — "A hint of a glass shard was appearing to emerge from my forehead."
- `Story Plan/1 The Spine.md:49` — "Roxana learns Aster's shard exists in the archive."
- `Characters/Vesper.md:91` — "The archive is his default."
**Type:** gap (protocol: `terminology drift`)
**Severity:** blocking
**Observation:** The magic system defines exactly two operations on an intact shard: shatter, which returns the memory to its owner, and Melt, which destroys it irrecoverably for both parties. "Burns" is neither, and it appears as the finale's closing image for Roxana in three documents. Shards are described as glass and as "physically ordinary," which does not establish that they can be burned; and `Story Plan/Themes and Motifs.md:151`'s "chooses not to keep" is compatible with returning it, destroying it, or simply leaving it. Separately, no document states how the shard travels from Vesper's archive at the caldera into Roxana's hand, though she was at the rearguard and arrives after the extraction (`Story Plan/1 The Spine.md:115`).
**Inference:** I infer the intended act is destructive and final — she ends the record rather than carrying it — and that "burns" was chosen for the image, with her flame as the agent. I infer the two defined operations were not consulted because the shard's fate was conceived as an image before it was conceived as a mechanic.
**Why it matters:** The two available readings give Roxana opposite arcs. If burning is shatter-equivalent, she returns Aster to himself and gives the outcome back to someone else, which matches Vesper's own note that restoration "gives the outcome back to someone else" (`Characters/1 Vesper.md:93`). If burning is Melt-equivalent, she destroys the last record of her father-figure — an act that is far darker, irreversible, and thematically loaded against a story that treats preservation and consequence with care. The scene cannot be written until this is decided, and `Story Plan/Themes and Motifs.md:109` and `:151` both inherit the ambiguity.
**Open question for the author:** What does burning a shard do — return the memory, destroy it, or something the system has not yet defined?
**Candidate resolutions:**
1. *Burning is a shatter performed with the flame*: the memory returns to Aster, who is dead, so it returns to no one. Cost: requires stating what shattering does when the owner is dead, which is a new rule and a bleak one.
2. *Burning is Melt*: she destroys it, and the vocabulary problem is solved by using the existing word. Cost: has Roxana performing the operation Vesper performed on her, which is a strong parallel and a large one — it may read as retaliation rather than relinquishment.
3. *Burning is a third operation: release without return or destruction*: the record ends without being destroyed. Cost: introduces a term the system does not have, in a document that forbids inventing synonyms (per this space's own standing rule), and needs its own constraints entry.
**Status:** open

---

### E-030 — The Gamer's file gives him a condition Vesper had nothing to do with, while the open register assumes otherwise

**Element:** The Gamer
**Claimed function:** `Characters/Asylum Patients/Gamer.md:11` — "He establishes the asylum's comfortable enclosure: a life can be rich in consumed experience and still remain sealed from consequence."
**What the detail actually establishes:**
- `Characters/Asylum Patients/Gamer.md:7` — "The pleasure is genuine. What is missing is not intelligence or feeling, but a project, relationship, or risk that carries those experiences back into his own life."
- `Characters/Asylum Patients/Gamer.md:15` — "Gaming can teach a skill, alter a life, or guide someone toward honest connection. It cannot substitute for every connection and experience outside it."
- `Story Plan/Open Questions.md:29` — "What did Vesper remove from the Gamer, and what ordinary asylum task makes the loss visible without explanation?"
- `Story Plan/1 The Spine.md:41` — "At lunch, let the Gamer establish the asylum's comfortable enclosure."
- `Story Plan/Choice Points.md:43` — pitfall 2's ending: "Rain accepts treatment for the ache of wanting, remains for additional sessions, and gradually lets the asylum determine what needs relief next."
- `Characters/The Widower.md:11` — "Because the first treatment worked, he returned eight more times over the next few years."
**Type:** hierarchy conflict (protocol: `contradiction`)
**Severity:** significant
**Observation:** The Gamer's document describes a life sealed from consequence by consumption, with no extraction in it and no missing memory. The open register asks what Vesper removed from him, which presupposes he is a patient of Vesper's. The Widower and the Fearless One are patients whose conditions are described as the result of treatment; the Gamer is the only named resident whose condition is not.
**Inference:** I infer the Gamer was designed for the pitfall's temptation — a comfortable enclosure Rain could settle into — and that his relation to Vesper was assumed later, when the asylum's population was unified as extracted people. I infer that as written, the asylum contains at least two kinds of resident, one of whom is there because of how he lives rather than because of what was taken from him.
**Why it matters:** Arc 2's horror is that relief works and authority expands. If the asylum also houses people untouched by Vesper, then Arc 2 scene 3 spends its lunch establishing a general condition of modern life rather than the specific enclosure Vesper creates, and the pitfall the scene illustrates becomes a lifestyle warning rather than a consequence of the antagonist's method. The register's own question about what the Gamer lost also cannot be answered from his document.
**Open question for the author:** Is the Gamer a Vesper patient, a long-term resident with no extraction, or both?
**Candidate resolutions:**
1. *He is a patient, and his file gains the missing want*: what he no longer cares to do with the systems he has mastered. Cost: the file needs a second section, and his scene function shifts from consumption to subtraction, which duplicates the Widower.
2. *He is not a patient, and the register's question is dropped*: the asylum shelters people for other reasons too. Cost: `Story Plan/Open Questions.md:29` must be closed, and the asylum's identity widens in a way that dilutes Vesper's authorship of it (touching E-022).
3. *He is a patient whose loss is invisible to everyone including him*: the scene shows an ordinary task he no longer wants to do, with no explanation. Cost: requires deciding what the task is, which is what the register already asks; the risk is a scene that reads as a puzzle rather than as company.
**Status:** open

---

## Elements that pass, and why (not findings)

Recording these because a clean audit should say where the material is doing its job. Each was tested against the same rubric and held.

- **The Widower.** `Characters/The Widower.md` is the reference standard in this corpus. It states a function ("the case that proves Vesper can be right," line 3), gives concrete detail that produces the effect rather than asserting it — running the kitchen, remembering everyone's name, recounting his wife's death "as though giving directions to a place he no longer lives" (line 15) — and assigns the reader's response without anyone speaking it ("Rain notices. Nobody explains the discomfort," line 17). It also independently supplies the general mechanism the ending needs (E-009), which is more than the extraction rules do. No gap found.
- **The four pitfalls' thematic progression** (`Story Plan/Choice Points.md:49`): old life → present relief → possible life → the decision itself. This is a real escalation with a stated logic, and Arc 5's lack of a shelter follows from it rather than being asserted. The gaps found (E-011, E-012, E-013, E-016) are in the pitfalls' implementation and exit conditions, not in the progression.
- **The Claire/Roxana/Vesper hand motif** (`Story Plan/Themes and Motifs.md:87–93`): Claire solves a small problem and Rain permits it; Roxana accepts Vesper's hand and is altered; Claire offers Rain a hand he cannot answer; the Ghost offers Roxana a hand that asks nothing; Rain repeats the gesture without a guide. Every step is physical, each is a different transaction with the same object, and the drafting risk (physical, unnamed) is stated. This is the best-executed motif in the plan and the finale's gesture has a clear lineage.
- **Rain's trait pair** (`Characters/0 Rain.md:33`, `:37`): "Struggles to answer in quiet rooms, but moves with sudden commitment in emergencies" is deployed exactly where the spine needs it — the vault theft, Arc 1 scene 8's decision to go, the Arc 4 quiet room, the Arc 5 decoy — and its failure at the extraction is caused by the Perfect Clone rather than by contradicting the trait. Tested for drift and found none.
- **Arc 3's semantic encoding as a consequence of completing lives.** Tested as a possible hierarchy conflict (does the ending reward the behaviour Arc 3 argues against?) and it does not hold: the mechanism is produced by *ending* lives, which is precisely what Arc 3 argues for. Completing and relinquishing is what leaves a survivable record; preserving is the pitfall. The mechanics and the theme agree here.
- **The void's use of lost first-person presence** (`Story Plan/Choice Points.md:53`, `Story Plan/1 The Spine.md:117`): tested for a conflict with the pitfall endings' loss of interior voice, and the distinction is sound — in the void Rain keeps choosing while the voice is gone; in a pitfall he stops choosing. Two different states of the same absence.
- **The Pursuer's fuel discipline** (`Characters/The Pursuer.md:87`, `:93`): a non-renewable reserve, a tracked depletion date, "never runs," and a spend-ahead at the end. The arithmetic across five years holds, and the recorded depletion date being distinct from a biological death date (line 103) is a precise, load-bearing distinction that the Arc 4 amnesty scene uses correctly.

---

## Summary table

| ID | Element | Type | Severity |
|---|---|---|---|
| E-001 | Correction (mechanism, owner, advance) | gap | blocking |
| E-002 | "Rain thins in corrected districts" | gap | significant |
| E-003 | The Ghost perceived by a non-owner | hierarchy conflict | blocking |
| E-004 | The prison spark (faculty and cost) | hierarchy conflict | blocking |
| E-005 | The "suit-self" / the Split's first appearance | gap | significant |
| E-006 | The three Melts | hierarchy conflict | blocking |
| E-007 | The beloved life (preserved vs. lived) | hierarchy conflict | significant |
| E-008 | The mountain's bodies | gap | significant |
| E-009 | "100%" extraction vs. surviving semantics | gap | significant |
| E-010 | Perfect Clone dose-response and recovery | load-bearing uncertainty | blocking |
| E-011 | The pitfall exit affordance | gap | blocking |
| E-012 | The dimming Ghost (two meanings) | hierarchy conflict | significant |
| E-013 | The Arc 3 pitfall (exit and optionality) | hierarchy conflict | blocking |
| E-014 | The false endings' notebook image | gap | significant |
| E-015 | Duplicated Imprint recovery | hierarchy conflict | significant |
| E-016 | The amnesty's expiry | gap | significant |
| E-017 | Arc 5's viewport and re-choice legibility | gap | blocking |
| E-018 | The ensemble's commitment in Arc 5 | unearned effect | significant |
| E-019 | The "not locked" Shiori beat | load-bearing uncertainty | significant |
| E-020 | The Ghost's final state vs. the open-hand gesture | gap | significant |
| E-021 | Arc 2's demonstration of Vesper's kindness | unearned effect | blocking |
| E-022 | The asylum | gap | significant |
| E-023 | The Fearless One and the Ruined One | unearned effect | significant |
| E-024 | Claire (referral, advocacy, appointment) | unearned effect | significant |
| E-025 | Rain ("breaks her model as noise") | unearned effect | significant |
| E-026 | Roxana's rearguard (ceiling; Empathic Burn) | hierarchy conflict | blocking |
| E-027 | The Pursuer's scene question | inert element | significant |
| E-028 | Aster's death | gap | blocking |
| E-029 | "Burns Aster's shard" | gap | blocking |
| E-030 | The Gamer | hierarchy conflict | significant |

**Counts:** 30 findings — 12 blocking, 18 significant. By type: 13 `gap`, 9 `hierarchy conflict`, 5 `unearned effect`, 2 `load-bearing uncertainty`, 1 `inert element`, plus one status-conflict register note carried inside E-019. Types are the audit vocabulary requested; each finding names its `AGENTS.md` protocol type in parentheses for handoff into `remember-rain/findings.md`.

**Elements covered:** the resonance/Imprint system and its costs (E-001, E-004, E-009, E-010); correction (E-001, E-002); Vesper and the asylum (E-021, E-022); the three Melts (E-006); the Split (E-005, E-020); Perfect Clone (E-010); the Ghost (E-003, E-005, E-012, E-020); the four exits and reconvergence (E-011, E-012, E-013, E-014, E-016); the Circuit Line (E-015, E-016); the beloved life and the mountain (E-007, E-008); extraction and the void (E-009, E-020); and each named character — Rain (E-025), Vesper (E-006, E-021), Claire (E-017, E-018, E-024), Roxana (E-018, E-026), Shiori (E-017, E-018, E-019), the Pursuer (E-016, E-027), Aster (E-028, E-029), the Widower (passes), the Gamer (E-030).
