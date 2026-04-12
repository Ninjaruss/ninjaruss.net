# Now Page: Objectives Billboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a collapsible objectives billboard to the Now page that renders a monthly `objectives.md` file as a two-column category grid.

**Architecture:** A new `parseObjectives()` utility reads raw markdown (split by `## ` headings, `- [ ]` / `- [x]` items) into typed sections. A new `ObjectivesBillboard.astro` component renders those sections as a native `<details>`/`<summary>` collapsible grid. `now.astro` reads `src/content/now/objectives.md` at build time and passes parsed sections to the component.

**Tech Stack:** Astro 5, TypeScript, vanilla CSS, vitest, native HTML `<details>`/`<summary>`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/utils/objectives.ts` | `parseObjectives(markdown)` — returns typed sections |
| Create | `src/tests/objectives.test.ts` | Vitest unit tests for `parseObjectives` |
| Create | `src/components/ObjectivesBillboard.astro` | Collapsible grid component |
| Create | `src/content/now/objectives.md` | Starter objectives file |
| Modify | `src/pages/now.astro` | Read file, parse, pass to component |

---

### Task 1: `parseObjectives` utility (TDD)

**Files:**
- Create: `src/utils/objectives.ts`
- Create: `src/tests/objectives.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/objectives.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseObjectives } from '../utils/objectives';

describe('parseObjectives', () => {
  it('parses sections with headings and items', () => {
    const md = `## Japanese
- [ ] Learn 50 new kanji
- [x] Complete Bunpro chapter

## Novel
- [ ] Write scenes 4–6
`;
    const result = parseObjectives(md);
    expect(result).toHaveLength(2);
    expect(result[0].heading).toBe('Japanese');
    expect(result[0].items).toHaveLength(2);
    expect(result[0].items[0]).toEqual({ text: 'Learn 50 new kanji', done: false });
    expect(result[0].items[1]).toEqual({ text: 'Complete Bunpro chapter', done: true });
    expect(result[1].heading).toBe('Novel');
    expect(result[1].items[0]).toEqual({ text: 'Write scenes 4–6', done: false });
  });

  it('skips sections with no valid items', () => {
    const md = `## Empty Section
just prose, no items

## Real Section
- [ ] An actual task
`;
    const result = parseObjectives(md);
    expect(result).toHaveLength(1);
    expect(result[0].heading).toBe('Real Section');
  });

  it('returns empty array for empty string', () => {
    expect(parseObjectives('')).toEqual([]);
  });

  it('handles leading content before first heading', () => {
    const md = `
Some preamble text

## Japanese
- [ ] Learn kanji
`;
    const result = parseObjectives(md);
    expect(result).toHaveLength(1);
    expect(result[0].heading).toBe('Japanese');
  });

  it('handles uppercase X as done', () => {
    const md = `## Task
- [X] Done item
`;
    const result = parseObjectives(md);
    expect(result[0].items[0].done).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test -- objectives
```

Expected: FAIL — `Cannot find module '../utils/objectives'`

- [ ] **Step 3: Implement `parseObjectives`**

Create `src/utils/objectives.ts`:

```typescript
export interface ObjectiveItem {
  text: string;
  done: boolean;
}

export interface ObjectiveSection {
  heading: string;
  items: ObjectiveItem[];
}

/**
 * Parse an objectives markdown file into typed sections.
 * Sections are delimited by ## headings.
 * Items use standard task list syntax: - [ ] pending, - [x] done.
 * Sections with no valid items are skipped.
 */
export function parseObjectives(markdown: string): ObjectiveSection[] {
  const sections: ObjectiveSection[] = [];
  const chunks = markdown.split(/^## /m);

  for (const chunk of chunks) {
    const lines = chunk.split('\n');
    const heading = lines[0].trim();
    if (!heading) continue;

    const items: ObjectiveItem[] = [];
    for (const line of lines.slice(1)) {
      const match = line.match(/^-\s+\[([xX ])\]\s+(.+)$/);
      if (match) {
        items.push({
          done: match[1].toLowerCase() === 'x',
          text: match[2].trim(),
        });
      }
    }

    if (items.length > 0) {
      sections.push({ heading, items });
    }
  }

  return sections;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- objectives
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/objectives.ts src/tests/objectives.test.ts
git commit -m "feat: add parseObjectives utility with tests"
```

---

### Task 2: Create `objectives.md` starter file

**Files:**
- Create: `src/content/now/objectives.md`

- [ ] **Step 1: Create the file with real April objectives**

Create `src/content/now/objectives.md`:

```markdown
## Japanese
- [ ] Daily Anki reviews (kanji + vocab)
- [ ] Work through Bunpro N4 grammar
- [ ] Watch Comprehensible Japanese immersion content daily

## Novel
- [ ] Write at least 3 scenes in Scrivener
- [ ] Outline act 2 structure
- [ ] Review and add notes to existing scenes

## Site
- [ ] Keep writing notes consistently
- [x] Integrate novel content into site
```

*(Edit this to match your real goals — this is just a starter.)*

- [ ] **Step 2: Commit**

```bash
git add src/content/now/objectives.md
git commit -m "content: add April 2026 objectives"
```

---

### Task 3: `ObjectivesBillboard.astro` component

**Files:**
- Create: `src/components/ObjectivesBillboard.astro`

- [ ] **Step 1: Create the component**

Create `src/components/ObjectivesBillboard.astro`:

```astro
---
import type { ObjectiveSection } from '../utils/objectives';

interface Props {
  sections: ObjectiveSection[];
  month: string;
}

const { sections, month } = Astro.props;
---

<details class="objectives">
  <summary class="objectives__toggle">
    <span class="objectives__icon" aria-hidden="true">◈</span>
    <span class="objectives__label">{month} Objectives</span>
    <span class="objectives__chevron" aria-hidden="true">▾</span>
  </summary>

  <div class="objectives__grid">
    {sections.map((section) => (
      <div class="objectives__card">
        <div class="objectives__card-label">{section.heading}</div>
        <ul class="objectives__list">
          {section.items.map((item) => (
            <li class={`objectives__item${item.done ? ' objectives__item--done' : ''}`}>
              <span class="objectives__bullet" aria-hidden="true">·</span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
</details>

<style>
  .objectives {
    margin-bottom: var(--space-2xl);
  }

  .objectives__toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
    list-style: none;
    padding: var(--space-xs) var(--space-md) var(--space-xs) 0;
    border: none;
    background: none;
    user-select: none;
  }

  /* Remove default triangle in WebKit */
  .objectives__toggle::-webkit-details-marker {
    display: none;
  }

  .objectives__icon {
    color: var(--color-gold-dim);
    font-size: 0.85em;
  }

  .objectives__label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-gold);
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .objectives__chevron {
    color: var(--color-gold-dim);
    font-size: 0.8em;
    transition: transform 200ms var(--animation-easing);
  }

  details[open] .objectives__chevron {
    transform: rotate(180deg);
  }

  .objectives__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
    padding-top: var(--space-md);
  }

  .objectives__card {
    background: var(--color-bg-elevated);
    border: var(--border-hairline) solid rgba(255, 229, 44, 0.1);
    border-radius: var(--radius-sm);
    padding: var(--space-md);
  }

  .objectives__card-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-gold);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: var(--space-sm);
  }

  .objectives__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .objectives__item {
    display: flex;
    gap: var(--space-xs);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: var(--leading-snug);
  }

  .objectives__bullet {
    color: var(--color-gold-dim);
    flex-shrink: 0;
    margin-top: 1px;
  }

  .objectives__item--done {
    color: var(--color-text-subtle);
    text-decoration: line-through;
  }

  .objectives__item--done .objectives__bullet {
    color: var(--color-text-subtle);
  }

  @media (max-width: 480px) {
    .objectives__grid {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .objectives__chevron {
      transition: none;
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ObjectivesBillboard.astro
git commit -m "feat: add ObjectivesBillboard component"
```

---

### Task 4: Integrate into `now.astro`

**Files:**
- Modify: `src/pages/now.astro`

- [ ] **Step 1: Add imports and file-read logic**

In `src/pages/now.astro`, add to the frontmatter block (after the existing imports):

```astro
---
import { getCollection } from 'astro:content';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import BaseLayout from '../layouts/BaseLayout.astro';
import NavPill from '../components/NavPill.astro';
import ObjectivesBillboard from '../components/ObjectivesBillboard.astro';
import { parseObjectives } from '../utils/objectives';

// Get the latest now entry from the collection
const allNowPosts = await getCollection('now', ({ data }) => !data.draft);
const sortedPosts = allNowPosts.sort((a, b) =>
  b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
);
const latestPost = sortedPosts[0];

// Render the markdown content
const { Content } = await latestPost.render();

// Format date in UTC for consistency
const lastUpdated = latestPost.data.publishedAt.toLocaleDateString('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// Load objectives billboard
const objectivesPath = join(process.cwd(), 'src/content/now/objectives.md');
const objectivesSections = existsSync(objectivesPath)
  ? parseObjectives(readFileSync(objectivesPath, 'utf-8'))
  : null;

const objectivesMonth = latestPost.data.publishedAt.toLocaleDateString('en-US', {
  timeZone: 'UTC',
  month: 'long',
});
---
```

- [ ] **Step 2: Add the component to the template**

In `src/pages/now.astro`, insert the `ObjectivesBillboard` between `</header>` and `<div class="now__content prose">`:

```astro
      </header>

      {objectivesSections && objectivesSections.length > 0 && (
        <ObjectivesBillboard sections={objectivesSections} month={objectivesMonth} />
      )}

      <div class="now__content prose">
        <Content />
      </div>
```

- [ ] **Step 3: Build and verify no errors**

```bash
npm run build
```

Expected: Build completes with no TypeScript or Astro errors.

- [ ] **Step 4: Run dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:4321/now`. Verify:
- The toggle chip `◈ April Objectives` appears below the date, above the prose
- Clicking expands the grid with category cards
- Done items show strikethrough + muted color
- Pending items show normal style with `·` bullet
- Chevron `▾` rotates on open
- On mobile (resize to <480px): grid collapses to single column

- [ ] **Step 5: Run tests to confirm nothing regressed**

```bash
npm run test
```

Expected: All tests PASS (including the new objectives tests).

- [ ] **Step 6: Commit**

```bash
git add src/pages/now.astro
git commit -m "feat: integrate ObjectivesBillboard into now page"
```
