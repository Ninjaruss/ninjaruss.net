import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { validateMirrorResponse } from '../../src/utils/mirror/schema';
import { linesAfter } from '../../src/utils/mirror/log';
import { slugify } from '../../src/utils/novel';
import { LOG_FILE, RESPONSE_FILE, SESSIONS_DIR, EXPORTED_MARK_FILE, report } from './io';

if (!fs.existsSync(RESPONSE_FILE)) {
  console.error(`✗ ${RESPONSE_FILE} not found.`);
  console.error('  Run `npm run mirror:export`, paste mirror-prompt.txt into DeepSeek chat,');
  console.error('  and save the reply as mirror-response.json first.');
  process.exit(1);
}

const result = validateMirrorResponse(fs.readFileSync(RESPONSE_FILE, 'utf-8'));
report(result.warnings, result.errors);

if (!result.data) {
  console.error('\nNothing was written. Fix the response (or re-paste) and retry.');
  process.exit(1);
}

const written: string[] = [];
for (const s of result.data) {
  let file = path.join(SESSIONS_DIR, `${s.date}-${slugify(s.title)}.md`);
  let n = 2;
  while (fs.existsSync(file)) {
    file = path.join(SESSIONS_DIR, `${s.date}-${slugify(s.title)}-${n++}.md`);
  }
  const frontmatter: Record<string, unknown> = {
    title: s.title,
    publishedAt: s.date,
    stats: s.stats,
    summary: s.summary,
    ...(s.memorable ? { memorable: s.memorable } : {}),
    ...(s.quest ? { quest: s.quest } : {}),
    ...(s.nextStep ? { nextStep: s.nextStep } : {}),
    ...(s.reflection ? { reflection: s.reflection } : {}),
    streamed: s.streamed,
    draft: false,
  };
  fs.writeFileSync(file, matter.stringify('', frontmatter));
  written.push(path.basename(file));
}

fs.unlinkSync(RESPONSE_FILE);

// Preserve any log lines recorded after the last export (rather than truncating
// unconditionally) — otherwise sessions logged between export and import are lost.
if (fs.existsSync(LOG_FILE)) {
  if (fs.existsSync(EXPORTED_MARK_FILE)) {
    const mark = fs.readFileSync(EXPORTED_MARK_FILE, 'utf-8').trim();
    const remaining = linesAfter(fs.readFileSync(LOG_FILE, 'utf-8'), mark);
    const rewritten = remaining.map(l => `- ${l.ts} | ${l.kind} | ${l.text}`).join('\n');
    fs.writeFileSync(LOG_FILE, rewritten ? rewritten + '\n' : '');
    fs.unlinkSync(EXPORTED_MARK_FILE);
  } else {
    fs.writeFileSync(LOG_FILE, ''); // no export mark — whole log was just imported
  }
}

console.log(`✓ Wrote ${written.length} session(s):`);
for (const f of written) console.log(`  src/content/sessions/${f}`);
console.log('  Review with `git diff src/content/sessions/`, then commit.');
