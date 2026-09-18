# Remember Rain — Terminology & Canon Inventory Audit

**Scope:** terminology and canon inventory across `Characters/`, `Manuscript/`, `Story Plan/`, `World/`
(incl. the `<Title> MetaData.txt` Scrivener sidecars, which turned out to be a second canon layer).
**Method:** read-only on the story files. Every claim cites `path/relative/to/novel:LINE`.
**Status of the register:** `remember-rain/` does not exist in this repository (`ls remember-rain/`
→ no such file or directory), so no finding here has been ruled on. `findings.md` and
`decisions.md` are absent; every finding is new and every finding is `open`.

**Reading note:** raw files are backslash-escaped by Scrivener's compile step (`\#\#` = `##`,
`\*word\*` = `*word*`). Quotes below reproduce the raw text; read through the escapes.

**Corpus size:** 70 story Markdown documents — 8 in `Story Plan/`, 3 in `World/`, 8 in `Characters/`
(including the one file in `Characters/Asylum Patients/`), and 51 in `Manuscript/` — plus 80
Scrivener `<Title> MetaData.txt` sidecars, **62 of which carry a synopsis line that appears in no
`.md` file**. Of the 51 manuscript documents, 13 carry prose or scene notes and 38 carry a scene
label only.

---

## Blocking findings

### F-001 — Arc 5 scene 7's synopsis says Rain returns "with a newfound self," the opposite of the scene document and of the vision

**Type:** contradiction
**Severity:** blocking
**Evidence:** `Manuscript/Arc 5 - Proof/7 The return MetaData.txt:8` — "Rain back with a newfound self; Vesper's last assault; the Clone set out as bait"
**Also:** `Manuscript/Arc 5 - Proof/7 The return.md:1` — "Rain returns capable of responding, not with a newfound or completed self."
**Also:** `Story Plan/0 What is Remember Rain.md:31` — "Remembering does not complete him, certify his growth, or reconnect him to a finished self."
**Also:** `Characters/0 Rain.md:119` — "He does not discover a true or final self. He remains hesitant, unfinished, and capable of relapse."
**Observation:** The `.md` scene document and the sidecar synopsis for the *same scene* state opposite outcomes. The `.md` explicitly negates "a newfound self"; the sidecar asserts it.
**Inference:** These are two exports of one Scrivener document at different times — the sidecar's `Modified:` stamp (`Manuscript/Arc 5 - Proof/7 The return MetaData.txt:2`, "Modified: August 28, 2026 at 2:32 PM") post-dates the planning pass that produced the `.md` Context line, so the sidecar is most likely the stale layer. I cannot confirm this from the export alone; per `AGENTS.md` the Scrivener project is authoritative and this export may lag it. Either way the two texts cannot both be the synopsis of Arc 5 scene 7.
**Why it matters:** The scene is the story's proof of concept — Rain's final response without a finished self. `Story Plan/Arc Structure.md:19` makes the whole arc's thesis "Evidence reaches its limit. Vesper owns the complete past record and still cannot determine the next response." A "newfound self" ending would satisfy the vindication the vision refuses (`Story Plan/0 What is Remember Rain.md:33`, "The final choice matters without vindication, certainty, or recovered ownership of the past.").
**Open question for the author:** Is Arc 5 scene 7 "Rain back with a newfound self," or "Rain returns capable of responding, not with a newfound or completed self"?
**Candidate resolutions:**
1. **Sidecar is stale** — replace the sidecar synopsis with the `.md` Context wording. Cost: none to the `.md`; the synopsis is a drafting aid no other document quotes.
2. **The `.md` Context line is the stale one** — then `Story Plan/0 What is Remember Rain.md:31`, `Characters/0 Rain.md:119`, and `Story Plan/1 The Spine.md:119` ("Rain returns capable of responding, not newly completed") all need rewording, and the ending-intent section loses its load-bearing sentence.
3. **They describe different moments** — the sidecar covers Vesper's assault, the `.md` covers the return before it. Cost: the sidecar's clause order ("Rain back with a newfound self; Vesper's last assault") puts the return first, so this reading needs the synopsis rewritten anyway.
**Status:** open

---

### F-002 — The locked final line exists in two wordings: "I am Rain" and "I choose to be Rain"

**Type:** contradiction
**Severity:** blocking
**Evidence:** `Manuscript/Arc 5 - Proof/10 The outbound train MetaData.txt:8` — "He remembers everything and cannot feel that it was him. In spite of it all, I choose to be Rain."
**Also:** `Story Plan/0 What is Remember Rain.md:39` — "The locked ending is a present claim, not discovery of a true self:" followed at `:45` by "In spite of it all, I am Rain."
**Also:** `Characters/0 Rain.md:63` — "**Locked callbacks — use these exact selected lines from `Manuscript/Arc 1 - Fugitive/0 Rain intro.md`:**" followed at `:75` by "In spite of it all, I am Rain."
**Also:** `Manuscript/Arc 1 - Fugitive/0 Rain intro.md:40` — "**In spite of it all, I am Rain.**" (bolded = the selected candidate among four variants at `:18`–`:44`)
**Observation:** The line is marked locked in two planning documents and bolded as the selection in the manuscript source. The Arc 5 scene 10 sidecar gives a different verb: "I choose to be Rain."
**Inference:** The two differ in meaning, not just wording. "I am Rain" is a present-tense claim of identity (`Story Plan/0 What is Remember Rain.md:39`, "a present claim"); "I choose to be Rain" is a commitment to a future act. The vision's stated intent — "The final choice matters without vindication, certainty, or recovered ownership of the past" (`Story Plan/0 What is Remember Rain.md:33`) — can support either, which is likely why the variant persists. But the manuscript file already lists the rejected variants at `:42`–`:44` ("In spite of the fall, I am Rain."), so a fifth variant living only in the sidecar is not a recorded candidate.
**Why it matters:** This is the last sentence of the story. `Story Plan/1 The Spine.md:125` requires the scene to "End with the exact selected callback from `Manuscript/Arc 1 - Fugitive/0 Rain intro.md`." If the sidecar's verb reaches the page, the finale no longer matches the locked callback or the opening it callbacks to.
**Open question for the author:** Which verb is the locked final line — "I am Rain" or "I choose to be Rain"?
**Candidate resolutions:**
1. **"I am Rain" stands** — correct the sidecar. Cost: none; sidecars are unpublished. Costs nothing in the `.md` corpus, which is unanimous.
2. **"I choose to be Rain" is the newer selection** — then `Story Plan/0 What is Remember Rain.md:45`, `Characters/0 Rain.md:75`, and `Manuscript/Arc 1 - Fugitive/0 Rain intro.md:40` all need updating, and the `[ending callback]` block in that manuscript file must be re-bolded so the selection is unambiguous for the drafter.
**Status:** open

---

### F-003 — The Split survives an extraction the magic system says takes 100% of Rain's autobiographical memory

**Type:** contradiction
**Severity:** blocking
**Evidence:** `World/Magic System.md:127` — "Direct contact extracts **100% of Rain's autobiographical target**: every lived relationship, fear, choice, emotion, and connected context up to contact. There is no shield, hidden soul, secret autobiographical fragment, incomplete extraction, or protagonist immunity."
**Also:** `Characters/0 Rain.md:103` — "**The Split:** Rain's record of past failure in his own voice. It is unmarked at first and italicized after the mountain."
**Also:** `Story Plan/1 The Spine.md:121` — "Vesper offers to remove the Split. Rain refuses."
**Also:** `Manuscript/Dead Ends/2 The patient MetaData.txt:8` — "Arc 2 trap ending. He becomes a patient; the Split is taken."
**Observation:** The Split is defined as a record of Rain's past failures, i.e. lived choices. `Story Plan/1 The Spine.md:115` places the total extraction at Arc 5 scene 5; the offer to remove the Split is at scene 8, three scenes later. The Arc 2 trap-ending synopsis has Vesper taking it even earlier.
**Inference:** If the Split is autobiographical content, a 100%-of-target extraction at scene 5 should already have removed it, making Vesper's scene-8 offer incoherent. The escape hatch in the same document — `World/Magic System.md:129`, "Those are downstream encodings outside Vesper's autobiographical target" — is available only for Arc 3's semantic residue and Perfect Clone's fracture, both of which the same paragraph dates *after* Arc 3. The Split predates them: `Story Plan/1 The Spine.md:71` gives it "its first distinct mark" at the mountain (Arc 3 scene 4) and `Story Plan/Themes and Motifs.md:81` says it "is unmarked early," so it exists before Arc 3. The escape hatch does not reach it.
**Why it matters:** Two required scenes depend on this. Arc 5 scene 8 needs something for Vesper to offer and Rain to refuse — `Story Plan/Choice Points.md:101` protects it: "Rain refuses removal of the Split. Do not convert the refusal into an ending branch." And Arc 5 scene 6's whole claim (only factual, non-autobiographical knowledge remains) rests on the extraction being total.
**Open question for the author:** Is the Split inside or outside the autobiographical target Vesper extracts?
**Candidate resolutions:**
1. **The Split is outside the target** — the Split must then be reclassified in `Characters/0 Rain.md:103` from "record of past failure" to something the magic system already excludes (a passive expression, on the model of `World/Magic System.md:25`, where a passive is "involuntary, uncontrolled resonance"). Cost: the phrase "record of past failure" and the italic-ledger staging in `Story Plan/Themes and Motifs.md:79` both lose their literal grounding.
2. **The Split is taken at scene 5** — then Arc 5 scene 8's offer and Rain's refusal must be rebuilt around something else, and `Manuscript/Dead Ends/2 The patient MetaData.txt:8` becomes the normal case rather than an alternate one.
3. **Vesper's offer at scene 8 is retrospective/misleading** — he offers to remove a residue he cannot actually locate. Cost: this sits badly with `Characters/1 Vesper.md:29` ("Asks permission every time and means it") and makes his offer a lie by omission, and it would need an explicit note in `Story Plan/1 The Spine.md:121`.
**Status:** open

---

### F-004 — The notebook's second line is written in Arc 5 scene 8 or at the outbound train, depending on the document

**Type:** contradiction
**Severity:** blocking
**Evidence:** `Manuscript/Arc 5 - Proof/8 The refusal MetaData.txt:8` — "The notebook: first line, the whisper, second line."
**Also:** `Story Plan/Themes and Motifs.md:71` — "Every false ending closes it after one line. The outbound train is the only place the second line appears, followed by blank pages."
**Also:** `Manuscript/Arc 5 - Proof/10 The outbound train MetaData.txt:8` — "Rain alone; notebook open; two lines; the rest blank."
**Also:** `Story Plan/Choice Points.md:57` — "All four close on the notebook with one line written and the book shut. The second line appears only in the true ending."
**Observation:** The refusal scene synopsis puts both lines in Arc 5 scene 8. The outbound train sidecar describes the notebook arriving at the last scene already holding two lines. Themes and Motifs says the train is "the only place the second line appears." The Spine's refusal entry (`Story Plan/1 The Spine.md:121`) does not mention the notebook at all, and its outbound-train entry (`:125`) only describes the state — "The notebook contains two lines and many blank pages."
**Inference:** Reading the three consistent sources together (`Story Plan/Themes and Motifs.md:71`, `Characters/0 Rain.md:29` — "a second line would become evidence" — and `Story Plan/Choice Points.md:57`), the second line is the true route's final act and belongs to the last scene. The scene-8 sidecar moves the story's terminal gesture one scene early. It also introduces "the whisper," a term with no other occurrence (see F-014).
**Why it matters:** `Story Plan/1 The Spine.md:125` makes the train the final scene and `Story Plan/Arc Structure.md:25` repeats it — "The outbound train remains the final scene; nothing follows it." If the second line is written at scene 8, the train's only remaining content is the locked callback, and the false-ending contrast the notebook carries ("one line, closed") loses its true-route partner.
**Open question for the author:** Which scene writes the notebook's second line?
**Candidate resolutions:**
1. **The train (scene 10)** — correct the scene-8 sidecar to drop the notebook beat. Cost: scene 8's sidecar loses a beat and needs another closing image; "the whisper" needs a home or removal.
2. **The refusal (scene 8)** — then `Story Plan/Themes and Motifs.md:71` and `Story Plan/1 The Spine.md:125` must both be rewritten, and the train scene must acquire a new terminal action to sit beside the locked callback.
3. **The first line is scene 8, the second is the train** — the sidecar's list is read as covering the arc's notebook thread rather than the one scene. Cost: the synopsis is attached to a single Scrivener document, so this reading requires the sidecar to be rewritten to say so.
**Status:** open

---

### F-005 — Claire uses a Deviation deliberately, and no document names her bonded Imprint

**Type:** underdefinition
**Severity:** blocking
**Evidence:** `World/Magic System.md:41` — "A bonded Imprint is required for deliberate use of a Deviation. Lose it and the person returns to passive-only expression until it is recovered or another object resonates strongly enough to form a bond."
**Also:** `World/Magic System.md:37` — "An Imprint is an object whose existing resonance was patterned by an irreversible transition."
**Also:** `Characters/Claire.md:79` — "**Visual Calculus:** the broader predictive mode."
**Also:** `Story Plan/1 The Spine.md:113` — "Claire alternates the broad prediction of Visual Calculus with Convergence's local continuous revision while coordinating through Shiori's feeds."
**Observation:** Four of five magic users have an identified Imprint: Rain's goggles (`Characters/0 Rain.md:97`, "They retain the completed shape of choosing an unfinished, self-directed future over a prescribed route"), Roxana's lighter (`Characters/Roxana.md:81`, "Aster's empty lighter produces one small real resonant flame"), Vesper's prism (`Characters/1 Vesper.md:87`, "The prism is the Imprint formed by his mother's abandonment"), the Pursuer's greatcoat (`Characters/The Pursuer.md:45`, "the greatcoat became the Imprint of continuing after the reason for continuation had disappeared"). Claire's file names only the Static, the lens, the Click, Visual Calculus, and Convergence (`Characters/Claire.md:73`–`:81`); none is called an Imprint. Nor is any object in her history described as patterned by an irreversible transition — `Characters/Claire.md:75` defines the lens as something that "turns an auditory wound into something visual and legible," i.e. an accommodation she uses *because of* the collapse, not an object present *at* it.
**Inference:** Either Claire's Imprint is the lens (which requires the lens to predate or be materially involved in the collapse, and the file does not say so), or her Imprint is an unnamed fifth object, or the magic system's requirement does not apply to her. Nothing in the corpus selects among these.
**Why it matters:** Arc 5 scene 4 is the payoff of Claire's arc and consists entirely of her running both modes to destruction (`Story Plan/1 The Spine.md:113`, "Complexity, duration, execution, and repeated use overwhelm her"). The scene cannot be staged — and the cost curve in `World/Magic System.md:67` cannot be attributed — without knowing what she is bonded to and whether losing it matters.
**Open question for the author:** What is Claire's Imprint, and what irreversible transition patterned it?
**Candidate resolutions:**
1. **The lens is the Imprint** — patterned not by the collapse but by an earlier transition the file has not yet named; add it to `Characters/Claire.md:75`. Cost: the lens is currently written as an accommodation ("Show accommodations, recovery, established protocols, and accepted help," `Characters/Claire.md:101`), and making it an Imprint puts her assistive device at risk of removal, which touches `Characters/Claire.md:103` ("Removing the lens is an act under uncertainty, not an instant recovery").
2. **An unnamed object carries it** — add a short entry to `Characters/Claire.md:69`–`:85`. Cost: a new object must then appear or be referenced in the manuscript; none currently does.
3. **Claire is exempt** — record an explicit exception in `World/Magic System.md:41`. Cost: the system's clean three-step chain (`World/Magic System.md:33`, "passive resonance → compatible-Imprint pull → bonded unique Deviation") acquires its first exception, and `World/Magic System.md:145` ("A bonded Imprint is required for deliberate Deviation use, except for rare uncontrolled and costly passive breakouts") must be amended.
**Status:** open

---

## Significant findings

### F-006 — The state apparatus has three names: "the System," "the Ministry," and "Nimbus"

**Type:** terminology drift
**Severity:** significant
**Evidence:** `Manuscript/Arc 1 - Fugitive/5 The follow.md:3` — "%% He follows it anyway — to a disappearance site thick with System personnel. No body, no struggle; the missing man had been doing better lately. \| Rain, Ghost, System \| disappearance site"
**Also:** `Story Plan/1 The Spine.md:23` — "Rain follows the Ghost to a disappearance site full of Ministry personnel."
**Also:** `Manuscript/Arc 1 - Fugitive/2 The vault MetaData.txt:8` — "The alley opens into a System building someone already broke into: the confiscated-Imprint vault."
**Also:** `World/Locations.md:31` — "### The Water Ministry"
**Also:** `World/History.md:5` — "In the five years after the Flare, the Water Ministry and Nimbus Co. turned an uneven physical phenomenon into an administered civic system."
**Observation:** "System" appears as a capitalized institution in five places, all of them scene notes or sidecars and all outside the World folder: `Manuscript/Arc 1 - Fugitive/5 The follow.md:3` and its sidecar `:8` and `:10`; `Manuscript/Arc 1 - Fugitive/2 The vault MetaData.txt:8` and `:10`; `Manuscript/Arc 2 - Mirror/10 The referral MetaData.txt:8`; `Manuscript/Arc 3 - Prisoner/1 Intake MetaData.txt:8`. No World document defines an institution called the System. The defined institutions are the Water Ministry (`World/Locations.md:31`) and Nimbus Co., "A private contractor that builds and maintains Ministry infrastructure" (`World/Locations.md:49`). Lowercase "the state" is used elsewhere for the same referent (`Story Plan/Arc Structure.md:13`, `Story Plan/1 The Spine.md:35`, `Characters/1 Vesper.md:61`, `Characters/Shiori.md:3`).
**Inference:** "System" is a drafting shorthand for the whole administrative apparatus — the thing that arrives, that owns trays, that personnel belong to — and it is the term five scene notes actually reach for. It is not the same referent as the Ministry (which administers water, `World/Locations.md:33`) or Nimbus (which builds), but the scene notes use it where the prose would need one of the two.
**Why it matters:** Arc 1 scene 5 and Arc 2 scene 10 are the two places the institution is *visibly on stage* — a disappearance site and an arrival to take Rain into custody. Whichever name the drafter uses will define the institution's public face, and `World/Locations.md:45` forbids giving the Ministry a face: "Never give the Ministry a single villainous face." If "System" is the on-stage body with personnel, it is a third faction the World folder does not contain.
**Open question for the author:** Is "the System" a fourth name for the same apparatus, an informal drafting shorthand to be replaced, or a genuine in-world term for the enforcement arm?
**Candidate resolutions:**
1. **Shorthand** — replace "System" with the intended institution in the five scene notes and sidecars. Cost: each occurrence needs its own decision between Ministry and Nimbus, since the vault (`Manuscript/Arc 1 - Fugitive/2 The vault.md:159`, "Nimbus. A name ingrained in my head from all of the case files I handled in my previous job") and the disappearance site may not be the same body.
2. **In-world term** — add an entry to `World/Locations.md` defining the System as the apparatus as experienced from outside. Cost: the World folder gains a third institution and `World/History.md:37` ("The Water Ministry's institutional power grows from water administration and resonance management, not from a separate supernatural government") must be checked against it.
3. **Absorb into "the state"** — capitalize consistently and use "the state" in scene notes, reserving Ministry/Nimbus for their functions. Cost: `World/Locations.md:45`'s rule that the Ministry have no face becomes harder to keep if the notes now call its personnel "state personnel."
**Status:** open

---

### F-007 — "stasis" is used with two unrelated meanings, and the world-scale one is never defined

**Type:** terminology drift
**Severity:** significant
**Evidence:** `Story Plan/Themes and Motifs.md:85` — "**Drafting risk:** The Perfect Clone is perfected stasis, not growth."
**Also:** `World/History.md:7` — "while its apparent weakening accompanies the correction's spread through accepted relief and increasing stasis."
**Also:** `World/Magic System.md:17` — "Whether the reservoir is depleting, persistent, or periodically inert—and how correction and stasis affect its circulation—remains unsettled."
**Also:** `Story Plan/Open Questions.md:51` — "What is the exact relationship between correction, stasis, and weakening water circulation?"
**Also:** `World/Locations.md:29` — "Its weakening becomes visible in thinning rain and an increasingly static city."
**Observation:** In Themes and Motifs, "stasis" is a metaphor for the Perfect Clone — a preserved counterfeit that does not grow. In History, Magic System, and Open Questions, "stasis" is a city-scale condition that spreads with the correction, weakens water circulation, and is paired with an "increasingly static city" in Locations. Both uses are load-bearing; neither document acknowledges the other.
**Inference:** The metaphor and the mechanic are not obviously reconcilable — the Perfect Clone's stasis is a property of one projection, while the world's stasis is a process measured across districts. The overlap may be deliberate resonance (the Clone is the correction in miniature), but nothing states that, and the world-scale term is never defined at all: it appears three times, always inside a sentence declaring its relationship to correction "unsettled" or "unresolved."
**Why it matters:** Arc 4's measurable decline (`Story Plan/1 The Spine.md:85`, "A full lap makes the correction measurable") and Arc 5's apparatus break both need the world-scale term to have a definition, because `World/Locations.md:25` makes the physical collapse of the apparatus and water loop the cause of the clean rain. Meanwhile `Story Plan/Themes and Motifs.md:85` is the drafting note that stops the Clone reading as a power-up, which is a different job.
**Open question for the author:** Is the Perfect Clone's "stasis" the same phenomenon as the city's, or a metaphor that should be dropped from `Story Plan/Themes and Motifs.md:85` to keep the mechanic's term clean?
**Candidate resolutions:**
1. **Same phenomenon, deliberately** — add one line to `Story Plan/Themes and Motifs.md:85` or `World/History.md:7` stating that the Clone is the correction in miniature. Cost: it makes a character's ability an instance of the world's antagonist process, which risks reading as a power-up keyed to the plot.
2. **Different things, rename the metaphor** — replace "perfected stasis" with wording drawn from the existing Gold Vocabulary (`Story Plan/Themes and Motifs.md:165`, "`seamless` — the Perfect Clone; perfected counterfeit presence"). Cost: one word changes; `World/History.md:7`, `World/Magic System.md:17`, and `Story Plan/Open Questions.md:51` stay untouched.
3. **Define the world term, leave the metaphor** — give "stasis" an entry in `World/Locations.md` or `World/History.md` as the settled-city condition. Cost: the term currently sits inside three sentences that declare it unresolved, so the entries in `World/History.md:7` and `World/Magic System.md:17` would need rewording from "unresolved" to a partial definition.
**Status:** open

---

### F-008 — "substrate" means a kind of matter in three documents and a pair of categories in a fourth

**Type:** terminology drift
**Severity:** significant
**Evidence:** `World/Magic System MetaData.txt:8` — "The Flare, the two substrates (Deviation and Imprint), passives, costs, and the memory exception."
**Also:** `World/Magic System.md:13` — "The exact threshold varies by substrate. People, objects, living things, water, and other materials retain or express the same seeded phenomenon differently according to what they are."
**Also:** `World/Magic System.md:11` — "certain locations, substrates, and relatively closed natural systems retained unusually high concentrations."
**Also:** `Story Plan/Open Questions.md:41` — "How do living and non-object substrates retain or release resonance on the page?"
**Observation:** The Magic System sidecar describes the taxonomy as having exactly two substrates, named Deviation and Imprint. The document it summarises uses "substrate" for the material kind — people, objects, living things, water, other materials — and lists substrates alongside locations and closed natural systems. Open Questions uses the material sense in "living and non-object substrates." Deviation is also not a substrate in the document's own terms: `World/Magic System.md:29` defines it as an ability that belongs to a person, not a bearer of resonance.
**Inference:** These are two different technical senses of one word, and the sidecar's sense appears nowhere else. The document-side sense (matter) is the one the mechanics depend on, because `World/Magic System.md:13` uses it to explain why the same event produces different results in a person and in a coat.
**Why it matters:** The taxonomy is the story's core exposition layer. A drafter reading the sidecar would take "the two substrates" as the system's shape and write exposition that contradicts `World/Magic System.md:13`. This is also the only place in the corpus that names the system's parts as exactly two.
**Open question for the author:** Is "substrate" the material (as `World/Magic System.md:13` uses it) or the category pair (as the sidecar uses it)?
**Candidate resolutions:**
1. **Material sense wins** — correct the sidecar to name the taxonomy differently, e.g. "the two patterned categories (Deviation and Imprint)." Cost: one word in an unpublished sidecar.
2. **Category sense is intended as a summary** — leave both, and add a clarifying clause to `World/Magic System.md:13` that distinguishes "substrate" from "category." Cost: the Magic System gains a definitional aside in a document that opens by promising legibility "through objects, bodily costs, and repeated behavior rather than exposition" (`World/Magic System.md:3`).
**Status:** open

---

### F-009 — Themes and Motifs says Rain's extraction "produces a prism," but the prism is Vesper's pre-existing Imprint and extraction produces a shard

**Type:** contradiction
**Severity:** significant
**Evidence:** `Story Plan/Themes and Motifs.md:99` — "Rain's extraction produces a prism while changing his relation to the completed record."
**Also:** `Characters/1 Vesper.md:87` — "The prism is the Imprint formed by his mother's abandonment. Extracted shards are resonantly continuous manifestations associated with it, not finite chips physically removed from the object."
**Also:** `World/Magic System.md:79` — "An intact shard is external memory storage. It is a resonantly continuous manifestation associated with Vesper's prism, not a finite chip broken from it."
**Also:** `Manuscript/Arc 5 - Proof/5 The extraction.md:7` — "A hint of a glass shard was appearing to emerge from my forehead."
**Also:** `Story Plan/1 The Spine.md:121` — "Vesper is left with the prism and an event his finished records could not predict."
**Observation:** The prism is a single named object that predates the story (left on a table by Vesper's mother, `Characters/1 Vesper.md:43`) and survives to the final scene. The thing extraction creates is a shard. Themes and Motifs uses "prism" for what extraction produces.
**Inference:** Either "produces a prism" is loose shorthand for "produces a shard, which the prism now holds," or the passage describes the prism changing state — which `Story Plan/Open Questions.md:75` already lists as undecided ("What state is the prism in when Vesper ends holding it?"). The corpus elsewhere is precise about the distinction, and `Characters/1 Vesper.md:87` spends a sentence specifically denying that shards are chips off the prism.
**Why it matters:** Arc 5 scene 9's coda and Vesper's final image (`Characters/1 Vesper.md:67`, "Vesper ends holding the prism") both stage the prism on screen. A document that says extraction created it invites staging a second prism, or a prism that did not exist before Arc 5.
**Open question for the author:** Does Themes and Motifs mean extraction produces a shard held by the existing prism, or that the prism itself is new or transformed?
**Candidate resolutions:**
1. **Shard** — change `Story Plan/Themes and Motifs.md:99` to "produces a shard." Cost: one word; leaves `Story Plan/Open Questions.md:75` still open, as intended.
2. **Prism transformed** — keep the wording and answer `Story Plan/Open Questions.md:75` explicitly in `World/Magic System.md`. Cost: the Magic System must state how a shard changes its host object, which the current text deliberately avoids by calling shards "resonantly continuous manifestations."
**Status:** open

---

### F-010 — "the suit-self" and "the Split" are never linked, and the Split is defined as a voice but staged as a body

**Type:** terminology drift
**Severity:** significant
**Evidence:** `Story Plan/1 The Spine.md:65` — "Rain enters the white void and meets the suit-self that calls him a coward."
**Also:** `Manuscript/Arc 3 - Prisoner/2 True silence.md:43` — "A faint sheen in his hair. A pair of square glasses, definitely more refined than whatever I could realistically imagine. A slight but almost refined stubble, as if he designed the look himself. The loosely hanging tie seemed to remind me who he was, even before the dark grey business suit finished materializing around him."
**Also:** `Characters/0 Rain.md:103` — "**The Split:** Rain's record of past failure in his own voice. It is unmarked at first and italicized after the mountain."
**Also:** `Story Plan/Themes and Motifs.md:79` — "The Split speaks in Rain's voice as a ledger of failure."
**Also:** `Manuscript/Arc 3 - Prisoner/4 The mountain MetaData.txt:8` — "One italicized Split line."
**Observation:** There are two Arc 3 void figures under two names. The suit-self appears in Arc 3 scene 2, twice in the Spine and its sidecar (`Story Plan/1 The Spine.md:65`; `Manuscript/Arc 3 - Prisoner/2 True silence MetaData.txt:8` and `:10`). The Split appears under that name in six places across `Characters/0 Rain.md:103`, `:117`, `Story Plan/Themes and Motifs.md:35`, `:79`, `:81`, `:85`, `Story Plan/1 The Spine.md:71`, `:121`, `Story Plan/Choice Points.md:101`, and `Story Plan/Arc Structure.md:25`. No document connects the two names, and no document says they are the same figure or different ones.
**Inference:** The timing lines up — the Split is "unmarked early" and takes its first italicized line at the mountain (`Story Plan/1 The Spine.md:71`), so an unmarked early appearance in the Arc 3 void is available. The staging does not line up: the Split is defined as a voice and a record ("in his own voice"; "speaks in Rain's voice as a ledger of failure"), while the prose stages a fully embodied replica with a designed appearance, and `Characters/0 Rain.md:103` insists "Never settle whether it is another entity or only Rain." A body with a wardrobe is not a voice, and it is not ambiguous in the way the definition asks it to be.
**Why it matters:** Arc 3 scene 4's beat is "The Split receives its first distinct mark" — a visual or typographic event that only reads as a *first* mark if the drafter knows what unmarked looked like at scene 2. Two names for the pre-mark state means the drafter cannot know whether scene 2 is the Split's first appearance or a separate hallucination.
**Open question for the author:** Is the Arc 3 scene 2 suit-self the Split in its unmarked state, a separate figure, or the same thing under a name that should be unified?
**Candidate resolutions:**
1. **Same thing** — unify on one name across the Spine, the sidecar, Rain's file, and Themes and Motifs. Cost: whichever name loses is used in more documents; "the Split" appears in nine places to "suit-self"'s three, so the cheaper fix is to retire "suit-self" — but the prose's embodied staging at `Manuscript/Arc 3 - Prisoner/2 True silence.md:41`–`:49` then needs to justify a body under a voice's name, or `Characters/0 Rain.md:103` needs rewording.
2. **Different things** — record the distinction explicitly (a tank-induced replica vs. Rain's failure ledger). Cost: Arc 3 gains a second void figure to introduce and account for, and `Story Plan/Themes and Motifs.md:79` must say which one has the open hand.
3. **Leave the names unresolved as an intentional ambiguity** — then say so, on the model of the existing instruction at `Characters/0 Rain.md:103`. Cost: the instruction currently covers only entity-or-not-Rain; it would need to extend to the naming.
**Status:** open

---

### F-011 — Gadget X is "the more consequential" theft and has no defined function

**Type:** underdefinition
**Severity:** significant
**Evidence:** `Story Plan/1 The Spine.md:19` — "Evidence shows Rain leaving with Shiori property, so authorities attribute the more consequential gadget theft and related disappearances to him."
**Also:** `Characters/Shiori.md:87` — "Gadget X is a separate recent device, mundane when built, which she breaches the vault to recover. Its function remains unresolved."
**Also:** `World/Locations.md:59` — "Shiori breaches it to recover Gadget X, a recent device that was mundane when built."
**Also:** `Story Plan/Open Questions.md:71` — "What does Gadget X do?"
**Observation:** Four documents agree Gadget X is Shiori's, recent, and "mundane when built," and that its function is undecided. The Spine simultaneously calls its theft "more consequential" than the goggles'. The goggles are a functioning Imprint with a documented history (`Characters/0 Rain.md:97`) and a documented legal status (`World/Locations.md:59`, "logged as Nimbus property on loan to the state"); Gadget X has neither.
**Inference:** "More consequential" is doing narrative work that no document supports. If Gadget X is mundane and its function undecided, nothing in the corpus explains why official attention lands on it rather than on the goggles — and `Story Plan/1 The Spine.md:19` needs the accusation's severity to be plausible enough that Rain cannot simply explain it away.
**Why it matters:** This is the inciting misattribution. Arc 1 scene 3's whole beat is "Official numbers and a plausible theory spread" (`Story Plan/1 The Spine.md:19`), and Arc 4 scene 3's exoneration depends on Shiori's recordings dismantling "the larger accusation" (`Characters/Shiori.md:77`, "Even after her recordings dismantle the larger accusation"). A plot whose first act turns on one object's consequence cannot leave that object's function open.
**Open question for the author:** What does Gadget X do, and what makes its theft more consequential than the goggles'?
**Candidate resolutions:**
1. **Gadget X is a recording or surveillance device** — it would connect directly to Shiori's established confiscated recorder (`Characters/Shiori.md:83`, "Her first major project was an external recording system built after her injury. The state confiscated and scaled it into unattended surveillance infrastructure") and to the Arc 4 scene 3 exoneration. Cost: Shiori's file currently keeps Gadget X and the recorder as separate items (`Characters/Shiori.md:87`), so the two would need distinguishing or merging.
2. **Gadget X is a prototype of the correction apparatus** — it would tie the inciting theft to the Arc 5 climax object. Cost: it makes Shiori an unwitting author of the story's central horror, which changes `Characters/Shiori.md:111`'s "one quiet beat of complicity about the surveillance system" into something much larger.
3. **"More consequential" is a Nimbus claim, not a fact** — the theft is treated as consequential because Nimbus says so, and the story keeps the object's function off-page. Cost: `Story Plan/1 The Spine.md:19` would need to attribute the phrase, and Arc 4 scene 3's exoneration would need to turn on the claim rather than the device.
**Status:** open

---

### F-012 — "the correction apparatus" is the object Rain breaks in the finale and has no definition; "the eruption" is named once inside a section about a dormant volcano

**Type:** underdefinition
**Severity:** significant
**Evidence:** `Story Plan/1 The Spine.md:121` — "He uses the open-hand gesture without summoning the Ghost and breaks the correction apparatus."
**Also:** `World/Locations.md:25` — "When the correction apparatus and water loop break, the eruption and clean rain are physical consequences rather than the universe approving Rain's choice."
**Also:** `World/History.md:27` — "The correction advances through accepted relief; it reaches an anchor station only after the amnesty is refused, and breaking the apparatus stops the loop itself."
**Also:** `World/Locations.md:15` — "An island city under near-constant rain, built around a dormant volcano."
**Also:** `Manuscript/Arc 5 - Proof/8 The refusal MetaData.txt:8` — "Controlled eruption; the water loop breaks; first clean rain."
**Observation:** The apparatus is named in four documents as the thing Rain breaks — the hinge of the climax (`Story Plan/Arc Structure.md:25`, "Extraction is the hinge. It is followed, in order, by the void, Rain's return, his refusal to remove the Split, the apparatus breaking, and brief clean-rain actions for the ensemble") — and appears in no location entry. `World/Locations.md:73`–`:75` covers the Caldera Rim and Central Circulation Hub in two sentences and does not mention it. The word "eruption" appears exactly once, in `World/Locations.md:25`, inside the section titled "The Dormant Volcano and Caldera," and is listed beside "clean rain." The scene-8 sidecar says "Controlled eruption."
**Inference:** The apparatus may or may not be a physical machine Rain can break with his hands; the caldera section places the breaking point "of the water loop" (`World/Locations.md:75`) rather than naming a device. The single "eruption" is ambiguous by construction: read inside a volcano section alongside "dormant volcano" (`World/Locations.md:15`) it most naturally means volcanic, but "Controlled eruption" in the sidecar argues for a venting of the apparatus, and neither `Story Plan/1 The Spine.md:123` nor `Story Plan/Themes and Motifs.md:61` — the two passages that describe the aftermath — mentions an eruption at all, both describing only clean rain following "the physical collapse of the apparatus and water loop."
**Why it matters:** Arc 5 scene 8's staging is the story's physical climax, and its visual is undecided between a device breaking and a volcano erupting. The uncertainty propagates: if the volcano erupts, the "clean rain" ending (`Story Plan/1 The Spine.md:123`, `Story Plan/Themes and Motifs.md:61`) is a small coda to a large event, and `World/Locations.md:19`'s rule ("The horror is not overt dystopia") and `:21` ("Avoid overt dystopian spectacle") argue against spectacle at the top of the finale.
**Open question for the author:** Is "the eruption" the controlled venting of the correction apparatus, or volcanic activity at the caldera — and is the apparatus a discrete object Rain can break?
**Candidate resolutions:**
1. **Apparatus = machine, eruption = its controlled venting** — add an entry to `World/Locations.md` for the apparatus and reword `World/Locations.md:25` to make the eruption non-volcanic. Cost: two World edits; the dormant volcano stays dormant and the caldera's "physical breaking point" stays about the water loop.
2. **Apparatus = the caldera system itself, eruption = volcanic** — then `World/Locations.md:15` and `:23` ("The Dormant Volcano and Caldera") must be reconciled with a volcano that erupts, and `Story Plan/1 The Spine.md:123` and `Story Plan/Themes and Motifs.md:61` need the eruption added to the aftermath. Cost: the largest cascade of the three, and it works against `World/Locations.md:19`–`:21`.
3. **Keep the apparatus off-page** — it is only ever the thing broken, never described. Cost: `World/Locations.md:25` still needs "eruption" disambiguated or removed, since a Location entry is where a drafter looks up what the finale looks like.
**Status:** open

---

### F-013 — Planning-facing terms defined only in unpublished sidecars: "the appointment," "TELL 1–3" and "the gap," "the whisper," "the momentum theorem"

**Type:** underdefinition
**Severity:** significant
**Evidence:** `Story Plan/1 The Spine.md:123` — "Claire abandons the appointment she no longer intends to keep."
**Also:** `Manuscript/Arc 2 - Mirror/9 The still room MetaData.txt:8` — "Her procedural word to Vesper. The appointment, not the cure."
**Also:** `Manuscript/Arc 2 - Mirror/8 The melt MetaData.txt:8` — "TELL 3 at breakfast (the loadout, unremarked)."
**Also:** `Manuscript/Arc 2 - Mirror/7 Aster's trail ends here MetaData.txt:8` — "Opens on TELL 2 (the gap)."
**Also:** `Manuscript/Arc 5 - Proof/8 The refusal MetaData.txt:8` — "The notebook: first line, the whisper, second line."
**Also:** `Manuscript/Arc 4 - Witness/6 The voice MetaData.txt:8` — "the momentum theorem — \"what's your model's answer for the fifty-first?\""
**Observation:** Five coined terms are used as definite nouns with no antecedent in any `.md` file. "The appointment" is the exception in one direction: it *is* used in the plan, once, at `Story Plan/1 The Spine.md:123`, and its only defining sentence is in a sidecar attached to an Arc 2 scene — a file the site does not publish.
**Inference:** The reading `Her procedural word to Vesper. The appointment, not the cure.` (`Manuscript/Arc 2 - Mirror/9 The still room MetaData.txt:8`) is the only place the word is glossed, and it glosses Claire's scene-9 referral decision — which is what makes `Story Plan/1 The Spine.md:123`'s "the appointment she no longer intends to keep" legible as the reversal of that same act. Without the sidecar, the Spine's final-scene coda names an object the plan never introduced.
**Why it matters:** `Story Plan/1 The Spine.md:123` is the clean-rain coda and the last time Claire appears. A coda built on an unexplained noun either reads as a missing payoff or forces the drafter to invent one. The same risk applies more mildly to "TELL 1–3," which the sidecars use as the escalation ladder for Vesper's borrowed behavior (`Manuscript/Arc 2 - Mirror/2 The demonstration MetaData.txt:8`, "TELL 1 mid-bout: Vesper corrects Roxana in a style that isn't his"), while the Spine describes each tell in prose without numbering it.
**Open question for the author:** Should "the appointment" (and the numbered tells) be promoted into the planning documents, or replaced with the plain description the Spine already uses?
**Candidate resolutions:**
1. **Promote into the plan** — define "the appointment" in `Story Plan/1 The Spine.md:53` (the still room entry) so `:123` has an antecedent. Cost: one clause; makes the referral's name explicit earlier than the reveal, which may pre-empt Arc 4's accusation beats.
2. **Replace with description** — reword `Story Plan/1 The Spine.md:123` to say what Claire abandons rather than naming it. Cost: loses the shorthand across Scrivener, where the term is presumably in use.
3. **Leave it and accept the sidecar as canon** — record that sidecars carry defining text. Cost: conflicts with the export's own note that sidecars are metadata, and the site publishes only `.md` files.
**Status:** open

---

### F-014 — Named entities that appear exactly once, in sidecars only: "the Unburdening," "Still Point," "the emptied," "THE RE-WEIGHTING"

**Type:** underdefinition
**Severity:** significant
**Evidence:** `Manuscript/Arc 2 - Mirror/1 The open door MetaData.txt:8` — "The Unburdening used comfortably, defined by nobody."
**Also:** `Manuscript/Arc 5 - Proof/4 The overwatch MetaData.txt:8` — "Still Point at contact range, no harm done. \"Go.\""
**Also:** `Manuscript/Arc 5 - Proof/4 The overwatch MetaData.txt:10` — "Claire, the emptied (Arc 2 faces), Shiori's feeds | the nest above the field"
**Also:** `Manuscript/Arc 5 - Proof/6 The void MetaData.txt:8` — "THE RE-WEIGHTING: memories return as flat facts, and each choice reattaches weight to one."
**Observation:** Four names with no occurrence anywhere else in the corpus. Two are plural-named groups or processes that a scene's cast list depends on: "the emptied" is listed as present in Arc 5 scene 4, and the parenthetical "(Arc 2 faces)" is the only statement anywhere that Arc 2's asylum residents appear in Arc 5. "Still Point" is a capitalized state held by Claire at contact range, in the scene where `Story Plan/1 The Spine.md:113` has her say "Go" without a complete model. "THE RE-WEIGHTING" is the named mechanism of the void scene, which `Story Plan/1 The Spine.md:117` describes without naming: "Non-branching choices create present consequences without restoring ownership or reconstructing an old identity."
**Inference:** Each of these is a working name for something the plan describes in prose. "The Unburdening" is the most consequential, because the sidecar's own gloss — "used comfortably, defined by nobody" — reads as an authorial note that the term is deliberately unglossed in-world (`World/Locations.md:43` says Ministry forms "do not say *deviant*, *correction*, or *extraction*", so an innocuous public name is exactly what that rule implies). "Still Point" is the closest to a genuine gap: it may be a second name for the Click (`Characters/Claire.md:77`, "the instant of silence that arrives with a completed model") or a different state, and the corpus does not say which.
**Why it matters:** Arc 5 scene 4's cast list is the only record that Arc 2's residents return, and Arc 5 scene 6's named mechanism is the only place the void's effect has a title. A drafter working from `.md` files alone would stage both scenes without either.
**Open question for the author:** Which of these four names are in-world vocabulary, which are private drafting handles, and is "Still Point" the same state as "the Click"?
**Candidate resolutions:**
1. **"Still Point" = the Click** — note the equivalence in `Characters/Claire.md:77`. Cost: the sidecar's "no harm done" ("Still Point at contact range, no harm done") sits oddly with a state defined as the relief of a completed model, since scene 4's point is that she acts *without* one.
2. **"Still Point" is a distinct state** — give it an entry in `Characters/Claire.md:69`–`:85`. Cost: Claire gains a sixth named element in a file that already carries the Static, the lens, the Click, Visual Calculus, and Convergence.
3. **Treat all four as private handles and mark them so** — annotate the sidecars. Cost: sidecars are Scrivener metadata; the author may prefer to keep handles there and out of the plan.
**Status:** open

---

### F-015 — Roxana's ability has four names for three things, and the naming convention for passives splits in two

**Type:** terminology drift
**Severity:** significant
**Evidence:** `World/Magic System.md:25` — "There is no public technical term inside the story, so names such as the Ghost and Static are personal."
**Also:** `World/Magic System.md:61` — "Roxana's flame heightens nociceptive sensitivity; Starborne suppresses normal pain gating."
**Also:** `Characters/Roxana.md:79` — "**Empathic Burn:** Roxana involuntarily echoes nearby bodily pain through her own nervous system."
**Also:** `Characters/Roxana.md:81` — "**Undying Flame:** Aster's empty lighter produces one small real resonant flame guided primarily through Roxana's gestures."
**Also:** `Characters/The Pursuer.md:71` — "### Furnace, Greatcoat, and Finite Fuel"
**Observation:** Three distinct things exist: Roxana's passive (involuntary pain echo), her Deviation's base expression (the small flame), and its advanced expression (the flame carrying her). Their names are Empathic Burn, Undying Flame, and Starborne. `World/Magic System.md:61` refers to the base expression as "Roxana's flame," a fourth label used nowhere else. Separately, the rule at `World/Magic System.md:25` names only the Ghost and Static as personal names for passives, while the other two documented passives carry what read as technical or clinical names: "Empathic Burn" and "Furnace" (`Characters/The Pursuer.md:75`).
**Inference:** Two different conventions are in force. Under `World/Magic System.md:25`, a passive has no public technical term and is named personally by its owner — which fits the Ghost and the Static. "Empathic Burn" and "Furnace" are the kind of names a classification system would issue, and `World/History.md:21` confirms the state does classify: "*Deviation* became an administrative category." Nothing in the corpus says whether Empathic Burn and Furnace are what the state calls them, what the characters call them, or what the author calls them.
**Why it matters:** Arc 2 scene 2 and Arc 4 scene 2 both require Roxana's abilities to be referred to in scene notes and dialogue. The distinction matters most for Empathic Burn, because `Characters/Roxana.md:105` protects it from a specific misreading — "Empathic Burn is not emotional mind-reading" — and a name that sounds like a classification invites the clinical exposition the magic system says it avoids (`World/Magic System.md:3`, "legible through objects, bodily costs, and repeated behavior rather than exposition").
**Open question for the author:** Are "Empathic Burn" and "Furnace" in-world terms (state classification or character vocabulary), or author-side handles — and is "Roxana's flame" at `World/Magic System.md:61` a synonym for Undying Flame or a fourth distinct thing?
**Candidate resolutions:**
1. **All author-side handles** — then `World/Magic System.md:25` should say that the document's own names for passives are descriptive labels, not in-world terms, and `World/Magic System.md:61` should be changed to "Undying Flame" for internal consistency. Cost: two World edits; no scene changes.
2. **Empathic Burn and Furnace are state classifications** — add one sentence to `World/History.md:21` establishing that the state names passives. Cost: it makes the state's vocabulary available for exposition, which pushes against `World/Locations.md:43`'s rule that public forms never say the real words.
3. **They are the characters' own** — then the convention at `World/Magic System.md:25` is one of register, not of who names things, and the sentence should say so. Cost: the sentence currently rests on "There is no public technical term inside the story," which would need qualification.
**Status:** open

---

---

## Significant findings (continued)

### F-016 — "Abandoned Asylum" is asserted as the place's name while Open Questions lists its institutional status as undecided

**Type:** status conflict
**Severity:** significant
**Evidence:** `World/Locations.md:61` — "### Abandoned Asylum"
**Also:** `World/Locations.md:63` — "Vesper's sanctuary and treatment space: pleasant, open-doored, and task-oriented."
**Also:** `Story Plan/Open Questions.md:7` — "Did the asylum predate Vesper? Is he its operator, public face, research subject, or something else?"
**Also:** `Story Plan/1 The Spine.md:37` — "Begin inside the asylum. It is calm, useful, and voluntary."
**Also:** `Characters/The Widower.md:15` — "He runs the asylum kitchen, remembers everyone's name, and offers steady practical warmth."
**Observation:** The Locations entry's heading calls the asylum abandoned; its body describes an operating facility that is Vesper's, and every other document calls it simply "the asylum" — a place with a kitchen, residents on assigned tasks (`Story Plan/1 The Spine.md:37`, "Residents complete assigned tasks but initiate little of their own"), a courtyard for sparring (`Story Plan/1 The Spine.md:39`), and workshops (`Manuscript/Arc 2 - Mirror/4 The Fearless One MetaData.txt:10`, "Rain, Fearless One, Roxana | workshops").
**Inference:** "Abandoned" is doing one of two jobs: describing a building the state walked away from and Vesper occupied, or naming the site as the author thinks of it. If the second, the heading pre-decides the question `Story Plan/Open Questions.md:7` leaves open, and it contradicts the scene-facing description in the same entry.
**Why it matters:** Locations is the art and staging reference. "Abandoned" and "pleasant, open-doored, and task-oriented" produce different buildings, and Arc 2 plays entirely inside this one. It also affects `World/Locations.md:49`, which attributes the Imprint Vault and the prison pods to Nimbus under Ministry contracts but says nothing about who built or ran the asylum — the one institution in the story with no corporate or civic owner.
**Open question for the author:** Is "Abandoned Asylum" the location's name, or a description that should be dropped until `Story Plan/Open Questions.md:7` is answered?
**Candidate resolutions:**
1. **Rename the entry** — call it "The Asylum" and let the body carry whatever the answer turns out to be. Cost: one heading; no downstream `.md` references exist, since no other document uses the phrase.
2. **Keep "Abandoned" as fact** — then answer `Story Plan/Open Questions.md:7` in Vesper's file and note who abandoned it. Cost: closes an open question the author has flagged as live, and needs reconciling with "pleasant, open-doored" and a working kitchen.
3. **Keep "Abandoned" as a state-of-repair note** — add a clause distinguishing the building's condition from its operation. Cost: one clause, but the heading still reads as a name in every navigation view.
**Status:** open

---

### F-017 — "another borrowed loadout" implies Melt transfers a set of abilities, which the magic system says it cannot

**Type:** terminology drift
**Severity:** significant
**Evidence:** `Story Plan/1 The Spine.md:51` — "Vesper displays another borrowed loadout over breakfast. Roxana accepts his steadying hand. He extracts and Melts a memory-network tied to her pain and unyielding behavior."
**Also:** `World/Magic System.md:113` — "Melt does not transfer the original emotion, relationship, worldview, Deviation, or lived meaning."
**Also:** `Characters/1 Vesper.md:97` — "Melt does not transfer emotion, meaning, relationships, worldview, Deviations, or the lost person's lived experience."
**Also:** `Manuscript/Arc 2 - Mirror/8 The melt MetaData.txt:8` — "TELL 3 at breakfast (the loadout, unremarked)."
**Also:** `Characters/1 Vesper.md:37` — "Carries Melted residues as foreign micro-gestures, reflexes, phrasing, or movement he cannot remember learning."
**Observation:** "Loadout" appears twice in the corpus, both times for the same beat in Arc 2 scene 8, and is defined nowhere. Its ordinary meaning is a set of equipped capabilities. Vesper's documented Melt residue is behavioral: habits, reflexes, practiced movement, speech rhythms, mannerisms (`World/Magic System.md:103`–`:111`). The scene note calls the beat "TELL 3" (a tell), which matches the residue's register; the Spine calls it a "loadout," which does not.
**Inference:** Inference: the two words describe the same on-screen moment at different levels of abstraction — a tell is what the audience notices, a loadout is what the author is tracking. Only the second implies Vesper can wield Roxana's abilities, which `World/Magic System.md:113` and `Characters/1 Vesper.md:97` both specifically deny. Arc 2 scene 8 is also the scene where Roxana's Melt happens, so the loadout precedes the Melt in the Spine's sentence order ("displays... over breakfast. ... He extracts and Melts") — making it unclear whose borrowed abilities are on display, which matters because Arc 2 opens with "TELL 1" already attributed to Aster's fighting style (`Story Plan/1 The Spine.md:39`, "Vesper corrects Roxana using Aster's fighting style").
**Why it matters:** Arc 2's three tells are the story's whole mechanism for making Vesper's borrowed behavior legible before the reveal (`Story Plan/Open Questions.md:19` — "Which foreign behavior belongs to an intact shard Vesper is consciously consulting, and which belongs to a Melt he cannot remember?"). If the tell is a power-set, the drafter stages a display of abilities and the audience reads a power-up; if it is a mannerism, the drafter stages a gesture.
**Open question for the author:** Is the breakfast "loadout" a set of demonstrated capabilities or a cluster of involuntary mannerisms?
**Candidate resolutions:**
1. **Mannerisms** — replace "borrowed loadout" with wording from the established residue list, e.g. "another borrowed movement." Cost: one phrase; consistent with `Characters/1 Vesper.md:37` and with `Story Plan/Themes and Motifs.md:103` ("most unsettling as a small stance, phrase, hand movement, or reflex with no remembered lesson behind it").
2. **Capabilities, and the system changes** — permit Vesper to reproduce practiced *movement* at ability level while denying Deviation transfer. Cost: `World/Magic System.md:113` and `Characters/1 Vesper.md:97` both need narrowing from "Deviation" to a distinction between technique and power, which is a substantive mechanical change.
**Status:** open

---

### F-018 — The outbound-train synopsis says Rain "remembers everything," which is the reading the extraction mechanic exists to rule out

**Type:** terminology drift
**Severity:** significant
**Evidence:** `Manuscript/Arc 5 - Proof/10 The outbound train MetaData.txt:8` — "He remembers everything and cannot feel that it was him."
**Also:** `World/Magic System.md:133` — "Afterward, "I remember meeting Roxana" is gone. "Rain met Roxana" remains. Rain can recount the adventure precisely and cannot inhabit it as something that happened to him."
**Also:** `World/Magic System.md:127` — "There is no shield, hidden soul, secret autobiographical fragment, incomplete extraction, or protagonist immunity."
**Also:** `Characters/0 Rain.md:59` — "The completed adventure remains a story Rain knows intimately and can recount precisely but cannot inhabit in the first person."
**Also:** `Story Plan/1 The Spine.md:117` — "the completed story remains accurate fact without autobiographical access"
**Observation:** "He remembers everything" describes retained memory without felt ownership — the first-person/near-miss reading. The magic system replaces that with a two-register split: the autobiographical memory is removed and a semantic record remains, explicitly tested by the sentence pair "I remember meeting Roxana" is gone / "Rain met Roxana" remains.
**Inference:** This is the distinction the whole magic system spends its longest section establishing (`World/Magic System.md:117`–`:135`), and the distinction `Story Plan/0 What is Remember Rain.md:37` makes the title's subject: "Vesper remembers Rain's completed past more completely than Rain experiences it himself." A synopsis that says "remembers everything" collapses it back to a more conventional and more consoling condition — memory intact, feeling absent — which is also the condition the draft protects against at `Story Plan/1 The Spine.md:125` ("nothing suggests that connection is beginning to return").
**Why it matters:** The final scene is where the mechanic becomes the story's meaning. A drafter working from the synopsis would write a Rain who has his memories and has lost his feelings about them — which is a different ending, and one that makes the extraction reversible in spirit even though `World/Magic System.md:99` says Melt is the irreversible operation and extraction is not.
**Open question for the author:** Is the synopsis's "remembers everything" shorthand for factual access, or does Rain retain autobiographical memory without felt ownership?
**Candidate resolutions:**
1. **Shorthand** — reword the sidecar to match the established split, e.g. "He can recount everything and cannot feel that it was him." Cost: one sidecar line.
2. **Retained memory, absent feeling** — then `World/Magic System.md:127`–`:133`, `Characters/0 Rain.md:59`, and `Story Plan/1 The Spine.md:117` all need rewriting, and the story loses the fact/ownership distinction that `Story Plan/0 What is Remember Rain.md:15` lists as one of its five protected separations ("evidence from identity").
**Status:** open

---

### F-019 — "Rain thins in corrected districts" admits two readings and the magic system supports neither for the person

**Type:** terminology drift
**Severity:** significant
**Evidence:** `Story Plan/1 The Spine.md:85` — "A full lap makes the correction measurable. The same stations appear twice; the boundary moves between passes. Rain thins in corrected districts."
**Also:** `World/Locations.md:29` — "Its weakening becomes visible in thinning rain and an increasingly static city."
**Also:** `Story Plan/Themes and Motifs.md:61` — "Heavy rain continues through Arcs 1–3, then thins as the correction spreads. Corrected districts in Arc 4 are dry and quiet."
**Also:** `Manuscript/Arc 4 - Witness/2 The boundary MetaData.txt:8` — "the clock legible (same stations twice, the boundary from both sides); decay as improvement; thinning rain as the honest gauge."
**Observation:** Three documents describe thinning weather in corrected districts. The Spine's sentence is the only one whose subject is the capitalized proper noun, in a document that capitalizes "Rain" as the character throughout and "the Ghost," "the Pursuer," and "the Split" as entities. `World/Magic System.md:57`–`:65` lists every character's cost and gives Rain's ordinary Clone "disrupts sensory anchoring" and the Perfect Clone "impairs felt authorship and action initiation" — no effect keyed to geography or to the correction's boundary.
**Inference:** Inference: the likeliest intent is weather — the scene note for the same scene calls thinning rain "the honest gauge." But the sentence as written also describes the protagonist, and the story has established that Rain and rain are the same word (`Story Plan/0 What is Remember Rain.md:37`, "Rain the weather remains movement without moral purity"). If the person-reading is available at all, a drafter may stage Rain becoming less present in corrected districts, which would be a new mechanic the magic system does not carry.
**Why it matters:** Arc 4 scene 2 is where the correction becomes measurable; the measurement is the arc's clock (`Story Plan/1 The Spine.md:85`, "A full lap makes the correction measurable"). If the gauge is ambiguous, the scene has two possible spines — a world getting drier, or a protagonist getting thinner. The second also collides with Arc 4's design, where the loss that matters is Rain's parents' district (`Story Plan/1 The Spine.md:89`, ":97"), not Rain himself.
**Open question for the author:** Is "Rain" at `Story Plan/1 The Spine.md:85` the weather or the protagonist — and if the ambiguity is intentional, is it intentional here, in a bullet list of measurable correction effects?
**Candidate resolutions:**
1. **Weather** — lowercase or disambiguate, e.g. "The rain thins in corrected districts," matching the scene note's "thinning rain as the honest gauge." Cost: one word; loses a resonance that the story already achieves elsewhere.
2. **Protagonist, deliberately** — keep it and add the mechanic to `World/Magic System.md:57`, defining what the correction does to a person with a passive. Cost: a new world mechanic, plus a cost line for a character who already has two, and it must not read as the correction harming Rain specifically, which `Story Plan/Arc Structure.md:17` reserves for Arc 4's ending.
3. **Protagonist, as prose ambiguity only** — keep the capitalization and record in the scene file that the line is a weather observation with an intentional double reading. Cost: none to the plan; depends on the drafter reading the note.
**Status:** open

---

## Minor findings

### F-020 — The vault has three names across four documents

**Type:** terminology drift
**Severity:** minor
**Evidence:** `World/Locations.md:57` — "### Nimbus Imprint Vault"
**Also:** `Story Plan/1 The Spine.md:17` — "Shiori breaches Nimbus's confiscated-artifact vault to recover Gadget X"
**Also:** `Manuscript/Arc 1 - Fugitive/2 The vault.md:3` — "%% The alley opens into the confiscated-artifact vault through Shiori's active breach."
**Also:** `Manuscript/Arc 1 - Fugitive/2 The vault MetaData.txt:8` — "The alley opens into a System building someone already broke into: the confiscated-Imprint vault."
**Also:** `World/History.md:21` — "Nimbus built or adapted the Imprint Vault and sensory-deprivation pods under Ministry contracts."
**Observation:** "Imprint Vault" (World), "confiscated-artifact vault" (Spine and manuscript scene note), and "confiscated-Imprint vault" (sidecar). `World/Locations.md:59` describes contents that match both readings: "A restricted, corporate-secured room for confiscated Imprints and Shiori's equipment."
**Inference:** The three names differ on whether the room holds Imprints specifically or artifacts generally — a distinction that matters because Gadget X is described as "mundane when built" (`World/Locations.md:59`), which is to say not an Imprint, and it is stored there.
**Why it matters:** Arc 1 scene 2 is the story's first set piece and its only description of the room. The prose describes a warehouse of household goods organized by ID number (`Manuscript/Arc 1 - Fugitive/2 The vault.md:73`–`:75`), which reads closer to "confiscated-artifact" than to "Imprint Vault."
**Open question for the author:** Is the room the Imprint Vault (holding Imprints) or a confiscated-artifact vault (holding Imprints among other things)?
**Candidate resolutions:**
1. **Confiscated-artifact vault** — rename the Locations entry to match the two documents that stage it. Cost: `World/History.md:21` also changes.
2. **Imprint Vault as the official name, artifact vault as description** — keep both and say so in `World/Locations.md:59`. Cost: one clause; preserves the corporate name for signage and forms.
**Status:** open

---

### F-021 — The corpus's only scene-count claim ("all fifty cards") does not resolve against the documents, and "the fifty-first" has no established antecedent

**Type:** numeric conflict
**Severity:** minor
**Evidence:** `Story Plan/1 The Spine MetaData.txt:8` — "The outline of record: the argument, the shape, all fifty cards, and the threads running through them."
**Also:** `Manuscript/Arc 4 - Witness/6 The voice MetaData.txt:8` — "the momentum theorem — \"what's your model's answer for the fifty-first?\""
**Observation:** The Spine's own numbered scene units total 47: 9 in Arc 1 (numbered 0–8, `Story Plan/1 The Spine.md:13`–`:29`), 10 in Arc 2 (`:37`–`:55`), 6 in Arc 3 plus the three optional lives (`:63`–`:75`, with `:69` "**A life · 1–3**"), 9 in Arc 4 (`:83`–`:99`), and 10 in Arc 5 (`:107`–`:125`). Counting the four `Dead Ends` documents as cards gives 51. Neither figure is 50, and no document states a scene count. The number 50 appears in the corpus only as the implied count behind "the fifty-first."
**Inference:** Inference: "all fifty cards" reads as a round description of the Scrivener binder rather than an exact figure, so it may not be a claim at all. "The fifty-first" is the more substantive item: it is placed in Rain's mouth as the finishing blow of Arc 4 scene 6, and `Story Plan/1 The Spine.md:93` renders the same beat without a number ("what does her model say about the next attempt after every previous one failed?"). Where "fifty" comes from is not established in any document, and it sits against the Ruined One's thesis, which the scene note requires be planted as "falling is terminal, I already had my chance" (`Manuscript/Arc 2 - Mirror/5 The Ruined One MetaData.txt:8`).
**Why it matters:** Arc 4 scene 6 is Rain's reversal and the payoff of the Ruined One's case (`Manuscript/Arc 4 - Witness/6 The voice MetaData.txt:8`, "MUST carry the Ruined One inside it"). A specific number invites the audience to ask whose fifty failed attempts it counts; if the answer is the Ruined One's, it contradicts the character's one-chance premise; if it is Rain's, no document supports it.
**Open question for the author:** What does "the fifty-first" count, and should the Spine carry the number or the paraphrase?
**Candidate resolutions:**
1. **Keep the number, establish it** — plant the count earlier (Rain's own abandoned attempts, or Claire's model runs). Cost: a new numeric thread in Arc 2 or Arc 3 and a note in the Ruined One's scene file distinguishing the two.
2. **Drop the number** — use the Spine's paraphrase at `Story Plan/1 The Spine.md:93`. Cost: the sidecar's line loses its rhetorical precision, which is likely why the number is there.
3. **Make the number Claire's, not the Ruined One's** — 50 model runs is consistent with `Characters/Claire.md:79` and needs no new canon. Cost: the sidecar must say so, since "your model's answer for the fifty-first" already implies model runs and is currently ambiguous only about whether the attempts are hers or the world's.
**Status:** open

---

### F-022 — The prison is "Aster's grave" in the Spine and "her father's grave" in the scene synopsis

**Type:** terminology drift
**Severity:** minor
**Evidence:** `Story Plan/1 The Spine.md:75` — "Rain carries her out of Aster's grave."
**Also:** `Manuscript/Arc 3 - Prisoner/6 The carry MetaData.txt:8` — "He carries her out of her father's grave; she tells him about the hand only now."
**Also:** `Characters/Roxana.md:41` — "A childhood fire killed Roxana's family and scarred her arms while she tried to save both parents. Aster later became her father figure and trainer."
**Also:** `Characters/Roxana.md:73` — "**Aster:** father figure, trainer, missing investigator, and the source of her surname and lighter."
**Observation:** Roxana's biological father died in the childhood fire; Aster is a father figure who gave her his surname. The Spine attributes the grave to Aster; the sidecar to her father.
**Inference:** The sidecar's phrasing is the stronger claim — it makes Aster a blood relation, or collapses the father-in-fact and the father-figure into one person. The distinction is load-bearing for Roxana's file, where the fire, the surname, and the training are three separate facts (`Characters/Roxana.md:41`) and where `:109` protects the training's motive: "Training Rain is partly an attempt to reconstitute Aster. Never have her explain this."
**Why it matters:** The line is the closing image of Arc 3 and the only place the prison is linked to a person rather than a function (`World/Locations.md:67`, "A Nimbus-built custody site whose pods pacify Deviants and political problems"). Which person the grave belongs to determines what the exit means for Roxana.
**Open question for the author:** Is the prison Aster's grave or Roxana's father's grave — are these the same person, and does Roxana's file need Aster recorded as kin rather than as a father figure?
**Candidate resolutions:**
1. **Aster's grave** — correct the sidecar. Cost: one sidecar line; consistent with Roxana's file and with Aster's intake record signed by the Pursuer (`Characters/The Pursuer.md:53`).
2. **Her father's grave** — then Aster must be recorded as Roxana's actual father in `Characters/Roxana.md:41`, and the childhood fire's "killed Roxana's family" must be checked against a father who survived into her adulthood. Cost: a history rewrite.
3. **Two graves** — the prison is where Aster died and is also the state's disposal site. Cost: no document currently supports a second association.
**Status:** open

---

### F-023 — The Themes and Motifs synopsis describes three sections that document does not contain

**Type:** status conflict
**Severity:** minor
**Evidence:** `Story Plan/Themes and Motifs MetaData.txt:8` — "The underlying message, the cure test, what Vesper is in reality, where he comes from, the Shine grammar, and the influences the story declines."
**Also:** `Story Plan/Themes and Motifs.md:157` — "### Gold Vocabulary"
**Observation:** The synopsis promises "the cure test," "what Vesper is in reality," "where he comes from," and "the influences the story declines." The document has eighteen sections; none is about a cure test, Vesper's reality or origin, or declined influences. Vesper's origin lives in `Characters/1 Vesper.md:43` and the refused influences are not recorded in any document. "The Shine grammar" corresponds to the section headed "Gold Vocabulary" (`Story Plan/Themes and Motifs.md:157`), whose closed set of six terms includes `shine` at `:167`.
**Inference:** Inference: the synopsis records what the document was planned to hold, not what it holds. The two items with homes elsewhere (Vesper's reality and origin) are covered by his character file; "the cure test" and "the influences the story declines" have no home in any document.
**Why it matters:** A reader who trusts the synopsis will look in Themes and Motifs for the story's stance on who Vesper is and what it refuses; the document gives the first only as imagery in a table row (`Story Plan/Themes and Motifs.md:19`, "Vesper | relief | successful outcomes | Can another person improve beyond his direction?") and the second not at all. It also flags a naming question: whether the visual-argument section is called the Gold Vocabulary or the Shine grammar, given that `shine` is only one of its six terms.
**Open question for the author:** Does Themes and Motifs own Vesper's reality and origin and the declined influences (in which case they should be written there), or does the synopsis need correcting?
**Candidate resolutions:**
1. **Correct the synopsis** — point it at `Characters/1 Vesper.md` for origin and drop the unmatched items. Cost: one sidecar line; leaves the declined influences unrecorded anywhere.
2. **Write the missing sections** — add them to Themes and Motifs. Cost: Themes and Motifs currently opens by declaring it holds "Recurring images and behavioral contrasts" (`Story Plan/Themes and Motifs.md:3`), so a Vesper-origin section would sit outside the document's stated ownership.
3. **Split the difference** — record the declined influences in Themes and Motifs (it is the document that governs the story's imagery) and correct the Vesper clauses to point at his file. Cost: one new short section.
**Status:** open

---

## Claims checked and found consistent

Recorded because an inventory should report what holds, not only what does not.

- **Vesper's age.** 18 at story time (`Characters/1 Vesper.md:7`); "He was thirteen when the Flare happened" (`:21`); the Flare is "five years before the story" (`World/Magic System.md:11`, `World/History.md:5`). 13 + 5 = 18. `Story Plan/Open Questions.md:11` ("a thirteen-to-eighteen-year-old Vesper") matches, and `Characters/1 Vesper.md:119` ("Do not portray five years of development as decades of authority") is consistent with the same arithmetic.
- **The Widower's nine treatments.** "Vesper removed that loop. The treatment worked" (`Characters/The Widower.md:7`) plus "he returned eight more times over the next few years" (`:11`) gives nine, matching `Story Plan/Open Questions.md:9` ("the Widower's nine treatments"). His first extraction is protected as a success in both places (`Characters/The Widower.md:7`, `Characters/1 Vesper.md:113`).
- **The three Melts.** `Characters/1 Vesper.md:101` ("his mother; one unknown person used as deliberate proof; and Roxana") and `Story Plan/Open Questions.md:9` and `:15` agree on the count and on which person is unaccounted for. Shiori's is consistently an *extraction*, not a Melt, in both places (`Story Plan/Open Questions.md:9`, `Characters/Shiori.md:19`).
- **Story duration.** "approximately five to eight weeks" appears identically in `Story Plan/0 What is Remember Rain.md:5` and `Story Plan/1 The Spine.md:3`, and nothing in the corpus contradicts it.
- **Arc, scene, and pitfall counts.** Five arcs (`Story Plan/Arc Structure.md:7`–`:19` table, matching the five `Manuscript/` arc folders); "One pitfall appears in each of Arcs 1–4" and "Arc 5 has no pitfall or ending choice" (`Story Plan/Choice Points.md:9`, `:11`); four pitfall rows (`:41`–`:47`); four `Dead Ends` documents. The Spine's scene numbering matches the manuscript filenames scene for scene: 9, 10, 6 (+3 lives), 9, 10.
- **The locked opening and ending callbacks.** `Manuscript/Arc 1 - Fugitive/0 Rain intro.md:33` and `:38`–`:40` bold the selected lines; `Characters/0 Rain.md:67` and `:71`–`:75` and `Story Plan/0 What is Remember Rain.md:41`–`:45` reproduce them word for word. Only the Arc 5 sidecar diverges (F-002).
- **"Pull."** Defined once (`World/Magic System.md:27`) and used the same way in the Spine (`Story Plan/1 The Spine.md:17`) and Locations (`World/Locations.md:59`). The manuscript stages it as described: `Manuscript/Arc 1 - Fugitive/2 The vault.md:79` ("it was clear something was pulling my mind here").
- **Furnace.** The Pursuer's passive, consistently named and consistently placed: `Characters/The Pursuer.md:45` and `:75` (definition), `Story Plan/1 The Spine.md:95` and `Characters/The Pursuer.md:55` (the ledger and the projected empty date), `Story Plan/Open Questions.md:67` (what follows), and `Characters/The Pursuer.md:103` ("He knows when Furnace is projected to empty, not when he will biologically die"), which matches the Spine's parenthetical "—not a biological death date."
- **Claire's two modes.** "Visual Calculus and Convergence are alternate expressions" (`Characters/Claire.md:95`) matches the shared rule that "the user cannot sustain base and advanced expressions simultaneously as independent effects" (`World/Magic System.md:47`); the Spine's staging uses "alternates" (`Story Plan/1 The Spine.md:113`), so the constraint is respected on the page.
- **Shiori's absence of abilities.** `Characters/Shiori.md:81` ("Shiori has no passive, bonded Imprint, or Deviation of her own") matches the magic system's per-character cost list (`World/Magic System.md:57`–`:65`), which names four characters and omits her.
- **Aster's shard.** Present in the archive in Arc 2 (`Story Plan/1 The Spine.md:49`), still available to be burned in Arc 5 scene 9 (`:123`, `Characters/Roxana.md:61`), and never confused with Roxana's own Melted memory-network (`Story Plan/1 The Spine.md:51`).
- **Vesper's three-finger extraction.** `Manuscript/Arc 5 - Proof/5 The extraction.md:1` and `:7` are the corpus's only two statements of the mechanism and they agree.
- **The four comfortable exits.** `Story Plan/0 What is Remember Rain.md:19` ("four comfortable exits"), `Story Plan/Choice Points.md:7` ("one true ending and four comfortable ways to stop reaching it"), and the four `Dead Ends` documents agree on the count and on which arc each belongs to.
- **Status markers are honoured where they appear.** `Story Plan/1 The Spine.md:123` ("Working Shiori beat, not locked") is mirrored by `Characters/Shiori.md:43` ("Its thematic interpretation remains a working direction rather than locked canon") and `:55` and `:61`; `Story Plan/What does it mean to fall.md:3` marks itself "an authorial drafting model, not world canon or dialogue"; `Story Plan/2 Pessimism of Strength.md:3` marks itself "an authorial stance, not dialogue for a character to deliver"; `Story Plan/Themes and Motifs.md:127` and `:35` mark the Shiori interpretation and the Consumption motif as working. No provisional item is treated as settled anywhere in the corpus, with the single exception recorded in F-016.

---

## Appendix — Scrivener-ready replacement text for the four blocking findings

Proposals only. Nothing here is applied. Written unescaped, per the export's compile convention, so it can be pasted into Scrivener without doubling. Each states what else it costs.

**For F-001.** Target: `Manuscript/Arc 5 - Proof/7 The return MetaData.txt:8`. Replace:

> Rain back with a newfound self; Vesper's last assault; the Clone set out as bait — the grab passes through the intangible copy while the injured Rain takes the hit as himself and catches him. The signature gesture, used without summoning.

with (option 1 of three):

> Rain back capable of responding, not with a newfound or completed self; Vesper's last assault; the Clone set out as bait — the grab passes through the intangible copy while the injured Rain takes the hit as himself and catches him. The signature gesture, used without summoning.

Costs: nothing elsewhere. This is the sidecar only; the `.md` Context line, `Story Plan/0 What is Remember Rain.md:31`, and `Characters/0 Rain.md:119` already agree with this wording. If option 2 is chosen instead, all four of those documents change.

**For F-002.** Target: `Manuscript/Arc 5 - Proof/10 The outbound train MetaData.txt:8`. Replace:

> He remembers everything and cannot feel that it was him. In spite of it all, I choose to be Rain.

with:

> He can recount everything and cannot feel that it was him. In spite of it all, I am Rain.

Costs: nothing elsewhere; `Story Plan/0 What is Remember Rain.md:45`, `Characters/0 Rain.md:75`, and `Manuscript/Arc 1 - Fugitive/0 Rain intro.md:40` already carry "I am Rain." This single edit resolves both F-002 and F-018. If the author instead prefers "I choose to be Rain," four documents change and the locked-ending label at `Story Plan/0 What is Remember Rain.md:39` must be re-affirmed against the new wording.

**For F-003.** Target: `Characters/0 Rain.md:103`. Replace:

> **The Split:** Rain's record of past failure in his own voice. It is unmarked at first and italicized after the mountain. Never settle whether it is another entity or only Rain.

with (option 1 of three — the Split outside the autobiographical target):

> **The Split:** the voice Rain hears as a ledger of failure, in his own register and outside Vesper's autobiographical target. It is unmarked at first and italicized after the mountain. Never settle whether it is another entity or only Rain.

Costs: `World/Magic System.md:57` should then carry a line noting what the passive can produce that extraction does not reach, or `Story Plan/1 The Spine.md:121` should attribute the offer to a residue rather than a record. `Story Plan/Themes and Motifs.md:79` ("The Split speaks in Rain's voice as a ledger of failure") already reads this way and needs no change.

**For F-004 and F-005**, and for the remaining findings, no replacement text is offered: F-004 requires choosing between two scenes and F-005 requires new world content, so both need the author's decision before text can be drafted.

---

## Notes on method and limits

- **Sources of truth.** Findings are drawn from the export's `.md` files and, deliberately, from the `<Title> MetaData.txt` sidecars, which carry synopsis lines no `.md` file contains. Per `AGENTS.md`, the Scrivener project is authoritative and this export may lag it; several findings (F-001, F-002, F-004) are exactly the shape a lagging export produces, and none of them can be confirmed or dismissed from inside the export.
- **Line numbers** are 1-based in the raw file. Files without a trailing newline are reported with their final line as-is.
- **`remember-rain/` does not exist.** `ls remember-rain/` and `ls remember-rain/audits/` both return "No such file or directory," so there is no `decisions.md` to check and no `findings.md` to append to. Nothing here is registered, and none of these questions has been previously ruled on as far as this export shows.
- **What was not reported.** The 38 scene documents that contain only a scene label (`a4s04_reveal`) are undrafted, not defective, and are not findings. `Manuscript/Arc 4 - Witness/8 The unsigned offer.md:1` carries the label `a4s08_refusal` while its filename says "unsigned offer," and five scenes carry no label at all (`0 Rain intro`, `6 Claire and Roxana save Rain`, and Arc 5's `5 The extraction`, `6 The void`, `7 The return`); these are drafting-handle conventions, not story facts, and are noted here only so the absence is on record. `Manuscript/Arc 1 - Fugitive/6 Claire and Roxana save Rain.md:5` ends "(To be written.)", which is a status, not a gap.
- **One observation not raised as a finding.** `Manuscript/Arc 1 - Fugitive/2 The vault.md:159` establishes that Rain previously handled Nimbus case files ("Nimbus. A name ingrained in my head from all of the case files I handled in my previous job"), and `Manuscript/Arc 3 - Prisoner/2 True silence.md:43` dresses his replica in a business suit. `Characters/0 Rain.md:21`–`:23` describes a young man who left "a stable, approved path" and whose parents "see extensive computer time, a weaker visible work trajectory," without naming a profession. The prose and the file do not contradict each other, and the prose is the tiebreaker for who he is; but the prior employment exists only in prose, and is worth recording in `Characters/0 Rain.md` when convenient rather than treated as a defect.

