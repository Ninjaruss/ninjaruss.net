import fs from 'node:fs';
import { gatherCorpus } from '../../src/utils/mind/corpus';
import { buildMindPrompt } from '../../src/utils/mind/prompt';
import { readExistingMind, PROMPT_FILE } from './io';

const corpus = await gatherCorpus();
const prompt = buildMindPrompt(corpus, readExistingMind());
fs.writeFileSync(PROMPT_FILE, prompt);

console.log(`Wrote ${PROMPT_FILE} (${corpus.length} entries, ${prompt.length} chars).`);
console.log('');
console.log('Next steps:');
console.log('  1. Paste the contents of mind-prompt.txt into any chatbot.');
console.log('  2. Save its reply as mind-response.json in the project root.');
console.log('  3. Run: npm run mind:import');
