import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { formatLogLine, LOG_FILE_NAME, type LogKind } from '../../src/utils/mirror/log';

const [, , command, ...rest] = process.argv;
const text = rest.join(' ').trim();

if ((command !== 'start' && command !== 'done') || !text) {
  console.error('Usage:');
  console.error('  npm run mirror -- start "after lunch, read Wagotabi 20 min at my desk"');
  console.error('  npm run mirror -- done  "read a chapter, brain fog, pushed through"');
  process.exit(1);
}

const logFile = path.resolve(LOG_FILE_NAME);
fs.appendFileSync(logFile, formatLogLine(command as LogKind, text, new Date()) + '\n');

const gold = (s: string) => `\x1b[1;33m${s}\x1b[0m`;

if (command === 'done') {
  // The flourish is the CUE — celebrate for real (Fogg's Shine). This just marks the moment.
  console.log(gold('★ SESSION COMPLETE ★  recorded.'));
  if (process.platform === 'darwin') {
    execFile('afplay', ['/System/Library/Sounds/Hero.aiff'], () => {});
  } else {
    process.stdout.write('\x07');
  }
} else {
  console.log(gold('▶ intention set. go.'));
}
