import { describe, it, expect } from 'vitest';
import { sortProjects } from '../utils/showcase';

const at = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe('sortProjects', () => {
  it('ranks live projects above archived ones even when the archived one was touched later', () => {
    const order = sortProjects([
      { id: 'kaima', archived: true, publishedAt: at('2026-04-25'), updatedAt: at('2026-10-02') },
      { id: 'utasync', publishedAt: at('2026-08-01') },
    ]).map(p => p.id);

    expect(order).toEqual(['utasync', 'kaima']);
  });

  it('sorts each group newest-first by last activity', () => {
    const order = sortProjects([
      { id: 'old-live', publishedAt: at('2026-01-11') },
      { id: 'new-archived', archived: true, publishedAt: at('2026-10-02') },
      { id: 'new-live', publishedAt: at('2026-02-21'), updatedAt: at('2026-09-01') },
      { id: 'old-archived', archived: true, publishedAt: at('2026-02-07') },
    ]).map(p => p.id);

    expect(order).toEqual(['new-live', 'old-live', 'new-archived', 'old-archived']);
  });

  it('prefers updatedAt over publishedAt as the activity date', () => {
    const order = sortProjects([
      { id: 'recently-revised', publishedAt: at('2026-01-01'), updatedAt: at('2026-11-01') },
      { id: 'published-later', publishedAt: at('2026-06-01') },
    ]).map(p => p.id);

    expect(order).toEqual(['recently-revised', 'published-later']);
  });

  it('places undated entries last within their group rather than dropping them', () => {
    const order = sortProjects([
      { id: 'undated' },
      { id: 'dated', publishedAt: at('2026-03-01') },
    ]).map(p => p.id);

    expect(order).toEqual(['dated', 'undated']);
  });

  it('treats a missing archived flag as live', () => {
    const order = sortProjects([
      { id: 'explicitly-live', archived: false, publishedAt: at('2026-01-01') },
      { id: 'flag-omitted', publishedAt: at('2026-02-01') },
      { id: 'archived', archived: true, publishedAt: at('2026-12-01') },
    ]).map(p => p.id);

    expect(order).toEqual(['flag-omitted', 'explicitly-live', 'archived']);
  });

  it('does not mutate the array it is given', () => {
    const input = [
      { id: 'a', archived: true, publishedAt: at('2026-10-01') },
      { id: 'b', publishedAt: at('2026-01-01') },
    ];
    sortProjects(input);

    expect(input.map(p => p.id)).toEqual(['a', 'b']);
  });
});
