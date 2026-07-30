import { execFile } from 'node:child_process';
import { type LogKind } from '../../src/utils/mirror/log';
import { appendLog } from '../../src/utils/mirror/fsOps';

const [, , command, ...rest] = process.argv;
const text = rest.join(' ').trim();

if ((command !== 'start' && command !== 'done') || !text) {
  console.error('Usage:');
  console.error('  npm run mirror -- start "after lunch, read Wagotabi 20 min at my desk"');
  console.error('  npm run mirror -- done  "read a chapter, brain fog, pushed through"');
  process.exit(1);
}

appendLog(command as LogKind, text);

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
