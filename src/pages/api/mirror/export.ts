export const prerender = false;

import type { APIRoute } from 'astro';
import { runExport } from '../../../utils/mirror/fsOps';

export const GET: APIRoute = async () => {
  if (!import.meta.env.DEV) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  const r = runExport();
  const status = r.ok ? 200 : 400;
  return new Response(JSON.stringify(r), { status, headers: { 'Content-Type': 'application/json' } });
};
