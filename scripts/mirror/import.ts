import fs from 'node:fs';
import { runImport, RESPONSE_FILE } from '../../src/utils/mirror/fsOps';

if (!fs.existsSync(RESPONSE_FILE)) {
  console.error(`✗ ${RESPONSE_FILE} not found.`);
  console.error('  Run `npm run mirror:export`, paste mirror-prompt.txt into DeepSeek chat,');
  console.error('  and save the reply as mirror-response.json first.');
  process.exit(1);
}

const outcome = runImport(fs.readFileSync(RESPONSE_FILE, 'utf-8'));
for (const w of outcome.warnings) console.warn(`⚠ ${w}`);
for (const e of outcome.errors) console.error(`✗ ${e}`);

if (!outcome.ok) {
  console.error('\nNothing was written. Fix the response (or re-paste) and retry.');
  process.exit(1);
}

fs.unlinkSync(RESPONSE_FILE);
console.log(`✓ Wrote ${outcome.written.length} session(s):`);
for (const f of outcome.written) console.log(`  src/content/sessions/${f}`);
console.log('  Review with `git diff src/content/sessions/`, then commit.');
