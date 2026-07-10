import fs from 'node:fs';
import { gatherCorpus } from '../../src/utils/mind/corpus';
import { processModelResponse } from '../../src/utils/mind/pipeline';
import { readExistingMind, writeMind, report, RESPONSE_FILE, MIND_JSON } from './io';

if (!fs.existsSync(RESPONSE_FILE)) {
  console.error(`✗ ${RESPONSE_FILE} not found.`);
  console.error('  Run `npm run mind:export`, paste mind-prompt.txt into a chatbot,');
  console.error('  and save the reply as mind-response.json first.');
  process.exit(1);
}

const text = fs.readFileSync(RESPONSE_FILE, 'utf-8');
const corpus = await gatherCorpus();
const known = new Set(corpus.map(e => e.id));
const result = processModelResponse(text, known, readExistingMind());

report(result.warnings, result.errors);

if (!result.data) {
  console.error('\nmind.json was NOT modified. Fix the response (or re-paste) and retry.');
  process.exit(1);
}

writeMind(result.data);
fs.unlinkSync(RESPONSE_FILE);
console.log(`✓ Wrote ${MIND_JSON} (${result.data.concepts.length} concepts).`);
console.log('  Review with `git diff src/data/mind.json`, then commit.');
