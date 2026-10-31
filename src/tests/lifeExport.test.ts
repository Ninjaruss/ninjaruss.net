import { describe, it, expect, afterEach } from 'vitest';
import { mkdtemp, readFile, rm, symlink, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lifeExportSchema } from '../utils/lifeExport';
import { inspectLifeExport, importLifeExport } from '../../scripts/life-import';

// Synthetic fixtures only. Never substitute actual private archive material.
const fixture = () => ({ schemaVersion: 1, records: [
  { kind: 'region', id: 'sample-region', title: 'Sample region', body: 'Synthetic map.' },
  { kind: 'place', id: 'sample-place', title: 'Sample venue', body: 'Synthetic place.', region: 'sample-region', position: { x: 20, y: 40 } },
  { kind: 'person', id: 'sample-person', title: 'Public pseudonym', body: 'Individually reviewed public profile.' },
  { kind: 'event', id: 'sample-event', title: 'Sample gathering', body: 'Synthetic series.', places: ['sample-place'] },
  { kind: 'experience', id: 'sample-memory', title: 'Sample memory', body: 'Synthetic public text.', date: '2026-10-21', people: ['sample-person'], places: ['sample-place'], events: ['sample-event'] },
] });

describe('public life export boundary', () => {
  it('accepts all five public record types and a complete empty snapshot for removal', () => {
    expect(lifeExportSchema.parse(fixture()).records).toHaveLength(5);
    expect(lifeExportSchema.parse({ schemaVersion: 1, records: [] }).records).toEqual([]);
  });
  it.each(['privateNotes', 'sourcePath', 'aiPermission', 'reviewReport', 'photos'])('rejects unexpected record field %s', field => {
    const input = fixture();
    Object.assign(input.records[0], { [field]: 'must stay private' });
    expect(lifeExportSchema.safeParse(input).success).toBe(false);
  });
  it('rejects extra top-level fields and nested map fields', () => {
    expect(lifeExportSchema.safeParse({ ...fixture(), privateArchive: {} }).success).toBe(false);
    const input = fixture();
    Object.assign(input.records[1].position!, { gps: 'private' });
    expect(lifeExportSchema.safeParse(input).success).toBe(false);
  });
  it('requires explicit public profiles for referenced people', () => {
    const input = fixture();
    input.records = input.records.filter(entry => entry.kind !== 'person');
    expect(lifeExportSchema.safeParse(input).success).toBe(false);
  });
  it('rejects duplicate IDs and references to the wrong record type', () => {
    const duplicate = fixture();
    duplicate.records.push(duplicate.records[0]);
    expect(lifeExportSchema.safeParse(duplicate).success).toBe(false);
    const wrong = fixture();
    wrong.records[4].people = ['sample-place'];
    expect(lifeExportSchema.safeParse(wrong).success).toBe(false);
  });
  it.each(['2026-02-30', '2026-13-01', '2026-1-01'])('rejects invalid calendar date %s', value => {
    const input = fixture();
    input.records[4].date = value;
    expect(lifeExportSchema.safeParse(input).success).toBe(false);
  });
  it('rejects region cycles, unsafe IDs and positions outside the map', () => {
    const cycle = fixture();
    Object.assign(cycle.records[0], { parent: 'sample-region' });
    expect(lifeExportSchema.safeParse(cycle).success).toBe(false);
    const path = fixture();
    path.records[0].id = '../private';
    expect(lifeExportSchema.safeParse(path).success).toBe(false);
    const position = fixture();
    position.records[1].position!.x = 101;
    expect(lifeExportSchema.safeParse(position).success).toBe(false);
  });
});

const temporary: string[] = [];
afterEach(async () => { await Promise.all(temporary.splice(0).map(path => rm(path, { recursive: true, force: true }))); });
async function outputPath() {
  const directory = await mkdtemp(join(tmpdir(), 'life-export-test-'));
  temporary.push(directory);
  return join(directory, 'life.json');
}

describe('public snapshot import', () => {
  it('keeps hashes stable across object key ordering, and invalidates them for changed content', () => {
    const input = fixture();
    expect(inspectLifeExport({ records: input.records, schemaVersion: 1 }).sha256).toBe(inspectLifeExport(input).sha256);
    const before = inspectLifeExport(input).sha256;
    input.records[2].body += ' Updated.';
    expect(inspectLifeExport(input).sha256).not.toBe(before);
  });
  it('preserves the previous snapshot when validation or approval fails', async () => {
    const output = await outputPath();
    const input = fixture();
    const approved = inspectLifeExport(input);
    await importLifeExport(input, approved.sha256, output);
    input.records[2].body += ' Unreviewed change.';
    await expect(importLifeExport(input, approved.sha256, output)).rejects.toThrow('Approval hash');
    await expect(importLifeExport({ ...input, raw: 'secret' }, approved.sha256, output)).rejects.toThrow();
    expect(await readFile(output, 'utf8')).toBe(approved.content);
    expect(await readdir(join(output, '..'))).toEqual(['life.json']);
  });
  it('replaces the full snapshot so omissions remove previously exported records', async () => {
    const output = await outputPath();
    const input = fixture();
    await importLifeExport(input, inspectLifeExport(input).sha256, output);
    const empty = { schemaVersion: 1, records: [] };
    await importLifeExport(empty, inspectLifeExport(empty).sha256, output);
    expect(JSON.parse(await readFile(output, 'utf8')).records).toEqual([]);
  });
  it('refuses symlink destinations without modifying their target', async () => {
    const output = await outputPath();
    const target = await outputPath();
    const input = fixture();
    const approved = inspectLifeExport(input);
    await importLifeExport(input, approved.sha256, target);
    await symlink(target, output);
    await expect(importLifeExport(input, approved.sha256, output)).rejects.toThrow('symlink');
    expect(await readFile(target, 'utf8')).toBe(approved.content);
  });
});
