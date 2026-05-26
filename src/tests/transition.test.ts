import { describe, it, expect } from 'vitest';
import {
  easeOut5,
  easeIO,
  easeInQ,
  easeRotSettle,
  easeDecel,
  statForPath,
  computeTextFit,
  isSamePage,
  computeWipeGeometry,
} from '../scripts/transition';

describe('easeOut5', () => {
  it('returns 0 at t=0', () => expect(easeOut5(0)).toBe(0));
  it('returns 1 at t=1', () => expect(easeOut5(1)).toBe(1));
  it('is front-loaded: 0.5 input > 0.9 output', () => {
    expect(easeOut5(0.5)).toBeGreaterThan(0.9);
  });
  it('stays between 0 and 1 for t in (0,1)', () => {
    expect(easeOut5(0.3)).toBeGreaterThan(0);
    expect(easeOut5(0.3)).toBeLessThan(1);
  });
});

describe('easeIO', () => {
  it('returns 0 at t=0', () => expect(easeIO(0)).toBe(0));
  it('returns 0.5 at t=0.5', () => expect(easeIO(0.5)).toBe(0.5));
  it('returns 1 at t=1', () => expect(easeIO(1)).toBe(1));
  it('is symmetric: easeIO(0.3) ≈ 1 - easeIO(0.7)', () => {
    expect(easeIO(0.3)).toBeCloseTo(1 - easeIO(0.7), 10);
  });
});

describe('easeInQ', () => {
  it('returns 0 at t=0', () => expect(easeInQ(0)).toBe(0));
  it('returns 1 at t=1', () => expect(easeInQ(1)).toBe(1));
  it('is back-loaded: output at t=0.5 is below 0.1', () => {
    expect(easeInQ(0.5)).toBeLessThan(0.1);
  });
});

describe('easeRotSettle', () => {
  it('returns 0 at t=0', () => expect(easeRotSettle(0)).toBe(0));
  it('returns 1 at t=1', () => expect(easeRotSettle(1)).toBe(1));
  it('is slower than easeOut5 at midpoint', () => {
    expect(easeRotSettle(0.5)).toBeLessThan(easeOut5(0.5));
  });
});

describe('easeDecel', () => {
  it('returns ~0 at t=0', () => expect(easeDecel(0)).toBeCloseTo(0, 5));
  it('returns ~1 at t=1', () => expect(easeDecel(1)).toBeCloseTo(1, 5));
  it('covers 88% of distance in first 55% of time', () => {
    expect(easeDecel(0.55)).toBeCloseTo(0.88, 2);
  });
  it('output increases monotonically', () => {
    expect(easeDecel(0.3)).toBeLessThan(easeDecel(0.6));
    expect(easeDecel(0.6)).toBeLessThan(easeDecel(0.9));
  });
});

describe('statForPath', () => {
  it('returns Insight for /notes', () => {
    expect(statForPath('/notes').color).toBe('#4ab0ff');
    expect(statForPath('/notes').name).toBe('INSIGHT');
  });
  it('returns Insight for /notes/slug', () => {
    expect(statForPath('/notes/live-without-regret').color).toBe('#4ab0ff');
  });
  it('returns Expression for /novel', () => {
    expect(statForPath('/novel').color).toBe('#a855f7');
    expect(statForPath('/novel').name).toBe('EXPRESSION');
  });
  it('returns Expression for /novel/characters/rain', () => {
    expect(statForPath('/novel/characters/rain').color).toBe('#a855f7');
  });
  it('returns Sincerity for /shelf', () => {
    expect(statForPath('/shelf').color).toBe('#ffe52c');
    expect(statForPath('/shelf').name).toBe('SINCERITY');
  });
  it('returns Sincerity for /shelf/slug', () => {
    expect(statForPath('/shelf/some-anime').color).toBe('#ffe52c');
  });
  it('returns Chaos for /stream', () => {
    expect(statForPath('/stream').color).toBe('#2dd4bf');
    expect(statForPath('/stream').name).toBe('CHAOS');
  });
  it('returns Determination for /showcase', () => {
    expect(statForPath('/showcase').color).toBe('#ff4040');
    expect(statForPath('/showcase').name).toBe('DETERMINATION');
  });
  it('returns Sincerity for /now', () => {
    expect(statForPath('/now').color).toBe('#ffe52c');
    expect(statForPath('/now').name).toBe('SINCERITY');
  });
  it('returns Sincerity for /', () => {
    expect(statForPath('/').color).toBe('#ffe52c');
  });
  it('does not match /nowhere as /now', () => {
    expect(statForPath('/nowhere').color).toBe('#ff4040'); // fallback: Determination
  });
  it('returns Determination fallback for unknown route', () => {
    expect(statForPath('/unknown/deep/path').color).toBe('#ff4040');
    expect(statForPath('/unknown/deep/path').name).toBe('DETERMINATION');
  });
  it('img is null in test environment (images never preloaded)', () => {
    expect(statForPath('/shelf').img).toBeNull();
  });
});

describe('computeTextFit', () => {
  // Mock ctx: width proportional to font size parsed from ctx.font
  const mockCtx = {
    font: '',
    measureText(text: string) {
      const match = this.font.match(/(\d+(?:\.\d+)?)px/);
      const px = match ? parseFloat(match[1]) : 12;
      return { width: text.length * px };
    },
  } as unknown as CanvasRenderingContext2D;

  it('returns basePx when text fits within maxWidth', () => {
    // 'CHAOS' = 5 chars, at size 7: 5 * 7 = 35px ≤ 100 → fits at basePx 7
    expect(computeTextFit(mockCtx, 'CHAOS', 100, 7)).toBe(7);
  });
  it('returns reduced size when text exceeds maxWidth', () => {
    // 'DETERMINATION' = 13 chars, maxWidth 76, basePx 7
    // At size 7: 13 * 7 = 91 > 76 → shrink
    // At size 5.5: 13 * 5.5 = 71.5 ≤ 76 → stop at 5.5
    const size = computeTextFit(mockCtx, 'DETERMINATION', 76, 7);
    expect(size).toBeCloseTo(5.5, 1);
  });
  it('never returns below 5', () => {
    // tiny maxWidth forces it to floor
    // At size 5: 13 * 5 = 65 > 1 → still doesn't fit, but hits floor at 5
    const size = computeTextFit(mockCtx, 'DETERMINATION', 1, 7);
    expect(size).toBe(5);
  });
});

describe('isSamePage', () => {
  it('returns true for identical pathnames', () => {
    expect(isSamePage('/shelf', '/shelf')).toBe(true);
  });
  it('returns false for different pathnames', () => {
    expect(isSamePage('/shelf', '/notes')).toBe(false);
  });
  it('returns false for / vs /shelf', () => {
    expect(isSamePage('/', '/shelf')).toBe(false);
  });
});

describe('computeWipeGeometry', () => {
  it('slant increases with H', () => {
    const a = computeWipeGeometry(1000, 500);
    const b = computeWipeGeometry(1000, 1000);
    expect(b.slant).toBeGreaterThan(a.slant);
  });
  it('travel is larger than W', () => {
    const { travel } = computeWipeGeometry(1440, 900);
    expect(travel).toBeGreaterThan(1440);
  });
  it('slabW = W * 0.28 + slant', () => {
    const W = 1440, H = 900;
    const { slant, slabW } = computeWipeGeometry(W, H);
    expect(slabW).toBeCloseTo(W * 0.28 + slant, 10);
  });
  it('slant is positive', () => {
    const { slant } = computeWipeGeometry(1440, 900);
    expect(slant).toBeGreaterThan(0);
  });
});
