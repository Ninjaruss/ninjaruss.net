import { spawnSync } from 'node:child_process';
import { gatherCorpus } from '../../src/utils/mind/corpus';
import { buildMindPrompt } from '../../src/utils/mind/prompt';
import { processModelResponse } from '../../src/utils/mind/pipeline';
import { readExistingMind, writeMind, report, MIND_JSON } from './io';

const corpus = await gatherCorpus();
const existing = readExistingMind();
const prompt = buildMindPrompt(corpus, existing);

console.log(`Condensing ${corpus.length} entries via the claude CLI...`);
const proc = spawnSync('claude', ['-p'], {
  input: prompt,
  encoding: 'utf-8',
  maxBuffer: 32 * 1024 * 1024,
});

if (proc.error || proc.status !== 0) {
  console.error('✗ Failed to run the `claude` CLI.');
  if (proc.error) console.error(`  ${proc.error.message}`);
  if (proc.stderr) console.error(`  ${proc.stderr.trim()}`);
  console.error('');
  console.error('  Make sure Claude Code is installed and authenticated (a paid');
  console.error('  subscription or ANTHROPIC_API_KEY). No Claude access? Use the');
  console.error('  free manual mode instead: npm run mind:export');
  process.exit(1);
}

const known = new Set(corpus.map(e => e.id));
const result = processModelResponse(proc.stdout, known, existing);
report(result.warnings, result.errors);

if (!result.data) {
  console.error('\nThe model response failed validation; mind.json was NOT modified. Re-run to retry.');
  process.exit(1);
}

writeMind(result.data);
console.log(`✓ Wrote ${MIND_JSON} (${result.data.concepts.length} concepts).`);
console.log('  Review with `git diff src/data/mind.json`, then commit.');
