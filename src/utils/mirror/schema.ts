import { STAT_ORDER } from '../sessions';

export interface MirrorSession {
  date: string;
  title: string;
  summary: string;
  stats: string[];
  memorable?: string;
  reflection: string;
  nextStep: string;
  quest?: string;
  streamed: boolean;
}

export interface MirrorResult {
  data: MirrorSession[] | null;
  warnings: string[];
  errors: string[];
}

const MAX_REFLECTION = 600; // chars — the rumination guard, spec invariant
const MAX_NEXT_STEP = 200;

export function validateMirrorResponse(text: string): MirrorResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const fail = (): MirrorResult => ({ data: null, warnings, errors });

  const stripped = text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    errors.push('Response is not valid JSON.');
    return fail();
  }

  const sessions = (parsed as { sessions?: unknown }).sessions;
  if (!Array.isArray(sessions) || sessions.length === 0) {
    errors.push('Expected a non-empty "sessions" array.');
    return fail();
  }

  const out: MirrorSession[] = [];
  sessions.forEach((raw, i) => {
    const s = raw as Record<string, unknown>;
    const at = `sessions[${i}]`;
    const str = (k: string) => (typeof s[k] === 'string' ? (s[k] as string).trim() : '');

    const date = str('date');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
      errors.push(`${at}: invalid date "${date}".`);
    }
    if (!str('title')) errors.push(`${at}: missing title.`);
    if (!str('summary')) errors.push(`${at}: missing summary.`);

    const rawStats = Array.isArray(s.stats) ? (s.stats as unknown[]).map(String) : [];
    const stats = rawStats.filter(st => (STAT_ORDER as readonly string[]).includes(st));
    for (const st of rawStats.filter(st => !(STAT_ORDER as readonly string[]).includes(st))) {
      warnings.push(`${at}: dropped unknown stat "${st}".`);
    }
    if (stats.length === 0) errors.push(`${at}: no valid stats.`);

    const reflection = str('reflection');
    if (!reflection) errors.push(`${at}: missing reflection.`);
    if (reflection.length > MAX_REFLECTION) {
      errors.push(`${at}: reflection over ${MAX_REFLECTION} chars — too long to stay bounded.`);
    }

    const nextStep = str('nextStep');
    if (!nextStep || nextStep.length > MAX_NEXT_STEP) {
      errors.push(`${at}: nextStep must be one short sentence.`);
    }

    out.push({
      date,
      title: str('title'),
      summary: str('summary'),
      stats,
      memorable: str('memorable') || undefined,
      reflection,
      nextStep,
      quest: str('quest') || undefined,
      streamed: s.streamed === true,
    });
  });

  return errors.length > 0 ? fail() : { data: out, warnings, errors };
}
