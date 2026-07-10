import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { stripMarkdown } from './content';
import { buildNovelTree, type NovelFolder } from './novel';
import { validateMindData, type MindData } from './mind/schema';
import { resolveMind, type ResolvedEntry, type ResolvedMind } from './mind/resolve';

export type { ResolvedMind, ResolvedEntry };

const MIND_JSON = path.resolve('src/data/mind.json');
const NOVEL_DIR = path.resolve('src/content/novel');
const NOVEL_FOLDER_SLUGS = ['themes', 'lore'];

/** Read + validate the committed mind.json; missing/invalid → null (never fails the build). */
function readMindData(): MindData | null {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(MIND_JSON, 'utf-8'));
  } catch {
    console.warn('[mind] src/data/mind.json missing or unreadable — /mind renders the empty state');
    return null;
  }
  // Structural check only at build time: pass the doc's own refs as the known
  // set so stale entry refs surface as dropped-ref warnings in resolveMind,
  // not build failures.
  const concepts = (raw as { concepts?: unknown })?.concepts;
  const knownFromDoc = new Set<string>(
    Array.isArray(concepts)
      ? concepts.flatMap((c: { entries?: unknown }) =>
          Array.isArray(c?.entries) ? (c.entries as string[]) : []
        )
      : []
  );
  const structural = validateMindData(raw, knownFromDoc);
  if (!structural.ok) {
    console.warn(`[mind] mind.json failed validation — /mind renders the empty state:\n  ${structural.errors.join('\n  ')}`);
    return null;
  }
  return structural.data!;
}

function collectNovelFiles(folder: NovelFolder, out: ResolvedEntry[]): void {
  for (const file of folder.files) {
    const slugPath = file.path.join('/');
    out.push({
      id: `novel/${slugPath}`,
      title: file.title,
      href: `/novel/${slugPath}`,
      collection: 'novel',
      publishedAt: null,
      excerpt: stripMarkdown(file.body ?? '').slice(0, 140),
    });
  }
  for (const child of Object.values(folder.subfolders)) {
    collectNovelFiles(child, out);
  }
}

async function buildEntryMap(): Promise<Map<string, ResolvedEntry>> {
  const map = new Map<string, ResolvedEntry>();

  const hrefFor: Record<string, (slug: string) => string> = {
    notes: s => `/notes/${s}`,
    showcase: s => `/showcase/${s}`,
    shelf: s => `/shelf/${s}`,
    now: () => `/now/archive`,
  };

  for (const name of ['notes', 'showcase', 'shelf', 'now'] as const) {
    const entries = await getCollection(name, ({ data }) => !data.draft);
    for (const entry of entries) {
      map.set(`${name}/${entry.slug}`, {
        id: `${name}/${entry.slug}`,
        title: entry.data.title,
        href: hrefFor[name](entry.slug),
        collection: name,
        publishedAt: entry.data.publishedAt ? entry.data.publishedAt.toISOString() : null,
        excerpt: stripMarkdown(entry.body ?? '').slice(0, 140),
      });
    }
  }

  const tree = await buildNovelTree(NOVEL_DIR);
  const novelOut: ResolvedEntry[] = [];
  for (const slug of NOVEL_FOLDER_SLUGS) {
    const folder = tree[slug];
    if (folder) collectNovelFiles(folder, novelOut);
  }
  for (const e of novelOut) map.set(e.id, e);

  return map;
}

let cached: ResolvedMind | null = null;

/** Full resolved mind for /mind pages and the homepage tile. Cached per build. */
export async function getMindPageData(): Promise<ResolvedMind> {
  if (cached) return cached;
  const resolved = resolveMind(readMindData(), await buildEntryMap());
  for (const ref of resolved.droppedRefs) {
    console.warn(`[mind] dropped stale entry ref "${ref}" (entry deleted or drafted)`);
  }
  cached = resolved;
  return resolved;
}

export interface MindTileData {
  conceptCount: number;
  lines: string[];
}

/** Lightweight view for the homepage tile. */
export async function getMindTileData(): Promise<MindTileData> {
  const { concepts } = await getMindPageData();
  const lines = concepts
    .filter(c => c.synthesis.trim().length > 0)
    .map(c => {
      const plain = stripMarkdown(c.synthesis);
      const sentence = plain.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? plain;
      return sentence.slice(0, 120);
    });
  return { conceptCount: concepts.length, lines };
}
