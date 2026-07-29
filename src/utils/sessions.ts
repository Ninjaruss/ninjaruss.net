export const STAT_ORDER = [
  'Determination',
  'Insight',
  'Expression',
  'Sincerity',
  'Chaos',
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

export const STAT_CEILING = 100;

// Scale factor tuned so 50 raw sessions → display value ≈ 100
const LOG_SCALE_FACTOR = STAT_CEILING / Math.log(1 + 50);

export function applyLogScale(raw: number): number {
  return Math.min(STAT_CEILING, Math.log(1 + raw) * LOG_SCALE_FACTOR);
}

export function scaleAllTallies(
  tallies: Partial<Record<StatName, number>>
): Partial<Record<StatName, number>> {
  const result: Partial<Record<StatName, number>> = {};
  for (const stat of STAT_ORDER) {
    result[stat] = applyLogScale(tallies[stat] ?? 0);
  }
  return result;
}

export function parseStreamIdeas(markdown: string): Partial<Record<StatName, string[]>> {
  const lines = markdown.split('\n');
  const result: Partial<Record<StatName, string[]>> = {};
  let current: StatName | null = null;

  for (const line of lines) {
    const anyHeading = line.match(/^##\s+(.+)/);
    if (anyHeading) {
      const heading = line.match(/^##\s+Ideas\s+—\s+(.+)/);
      const name = heading ? (heading[1].trim() as StatName) : null;
      if (name && (STAT_ORDER as readonly string[]).includes(name)) {
        current = name;
        result[current] = [];
      } else {
        current = null;
      }
      continue;
    }
    const item = line.match(/^[-*]\s+(.+)/);
    if (item && current) {
      result[current]!.push(item[1].trim());
    }
  }
  return result;
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

export interface QuestItem {
  text: string;
  stat?: StatName;
}

export interface CompletedQuest extends QuestItem {
  date?: string;
}

export interface QuestFile {
  question: string;
  active: QuestItem[];
  ideas: Partial<Record<StatName, string[]>>;
  completed: CompletedQuest[];
}

function parseStatTag(text: string): QuestItem {
  const m = text.match(/^\[([^\]]+)\]\s*(.+)/);
  if (m && (STAT_ORDER as readonly string[]).includes(m[1])) {
    return { text: m[2].trim(), stat: m[1] as StatName };
  }
  return { text: text.trim() };
}

export function parseQuestFile(markdown: string): QuestFile {
  const result: QuestFile = { question: '', active: [], ideas: {}, completed: [] };
  let section: 'question' | 'active' | 'ideas' | 'completed' | null = null;
  let currentStat: StatName | null = null;

  for (const line of markdown.split('\n')) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      const h = heading[1].trim();
      const ideas = h.match(/^Ideas\s+—\s+(.+)/);
      if (h === 'The Question') section = 'question';
      else if (h === 'Active' || h === 'Active Quests') section = 'active';
      else if (h === 'Completed') section = 'completed';
      else if (ideas && (STAT_ORDER as readonly string[]).includes(ideas[1].trim())) {
        section = 'ideas';
        currentStat = ideas[1].trim() as StatName;
        result.ideas[currentStat] = [];
      } else {
        section = null;
      }
      continue;
    }
    if (section === 'question') {
      const text = line.trim();
      if (text && !result.question) result.question = text;
      continue;
    }
    const item = line.match(/^[-*]\s+(.+)/);
    if (!item) continue;
    if (section === 'active') {
      result.active.push(parseStatTag(item[1]));
    } else if (section === 'ideas' && currentStat) {
      result.ideas[currentStat]!.push(item[1].trim());
    } else if (section === 'completed') {
      const dm = item[1].match(/^(\d{4}-\d{2}-\d{2})\s+—\s+(.+)/);
      if (dm) result.completed.push({ date: dm[1], ...parseStatTag(dm[2]) });
      else result.completed.push(parseStatTag(item[1]));
    }
  }
  return result;
}

export function buildDonutArcs(
  tallies: Partial<Record<StatName, number>>,
  r: number,
  gapPx = 3
): { stat: StatName; dasharray: string; dashoffset: number }[] {
  const total = STAT_ORDER.reduce((s, k) => s + (tallies[k] ?? 0), 0);
  const circ = 2 * Math.PI * r;
  const nNonZero = STAT_ORDER.filter(k => (tallies[k] ?? 0) > 0).length;
  const available = total > 0 ? circ - gapPx * nNonZero : 0;
  let offset = 0;
  return STAT_ORDER.map(stat => {
    const count = tallies[stat] ?? 0;
    const len = total > 0 ? (count / total) * available : 0;
    const dasharray = `${len.toFixed(2)} ${(circ - len).toFixed(2)}`;
    const dashoffset = offset === 0 ? 0 : -offset;
    offset += len > 0 ? len + gapPx : 0;
    return { stat, dasharray, dashoffset };
  });
}
