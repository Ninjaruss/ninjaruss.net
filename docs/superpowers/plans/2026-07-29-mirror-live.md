# Mirror Live (Private Strip + GitHub Writes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Mirror strip owner-only and fully operational on live ninjaruss.net — capture in localStorage, client-built DeepSeek prompt, paste-reply import that commits session files to `main` via the GitHub Contents API.

**Architecture:** A new pure-ish `src/utils/mirror/github.ts` (fetch-injectable, unit-tested) handles GitHub Contents API reads/writes. `/api/mirror/import` gains a production path: Bearer-token auth against `MIRROR_TOKEN`, validation via the existing `validateMirrorResponse`, per-session commits using `MIRROR_GITHUB_TOKEN`. `MirrorStrip.astro` gains: hidden-by-default + triple-tap unlock (prod), client-side prompt building (pure `buildMirrorPrompt` + quest file embedded at build time), snapshot-based localStorage consumption, and a prod reply-import box. Missing env vars → 404 (feature off).

**Tech Stack:** GitHub REST Contents API, Vercel serverless env vars, existing pure mirror utils, vitest (fetch injected, no network in tests).

**Spec:** Addendum 2 in `docs/superpowers/specs/2026-07-29-status-pause-menu-design.md`.

**Out of scope:** No commit-per-log-line (capture stays in localStorage); log/export API routes stay dev-only; no PR flow (user chose straight-to-main); no secret values anywhere in code or docs.

---

### Task 1: `github.ts` — Contents API client (TDD)

**Files:**
- Create: `src/utils/mirror/github.ts`
- Test: `src/tests/mirror.test.ts` (append)

- [ ] **Step 1: Write failing tests** — append to `src/tests/mirror.test.ts`:

```ts
import { commitSessionFiles, type GithubConfig } from '../utils/mirror/github';

describe('commitSessionFiles', () => {
  const cfg: GithubConfig = {
    token: 'test-token',
    repo: 'Ninjaruss/ninjaruss.net',
    branch: 'main',
  };
  const session = {
    date: '2026-07-29',
    title: 'Live Test',
    summary: 'A live import.',
    stats: ['Chaos'],
    reflection: 'It reaches the repo now.',
    nextStep: 'Log the next one.',
    streamed: false,
  };

  it('PUTs a new file when the path is free', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchStub: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), init: init! });
      if (init?.method === undefined || init.method === 'GET') {
        return new Response('Not Found', { status: 404 });
      }
      return new Response(JSON.stringify({ content: { path: 'x' } }), { status: 201 });
    };
    const written = await commitSessionFiles([session], cfg, fetchStub);
    expect(written).toEqual(['2026-07-29-live-test.md']);
    const put = calls.find(c => c.init.method === 'PUT')!;
    expect(put.url).toContain('/repos/Ninjaruss/ninjaruss.net/contents/src/content/sessions/2026-07-29-live-test.md');
    const body = JSON.parse(String(put.init.body));
    expect(body.branch).toBe('main');
    expect(body.message).toBe('mirror: add session 2026-07-29-live-test');
    const decoded = Buffer.from(body.content, 'base64').toString('utf-8');
    expect(decoded).toContain('title: Live Test');
    expect(decoded).toContain('streamed: false');
  });

  it('suffixes the filename when the path already exists', async () => {
    const fetchStub: typeof fetch = async (url, init) => {
      if (init?.method === undefined || init.method === 'GET') {
        const taken = String(url).endsWith('2026-07-29-live-test.md?ref=main');
        return new Response(taken ? '{}' : 'Not Found', { status: taken ? 200 : 404 });
      }
      return new Response('{}', { status: 201 });
    };
    const written = await commitSessionFiles([session], cfg, fetchStub);
    expect(written).toEqual(['2026-07-29-live-test-2.md']);
  });

  it('throws with a readable error on a failed PUT', async () => {
    const fetchStub: typeof fetch = async (_url, init) =>
      init?.method === 'PUT'
        ? new Response('{"message":"boom"}', { status: 422 })
        : new Response('Not Found', { status: 404 });
    await expect(commitSessionFiles([session], cfg, fetchStub)).rejects.toThrow(/422/);
  });
});
```

- [ ] **Step 2: Run `npm run test`** — expect FAIL (cannot resolve ../utils/mirror/github).

- [ ] **Step 3: Implement `src/utils/mirror/github.ts`**:

```ts
import matter from 'gray-matter';
import { slugify } from '../novel';
import type { MirrorSession } from './schema';

export interface GithubConfig {
  token: string;
  repo: string;   // owner/name
  branch: string;
}

const API = 'https://api.github.com';
const SESSIONS_PATH = 'src/content/sessions';

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

export function sessionFrontmatter(s: MirrorSession): string {
  const fm: Record<string, unknown> = {
    title: s.title,
    publishedAt: s.date,
    stats: s.stats,
    summary: s.summary,
    ...(s.memorable ? { memorable: s.memorable } : {}),
    ...(s.quest ? { quest: s.quest } : {}),
    nextStep: s.nextStep,
    reflection: s.reflection,
    streamed: s.streamed,
    draft: false,
  };
  return matter.stringify('', fm);
}

async function pathTaken(path: string, cfg: GithubConfig, f: typeof fetch): Promise<boolean> {
  const res = await f(`${API}/repos/${cfg.repo}/contents/${path}?ref=${cfg.branch}`, {
    headers: headers(cfg.token),
  });
  return res.status !== 404;
}

/** Commit one file per session to the repo. Returns written basenames.
 *  Throws on any failed write — callers report the error; already-written
 *  files stay written (each is its own commit, individually revertable). */
export async function commitSessionFiles(
  sessions: MirrorSession[],
  cfg: GithubConfig,
  f: typeof fetch = fetch,
): Promise<string[]> {
  const written: string[] = [];
  for (const s of sessions) {
    const base = `${s.date}-${slugify(s.title)}`;
    let name = `${base}.md`;
    let n = 2;
    while (await pathTaken(`${SESSIONS_PATH}/${name}`, cfg, f)) {
      name = `${base}-${n++}.md`;
    }
    const res = await f(`${API}/repos/${cfg.repo}/contents/${SESSIONS_PATH}/${name}`, {
      method: 'PUT',
      headers: headers(cfg.token),
      body: JSON.stringify({
        message: `mirror: add session ${base}`,
        content: Buffer.from(sessionFrontmatter(s), 'utf-8').toString('base64'),
        branch: cfg.branch,
      }),
    });
    if (!res.ok) {
      throw new Error(`GitHub write failed (${res.status}) for ${name}: ${await res.text()}`);
    }
    written.push(name);
  }
  return written;
}
```

- [ ] **Step 4: Run `npm run test`** — expect PASS.

- [ ] **Step 5: Refactor `fsOps.runImport` to reuse `sessionFrontmatter`** (delete its inline frontmatter object, import the helper; behavior identical — run tests to confirm; frontmatter key order must not change).

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: GitHub Contents API client for live mirror imports"`

---

### Task 2: Production import route

**Files:**
- Modify: `src/pages/api/mirror/import.ts`

- [ ] **Step 1: Replace the handler** with dev/prod branching:

```ts
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

  const mirrorToken = import.meta.env.MIRROR_TOKEN as string | undefined;
  const githubToken = import.meta.env.MIRROR_GITHUB_TOKEN as string | undefined;
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
```

Note: the dev branch dynamically imports fsOps so the node-fs module is never loaded in the serverless bundle's hot path (it will still be bundled — that's fine, it just isn't executed). `log.ts` and `export.ts` routes stay exactly as they are (dev-only).

- [ ] **Step 2: Verify dev behavior unchanged** — dev server + the same curl import smoke as before (valid reply → file written locally, invalid → 400). Clean up.

- [ ] **Step 3: Verify prod guard logic by build inspection** — `npm run build`, then read `.vercel/output/_functions/pages/api/mirror/import.astro.mjs`: confirm the compiled handler contains the env checks and NOT a statically-true dev branch. (Env vars are read at request time; locally they're absent so the route would 404 — that's the correct off state.)

- [ ] **Step 4: `npm run test`, commit** — `git add -A && git commit -m "feat: production mirror import — token auth + GitHub commits to main"`

---

### Task 3: MirrorStrip — unlock gate + on-device loop

**Files:**
- Modify: `src/components/MirrorStrip.astro`

Requirements (implementer reads the current component first; keep all existing dev behavior):

1. **Quest embedding:** frontmatter reads `src/content/sessions/_quests.md` via `readFileSync` (same pattern as status page) and emits it in a `<script type="application/json" id="mirror-quests">` block (JSON-stringified string). Client parses it for prompt building.
2. **Hidden by default in prod:** root section gets `hidden` attribute when `!dev`. Unlock: 3 clicks/taps on the MIRROR kicker within 2s → `window.prompt('mirror key')` → store non-empty input in localStorage `mirror-key` → reveal (remove `hidden`). On init, if `mirror-key` exists → reveal immediately. Dev: never hidden, no key needed. A wrong key still reveals the strip but imports will 401 with message `wrong key — tap MIRROR ×3 to re-enter` and clear the stored key.
3. **Prod drawer** (rendered when `!dev`, same `details.mirror-dev` styling, summary "mirror (owner)"):
   - `#mirror-prompt-live` button "⧉ copy DeepSeek prompt": builds the prompt CLIENT-SIDE — `buildMirrorPrompt(parseLogLines(readLog()), quests)` (import `buildMirrorPrompt` + `parseLogLines`; both pure). Requires ≥1 `done` line (message otherwise). On success: clipboard write + snapshot the exported raw lines into localStorage `mirror-exported` + message.
   - `#mirror-reply-live` textarea + `#mirror-import-live` button "import reply": POST raw text to `/api/mirror/import` with `Authorization: Bearer <mirror-key>`. On `ok`: consume localStorage log — keep only lines NOT in the `mirror-exported` snapshot (import `linesNotIn`), clear the snapshot, clear the textarea, render written filenames in `#mirror-results-live` + message `committed — site rebuilds in ~a minute.` On 401: the wrong-key flow from (2). On 400: render errors (`.is-error`). On 502: render the error, note nothing may be partially written (some files may have committed — the response's `errors` string says which failed; surface it raw).
4. **Dev drawer unchanged.** Base buttons unchanged (localStorage capture in prod, API in dev).
5. **Verification (browser, dev + built preview):**
   - Dev: everything still works as before (spot-check start/done + dev import).
   - Prod shape: `npm run build`; serve `dist/client` statically is NOT enough (API needed) — instead verify via the built HTML: strip section HAS `hidden`, contains `mirror-quests` JSON, contains the prod drawer markup, does NOT contain the dev drawer's merge box; `api/mirror` string now legitimately present (prod import fetch). Triple-tap unlock + reveal logic: test on the DEV server by temporarily... no — dev never hides. Test the unlock path with a quick jsdom-free approach: run the built page's logic manually in the browser preview by loading the PRODUCTION preview `npm run preview` (serves the built output with API routes; env vars absent so import 404s — fine). On the preview: strip hidden; triple-tap kicker; enter a dummy key; strip reveals; copy-prompt works client-side (seed localStorage lines first); import reply → 404 (env off) surfaces as readable error message. Screenshot hidden + revealed states.
6. Keep component self-contained; 44px targets; existing style family.

- [ ] Implement, verify per above, `npm run test` (183 after Task 1), `npm run build`.
- [ ] Commit: `git add -A && git commit -m "feat: MirrorStrip owner unlock + full on-device loop against live import API"`

---

### Task 4: Docs + deploy + live verification

**Files:**
- Modify: `CLAUDE.md` (Mirror Loop section — append the live-mode paragraph)
- Create: `docs/mirror-setup.md` (the user-facing one-time setup steps)

- [ ] **Step 1: `docs/mirror-setup.md`** — short, imperative, no secret values:

```markdown
# Mirror live setup (one-time)

1. Create a fine-grained GitHub PAT: github.com → Settings → Developer settings
   → Fine-grained tokens → only repository `Ninjaruss/ninjaruss.net`,
   Repository permissions → Contents: Read and write. Copy it.
2. Invent a mirror key (any long random string — this is what you'll type on
   your devices).
3. Vercel → ninjaruss.net project → Settings → Environment Variables →
   add `MIRROR_GITHUB_TOKEN` (the PAT) and `MIRROR_TOKEN` (your key),
   Production scope → Save → redeploy.
4. On each of your devices: open ninjaruss.net/status, tap the MIRROR label
   3 times, enter your key once.

Loop: ▶ / ★ capture anywhere → ⧉ copy DeepSeek prompt → paste into DeepSeek →
copy its reply → import reply → the site commits + rebuilds itself (~1 min).
Wrong key? The strip tells you and asks again on the next triple-tap.
Revert a bad session: `git revert` the "mirror: add session …" commit.
```

- [ ] **Step 2: CLAUDE.md** — append to the Mirror Loop section: live mode summary (hidden strip, triple-tap unlock, MIRROR_TOKEN/MIRROR_GITHUB_TOKEN env vars, straight-to-main commits via `src/utils/mirror/github.ts`, route 404s when env vars absent, setup doc pointer).

- [ ] **Step 3: Final verification** — `npm run build && npm run test`; commit `docs: mirror live setup + CLAUDE.md live mode`.

- [ ] **Step 4: Merge + deploy + verify live** (controller does this): merge to main, push, then verify on production: /status HTML has `hidden` strip + no dev drawer; `POST https://www.ninjaruss.net/api/mirror/import` with no auth → 404 (env vars not yet set — expected off state until the user completes setup).
