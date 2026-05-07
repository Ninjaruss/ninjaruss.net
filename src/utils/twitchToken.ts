interface TokenCache {
  token: string;
  expiresAt: number;
}

let cache: TokenCache | null = null;

export async function getTwitchAppToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  if (cache && now < cache.expiresAt) return cache.token;

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    'client_credentials',
    }),
  });

  if (!res.ok) throw new Error(`Twitch token fetch failed: ${res.status}`);
  const data = await res.json() as { access_token: string; expires_in: number };

  cache = {
    token:     data.access_token,
    expiresAt: now + (data.expires_in - 60) * 1000,
  };
  return cache.token;
}
