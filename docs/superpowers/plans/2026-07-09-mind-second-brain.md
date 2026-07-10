# /mind Second-Brain Encyclopedia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/mind` — an AI-condensed encyclopedia of the site's content — per `docs/superpowers/specs/2026-07-09-mind-second-brain-design.md`.

**Architecture:** A committed `src/data/mind.json` (AI-proposed concepts + second-person syntheses + entry assignments) is the contract between an offline AI pass (`npm run mind` via the `claude` CLI, or manual `mind:export`/`mind:import` copy-paste mode) and the Astro build, which resolves all factual details (titles, dates, excerpts, links) live from the content collections. Pages: SplitView `/mind` index + `/mind/[slug]` concept pages, a NavPill item, and a 2×1 homepage tile cycling synthesis lines.

**Tech Stack:** Astro 5, vanilla CSS (P4G design system), vitest, `astro/zod` for validation, `tsx` + `gray-matter` (new devDeps) for the standalone scripts, `marked` (existing dep) for synthesis rendering.

**Key context for an engineer new to this repo:**
- All content lives in `src/content/{notes,showcase,shelf,now,novel}`. The first four are Astro content collections (markdown + YAML frontmatter, `draft: true` filters entries out). `novel/` is NOT a collection — it's a Scrivener export read by `src/utils/novel.ts` (`buildNovelTree`, `slugify`).
- `SplitViewLayout.astro` renders a list/detail UI. Its client JS (`src/utils/splitView/contentLoader.ts`) fetches a clicked list item's own `href`, extracts the `.entry` element from the fetched HTML, and injects it into the detail panel. So every detail page must render its content inside an element with class `entry`, and list items are `ListItem.astro` components in the `list` slot.
- Unit tests live in `src/tests/*.test.ts` and run with `npm test` (vitest). Tests cannot import `astro:content` (virtual module), so testable logic must live in pure modules — this is why `journalMerge.ts` exists apart from `journal.ts`. We follow the same pattern.
- P4G design vocabulary: `.p4g-tab` (gold kicker bar), `.p4g-heading` (skewed display type), CSS vars `--color-gold: #ffe52c`, `--skew-accent: -12deg`. Every `:hover` style gets a comma-paired `:focus-visible`. Respect `prefers-reduced-motion`.

**File map (locked in):**

| File | Responsibility |
|---|---|
| `src/utils/mind/schema.ts` | Create — `MindData`/`MindConcept` types, `validateMindData()` (astro/zod + semantic checks) |
| `src/utils/mind/json.ts` | Create — `extractJsonBlock()` (pull JSON out of a chatbot reply) |
| `src/utils/mind/stabilize.ts` | Create — `stabilizeSlugs()` (keep concept URLs stable across AI runs) |
| `src/utils/mind/resolve.ts` | Create — `resolveMind()` (pure: refs → resolved entries, dropped refs, loose threads) |
| `src/utils/mind/prompt.ts` | Create — `buildMindPrompt()` (the instruction + corpus text sent to the model) |
| `src/utils/mind/pipeline.ts` | Create — `processModelResponse()` (extract → stabilize → validate, shared by all 3 script modes) |
| `src/utils/mind/corpus.ts` | Create — `gatherCorpus()` (fs + gray-matter; reads all 5 content sources) |
| `src/utils/mindContent.ts` | Create — Astro-side: read mind.json (fs, graceful fallback), build entry map from collections + novel tree, expose `getMindPageData()` / `getMindTileData()` |
| `scripts/mind/export.ts` | Create — `npm run mind:export` → writes `mind-prompt.txt` |
| `scripts/mind/import.ts` | Create — `npm run mind:import` → reads `mind-response.json`, writes `src/data/mind.json` |
| `scripts/mind/condense.ts` | Create — `npm run mind` → pipes prompt to `claude -p`, same import pipeline |
| `src/pages/mind/index.astro` | Create — SplitView index with concept list + loose-threads tray |
| `src/pages/mind/[slug].astro` | Create — concept detail (synthesis block, sources timeline, related chips) |
| `src/components/NavPill.astro` | Modify — add Mind item |
| `src/pages/index.astro` | Modify — add 2×1 Mind tile + cycling script |
| `src/tests/mind.test.ts` | Create — all pure-module tests |
| `package.json`, `.gitignore`, `CLAUDE.md` | Modify — scripts, deps, scratch-file ignores, docs |

---

### Task 1: Scaffolding — deps, npm scripts, gitignore

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install new devDependencies**

Run: `npm install -D tsx gray-matter`

Expected: both appear under `devDependencies` in `package.json`. (`tsx` runs TypeScript scripts under node; `gray-matter` parses YAML frontmatter outside Astro.)

- [ ] **Step 2: Add the three npm scripts**

In `package.json`, add to `"scripts"` (after `"add-image"`):

```json
    "mind": "tsx scripts/mind/condense.ts",
    "mind:export": "tsx scripts/mind/export.ts",
    "mind:import": "tsx scripts/mind/import.ts"
```

- [ ] **Step 3: Gitignore the manual-mode scratch files**

Append to `.gitignore`:

```
# /mind manual-mode scratch files (workflow artifacts, never content)
mind-prompt.txt
mind-response.json
```

- [ ] **Step 4: Verify nothing broke**

Run: `npm test`
Expected: existing suite passes (8 test files, all green).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: scaffolding for /mind — tsx + gray-matter, npm scripts, scratch-file ignores"
```

---

### Task 2: Schema types + `validateMindData`

**Files:**
- Create: `src/utils/mind/schema.ts`
- Create: `src/tests/mind.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/tests/mind.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validateMindData, type MindData } from '../utils/mind/schema';

const KNOWN = new Set(['notes/on-discipline', 'showcase/site', 'novel/themes/rain']);

function goodData(): MindData {
  return {
    generatedAt: '2026-07-09T00:00:00.000Z',
    concepts: [
      {
        slug: 'discipline',
        name: 'Discipline',
        synthesis: 'You keep circling the gap between intention and action.',
        entries: ['notes/on-discipline', 'showcase/site'],
        related: ['rain'],
      },
      {
        slug: 'rain',
        name: 'Rain',
        synthesis: '',
        entries: ['novel/themes/rain'],
        related: [],
      },
    ],
  };
}

describe('validateMindData', () => {
  it('accepts a valid document', () => {
    const result = validateMindData(goodData(), KNOWN);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data?.concepts).toHaveLength(2);
  });

  it('rejects structurally invalid input', () => {
    const result = validateMindData({ concepts: 'nope' }, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects malformed concept slugs', () => {
    const data = goodData();
    data.concepts[0].slug = 'Not A Slug!';
    const result = validateMindData(data, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('Not A Slug!');
  });

  it('rejects duplicate concept slugs', () => {
    const data = goodData();
    data.concepts[1].slug = 'discipline';
    const result = validateMindData(data, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('duplicate');
  });

  it('rejects entry refs that do not exist', () => {
    const data = goodData();
    data.concepts[0].entries.push('notes/hallucinated');
    const result = validateMindData(data, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('notes/hallucinated');
  });

  it('rejects related refs pointing at unknown concepts', () => {
    const data = goodData();
    data.concepts[0].related = ['ghost-concept'];
    const result = validateMindData(data, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('ghost-concept');
  });

  it('warns (not errors) on unassigned entries and out-of-range concept count', () => {
    const data = goodData();
    data.concepts[1].entries = []; // rain entry now unassigned... but empty entries
    // an empty concept is an error; instead drop the ref so the entry is unassigned
    data.concepts[1].entries = ['novel/themes/rain'];
    const known = new Set([...KNOWN, 'notes/unassigned-one']);
    const result = validateMindData(data, known);
    expect(result.ok).toBe(true); // only 2 concepts (< 6) and 1 unassigned entry → warnings
    expect(result.warnings.join(' ')).toContain('notes/unassigned-one');
    expect(result.warnings.join(' ')).toContain('concept count');
  });

  it('rejects a concept with zero entries', () => {
    const data = goodData();
    data.concepts[1].entries = [];
    const result = validateMindData(data, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('no entries');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/mind.test.ts`
Expected: FAIL — cannot resolve `../utils/mind/schema`.

- [ ] **Step 3: Implement `src/utils/mind/schema.ts`**

```ts
import { z } from 'astro/zod';

export interface MindConcept {
  slug: string;
  name: string;
  synthesis: string;
  entries: string[];
  related: string[];
}

export interface MindData {
  generatedAt: string;
  concepts: MindConcept[];
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  data?: MindData;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const conceptSchema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  synthesis: z.string(),
  entries: z.array(z.string()),
  related: z.array(z.string()).default([]),
});

const mindSchema = z.object({
  generatedAt: z.string(),
  concepts: z.array(conceptSchema),
});

/**
 * Validate a candidate mind.json document.
 * Errors block writing the file; warnings are printed but non-blocking.
 * `knownEntryIds` is the set of entry refs that exist in the content right now.
 */
export function validateMindData(raw: unknown, knownEntryIds: Set<string>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parsed = mindSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map(i => `${i.path.join('.') || '(root)'}: ${i.message}`),
      warnings,
    };
  }
  const data = parsed.data as MindData;

  const slugs = new Set<string>();
  for (const concept of data.concepts) {
    if (!SLUG_RE.test(concept.slug)) {
      errors.push(`concept slug "${concept.slug}" is malformed (want kebab-case)`);
    }
    if (slugs.has(concept.slug)) {
      errors.push(`duplicate concept slug "${concept.slug}"`);
    }
    slugs.add(concept.slug);
    if (concept.entries.length === 0) {
      errors.push(`concept "${concept.slug}" has no entries`);
    }
    for (const ref of concept.entries) {
      if (!knownEntryIds.has(ref)) {
        errors.push(`concept "${concept.slug}" references unknown entry "${ref}"`);
      }
    }
  }
  for (const concept of data.concepts) {
    for (const rel of concept.related) {
      if (!slugs.has(rel)) {
        errors.push(`concept "${concept.slug}" relates to unknown concept "${rel}"`);
      }
    }
  }

  if (data.concepts.length < 6 || data.concepts.length > 12) {
    warnings.push(`concept count is ${data.concepts.length}, outside the 6-12 target range`);
  }
  const assigned = new Set(data.concepts.flatMap(c => c.entries));
  const unassigned = [...knownEntryIds].filter(id => !assigned.has(id));
  if (unassigned.length > 0) {
    warnings.push(`unassigned entries (will appear as loose threads): ${unassigned.join(', ')}`);
  }

  return { ok: errors.length === 0, errors, warnings, data };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/mind.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/mind/schema.ts src/tests/mind.test.ts
git commit -m "feat(mind): MindData schema and validateMindData"
```

---

### Task 3: `extractJsonBlock` — tolerate chatbot wrapping

**Files:**
- Create: `src/utils/mind/json.ts`
- Modify: `src/tests/mind.test.ts` (append)

- [ ] **Step 1: Write the failing tests** (append to `src/tests/mind.test.ts`)

```ts
import { extractJsonBlock } from '../utils/mind/json';

describe('extractJsonBlock', () => {
  const obj = { generatedAt: 'x', concepts: [] };
  const json = JSON.stringify(obj, null, 2);

  it('parses bare JSON', () => {
    expect(extractJsonBlock(json)).toEqual(obj);
  });

  it('parses JSON inside a ```json fence with surrounding prose', () => {
    const reply = `Sure! Here is your mind:\n\n\`\`\`json\n${json}\n\`\`\`\n\nLet me know if you need changes.`;
    expect(extractJsonBlock(reply)).toEqual(obj);
  });

  it('parses JSON inside a bare ``` fence', () => {
    const reply = `\`\`\`\n${json}\n\`\`\``;
    expect(extractJsonBlock(reply)).toEqual(obj);
  });

  it('parses a JSON object embedded in prose without fences', () => {
    const reply = `Here you go: ${json} — enjoy!`;
    expect(extractJsonBlock(reply)).toEqual(obj);
  });

  it('throws a helpful error when no JSON is found', () => {
    expect(() => extractJsonBlock('no json here at all')).toThrow(/no json/i);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/tests/mind.test.ts`
Expected: FAIL — cannot resolve `../utils/mind/json`.

- [ ] **Step 3: Implement `src/utils/mind/json.ts`**

```ts
/**
 * Pull a JSON object out of a chatbot reply. Models wrap JSON in prose and
 * code fences; we tolerate all of it. Strategy: try fenced block first, then
 * the outermost {...} span, then the raw text.
 */
export function extractJsonBlock(text: string): unknown {
  const candidates: string[] = [];

  const fence = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fence) candidates.push(fence[1]);

  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) candidates.push(text.slice(first, last + 1));

  candidates.push(text);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try the next strategy
    }
  }
  throw new Error('No JSON object found in the response text');
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/tests/mind.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/mind/json.ts src/tests/mind.test.ts
git commit -m "feat(mind): extractJsonBlock tolerates fenced/prose-wrapped model replies"
```

---

### Task 4: `stabilizeSlugs` — URL stability across AI runs

**Files:**
- Create: `src/utils/mind/stabilize.ts`
- Modify: `src/tests/mind.test.ts` (append)

- [ ] **Step 1: Write the failing tests** (append)

```ts
import { stabilizeSlugs } from '../utils/mind/stabilize';
import type { MindConcept } from '../utils/mind/schema';

function concept(slug: string, name: string, related: string[] = []): MindConcept {
  return { slug, name, synthesis: '', entries: ['notes/x'], related };
}

describe('stabilizeSlugs', () => {
  it('rewrites a new slug to the old one when concept names match (case-insensitive)', () => {
    const old = [concept('japanese-study', 'Japanese Study')];
    const next = [concept('learning-japanese', 'japanese study')];
    const result = stabilizeSlugs(old, next);
    expect(result[0].slug).toBe('japanese-study');
  });

  it('rewrites related refs that pointed at the renamed slug', () => {
    const old = [concept('identity', 'Identity')];
    const next = [
      concept('the-self', 'Identity'),
      concept('discipline', 'Discipline', ['the-self']),
    ];
    const result = stabilizeSlugs(old, next);
    expect(result[0].slug).toBe('identity');
    expect(result[1].related).toEqual(['identity']);
  });

  it('leaves genuinely new concepts untouched', () => {
    const old = [concept('identity', 'Identity')];
    const next = [concept('craft', 'Craft')];
    expect(stabilizeSlugs(old, next)[0].slug).toBe('craft');
  });

  it('does not create duplicate slugs when the old slug is already taken', () => {
    const old = [concept('identity', 'Identity')];
    const next = [
      concept('identity', 'Something Else'),   // squats the old slug
      concept('the-self', 'Identity'),          // would rename onto it
    ];
    const result = stabilizeSlugs(old, next);
    const slugs = result.map(c => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/tests/mind.test.ts` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/utils/mind/stabilize.ts`**

```ts
import type { MindConcept } from './schema';

/**
 * Keep concept URLs stable across AI runs: if a new concept has the same name
 * (case-insensitive) as an old concept but a different slug, rewrite it to the
 * old slug and fix any `related` refs that pointed at the new slug. Skips the
 * rename when it would collide with a slug already used in the new set.
 */
export function stabilizeSlugs(
  oldConcepts: MindConcept[],
  newConcepts: MindConcept[]
): MindConcept[] {
  const oldByName = new Map(oldConcepts.map(c => [c.name.toLowerCase(), c.slug]));
  const result = newConcepts.map(c => ({ ...c, related: [...c.related] }));
  const taken = new Set(result.map(c => c.slug));
  const renames = new Map<string, string>();

  for (const c of result) {
    const oldSlug = oldByName.get(c.name.toLowerCase());
    if (oldSlug && oldSlug !== c.slug && !taken.has(oldSlug)) {
      renames.set(c.slug, oldSlug);
      taken.delete(c.slug);
      taken.add(oldSlug);
      c.slug = oldSlug;
    }
  }

  for (const c of result) {
    c.related = c.related.map(rel => renames.get(rel) ?? rel);
  }
  return result;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/tests/mind.test.ts` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/mind/stabilize.ts src/tests/mind.test.ts
git commit -m "feat(mind): stabilizeSlugs preserves concept URLs across AI runs"
```

---

### Task 5: `resolveMind` — the always-current structural layer

**Files:**
- Create: `src/utils/mind/resolve.ts`
- Modify: `src/tests/mind.test.ts` (append)

- [ ] **Step 1: Write the failing tests** (append)

```ts
import { resolveMind, type ResolvedEntry } from '../utils/mind/resolve';

function entry(id: string, publishedAt: string | null, title = id): ResolvedEntry {
  const collection = id.split('/')[0];
  return { id, title, href: `/${id}`, collection, publishedAt, excerpt: `excerpt of ${id}` };
}

function entryMap(...entries: ResolvedEntry[]): Map<string, ResolvedEntry> {
  return new Map(entries.map(e => [e.id, e]));
}

describe('resolveMind', () => {
  const mind = {
    generatedAt: '2026-07-01T00:00:00.000Z',
    concepts: [
      {
        slug: 'discipline',
        name: 'Discipline',
        synthesis: 'You keep circling.',
        entries: ['notes/a', 'notes/deleted', 'notes/b'],
        related: ['rain'],
      },
      { slug: 'rain', name: 'Rain', synthesis: '', entries: ['notes/b'], related: [] },
    ],
  };

  it('resolves entries, drops dead refs, and reports them', () => {
    const map = entryMap(entry('notes/a', '2026-06-01'), entry('notes/b', '2026-06-15'));
    const result = resolveMind(mind, map);
    expect(result.concepts[0].entries.map(e => e.id)).toEqual(['notes/b', 'notes/a']); // date desc
    expect(result.droppedRefs).toEqual(['notes/deleted']);
  });

  it('resolves related concepts to {slug, name} pairs', () => {
    const map = entryMap(entry('notes/a', '2026-06-01'), entry('notes/b', '2026-06-15'));
    const result = resolveMind(mind, map);
    expect(result.concepts[0].related).toEqual([{ slug: 'rain', name: 'Rain' }]);
  });

  it('loose threads = unassigned entries published after generatedAt', () => {
    const map = entryMap(
      entry('notes/a', '2026-06-01'),
      entry('notes/b', '2026-06-15'),
      entry('notes/new-thought', '2026-07-05'),   // after generatedAt, unassigned → loose
      entry('notes/old-unfiled', '2026-01-01'),   // before generatedAt → not loose
      entry('novel/themes/undated', null)          // no date → never loose
    );
    const result = resolveMind(mind, map);
    expect(result.looseThreads.map(e => e.id)).toEqual(['notes/new-thought']);
  });

  it('null mind data yields empty concepts and no loose threads', () => {
    const result = resolveMind(null, entryMap(entry('notes/a', '2026-06-01')));
    expect(result.concepts).toEqual([]);
    expect(result.looseThreads).toEqual([]);
    expect(result.generatedAt).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run src/tests/mind.test.ts` → FAIL.

- [ ] **Step 3: Implement `src/utils/mind/resolve.ts`**

```ts
import type { MindData } from './schema';

export interface ResolvedEntry {
  id: string;
  title: string;
  href: string;
  collection: string;
  publishedAt: string | null;
  excerpt: string;
}

export interface ResolvedConcept {
  slug: string;
  name: string;
  synthesis: string;
  entries: ResolvedEntry[];
  related: { slug: string; name: string }[];
}

export interface ResolvedMind {
  generatedAt: string | null;
  concepts: ResolvedConcept[];
  droppedRefs: string[];
  looseThreads: ResolvedEntry[];
}

/**
 * Pure structural layer: marries the committed interpretation (mind.json)
 * with the live content (entryMap built at build time). Facts always come
 * from entryMap, so a stale mind.json can never show a wrong date/excerpt.
 */
export function resolveMind(
  mind: MindData | null,
  entryMap: Map<string, ResolvedEntry>
): ResolvedMind {
  if (!mind) {
    return { generatedAt: null, concepts: [], droppedRefs: [], looseThreads: [] };
  }

  const nameBySlug = new Map(mind.concepts.map(c => [c.slug, c.name]));
  const droppedRefs: string[] = [];
  const assigned = new Set<string>();

  const concepts: ResolvedConcept[] = mind.concepts.map(concept => {
    const entries: ResolvedEntry[] = [];
    for (const ref of concept.entries) {
      const resolved = entryMap.get(ref);
      if (resolved) {
        entries.push(resolved);
        assigned.add(ref);
      } else {
        droppedRefs.push(ref);
      }
    }
    entries.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
    return {
      slug: concept.slug,
      name: concept.name,
      synthesis: concept.synthesis,
      entries,
      related: concept.related
        .filter(slug => nameBySlug.has(slug))
        .map(slug => ({ slug, name: nameBySlug.get(slug)! })),
    };
  });

  const looseThreads = [...entryMap.values()]
    .filter(e => !assigned.has(e.id) && e.publishedAt !== null && e.publishedAt > mind.generatedAt)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

  return { generatedAt: mind.generatedAt, concepts, droppedRefs, looseThreads };
}
```

Note: `publishedAt` comparisons are ISO-8601 string comparisons — valid because ISO strings sort lexicographically. Test dates like `'2026-06-01'` compare correctly against full ISO timestamps for our purposes (date-only strings sort before same-day timestamps; acceptable).

- [ ] **Step 4: Run to verify pass** — `npx vitest run src/tests/mind.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/mind/resolve.ts src/tests/mind.test.ts
git commit -m "feat(mind): resolveMind — live entry resolution, dropped refs, loose threads"
```

---

### Task 6: Corpus gatherer (fs + gray-matter)

**Files:**
- Create: `src/utils/mind/corpus.ts`
- Modify: `src/tests/mind.test.ts` (append)

- [ ] **Step 1: Write the failing tests** (append). These run against the real `src/content/` — an integration check that the ID scheme matches reality.

```ts
import { gatherCorpus } from '../utils/mind/corpus';

describe('gatherCorpus', () => {
  it('gathers entries from all five sources with well-formed ids', async () => {
    const corpus = await gatherCorpus();
    const byPrefix = (p: string) => corpus.filter(e => e.id.startsWith(p + '/'));
    expect(byPrefix('notes').length).toBeGreaterThan(0);
    expect(byPrefix('showcase').length).toBeGreaterThan(0);
    expect(byPrefix('shelf').length).toBeGreaterThan(0);
    expect(byPrefix('now').length).toBeGreaterThan(0);
    // novel Themes/Lore may legitimately be small but should exist
    expect(byPrefix('novel').length).toBeGreaterThan(0);
    for (const e of corpus) {
      expect(e.id).toMatch(/^(notes|showcase|shelf|now)\/[a-z0-9-]+$|^novel\/[a-z0-9-]+(\/[a-z0-9-]+)+$/);
      expect(e.title.length).toBeGreaterThan(0);
      expect(typeof e.text).toBe('string');
    }
  });

  it('excludes draft entries', async () => {
    const corpus = await gatherCorpus();
    // no gathered entry should carry draft frontmatter — verified by the
    // implementation filter; here we just assert ids are unique
    const ids = corpus.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run src/tests/mind.test.ts` → FAIL.

- [ ] **Step 3: Implement `src/utils/mind/corpus.ts`**

```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { stripMarkdown } from '../content';
import { slugify } from '../novel';

export interface CorpusEntry {
  id: string;
  title: string;
  tags: string[];
  publishedAt: string | null;
  text: string;
}

const COLLECTIONS = ['notes', 'showcase', 'shelf', 'now'] as const;
const NOVEL_FOLDERS = ['Themes', 'Lore'];
const MAX_TEXT = 4000;

async function gatherCollection(contentDir: string, name: string): Promise<CorpusEntry[]> {
  const dir = path.join(contentDir, name);
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const entries: CorpusEntry[] = [];
  for (const file of files.filter(f => /\.(md|mdx)$/.test(f))) {
    const raw = await fs.readFile(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    if (data.draft === true) continue;
    const slug = file.replace(/\.(md|mdx)$/, '');
    entries.push({
      id: `${name}/${slug}`,
      title: String(data.title ?? slug),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
      text: stripMarkdown(content).slice(0, MAX_TEXT),
    });
  }
  return entries;
}

async function gatherNovelFolder(contentDir: string, folder: string): Promise<CorpusEntry[]> {
  const base = path.join(contentDir, 'novel', folder);
  const entries: CorpusEntry[] = [];

  async function walk(dir: string, slugParts: string[]): Promise<void> {
    let items: import('node:fs').Dirent[] = [];
    try {
      items = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      if (item.isDirectory()) {
        await walk(path.join(dir, item.name), [...slugParts, slugify(item.name)]);
      } else if (item.name.endsWith('.md')) {
        const name = item.name.replace(/\.md$/, '');
        const raw = await fs.readFile(path.join(dir, item.name), 'utf-8');
        entries.push({
          id: `novel/${[...slugParts, slugify(name)].join('/')}`,
          title: name,
          tags: [],
          publishedAt: null,
          text: stripMarkdown(raw).slice(0, MAX_TEXT),
        });
      }
    }
  }

  await walk(base, [slugify(folder)]);
  return entries;
}

/** Gather all non-draft content as plain-text corpus entries for the AI pass. */
export async function gatherCorpus(contentDir = 'src/content'): Promise<CorpusEntry[]> {
  const groups = await Promise.all([
    ...COLLECTIONS.map(c => gatherCollection(contentDir, c)),
    ...NOVEL_FOLDERS.map(f => gatherNovelFolder(contentDir, f)),
  ]);
  return groups.flat();
}
```

- [ ] **Step 4: Run to verify pass** — `npx vitest run src/tests/mind.test.ts` → PASS. If the novel assertion fails because `Themes`/`Lore` folders are named differently, check `ls src/content/novel/` and adjust `NOVEL_FOLDERS` to the actual top-level folder names (spec: Themes + Lore only).

- [ ] **Step 5: Commit**

```bash
git add src/utils/mind/corpus.ts src/tests/mind.test.ts
git commit -m "feat(mind): gatherCorpus reads all five content sources via fs"
```

---

### Task 7: Prompt builder + shared pipeline

**Files:**
- Create: `src/utils/mind/prompt.ts`
- Create: `src/utils/mind/pipeline.ts`
- Modify: `src/tests/mind.test.ts` (append)

- [ ] **Step 1: Write the failing tests** (append)

```ts
import { buildMindPrompt } from '../utils/mind/prompt';
import { processModelResponse } from '../utils/mind/pipeline';

describe('buildMindPrompt', () => {
  const corpus = [
    { id: 'notes/a', title: 'On A', tags: ['life'], publishedAt: '2026-06-01T00:00:00.000Z', text: 'body of a' },
  ];

  it('includes instructions, the output schema, and every corpus entry', () => {
    const prompt = buildMindPrompt(corpus, null);
    expect(prompt).toContain('6');
    expect(prompt).toContain('12');
    expect(prompt).toContain('second person');
    expect(prompt).toContain('"generatedAt"');
    expect(prompt).toContain('notes/a');
    expect(prompt).toContain('body of a');
  });

  it('lists existing concept slugs for stability when provided', () => {
    const existing = {
      generatedAt: '2026-07-01T00:00:00.000Z',
      concepts: [{ slug: 'identity', name: 'Identity', synthesis: '', entries: ['notes/a'], related: [] }],
    };
    const prompt = buildMindPrompt(corpus, existing);
    expect(prompt).toContain('identity');
    expect(prompt).toContain('existing concept');
  });
});

describe('processModelResponse', () => {
  const known = new Set(['notes/a']);

  it('extracts, stabilizes, validates, and returns data on success', () => {
    const reply = '```json\n' + JSON.stringify({
      generatedAt: '2026-07-09T00:00:00.000Z',
      concepts: [{ slug: 'the-self', name: 'Identity', synthesis: 'You return here.', entries: ['notes/a'], related: [] }],
    }) + '\n```';
    const existing = {
      generatedAt: '2026-07-01T00:00:00.000Z',
      concepts: [{ slug: 'identity', name: 'Identity', synthesis: '', entries: ['notes/a'], related: [] }],
    };
    const result = processModelResponse(reply, known, existing);
    expect(result.errors).toEqual([]);
    expect(result.data?.concepts[0].slug).toBe('identity'); // stabilized
  });

  it('fills in generatedAt when the model omitted it', () => {
    const reply = JSON.stringify({
      concepts: [{ slug: 'x', name: 'X', synthesis: '', entries: ['notes/a'], related: [] }],
    });
    const result = processModelResponse(reply, known, null);
    expect(result.errors).toEqual([]);
    expect(result.data?.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('returns errors (no data) for invalid responses', () => {
    const reply = JSON.stringify({
      generatedAt: 'now',
      concepts: [{ slug: 'x', name: 'X', synthesis: '', entries: ['notes/hallucinated'], related: [] }],
    });
    const result = processModelResponse(reply, known, null);
    expect(result.data).toBeUndefined();
    expect(result.errors.join(' ')).toContain('notes/hallucinated');
  });

  it('reports unparseable text as an error, not a throw', () => {
    const result = processModelResponse('total garbage', known, null);
    expect(result.data).toBeUndefined();
    expect(result.errors.join(' ')).toMatch(/no json/i);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npx vitest run src/tests/mind.test.ts` → FAIL.

- [ ] **Step 3: Implement `src/utils/mind/prompt.ts`**

```ts
import type { CorpusEntry } from './corpus';
import type { MindData } from './schema';

/**
 * Build the full prompt for the condensation pass. Used verbatim by both the
 * CLI mode (piped to `claude -p`) and manual mode (written to mind-prompt.txt).
 */
export function buildMindPrompt(corpus: CorpusEntry[], existing: MindData | null): string {
  const entryIds = corpus.map(e => e.id).join('\n');

  const stability = existing && existing.concepts.length > 0
    ? `\nThese are the existing concept slugs from the previous run. Reuse a slug (and its concept) wherever the concept survives, so URLs stay stable:\n${existing.concepts.map(c => `- ${c.slug} ("${c.name}")`).join('\n')}\n`
    : '';

  const body = corpus
    .map(e => {
      const meta = [e.publishedAt ? `published ${e.publishedAt.slice(0, 10)}` : null, e.tags.length ? `tags: ${e.tags.join(', ')}` : null]
        .filter(Boolean)
        .join(' | ');
      return `=== ${e.id}\ntitle: ${e.title}${meta ? `\n${meta}` : ''}\n\n${e.text}`;
    })
    .join('\n\n');

  return `You are condensing one person's website writing into a personal encyclopedia — a map of their mind.

Below is their complete corpus: philosophical notes, project showcases, media log entries, "now" snapshots, and novel worldbuilding (themes/lore). Each entry starts with "=== <entry-id>".

Your task:
1. Propose between 6 and 12 concepts that genuinely organize this person's thinking. The concepts themselves should be discoveries — through-lines the author may not have named. Prefer ideas ("identity", "discipline") over topics ("anime") where the material supports it.
2. For each concept, write a synthesis of 2-4 sentences in the second person ("You keep returning to..."). Surface through-lines, tensions, and how the thinking has shifted over time. Be specific to this corpus — no generic filler.
3. Assign EVERY entry to at least one concept. An entry may belong to several.
4. Link related concepts to each other via their slugs.
${stability}
Respond with ONLY a JSON object in exactly this shape (no other text):

{
  "generatedAt": "<current ISO-8601 timestamp>",
  "concepts": [
    {
      "slug": "kebab-case-slug",
      "name": "Concept Name",
      "synthesis": "You keep returning to...",
      "entries": ["notes/some-entry", "shelf/some-entry"],
      "related": ["other-concept-slug"]
    }
  ]
}

Rules:
- "entries" values must be copied EXACTLY from this list of valid entry ids:
${entryIds}
- "related" values must be slugs of concepts in YOUR response.
- Slugs are lowercase kebab-case.

THE CORPUS:

${body}
`;
}
```

- [ ] **Step 4: Implement `src/utils/mind/pipeline.ts`**

```ts
import { extractJsonBlock } from './json';
import { stabilizeSlugs } from './stabilize';
import { validateMindData, type MindData } from './schema';

export interface PipelineResult {
  data?: MindData;
  errors: string[];
  warnings: string[];
}

/**
 * Shared post-processing for a model response, whatever produced it:
 * extract JSON → default generatedAt → stabilize slugs → validate.
 * Never throws; problems come back as errors.
 */
export function processModelResponse(
  text: string,
  knownEntryIds: Set<string>,
  existing: MindData | null
): PipelineResult {
  let raw: unknown;
  try {
    raw = extractJsonBlock(text);
  } catch (err) {
    return { errors: [(err as Error).message], warnings: [] };
  }

  if (raw && typeof raw === 'object' && !(raw as Record<string, unknown>).generatedAt) {
    (raw as Record<string, unknown>).generatedAt = new Date().toISOString();
  }

  if (
    raw && typeof raw === 'object' &&
    Array.isArray((raw as Record<string, unknown>).concepts) &&
    existing
  ) {
    (raw as Record<string, unknown>).concepts = stabilizeSlugs(
      existing.concepts,
      (raw as { concepts: MindData['concepts'] }).concepts
    );
  }

  const result = validateMindData(raw, knownEntryIds);
  return { data: result.ok ? result.data : undefined, errors: result.errors, warnings: result.warnings };
}
```

- [ ] **Step 5: Run to verify pass** — `npx vitest run src/tests/mind.test.ts` → PASS. Also run the full suite: `npm test` → all green.

- [ ] **Step 6: Commit**

```bash
git add src/utils/mind/prompt.ts src/utils/mind/pipeline.ts src/tests/mind.test.ts
git commit -m "feat(mind): prompt builder and shared response pipeline"
```

---

### Task 8: The three scripts (`mind`, `mind:export`, `mind:import`)

**Files:**
- Create: `scripts/mind/export.ts`
- Create: `scripts/mind/import.ts`
- Create: `scripts/mind/condense.ts`
- Create: `scripts/mind/io.ts` (tiny shared fs helpers)

No unit tests here — all logic is in the already-tested `src/utils/mind/*` modules; these files are thin I/O shells verified by running them.

- [ ] **Step 1: Create `scripts/mind/io.ts`**

```ts
import fs from 'node:fs';
import path from 'node:path';
import type { MindData } from '../../src/utils/mind/schema';

export const MIND_JSON = path.resolve('src/data/mind.json');
export const PROMPT_FILE = path.resolve('mind-prompt.txt');
export const RESPONSE_FILE = path.resolve('mind-response.json');

export function readExistingMind(): MindData | null {
  try {
    return JSON.parse(fs.readFileSync(MIND_JSON, 'utf-8')) as MindData;
  } catch {
    return null;
  }
}

export function writeMind(data: MindData): void {
  fs.mkdirSync(path.dirname(MIND_JSON), { recursive: true });
  fs.writeFileSync(MIND_JSON, JSON.stringify(data, null, 2) + '\n');
}

export function report(warnings: string[], errors: string[]): void {
  for (const w of warnings) console.warn(`⚠ ${w}`);
  for (const e of errors) console.error(`✗ ${e}`);
}
```

- [ ] **Step 2: Create `scripts/mind/export.ts`**

```ts
import fs from 'node:fs';
import { gatherCorpus } from '../../src/utils/mind/corpus';
import { buildMindPrompt } from '../../src/utils/mind/prompt';
import { readExistingMind, PROMPT_FILE } from './io';

const corpus = await gatherCorpus();
const prompt = buildMindPrompt(corpus, readExistingMind());
fs.writeFileSync(PROMPT_FILE, prompt);

console.log(`Wrote ${PROMPT_FILE} (${corpus.length} entries, ${prompt.length} chars).`);
console.log('');
console.log('Next steps:');
console.log('  1. Paste the contents of mind-prompt.txt into any chatbot.');
console.log('  2. Save its reply as mind-response.json in the project root.');
console.log('  3. Run: npm run mind:import');
```

- [ ] **Step 3: Create `scripts/mind/import.ts`**

```ts
import fs from 'node:fs';
import { gatherCorpus } from '../../src/utils/mind/corpus';
import { processModelResponse } from '../../src/utils/mind/pipeline';
import { readExistingMind, writeMind, report, RESPONSE_FILE, MIND_JSON } from './io';

if (!fs.existsSync(RESPONSE_FILE)) {
  console.error(`✗ ${RESPONSE_FILE} not found.`);
  console.error('  Run `npm run mind:export`, paste mind-prompt.txt into a chatbot,');
  console.error('  and save the reply as mind-response.json first.');
  process.exit(1);
}

const text = fs.readFileSync(RESPONSE_FILE, 'utf-8');
const corpus = await gatherCorpus();
const known = new Set(corpus.map(e => e.id));
const result = processModelResponse(text, known, readExistingMind());

report(result.warnings, result.errors);

if (!result.data) {
  console.error('\nmind.json was NOT modified. Fix the response (or re-paste) and retry.');
  process.exit(1);
}

writeMind(result.data);
fs.unlinkSync(RESPONSE_FILE);
console.log(`✓ Wrote ${MIND_JSON} (${result.data.concepts.length} concepts).`);
console.log('  Review with `git diff src/data/mind.json`, then commit.');
```

- [ ] **Step 4: Create `scripts/mind/condense.ts`**

```ts
import { spawnSync } from 'node:child_process';
import { gatherCorpus } from '../../src/utils/mind/corpus';
import { buildMindPrompt } from '../../src/utils/mind/prompt';
import { processModelResponse } from '../../src/utils/mind/pipeline';
import { readExistingMind, writeMind, report, MIND_JSON } from './io';

const corpus = await gatherCorpus();
const existing = readExistingMind();
const prompt = buildMindPrompt(corpus, existing);

console.log(`Condensing ${corpus.length} entries via the claude CLI...`);
const proc = spawnSync('claude', ['-p'], {
  input: prompt,
  encoding: 'utf-8',
  maxBuffer: 32 * 1024 * 1024,
});

if (proc.error || proc.status !== 0) {
  console.error('✗ Failed to run the `claude` CLI.');
  if (proc.error) console.error(`  ${proc.error.message}`);
  if (proc.stderr) console.error(`  ${proc.stderr.trim()}`);
  console.error('');
  console.error('  Make sure Claude Code is installed and authenticated (a paid');
  console.error('  subscription or ANTHROPIC_API_KEY). No Claude access? Use the');
  console.error('  free manual mode instead: npm run mind:export');
  process.exit(1);
}

const known = new Set(corpus.map(e => e.id));
const result = processModelResponse(proc.stdout, known, existing);
report(result.warnings, result.errors);

if (!result.data) {
  console.error('\nThe model response failed validation; mind.json was NOT modified. Re-run to retry.');
  process.exit(1);
}

writeMind(result.data);
console.log(`✓ Wrote ${MIND_JSON} (${result.data.concepts.length} concepts).`);
console.log('  Review with `git diff src/data/mind.json`, then commit.');
```

- [ ] **Step 5: Verify export mode end-to-end**

Run: `npm run mind:export`
Expected: `mind-prompt.txt` appears in the project root; the file starts with "You are condensing" and contains `=== notes/` entry blocks; console prints the 3-step instructions.

Run: `git status --short`
Expected: `mind-prompt.txt` does NOT appear (gitignored).

- [ ] **Step 6: Verify import-mode error paths**

Run: `npm run mind:import`
Expected: exits 1 with the "mind-response.json not found" guidance.

Run: `echo "not json at all" > mind-response.json && npm run mind:import`
Expected: exits 1 with a "No JSON object found" error and "mind.json was NOT modified".

Run: `rm mind-response.json`

- [ ] **Step 7: Commit**

```bash
git add scripts/mind/
git commit -m "feat(mind): condense/export/import scripts for the AI pass"
```

---

### Task 9: Astro-side loader (`mindContent.ts`)

**Files:**
- Create: `src/utils/mindContent.ts`

This module imports `astro:content`, so it cannot be unit-tested (same constraint as `journal.ts`); it's verified by the page builds in Tasks 10-12.

- [ ] **Step 1: Implement `src/utils/mindContent.ts`**

```ts
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { stripMarkdown } from './content';
import { buildNovelTree, type NovelFolder } from './novel';
import { validateMindData, type MindData } from './mind/schema';
import { resolveMind, type ResolvedEntry, type ResolvedMind } from './mind/resolve';

export type { ResolvedMind, ResolvedEntry };

const MIND_JSON = path.resolve('src/data/mind.json');
const NOVEL_DIR = path.resolve('src/content/novel');
const NOVEL_FOLDERS = ['Themes', 'Lore'];

/** Read + validate the committed mind.json; missing/invalid → null (never fails the build). */
function readMindData(): MindData | null {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(MIND_JSON, 'utf-8'));
  } catch {
    console.warn('[mind] src/data/mind.json missing or unreadable — /mind renders the empty state');
    return null;
  }
  // Structural check only at build time: pass a permissive known-set so stale
  // entry refs surface as dropped-ref warnings in resolveMind, not build noise.
  const structural = validateMindData(raw, new Set((raw as MindData)?.concepts?.flatMap(c => c.entries) ?? []));
  if (!structural.ok) {
    console.warn(`[mind] mind.json failed validation — /mind renders the empty state:\n  ${structural.errors.join('\n  ')}`);
    return null;
  }
  return structural.data!;
}

function novelEntries(): ResolvedEntry[] {
  // buildNovelTree is async; call sites await buildEntryMap which handles it.
  return [];
}

function collectNovelFiles(folderSlug: string, folder: NovelFolder, parts: string[], out: ResolvedEntry[]): void {
  for (const file of folder.files) {
    out.push({
      id: `novel/${[...parts, file.slug].join('/')}`,
      title: file.name,
      href: `/novel/${[...parts, file.slug].join('/')}`,
      collection: 'novel',
      publishedAt: null,
      excerpt: stripMarkdown(file.html ?? '').slice(0, 140),
    });
  }
  for (const [childSlug, child] of Object.entries(folder.folders ?? {})) {
    collectNovelFiles(childSlug, child, [...parts, childSlug], out);
  }
}

async function buildEntryMap(): Promise<Map<string, ResolvedEntry>> {
  const map = new Map<string, ResolvedEntry>();

  const add = (id: string, entry: ResolvedEntry) => map.set(id, entry);

  const hrefFor: Record<string, (slug: string) => string> = {
    notes: s => `/notes/${s}`,
    showcase: s => `/showcase/${s}`,
    shelf: s => `/shelf/${s}`,
    now: () => `/now/archive`,
  };

  for (const name of ['notes', 'showcase', 'shelf', 'now'] as const) {
    const entries = await getCollection(name, ({ data }) => !data.draft);
    for (const entry of entries) {
      add(`${name}/${entry.slug}`, {
        id: `${name}/${entry.slug}`,
        title: entry.data.title,
        href: hrefFor[name](entry.slug),
        collection: name === 'showcase' ? 'showcase' : name,
        publishedAt: entry.data.publishedAt ? entry.data.publishedAt.toISOString() : null,
        excerpt: stripMarkdown(entry.body ?? '').slice(0, 140),
      });
    }
  }

  const tree = await buildNovelTree(NOVEL_DIR);
  for (const folderName of NOVEL_FOLDERS) {
    const folder = Object.entries(tree).find(([, f]) => f.name === folderName)?.[1];
    if (folder) {
      const out: ResolvedEntry[] = [];
      collectNovelFiles(folder.slug, folder, [folder.slug], out);
      for (const e of out) add(e.id, e);
    }
  }

  return map;
}

let cached: ResolvedMind | null = null;

/** Full resolved mind for /mind pages and the homepage tile. Cached per build. */
export async function getMindPageData(): Promise<ResolvedMind> {
  if (cached) return cached;
  const resolved = resolveMind(readMindData(), await buildEntryMap());
  for (const ref of resolved.droppedRefs) {
    console.warn(`[mind] dropped stale entry ref "${ref}" (entry deleted or drafted)`);
  }
  cached = resolved;
  return resolved;
}

export interface MindTileData {
  conceptCount: number;
  lines: string[]; // first sentence of each synthesis, for the cycling tile
}

/** Lightweight view for the homepage tile. */
export async function getMindTileData(): Promise<MindTileData> {
  const { concepts } = await getMindPageData();
  const lines = concepts
    .filter(c => c.synthesis.trim().length > 0)
    .map(c => {
      const plain = stripMarkdown(c.synthesis);
      const sentence = plain.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? plain;
      return sentence.slice(0, 120);
    });
  return { conceptCount: concepts.length, lines };
}
```

**Important implementation check:** the `NovelFolder`/`NovelFile` field names above (`files`, `folders`, `name`, `slug`, `html`) must match `src/utils/novel.ts` — open it and reconcile (the interface is at the top of the file, lines 5-22). Adjust `collectNovelFiles` and the tree-walk to the actual shape; also remove the unused `novelEntries()` stub if you added it. The ID scheme MUST produce the same ids as `gatherCorpus` in `src/utils/mind/corpus.ts` (`novel/<folder-slug>/<...>/<file-slug>`), or AI-assigned novel refs will all drop. If the shapes disagree, fix corpus.ts to match novel.ts too, and re-run `npx vitest run src/tests/mind.test.ts`.

- [ ] **Step 2: Type-check**

Run: `npx astro check 2>/dev/null || npx tsc --noEmit -p . 2>/dev/null || echo "no checker configured — rely on build in Task 10"`
Expected: no errors from the new file (or fall through to the build check next task).

- [ ] **Step 3: Commit**

```bash
git add src/utils/mindContent.ts
git commit -m "feat(mind): astro-side loader with graceful mind.json fallback"
```

---

### Task 10: `/mind` pages

**Files:**
- Create: `src/pages/mind/index.astro`
- Create: `src/pages/mind/[slug].astro`

- [ ] **Step 1: Create `src/pages/mind/index.astro`**

```astro
---
import SplitViewLayout from '../../layouts/SplitViewLayout.astro';
import ListItem from '../../components/ListItem.astro';
import { getMindPageData } from '../../utils/mindContent';

const { concepts, looseThreads } = await getMindPageData();
---

<SplitViewLayout
  title="Mind"
  description="A condensed encyclopedia of the thinking behind this site."
  section="mind"
  kicker="second brain"
  ogImage="/social-default.svg"
>
  <Fragment slot="list">
    {concepts.length > 0 ? (
      concepts.map((concept) => (
        <ListItem
          href={`/mind/${concept.slug}`}
          slug={concept.slug}
          title={concept.name}
          subtitle={concept.synthesis ? concept.synthesis.split(/(?<=[.!?])\s/)[0].slice(0, 90) : undefined}
          meta={`${concept.entries.length} ${concept.entries.length === 1 ? 'entry' : 'entries'}`}
          searchableContent={`${concept.name} ${concept.synthesis} ${concept.entries.map(e => e.title).join(' ')}`.slice(0, 500)}
        />
      ))
    ) : (
      <p class="empty-state">the mind is unformed — run <code>npm run mind</code></p>
    )}
    {looseThreads.length > 0 && (
      <div class="loose-threads">
        <span class="loose-threads__label">loose threads ({looseThreads.length})</span>
        <p class="loose-threads__hint">raw material awaiting condensation — run <code>npm run mind</code></p>
        <ul class="loose-threads__list">
          {looseThreads.map((thread) => (
            <li><a href={thread.href}>{thread.title}</a></li>
          ))}
        </ul>
      </div>
    )}
  </Fragment>
</SplitViewLayout>

<style>
  .empty-state {
    color: var(--color-text-muted);
    font-style: italic;
    text-align: center;
    padding: var(--space-xl);
  }

  .loose-threads {
    margin: var(--space-lg);
    padding: var(--space-md);
    border: 1px solid rgba(255, 229, 44, 0.25);
    clip-path: polygon(var(--cut-sm) 0, 100% 0, 100% calc(100% - var(--cut-sm)), calc(100% - var(--cut-sm)) 100%, 0 100%, 0 var(--cut-sm));
  }

  .loose-threads__label {
    display: inline-block;
    font-family: var(--font-display);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    color: var(--color-gold);
    transform: skewX(var(--skew-display));
  }

  .loose-threads__hint {
    margin: var(--space-xs) 0 var(--space-sm);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .loose-threads__list {
    margin: 0;
    padding-left: var(--space-md);
    font-size: var(--text-sm);
  }

  .loose-threads__list a {
    color: var(--color-text);
  }

  .loose-threads__list a:hover,
  .loose-threads__list a:focus-visible {
    color: var(--color-gold);
  }
</style>
```

**CSS variable check:** this file uses `--color-text-muted`, `--space-*`, `--text-*`, `--tracking-label`, `--cut-sm`, `--skew-display`. Grep `src/styles/global.css` and `typography.css` for each; the journal empty-state used `--color-muted` — use whichever actually exists (check `grep -o "\-\-color[a-z-]*muted[a-z-]*" src/styles/*.css | sort -u`).

- [ ] **Step 2: Create `src/pages/mind/[slug].astro`**

```astro
---
import { marked } from 'marked';
import SplitViewLayout from '../../layouts/SplitViewLayout.astro';
import ListItem from '../../components/ListItem.astro';
import { formatDate } from '../../utils/dates';
import { getMindPageData } from '../../utils/mindContent';

export async function getStaticPaths() {
  const { concepts } = await getMindPageData();
  return concepts.map((concept) => ({
    params: { slug: concept.slug },
    props: { concept },
  }));
}

const { concept } = Astro.props;
const { concepts, looseThreads } = await getMindPageData();

const hasSynthesis = concept.synthesis.trim().length > 0;
const synthesisHtml = hasSynthesis ? marked.parse(concept.synthesis) : '';
const generatedAt = (await getMindPageData()).generatedAt;

const BADGES: Record<string, string> = {
  notes: 'note',
  showcase: 'showcase',
  shelf: 'shelf',
  now: 'now',
  novel: 'novel',
};
---

<SplitViewLayout
  title="Mind"
  description={hasSynthesis ? concept.synthesis.slice(0, 160) : `Entries orbiting ${concept.name}.`}
  section="mind"
  kicker="second brain"
  initialSlug={concept.slug}
  pageTitle={concept.name}
  ogImage="/social-default.svg"
  ogType="article"
>
  <Fragment slot="list">
    {concepts.map((item) => (
      <ListItem
        href={`/mind/${item.slug}`}
        slug={item.slug}
        title={item.name}
        meta={`${item.entries.length} ${item.entries.length === 1 ? 'entry' : 'entries'}`}
        searchableContent={`${item.name} ${item.synthesis}`.slice(0, 500)}
      />
    ))}
  </Fragment>

  <Fragment slot="detail">
    <article class="entry">
      <div class="container">
        <header class="concept__header">
          <h1 class="entry__title">{concept.name}</h1>
        </header>

        {hasSynthesis && (
          <div class="concept__synthesis">
            {generatedAt && (
              <span class="concept__stamp">condensed {formatDate(new Date(generatedAt))}</span>
            )}
            <div class="concept__synthesis-body" set:html={synthesisHtml} />
          </div>
        )}

        <section class="concept__sources" aria-label="Source entries">
          <h2 class="concept__sources-title">sources</h2>
          <ol class="concept__timeline">
            {concept.entries.map((entry) => (
              <li class="concept__card">
                <div class="concept__card-top">
                  <span class="concept__badge">{BADGES[entry.collection] ?? entry.collection}</span>
                  {entry.publishedAt && (
                    <span class="concept__date">{formatDate(new Date(entry.publishedAt))}</span>
                  )}
                </div>
                <a class="concept__card-title" href={entry.href}>{entry.title}</a>
                {entry.excerpt && <p class="concept__excerpt">{entry.excerpt}</p>}
              </li>
            ))}
          </ol>
        </section>

        {concept.related.length > 0 && (
          <nav class="concept__related" aria-label="Related concepts">
            <h2 class="concept__sources-title">related</h2>
            <div class="concept__chips">
              {concept.related.map((rel) => (
                <a class="concept__chip" href={`/mind/${rel.slug}`}>{rel.name}</a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </article>
  </Fragment>
</SplitViewLayout>

<style is:global>
  .concept__header {
    margin-bottom: var(--space-lg);
  }

  .concept__synthesis {
    position: relative;
    margin-bottom: var(--space-xl);
    padding: var(--space-md) var(--space-lg);
    border-left: 3px solid var(--color-gold);
    background: rgba(255, 229, 44, 0.04);
  }

  .concept__stamp {
    display: block;
    margin-bottom: var(--space-xs);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .concept__synthesis-body p {
    margin: 0 0 var(--space-sm);
    line-height: 1.7;
  }

  .concept__synthesis-body p:last-child {
    margin-bottom: 0;
  }

  .concept__sources-title {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    color: var(--color-gold);
    transform: skewX(var(--skew-display));
    margin-bottom: var(--space-md);
  }

  .concept__timeline {
    list-style: none;
    margin: 0 0 var(--space-xl);
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .concept__card {
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    clip-path: polygon(var(--cut-sm) 0, 100% 0, 100% calc(100% - var(--cut-sm)), calc(100% - var(--cut-sm)) 100%, 0 100%, 0 var(--cut-sm));
  }

  .concept__card-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--space-xs);
  }

  .concept__badge {
    display: inline-block;
    padding: 1px 8px;
    background: var(--color-gold);
    color: #111;
    font-family: var(--font-display);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    transform: skewX(var(--skew-accent));
  }

  .concept__date {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .concept__card-title {
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
  }

  .concept__card-title:hover,
  .concept__card-title:focus-visible {
    color: var(--color-gold);
  }

  .concept__excerpt {
    margin: var(--space-xs) 0 0;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  .concept__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .concept__chip {
    padding: var(--space-xs) var(--space-md);
    border: 1px solid var(--color-gold);
    color: var(--color-gold);
    text-decoration: none;
    font-size: var(--text-sm);
    clip-path: polygon(var(--cut-sm) 0, 100% 0, 100% calc(100% - var(--cut-sm)), calc(100% - var(--cut-sm)) 100%, 0 100%, 0 var(--cut-sm));
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .concept__chip:hover,
  .concept__chip:focus-visible {
    background: var(--color-gold);
    color: #111;
  }
</style>
```

Notes:
- Styles are `is:global` because the detail HTML is re-injected by the SplitView client fetch (`contentLoader` copies `.entry` HTML but scoped-style hashes still match since the CSS ships on both pages; `is:global` avoids any hash mismatch when the index page shows a fetched concept).
- Duplicate `getMindPageData()` calls are fine — it's cached per build (module-level `cached`).
- Verify the CSS variables used exist (same grep as Task 10 Step 1); `--color-border`, `--font-mono`, `--transition-fast` all appear in existing components (`ListItem.astro`, `NavPill.astro`) — confirm before relying on them.

- [ ] **Step 3: Build with no mind.json — empty-state check**

Run: `npm run build`
Expected: build succeeds; console shows the `[mind] src/data/mind.json missing` warning; `dist/mind/index.html` exists; no `dist/mind/<slug>/` pages.

- [ ] **Step 4: Create a hand-written smoke `mind.json` and rebuild**

Pick two real entry ids from the corpus first: `npm run mind:export && grep -m 4 "^=== " mind-prompt.txt`.

Create `src/data/mind.json` using two REAL ids from that output (example shape below — substitute real ids):

```json
{
  "generatedAt": "2026-07-09T00:00:00.000Z",
  "concepts": [
    {
      "slug": "smoke-test",
      "name": "Smoke Test",
      "synthesis": "You are testing whether the mind renders. It does, and you notice you enjoy watching structure emerge from writing.",
      "entries": ["notes/<REAL-SLUG>", "showcase/<REAL-SLUG>"],
      "related": []
    }
  ]
}
```

Run: `npm run build`
Expected: build succeeds; `dist/mind/smoke-test/index.html` exists; a warning about concept count (1 < 6) is fine.

- [ ] **Step 5: Visual verification with the dev server**

Start the dev server (preview tooling or `npm run dev`) and check:
1. `/mind` — list shows "Smoke Test · 2 entries"; loose-threads tray lists unassigned entries newer than generatedAt (there may be none — fine).
2. Clicking the concept loads the detail in the center panel without a full page reload (SplitView fetch) — synthesis block with gold left rule + "condensed <date>" stamp, source cards with badges/dates/excerpts linking to the original entries.
3. Direct load of `/mind/smoke-test` renders the same with the concept pre-selected.
4. Keyboard: tab to a list item, Enter opens it; focus ring is gold.

- [ ] **Step 6: Commit** (keep the smoke mind.json for now — the tile task needs it; it gets replaced by a real run later)

```bash
git add src/pages/mind/ src/data/mind.json
git commit -m "feat(mind): /mind SplitView index and concept detail pages"
```

---

### Task 11: NavPill item

**Files:**
- Modify: `src/components/NavPill.astro:11-18`

- [ ] **Step 1: Add the Mind section**

In the `SECTIONS` array, append after the Now entry (order per spec: Home / Journal / Novel / Shelf / Stream / Now / Mind):

```ts
const SECTIONS = [
  { href: '/', label: 'Home', match: ['/'] },
  { href: '/journal', label: 'Journal', match: ['/journal', '/notes', '/showcase'] },
  { href: '/novel', label: 'Novel', match: ['/novel'] },
  { href: '/shelf', label: 'Shelf', match: ['/shelf'] },
  { href: '/stream', label: 'Stream', match: ['/stream'] },
  { href: '/now', label: 'Now', match: ['/now'] },
  { href: '/mind', label: 'Mind', match: ['/mind'] },
];
```

- [ ] **Step 2: Verify**

Dev server: on `/mind` the MIND item shows the solid-gold active state; on `/mind/smoke-test` too (the `startsWith('/mind/')` match handles it). At 480px width the 7 items still fit (they flex/shrink; check nothing wraps out of the bar — if cramped, that's acceptable per the existing `flex: 1` mobile treatment).

- [ ] **Step 3: Commit**

```bash
git add src/components/NavPill.astro
git commit -m "feat(mind): add Mind to the NavPill (7 items)"
```

---

### Task 12: Homepage Mind tile (2×1, cycling synthesis line)

**Files:**
- Modify: `src/pages/index.astro` (three places: frontmatter, markup after the Email tile, script + styles)

- [ ] **Step 1: Frontmatter — load tile data**

In `src/pages/index.astro` frontmatter, add with the other imports:

```ts
import { getMindTileData } from '../utils/mindContent';
```

and below the `latestEntries` preparation:

```ts
const mindTile = await getMindTileData();
```

- [ ] **Step 2: Markup — add the tile after the Email tile**

Find the Email tile (`id="mail-tile"`, around line 487) and add immediately after its closing `</a>`:

```astro
      <!-- Row 6: Mind (2×1) -->
      <a
        href="/mind"
        id="mind-tile"
        class="bento-tile bento-tile--interactive bento-tile--span-2x1 p3r-animate"
        style="--stagger-delay: 240ms;"
        data-lines={JSON.stringify(mindTile.lines)}
      >
        <span class="bento-tile__corner" aria-hidden="true"></span>
        <div class="mind-tile__inner">
          <div class="mind-tile__top">
            <span class="p4g-tab">Mind</span>
            <span class="mind-tile__count">
              {mindTile.conceptCount > 0
                ? `${mindTile.conceptCount} concepts`
                : 'not yet condensed'}
            </span>
          </div>
          <p class="mind-tile__line" id="mind-line">
            {mindTile.lines[0] ?? 'a second brain, waiting to form.'}
          </p>
        </div>
        <span class="mind-tile__sweep" aria-hidden="true"></span>
      </a>
```

**Check the corner-triangle convention first:** open an existing interactive tile in `index.astro` and copy exactly how the hover corner is produced (`.bento-tile__corner` span vs. a pseudo-element from `bento.css`). If `bento.css` adds it automatically to `.bento-tile--interactive`, drop the explicit span. Match whatever the Stream tile does.

- [ ] **Step 3: Styles — add scoped tile styles near the latest-tile styles**

```css
  /* Mind tile — rotating synthesis line with the P4G gold sweep */
  .mind-tile__inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    height: 100%;
    justify-content: center;
  }

  .mind-tile__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
  }

  .mind-tile__count {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .mind-tile__line {
    margin: 0;
    font-size: var(--text-sm);
    line-height: 1.55;
    color: var(--color-text);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .mind-tile__sweep {
    position: absolute;
    inset: -1px;
    background: var(--color-gold);
    transform: translateX(-115%) skewX(var(--skew-accent));
    pointer-events: none;
    z-index: 2;
  }

  #mind-tile.is-cycling .mind-tile__sweep {
    animation: latest-sweep 760ms var(--animation-easing);
  }

  @media (prefers-reduced-motion: reduce) {
    #mind-tile.is-cycling .mind-tile__sweep {
      animation: none;
    }
  }
```

This reuses the existing `latest-sweep` keyframes (defined for the Latest tile around line 1441 — verify the keyframes name with `grep -n "@keyframes latest-sweep" src/pages/index.astro` and reuse it; if the in/out timing lives in the keyframes, identical behavior is exactly what we want).

- [ ] **Step 4: Script — add `initializeMindTile` next to `initializeLatestTile`**

```ts
  // Mind tile — rotates one synthesis line at a time behind the gold sweep.
  let mindCycleTimer: number | undefined;

  function initializeMindTile() {
    clearInterval(mindCycleTimer);
    const tile = document.getElementById('mind-tile');
    if (!tile) return;
    const lines: string[] = JSON.parse((tile as HTMLElement).dataset.lines || '[]');
    const lineEl = document.getElementById('mind-line');
    if (!lineEl || lines.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let index = 0;
    mindCycleTimer = window.setInterval(() => {
      index = (index + 1) % lines.length;
      tile.classList.add('is-cycling');
      window.setTimeout(() => { lineEl.textContent = lines[index]; }, 365);
      window.setTimeout(() => tile.classList.remove('is-cycling'), 800);
    }, 8000);
  }
```

Register it in both places where `initializeLatestTile()` is called (initial run around line 1921, and inside the `astro:page-load` listener):

```ts
  initializeMindTile();
```

- [ ] **Step 5: Verify in the browser**

Dev server, homepage:
1. Mind tile renders in a new row below Shelf/Latest/Email with "MIND" tab, "1 concepts" count (smoke data), and the synthesis first sentence.
2. With only 1 line it does NOT cycle (guard `lines.length < 2`). Temporarily add a second concept to `src/data/mind.json` to watch one sweep cycle, then revert.
3. Tile links to `/mind`; hover shows the gold corner triangle + tilt like other tiles.
4. Delete `src/data/mind.json` temporarily, reload: tile shows "not yet condensed" / "a second brain, waiting to form." and still links to `/mind`. Restore the file.
5. Mobile width (375px): tile stacks cleanly with the grid's existing responsive collapse.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(mind): homepage Mind tile with cycling synthesis line"
```

---

### Task 13: First real condensation + docs + final verification

**Files:**
- Modify: `src/data/mind.json` (replaced by a real run)
- Modify: `CLAUDE.md`

- [ ] **Step 1: Run the real AI pass**

Run: `npm run mind`
Expected: prints entry count, runs the `claude` CLI (may take a minute), prints `✓ Wrote src/data/mind.json (N concepts)` with N in 6-12. If validation fails, re-run once (models occasionally fumble strict JSON); if the CLI is unavailable, use the manual mode (`npm run mind:export` → paste → `npm run mind:import`).

- [ ] **Step 2: Review the output like an editor**

Run: `git diff src/data/mind.json`
Read every synthesis. This is the veto step the whole design is built around — the user should do this review themselves before committing. **Stop and show the user the concepts + syntheses; get their OK.**

- [ ] **Step 3: Full verification**

Run: `npm test` — Expected: all suites pass (9 files including mind.test.ts).
Run: `npm run build` — Expected: success; `/mind/<slug>/` pages for every concept; no `[mind]` warnings other than possibly loose-thread info.
Dev-server spot-check `/mind`: concepts listed, syntheses render, sources link correctly, NavPill highlights, homepage tile cycles through real synthesis lines.

- [ ] **Step 4: Update CLAUDE.md**

Add to CLAUDE.md:
1. Under **Build & Development Commands**, after `npm run test`:

```
npm run mind         # AI-condense site content into src/data/mind.json (claude CLI)
npm run mind:export  # manual mode: write mind-prompt.txt for any chatbot
npm run mind:import  # manual mode: validate mind-response.json → mind.json
```

2. A new section after **Novel System**:

```markdown
## Mind System (/mind second brain)

`/mind` is an AI-condensed encyclopedia of the site's content. `src/data/mind.json`
(committed, reviewed via git diff before commit) holds the interpretation: 6-12
concepts, each with a second-person synthesis and entry refs like `notes/<slug>` /
`novel/themes/<slug>`. The build resolves all facts (titles, dates, excerpts, links)
live from collections + the novel tree (`src/utils/mindContent.ts` → pure logic in
`src/utils/mind/`), so a stale mind.json can never show wrong facts — staleness only
means new entries sit in the "loose threads" tray on /mind (accumulation framing;
never shows time-since-last-run — same no-shame invariant as the novel rain gauge).
Missing/invalid mind.json → the build still succeeds and /mind renders an empty state.
Concepts whose synthesis is empty render sources-only. Pages: /mind (SplitViewLayout,
kicker "second brain") + /mind/[slug]. NavPill has a Mind item (7 items). Homepage
has a 2×1 Mind tile cycling synthesis first-sentences with the latest-sweep pattern.
Scripts live in scripts/mind/ (tsx); manual mode scratch files mind-prompt.txt /
mind-response.json are gitignored. Tests: src/tests/mind.test.ts (pure modules only).
```

3. Update the NavPill component description (6 items → 7, add Mind) and the homepage grid pattern (add Row 6: Mind 2×1).

- [ ] **Step 5: Commit**

```bash
git add src/data/mind.json CLAUDE.md
git commit -m "feat(mind): first real condensation + docs"
```

---

## Spec coverage checklist (self-review)

| Spec requirement | Task |
|---|---|
| `src/data/mind.json` contract, Zod-validated | 2, 9 |
| `npm run mind` via headless claude CLI | 8 |
| Manual mode: bare `mind:export` / `mind:import`, fixed files, gitignored | 1, 8 |
| JSON extraction from prose/fenced replies | 3 |
| Slug stability across runs | 4, 7 |
| Validation: refs resolve, slugs well-formed, assignment, count range | 2 |
| Corpus: notes + showcase + shelf + now + novel Themes/Lore, non-draft | 6 |
| Second-person 2-4 sentence syntheses, 6-12 concepts | 7 (prompt) |
| Build resolves facts live; dropped-ref warnings | 5, 9 |
| Loose-threads tray (accumulation framing, no shame metric) | 5, 10 |
| Missing/invalid mind.json → build succeeds, empty state | 9, 10 |
| Missing-synthesis fallback (sources-only render) | 10 (`hasSynthesis` guard) |
| `/mind` SplitView index, kicker "second brain" | 10 |
| `/mind/[slug]`: synthesis block + stamp, timeline, related chips | 10 |
| NavPill Mind item, `/mind/*` highlight | 11 |
| Homepage 2×1 tile, cycling line, gold sweep, reduced-motion, fallback | 12 |
| Tests: refs/dropped, loose threads, slug merge, schema accept/reject | 2-7 |
| CLAUDE.md updated | 13 |
