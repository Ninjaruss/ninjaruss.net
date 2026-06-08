import { describe, it, expect } from 'vitest';
import { sortShelfSection } from '../utils/shelf';

type E = { isFavorite: boolean; hasContent: boolean; date: Date | null; label: string };

describe('sortShelfSection', () => {
  it('places favorites before non-favorites regardless of date', () => {
    const entries: E[] = [
      { isFavorite: false, hasContent: true,  date: new Date('2025-01-01'), label: 'reviewed' },
      { isFavorite: true,  hasContent: false, date: new Date('2020-01-01'), label: 'fav-old' },
    ];
    const result = sortShelfSection(entries);
    expect(result[0].label).toBe('fav-old');
  });

  it('places reviewed (hasContent) before unreviewed within non-favorites', () => {
    const entries: E[] = [
      { isFavorite: false, hasContent: false, date: new Date('2025-06-01'), label: 'unreviewed-new' },
      { isFavorite: false, hasContent: true,  date: new Date('2020-01-01'), label: 'reviewed-old' },
    ];
    const result = sortShelfSection(entries);
    expect(result[0].label).toBe('reviewed-old');
  });

  it('sorts by date descending within each tier', () => {
    const entries: E[] = [
      { isFavorite: true, hasContent: true, date: new Date('2023-01-01'), label: 'fav-old' },
      { isFavorite: true, hasContent: true, date: new Date('2025-06-01'), label: 'fav-new' },
    ];
    const result = sortShelfSection(entries);
    expect(result[0].label).toBe('fav-new');
  });

  it('treats null date as oldest (sorts to end of tier)', () => {
    const entries: E[] = [
      { isFavorite: false, hasContent: true, date: null,                   label: 'no-date' },
      { isFavorite: false, hasContent: true, date: new Date('2024-01-01'), label: 'has-date' },
    ];
    const result = sortShelfSection(entries);
    expect(result[0].label).toBe('has-date');
  });

  it('returns empty array unchanged', () => {
    expect(sortShelfSection([])).toEqual([]);
  });

  it('favorites with no content are not dimmed (isFavorite takes priority)', () => {
    const entries: E[] = [
      { isFavorite: false, hasContent: true,  date: new Date('2025-01-01'), label: 'reviewed' },
      { isFavorite: true,  hasContent: false, date: new Date('2020-01-01'), label: 'fav-no-content' },
    ];
    const result = sortShelfSection(entries);
    expect(result[0].label).toBe('fav-no-content');
  });
});
