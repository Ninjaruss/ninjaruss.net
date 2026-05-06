export const STAT_ORDER = [
  'Determination',
  'Insight',
  'Chaos',
  'Sincerity',
  'Expression',
] as const;

export type StatName = (typeof STAT_ORDER)[number];
export type StatMode = 'recent' | 'all';

export function tallyStats(
  entries: { data: { publishedAt: Date; stats: string[] } }[],
  mode: StatMode
): Partial<Record<StatName, number>> {
  const sorted = [...entries].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
  const pool = mode === 'recent' ? sorted.slice(0, 10) : sorted;
  const tally: Partial<Record<StatName, number>> = {};
  for (const entry of pool) {
    for (const stat of entry.data.stats) {
      if ((STAT_ORDER as readonly string[]).includes(stat)) {
        const s = stat as StatName;
        tally[s] = (tally[s] ?? 0) + 1;
      }
    }
  }
  return tally;
}

export function buildRadarPoints(
  tallies: Partial<Record<string, number>>,
  maxVal: number,
  cx: number,
  cy: number,
  r: number
): string {
  return STAT_ORDER.map((stat, i) => {
    const angle = (-90 + i * 72) * (Math.PI / 180);
    const val = tallies[stat] ?? 0;
    const ratio = maxVal > 0 ? val / maxVal : 0;
    const x = cx + r * ratio * Math.cos(angle);
    const y = cy + r * ratio * Math.sin(angle);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

export function buildGuidePoints(
  fraction: number,
  cx: number,
  cy: number,
  r: number
): string {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (-90 + i * 72) * (Math.PI / 180);
    const x = cx + r * fraction * Math.cos(angle);
    const y = cy + r * fraction * Math.sin(angle);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

export function parseQuestMenu(markdown: string): { category: string; quests: string[] }[] {
  const lines = markdown.split('\n');
  const result: { category: string; quests: string[] }[] = [];
  let current: { category: string; quests: string[] } | null = null;

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      if (current) result.push(current);
      current = { category: heading[1].trim(), quests: [] };
      continue;
    }
    const item = line.match(/^[-*]\s+(.+)/);
    if (item && current) {
      current.quests.push(item[1].trim());
    }
  }
  if (current) result.push(current);
  return result;
}
