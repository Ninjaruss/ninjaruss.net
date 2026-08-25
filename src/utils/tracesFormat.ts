/**
 * Traces timestamp formatting. Zero imports — safe to import from both
 * Astro frontmatter (traces.astro's server-rendered list) and browser
 * <script> blocks (the modal list, the homepage wall bullets), unlike
 * traces.ts which pulls in node:crypto.
 *
 * Traces timestamps are real submission instants, not editorial content
 * dates — showing the time (not just the date) is useful here in a way
 * it isn't for shelf/notes/showcase, so this stays separate from the
 * shared dates.ts formatDate() rather than extending it.
 */

export function formatTraceTimestamp(iso: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const timePart = d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC', hour12: true });
  return `${datePart} · ${timePart} UTC`;
}

// Compact lowercase form for the flying wall bullets — matches the site's
// existing lowercase absolute-date convention (Latest tile, journal rows).
export function formatTraceTimestampCompact(iso: string): string {
  const d = new Date(iso);
  const datePart = d
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    .toLowerCase();
  const timePart = d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC', hour12: true })
    .toLowerCase()
    .replace(' ', '');
  return `${datePart} · ${timePart}`;
}
