import { describe, it, expect } from 'vitest';
import { publicNotes } from '../utils/notes';

const note = (slug: string, publishedAt?: string, draft = false) => ({
  slug, data: { title: slug, publishedAt: publishedAt ? new Date(publishedAt) : undefined, draft },
});

describe('public writing archive', () => {
  it('excludes drafts and the separately published practice journal', () => {
    expect(publicNotes([note('draft', '2027-01-01', true), note('jp-journal', '2026-04-26'), note('essay')])
      .map(entry => entry.slug)).toEqual(['essay']);
  });

  it('uses original publication order, leaves undated pieces last, and preserves the input', () => {
    const entries = [note('undated'), note('old', '2026-01-01'), note('new', '2026-08-24')];
    expect(publicNotes(entries).map(entry => entry.slug)).toEqual(['new', 'old', 'undated']);
    expect(entries[0].slug).toBe('undated');
  });
});
