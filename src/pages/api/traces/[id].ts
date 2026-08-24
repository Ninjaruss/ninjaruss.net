export const prerender = false;

import type { APIRoute } from 'astro';
import { deleteMessage } from '../../../utils/tracesDb';

export const DELETE: APIRoute = async ({ params, request }) => {
  const adminKey = import.meta.env.TRACES_ADMIN_KEY as string | undefined;
  const provided = request.headers.get('x-admin-key');

  if (!adminKey || provided !== adminKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deleted = await deleteMessage(id);
  return new Response(JSON.stringify({ deleted }), {
    status: deleted ? 200 : 404,
    headers: { 'Content-Type': 'application/json' },
  });
};
