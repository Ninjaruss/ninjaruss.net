import { describe, it, expect } from 'vitest';
import { pickProfile, profileSchema } from '../utils/profile';

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

  it('does not treat about-me as the named entry', () => {
    const entries = [{ id: 'about-me.md' }, { id: 'aaa.md' }];
    expect(pickProfile(entries)).toEqual({ id: 'aaa.md' });
  });
});

const validProfile = {
  hook: 'I decide on a whim and figure out the logistics after.',
  credentials: ['B.S. Computer Science, 2021'],
  makes: [{ label: 'Remember Rain', blurb: 'The visual novel', href: '/novel' }],
  makesMore: { text: 'plus whatever is next', href: '/showcase' },
  subjects: [{ group: 'the self', items: ['Commitment', 'Avoidance'] }],
  connect: 'Open to collaboration',
  links: [{ label: 'YouTube', href: 'https://youtube.com/@x', primary: true }],
};

describe('profileSchema', () => {
  it('accepts a fully populated profile', () => {
    expect(profileSchema.parse(validProfile)).toEqual(validProfile);
  });

  it('rejects an empty hook', () => {
    expect(() => profileSchema.parse({ hook: '' })).toThrow();
  });

  it('defaults every list to empty so a minimal file still renders', () => {
    const parsed = profileSchema.parse({ hook: 'just a hook' });
    expect(parsed.credentials).toEqual([]);
    expect(parsed.makes).toEqual([]);
    expect(parsed.subjects).toEqual([]);
    expect(parsed.links).toEqual([]);
    expect(parsed.makesMore).toBeUndefined();
    expect(parsed.connect).toBeUndefined();
  });

  it('defaults link.primary to false', () => {
    const parsed = profileSchema.parse({
      hook: 'h',
      links: [{ label: 'Twitch', href: 'https://twitch.tv/x' }],
    });
    expect(parsed.links[0].primary).toBe(false);
  });

  it('rejects a makes row missing its label', () => {
    expect(() =>
      profileSchema.parse({ hook: 'h', makes: [{ blurb: 'b', href: '/x' }] })
    ).toThrow();
  });

  it('rejects a subject group missing its items', () => {
    expect(() =>
      profileSchema.parse({ hook: 'h', subjects: [{ group: 'the self' }] })
    ).toThrow();
  });

  it('requires a hook', () => {
    expect(() => profileSchema.parse({})).toThrow();
  });
});
