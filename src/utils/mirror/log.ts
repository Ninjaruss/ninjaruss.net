export const LOG_FILE_NAME = 'mirror-log.md';

export type LogKind = 'start' | 'done';

export interface LogLine {
  ts: string;
  kind: LogKind;
  text: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local time on purpose — sessions happen in the author's day, not UTC's. */
export function formatLogLine(kind: LogKind, text: string, at: Date): string {
  const ts = `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())} ${pad(at.getHours())}:${pad(at.getMinutes())}`;
  return `- ${ts} | ${kind} | ${text.replace(/\s*\n\s*/g, ' ').trim()}`;
}

export function parseLogLines(markdown: string): LogLine[] {
  const out: LogLine[] = [];
  for (const line of markdown.split('\n')) {
    const m = line.match(/^-\s+(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\s+\|\s+(start|done)\s+\|\s+(.+)/);
    if (m) out.push({ ts: m[1], kind: m[2] as LogKind, text: m[3].trim() });
  }
  return out;
}

/** Lines with ts strictly greater than lastTs (lexicographic works for this format). */
export function linesAfter(markdown: string, lastTs: string): LogLine[] {
  return parseLogLines(markdown).filter(l => l.ts > lastTs);
}

/** Merge pasted log text into existing log content. Valid new lines are
 *  appended in pasted order; exact-duplicate lines and junk are dropped. */
export function mergeLogLines(existing: string, pasted: string): string {
  const have = new Set(
    parseLogLines(existing).map(l => `- ${l.ts} | ${l.kind} | ${l.text}`)
  );
  const fresh = parseLogLines(pasted)
    .map(l => `- ${l.ts} | ${l.kind} | ${l.text}`)
    .filter(line => !have.has(line));
  if (fresh.length === 0) return existing;
  const base = existing.endsWith('\n') || existing === '' ? existing : existing + '\n';
  return base + fresh.join('\n') + '\n';
}
