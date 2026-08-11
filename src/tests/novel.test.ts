import { describe, it, expect } from 'vitest';
import { slugify, parseMetaData, parseOrderPrefix, buildNovelTree, countWords, computeNovelStats, flattenFolderFiles, findRecentFiles, findSynopsisDoc, findFirstScene, unescapeScrivenerMarkdown, stripSceneLabel, stripAuthorComments, type NovelTree } from '../utils/novel';
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

describe('parseOrderPrefix', () => {
  it('extracts a leading number and strips it from the title', () => {
    expect(parseOrderPrefix('1 Rain intro')).toEqual({ order: 1, clean: 'Rain intro' });
    expect(parseOrderPrefix('01. Choice Points')).toEqual({ order: 1, clean: 'Choice Points' });
    expect(parseOrderPrefix('2 - Asylum')).toEqual({ order: 2, clean: 'Asylum' });
    expect(parseOrderPrefix('3)Volcano')).toEqual({ order: 3, clean: 'Volcano' });
  });

  it('leaves un-prefixed names untouched', () => {
    expect(parseOrderPrefix('Rain intro')).toEqual({ order: null, clean: 'Rain intro' });
    expect(parseOrderPrefix('Arc 1 - Fugitive')).toEqual({ order: null, clean: 'Arc 1 - Fugitive' });
  });

  it('does not treat a multi-digit year as a prefix', () => {
    expect(parseOrderPrefix('1984 Retrospective')).toEqual({ order: null, clean: '1984 Retrospective' });
  });
});

describe('buildNovelTree ordering', () => {
  // Asserted on arc *numbers*, not slugs: the arc folders get renamed as the story
  // is designed (Asylum -> Mirror, Prison -> Prisoner, ...), and a test that hardcodes
  // slugs fails on a rename that is not a bug.
  it('sorts unprefixed sibling folders by natural order (Arc 2 before Arc 10)', async () => {
    const tree = await buildNovelTree(join(process.cwd(), 'src/content/novel'));
    const numbers = Object.values(tree.manuscript.subfolders)
      .map((f) => f.title.match(/^Arc\s+(\d+)/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => parseInt(m[1], 10));

    expect(numbers.length).toBeGreaterThanOrEqual(2);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it('places un-prefixed folders after the numbered arcs', async () => {
    const tree = await buildNovelTree(join(process.cwd(), 'src/content/novel'));
    const titles = Object.values(tree.manuscript.subfolders).map((f) => f.title);
    const deadEnds = titles.indexOf('Dead Ends');
    if (deadEnds >= 0) {
      expect(deadEnds).toBe(titles.length - 1);
    }
  });
});

describe('stripAuthorComments', () => {
  it('removes %% lines and collapses the gap they leave', () => {
    expect(stripAuthorComments('a\n\n%% note to self\n\nb')).toBe('a\n\nb');
  });

  it('removes indented %% lines too', () => {
    expect(stripAuthorComments('   %% indented\nreal')).toBe('real');
  });

  it('returns empty for a comment-only document', () => {
    expect(stripAuthorComments('%% one\n%% two\n')).toBe('');
  });

  it('leaves a mid-line %% alone', () => {
    expect(stripAuthorComments('he said %% out loud')).toBe('he said %% out loud');
  });
});

describe('stripSceneLabel', () => {
  it('removes a leading scene label and the blank line after it', () => {
    expect(stripSceneLabel('a1s01_road_less_traveled\n\nI am Rain.')).toBe('I am Rain.');
  });

  it('handles dead-end and vignette label forms', () => {
    expect(stripSceneLabel('a4d01_commute\n\nThe 6:12.')).toBe('The 6:12.');
    expect(stripSceneLabel('a3v02_life\n\nA life.')).toBe('A life.');
  });

  it('tolerates leading blank lines before the label', () => {
    expect(stripSceneLabel('\n\na2s06_archive\n\nStored light.')).toBe('Stored light.');
  });

  it('leaves a label-only document empty', () => {
    expect(stripSceneLabel('a5s10_outbound_train\n')).toBe('');
  });

  it('leaves prose untouched when the first line is not a label', () => {
    const prose = 'The rain poured, yet I did not fall.';
    expect(stripSceneLabel(prose)).toBe(prose);
  });

  it('does not strip a label that appears mid-document', () => {
    const md = 'Some prose.\n\na1s01_road_less_traveled';
    expect(stripSceneLabel(md)).toBe(md);
  });
});

describe('unescapeScrivenerMarkdown', () => {
  it('strips Scrivener backslash escapes so markdown renders', () => {
    expect(unescapeScrivenerMarkdown('\\#\\#\\# Rain Azure?')).toBe('### Rain Azure?');
    expect(unescapeScrivenerMarkdown('\\- \\*\\*Passive: Ghost\\*\\*')).toBe('- **Passive: Ghost**');
  });

  it('leaves already-clean prose untouched', () => {
    const prose = "Just a dreamer stuck in the waiting room of his own life.";
    expect(unescapeScrivenerMarkdown(prose)).toBe(prose);
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

    // Top-level folders exist (Scrivener reorg: Characters / Manuscript / Story Plan / World)
    expect(tree).toHaveProperty('characters');
    expect(tree).toHaveProperty('manuscript');
    expect(tree).toHaveProperty('story-plan');
    expect(tree).toHaveProperty('world');

    // Characters are now flat files directly under Characters/ (not per-character subfolders)
    const rain = tree.characters.files.find((f) => f.slug === 'rain');
    expect(rain).toBeDefined();
    expect(rain!.title).toBe('Rain');
    expect(rain!.body).toBeTruthy(); // HTML rendered
    expect(typeof rain!.body).toBe('string');

    // Characters still has an Asylum Patients subfolder
    expect(tree.characters.subfolders).toHaveProperty('asylum-patients');

    // Manuscript holds the story arcs as subfolders, each with scene files
    expect(tree.manuscript.subfolders).toHaveProperty('arc-1-fugitive');
    expect(tree.manuscript.subfolders['arc-1-fugitive'].files.length).toBeGreaterThan(0);

    // World holds Magic System as a flat file now (was Lore/Magic System/)
    expect(tree.world.files.some((f) => f.slug === 'magic-system')).toBe(true);

    // Dates are parsed
    expect(rain!.created).not.toBeNull();

    // Path field drives URL construction
    expect(rain!.path).toEqual(['characters', 'rain']);

    // mtime is captured
    expect(typeof rain!.mtime).toBe('string');
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
  order: null,
  slug: 'f', title: 'F', body: '<p>one two three</p>',
  created: null, modified: null, mtime: null, path: ['x'], ...over,
});
const folder = (slug: string, files: any[], subfolders = {}, order: number | null = null) =>
  ({ slug, title: slug, order, files, subfolders });

describe('computeNovelStats', () => {

  it('splits story (manuscript/) from outline words, recursing subfolders', () => {
    const tree = {
      manuscript: folder('manuscript', [file({})], {
        'arc-1': folder('arc-1', [file({ body: '<p>four five</p>' })]),
      }),
      characters: folder('characters', [file({ body: '<p>a b c d</p>' })]),
    };
    const stats = computeNovelStats(tree);
    expect(stats.storyWords).toBe(5);
    expect(stats.outlineWords).toBe(4);
  });

  it('tracks last modified per group, preferring sidecar over mtime', () => {
    const tree = {
      manuscript: folder('manuscript', [
        file({ modified: '2026-07-01' }),
        file({ modified: null, mtime: '2026-07-05T00:00:00.000Z' }),
      ]),
      world: folder('world', [file({ modified: '2026-06-01' })]),
    };
    const stats = computeNovelStats(tree);
    expect(stats.lastSceneModified).toBe('2026-07-05T00:00:00.000Z');
    expect(stats.lastOutlineModified).toBe(new Date('2026-06-01').toISOString());
  });

  it('handles missing manuscript folder and empty tree', () => {
    expect(computeNovelStats({})).toEqual({
      storyWords: 0, outlineWords: 0,
      lastSceneModified: null, lastOutlineModified: null,
    });
    const stats = computeNovelStats({ world: folder('world', [file({})]) });
    expect(stats.storyWords).toBe(0);
    expect(stats.lastSceneModified).toBeNull();
  });

  it('anchors day-precision sidecar dates to UTC midnight', () => {
    const tree: NovelTree = { manuscript: folder('manuscript', [file({ modified: 'July 1, 2026' })]) };
    expect(computeNovelStats(tree).lastSceneModified).toBe('2026-07-01T00:00:00.000Z');
  });

  it('ignores unparseable dates', () => {
    const tree = { manuscript: folder('manuscript', [file({ modified: 'not a date' })]) };
    expect(computeNovelStats(tree).lastSceneModified).toBeNull();
  });
});

describe('flattenFolderFiles', () => {
  // Contract: files and subfolders are ONE ordered list, merged on the same key
  // buildFolder sorted with. A numbered subfolder is a scene card that owns child
  // scenes ("3 The lives"), so it must land between its numbered file siblings.
  it('interleaves a numbered subfolder with its numbered file siblings', () => {
    const tree = folder('arc-3', [
      file({ slug: 'intake', title: 'Intake', order: 1 }),
      file({ slug: 'true-silence', title: 'True silence', order: 2 }),
      file({ slug: 'the-mountain', title: 'The mountain', order: 4 }),
    ], {
      'the-lives': folder('the-lives', [
        file({ slug: 'a-life-1', title: 'A life', order: 1 }),
      ], {}, 3),
    });
    expect(flattenFolderFiles(tree).map((f) => f.slug)).toEqual([
      'intake', 'true-silence', 'a-life-1', 'the-mountain',
    ]);
  });

  it('recurses depth-first and keeps nested subfolder contents together', () => {
    const tree = folder('lore', [file({ slug: 'root-a', title: 'A root', order: 1 })], {
      magic: folder('magic', [file({ slug: 'sub-a', title: 'Sub', order: 1 })], {
        deep: folder('deep', [file({ slug: 'deep-a', title: 'Deep', order: 1 })], {}, 2),
      }, 2),
    });
    expect(flattenFolderFiles(tree).map((f) => f.slug)).toEqual(['root-a', 'sub-a', 'deep-a']);
  });

  it('falls back to natural alphabetical order when nothing is numbered', () => {
    const tree = folder('lore', [file({ slug: 'beta', title: 'Beta' })], {
      alpha: folder('alpha', [file({ slug: 'alpha-1', title: 'Alpha one' })]),
    });
    expect(flattenFolderFiles(tree).map((f) => f.slug)).toEqual(['alpha-1', 'beta']);
  });
});

describe('findSynopsisDoc', () => {
  it('finds a synopsis-slugged doc anywhere under Story Plan', () => {
    const tree: NovelTree = {
      'story-plan': folder('story-plan', [file({ slug: 'arc-structure' })], {
        deeper: folder('deeper', [file({ slug: 'what-is-remember-rain' })]),
      }),
    };
    expect(findSynopsisDoc(tree)?.slug).toBe('what-is-remember-rain');
  });

  it('prefers higher-priority slugs when several candidates exist', () => {
    const tree: NovelTree = {
      'story-plan': folder('story-plan', [
        file({ slug: 'about' }),
        file({ slug: 'synopsis' }),
      ]),
    };
    expect(findSynopsisDoc(tree)?.slug).toBe('synopsis');
  });

  it('returns null without a Story Plan folder or matching doc', () => {
    expect(findSynopsisDoc({})).toBeNull();
    expect(findSynopsisDoc({ 'story-plan': folder('story-plan', [file({ slug: 'notes' })]) })).toBeNull();
  });

  it('finds the scaffolded doc in the real content directory', async () => {
    const tree = await buildNovelTree(join(process.cwd(), 'src/content/novel'));
    expect(findSynopsisDoc(tree)?.slug).toBe('what-is-remember-rain');
  });
});

describe('findFirstScene', () => {
  it('returns the first manuscript file in binder order', () => {
    const tree: NovelTree = {
      manuscript: folder('manuscript', [], {
        'arc-1': folder('arc-1', [file({ slug: 'rain-intro' }), file({ slug: 'second' })]),
      }),
      characters: folder('characters', [file({ slug: 'rain' })]),
    };
    expect(findFirstScene(tree)?.slug).toBe('rain-intro');
  });

  it('returns null without a manuscript folder or scenes', () => {
    expect(findFirstScene({})).toBeNull();
    expect(findFirstScene({ manuscript: folder('manuscript', []) })).toBeNull();
  });
});
