export interface YouTubeLiveResult {
  isLive: boolean;
  videoId: string | null;
}

export function parseYouTubeLiveResponse(data: unknown): YouTubeLiveResult {
  if (!data || typeof data !== 'object') {
    return { isLive: false, videoId: null };
  }
  const d = data as { items?: Array<{ id?: { videoId?: string } }> };
  if (!Array.isArray(d.items) || d.items.length === 0) {
    return { isLive: false, videoId: null };
  }
  const videoId = d.items[0]?.id?.videoId ?? null;
  return { isLive: true, videoId };
}
