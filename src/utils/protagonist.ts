export interface Protagonist {
  name: string;
  epithet: string | null;
  portrait: string | null;
}

export const DEFAULT_PROTAGONIST: Protagonist = {
  name: 'NINJARUSS',
  epithet: null,
  portrait: null,
};

// Minimal frontmatter reader for _protagonist.md — three known string keys,
// everything else ignored. Malformed/missing input degrades to defaults.
export function parseProtagonist(markdown: string): Protagonist {
  const result: Protagonist = { ...DEFAULT_PROTAGONIST };
  const fm = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return result;
  for (const line of fm[1].split(/\r?\n/)) {
    const m = line.match(/^(name|epithet|portrait):\s*(.*?)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^['"]|['"]$/g, '').trim();
    if (!value) continue;
    if (m[1] === 'name') result.name = value;
    else if (m[1] === 'epithet') result.epithet = value;
    else result.portrait = value;
  }
  return result;
}
