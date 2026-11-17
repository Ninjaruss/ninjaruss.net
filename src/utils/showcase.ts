/**
 * Project ordering for /showcase.
 *
 * The list used to sort on `updatedAt ?? publishedAt` alone, which ranks by
 * "when did I last touch the writeup" rather than "is this project alive".
 * Adding a retirement note to two finished projects on the same day pushed
 * both above every live one — and since the draw deck was removed, the newest
 * entry is what the desktop split view auto-opens, so a visitor landing on
 * Projects opened on a project that had been shut down.
 *
 * `archived` is the explicit signal. It is deliberately a boolean rather than
 * a sniff of the free-text `status` string: `status` is display copy and is
 * allowed to say anything, so deriving order from it would make a wording
 * change silently reorder the page.
 */

export interface SortableProject {
  archived?: boolean;
  publishedAt?: Date;
  updatedAt?: Date;
}

/** Most recent activity on an entry; undated entries sort last within a group. */
function activityTime(project: SortableProject): number {
  return (project.updatedAt ?? project.publishedAt)?.getTime() ?? 0;
}

/**
 * Live projects first, then archived ones, each group newest-first.
 * Stable within a group so equal dates keep their source order.
 */
export function sortProjects<T extends SortableProject>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    const archived = Number(a.archived ?? false) - Number(b.archived ?? false);
    return archived !== 0 ? archived : activityTime(b) - activityTime(a);
  });
}
