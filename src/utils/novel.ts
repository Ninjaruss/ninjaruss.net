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
