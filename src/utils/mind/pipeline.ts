import { extractJsonBlock } from './json';
import { stabilizeSlugs } from './stabilize';
import { validateMindData, type MindData } from './schema';

export interface PipelineResult {
  data?: MindData;
  errors: string[];
  warnings: string[];
}

/**
 * Shared post-processing for a model response, whatever produced it:
 * extract JSON → default generatedAt → stabilize slugs → validate.
 * Never throws; problems come back as errors.
 */
export function processModelResponse(
  text: string,
  knownEntryIds: Set<string>,
  existing: MindData | null
): PipelineResult {
  let raw: unknown;
  try {
    raw = extractJsonBlock(text);
  } catch (err) {
    return { errors: [(err as Error).message], warnings: [] };
  }

  if (raw && typeof raw === 'object' && !(raw as Record<string, unknown>).generatedAt) {
    (raw as Record<string, unknown>).generatedAt = new Date().toISOString();
  }

  if (
    raw && typeof raw === 'object' &&
    Array.isArray((raw as Record<string, unknown>).concepts) &&
    existing
  ) {
    (raw as Record<string, unknown>).concepts = stabilizeSlugs(
      existing.concepts,
      (raw as { concepts: MindData['concepts'] }).concepts
    );
  }

  const result = validateMindData(raw, knownEntryIds);
  return { data: result.ok ? result.data : undefined, errors: result.errors, warnings: result.warnings };
}
