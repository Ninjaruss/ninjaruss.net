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
