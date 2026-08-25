import { describe, it, expect } from 'vitest';
import { formatTraceTimestamp, formatTraceTimestampCompact } from '../utils/tracesFormat';

describe('formatTraceTimestamp', () => {
  it('formats date and time in UTC', () => {
    expect(formatTraceTimestamp('2026-08-24T15:41:00Z')).toBe('Aug 24, 2026 · 3:41 PM UTC');
  });

  it('pads single-digit minutes', () => {
    expect(formatTraceTimestamp('2026-01-05T09:05:00Z')).toBe('Jan 5, 2026 · 9:05 AM UTC');
  });
});

describe('formatTraceTimestampCompact', () => {
  it('formats a lowercase compact date and time', () => {
    expect(formatTraceTimestampCompact('2026-08-24T15:41:00Z')).toBe('aug 24 · 3:41pm');
  });

  it('pads single-digit minutes', () => {
    expect(formatTraceTimestampCompact('2026-01-05T09:05:00Z')).toBe('jan 5 · 9:05am');
  });
});
