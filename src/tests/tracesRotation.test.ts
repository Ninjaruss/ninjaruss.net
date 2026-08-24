import { describe, it, expect } from 'vitest';
import { bandRotation } from '../utils/tracesRotation';

describe('bandRotation', () => {
  it('is deterministic for the same id', () => {
    expect(bandRotation(42)).toBe(bandRotation(42));
  });

  it('stays within ±4 degrees', () => {
    for (const id of [1, 2, 3, 100, 9999, 123456]) {
      expect(Math.abs(bandRotation(id))).toBeLessThanOrEqual(4);
    }
  });

  it('spreads across ids (not all identical)', () => {
    const values = new Set(Array.from({ length: 20 }, (_, i) => bandRotation(i + 1)));
    expect(values.size).toBeGreaterThanOrEqual(5);
  });
});
