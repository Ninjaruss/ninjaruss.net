import { runExport, PROMPT_FILE } from '../../src/utils/mirror/fsOps';

const r = runExport();
if (!r.ok) {
  console.error(`✗ ${r.error}`);
  process.exit(1);
}
console.log(`Wrote ${PROMPT_FILE} (${r.lineCount} log lines).`);
console.log('');
console.log('Next steps:');
console.log('  1. Paste the contents of mirror-prompt.txt into DeepSeek chat (or any chatbot).');
console.log('  2. Save its reply as mirror-response.json in the project root.');
console.log('  3. Run: npm run mirror:import');
