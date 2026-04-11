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
