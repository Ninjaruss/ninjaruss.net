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

import { nowLine } from '../utils/profile';

const nowEntry = (title: string, iso: string, draft = false) => ({
  data: { title, publishedAt: new Date(iso), draft },
});

describe('nowLine', () => {
  it('returns null for an empty collection', () => {
    expect(nowLine([])).toBeNull();
  });

  it('returns the newest entry title linked to /now', () => {
    const entries = [
      nowEntry('Older thing', '2026-06-01'),
      nowEntry('Go 日本語 Go!!!', '2026-08-01'),
      nowEntry('Middle thing', '2026-07-01'),
    ];
    expect(nowLine(entries)).toEqual({ title: 'Go 日本語 Go!!!', href: '/now' });
  });

  it('ignores drafts', () => {
    const entries = [
      nowEntry('Published', '2026-06-01'),
      nowEntry('Secret', '2026-08-01', true),
    ];
    expect(nowLine(entries)).toEqual({ title: 'Published', href: '/now' });
  });

  it('returns null when every entry is a draft', () => {
    expect(nowLine([nowEntry('Secret', '2026-08-01', true)])).toBeNull();
  });

  it('returns null when the newest title is blank', () => {
    expect(nowLine([nowEntry('   ', '2026-08-01')])).toBeNull();
  });

  it('skips entries with an unparseable date', () => {
    const entries = [
      nowEntry('Good', '2026-06-01'),
      { data: { title: 'Broken', publishedAt: new Date('not a date'), draft: false } },
    ];
    expect(nowLine(entries)).toEqual({ title: 'Good', href: '/now' });
  });
});
