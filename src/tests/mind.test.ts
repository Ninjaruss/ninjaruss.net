import { describe, it, expect } from 'vitest';
import { validateMindData, type MindData } from '../utils/mind/schema';
import { extractJsonBlock } from '../utils/mind/json';

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
    data.concepts[1].entries = ['novel/themes/rain'];
    const known = new Set([...KNOWN, 'notes/unassigned-one']);
    const result = validateMindData(data, known);
    expect(result.ok).toBe(true);
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
      concept('identity', 'Something Else'),
      concept('the-self', 'Identity'),
    ];
    const result = stabilizeSlugs(old, next);
    const slugs = result.map(c => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

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
    expect(result.concepts[0].entries.map(e => e.id)).toEqual(['notes/b', 'notes/a']);
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
      entry('notes/new-thought', '2026-07-05'),
      entry('notes/old-unfiled', '2026-01-01'),
      entry('novel/themes/undated', null)
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
