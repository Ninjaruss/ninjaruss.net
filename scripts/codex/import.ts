import fs from 'node:fs';
import { gatherCorpus } from '../../src/utils/codex/corpus';
import { processModelResponse } from '../../src/utils/codex/pipeline';
import { readExistingCodex, writeCodex, report, RESPONSE_FILE, CODEX_JSON } from './io';

if (!fs.existsSync(RESPONSE_FILE)) {
  console.error(`✗ ${RESPONSE_FILE} not found.`);
  console.error('  Run `npm run codex:export`, paste codex-prompt.txt into a chatbot,');
  console.error('  and save the reply as codex-response.json first.');
  process.exit(1);
}

const text = fs.readFileSync(RESPONSE_FILE, 'utf-8');
const corpus = await gatherCorpus();
const known = new Set(corpus.map(e => e.id));
const result = processModelResponse(text, known, readExistingCodex());

report(result.warnings, result.errors);

if (!result.data) {
  console.error('\ncodex.json was NOT modified. Fix the response (or re-paste) and retry.');
  process.exit(1);
}

writeCodex(result.data);
fs.unlinkSync(RESPONSE_FILE);
console.log(`✓ Wrote ${CODEX_JSON} (${result.data.concepts.length} concepts).`);
console.log('  Review with `git diff src/data/codex.json`, then commit.');
