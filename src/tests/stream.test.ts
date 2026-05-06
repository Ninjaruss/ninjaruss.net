import { describe, it, expect } from 'vitest';
import { tallyStats, buildRadarPoints, buildGuidePoints, parseQuestMenu, STAT_ORDER } from '../utils/stream';
import { parseTwitchLiveResponse } from '../utils/twitchStatus';

const makeEntry = (publishedAt: string, stats: string[]) => ({
  data: { publishedAt: new Date(publishedAt), stats },
});

describe('STAT_ORDER', () => {
  it('has exactly 5 stats', () => {
    expect(STAT_ORDER).toHaveLength(5);
  });
});

describe('tallyStats', () => {
  it('counts all occurrences in all mode', () => {
    const entries = [
      makeEntry('2026-01-01', ['Determination', 'Insight']),
      makeEntry('2026-01-02', ['Determination']),
    ];
    const tally = tallyStats(entries, 'all');
    expect(tally['Determination']).toBe(2);
    expect(tally['Insight']).toBe(1);
    expect(tally['Expression']).toBeUndefined();
  });

  it('limits to 10 most recent in recent mode', () => {
    const entries = Array.from({ length: 12 }, (_, i) =>
      makeEntry(`2026-01-${String(i + 1).padStart(2, '0')}`, ['Determination'])
    );
    entries.push(makeEntry('2025-06-01', ['Insight']));
    const tally = tallyStats(entries, 'recent');
    expect(tally['Determination']).toBe(10);
    expect(tally['Insight']).toBeUndefined();
  });

  it('returns empty object for empty entries', () => {
    expect(tallyStats([], 'all')).toEqual({});
  });
});

describe('buildRadarPoints', () => {
  it('returns a string of 5 coordinate pairs', () => {
    const tallies = { Determination: 2, Insight: 1 };
    const points = buildRadarPoints(tallies, 2, 150, 150, 120);
    const pairs = points.trim().split(' ');
    expect(pairs).toHaveLength(5);
    pairs.forEach(pair => {
      expect(pair).toMatch(/^-?\d+\.\d+,-?\d+\.\d+$/);
    });
  });

  it('returns center point for all zero counts', () => {
    const tallies: Record<string, number> = {};
    const points = buildRadarPoints(tallies, 1, 150, 150, 120);
    points.trim().split(' ').forEach(pair => {
      const [x, y] = pair.split(',').map(Number);
      expect(x).toBeCloseTo(150, 0);
      expect(y).toBeCloseTo(150, 0);
    });
  });

  it('handles maxVal of 0 without dividing by zero', () => {
    expect(() => buildRadarPoints({}, 0, 150, 150, 120)).not.toThrow();
  });
});

describe('buildGuidePoints', () => {
  it('returns 5 coordinate pairs at given fraction', () => {
    const points = buildGuidePoints(0.5, 150, 150, 120);
    const pairs = points.trim().split(' ');
    expect(pairs).toHaveLength(5);
  });
});

describe('parseQuestMenu', () => {
  it('parses headings as categories', () => {
    const md = `## Active\n- Quest one\n- Quest two\n\n## Done\n- Quest three`;
    const result = parseQuestMenu(md);
    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('Active');
    expect(result[0].quests).toEqual(['Quest one', 'Quest two']);
    expect(result[1].category).toBe('Done');
    expect(result[1].quests).toEqual(['Quest three']);
  });

  it('returns empty array for empty string', () => {
    expect(parseQuestMenu('')).toEqual([]);
  });

  it('ignores lines that are not headings or list items', () => {
    const md = `## Active\nsome prose line\n- Valid quest`;
    const result = parseQuestMenu(md);
    expect(result[0].quests).toEqual(['Valid quest']);
  });
});

describe('parseTwitchLiveResponse', () => {
  it('returns true when data array is non-empty', () => {
    expect(parseTwitchLiveResponse({ data: [{ type: 'live' }] })).toBe(true);
  });

  it('returns false when data array is empty', () => {
    expect(parseTwitchLiveResponse({ data: [] })).toBe(false);
  });

  it('returns false for null input', () => {
    expect(parseTwitchLiveResponse(null)).toBe(false);
  });

  it('returns false for malformed response', () => {
    expect(parseTwitchLiveResponse({ items: ['something'] })).toBe(false);
  });
});
