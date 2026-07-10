import { z } from 'astro/zod';

export interface CodexConcept {
  slug: string;
  name: string;
  synthesis: string;
  entries: string[];
  related: string[];
}

export interface CodexData {
  generatedAt: string;
  concepts: CodexConcept[];
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  data?: CodexData;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const conceptSchema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  synthesis: z.string(),
  entries: z.array(z.string()),
  related: z.array(z.string()).default([]),
});

const codexSchema = z.object({
  generatedAt: z.string(),
  concepts: z.array(conceptSchema),
});

/**
 * Validate a candidate codex.json document.
 * Errors block writing the file; warnings are printed but non-blocking.
 * `knownEntryIds` is the set of entry refs that exist in the content right now.
 */
export function validateCodexData(raw: unknown, knownEntryIds: Set<string>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parsed = codexSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map(i => `${i.path.join('.') || '(root)'}: ${i.message}`),
      warnings,
    };
  }
  const data = parsed.data as CodexData;

  const slugs = new Set<string>();
  for (const concept of data.concepts) {
    if (!SLUG_RE.test(concept.slug)) {
      errors.push(`concept slug "${concept.slug}" is malformed (want kebab-case)`);
    }
    if (slugs.has(concept.slug)) {
      errors.push(`duplicate concept slug "${concept.slug}"`);
    }
    slugs.add(concept.slug);
    if (concept.entries.length === 0) {
      errors.push(`concept "${concept.slug}" has no entries`);
    }
    for (const ref of concept.entries) {
      if (!knownEntryIds.has(ref)) {
        errors.push(`concept "${concept.slug}" references unknown entry "${ref}"`);
      }
    }
  }
  for (const concept of data.concepts) {
    for (const rel of concept.related) {
      if (!slugs.has(rel)) {
        errors.push(`concept "${concept.slug}" relates to unknown concept "${rel}"`);
      }
    }
  }

  if (data.concepts.length < 6 || data.concepts.length > 12) {
    warnings.push(`concept count is ${data.concepts.length}, outside the 6-12 target range`);
  }
  const assigned = new Set(data.concepts.flatMap(c => c.entries));
  const unassigned = [...knownEntryIds].filter(id => !assigned.has(id));
  if (unassigned.length > 0) {
    warnings.push(`unassigned entries (will appear as loose threads): ${unassigned.join(', ')}`);
  }

  return { ok: errors.length === 0, errors, warnings, data };
}
