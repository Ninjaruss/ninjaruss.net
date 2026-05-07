export const prerender = false;

import type { APIRoute } from 'astro';
import { getTwitchAppToken } from '../../utils/twitchToken';

interface YouTubeCache {
  live: boolean;
  expiresAt: number;
}

let ytCache: YouTubeCache | null = null;

async function checkYouTubeLive(apiKey: string, channelId: string): Promise<boolean> {
  const now = Date.now();
  if (ytCache && now < ytCache.expiresAt) return ytCache.live;

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'id');
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('eventType', 'live');
  url.searchParams.set('type', 'video');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`);
  const data = await res.json() as { items?: unknown[] };
  const live = Array.isArray(data.items) && data.items.length > 0;

  ytCache = { live, expiresAt: now + 15 * 60 * 1000 };
  return live;
}

export const GET: APIRoute = async () => {
  const twitchClientId     = import.meta.env.TWITCH_CLIENT_ID     as string | undefined;
  const twitchClientSecret = import.meta.env.TWITCH_CLIENT_SECRET as string | undefined;
  const youtubeApiKey      = import.meta.env.YOUTUBE_API_KEY      as string | undefined;
  const youtubeChannelId   = import.meta.env.YOUTUBE_CHANNEL_ID   as string | undefined;

  let twitchLive = false;
  let youtubeLive = false;

  const checks: Promise<void>[] = [];

  if (twitchClientId && twitchClientSecret) {
    checks.push(
      (async () => {
        try {
          const token = await getTwitchAppToken(twitchClientId, twitchClientSecret);
          const res = await fetch('https://api.twitch.tv/helix/streams?user_login=ninjaruss_', {
            headers: {
              'Client-ID':     twitchClientId,
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!res.ok) return;
          const data = await res.json() as { data?: unknown[] };
          twitchLive = Array.isArray(data.data) && data.data.length > 0;
        } catch { /* non-critical */ }
      })()
    );
  }

  if (youtubeApiKey && youtubeChannelId) {
    checks.push(
      (async () => {
        try {
          youtubeLive = await checkYouTubeLive(youtubeApiKey, youtubeChannelId);
        } catch { /* non-critical */ }
      })()
    );
  }

  await Promise.all(checks);

  // Twitch takes priority; live=true if either platform is streaming
  const live = twitchLive || youtubeLive;

  return new Response(
    JSON.stringify({ live, twitch: twitchLive, youtube: youtubeLive }),
    {
      status: 200,
      headers: {
        'Content-Type':  'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};
