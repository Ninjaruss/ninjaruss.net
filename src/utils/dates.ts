/**
 * Format a date for display in entry metadata
 * @param date - Date object to format
 * @returns Formatted string like "Jan 15, 2024"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Check if updatedAt should be displayed (must be after publishedAt)
 * @param publishedAt - Original publish date
 * @param updatedAt - Last update date
 * @returns true if update date should be shown
 */
export function shouldShowUpdatedDate(
  publishedAt: Date | undefined,
  updatedAt: Date | undefined
): boolean {
  if (!updatedAt || !publishedAt) return false;
  return updatedAt > publishedAt;
}
