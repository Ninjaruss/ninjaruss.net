import { describe, it, expect } from 'vitest';
import { formatLogLine, parseLogLines } from '../utils/mirror/log';
import { buildMirrorPrompt } from '../utils/mirror/prompt';

describe('formatLogLine', () => {
  it('formats a done line with local timestamp', () => {
    const at = new Date(2026, 6, 29, 21, 4); // local time
    expect(formatLogLine('done', 'kanji reps, fog, pushed through', at))
      .toBe('- 2026-07-29 21:04 | done | kanji reps, fog, pushed through');
  });

  it('flattens newlines in the text', () => {
    const at = new Date(2026, 6, 29, 9, 0);
    expect(formatLogLine('start', 'line one\nline two', at))
      .toBe('- 2026-07-29 09:00 | start | line one line two');
  });
});

describe('parseLogLines', () => {
  it('round-trips formatted lines and skips junk', () => {
    const md = [
      formatLogLine('start', 'read Wagotabi', new Date(2026, 6, 29, 13, 0)),
      'not a log line',
      formatLogLine('done', 'finished a chapter', new Date(2026, 6, 29, 13, 40)),
    ].join('\n');
    expect(parseLogLines(md)).toEqual([
      { ts: '2026-07-29 13:00', kind: 'start', text: 'read Wagotabi' },
      { ts: '2026-07-29 13:40', kind: 'done', text: 'finished a chapter' },
    ]);
  });
});

describe('buildMirrorPrompt', () => {
  const lines = [
    { ts: '2026-07-29 13:00', kind: 'start' as const, text: 'read Wagotabi' },
    { ts: '2026-07-29 13:40', kind: 'done' as const, text: 'finished a chapter' },
  ];

  it('includes raw log lines and quest file', () => {
    const p = buildMirrorPrompt(lines, '## Active\n- [Insight] Read Wagotabi');
    expect(p).toContain('finished a chapter');
    expect(p).toContain('Read Wagotabi');
  });

  it('includes the output contract and anti-rumination rules', () => {
    const p = buildMirrorPrompt(lines, '');
    expect(p).toContain('"sessions"');
    expect(p).toContain('exactly one next step');
    expect(p).toContain('ONLY the JSON');
    expect(p).toContain('never scold');
    expect(p).toContain('resolve, not loop');
    expect(p).toContain('do not fabricate');
  });

  it('lists the five valid stats', () => {
    const p = buildMirrorPrompt(lines, '');
    for (const s of ['Determination', 'Insight', 'Expression', 'Sincerity', 'Chaos']) {
      expect(p).toContain(s);
    }
  });
});
