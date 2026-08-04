import { describe, it, expect } from 'vitest';
import {
  wallTier,
  wallShape,
  wallClass,
  wallRotation,
  sortWall,
} from '../utils/shelfWall';

describe('wallTier', () => {
  it('favorites are large even without written content', () => {
    expect(wallTier({ isFavorite: true, hasContent: false })).toBe('large');
  });

  it('written-about non-favorites are medium', () => {
    expect(wallTier({ isFavorite: false, hasContent: true })).toBe('medium');
  });

  it('bare logs are small', () => {
    expect(wallTier({ isFavorite: false, hasContent: false })).toBe('small');
  });
});

describe('wallShape', () => {
  it('music is square', () => {
    expect(wallShape('music')).toBe('square');
  });

  it('everything else is poster', () => {
    for (const t of ['anime', 'manga', 'film', 'series', 'book', 'game', 'character', 'other']) {
      expect(wallShape(t)).toBe('poster');
    }
  });
});

describe('wallClass', () => {
  it('maps tier + shape to a modifier class', () => {
    expect(wallClass('large', 'poster')).toBe('shelf-card--poster-large');
    expect(wallClass('small', 'square')).toBe('shelf-card--square-small');
  });
});

describe('wallRotation', () => {
  it('is deterministic for the same slug', () => {
    expect(wallRotation('persona-4-golden')).toBe(wallRotation('persona-4-golden'));
  });

  it('stays within ±1.5 degrees', () => {
    const slugs = ['a', 'bocchi-the-rock', 'ttgl', 'set-it-off', 'veil', 'x'.repeat(80)];
    for (const s of slugs) {
      expect(Math.abs(wallRotation(s))).toBeLessThanOrEqual(1.5);
    }
  });

  it('spreads across slugs (not all identical)', () => {
    const values = new Set(
      Array.from({ length: 20 }, (_, i) => wallRotation(`slug-${i}`)),
    );
    expect(values.size).toBeGreaterThanOrEqual(5);
  });
});

describe('sortWall', () => {
  const e = (title: string, date: string | null) => ({
    title,
    date: date ? new Date(date) : null,
  });

  it('sorts newest first by date', () => {
    const result = sortWall([e('old', '2020-01-01'), e('new', '2025-06-01')]);
    expect(result.map(x => x.title)).toEqual(['new', 'old']);
  });

  it('puts undated entries last', () => {
    const result = sortWall([e('undated', null), e('dated', '2020-01-01')]);
    expect(result.map(x => x.title)).toEqual(['dated', 'undated']);
  });

  it('tie-breaks equal/missing dates by title', () => {
    const result = sortWall([e('zeta', null), e('alpha', null)]);
    expect(result.map(x => x.title)).toEqual(['alpha', 'zeta']);
  });

  it('does not mutate its input', () => {
    const input = [e('b', '2020-01-01'), e('a', '2025-01-01')];
    sortWall(input);
    expect(input[0].title).toBe('b');
  });
});
