import { describe, it, expect } from 'vitest';
import { pickDrawCandidate } from '../utils/splitView/drawCard';

interface Candidate {
  slug: string;
  type: string;
}

const items: Candidate[] = [
  { slug: 'note-a', type: 'note' },
  { slug: 'showcase-a', type: 'showcase' },
  { slug: 'note-b', type: 'note' },
];

describe('pickDrawCandidate', () => {
  it('only ever draws notes', () => {
    for (let i = 0; i < 20; i++) {
      const picked = pickDrawCandidate(items, Math.random);
      expect(picked?.type).toBe('note');
    }
  });

  it('is uniform over the note pool via the injected rng', () => {
    expect(pickDrawCandidate(items, () => 0)?.slug).toBe('note-a');
    expect(pickDrawCandidate(items, () => 0.99)?.slug).toBe('note-b');
  });

  it('avoids the excluded slug when another note exists', () => {
    const picked = pickDrawCandidate(items, () => 0, 'note-a');
    expect(picked?.slug).toBe('note-b');
  });

  it('returns the sole note even if excluded (redraw beats dead button)', () => {
    const pool: Candidate[] = [{ slug: 'only', type: 'note' }];
    expect(pickDrawCandidate(pool, () => 0, 'only')?.slug).toBe('only');
  });

  it('returns null when no notes exist', () => {
    expect(pickDrawCandidate([{ slug: 's', type: 'showcase' }], () => 0)).toBeNull();
  });
});
