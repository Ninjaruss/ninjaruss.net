# Remember Rain Outline Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Remember Rain outline into layered, category-specific reference files that orient quickly, retain drafting nuance, and maintain one primary home for each concept.

**Architecture:** Refine the outline in ownership order: Story Plan establishes the story-level model, World establishes shared facts and mechanics, and Characters retain only the context needed to write each person. Each pass uses the pre-cleanup commit as a retention baseline, runs novel-specific validation, and commits independently before the final cross-file and Scrivener audits.

**Tech Stack:** Markdown, Git, Astro 5 content utilities, Vitest, Scrivener 3

**Spec:** `docs/superpowers/specs/2026-08-27-remember-rain-outline-cleanup-design.md`

## Global Constraints

- Modify only `src/content/novel/Characters`, `src/content/novel/Story Plan`, and `src/content/novel/World` until the Scrivener synchronization task.
- Do not modify anything under `src/content/novel/Manuscript`.
- Treat manuscript prose and locked wording as stronger authority than outline language.
- Preserve the locked Flare chronology, ages, heights, visual anchors, magic-system relationships, ability costs, Vesper rules, Rain's ending state, fugitive status, and train departure.
- Write established facts plainly, place usable provisional material under `Still Flexible`, and reserve `Open Questions.md` for matters without a usable answer.
- Relocate concrete drafting detail before removing repetition; do not shorten a file merely to make category lengths uniform.
- Use the merge commit `fe41854` as the pre-cleanup outline baseline for retention comparisons.
- Do not push or synchronize Scrivener until all repository audits and validation pass.

---

### Task 1: Establish Story Plan Ownership

**Files:**
- Modify: `src/content/novel/Story Plan/0 What is Remember Rain.md`
- Modify: `src/content/novel/Story Plan/1 The Spine.md`
- Modify: `src/content/novel/Story Plan/2 Pessimism of Strength.md`
- Modify: `src/content/novel/Story Plan/Arc Structure.md`
- Modify: `src/content/novel/Story Plan/Choice Points.md`
- Modify: `src/content/novel/Story Plan/Open Questions.md`
- Modify: `src/content/novel/Story Plan/Themes and Motifs.md`
- Modify: `src/content/novel/Story Plan/What does it mean to fall.md`
- Test: `src/tests/novel.test.ts`

**Interfaces:**
- Consumes: Authority order, ownership map, decision states, and editing policy from the approved specification
- Produces: The canonical story-level source boundaries used by World and Character cleanup

- [ ] **Step 1: Record the baseline and verify scope**

Run:

```bash
git status --short
git diff --name-only fe41854 -- src/content/novel/Manuscript
```

Expected: the worktree is clean and the Manuscript diff is empty.

- [ ] **Step 2: Refine the premise and ending owner**

Edit `0 What is Remember Rain.md` so it opens with the premise and player experience, then states the story promise and ending intent. Preserve the distinctions that Rain knows the story as fact, does not feel that he literally lived it, is not completed by remembered experience, remains publicly a fugitive, and chooses the outbound train toward a new adventure and his dreams.

Do not turn the file into a miniature plot outline or repeat every character thesis.

- [ ] **Step 3: Refine the chronological owner**

Edit `1 The Spine.md` so each arc contains only indispensable chronological movement, causal links, choice pressure, and convergence. Preserve Arc 5's order: ensemble tests clear the path toward Vesper's extraction; extraction precedes void, return, refusal, clean-rain material, and the outbound train.

Remove thematic restatement when the same point is already owned by `Pessimism of Strength.md`, `Themes and Motifs.md`, or `What does it mean to fall.md`.

- [ ] **Step 4: Refine the philosophy and structure owners**

Edit:

- `2 Pessimism of Strength.md` to hold the central pressure between strength, limitation, participation, and the temptation to treat capacity as proof.
- `Arc Structure.md` to state what each arc structurally accomplishes and how Arc 5 converges, without duplicating the full scene sequence.
- `What does it mean to fall.md` to define falling in this story and give concise drafting applications.

Retain distinctions that complicate the philosophy; remove repeated conclusions and AI-style rhetorical scaffolding.

- [ ] **Step 5: Refine interaction rules**

Edit `Choice Points.md` around direct headings such as `Choice Rules`, `Pitfalls`, `False Endings`, `Reconvergence`, and `Protected Non-Choices`. Preserve the one-route structure, four pitfalls, Arc 3 lives, Arc 5 void, and the rule that protected story events are not converted into player branches.

Keep practical interface and prose behavior. Remove theme explanations already owned elsewhere.

- [ ] **Step 6: Refine motifs and unanswered questions**

Edit `Themes and Motifs.md` so each motif records its concrete forms, progression, carriers, and drafting risk. Keep Rain/weather, notebook/pen, Ghost/Clone/Split, hands, glass/memory, fire/scars, Claire's static/lens/silence, Shiori's tools/marks/records, the Pursuer's steam/greatcoat, Aster, and the gold vocabulary where still current.

Edit `Open Questions.md` so it contains only matters without a usable current answer. Move provisional but usable answers back to their owning files under `Still Flexible`.

- [ ] **Step 7: Run the Story Plan retention audit**

For each Story Plan file, inspect:

```bash
git diff --word-diff=plain fe41854 -- "src/content/novel/Story Plan"
```

Classify removed material mentally as repetition, obsolete contradiction, relocated detail, non-drafting abstraction, or material loss. Restore every concrete detail in the final category and verify every relocated detail exists in its new owner.

- [ ] **Step 8: Run Story Plan tests**

Run:

```bash
npm test -- src/tests/novel.test.ts
```

Expected: all novel tests pass.

- [ ] **Step 9: Commit Story Plan cleanup**

```bash
git add "src/content/novel/Story Plan"
git -c commit.gpgsign=false commit -m "docs: layer Remember Rain story plan"
```

---

### Task 2: Refine World References

**Files:**
- Modify: `src/content/novel/World/History.md`
- Modify: `src/content/novel/World/Locations.md`
- Modify: `src/content/novel/World/Magic System.md`
- Test: `src/tests/novel.test.ts`

**Interfaces:**
- Consumes: Story-level ownership and terminology established in Task 1
- Produces: Canonical chronology, geography, institutions, shared mechanics, and system constraints for Character cleanup

- [ ] **Step 1: Refine chronology**

Edit `History.md` using `The Short Version`, `Timeline`, `What This Changes`, `Still Flexible` when needed, and `Constraints`. State plainly that the Flare was one event five years before the story. Keep the public and institutional consequences needed to understand the present day.

Do not duplicate location descriptions or explain individual character arcs.

- [ ] **Step 2: Refine geography and institutions**

Edit `Locations.md` using `The Short Version` followed by concrete location or institution headings. Preserve the city, dormant volcano and caldera, Sacred Water loop, Water Ministry, Nimbus Co., and key scene locations.

For each location, prioritize physical relationship, atmosphere, public function, and scene use. Move chronology to `History.md` and mechanics to `Magic System.md`.

- [ ] **Step 3: Refine shared magic rules**

Edit `Magic System.md` using `The Short Version`, `The Flare`, `Passive, Pull, and Deviation`, `Imprints`, `Costs`, `Extraction and Glass`, `Melt`, `What This Changes`, `Still Flexible`, and `Constraints` where supported.

Preserve:

- Flare energy allows substrates to retain resonance from irreversible transitions.
- A passive produces resonance or pull; a person's distinctive relationship to that pull can become a unique Deviation.
- Imprinted objects remain physically ordinary unless a specified effect changes them; their supernatural significance does not automatically make them indestructible.
- Claire pays through neurological and computational overload.
- Vesper's intact shard, archive, shatter, and Melt behavior follows the revised extraction model.
- The current distinction between factual memory access and felt ownership remains intact.

Keep character-specific examples only when they clarify a general rule. Move emotional or arc interpretation to the relevant Character or Story Plan file.

- [ ] **Step 4: Run the World retention and consistency audit**

Inspect:

```bash
git diff --word-diff=plain fe41854 -- src/content/novel/World
rg -n "five years|one[- ]time|irreversible|resonance|pull|Deviation|neurological|computational|shatter|Melt" src/content/novel/World
```

Expected: removed concrete facts are either obsolete, retained, or visibly relocated; locked terminology is internally consistent.

- [ ] **Step 5: Run World tests**

```bash
npm test -- src/tests/novel.test.ts
```

Expected: all novel tests pass.

- [ ] **Step 6: Commit World cleanup**

```bash
git add src/content/novel/World
git -c commit.gpgsign=false commit -m "docs: layer Remember Rain world references"
```

---

### Task 3: Refine Major Character References

**Files:**
- Modify: `src/content/novel/Characters/0 Rain.md`
- Modify: `src/content/novel/Characters/1 Vesper.md`
- Modify: `src/content/novel/Characters/Claire.md`
- Modify: `src/content/novel/Characters/Roxana.md`
- Modify: `src/content/novel/Characters/Shiori.md`
- Modify: `src/content/novel/Characters/The Pursuer.md`
- Test: `src/tests/novel.test.ts`

**Interfaces:**
- Consumes: Story and World sources of truth from Tasks 1 and 2
- Produces: Layered drafting references for the six major characters

- [ ] **Step 1: Apply the character layer without forced symmetry**

For each major character, use supported sections from:

```markdown
## Character Name

### Quick Read
### On the Page
### Want, Fear, and Change
### With Others
### Character-Specific Mechanics
### Visual Anchors
### Still Flexible
### Do Not Flatten
```

Use a concrete mechanics title rather than `Character-Specific Mechanics`: Rain's passive and Deviation, Vesper's extraction and glass, Claire/Roxana/Pursuer's Deviation and cost, and Shiori's work and equipment. Omit `Still Flexible` when no provisional material exists.

- [ ] **Step 2: Refine Rain and Vesper as the central conflict**

For Rain, preserve his passivity, outsourcing, relationship to possibility, chosen participation, notebook and pen, Ghost/Clone/Split distinctions, visual anchors, exact callback-line references, fugitive ending, train departure, and post-extraction factual-but-unfelt memory state.

For Vesper, preserve age eighteen, his genuine care and coercive certainty, extraction posture, archive logic, shatter behavior, Melt limits, relationship to Aster, visual anchors, and the distinction between understanding a person and authoring their future.

Keep their philosophies nuanced and opposed through behavior rather than duplicated essays.

- [ ] **Step 3: Refine Claire, Roxana, and Shiori**

For Claire, preserve responsibility without control, certainty versus quiet, visual calculus, neurological and computational overload, the Static/lens mismatch, her refusal and overwatch progression, visual anchors, and safeguards against valorizing untreated suffering.

For Roxana, preserve her relationship to immediate need, bodily action, responsibility, strength, protection, anger, and the Pursuer conflict without reducing her to intuition opposite Claire's reason.

For Shiori, preserve her work, tools, marks, records, support role, costs, practical intelligence, emotional restraint, and independent pressure without turning her into connective tissue for the central cast.

- [ ] **Step 4: Refine the Pursuer**

Preserve the Pursuer's role, steam and greatcoat imagery, relationship to strength and pursuit, practical combat presence, history relevant to Roxana, ability limits, visual anchors, and humanity. Remove repeated story-wide philosophy while retaining the details that keep him from becoming a symbolic obstacle only.

- [ ] **Step 5: Run the major-character retention audit**

Inspect:

```bash
git diff --word-diff=plain fe41854 -- \
  "src/content/novel/Characters/0 Rain.md" \
  "src/content/novel/Characters/1 Vesper.md" \
  "src/content/novel/Characters/Claire.md" \
  "src/content/novel/Characters/Roxana.md" \
  "src/content/novel/Characters/Shiori.md" \
  "src/content/novel/Characters/The Pursuer.md"
```

Restore concrete behavior, costs, visual anchors, relationship distinctions, or arc causality removed without a clear owner.

- [ ] **Step 6: Run major-character tests**

```bash
npm test -- src/tests/novel.test.ts
```

Expected: all novel tests pass.

- [ ] **Step 7: Commit major-character cleanup**

```bash
git add \
  "src/content/novel/Characters/0 Rain.md" \
  "src/content/novel/Characters/1 Vesper.md" \
  "src/content/novel/Characters/Claire.md" \
  "src/content/novel/Characters/Roxana.md" \
  "src/content/novel/Characters/Shiori.md" \
  "src/content/novel/Characters/The Pursuer.md"
git -c commit.gpgsign=false commit -m "docs: layer Remember Rain character references"
```

---

### Task 4: Refine Supporting Character References

**Files:**
- Modify: `src/content/novel/Characters/Asylum Patients/Gamer.md`
- Modify: `src/content/novel/Characters/The Widower.md`
- Test: `src/tests/novel.test.ts`

**Interfaces:**
- Consumes: Major-character vocabulary and story/world source boundaries
- Produces: Concise supporting-character references without template padding

- [ ] **Step 1: Refine the Gamer**

Keep only a fast orientation, on-page behavior, scene function, relevant ability detail, and any misreading guard supported by current material. Do not invent an arc or visual system to match larger files.

- [ ] **Step 2: Refine the Widower**

Keep the first extraction, recurring pattern, on-page behavior, connection to Vesper's method, and details that distinguish him from a generic victim. Use `Still Flexible` only for a current usable version and `Do Not Flatten` only for a real drafting risk.

- [ ] **Step 3: Audit and test supporting references**

Run:

```bash
git diff --word-diff=plain fe41854 -- \
  "src/content/novel/Characters/Asylum Patients/Gamer.md" \
  "src/content/novel/Characters/The Widower.md"
npm test -- src/tests/novel.test.ts
```

Expected: concrete supporting-character details remain; all novel tests pass.

- [ ] **Step 4: Commit supporting-character cleanup**

```bash
git add \
  "src/content/novel/Characters/Asylum Patients/Gamer.md" \
  "src/content/novel/Characters/The Widower.md"
git -c commit.gpgsign=false commit -m "docs: refine Remember Rain supporting characters"
```

---

### Task 5: Run Cross-File Canon and Retention Audit

**Files:**
- Modify as required: `src/content/novel/Characters/**/*.md`
- Modify as required: `src/content/novel/Story Plan/*.md`
- Modify as required: `src/content/novel/World/*.md`
- Verify unchanged: `src/content/novel/Manuscript/**/*.md`
- Test: `src/tests/novel.test.ts`
- Test: `src/tests/content.test.ts`

**Interfaces:**
- Consumes: All cleaned reference files
- Produces: One internally consistent repository outline with no material drafting loss

- [ ] **Step 1: Verify protected scope**

```bash
git diff --exit-code fe41854 -- src/content/novel/Manuscript
```

Expected: no output and exit code 0.

- [ ] **Step 2: Audit locked identity and chronology details**

Search the complete outline for ages, heights, Flare timing, one-time-event language, institutions, and visual anchors. Compare every occurrence and resolve stale contradictions using the approved authority order.

Run:

```bash
rg -n "18|five years|5 years|Flare|height|cm|feet|Water Ministry|Nimbus|caldera" \
  src/content/novel/Characters \
  "src/content/novel/Story Plan" \
  src/content/novel/World
```

- [ ] **Step 3: Audit magic and cost vocabulary**

Run:

```bash
rg -n "passive|resonance|pull|Deviation|imprint|irreversible|overload|extraction|archive|shatter|prism|Melt" \
  src/content/novel/Characters \
  "src/content/novel/Story Plan" \
  src/content/novel/World
```

Expected: `Magic System.md` carries full shared rules; Character files contain compatible practical expressions and costs; Story Plan files retain only plot-relevant consequences.

- [ ] **Step 4: Audit the ending model**

Search for memory return, felt ownership, completion, fugitive status, and train departure. Verify the files agree that Rain remembers accurately without feeling that he literally experienced the completed story, remains publicly a fugitive, and chooses to depart rather than waiting for vindication.

Run:

```bash
rg -n "remember|memory|fiction|felt|fugitive|vindicat|train|departure|adventure|dream" \
  src/content/novel/Characters \
  "src/content/novel/Story Plan" \
  src/content/novel/World
```

- [ ] **Step 5: Audit repetition and ownership**

Read the opening section of every outline file in sequence. Confirm each opening identifies its subject without reproducing the premise. Search repeated distinctive phrases and reduce second full explanations to concise local consequences.

Verify these primary owners:

- Ending intent: `0 What is Remember Rain.md`
- Chronological beats: `1 The Spine.md`
- Shared mechanics: `Magic System.md`
- Character behavior and personal cost: Character files
- Motif deployment: `Themes and Motifs.md`
- Unanswered matters: `Open Questions.md`

- [ ] **Step 6: Complete the retention audit**

Inspect the full outline diff:

```bash
git diff --word-diff=plain fe41854 -- \
  src/content/novel/Characters \
  "src/content/novel/Story Plan" \
  src/content/novel/World
```

Restore any lost concrete detail that is not obsolete or present in a clearer owner. Note meaningful relocations and deliberately removed contradictions for the final handoff.

- [ ] **Step 7: Run complete repository validation**

```bash
npm test -- src/tests/novel.test.ts src/tests/content.test.ts
npm run build
```

Expected: both test files pass and the production build completes. The known Astro collection deprecation warning is acceptable.

- [ ] **Step 8: Commit audit corrections**

If the audit changed files:

```bash
git add src/content/novel/Characters "src/content/novel/Story Plan" src/content/novel/World
git -c commit.gpgsign=false commit -m "docs: align Remember Rain outline canon"
```

If no files changed, record that no correction commit was needed.

---

### Task 6: Synchronize and Verify Scrivener

**Files:**
- Update through Scrivener: `/Users/ninjaruss/Documents/Remember Rain.scriv`
- Read from repository: `src/content/novel/Characters/**/*.md`
- Read from repository: `src/content/novel/Story Plan/*.md`
- Read from repository: `src/content/novel/World/*.md`
- Do not modify: `src/content/novel/Manuscript/**/*.md`

**Interfaces:**
- Consumes: Fully audited and validated repository reference files
- Produces: A saved Scrivener binder whose reference-document text exactly matches the repository Markdown

- [ ] **Step 1: Create a pre-sync backup**

Run:

```bash
test ! -e "/private/tmp/Remember Rain pre-outline-cleanup 2026-08-27.scriv"
ditto \
  "/Users/ninjaruss/Documents/Remember Rain.scriv" \
  "/private/tmp/Remember Rain pre-outline-cleanup 2026-08-27.scriv"
test -f "/private/tmp/Remember Rain pre-outline-cleanup 2026-08-27.scriv/Remember Rain.scrivx"
```

Expected: all commands exit successfully before the live project is changed. If the destination already exists, choose a new date-and-time suffix rather than replacing an earlier backup.

- [ ] **Step 2: Update matching binder documents in place**

Open the live Scrivener project. For every Markdown file under Characters, Story Plan, and World, replace the corresponding binder document's text with the approved repository text while preserving binder identity, synopsis, labels, snapshots, and placement.

Do not use Scrivener's external-folder sync against `src/content/novel`; that feature creates its own `Draft`, `Notes`, and `Trashed Files` layout and would rewrite the website tree.

- [ ] **Step 3: Preserve category placement and manuscript content**

Verify all reference documents remain under the matching Characters, Story Plan, and World binder folders. Do not create, rename, move, or update Manuscript documents.

- [ ] **Step 4: Compare Scrivener text with Markdown**

For every synchronized reference document, retrieve the saved editor text and compare it byte-for-byte with the corresponding repository Markdown. Any mismatch must be corrected in Scrivener and checked again.

- [ ] **Step 5: Save and verify the project bundle**

Save the Scrivener project. Confirm `Remember Rain.scrivx` has a new modification time and that all expected reference titles remain present.

- [ ] **Step 6: Push the completed repository work**

Verify the Git worktree is clean, then push the implementation commits to `main`:

```bash
git status --short
git push origin main
```

Expected: `git status --short` prints nothing and GitHub accepts the updated `main`. Do not push a temporary retention artifact or Scrivener backup.

---

## Final Handoff

Report:

- The new reference structure and ownership boundaries
- Files materially shortened, expanded, or reorganized
- Meaningful details relocated between files
- Concrete details removed because they contradicted newer canon
- Confirmation that Manuscript remained unchanged
- Test and build results
- Scrivener comparison results
- Final commits and pushed branch
