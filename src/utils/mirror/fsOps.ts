import fs from 'node:fs';
import path from 'node:path';
import { formatLogLine, parseLogLines, linesNotIn, mergeLogLines, LOG_FILE_NAME, type LogKind } from './log';
import { buildMirrorPrompt } from './prompt';
import { validateMirrorResponse } from './schema';
import { sessionFrontmatter } from './github';
import { slugify } from '../novel';

export const LOG_FILE = path.resolve(LOG_FILE_NAME);
export const PROMPT_FILE = path.resolve('mirror-prompt.txt');
export const RESPONSE_FILE = path.resolve('mirror-response.json');
export const EXPORTED_MARK_FILE = path.resolve('mirror-exported.txt');
export const SESSIONS_DIR = path.resolve('src/content/sessions');
export const QUESTS_FILE = path.resolve('src/content/sessions/_quests.md');

export function appendLog(kind: LogKind, text: string, at: Date = new Date()): string {
  const line = formatLogLine(kind, text, at);
  fs.appendFileSync(LOG_FILE, line + '\n');
  return line;
}

export function mergePastedLog(pasted: string): { added: number } {
  const existing = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '';
  const merged = mergeLogLines(existing, pasted);
  const added = parseLogLines(merged).length - parseLogLines(existing).length;
  if (added > 0) fs.writeFileSync(LOG_FILE, merged);
  return { added };
}

export function runExport(): { ok: true; prompt: string; lineCount: number } | { ok: false; error: string } {
  if (!fs.existsSync(LOG_FILE)) {
    return { ok: false, error: 'mirror-log.md not found. Log a session first.' };
  }
  const lines = parseLogLines(fs.readFileSync(LOG_FILE, 'utf-8'));
  if (lines.filter(l => l.kind === 'done').length === 0) {
    return { ok: false, error: 'No completed sessions in mirror-log.md yet.' };
  }
  const quests = fs.existsSync(QUESTS_FILE) ? fs.readFileSync(QUESTS_FILE, 'utf-8') : '';
  const prompt = buildMirrorPrompt(lines, quests);
  fs.writeFileSync(PROMPT_FILE, prompt);
  const snapshot = lines.map(l => `- ${l.ts} | ${l.kind} | ${l.text}`).join('\n');
  fs.writeFileSync(EXPORTED_MARK_FILE, snapshot);
  return { ok: true, prompt, lineCount: lines.length };
}

export interface ImportOutcome {
  ok: boolean;
  written: string[];
  warnings: string[];
  errors: string[];
}

/** Validate a model response and write session entries. Pass raw response text. */
export function runImport(responseText: string): ImportOutcome {
  const result = validateMirrorResponse(responseText);
  if (!result.data) {
    return { ok: false, written: [], warnings: result.warnings, errors: result.errors };
  }
  const written: string[] = [];
  for (const s of result.data) {
    let file = path.join(SESSIONS_DIR, `${s.date}-${slugify(s.title)}.md`);
    let n = 2;
    while (fs.existsSync(file)) {
      file = path.join(SESSIONS_DIR, `${s.date}-${slugify(s.title)}-${n++}.md`);
    }
    fs.writeFileSync(file, sessionFrontmatter(s));
    written.push(path.basename(file));
  }
  consumeLog();
  return { ok: true, written, warnings: result.warnings, errors: [] };
}

/** After a successful import: keep only log lines not present in the exported snapshot. */
function consumeLog(): void {
  if (fs.existsSync(EXPORTED_MARK_FILE)) {
    const snapshot = fs.readFileSync(EXPORTED_MARK_FILE, 'utf-8');
    const log = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf-8') : '';
    const keep = linesNotIn(log, snapshot)
      .map(l => `- ${l.ts} | ${l.kind} | ${l.text}`)
      .join('\n');
    fs.writeFileSync(LOG_FILE, keep ? keep + '\n' : '');
    fs.unlinkSync(EXPORTED_MARK_FILE);
  } else if (fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '');
  }
}
