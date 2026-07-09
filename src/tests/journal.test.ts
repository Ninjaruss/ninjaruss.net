import { describe, it, expect } from 'vitest';
import { mergeJournalEntries } from '../utils/journalMerge';

const entry = (slug: string, publishedAt: string, updatedAt?: string) => ({
  slug,
  body: '',
  data: {
    title: slug,
    tags: [],
    publishedAt: new Date(publishedAt),
    ...(updatedAt ? { updatedAt: new Date(updatedAt) } : {}),
  },
});

describe('mergeJournalEntries', () => {
  it('interleaves notes and showcase by effective date, newest first', () => {
    const notes = [entry('old-note', '2026-01-01'), entry('new-note', '2026-07-01')];
    const showcase = [entry('mid-inquiry', '2026-03-01')];
    const merged = mergeJournalEntries(notes as any, showcase as any);
    expect(merged.map(m => m.entry.slug)).toEqual(['new-note', 'mid-inquiry', 'old-note']);
  });

  it('tags each item with type and href', () => {
    const merged = mergeJournalEntries([entry('a', '2026-01-01')] as any, [entry('b', '2026-02-01')] as any);
    expect(merged[0]).toMatchObject({ type: 'showcase', href: '/showcase/b' });
    expect(merged[1]).toMatchObject({ type: 'note', href: '/notes/a' });
  });

  it('prefers updatedAt over publishedAt for ordering', () => {
    const notes = [entry('bumped', '2026-01-01', '2026-06-01')];
    const showcase = [entry('newer-pub', '2026-03-01')];
    const merged = mergeJournalEntries(notes as any, showcase as any);
    expect(merged[0].entry.slug).toBe('bumped');
  });
});
