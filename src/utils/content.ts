/**
 * Strip markdown syntax for searchable content or content detection
 * @param markdown - Raw markdown content
 * @returns Cleaned text without markdown formatting
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')           // Remove code blocks
    .replace(/`[^`]+`/g, '')                  // Remove inline code
    .replace(/!\[.*?\]\(.*?\)/g, '')          // Remove images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
    .replace(/^#{1,6}\s+/gm, '')              // Remove headings
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove bold/italic
    .replace(/\s+/g, ' ')                     // Collapse whitespace
    .trim();
}

/**
 * Check if content body is minimal/empty after stripping markdown
 * @param body - Raw markdown content
 * @param threshold - Character count threshold (default: 20)
 * @returns true if content is minimal or empty
 */
export function hasMinimalContent(body: string, threshold: number = 20): boolean {
  const stripped = stripMarkdown(body || '');
  return stripped.length <= threshold;
}
