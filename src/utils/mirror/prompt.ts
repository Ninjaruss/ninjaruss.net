import { STAT_ORDER } from '../sessions';
import type { LogLine } from './log';

export function buildMirrorPrompt(lines: LogLine[], questFileRaw: string): string {
  const log = lines.map(l => `- ${l.ts} | ${l.kind} | ${l.text}`).join('\n');
  return `You are a mirror, not a coach. You reflect what was already done — you
never scold, never mention gaps or missed days, never invent tasks that are not
in the quest menu below.

Here are raw session log lines (start = a stated intention, done = a completed
session, in the author's own rough words):

${log}

Here is the author's quest menu (their own words — the only source of quests):

${questFileRaw}

Group the log lines into sessions (a "done" line is a session; pair it with the
preceding "start" line when they clearly belong together). For each session
output:

- date: "YYYY-MM-DD" from the done line's timestamp
- title: a short evocative title in the author's register (≤ 60 chars)
- summary: one factual sentence about what was done
- stats: 1-2 of exactly these names: ${STAT_ORDER.join(', ')}
- memorable: (optional) a striking phrase lifted from the author's own words
- reflection: 2-3 sentences MAX. Bounded and forward-pointing: name what the
  action says about who the author is becoming, then stop. No open questions,
  no doubts, no "you should have". It must resolve, not loop.
- nextStep: exactly one next step — concrete, startable within 48 hours,
  drawn from or consistent with the quest menu. One sentence.
- quest: (optional) the exact text of the Active quest this session advanced,
  verbatim from the menu, if any
- streamed: true only if the author's words say it was streamed/live

Reply with ONLY the JSON, no prose, no code fences:

{"sessions": [{"date": "...", "title": "...", "summary": "...", "stats": ["..."], "memorable": "...", "reflection": "...", "nextStep": "...", "quest": "...", "streamed": false}]}

Omit the "memorable" and "quest" keys entirely when they do not genuinely apply — do not fabricate them.`;
}
