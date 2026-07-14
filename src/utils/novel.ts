import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename, dirname } from 'path';
import { marked } from 'marked';

export interface NovelFile {
  slug: string;
  title: string;
  body: string;         // markdown pre-rendered to HTML at build time
  created: string | null;
  modified: string | null;
  mtime: string | null; // filesystem mtime ISO — fallback when no sidecar
  path: string[];       // folder path segments, e.g. ['lore', 'magic-system']
}

export interface NovelFolder {
  slug: string;
  title: string;
  files: NovelFile[];
  subfolders: Record<string, NovelFolder>;
}

export type NovelTree = Record<string, NovelFolder>;

/**
 * Top-level folder slug that holds the manuscript prose (the story). Every other
 * top-level folder (Characters, Story Plan, World) is treated as outline. This is
 * the single source of truth for the story/outline split — the novel page and the
 * homepage rain-gauge tile both key off it.
 */
export const STORY_FOLDER_SLUG = 'manuscript';

export interface MetaData {
  created: string | null;
  modified: string | null;
}

/**
 * Undo Scrivener's blanket markdown escaping. Its compile step backslash-escapes
 * every markdown-significant character (`\#\#\#`, `\-`, `\*\*`), which `marked`
 * would otherwise render as literal `###`, `-`, `**` text instead of headings,
 * lists, and bold. A backslash before ASCII punctuation is always just a literal
 * in CommonMark, so stripping it here can only turn spuriously-escaped syntax
 * back into real markdown — safe for this corpus.
 */
export function unescapeScrivenerMarkdown(md: string): string {
  return md.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~])/g, '$1');
}

/** Convert a filename (without extension) to a URL-safe slug. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

/** Parse a Scrivener MetaData.txt file content for created and modified dates. */
export function parseMetaData(content: string): MetaData {
  const createdMatch = content.match(/^Created:\s*(.+?)\s+at\s+/m);
  const modifiedMatch = content.match(/^Modified:\s*(.+?)\s+at\s+/m);
  return {
    created: createdMatch ? createdMatch[1].trim() : null,
    modified: modifiedMatch ? modifiedMatch[1].trim() : null,
  };
}

/** Read a MetaData.txt sidecar file next to a given .md file, if it exists. */
function readSidecarMeta(mdFilePath: string): MetaData {
  // MetaData file is named "<Title> MetaData.txt" in the same directory
  const dir = dirname(mdFilePath);
  const title = basename(mdFilePath, '.md');
  const metaPath = join(dir, `${title} MetaData.txt`);
  if (existsSync(metaPath)) {
    return parseMetaData(readFileSync(metaPath, 'utf-8'));
  }
  return { created: null, modified: null };
}

/** Recursively build a NovelFolder from a directory path. */
async function buildFolder(
  dirPath: string,
  pathSegments: string[]
): Promise<NovelFolder> {
  const name = basename(dirPath);
  const slug = slugify(name);
  const entries = readdirSync(dirPath);

  const files: NovelFile[] = [];
  const subfolders: Record<string, NovelFolder> = {};

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      const sub = await buildFolder(fullPath, [...pathSegments, slugify(entry)]);
      subfolders[sub.slug] = sub;
    } else if (entry.endsWith('.md')) {
      const title = basename(entry, '.md');
      const fileSlug = slugify(title);
      const rawMarkdown = unescapeScrivenerMarkdown(readFileSync(fullPath, 'utf-8'));
      const body = await marked.parse(rawMarkdown);
      const meta = readSidecarMeta(fullPath);

      files.push({
        slug: fileSlug,
        title,
        body,
        created: meta.created,
        modified: meta.modified,
        mtime: stat.mtime.toISOString(),
        path: [...pathSegments, fileSlug],
      });
    }
    // .txt files (MetaData) are silently skipped
  }

  return { slug, title: name, files, subfolders };
}

/**
 * Build the full novel content tree from the given base directory.
 * Only top-level subdirectories become tree entries.
 */
export async function buildNovelTree(baseDir: string): Promise<NovelTree> {
  if (!existsSync(baseDir)) return {};
  const entries = readdirSync(baseDir);
  const tree: NovelTree = {};

  for (const entry of entries) {
    const fullPath = join(baseDir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      const folder = await buildFolder(fullPath, [slugify(entry)]);
      tree[folder.slug] = folder;
    }
  }

  return tree;
}

export interface NovelStats {
  storyWords: number;
  outlineWords: number;
  lastSceneModified: string | null;   // ISO
  lastOutlineModified: string | null; // ISO
}

/** Count words in a pre-rendered HTML body. */
export function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').trim();
  return text ? text.split(/\s+/).length : 0;
}

/** Parse a date value to UTC. Day-precision sidecar dates anchor to UTC midnight. */
function parseNovelDate(raw: string): Date | null {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  // ISO strings (mtime timestamps, date-only ISO) already parse as UTC; sidecar
  // dates like "July 1, 2026" parse in local time — re-anchor those to UTC
  // midnight for stable comparison across build machines
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return d;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/** Depth-first flat file list for a folder, in tree order. */
export function flattenFolderFiles(folder: NovelFolder): NovelFile[] {
  return [
    ...folder.files,
    ...Object.values(folder.subfolders).flatMap(flattenFolderFiles),
  ];
}

/**
 * Story vs outline stats for the homepage rain-gauge tile.
 * Story = top-level `manuscript` folder; outline = every other top-level folder.
 */
export function computeNovelStats(tree: NovelTree): NovelStats {
  let storyWords = 0;
  let outlineWords = 0;
  let lastScene: Date | null = null;
  let lastOutline: Date | null = null;

  for (const [slug, folder] of Object.entries(tree)) {
    const isStory = slug === STORY_FOLDER_SLUG;
    for (const file of flattenFolderFiles(folder)) {
      const words = countWords(file.body);
      if (isStory) storyWords += words;
      else outlineWords += words;

      const raw = file.modified ?? file.mtime;
      if (!raw) continue;
      const d = parseNovelDate(raw);
      if (!d) continue;
      if (isStory) {
        if (!lastScene || d > lastScene) lastScene = d;
      } else {
        if (!lastOutline || d > lastOutline) lastOutline = d;
      }
    }
  }

  return {
    storyWords,
    outlineWords,
    lastSceneModified: lastScene?.toISOString() ?? null,
    lastOutlineModified: lastOutline?.toISOString() ?? null,
  };
}

export interface RecentFileOptions {
  /** true → only the top-level `manuscript` (story) folder; false → everything else */
  scenes: boolean;
  limit: number;
}

/**
 * Most recently modified files, newest first. Sidecar `Modified:` dates are
 * preferred over filesystem mtime (same precedence as computeNovelStats);
 * files with no parseable date are excluded.
 */
export function findRecentFiles(tree: NovelTree, opts: RecentFileOptions): NovelFile[] {
  const dated: Array<{ file: NovelFile; date: Date }> = [];
  for (const [slug, folder] of Object.entries(tree)) {
    if ((slug === STORY_FOLDER_SLUG) !== opts.scenes) continue;
    for (const file of flattenFolderFiles(folder)) {
      const raw = file.modified ?? file.mtime;
      if (!raw) continue;
      const date = parseNovelDate(raw);
      if (!date) continue;
      dated.push({ file, date });
    }
  }
  dated.sort((a, b) => b.date.getTime() - a.date.getTime());
  return dated.slice(0, opts.limit).map((entry) => entry.file);
}
