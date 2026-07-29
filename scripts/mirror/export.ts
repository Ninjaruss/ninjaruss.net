import fs from 'node:fs';
import { parseLogLines } from '../../src/utils/mirror/log';
import { buildMirrorPrompt } from '../../src/utils/mirror/prompt';
import { LOG_FILE, PROMPT_FILE, QUESTS_FILE } from './io';

if (!fs.existsSync(LOG_FILE)) {
  console.error('✗ mirror-log.md not found. Log a session first: npm run mirror -- done "..."');
  process.exit(1);
}

const lines = parseLogLines(fs.readFileSync(LOG_FILE, 'utf-8'));
if (lines.filter(l => l.kind === 'done').length === 0) {
  console.error('✗ No completed sessions in mirror-log.md yet.');
  process.exit(1);
}

const quests = fs.existsSync(QUESTS_FILE) ? fs.readFileSync(QUESTS_FILE, 'utf-8') : '';
fs.writeFileSync(PROMPT_FILE, buildMirrorPrompt(lines, quests));

console.log(`Wrote ${PROMPT_FILE} (${lines.length} log lines).`);
console.log('');
console.log('Next steps:');
console.log('  1. Paste the contents of mirror-prompt.txt into DeepSeek chat (or any chatbot).');
console.log('  2. Save its reply as mirror-response.json in the project root.');
console.log('  3. Run: npm run mirror:import');
