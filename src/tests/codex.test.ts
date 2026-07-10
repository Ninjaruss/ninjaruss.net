import { describe, it, expect } from 'vitest';
import { validateCodexData, type CodexData } from '../utils/codex/schema';
import { extractJsonBlock } from '../utils/codex/json';

const KNOWN = new Set(['notes/on-discipline', 'showcase/site', 'novel/themes/rain']);

function goodData(): CodexData {
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

describe('validateCodexData', () => {
  it('accepts a valid document', () => {
    const result = validateCodexData(goodData(), KNOWN);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data?.concepts).toHaveLength(2);
  });

  it('rejects structurally invalid input', () => {
    const result = validateCodexData({ concepts: 'nope' }, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects malformed concept slugs', () => {
    const data = goodData();
    data.concepts[0].slug = 'Not A Slug!';
    const result = validateCodexData(data, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('Not A Slug!');
  });

  it('rejects duplicate concept slugs', () => {
    const data = goodData();
    data.concepts[1].slug = 'discipline';
    const result = validateCodexData(data, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('duplicate');
  });

  it('rejects entry refs that do not exist', () => {
    const data = goodData();
    data.concepts[0].entries.push('notes/hallucinated');
    const result = validateCodexData(data, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('notes/hallucinated');
  });

  it('rejects related refs pointing at unknown concepts', () => {
    const data = goodData();
    data.concepts[0].related = ['ghost-concept'];
    const result = validateCodexData(data, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('ghost-concept');
  });

  it('warns (not errors) on unassigned entries and out-of-range concept count', () => {
    const data = goodData();
    data.concepts[1].entries = ['novel/themes/rain'];
    const known = new Set([...KNOWN, 'notes/unassigned-one']);
    const result = validateCodexData(data, known);
    expect(result.ok).toBe(true);
    expect(result.warnings.join(' ')).toContain('notes/unassigned-one');
    expect(result.warnings.join(' ')).toContain('concept count');
  });

  it('rejects a concept with zero entries', () => {
    const data = goodData();
    data.concepts[1].entries = [];
    const result = validateCodexData(data, KNOWN);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('no entries');
  });
});

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

import { stabilizeSlugs } from '../utils/codex/stabilize';
import type { CodexConcept } from '../utils/codex/schema';

function concept(slug: string, name: string, related: string[] = []): CodexConcept {
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
      concept('identity', 'Something Else'),
      concept('the-self', 'Identity'),
    ];
    const result = stabilizeSlugs(old, next);
    const slugs = result.map(c => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

import { resolveCodex, type ResolvedEntry } from '../utils/codex/resolve';

function entry(id: string, publishedAt: string | null, title = id): ResolvedEntry {
  const collection = id.split('/')[0];
  return { id, title, href: `/${id}`, collection, publishedAt, excerpt: `excerpt of ${id}` };
}

function entryMap(...entries: ResolvedEntry[]): Map<string, ResolvedEntry> {
  return new Map(entries.map(e => [e.id, e]));
}

describe('resolveCodex', () => {
  const codex = {
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
    const result = resolveCodex(codex, map);
    expect(result.concepts[0].entries.map(e => e.id)).toEqual(['notes/b', 'notes/a']);
    expect(result.droppedRefs).toEqual(['notes/deleted']);
  });

  it('resolves related concepts to {slug, name} pairs', () => {
    const map = entryMap(entry('notes/a', '2026-06-01'), entry('notes/b', '2026-06-15'));
    const result = resolveCodex(codex, map);
    expect(result.concepts[0].related).toEqual([{ slug: 'rain', name: 'Rain' }]);
  });

  it('loose threads = unassigned entries published after generatedAt', () => {
    const map = entryMap(
      entry('notes/a', '2026-06-01'),
      entry('notes/b', '2026-06-15'),
      entry('notes/new-thought', '2026-07-05'),
      entry('notes/old-unfiled', '2026-01-01'),
      entry('novel/themes/undated', null)
    );
    const result = resolveCodex(codex, map);
    expect(result.looseThreads.map(e => e.id)).toEqual(['notes/new-thought']);
  });

  it('null codex data yields empty concepts and no loose threads', () => {
    const result = resolveCodex(null, entryMap(entry('notes/a', '2026-06-01')));
    expect(result.concepts).toEqual([]);
    expect(result.looseThreads).toEqual([]);
    expect(result.generatedAt).toBeNull();
  });
});

import { gatherCorpus } from '../utils/codex/corpus';

describe('gatherCorpus', () => {
  it('gathers entries from all five sources with well-formed ids', async () => {
    const corpus = await gatherCorpus();
    const byPrefix = (p: string) => corpus.filter(e => e.id.startsWith(p + '/'));
    expect(byPrefix('notes').length).toBeGreaterThan(0);
    expect(byPrefix('showcase').length).toBeGreaterThan(0);
    expect(byPrefix('shelf').length).toBeGreaterThan(0);
    expect(byPrefix('now').length).toBeGreaterThan(0);
    expect(byPrefix('novel').length).toBeGreaterThan(0);
    for (const e of corpus) {
      expect(e.id).toMatch(/^(notes|showcase|shelf|now)\/[a-z0-9-]+$|^novel\/[a-z0-9-]+(\/[a-z0-9-]+)+$/);
      expect(e.title.length).toBeGreaterThan(0);
      expect(typeof e.text).toBe('string');
    }
  });

  it('excludes draft entries', async () => {
    const corpus = await gatherCorpus();
    const ids = corpus.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

import { buildCodexPrompt } from '../utils/codex/prompt';
import { processModelResponse } from '../utils/codex/pipeline';

describe('buildCodexPrompt', () => {
  const corpus = [
    { id: 'notes/a', title: 'On A', tags: ['life'], publishedAt: '2026-06-01T00:00:00.000Z', text: 'body of a' },
  ];

  it('includes instructions, the output schema, and every corpus entry', () => {
    const prompt = buildCodexPrompt(corpus, null);
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
    const prompt = buildCodexPrompt(corpus, existing);
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
    expect(result.data?.concepts[0].slug).toBe('identity');
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
