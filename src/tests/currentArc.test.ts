import { describe, it, expect } from 'vitest';
import { parseCurrentArc } from '../utils/currentArc';

const wellFormed = [
  '## The Question',
  '',
  'Some other section content that must not leak in.',
  '',
  '## Current Arc',
  '',
  '**Arc:** Arc II — Learning to Speak',
  '**Stat:** Insight',
  '**Updated:** August 2026',
  '',
  'Chat\'s split on whether Rain confronts Vesper directly or keeps stalling.',
  'Leaning confront, after two streams of leaning that way.',
  '',
  '## Active',
  '',
  '- Some quest that must not leak in either',
].join('\n');

describe('parseCurrentArc', () => {
  it('returns null for an empty string', () => {
    expect(parseCurrentArc('')).toBeNull();
  });

  it('returns null when there is no Current Arc section', () => {
    const md = '## The Question\n\nWhat is the goal?\n';
    expect(parseCurrentArc(md)).toBeNull();
  });

  it('parses arc, stat, updated, and decision from a well-formed section', () => {
    const result = parseCurrentArc(wellFormed);
    expect(result).toEqual({
      arc: 'Arc II — Learning to Speak',
      stat: 'Insight',
      updated: 'August 2026',
      decision:
        "Chat's split on whether Rain confronts Vesper directly or keeps stalling. Leaning confront, after two streams of leaning that way.",
    });
  });

  it('does not leak content from sections before or after Current Arc', () => {
    const result = parseCurrentArc(wellFormed);
    expect(result?.decision).not.toContain('must not leak');
  });

  it('matches the stat case-insensitively', () => {
    const md = [
      '## Current Arc',
      '**Arc:** Arc I',
      '**Stat:** insight',
      '**Updated:** August 2026',
      '',
      'Deciding something.',
    ].join('\n');
    expect(parseCurrentArc(md)?.stat).toBe('Insight');
  });

  it('falls back to a null stat for an unrecognized value, but keeps the rest', () => {
    const md = [
      '## Current Arc',
      '**Arc:** Arc I',
      '**Stat:** Wisdom',
      '**Updated:** August 2026',
      '',
      'Deciding something.',
    ].join('\n');
    const result = parseCurrentArc(md);
    expect(result?.stat).toBeNull();
    expect(result?.arc).toBe('Arc I');
    expect(result?.decision).toBe('Deciding something.');
  });

  it('returns null when Arc is missing', () => {
    const md = ['## Current Arc', '**Stat:** Insight', '', 'Deciding something.'].join('\n');
    expect(parseCurrentArc(md)).toBeNull();
  });

  it('returns null when there is no decision paragraph', () => {
    const md = ['## Current Arc', '**Arc:** Arc I', '**Stat:** Insight'].join('\n');
    expect(parseCurrentArc(md)).toBeNull();
  });

  it('works when Stat and Updated are omitted but Arc and decision are present', () => {
    const md = ['## Current Arc', '**Arc:** Arc I', '', 'Deciding something.'].join('\n');
    const result = parseCurrentArc(md);
    expect(result).toEqual({ arc: 'Arc I', stat: null, updated: '', decision: 'Deciding something.' });
  });
});
