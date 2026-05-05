import { describe, it, expect } from 'vitest';
import {
  filterEntries,
  parseFilterState,
  buildFilterURL,
} from '../utils/mediaGrid/filterEngine';

// ─── Test data ──────────────────────────────────────────────────────────────

const entries = [
  { slug: 'a', type: 'anime', isFavorite: true },
  { slug: 'b', type: 'anime', isFavorite: false },
  { slug: 'c', type: 'manga', isFavorite: true },
  { slug: 'd', type: 'film', isFavorite: false },
  { slug: 'e', type: 'music', isFavorite: true },
];

// ─── filterEntries ───────────────────────────────────────────────────────────

describe('filterEntries', () => {
  it('returns all entries when type is "all" and favOnly is false', () => {
    const result = filterEntries(entries, { type: 'all', favOnly: false });
    expect(result).toHaveLength(5);
  });

  it('filters by type', () => {
    const result = filterEntries(entries, { type: 'anime', favOnly: false });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.type === 'anime')).toBe(true);
  });

  it('filters by favOnly', () => {
    const result = filterEntries(entries, { type: 'all', favOnly: true });
    expect(result).toHaveLength(3);
    expect(result.every((e) => e.isFavorite)).toBe(true);
  });

  it('stacks type + favOnly filters', () => {
    const result = filterEntries(entries, { type: 'anime', favOnly: true });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('a');
  });

  it('returns empty array when no entries match', () => {
    const result = filterEntries(entries, { type: 'book', favOnly: false });
    expect(result).toHaveLength(0);
  });
});

// ─── parseFilterState ────────────────────────────────────────────────────────

describe('parseFilterState', () => {
  it('returns defaults for empty search string', () => {
    const state = parseFilterState('');
    expect(state).toEqual({ type: 'all', favOnly: false });
  });

  it('parses type param', () => {
    const state = parseFilterState('?type=anime');
    expect(state.type).toBe('anime');
  });

  it('parses fav=1 as favOnly true', () => {
    const state = parseFilterState('?fav=1');
    expect(state.favOnly).toBe(true);
  });

  it('parses combined params', () => {
    const state = parseFilterState('?type=manga&fav=1');
    expect(state).toEqual({ type: 'manga', favOnly: true });
  });

  it('treats missing type param as "all"', () => {
    const state = parseFilterState('?fav=1');
    expect(state.type).toBe('all');
  });
});

// ─── buildFilterURL ──────────────────────────────────────────────────────────

describe('buildFilterURL', () => {
  it('returns empty string for default state', () => {
    const url = buildFilterURL({ type: 'all', favOnly: false });
    expect(url).toBe('');
  });

  it('includes type param when not "all"', () => {
    const url = buildFilterURL({ type: 'anime', favOnly: false });
    expect(url).toBe('?type=anime');
  });

  it('includes fav=1 when favOnly is true', () => {
    const url = buildFilterURL({ type: 'all', favOnly: true });
    expect(url).toBe('?fav=1');
  });

  it('combines type and fav params', () => {
    const url = buildFilterURL({ type: 'manga', favOnly: true });
    expect(url).toBe('?type=manga&fav=1');
  });
});
