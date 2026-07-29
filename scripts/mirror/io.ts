import path from 'node:path';

export const LOG_FILE = path.resolve('mirror-log.md');
export const PROMPT_FILE = path.resolve('mirror-prompt.txt');
export const RESPONSE_FILE = path.resolve('mirror-response.json');
export const SESSIONS_DIR = path.resolve('src/content/sessions');
export const QUESTS_FILE = path.resolve('src/content/sessions/_quests.md');

export function report(warnings: string[], errors: string[]): void {
  for (const w of warnings) console.warn(`⚠ ${w}`);
  for (const e of errors) console.error(`✗ ${e}`);
}
