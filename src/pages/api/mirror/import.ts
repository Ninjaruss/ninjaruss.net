export const prerender = false;

import type { APIRoute } from 'astro';
import { validateMirrorResponse } from '../../../utils/mirror/schema';
import { commitSessionFiles } from '../../../utils/mirror/github';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.DEV) {
    const { runImport } = await import('../../../utils/mirror/fsOps');
    const outcome = runImport(await request.text());
    return json(outcome, outcome.ok ? 200 : 400);
  }

  const mirrorToken = process.env.MIRROR_TOKEN as string | undefined;
  const githubToken = process.env.MIRROR_GITHUB_TOKEN as string | undefined;
  if (!mirrorToken || !githubToken) return json({ error: 'Not found' }, 404);

  const auth = request.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${mirrorToken}`) return json({ error: 'Unauthorized' }, 401);

  const result = validateMirrorResponse(await request.text());
  if (!result.data) {
    return json({ ok: false, written: [], warnings: result.warnings, errors: result.errors }, 400);
  }

  try {
    const written = await commitSessionFiles(result.data, {
      token: githubToken,
      repo: 'Ninjaruss/ninjaruss.net',
      branch: 'main',
    });
    return json({ ok: true, written, warnings: result.warnings, errors: [] });
  } catch (e) {
    return json({ ok: false, written: [], warnings: result.warnings, errors: [String(e)] }, 502);
  }
};
