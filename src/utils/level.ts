import { stripMarkdown } from './content';

/**
 * Word-count "unit" the level curve is scaled against. Tuned so today's
 * combined novel-manuscript + journal word count (~21k) lands around level 8,
 * matching the pace of the old session-count curve (`level = floor(sqrt(4n))`)
 * it replaces. Adjust freely if the pace ever feels off — it's cosmetic.
 */
export const LEVEL_WORD_UNIT = 300;

/** Word count of a raw markdown string, ignoring markdown syntax. */
export function countMarkdownWords(markdown: string): number {
  // `stripMarkdown` only removes the leading `#` marker from a heading line,
  // not the heading text itself (by design — it's used for search/excerpt
  // text elsewhere). Headings shouldn't inflate the word count here, so drop
  // those lines entirely before handing off to the shared stripper.
  const withoutHeadingLines = markdown.replace(/^#{1,6}\s+.*$/gm, '');
  const stripped = stripMarkdown(withoutHeadingLines);
  return stripped ? stripped.split(/\s+/).length : 0;
}

/**
 * Total word count that feeds the level number: the novel manuscript's story
 * words (finished prose, not outline/planning docs) plus every journal
 * (notes + showcase) entry body. This only grows as a side effect of writing
 * already happening for the site — no new authoring, no decay.
 */
export function computeSiteWordCount(storyWords: number, journalBodies: string[]): number {
  const journalWords = journalBodies.reduce((sum, body) => sum + countMarkdownWords(body), 0);
  return storyWords + journalWords;
}

/** RPG curve: level = floor(sqrt(totalWords / LEVEL_WORD_UNIT)), min 1, monotonic. */
export function computeSiteLevel(totalWords: number): number {
  const words = Math.max(0, totalWords);
  return Math.max(1, Math.floor(Math.sqrt(words / LEVEL_WORD_UNIT)));
}
