import { STAT_ORDER, type StatName } from './sessions';

export interface CurrentArc {
  arc: string;
  stat: StatName | null;
  updated: string;
  decision: string;
}

/**
 * Parses the "## Current Arc" section of `_quests.md`:
 *
 * ## Current Arc
 *
 * **Arc:** Arc II — Learning to Speak
 * **Stat:** Insight
 * **Updated:** August 2026
 *
 * Chat's split on whether Rain confronts Vesper directly or keeps stalling.
 *
 * Returns null if the section is absent, or if it's missing the Arc title or
 * the decision paragraph — a half-filled card would read as broken, so an
 * incomplete section hides the whole card rather than rendering blanks.
 * An unrecognized/missing `Stat` value degrades to `stat: null` (neutral
 * styling) rather than failing the parse — this file is hand-edited and a
 * typo shouldn't be able to break the build.
 */
export function parseCurrentArc(markdown: string): CurrentArc | null {
  const lines = markdown.split(/\r?\n/);
  let inSection = false;
  let arc = '';
  let statRaw = '';
  let updated = '';
  const decisionLines: string[] = [];

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      if (inSection) break; // hit the next section — stop collecting
      inSection = heading[1].trim().toLowerCase() === 'current arc';
      continue;
    }
    if (!inSection) continue;

    const arcMatch = line.match(/^\*\*Arc:\*\*\s*(.+)/i);
    if (arcMatch) { arc = arcMatch[1].trim(); continue; }

    const statMatch = line.match(/^\*\*Stat:\*\*\s*(.+)/i);
    if (statMatch) { statRaw = statMatch[1].trim(); continue; }

    const updatedMatch = line.match(/^\*\*Updated:\*\*\s*(.+)/i);
    if (updatedMatch) { updated = updatedMatch[1].trim(); continue; }

    const text = line.trim();
    if (text) decisionLines.push(text);
  }

  if (!arc || decisionLines.length === 0) return null;

  const stat = (STAT_ORDER as readonly string[]).find(
    s => s.toLowerCase() === statRaw.toLowerCase()
  ) as StatName | undefined;

  return {
    arc,
    stat: stat ?? null,
    updated,
    decision: decisionLines.join(' '),
  };
}
