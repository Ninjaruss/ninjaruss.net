export const prerender = false;

import type { APIRoute } from 'astro';
import { runImport } from '../../../utils/mirror/fsOps';

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  const text = await request.text();
  const outcome = runImport(text);
  return new Response(JSON.stringify(outcome), {
    status: outcome.ok ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
