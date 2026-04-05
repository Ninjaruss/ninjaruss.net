import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import { marked } from 'marked';

export interface NovelFile {
  slug: string;
  title: string;
  body: string;         // markdown pre-rendered to HTML at build time
  created: string | null;
  modified: string | null;
  path: string[];       // folder path segments, e.g. ['lore', 'magic-system']
}

export interface NovelFolder {
  slug: string;
  title: string;
  files: NovelFile[];
  subfolders: Record<string, NovelFolder>;
}

export type NovelTree = Record<string, NovelFolder>;

export interface MetaData {
  created: string | null;
  modified: string | null;
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
  const dir = mdFilePath.replace(/\/[^/]+$/, '');
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
      const rawMarkdown = readFileSync(fullPath, 'utf-8');
      const body = await marked.parse(rawMarkdown);
      const meta = readSidecarMeta(fullPath);

      files.push({
        slug: fileSlug,
        title,
        body,
        created: meta.created,
        modified: meta.modified,
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
