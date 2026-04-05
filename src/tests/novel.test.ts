import { describe, it, expect } from 'vitest';
import { slugify, parseMetaData } from '../utils/novel';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Magic Overview')).toBe('magic-overview');
  });

  it('removes special characters', () => {
    expect(slugify("Rain's End!")).toBe('rains-end');
  });

  it('handles single word', () => {
    expect(slugify('Rain')).toBe('rain');
  });

  it('collapses multiple spaces', () => {
    expect(slugify('Character  Ability  Table')).toBe('character-ability-table');
  });
});

describe('parseMetaData', () => {
  it('parses created and modified dates', () => {
    const input = `Created: December 18, 2025 at 2:27 PM
Modified: April 5, 2026 at 3:31 AM
Status: Web Ready
Label: No Label
Keywords: `;
    const result = parseMetaData(input);
    expect(result.created).toBe('December 18, 2025');
    expect(result.modified).toBe('April 5, 2026');
  });

  it('returns null for missing fields', () => {
    const result = parseMetaData('Status: No Status\nLabel: No Label');
    expect(result.created).toBeNull();
    expect(result.modified).toBeNull();
  });

  it('handles empty string', () => {
    const result = parseMetaData('');
    expect(result.created).toBeNull();
    expect(result.modified).toBeNull();
  });
});
