import fs from 'node:fs';
import path from 'node:path';
import type { CodexData } from '../../src/utils/codex/schema';

export const CODEX_JSON = path.resolve('src/data/codex.json');
export const PROMPT_FILE = path.resolve('codex-prompt.txt');
export const RESPONSE_FILE = path.resolve('codex-response.json');

export function readExistingCodex(): CodexData | null {
  try {
    return JSON.parse(fs.readFileSync(CODEX_JSON, 'utf-8')) as CodexData;
  } catch {
    return null;
  }
}

export function writeCodex(data: CodexData): void {
  fs.mkdirSync(path.dirname(CODEX_JSON), { recursive: true });
  fs.writeFileSync(CODEX_JSON, JSON.stringify(data, null, 2) + '\n');
}

export function report(warnings: string[], errors: string[]): void {
  for (const w of warnings) console.warn(`⚠ ${w}`);
  for (const e of errors) console.error(`✗ ${e}`);
}
