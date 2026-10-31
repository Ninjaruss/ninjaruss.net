import { z } from 'astro/zod';

// Public-only v1 contract. Never pass private archive records to this parser.
// Strict objects reject extra fields rather than silently dropping them.
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const text = z.string().min(1).max(40_000);
const common = { id, title: text, body: text };
const refs = z.array(id).max(100);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Expected a real calendar date');

const record = z.discriminatedUnion('kind', [
  z.object({ ...common, kind: z.literal('experience'), date,
    people: refs, places: refs, events: refs }).strict(),
  z.object({ ...common, kind: z.literal('person') }).strict(),
  z.object({ ...common, kind: z.literal('place'), region: id,
    position: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).strict().optional(),
  }).strict(),
  z.object({ ...common, kind: z.literal('event'), places: refs }).strict(),
  z.object({ ...common, kind: z.literal('region'), parent: id.optional(), mapKey:id.optional() }).strict(),
]);

export const lifeExportSchema = z.object({
  schemaVersion: z.literal(1),
  records: z.array(record).max(10_000),
}).strict().superRefine((bundle, ctx) => {
  const records = new Map<string, z.infer<typeof record>>();
  const mapKeys = new Set<string>();
  bundle.records.forEach((entry, index) => {
    if (records.has(entry.id)) ctx.addIssue({ code: 'custom', path: ['records', index, 'id'], message: 'Duplicate public ID' });
    records.set(entry.id, entry);
    if (entry.kind === 'region' && entry.mapKey) {
      if (mapKeys.has(entry.mapKey)) ctx.addIssue({code:'custom',path:['records',index,'mapKey'],message:'Duplicate region map key'});
      mapKeys.add(entry.mapKey);
    }
  });
  bundle.records.forEach((entry, index) => {
    const check = (target: string, kind: string, field: string) => {
      if (records.get(target)?.kind !== kind) ctx.addIssue({ code: 'custom', path: ['records', index, field], message: `Reference must resolve to a public ${kind}` });
    };
    if (entry.kind === 'experience') {
      entry.people.forEach(target => check(target, 'person', 'people'));
      entry.places.forEach(target => check(target, 'place', 'places'));
      entry.events.forEach(target => check(target, 'event', 'events'));
    }
    if (entry.kind === 'event') entry.places.forEach(target => check(target, 'place', 'places'));
    if (entry.kind === 'place') check(entry.region, 'region', 'region');
    if (entry.kind === 'region' && entry.parent) {
      check(entry.parent, 'region', 'parent');
      const visited = new Set([entry.id]);
      let parent: string | undefined = entry.parent;
      while (parent) {
        if (visited.has(parent)) {
          ctx.addIssue({ code: 'custom', path: ['records', index, 'parent'], message: 'Region hierarchy contains a cycle' });
          break;
        }
        visited.add(parent);
        const next = records.get(parent);
        parent = next?.kind === 'region' ? next.parent : undefined;
      }
    }
  });
});

export type LifeExport = z.infer<typeof lifeExportSchema>;

// Deterministic representation for review hashes: object key order does not
// matter, but record order and every string (including whitespace) do.
export function canonicalLifeExport(input: unknown): string {
  const bundle = lifeExportSchema.parse(input);
  const sortKeys = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value !== null && typeof value === 'object') return Object.fromEntries(
      Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
        .map(([key, nested]) => [key, sortKeys(nested)]),
    );
    return value;
  };
  return `${JSON.stringify(sortKeys(bundle), null, 2)}\n`;
}
