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

/** Lines in `markdown` that are not present in `exported` (exact-line match). */
export function linesNotIn(markdown: string, exported: string): LogLine[] {
  const gone = new Set(
    parseLogLines(exported).map(l => `- ${l.ts} | ${l.kind} | ${l.text}`)
  );
  return parseLogLines(markdown).filter(
    l => !gone.has(`- ${l.ts} | ${l.kind} | ${l.text}`)
  );
}

/** Merge pasted log text into existing log content. Valid new lines are
 *  appended in pasted order; exact-duplicate lines and junk are dropped,
 *  including duplicates within the pasted batch itself. */
export function mergeLogLines(existing: string, pasted: string): string {
  const have = new Set(
    parseLogLines(existing).map(l => `- ${l.ts} | ${l.kind} | ${l.text}`)
  );
  const fresh: string[] = [];
  for (const l of parseLogLines(pasted)) {
    const line = `- ${l.ts} | ${l.kind} | ${l.text}`;
    if (have.has(line)) continue;
    have.add(line);
    fresh.push(line);
  }
  if (fresh.length === 0) return existing;
  const base = existing.endsWith('\n') || existing === '' ? existing : existing + '\n';
  return base + fresh.join('\n') + '\n';
}
