import { describe, it, expect } from 'vitest';
import {
  easeOut5,
  easeIO,
  easeInQ,
  easeRotSettle,
  easeDecel,
  accentColor,
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
  it('is back-loaded: 0.5 input < 0.1 output', () => {
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

describe('accentColor', () => {
  it('returns blue for /novel', () => {
    expect(accentColor('/novel')).toBe('#7a8fff');
  });
  it('returns blue for /novel/characters/rain', () => {
    expect(accentColor('/novel/characters/rain')).toBe('#7a8fff');
  });
  it('returns gold for /', () => {
    expect(accentColor('/')).toBe('#ffe52c');
  });
  it('returns gold for /shelf', () => {
    expect(accentColor('/shelf')).toBe('#ffe52c');
  });
  it('returns gold for /notes/live-without-regret', () => {
    expect(accentColor('/notes/live-without-regret')).toBe('#ffe52c');
  });
  it('returns gold for /showcase', () => {
    expect(accentColor('/showcase')).toBe('#ffe52c');
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
