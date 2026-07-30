import { describe, it, expect } from 'vitest';
import { formatLogLine, parseLogLines, linesNotIn, mergeLogLines } from '../utils/mirror/log';
import { buildMirrorPrompt } from '../utils/mirror/prompt';
import { validateMirrorResponse } from '../utils/mirror/schema';

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

describe('linesNotIn', () => {
  it('keeps lines absent from the exported snapshot regardless of timestamp order', () => {
    const log = [
      '- 2026-07-29 13:00 | done | exported line',
      '- 2026-07-29 09:00 | done | phone line merged after export (older ts)',
    ].join('\n');
    const snapshot = '- 2026-07-29 13:00 | done | exported line';
    expect(linesNotIn(log, snapshot)).toEqual([
      { ts: '2026-07-29 09:00', kind: 'done', text: 'phone line merged after export (older ts)' },
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

const validSession = {
  date: '2026-07-29',
  title: 'Wagotabi at the desk',
  summary: 'Read a chapter of Wagotabi.',
  stats: ['Insight'],
  reflection: 'You chose the slow road and walked it anyway. That is the whole method.',
  nextStep: 'Tomorrow after lunch, open Wagotabi for 20 minutes.',
  streamed: false,
};

describe('validateMirrorResponse', () => {
  it('accepts a valid response', () => {
    const r = validateMirrorResponse(JSON.stringify({ sessions: [validSession] }));
    expect(r.errors).toEqual([]);
    expect(r.data).toHaveLength(1);
    expect(r.data![0].title).toBe('Wagotabi at the desk');
  });

  it('strips code fences before parsing', () => {
    const wrapped = '```json\n' + JSON.stringify({ sessions: [validSession] }) + '\n```';
    expect(validateMirrorResponse(wrapped).data).toHaveLength(1);
  });

  it('rejects malformed JSON with nothing written', () => {
    const r = validateMirrorResponse('not json');
    expect(r.data).toBeNull();
    expect(r.errors.length).toBeGreaterThan(0);
  });

  it('rejects a bad date', () => {
    const r = validateMirrorResponse(JSON.stringify({ sessions: [{ ...validSession, date: '29/07/2026' }] }));
    expect(r.data).toBeNull();
  });

  it('drops unknown stats with a warning, errors if none remain', () => {
    const one = validateMirrorResponse(JSON.stringify({ sessions: [{ ...validSession, stats: ['Insight', 'Luck'] }] }));
    expect(one.data![0].stats).toEqual(['Insight']);
    expect(one.warnings.length).toBeGreaterThan(0);

    const none = validateMirrorResponse(JSON.stringify({ sessions: [{ ...validSession, stats: ['Luck'] }] }));
    expect(none.data).toBeNull();
  });

  it('rejects an overlong reflection (rumination guard)', () => {
    const r = validateMirrorResponse(JSON.stringify({ sessions: [{ ...validSession, reflection: 'x'.repeat(601) }] }));
    expect(r.data).toBeNull();
  });

  it('rejects a missing nextStep', () => {
    const r = validateMirrorResponse(JSON.stringify({ sessions: [{ ...validSession, nextStep: '' }] }));
    expect(r.data).toBeNull();
  });
});

describe('mergeLogLines', () => {
  it('appends only lines not already present, preserving order', () => {
    const existing = '- 2026-07-29 13:00 | done | already here\n';
    const pasted = [
      '- 2026-07-29 13:00 | done | already here',
      '- 2026-07-29 14:00 | start | new from phone',
      'junk line',
    ].join('\n');
    expect(mergeLogLines(existing, pasted)).toBe(
      '- 2026-07-29 13:00 | done | already here\n- 2026-07-29 14:00 | start | new from phone\n'
    );
  });

  it('returns existing unchanged when paste has nothing new', () => {
    const existing = '- 2026-07-29 13:00 | done | a\n';
    expect(mergeLogLines(existing, '- 2026-07-29 13:00 | done | a')).toBe(existing);
  });

  it('dedupes duplicate lines within the pasted batch itself', () => {
    const pasted = [
      '- 2026-07-29 14:00 | start | dup in batch',
      '- 2026-07-29 14:00 | start | dup in batch',
    ].join('\n');
    expect(mergeLogLines('', pasted)).toBe('- 2026-07-29 14:00 | start | dup in batch\n');
  });
});

import { commitSessionFiles, type GithubConfig } from '../utils/mirror/github';

describe('commitSessionFiles', () => {
  const cfg: GithubConfig = {
    token: 'test-token',
    repo: 'Ninjaruss/ninjaruss.net',
    branch: 'main',
  };
  const session = {
    date: '2026-07-29',
    title: 'Live Test',
    summary: 'A live import.',
    stats: ['Chaos'],
    reflection: 'It reaches the repo now.',
    nextStep: 'Log the next one.',
    streamed: false,
  };

  it('PUTs a new file when the path is free', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchStub: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), init: init! });
      if (init?.method === undefined || init.method === 'GET') {
        return new Response('Not Found', { status: 404 });
      }
      return new Response(JSON.stringify({ content: { path: 'x' } }), { status: 201 });
    };
    const written = await commitSessionFiles([session], cfg, fetchStub);
    expect(written).toEqual(['2026-07-29-live-test.md']);
    const put = calls.find(c => c.init.method === 'PUT')!;
    expect(put.url).toContain('/repos/Ninjaruss/ninjaruss.net/contents/src/content/sessions/2026-07-29-live-test.md');
    const body = JSON.parse(String(put.init.body));
    expect(body.branch).toBe('main');
    expect(body.message).toBe('mirror: add session 2026-07-29-live-test');
    const decoded = Buffer.from(body.content, 'base64').toString('utf-8');
    expect(decoded).toContain('title: Live Test');
    expect(decoded).toContain('streamed: false');
  });

  it('suffixes the filename when the path already exists', async () => {
    const fetchStub: typeof fetch = async (url, init) => {
      if (init?.method === undefined || init.method === 'GET') {
        const taken = String(url).endsWith('2026-07-29-live-test.md?ref=main');
        return new Response(taken ? '{}' : 'Not Found', { status: taken ? 200 : 404 });
      }
      return new Response('{}', { status: 201 });
    };
    const written = await commitSessionFiles([session], cfg, fetchStub);
    expect(written).toEqual(['2026-07-29-live-test-2.md']);
  });

  it('throws with a readable error on a failed PUT', async () => {
    const fetchStub: typeof fetch = async (_url, init) =>
      init?.method === 'PUT'
        ? new Response('{"message":"boom"}', { status: 422 })
        : new Response('Not Found', { status: 404 });
    await expect(commitSessionFiles([session], cfg, fetchStub)).rejects.toThrow(/422/);
  });
});
