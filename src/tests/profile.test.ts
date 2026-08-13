import { describe, it, expect } from 'vitest';
import { pickProfile } from '../utils/profile';

describe('pickProfile', () => {
  it('returns null when the collection is empty', () => {
    expect(pickProfile([])).toBeNull();
  });

  it('prefers the entry whose id is about', () => {
    const entries = [{ id: 'draft.md' }, { id: 'about.md' }];
    expect(pickProfile(entries)).toEqual({ id: 'about.md' });
  });

  it('matches about.mdx as well as about.md', () => {
    expect(pickProfile([{ id: 'about.mdx' }])).toEqual({ id: 'about.mdx' });
  });

  it('falls back to the alphabetically first entry when no about exists', () => {
    const entries = [{ id: 'zeta.md' }, { id: 'alpha.md' }];
    expect(pickProfile(entries)).toEqual({ id: 'alpha.md' });
  });
});
