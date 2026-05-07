export const prerender = false;

import type { APIRoute } from 'astro';
import { getTwitchAppToken } from '../../utils/twitchToken';

export const GET: APIRoute = async () => {
  const clientId     = import.meta.env.TWITCH_CLIENT_ID     as string | undefined;
  const clientSecret = import.meta.env.TWITCH_CLIENT_SECRET as string | undefined;

  if (!clientId || !clientSecret) {
    return new Response(JSON.stringify({ live: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const token = await getTwitchAppToken(clientId, clientSecret);

    const res = await fetch('https://api.twitch.tv/helix/streams?user_login=ninjaruss_', {
      headers: {
        'Client-ID':     clientId,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error(`Streams fetch failed: ${res.status}`);
    const data = await res.json() as { data?: unknown[] };
    const live = Array.isArray(data.data) && data.data.length > 0;

    return new Response(JSON.stringify({ live }), {
      status: 200,
      headers: {
        'Content-Type':  'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response(JSON.stringify({ live: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
