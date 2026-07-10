import { describe, it, expect } from 'vitest';
import { slugify, parseMetaData, buildNovelTree, countWords, computeNovelStats, flattenFolderFiles, findRecentFiles, type NovelTree } from '../utils/novel';
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

    // Characters folder has subfolders for each character (Claire, Rain, Roxana, Vesper)
    expect(Object.keys(tree.characters.subfolders).length).toBeGreaterThanOrEqual(3);
    const vesperFolder = tree.characters.subfolders['vesper'];
    expect(vesperFolder).toBeDefined();

    const vesper = vesperFolder.files.find((f) => f.slug === 'vesper-characterization');
    expect(vesper).toBeDefined();
    expect(vesper!.title).toBe('Vesper Characterization');
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
    expect(vesper!.path).toEqual(['characters', 'vesper', 'vesper-characterization']);

    // mtime is captured
    expect(typeof vesper!.mtime).toBe('string');
  });
});

describe('countWords', () => {
  it('counts words in HTML, ignoring tags and entities', () => {
    expect(countWords('<p>It rains <em>softly</em> tonight&nbsp;here</p>')).toBe(5);
  });

  it('returns 0 for empty or tag-only input', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('<hr/><br>')).toBe(0);
  });
});

const file = (over: object) => ({
  slug: 'f', title: 'F', body: '<p>one two three</p>',
  created: null, modified: null, mtime: null, path: ['x'], ...over,
});
const folder = (slug: string, files: any[], subfolders = {}) =>
  ({ slug, title: slug, files, subfolders });

describe('computeNovelStats', () => {

  it('splits story (scenes/) from outline words, recursing subfolders', () => {
    const tree = {
      scenes: folder('scenes', [file({})], {
        'act-1': folder('act-1', [file({ body: '<p>four five</p>' })]),
      }),
      characters: folder('characters', [file({ body: '<p>a b c d</p>' })]),
    };
    const stats = computeNovelStats(tree);
    expect(stats.storyWords).toBe(5);
    expect(stats.outlineWords).toBe(4);
  });

  it('tracks last modified per group, preferring sidecar over mtime', () => {
    const tree = {
      scenes: folder('scenes', [
        file({ modified: '2026-07-01' }),
        file({ modified: null, mtime: '2026-07-05T00:00:00.000Z' }),
      ]),
      lore: folder('lore', [file({ modified: '2026-06-01' })]),
    };
    const stats = computeNovelStats(tree);
    expect(stats.lastSceneModified).toBe('2026-07-05T00:00:00.000Z');
    expect(stats.lastOutlineModified).toBe(new Date('2026-06-01').toISOString());
  });

  it('handles missing scenes folder and empty tree', () => {
    expect(computeNovelStats({})).toEqual({
      storyWords: 0, outlineWords: 0,
      lastSceneModified: null, lastOutlineModified: null,
    });
    const stats = computeNovelStats({ lore: folder('lore', [file({})]) });
    expect(stats.storyWords).toBe(0);
    expect(stats.lastSceneModified).toBeNull();
  });

  it('anchors day-precision sidecar dates to UTC midnight', () => {
    const tree: NovelTree = { scenes: folder('scenes', [file({ modified: 'July 1, 2026' })]) };
    expect(computeNovelStats(tree).lastSceneModified).toBe('2026-07-01T00:00:00.000Z');
  });

  it('ignores unparseable dates', () => {
    const tree = { scenes: folder('scenes', [file({ modified: 'not a date' })]) };
    expect(computeNovelStats(tree).lastSceneModified).toBeNull();
  });
});

describe('flattenFolderFiles', () => {
  it('returns root files then subfolder files depth-first, in tree order', () => {
    const tree = folder('lore', [file({ slug: 'root-a' })], {
      'magic-system': folder('magic-system', [file({ slug: 'sub-a' }), file({ slug: 'sub-b' })], {
        deeper: folder('deeper', [file({ slug: 'deep-a' })]),
      }),
      plot: folder('plot', [file({ slug: 'plot-a' })]),
    });
    expect(flattenFolderFiles(tree).map((f: any) => f.slug))
      .toEqual(['root-a', 'sub-a', 'sub-b', 'deep-a', 'plot-a']);
  });

  it('returns empty array for empty folder', () => {
    expect(flattenFolderFiles(folder('themes', []))).toEqual([]);
  });
});

describe('findRecentFiles', () => {
  const tree: NovelTree = {
    scenes: folder('scenes', [
      file({ slug: 'old-scene', modified: '2026-05-01' }),
      file({ slug: 'new-scene', modified: '2026-07-01' }),
    ]),
    characters: folder('characters', [], {
      rain: folder('rain', [file({ slug: 'rain-doc', modified: null, mtime: '2026-06-20T00:00:00.000Z' })]),
    }),
    lore: folder('lore', [
      file({ slug: 'dated-note', modified: 'June 1, 2026' }),
      file({ slug: 'undated', modified: null, mtime: null }),
      file({ slug: 'bad-date', modified: 'not a date', mtime: null }),
    ]),
  };

  it('returns newest scenes first when scenes=true', () => {
    const result = findRecentFiles(tree, { scenes: true, limit: 2 });
    expect(result.map((f) => f.slug)).toEqual(['new-scene', 'old-scene']);
  });

  it('returns newest non-scene files when scenes=false, using mtime fallback', () => {
    const result = findRecentFiles(tree, { scenes: false, limit: 2 });
    expect(result.map((f) => f.slug)).toEqual(['rain-doc', 'dated-note']);
  });

  it('excludes files without a parseable date and respects limit', () => {
    const result = findRecentFiles(tree, { scenes: false, limit: 10 });
    expect(result.map((f) => f.slug)).toEqual(['rain-doc', 'dated-note']);
  });

  it('returns empty array on empty tree', () => {
    expect(findRecentFiles({}, { scenes: true, limit: 1 })).toEqual([]);
  });
});
