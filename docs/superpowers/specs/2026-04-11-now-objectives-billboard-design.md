# Now Page: Objectives Billboard

**Date:** 2026-04-11  
**Status:** Approved

## Summary

Add a collapsible objectives billboard to the Now page that displays the current month's goals. Content lives in a single markdown file (`src/content/now/objectives.md`) edited in place each month. The billboard sits between the page header and the prose content, collapsed by default, expandable to show a two-column category grid.

## Data Source

- **File:** `src/content/now/objectives.md` — a single file, replaced/edited each month
- **Not** a content collection entry — invisible to the archive page
- **Format:**

```markdown
## Japanese
- [ ] Learn 50 new kanji via Anki
- [x] Complete Bunpro N4 chapter

## Novel
- [ ] Write scenes 4–6 in Scrivener
- [ ] Outline act 2 structure
```

Top-level headings (`## `) define categories. Items use standard markdown task list syntax (`- [ ]` pending, `- [x]` done). If the file doesn't exist, the billboard is silently omitted.

## Parsing

**New file:** `src/utils/objectives.ts`

Exports one function: `parseObjectives(markdown: string)` — returns `{ heading: string, items: { text: string, done: boolean }[] }[]`.

Logic:
1. Split on `## ` to get sections
2. For each section, extract the heading (first line) and parse remaining lines matching `- [ ]` or `- [x]`
3. Skip blank lines and non-item lines
4. Skip sections with no valid items (handles leading blank content before first heading)

## Component

**New file:** `src/components/ObjectivesBillboard.astro`

Props:
```typescript
{
  sections: { heading: string, items: { text: string, done: boolean }[] }[];
  month: string; // e.g. "April" derived from now entry's publishedAt
}
```

Renders a native `<details>`/`<summary>` — zero JS, accessible. Structure:

```
<details class="objectives">
  <summary class="objectives__toggle">
    ◈ April Objectives  ▾
  </summary>
  <div class="objectives__grid">
    <div class="objectives__card">
      <div class="objectives__card-label">Japanese</div>
      <ul>
        <li class="objectives__item">Learn 50 new kanji</li>
        <li class="objectives__item objectives__item--done">Complete Bunpro N4 chapter</li>
      </ul>
    </div>
  </div>
</details>
```

## Styling

All styles scoped to `ObjectivesBillboard.astro`:

| Element | Style |
|---------|-------|
| `summary` toggle | `display: inline-flex`, gold monospace label, `◈` icon |
| Chevron `▾` | Rotates 180° on `details[open]` via CSS, no JS |
| Grid | `repeat(2, 1fr)`, `gap: var(--space-md)`, collapses to 1 col at 480px |
| Cards | `background: var(--color-bg-elevated)`, `border: 1px solid rgba(255,229,44,0.1)`, `border-radius: var(--radius-sm)` |
| Card label | `font-family: var(--font-mono)`, `color: var(--color-gold)`, uppercase, `letter-spacing: 0.15em` |
| Items | `font-size: var(--text-sm)`, `color: var(--color-text-muted)`, `·` prefix bullet |
| Done items | `color: var(--color-text-subtle)`, `text-decoration: line-through` |
| Billboard spacing | `margin-bottom: var(--space-2xl)` |

Respects `prefers-reduced-motion` (chevron transition disabled).

## Integration: `now.astro`

At build time, before rendering:

```astro
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseObjectives } from '../utils/objectives';
import ObjectivesBillboard from '../components/ObjectivesBillboard.astro';

const objectivesPath = join(process.cwd(), 'src/content/now/objectives.md');
const objectivesSections = existsSync(objectivesPath)
  ? parseObjectives(readFileSync(objectivesPath, 'utf-8'))
  : null;

const month = latestPost.data.publishedAt.toLocaleDateString('en-US', {
  timeZone: 'UTC', month: 'long'
});
```

Placed between `<header>` and `<div class="now__content prose">`:

```astro
{objectivesSections && (
  <ObjectivesBillboard sections={objectivesSections} month={month} />
)}
```

## Files Changed

| Action | File |
|--------|------|
| Create | `src/utils/objectives.ts` |
| Create | `src/components/ObjectivesBillboard.astro` |
| Create | `src/content/now/objectives.md` |
| Modify | `src/pages/now.astro` |
