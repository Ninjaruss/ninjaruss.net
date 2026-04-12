import { describe, it, expect } from 'vitest';
import { slugify, parseMetaData, buildNovelTree } from '../utils/novel';
import { join } from 'path';

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

describe('buildNovelTree', () => {
  it('builds tree from actual novel content directory', async () => {
    const dir = join(process.cwd(), 'src/content/novel');
    const tree = await buildNovelTree(dir);

    // Top-level folders exist
    expect(tree).toHaveProperty('characters');
    expect(tree).toHaveProperty('locations');
    expect(tree).toHaveProperty('lore');
    expect(tree).toHaveProperty('themes');

    // Characters folder has root-level character files (Claire, Roxana, Vesper)
    expect(tree.characters.files.length).toBeGreaterThanOrEqual(3);
    const vesper = tree.characters.files.find((f) => f.slug === 'vesper');
    expect(vesper).toBeDefined();
    expect(vesper!.title).toBe('Vesper');
    expect(vesper!.body).toBeTruthy(); // HTML rendered
    expect(typeof vesper!.body).toBe('string');

    // Characters has Rain subfolder
    expect(tree.characters.subfolders).toHaveProperty('rain');

    // Lore has Magic System subfolder
    expect(tree.lore.subfolders).toHaveProperty('magic-system');
    expect(tree.lore.subfolders['magic-system'].files.length).toBeGreaterThan(0);

    // Dates are parsed
    expect(vesper!.created).not.toBeNull();

    // Path field drives URL construction
    expect(vesper!.path).toEqual(['characters', 'vesper']);
  });
});

// hashSlug — deterministic hash used for scatter positioning
describe('hashSlug', () => {
  // Inline the same algorithm used in the client script
  function hashSlug(slug: string): number {
    let h = 0;
    for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
    return h;
  }

  it('returns a non-negative integer', () => {
    expect(hashSlug('rain')).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(hashSlug('rain'))).toBe(true);
  });

  it('is deterministic', () => {
    expect(hashSlug('vesper')).toBe(hashSlug('vesper'));
  });

  it('produces different values for different slugs', () => {
    expect(hashSlug('rain')).not.toBe(hashSlug('vesper'));
  });

  it('handles empty string without throwing', () => {
    expect(() => hashSlug('')).not.toThrow();
    expect(hashSlug('')).toBe(0);
  });
});
