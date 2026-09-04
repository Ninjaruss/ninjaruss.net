import { describe, it, expect } from 'vitest';
import { resolveNoteRedirect } from '../utils/noteRedirect';
import { SUBSTACK_ARCHIVE_URL } from '../utils/substack';

const entries = [
  { slug: 'addiction', substackUrl: 'https://ninjaruss.substack.com/p/addiction' },
  { slug: 'gratitude' },
];

describe('resolveNoteRedirect', () => {
  it('sends a backfilled note to its Substack post', () => {
    expect(resolveNoteRedirect('addiction', entries)).toBe(
      'https://ninjaruss.substack.com/p/addiction'
    );
  });

  it('falls back to the archive for a note with no substackUrl yet', () => {
    expect(resolveNoteRedirect('gratitude', entries)).toBe(SUBSTACK_ARCHIVE_URL);
  });

  it('falls back to the archive for an unknown slug', () => {
    expect(resolveNoteRedirect('never-existed', entries)).toBe(SUBSTACK_ARCHIVE_URL);
  });

  it('falls back to the archive for the bare /notes path (empty slug)', () => {
    expect(resolveNoteRedirect('', entries)).toBe(SUBSTACK_ARCHIVE_URL);
  });

  it('ignores a trailing slash on the slug', () => {
    expect(resolveNoteRedirect('addiction/', entries)).toBe(
      'https://ninjaruss.substack.com/p/addiction'
    );
  });
});
