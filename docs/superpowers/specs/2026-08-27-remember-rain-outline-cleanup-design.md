# Remember Rain Outline Cleanup Design

**Date:** 2026-08-27

## Purpose

Refine the *Remember Rain* outline into a layered story bible that is easy to enter, useful while drafting, and detailed enough to preserve the story's nuance.

The outline should not depend on one master summary. A reader should explore the story through reference files that each own one aspect of the project. The first section of any file should identify its subject and core elements quickly; deeper sections should retain the concrete details needed to write scenes.

## Scope

This cleanup covers:

- `src/content/novel/Characters`
- `src/content/novel/Story Plan`
- `src/content/novel/World`

It does not change anything under `src/content/novel/Manuscript`, including scene plans, scene identifiers, drafted prose, or the exact opening and ending callback lines in `Manuscript/Arc 1 - Fugitive/0 Rain intro.md`.

After the repository files are approved and verified, the revised reference documents will be synchronized into `/Users/ninjaruss/Documents/Remember Rain.scriv` without changing manuscript documents.

## Authority

When sources disagree, use this order:

1. Actual manuscript prose and specifically locked wording
2. Explicitly locked decisions from the current working conversation
3. The newest internally consistent outline material
4. Older repository notes as recoverable context rather than automatic canon

Current locked decisions include, but are not limited to:

- The Flare occurred five years before the story and happened once.
- Vesper is eighteen.
- Flare energy allows substrates to retain resonance from irreversible transitions.
- A passive produces resonance or pull; a person's distinctive relationship to that pull can become a unique Deviation.
- Claire's cost is neurological and computational overload.
- Vesper's extraction, archive, shatter, and Melt rules use the current revised model.
- Character heights and general visual anchors remain locked.
- Rain remains publicly a fugitive at the end and chooses to leave the city by train toward a new adventure and his dreams.
- Rain remembers the completed story as accurate fact without regaining the feeling that he literally lived it. This is not nihilistic erasure or proof that the story did not matter; it leaves him responsible for making another present choice without treating remembered experience as sufficient proof of growth.

## Documentation Model

Use **layered owned references**.

Each file has one primary subject. It begins with fast orientation, expands into drafting detail, and ends with boundary material only when needed. A concept receives one full explanation in its owning file. Other files retain only the consequence required to draft their subject.

The outline is not reorganized into an atomic wiki and is not split into summary/detail pairs. Keeping related nuance together is more valuable than making every fact independently addressable.

## File Ownership

### Characters

Character files own:

- The character's dramatic role and central contradiction
- How the character behaves and sounds on the page
- Wants, fears, pressures, and arc movement
- Relationships that materially change scene writing
- The character-specific expression and cost of abilities
- Locked visual anchors
- Provisional character details that remain useful
- Misreadings that would flatten the character

Character files do not restate the general magic system or provide full thematic essays. For example, `Magic System.md` owns the mechanics of extraction; `1 Vesper.md` owns how extraction expresses Vesper's habits, assumptions, tactics, and conflict.

Minor characters receive only sections supported by useful material. Their files should not be padded to imitate the major-character template.

### Story Plan

Each Story Plan file has a distinct job:

- `0 What is Remember Rain.md`: premise, player experience, story promise, and ending intent
- `1 The Spine.md`: chronological story movement and indispensable beats
- `2 Pessimism of Strength.md`: the central philosophical pressure created by strength, limitation, and participation
- `Arc Structure.md`: what each arc structurally accomplishes and how the arcs converge
- `Choice Points.md`: interaction rules, pitfalls, false endings, protected non-choices, and reconvergence
- `Themes and Motifs.md`: recurring images, contrasts, transformations, and their placement in the story
- `What does it mean to fall.md`: the story's specific model of falling and its drafting use
- `Open Questions.md`: only questions that lack a usable current answer

Story Plan files use headings specific to their function. They should not be forced into a shared template beyond a short opening statement that identifies what the file is for.

### World

World files own:

- `History.md`: chronology and public or institutional historical facts
- `Locations.md`: physical geography, institutions as places, travel relationships, and scene-relevant atmosphere
- `Magic System.md`: shared rules, terminology, costs, imprints, extraction mechanics, and known system boundaries

World files should state what facts change on the page. They should not expand into thematic interpretation when a concrete story consequence is sufficient.

## Layering and Section Vocabulary

### Major Characters

Use this sequence when the material supports it:

1. **Quick Read** — role, contradiction, immediate pressure, ability, and visual identity in roughly 100–200 words
2. **On the Page** — voice, behavior, habits, tells, and decision pattern
3. **Want, Fear, and Change** — internal pressure and arc movement
4. **With Others** — drafting-relevant relationships and contrasts
5. A character-specific mechanics heading such as **Deviation and Cost**, **Extraction and Glass**, or **Work and Equipment**
6. **Visual Anchors** — locked appearance and recurring physical cues
7. **Still Flexible** — only provisional details that remain usable
8. **Do Not Flatten** — likely misreadings or simplifications to avoid

Do not add an empty or redundant section for the sake of symmetry.

### World Files

Use:

1. **The Short Version** — fast orientation
2. Subject-specific headings such as **Timeline**, **Rules**, **Places**, or **Institutions**
3. **What This Changes** — practical consequences for scenes, choices, investigation, conflict, or public understanding
4. **Still Flexible** — provisional material, when present
5. **Constraints** — implications the draft must not accidentally create

### Story Plan Files

Prefer direct, subject-specific headings such as:

- **Story Movement**
- **Player Experience**
- **Arc Function**
- **Choice Rules**
- **Recurring Images**
- **Drafting Use**
- **Still Flexible**

Avoid generic headings when a concrete heading can identify the material more quickly.

## Decision States

The outline uses three states without labeling every paragraph:

- **Established:** written as an ordinary fact. Labels are unnecessary.
- **Working version:** retained in the relevant file under `Still Flexible`, or introduced with `Working version:` when only one detail is provisional.
- **Open:** no usable current answer exists. The question belongs in `Open Questions.md`.

Do not move provisional but usable ideas into `Open Questions.md`. Doing so would make the current drafting model less actionable and falsely imply that no direction exists.

## Editing Policy

### Preserve

Preserve concrete details that affect drafting:

- Gestures, habits, speech tendencies, and decision patterns
- Ability rules, limitations, costs, and tactical consequences
- Visual anchors, equipment, marks, scars, and recurring objects
- Character contradictions and ambivalent motives
- Relationship-specific behavior
- Scene order and indispensable causal links
- Distinctions that prevent a character, theme, or ending from being misread
- Current working versions that make an undrafted area usable

### Compress or Remove

Compress or remove:

- Repeated statements of the same theme
- Abstract explanation that follows after a concrete detail already demonstrates the point
- Template language that describes how to read the document rather than helping draft the story
- Repeated character summaries inside unrelated files
- Parallel headings that exist only to make files look symmetrical
- AI-heavy rhetorical constructions, inflated contrasts, and unnecessary restatement

Nuance must be relocated before it is cut. A shorter file is not automatically a better file.

### Theme

State a thematic proposition once in its owning file, then retain its concrete expression:

- Where it appears
- Which characters or choices carry it
- How an image or behavior changes across the story
- What drafting mistake would turn it into a simpler or different claim

Do not repeatedly explain what the reader should conclude.

## Cross-References

Use cross-references sparingly. A file should remain useful without requiring constant navigation.

Add a reference when:

- A full explanation already exists elsewhere
- Repeating it would create a second source of truth
- The local file still states the practical consequence needed for drafting

Do not replace meaningful local context with a bare link.

## Cleanup Sequence

1. Refine Story Plan files and establish source-of-truth boundaries.
2. Refine World files against those boundaries.
3. Refine Character files, retaining only the shared context required to write each character.
4. Run a cross-file consistency audit.
5. Run a retention audit against the pre-cleanup version.
6. Run novel tests and the production build.
7. Synchronize approved reference documents into Scrivener.
8. Verify Scrivener's corresponding documents match the repository Markdown exactly.

## Consistency Audit

Check at minimum:

- Names, ages, heights, visual anchors, and relationships
- Flare timing and one-time nature
- Public knowledge and five-year chronology
- Passive, resonance or pull, and Deviation relationships
- Imprint durability and destruction behavior
- Claire's neurological and computational overload
- Vesper's extraction, archive, shatter, prism, and Melt behavior
- Character-specific costs and limits
- Arc order, causal links, and convergence
- Rain's memory state after extraction
- Rain's unresolved public fugitive status
- The final train departure and its relationship to active participation
- Exact manuscript callback wording remaining unchanged

Conflicts should be resolved using the authority order in this specification. Genuine unresolved conflicts should be recorded as open questions rather than silently harmonized.

## Retention Audit

Before finalizing, compare every revised file against the pre-cleanup version and classify removed material as:

- Repetition
- Obsolete contradiction
- Relocated detail
- Non-drafting abstraction
- Material loss requiring restoration

Restore anything in the final category. The final report should identify meaningful relocations and any concrete detail intentionally removed as obsolete.

## Verification

The cleanup is complete when:

- Every file's opening section identifies its subject and core elements quickly.
- Each concept has one clear primary home.
- Established, working, and open material are distinguishable without excessive labels.
- Character nuance survives compression.
- No manuscript file changes.
- Locked details and wording remain intact.
- Repository tests pass.
- The production site builds successfully.
- The Scrivener reference documents match the approved Markdown files.

## Expected Result

A newcomer can build an understanding of *Remember Rain* by moving through focused documents rather than reading a single authoritative summary. An author drafting a scene can enter the relevant file, orient quickly, continue into concrete detail, and recognize which ideas are established, still flexible, or genuinely unanswered.
