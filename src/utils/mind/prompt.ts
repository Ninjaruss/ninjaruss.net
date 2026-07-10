import type { CorpusEntry } from './corpus';
import type { MindData } from './schema';

/**
 * Build the full prompt for the condensation pass. Used verbatim by both the
 * CLI mode (piped to `claude -p`) and manual mode (written to mind-prompt.txt).
 */
export function buildMindPrompt(corpus: CorpusEntry[], existing: MindData | null): string {
  const entryIds = corpus.map(e => e.id).join('\n');

  const stability = existing && existing.concepts.length > 0
    ? `\nThese are the existing concept slugs from the previous run. Reuse a slug (and its concept) wherever the concept survives, so URLs stay stable:\n${existing.concepts.map(c => `- ${c.slug} ("${c.name}")`).join('\n')}\n`
    : '';

  const body = corpus
    .map(e => {
      const meta = [e.publishedAt ? `published ${e.publishedAt.slice(0, 10)}` : null, e.tags.length ? `tags: ${e.tags.join(', ')}` : null]
        .filter(Boolean)
        .join(' | ');
      return `=== ${e.id}\ntitle: ${e.title}${meta ? `\n${meta}` : ''}\n\n${e.text}`;
    })
    .join('\n\n');

  return `You are condensing one person's website writing into a personal encyclopedia — a map of their mind.

Below is their complete corpus: philosophical notes, project showcases, media log entries, "now" snapshots, and novel worldbuilding (themes/lore). Each entry starts with "=== <entry-id>".

Your task:
1. Propose between 6 and 12 concepts that genuinely organize this person's thinking. The concepts themselves should be discoveries — through-lines the author may not have named. Prefer ideas ("identity", "discipline") over topics ("anime") where the material supports it.
2. For each concept, write a synthesis of 2-4 sentences in the second person ("You keep returning to..."). Surface through-lines, tensions, and how the thinking has shifted over time. Be specific to this corpus — no generic filler.
3. Assign EVERY entry to at least one concept. An entry may belong to several.
4. Link related concepts to each other via their slugs.
${stability}
Respond with ONLY a JSON object in exactly this shape (no other text):

{
  "generatedAt": "<current ISO-8601 timestamp>",
  "concepts": [
    {
      "slug": "kebab-case-slug",
      "name": "Concept Name",
      "synthesis": "You keep returning to...",
      "entries": ["notes/some-entry", "shelf/some-entry"],
      "related": ["other-concept-slug"]
    }
  ]
}

Rules:
- "entries" values must be copied EXACTLY from this list of valid entry ids:
${entryIds}
- "related" values must be slugs of concepts in YOUR response.
- Slugs are lowercase kebab-case.

THE CORPUS:

${body}
`;
}
