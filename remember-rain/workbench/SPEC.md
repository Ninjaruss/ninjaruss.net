# Remember Rain Workbench — spec

Dated 2026-09-16. Signed off by the author.

## Purpose
A dedicated, self-contained screen for working on *Remember Rain*: a tabbed,
read-only "living story bible" that shows the story's current state, surfaces
contradictions, terminology drift, and focus problems, and produces a refined
outline. It opens in its own browser tab and reads the real story files + the
`remember-rain/` register live.

## Locked decisions

| Decision | Choice |
|---|---|
| Surface | Self-contained workbench page (own tab), not an in-harness plugin |
| Register relation | A living overview over `remember-rain/` + story docs; findings/decisions stay there |
| Refined outline | May rewrite the spine; lives outside the export in `remember-rain/outline.md` |
| Detection | Hybrid — deterministic auto-checks + agent-driven deep audits |
| Focus rubric | inherited/underexplained mechanics · unfocused detail · vague/gesture prose |
| Editability | Read-only; the agent writes the files |
| Tabs | Outline · Characters · Setting · Magic System · Philosophy · Findings · Decisions |
| Stack | No build — one Node file + static HTML/JS/CSS |

## The seven tabs
Outline (refined + spine/arc/choice source) · Characters · Setting · Magic System ·
Philosophy · Findings (register + live drift scan) · Decisions.

## Detection model
- **Auto-checks (every refresh):** terminology/name drift from `drift-terms.json`,
  plus the verified-consistent arithmetic panel.
- **Agent audits (recorded into the register, reflected by the screen):**
  contradiction / causal-gap / character-truth / vision-misalignment, plus the
  three-lens focus pass.

## Focus pass (the reason this exists)
Three lenses, by author selection: inherited/underexplained mechanics · unfocused
detail · vague/gesture prose. It reports mechanical symptoms, never origin
("AI-written" is not a defect class).

## Deliberately not built (anti-overcomplication)
- No inline editing → no save/sync/merge path.
- No heuristic quality scoring → auto layer is deterministic only.
- No second findings store → the screen is a view; findings live once in the register.
- No invention of canon → gaps surface as questions.

## Acceptance test
At a glance the screen answers: what is settled, what is open, what is drifting,
and where the outline is thin — and the refined outline passes the story's own
vision claims (becoming unavoidable; commitment ≠ momentum; evidence ≠ identity; etc.).
