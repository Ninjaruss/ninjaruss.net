export const prerender = false;

import type { APIContext, APIRoute } from 'astro';
import { checkBotId } from 'botid/server';
import {
  parseTracesInput,
  hashIp,
  isRateLimited,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from '../../../utils/traces';
import { insertMessage, lastSubmissionByIpHash, listMessages } from '../../../utils/tracesDb';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : undefined;
  const rows = await listMessages(limit && Number.isInteger(limit) && limit > 0 ? limit : undefined);
  const entries = rows.map(r => ({ id: r.id, name: r.name, message: r.message }));

  return json({ entries }, 200);
};

export const POST: APIRoute = async (context: APIContext) => {
  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const { name, message, website } = body as { name?: unknown; message?: unknown; website?: unknown };

  // Honeypot: real visitors never fill this hidden field. A filled
  // honeypot silently no-ops — a bot gets no feedback to calibrate against.
  if (typeof website === 'string' && website.trim() !== '') {
    return json({ ok: true }, 200);
  }

  const verification = await checkBotId();
  if (verification.isBot) {
    return json({ error: 'Access denied' }, 403);
  }

  let parsed: { name: string; message: string };
  try {
    parsed = parseTracesInput({ name, message });
  } catch {
    // Deliberately generic: covers both a length violation and a blocked-term
    // match with the same message, so nothing here reveals which check failed.
    return json(
      { error: `Couldn't post that — check the name is 1-${NAME_MAX_LENGTH} characters and the message is 1-${MESSAGE_MAX_LENGTH} characters, then try rephrasing.` },
      400,
    );
  }

  const salt = import.meta.env.TRACES_IP_SALT as string | undefined;
  if (!salt) {
    return json({ error: 'Server misconfigured' }, 500);
  }
  const ipHash = hashIp(context.clientAddress, salt);

  const lastSubmittedAt = await lastSubmissionByIpHash(ipHash);
  if (isRateLimited(lastSubmittedAt, new Date())) {
    return json({ error: 'One message at a time — try again in a few minutes.' }, 429);
  }

  const row = await insertMessage(parsed.name, parsed.message, ipHash);

  return json({ id: row.id, name: row.name, message: row.message, createdAt: row.created_at }, 201);
};
