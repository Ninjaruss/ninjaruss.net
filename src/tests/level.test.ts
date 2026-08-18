import { describe, it, expect } from 'vitest';
import { LEVEL_WORD_UNIT, countMarkdownWords, computeSiteWordCount, computeSiteLevel } from '../utils/level';

describe('countMarkdownWords', () => {
  it('returns 0 for an empty string', () => {
    expect(countMarkdownWords('')).toBe(0);
  });

  it('strips markdown syntax before counting', () => {
    expect(countMarkdownWords('Hello **world**, this is *great*.')).toBe(5);
  });

  it('strips headings and collapses whitespace across lines', () => {
    const md = '# Heading\n\nSome words here.';
    expect(countMarkdownWords(md)).toBe(3);
  });
});

describe('computeSiteWordCount', () => {
  it('sums story words and every journal body', () => {
    const total = computeSiteWordCount(1000, [
      '# Heading\nSome words here.',
      'More content in second body.',
    ]);
    expect(total).toBe(1008);
  });

  it('returns just the story words when there are no journal bodies', () => {
    expect(computeSiteWordCount(500, [])).toBe(500);
  });
});

describe('computeSiteLevel', () => {
  it('floors at level 1 for zero words', () => {
    expect(computeSiteLevel(0)).toBe(1);
  });

  it('floors at level 1 for any total under one word-unit', () => {
    expect(computeSiteLevel(LEVEL_WORD_UNIT - 1)).toBe(1);
  });

  it('reaches level 2 at 4 word-units (sqrt(4)=2)', () => {
    expect(computeSiteLevel(LEVEL_WORD_UNIT * 4)).toBe(2);
  });

  it('reaches level 3 at 9 word-units (sqrt(9)=3)', () => {
    expect(computeSiteLevel(LEVEL_WORD_UNIT * 9)).toBe(3);
  });

  it('matches the site\'s current pace: ~21k combined words is around level 8', () => {
    expect(computeSiteLevel(21000)).toBe(8);
  });

  it('is monotonic and never decays as words increase', () => {
    let prev = 0;
    for (let words = 0; words <= 200_000; words += 137) {
      const level = computeSiteLevel(words);
      expect(level).toBeGreaterThanOrEqual(prev);
      prev = level;
    }
  });

  it('never returns a level below 1 for negative input', () => {
    expect(computeSiteLevel(-50)).toBe(1);
  });
});
