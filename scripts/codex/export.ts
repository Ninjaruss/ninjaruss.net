import fs from 'node:fs';
import { gatherCorpus } from '../../src/utils/codex/corpus';
import { buildCodexPrompt } from '../../src/utils/codex/prompt';
import { readExistingCodex, PROMPT_FILE } from './io';

const corpus = await gatherCorpus();
const prompt = buildCodexPrompt(corpus, readExistingCodex());
fs.writeFileSync(PROMPT_FILE, prompt);

console.log(`Wrote ${PROMPT_FILE} (${corpus.length} entries, ${prompt.length} chars).`);
console.log('');
console.log('Next steps:');
console.log('  1. Paste the contents of codex-prompt.txt into any chatbot.');
console.log('  2. Save its reply as codex-response.json in the project root.');
console.log('  3. Run: npm run codex:import');
