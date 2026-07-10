import fs from 'node:fs';
import path from 'node:path';
import type { MindData } from '../../src/utils/mind/schema';

export const MIND_JSON = path.resolve('src/data/mind.json');
export const PROMPT_FILE = path.resolve('mind-prompt.txt');
export const RESPONSE_FILE = path.resolve('mind-response.json');

export function readExistingMind(): MindData | null {
  try {
    return JSON.parse(fs.readFileSync(MIND_JSON, 'utf-8')) as MindData;
  } catch {
    return null;
  }
}

export function writeMind(data: MindData): void {
  fs.mkdirSync(path.dirname(MIND_JSON), { recursive: true });
  fs.writeFileSync(MIND_JSON, JSON.stringify(data, null, 2) + '\n');
}

export function report(warnings: string[], errors: string[]): void {
  for (const w of warnings) console.warn(`⚠ ${w}`);
  for (const e of errors) console.error(`✗ ${e}`);
}
