export const prerender = false;

import type { APIRoute } from 'astro';
import { appendLog, mergePastedLog } from '../../../utils/mirror/fsOps';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return json({ error: 'Not found' }, 404);
  const body = (await request.json().catch(() => null)) as
    | { kind?: string; text?: string; paste?: string }
    | null;
  if (!body) return json({ error: 'Invalid JSON body' }, 400);

  if (typeof body.paste === 'string') {
    const { added } = mergePastedLog(body.paste);
    return json({ added });
  }
  if ((body.kind === 'start' || body.kind === 'done') && typeof body.text === 'string' && body.text.trim()) {
    const line = appendLog(body.kind, body.text.trim());
    return json({ line });
  }
  return json({ error: 'Expected {kind, text} or {paste}' }, 400);
};
