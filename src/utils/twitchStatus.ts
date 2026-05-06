export function parseTwitchLiveResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as { data?: unknown };
  return Array.isArray(d.data) && d.data.length > 0;
}
