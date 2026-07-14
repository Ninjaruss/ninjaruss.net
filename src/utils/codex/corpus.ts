import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { stripMarkdown } from '../content';
import { slugify } from '../novel';

export interface CorpusEntry {
  id: string;
  title: string;
  tags: string[];
  publishedAt: string | null;
  text: string;
}

const COLLECTIONS = ['notes', 'showcase', 'shelf', 'now'] as const;
const NOVEL_FOLDERS = ['World', 'Story Plan'];
const MAX_TEXT = 4000;

async function gatherCollection(contentDir: string, name: string): Promise<CorpusEntry[]> {
  const dir = path.join(contentDir, name);
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const entries: CorpusEntry[] = [];
  for (const file of files.filter(f => /\.(md|mdx)$/.test(f))) {
    const raw = await fs.readFile(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    if (data.draft === true) continue;
    const slug = file.replace(/\.(md|mdx)$/, '');
    entries.push({
      id: `${name}/${slug}`,
      title: String(data.title ?? slug),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
      text: stripMarkdown(content).slice(0, MAX_TEXT),
    });
  }
  return entries;
}

async function gatherNovelFolder(contentDir: string, folder: string): Promise<CorpusEntry[]> {
  const base = path.join(contentDir, 'novel', folder);
  const entries: CorpusEntry[] = [];

  async function walk(dir: string, slugParts: string[]): Promise<void> {
    let items: import('node:fs').Dirent[] = [];
    try {
      items = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      if (item.isDirectory()) {
        await walk(path.join(dir, item.name), [...slugParts, slugify(item.name)]);
      } else if (item.name.endsWith('.md')) {
        const name = item.name.replace(/\.md$/, '');
        const raw = await fs.readFile(path.join(dir, item.name), 'utf-8');
        entries.push({
          id: `novel/${[...slugParts, slugify(name)].join('/')}`,
          title: name,
          tags: [],
          publishedAt: null,
          text: stripMarkdown(raw).slice(0, MAX_TEXT),
        });
      }
    }
  }

  await walk(base, [slugify(folder)]);
  return entries;
}

/** Gather all non-draft content as plain-text corpus entries for the AI pass. */
export async function gatherCorpus(contentDir = 'src/content'): Promise<CorpusEntry[]> {
  const groups = await Promise.all([
    ...COLLECTIONS.map(c => gatherCollection(contentDir, c)),
    ...NOVEL_FOLDERS.map(f => gatherNovelFolder(contentDir, f)),
  ]);
  return groups.flat();
}
