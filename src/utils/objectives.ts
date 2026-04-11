export interface ObjectiveItem {
  text: string;
  done: boolean;
}

export interface ObjectiveSection {
  heading: string;
  items: ObjectiveItem[];
}

/**
 * Parse an objectives markdown file into typed sections.
 * Sections are delimited by ## headings.
 * Items use standard task list syntax: - [ ] pending, - [x] done.
 * Sections with no valid items are skipped.
 */
export function parseObjectives(markdown: string): ObjectiveSection[] {
  const sections: ObjectiveSection[] = [];
  const chunks = markdown.split(/^## /m);

  for (const chunk of chunks) {
    const lines = chunk.split('\n');
    const heading = lines[0].trim();
    if (!heading) continue;

    const items: ObjectiveItem[] = [];
    for (const line of lines.slice(1)) {
      const match = line.match(/^-\s+\[([xX ])\]\s+(.+)$/);
      if (match) {
        items.push({
          done: match[1].toLowerCase() === 'x',
          text: match[2].trim(),
        });
      }
    }

    if (items.length > 0) {
      sections.push({ heading, items });
    }
  }

  return sections;
}
