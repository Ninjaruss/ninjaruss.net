import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { lifeExportSchema, type LifeExport } from './lifeExport';

/** Only the managed PUBLIC snapshot is read. Missing means nothing shared yet;
 * malformed content fails the build instead of quietly hiding publications. */
export async function loadLifeExport(): Promise<LifeExport> {
  let source: string;
  try {
    source = await readFile(join(process.cwd(), 'src/data/life.json'), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { schemaVersion: 1, records: [] };
    throw error;
  }
  return lifeExportSchema.parse(JSON.parse(source));
}

export type LifeRecord = LifeExport['records'][number];

export function linkedLifeRecords(entry: LifeRecord, records: LifeRecord[]): LifeRecord[] {
  const ids = entry.kind === 'experience' ? [...entry.people, ...entry.places, ...entry.events]
    : entry.kind === 'place' ? [entry.region]
    : entry.kind === 'event' ? entry.places
    : entry.kind === 'region' && entry.parent ? [entry.parent] : [];
  return records.filter(record => ids.includes(record.id));
}

export function lifeEncounters(entry: LifeRecord, records: LifeRecord[]): Extract<LifeRecord, {kind: 'experience'}>[] {
  return records.filter((record): record is Extract<LifeRecord, {kind: 'experience'}> =>
    record.kind === 'experience' && linkedLifeRecords(record, records).some(link => link.id === entry.id),
  ).sort((a, b) => b.date.localeCompare(a.date));
}
