import { SUBSTACK_ARCHIVE_URL } from './substack';

export interface NoteRedirectEntry {
  slug: string;
  substackUrl?: string;
}

/**
 * Where a legacy /notes/<slug> URL should send a visitor.
 *
 * The notes collection no longer renders pages — it is the redirect map. A note
 * that has not been backfilled to Substack yet goes to the archive: imprecise,
 * but a correct destination, and better than a 404 for an inbound link.
 */
export function resolveNoteRedirect(slug: string, entries: NoteRedirectEntry[]): string {
  const clean = slug.replace(/^\/+|\/+$/g, '');
  if (!clean) return SUBSTACK_ARCHIVE_URL;
  return entries.find((e) => e.slug === clean)?.substackUrl ?? SUBSTACK_ARCHIVE_URL;
}
