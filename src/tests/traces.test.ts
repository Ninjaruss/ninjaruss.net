import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  hashIp,
  isRateLimited,
  parseTracesInput,
  containsBlockedTerm,
  NAME_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  RATE_LIMIT_WINDOW_MS,
  BLOCKED_TERMS,
} from '../utils/traces';

describe('sanitizeText', () => {
  it('trims and collapses internal whitespace', () => {
    expect(sanitizeText('  hello   world  ')).toBe('hello world');
  });

  it('collapses newlines and tabs to a single space', () => {
    expect(sanitizeText('line one\nline two\ttabbed')).toBe('line one line two tabbed');
  });

  it('strips control characters', () => {
    expect(sanitizeText('a\x00b\x1fc')).toBe('a b c');
  });
});

describe('hashIp', () => {
  it('is deterministic for the same ip + salt', () => {
    expect(hashIp('1.2.3.4', 'salt')).toBe(hashIp('1.2.3.4', 'salt'));
  });

  it('differs for different salts', () => {
    expect(hashIp('1.2.3.4', 'salt-a')).not.toBe(hashIp('1.2.3.4', 'salt-b'));
  });

  it('never contains the raw ip', () => {
    expect(hashIp('1.2.3.4', 'salt')).not.toContain('1.2.3.4');
  });

  it('produces a 64-char hex string (sha256)', () => {
    expect(hashIp('1.2.3.4', 'salt')).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('isRateLimited', () => {
  it('is false with no prior submission', () => {
    expect(isRateLimited(null, new Date())).toBe(false);
  });

  it('is true just inside the window', () => {
    const now = new Date('2026-01-01T00:05:00Z');
    const last = new Date('2026-01-01T00:01:00Z');
    expect(isRateLimited(last, now, RATE_LIMIT_WINDOW_MS)).toBe(true);
  });

  it('is false once the window has elapsed', () => {
    const now = new Date('2026-01-01T00:06:00Z');
    const last = new Date('2026-01-01T00:01:00Z');
    expect(isRateLimited(last, now, RATE_LIMIT_WINDOW_MS)).toBe(false);
  });
});

describe('containsBlockedTerm', () => {
  it('matches a default blocked phrase as a whole word', () => {
    expect(containsBlockedTerm('kys')).toBe(true);
    expect(containsBlockedTerm('please just kys already')).toBe(true);
  });

  it('matches basic leetspeak substitutions', () => {
    expect(containsBlockedTerm('k1ll y0urself')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(containsBlockedTerm('KYS')).toBe(true);
  });

  it('does not match a blocked term inside an unrelated longer word', () => {
    expect(containsBlockedTerm('playkysh')).toBe(false);
  });

  it('is false for ordinary text', () => {
    expect(containsBlockedTerm('had a great time here, thanks for making this')).toBe(false);
  });
});

describe('parseTracesInput', () => {
  it('accepts a valid name + message', () => {
    expect(parseTracesInput({ name: 'Russ', message: 'hello there' }))
      .toEqual({ name: 'Russ', message: 'hello there' });
  });

  it('sanitizes before validating', () => {
    expect(parseTracesInput({ name: '  Russ  ', message: '  hi   there  ' }))
      .toEqual({ name: 'Russ', message: 'hi there' });
  });

  it('rejects an empty message', () => {
    expect(() => parseTracesInput({ name: 'Russ', message: '   ' })).toThrow();
  });

  it('rejects an empty name', () => {
    expect(() => parseTracesInput({ name: '  ', message: 'hi' })).toThrow();
  });

  it(`rejects a message over ${MESSAGE_MAX_LENGTH} characters`, () => {
    expect(() => parseTracesInput({ name: 'Russ', message: 'x'.repeat(MESSAGE_MAX_LENGTH + 1) })).toThrow();
  });

  it(`rejects a name over ${NAME_MAX_LENGTH} characters`, () => {
    expect(() => parseTracesInput({ name: 'x'.repeat(NAME_MAX_LENGTH + 1), message: 'hi' })).toThrow();
  });

  it('rejects non-string input', () => {
    expect(() => parseTracesInput({ name: 123, message: 'hi' })).toThrow();
  });

  it('rejects a message containing a blocked term', () => {
    const term = BLOCKED_TERMS[0];
    expect(() => parseTracesInput({ name: 'Russ', message: `hey ${term} ok` })).toThrow();
  });

  it('rejects a blocked term disguised with basic leetspeak', () => {
    // 'kys' is in the default blocklist — swap i-for-1 elsewhere in the phrase
    // to confirm normalization runs before matching, not just a raw lookup.
    expect(() => parseTracesInput({ name: 'Russ', message: 'just k1ll yourself' })).toThrow();
  });

  it('does not false-positive on a blocked term as a substring of an unrelated word', () => {
    // Word-boundary matching: 'kys' must not match inside a longer token.
    expect(() => parseTracesInput({ name: 'Russ', message: 'playkysh is a fun made-up word' })).not.toThrow();
  });
});
