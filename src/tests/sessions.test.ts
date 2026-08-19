import { describe, it, expect } from 'vitest';
import { STAT_ORDER, hexToRgbTriplet, STAT_COLORS } from '../utils/sessions';
import { parseTwitchLiveResponse } from '../utils/twitchStatus';

describe('STAT_ORDER', () => {
  it('has exactly 5 stats', () => {
    expect(STAT_ORDER).toHaveLength(5);
  });
});

describe('STAT_COLORS', () => {
  it('covers STAT_ORDER exactly — no missing stat, no stray key', () => {
    expect(Object.keys(STAT_COLORS).sort()).toEqual([...STAT_ORDER].sort());
  });

  it('is a 6-digit hex per stat', () => {
    for (const stat of STAT_ORDER) {
      expect(STAT_COLORS[stat]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('hexToRgbTriplet', () => {
  it('splits a hex into its channels', () => {
    expect(hexToRgbTriplet('#ff4040')).toEqual([255, 64, 64]);
    expect(hexToRgbTriplet('#2dd4bf')).toEqual([45, 212, 191]);
    expect(hexToRgbTriplet('#000000')).toEqual([0, 0, 0]);
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
