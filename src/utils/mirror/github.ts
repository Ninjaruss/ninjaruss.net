import matter from 'gray-matter';
import { slugify } from '../novel';
import type { MirrorSession } from './schema';

export interface GithubConfig {
  token: string;
  repo: string;   // owner/name
  branch: string;
}

const API = 'https://api.github.com';
const SESSIONS_PATH = 'src/content/sessions';

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

export function sessionFrontmatter(s: MirrorSession): string {
  const fm: Record<string, unknown> = {
    title: s.title,
    publishedAt: s.date,
    stats: s.stats,
    summary: s.summary,
    ...(s.memorable ? { memorable: s.memorable } : {}),
    ...(s.quest ? { quest: s.quest } : {}),
    nextStep: s.nextStep,
    reflection: s.reflection,
    streamed: s.streamed,
    draft: false,
  };
  return matter.stringify('', fm);
}

async function pathTaken(path: string, cfg: GithubConfig, f: typeof fetch): Promise<boolean> {
  const res = await f(`${API}/repos/${cfg.repo}/contents/${path}?ref=${cfg.branch}`, {
    headers: headers(cfg.token),
  });
  return res.status !== 404;
}

/** Commit one file per session to the repo. Returns written basenames.
 *  Throws on any failed write — callers report the error; already-written
 *  files stay written (each is its own commit, individually revertable). */
export async function commitSessionFiles(
  sessions: MirrorSession[],
  cfg: GithubConfig,
  f: typeof fetch = fetch,
): Promise<string[]> {
  const written: string[] = [];
  for (const s of sessions) {
    const base = `${s.date}-${slugify(s.title)}`;
    let name = `${base}.md`;
    let n = 2;
    while (await pathTaken(`${SESSIONS_PATH}/${name}`, cfg, f)) {
      name = `${base}-${n++}.md`;
    }
    const res = await f(`${API}/repos/${cfg.repo}/contents/${SESSIONS_PATH}/${name}`, {
      method: 'PUT',
      headers: headers(cfg.token),
      body: JSON.stringify({
        message: `mirror: add session ${base}`,
        content: Buffer.from(sessionFrontmatter(s), 'utf-8').toString('base64'),
        branch: cfg.branch,
      }),
    });
    if (!res.ok) {
      throw new Error(`GitHub write failed (${res.status}) for ${name}: ${await res.text()}`);
    }
    written.push(name);
  }
  return written;
}
