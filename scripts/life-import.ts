import { createHash, randomUUID } from 'node:crypto';
import { readFile, writeFile, rename, mkdir, rm, lstat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalLifeExport } from '../src/utils/lifeExport';
import { ZodError } from 'astro/zod';

const destination = fileURLToPath(new URL('../src/data/life.json', import.meta.url));

export function inspectLifeExport(input: unknown) {
  const content = canonicalLifeExport(input);
  return { content, sha256: createHash('sha256').update(content).digest('hex') };
}

export async function importLifeExport(input: unknown, approvedSha256: string, output = destination) {
  const result = inspectLifeExport(input);
  if (result.sha256 !== approvedSha256) throw new Error('Approval hash does not match this public snapshot. Review the current snapshot again.');
  const parent = dirname(output);
  await mkdir(parent, { recursive: true });
  // Do not follow a symlink at the managed destination or its immediate parent.
  if ((await lstat(parent)).isSymbolicLink()) throw new Error('Export directory must not be a symlink');
  const existing = await lstat(output).catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (existing?.isSymbolicLink()) throw new Error('Export destination must not be a symlink');
  const temporary = `${output}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, result.content, { flag: 'wx' });
    await rename(temporary, output);
  } finally {
    await rm(temporary, { force: true });
  }
  return result.sha256;
}

async function main() {
  const [command, source, option, approvedSha256, ...extra] = process.argv.slice(2);
  const valid = source && extra.length === 0 && (
    (command === 'check' && option === undefined) ||
    (command === 'import' && option === '--approve' && /^[a-f0-9]{64}$/.test(approvedSha256 ?? ''))
  );
  if (!valid) throw new Error('Usage: npm run life:check -- /path/to/public.json OR npm run life:import -- /path/to/public.json --approve <sha256>');
  const input = JSON.parse(await readFile(source, 'utf8'));
  if (command === 'check') {
    console.log(`Valid public snapshot. Review its full text before importing.\nSHA256 ${inspectLifeExport(input).sha256}`);
  } else {
    const hash = await importLifeExport(input, approvedSha256);
    console.log(`Imported public snapshot to src/data/life.json\nSHA256 ${hash}\nReview git diff before committing. No deployment was performed.`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    // Do not echo input values: a rejected file may accidentally contain secrets.
    console.error(error instanceof ZodError ? 'Invalid public snapshot; check the public contract and remove unknown fields.' : error instanceof SyntaxError ? 'Invalid JSON document.' : error.message);
    process.exitCode = 1;
  });
}
