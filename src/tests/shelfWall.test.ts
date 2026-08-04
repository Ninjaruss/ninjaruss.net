import { describe, it, expect } from 'vitest';
import {
  wallTier,
  wallShape,
  wallClass,
  wallRotation,
  sortWall,
  resolveInitialFilter,
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

describe('resolveInitialFilter', () => {
  const present = new Set(['music', 'anime', 'film']);

  it('honours ?type= when present on the wall', () => {
    expect(resolveInitialFilter('?type=music', '', present)).toEqual({
      type: 'music',
      rewrite: true,
    });
  });

  it('falls back to All (no scrub) for a ?type= absent from the wall', () => {
    expect(resolveInitialFilter('?type=bogus', '', present)).toEqual({
      type: '',
      rewrite: false,
    });
  });

  it('honours a legacy #section-<type> hash when present on the wall', () => {
    expect(resolveInitialFilter('', '#section-anime', present)).toEqual({
      type: 'anime',
      rewrite: true,
    });
  });

  it('scrubs the URL for a legacy hash whose type is absent from the wall', () => {
    expect(resolveInitialFilter('', '#section-bogus', present)).toEqual({
      type: '',
      rewrite: true,
    });
  });

  it('prefers ?type= over a legacy hash when both are present', () => {
    expect(resolveInitialFilter('?type=music', '#section-anime', present)).toEqual({
      type: 'music',
      rewrite: true,
    });
  });

  it('is a no-op with no search and no hash', () => {
    expect(resolveInitialFilter('', '', present)).toEqual({
      type: '',
      rewrite: false,
    });
  });

  it('ignores a hash that does not match the #section-<type> pattern', () => {
    expect(resolveInitialFilter('', '#section-Anime', present)).toEqual({
      type: '',
      rewrite: false,
    });
    expect(resolveInitialFilter('', '#anime', present)).toEqual({
      type: '',
      rewrite: false,
    });
  });
});
