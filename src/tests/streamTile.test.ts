import { describe, it, expect } from 'vitest';
import { buildDonutArcs, STAT_ORDER } from '../utils/stream';

describe('buildDonutArcs', () => {
  it('returns one arc per stat in STAT_ORDER', () => {
    const arcs = buildDonutArcs({ Determination: 1 }, 10);
    expect(arcs).toHaveLength(STAT_ORDER.length);
    expect(arcs.map(a => a.stat)).toEqual([...STAT_ORDER]);
  });

  it('gives zero-length arcs when all tallies are 0', () => {
    const arcs = buildDonutArcs({}, 10);
    arcs.forEach(arc => expect(arc.dasharray).toMatch(/^0\.00 /));
  });

  it('first arc starts at dashoffset 0', () => {
    const arcs = buildDonutArcs({ Determination: 4, Insight: 2 }, 10);
    expect(arcs[0].dashoffset).toBe(0);
  });

  it('later arcs have negative dashoffsets', () => {
    const arcs = buildDonutArcs({ Determination: 1, Insight: 1 }, 10, 3);
    expect(arcs[1].dashoffset).toBeLessThan(0);
  });

  it('proportions arcs to tally share', () => {
    // Determination=2, Insight=2, rest=0 — DET and INS get equal arc lengths
    const arcs = buildDonutArcs({ Determination: 2, Insight: 2 }, 10, 0);
    const detLen = parseFloat(arcs[0].dasharray.split(' ')[0]);
    const insLen = parseFloat(arcs[1].dasharray.split(' ')[0]);
    expect(detLen).toBeCloseTo(insLen, 1);
  });

  it('zero-count arcs do not consume gap space', () => {
    // Expression has 0 count — its dashoffset should equal Insight's
    const arcs = buildDonutArcs({ Determination: 1, Insight: 1 }, 10, 3);
    // Expression (index 2) has 0 count, so offsets for index 2, 3, 4 are all equal
    expect(arcs[2].dashoffset).toBe(arcs[3].dashoffset);
    expect(arcs[3].dashoffset).toBe(arcs[4].dashoffset);
  });
});
