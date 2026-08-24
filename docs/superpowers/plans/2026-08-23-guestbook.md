# Guestbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public guestbook — a `/guestbook` page where visitors leave a short name+message, invisible bot filtering, an admin-only delete safety valve, and a small "live names" band on the homepage that links back to it.

**Architecture:** Neon Postgres (via Vercel Marketplace) stores messages. Three on-demand Astro API routes (`POST /api/guestbook`, `GET /api/guestbook/recent`, `DELETE /api/guestbook/[id]`) handle submit/read/delete; everything else on the site stays statically prerendered. Vercel BotID gives invisible bot verification on submit. Pure validation/hash/rotation logic lives in `src/utils/`, unit-tested with vitest; route files stay thin (parse → validate → touch DB → respond), matching the existing `journal.ts`/`shelfWall.ts` split.

**Tech Stack:** Astro 5 (`@astrojs/vercel` adapter), `@neondatabase/serverless`, `botid`, `astro/zod`, vitest.

**Spec:** [docs/superpowers/specs/2026-08-23-guestbook-design.md](../specs/2026-08-23-guestbook-design.md)

## Global Constraints

- Message cap: **100 characters** (trimmed, after whitespace collapse)
- Name cap: **40 characters** (trimmed, after whitespace collapse)
- Rate limit window: **5 minutes** per `ip_hash`
- Homepage band shows the **15** most recent entries
- Honeypot field name: `website` (hidden input; non-empty → silent 200 no-op, never an error)
- Every new dynamic route file must set `export const prerender = false;` — the site is otherwise fully static
- Pure logic files (anything imported by a vitest test) must not import `astro:content` or `node:crypto`/other Node-only builtins if they are ever imported into a browser `<script>` block — see Task 4 vs Task 5 split
- Zod schemas are built from `astro/zod`, never `astro:content`'s re-export (vitest can't resolve `astro:content`)
- Messages render as **plain text only** — no markdown, no HTML — both stored and displayed
- `ip_hash` is `sha256("<ip>:<salt>")`, never the raw IP, salt from env var `GUESTBOOK_IP_SALT`
- Admin delete is gated by env var `GUESTBOOK_ADMIN_KEY`, checked against an `x-admin-key` request header

---

## Task 1: Provision Neon Postgres

**Files:**
- Create (via CLI, not hand-written): `.env.local` gains `DATABASE_URL` (already gitignored — confirm below)
- Create: `scripts/migrate-guestbook.mjs`

**Interfaces:**
- Produces: a `guestbook_messages` table that Task 6's `guestbookDb.ts` queries against, and a `DATABASE_URL` env var available both locally and on Vercel

- [ ] **Step 1: Confirm `.env.local` is gitignored**

Run: `git check-ignore -v .env.local`
Expected: prints a match (e.g. `.gitignore:N:.env*  .env.local`). If it prints nothing, STOP and add `.env*` to `.gitignore` before continuing — never let a real `DATABASE_URL` reach a commit.

- [ ] **Step 2: Ensure the Vercel CLI is available and the project is linked**

Run: `vercel --version`
Expected: a version string. If the command is not found, run `npm i -g vercel` first.

Run: `vercel link`
Expected: confirms the project is linked to the existing Vercel project (interactive prompt if not already linked — answer with the existing `ninjaruss.net` project, do not create a new one).

- [ ] **Step 3: Install the Neon integration**

Run: `vercel integration add neon --yes`
Expected: provisions a Neon Postgres database and injects `DATABASE_URL` (and related `POSTGRES_*`/`PGHOST` etc. vars) into the linked Vercel project's environment variables. If the command instead prints a claim/dashboard URL and asks you to finish in the browser, STOP and ask the user to complete that step, then continue.

- [ ] **Step 4: Pull the new env vars locally**

Run: `vercel env pull .env.local --yes`
Expected: `.env.local` now contains `DATABASE_URL=postgres://...` (merged with the existing `VERCEL_OIDC_TOKEN` line).

- [ ] **Step 5: Write the migration script**

```js
// scripts/migrate-guestbook.mjs
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set — run `vercel env pull .env.local` first.');
  process.exit(1);
}

const sql = neon(databaseUrl);

await sql`
  create table if not exists guestbook_messages (
    id          bigserial primary key,
    name        text not null,
    message     text not null,
    ip_hash     text not null,
    created_at  timestamptz not null default now()
  )
`;

await sql`
  create index if not exists guestbook_messages_created_at_idx
    on guestbook_messages (created_at desc)
`;

console.log('guestbook_messages table ready.');
```

- [ ] **Step 6: Install the Neon driver and run the migration**

Run: `npm install @neondatabase/serverless`
Expected: adds `@neondatabase/serverless` to `package.json` dependencies.

Run: `node --env-file=.env.local scripts/migrate-guestbook.mjs`
Expected: prints `guestbook_messages table ready.` with no errors. (Node 20.6+ supports `--env-file`; if the local Node version is older, run `export $(grep DATABASE_URL .env.local) && node scripts/migrate-guestbook.mjs` instead.)

- [ ] **Step 7: Commit**

```bash
git add scripts/migrate-guestbook.mjs package.json package-lock.json
git commit -m "feat: provision Neon Postgres for the guestbook"
```

---

## Task 2: Generate and store guestbook secrets

**Files:** none (env vars only)

**Interfaces:**
- Produces: `GUESTBOOK_IP_SALT` and `GUESTBOOK_ADMIN_KEY`, consumed by Task 7's POST route and Task 9's DELETE route respectively

- [ ] **Step 1: Generate two random secrets**

Run: `openssl rand -hex 32`
Expected: a 64-character hex string. Run it twice (once for the salt, once for the admin key) and keep both values — this is your only chance to see them printed in the clear.

- [ ] **Step 2: Add them to Vercel (all environments) and pull locally**

Run: `vercel env add GUESTBOOK_IP_SALT production preview development`
Expected: prompts for the value — paste the first generated string.

Run: `vercel env add GUESTBOOK_ADMIN_KEY production preview development`
Expected: prompts for the value — paste the second generated string. **Save this value somewhere outside the repo (password manager) — it's the only credential for the admin-delete route.**

Run: `vercel env pull .env.local --yes`
Expected: `.env.local` now also contains `GUESTBOOK_IP_SALT=...` and `GUESTBOOK_ADMIN_KEY=...`.

- [ ] **Step 3: No commit for this task** (env vars only, nothing to check in)

---

## Task 3: Add Vercel BotID

**Files:**
- Create: `vercel.json`
- Modify: `package.json` (new dependency)

**Interfaces:**
- Produces: the `botid` package and proxy rewrites, which Task 7 (client init) and Task 8 (server check) both depend on

- [ ] **Step 1: Install the package**

Run: `npm install botid`
Expected: adds `botid` to `package.json` dependencies.

- [ ] **Step 2: Create the proxy rewrite config**

Astro isn't one of BotID's first-party framework integrations, so it uses the generic `vercel.json` rewrite config (this repo currently has no `vercel.json` at all):

```json
{
  "rewrites": [
    {
      "source": "/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/a-4-a/c.js",
      "destination": "https://api.vercel.com/bot-protection/v1/challenge"
    },
    {
      "source": "/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/:path*",
      "destination": "https://api.vercel.com/bot-protection/v1/proxy/:path*"
    }
  ],
  "headers": [
    {
      "source": "/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/:path*",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ]
}
```

- [ ] **Step 3: Verify the build still succeeds**

Run: `npm run build`
Expected: build completes with no new errors (nothing imports `botid` yet — this task only installs and configures it; Task 7 and Task 8 wire up the actual calls).

- [ ] **Step 4: Commit**

```bash
git add vercel.json package.json package-lock.json
git commit -m "feat: add Vercel BotID for guestbook bot protection"
```

---

## Task 4: Pure rotation util (client-safe)

**Files:**
- Create: `src/utils/guestbookRotation.ts`
- Test: `src/tests/guestbookRotation.test.ts`

**Interfaces:**
- Produces: `bandRotation(id: number): number` — consumed by Task 11's homepage band script (imported directly into a browser `<script>` block, so this file must have **zero imports**, matching `shelfWall.ts`'s `wallRotation`)

- [ ] **Step 1: Write the failing test**

```ts
// src/tests/guestbookRotation.test.ts
import { describe, it, expect } from 'vitest';
import { bandRotation } from '../utils/guestbookRotation';

describe('bandRotation', () => {
  it('is deterministic for the same id', () => {
    expect(bandRotation(42)).toBe(bandRotation(42));
  });

  it('stays within ±4 degrees', () => {
    for (const id of [1, 2, 3, 100, 9999, 123456]) {
      expect(Math.abs(bandRotation(id))).toBeLessThanOrEqual(4);
    }
  });

  it('spreads across ids (not all identical)', () => {
    const values = new Set(Array.from({ length: 20 }, (_, i) => bandRotation(i + 1)));
    expect(values.size).toBeGreaterThanOrEqual(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/guestbookRotation.test.ts`
Expected: FAIL — `Failed to resolve import "../utils/guestbookRotation"`

- [ ] **Step 3: Write the implementation**

```ts
// src/utils/guestbookRotation.ts
/**
 * Deterministic per-id rotation for the homepage guestbook band's name
 * pills, in [-4, 4] degrees at 0.1° steps — same djb2-xor seeding as
 * shelfWall's wallRotation, seeded from the numeric row id instead of a
 * slug. No imports: this file is bundled directly into a homepage
 * <script> block, so it must stay dependency-free.
 */
export function bandRotation(id: number): number {
  let h = 5381;
  const s = String(id);
  for (let i = 0; i < s.length; i++) {
    h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return ((h % 81) - 40) / 10;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/guestbookRotation.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/guestbookRotation.ts src/tests/guestbookRotation.test.ts
git commit -m "feat: add guestbook band rotation util"
```

---

## Task 5: Pure validation/hash/rate-limit util (server-only)

**Files:**
- Create: `src/utils/guestbook.ts`
- Test: `src/tests/guestbook.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: `guestbookMessageSchema` (zod object `{ name: string, message: string }`), `parseGuestbookInput(raw: { name: unknown; message: unknown }): { name: string; message: string }` (throws `ZodError` on invalid input), `sanitizeText(input: string): string`, `hashIp(ip: string, salt: string): string`, `isRateLimited(lastSubmittedAt: Date | null, now: Date, windowMs?: number): boolean`, and the constants `NAME_MAX_LENGTH = 40`, `MESSAGE_MAX_LENGTH = 100`, `RATE_LIMIT_WINDOW_MS = 300_000` — all consumed by Task 7 (POST route) and Task 10 (`/guestbook` page form attributes)

- [ ] **Step 1: Write the failing tests**

```ts
// src/tests/guestbook.test.ts
import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  hashIp,
  isRateLimited,
  parseGuestbookInput,
  NAME_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  RATE_LIMIT_WINDOW_MS,
} from '../utils/guestbook';

describe('sanitizeText', () => {
  it('trims and collapses internal whitespace', () => {
    expect(sanitizeText('  hello   world  ')).toBe('hello world');
  });

  it('collapses newlines and tabs to a single space', () => {
    expect(sanitizeText('line one\nline two\ttabbed')).toBe('line one line two tabbed');
  });

  it('strips control characters', () => {
    expect(sanitizeText('a\x00b\x1fc')).toBe('a b c');
  });
});

describe('hashIp', () => {
  it('is deterministic for the same ip + salt', () => {
    expect(hashIp('1.2.3.4', 'salt')).toBe(hashIp('1.2.3.4', 'salt'));
  });

  it('differs for different salts', () => {
    expect(hashIp('1.2.3.4', 'salt-a')).not.toBe(hashIp('1.2.3.4', 'salt-b'));
  });

  it('never contains the raw ip', () => {
    expect(hashIp('1.2.3.4', 'salt')).not.toContain('1.2.3.4');
  });

  it('produces a 64-char hex string (sha256)', () => {
    expect(hashIp('1.2.3.4', 'salt')).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('isRateLimited', () => {
  it('is false with no prior submission', () => {
    expect(isRateLimited(null, new Date())).toBe(false);
  });

  it('is true just inside the window', () => {
    const now = new Date('2026-01-01T00:05:00Z');
    const last = new Date('2026-01-01T00:01:00Z');
    expect(isRateLimited(last, now, RATE_LIMIT_WINDOW_MS)).toBe(true);
  });

  it('is false once the window has elapsed', () => {
    const now = new Date('2026-01-01T00:06:00Z');
    const last = new Date('2026-01-01T00:01:00Z');
    expect(isRateLimited(last, now, RATE_LIMIT_WINDOW_MS)).toBe(false);
  });
});

describe('parseGuestbookInput', () => {
  it('accepts a valid name + message', () => {
    expect(parseGuestbookInput({ name: 'Russ', message: 'hello there' }))
      .toEqual({ name: 'Russ', message: 'hello there' });
  });

  it('sanitizes before validating', () => {
    expect(parseGuestbookInput({ name: '  Russ  ', message: '  hi   there  ' }))
      .toEqual({ name: 'Russ', message: 'hi there' });
  });

  it('rejects an empty message', () => {
    expect(() => parseGuestbookInput({ name: 'Russ', message: '   ' })).toThrow();
  });

  it('rejects an empty name', () => {
    expect(() => parseGuestbookInput({ name: '  ', message: 'hi' })).toThrow();
  });

  it(`rejects a message over ${MESSAGE_MAX_LENGTH} characters`, () => {
    expect(() => parseGuestbookInput({ name: 'Russ', message: 'x'.repeat(MESSAGE_MAX_LENGTH + 1) })).toThrow();
  });

  it(`rejects a name over ${NAME_MAX_LENGTH} characters`, () => {
    expect(() => parseGuestbookInput({ name: 'x'.repeat(NAME_MAX_LENGTH + 1), message: 'hi' })).toThrow();
  });

  it('rejects non-string input', () => {
    expect(() => parseGuestbookInput({ name: 123, message: 'hi' })).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tests/guestbook.test.ts`
Expected: FAIL — `Failed to resolve import "../utils/guestbook"`

- [ ] **Step 3: Write the implementation**

```ts
// src/utils/guestbook.ts
/**
 * Guestbook validation/hash/rate-limit logic. Pure aside from
 * node:crypto's createHash, so this file must never be imported into a
 * browser <script> block (see guestbookRotation.ts for the client-safe
 * counterpart).
 */
import { z } from 'astro/zod';
import { createHash } from 'node:crypto';

export const NAME_MAX_LENGTH = 40;
export const MESSAGE_MAX_LENGTH = 100;
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

export const guestbookMessageSchema = z.object({
  name: z.string().min(1).max(NAME_MAX_LENGTH),
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
});

export type GuestbookMessageInput = z.infer<typeof guestbookMessageSchema>;

/** Collapses whitespace/newlines/control chars to single spaces and trims. */
export function sanitizeText(input: string): string {
  return input
    .replace(/[\x00-\x1f\x7f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** sha256("<ip>:<salt>") — the raw ip is never stored or returned. */
export function hashIp(ip: string, salt: string): string {
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex');
}

export function isRateLimited(
  lastSubmittedAt: Date | null,
  now: Date,
  windowMs: number = RATE_LIMIT_WINDOW_MS,
): boolean {
  if (!lastSubmittedAt) return false;
  return now.getTime() - lastSubmittedAt.getTime() < windowMs;
}

/** Sanitizes then validates. Throws a ZodError on invalid input. */
export function parseGuestbookInput(raw: { name: unknown; message: unknown }): GuestbookMessageInput {
  const name = sanitizeText(typeof raw.name === 'string' ? raw.name : '');
  const message = sanitizeText(typeof raw.message === 'string' ? raw.message : '');
  return guestbookMessageSchema.parse({ name, message });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/tests/guestbook.test.ts`
Expected: PASS (17 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/guestbook.ts src/tests/guestbook.test.ts
git commit -m "feat: add guestbook validation/hash/rate-limit util"
```

---

## Task 6: Database access layer

**Files:**
- Create: `src/utils/guestbookDb.ts`

**Interfaces:**
- Consumes: `DATABASE_URL` env var (Task 1)
- Produces: `insertMessage(name: string, message: string, ipHash: string): Promise<GuestbookRow>`, `listMessages(limit?: number): Promise<GuestbookRow[]>`, `lastSubmissionByIpHash(ipHash: string): Promise<Date | null>`, `deleteMessage(id: number): Promise<boolean>`, and the `GuestbookRow` type (`{ id: number; name: string; message: string; created_at: string }`) — all consumed by Task 7, 8, 9, 10

Not unit-tested directly (thin DB glue, same convention as the site's other API-route code) — verified in Task 12's manual pass.

- [ ] **Step 1: Write the module**

```ts
// src/utils/guestbookDb.ts
import { neon } from '@neondatabase/serverless';

// Lazy singleton: calling neon() at module load time would throw if
// DATABASE_URL isn't set yet (e.g. during `astro build` before the env
// var is configured). A plain lazy `let` avoids that — no Proxy, which
// breaks libraries that probe the wrapped object's shape.
let _sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

export interface GuestbookRow {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export async function insertMessage(name: string, message: string, ipHash: string): Promise<GuestbookRow> {
  const sql = getSql();
  const rows = await sql`
    insert into guestbook_messages (name, message, ip_hash)
    values (${name}, ${message}, ${ipHash})
    returning id, name, message, created_at
  `;
  return rows[0] as GuestbookRow;
}

export async function listMessages(limit?: number): Promise<GuestbookRow[]> {
  const sql = getSql();
  const rows = limit
    ? await sql`select id, name, message, created_at from guestbook_messages order by created_at desc limit ${limit}`
    : await sql`select id, name, message, created_at from guestbook_messages order by created_at desc`;
  return rows as GuestbookRow[];
}

export async function lastSubmissionByIpHash(ipHash: string): Promise<Date | null> {
  const sql = getSql();
  const rows = await sql`
    select created_at from guestbook_messages
    where ip_hash = ${ipHash}
    order by created_at desc
    limit 1
  `;
  return rows[0] ? new Date(rows[0].created_at as string) : null;
}

export async function deleteMessage(id: number): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`delete from guestbook_messages where id = ${id} returning id`;
  return rows.length > 0;
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx astro check`
Expected: no new type errors from `guestbookDb.ts` (nothing imports it yet, so this only confirms the file itself is well-typed).

- [ ] **Step 3: Commit**

```bash
git add src/utils/guestbookDb.ts
git commit -m "feat: add guestbook database access layer"
```

---

## Task 7: POST /api/guestbook (submit route)

**Files:**
- Create: `src/pages/api/guestbook/index.ts`

**Interfaces:**
- Consumes: `parseGuestbookInput`, `hashIp`, `isRateLimited`, `MESSAGE_MAX_LENGTH`, `NAME_MAX_LENGTH` (Task 5); `insertMessage`, `lastSubmissionByIpHash` (Task 6); `checkBotId` from `botid/server` (Task 3)
- Produces: `POST /api/guestbook` — on success, `201` with JSON `{ id, name, message, createdAt }`; consumed by Task 10's submit script

- [ ] **Step 1: Write the route**

```ts
// src/pages/api/guestbook/index.ts
export const prerender = false;

import type { APIContext, APIRoute } from 'astro';
import { checkBotId } from 'botid/server';
import {
  parseGuestbookInput,
  hashIp,
  isRateLimited,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from '../../../utils/guestbook';
import { insertMessage, lastSubmissionByIpHash } from '../../../utils/guestbookDb';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

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
    parsed = parseGuestbookInput({ name, message });
  } catch {
    return json(
      { error: `Name must be 1-${NAME_MAX_LENGTH} characters and message 1-${MESSAGE_MAX_LENGTH} characters.` },
      400,
    );
  }

  const salt = import.meta.env.GUESTBOOK_IP_SALT as string | undefined;
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
```

- [ ] **Step 2: Verify it type-checks and the build succeeds**

Run: `npx astro check && npm run build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/guestbook/index.ts
git commit -m "feat: add POST /api/guestbook submit route"
```

---

## Task 8: GET /api/guestbook/recent (homepage band feed)

**Files:**
- Create: `src/pages/api/guestbook/recent.ts`

**Interfaces:**
- Consumes: `listMessages` (Task 6)
- Produces: `GET /api/guestbook/recent` → `200` with JSON `{ entries: Array<{ id: number; name: string; message: string }> }`; consumed by Task 11's homepage band script

- [ ] **Step 1: Write the route**

```ts
// src/pages/api/guestbook/recent.ts
export const prerender = false;

import type { APIRoute } from 'astro';
import { listMessages } from '../../../utils/guestbookDb';

const RECENT_LIMIT = 15;

export const GET: APIRoute = async () => {
  const rows = await listMessages(RECENT_LIMIT);
  const entries = rows.map(r => ({ id: r.id, name: r.name, message: r.message }));

  return new Response(JSON.stringify({ entries }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};
```

- [ ] **Step 2: Verify it type-checks and the build succeeds**

Run: `npx astro check && npm run build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/guestbook/recent.ts
git commit -m "feat: add GET /api/guestbook/recent route"
```

---

## Task 9: DELETE /api/guestbook/[id] (admin safety valve)

**Files:**
- Create: `src/pages/api/guestbook/[id].ts`

**Interfaces:**
- Consumes: `deleteMessage` (Task 6), `GUESTBOOK_ADMIN_KEY` env var (Task 2)
- Produces: `DELETE /api/guestbook/:id` gated by `x-admin-key` header → `200 { deleted: true }` / `404 { deleted: false }` / `401` / `400`

- [ ] **Step 1: Write the route**

```ts
// src/pages/api/guestbook/[id].ts
export const prerender = false;

import type { APIRoute } from 'astro';
import { deleteMessage } from '../../../utils/guestbookDb';

export const DELETE: APIRoute = async ({ params, request }) => {
  const adminKey = import.meta.env.GUESTBOOK_ADMIN_KEY as string | undefined;
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
```

- [ ] **Step 2: Verify it type-checks and the build succeeds**

Run: `npx astro check && npm run build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/api/guestbook/[id].ts"
git commit -m "feat: add admin-gated DELETE /api/guestbook/:id route"
```

---

## Task 10: `/guestbook` page

**Files:**
- Create: `src/pages/guestbook.astro`

**Interfaces:**
- Consumes: `listMessages` (Task 6), `NAME_MAX_LENGTH`/`MESSAGE_MAX_LENGTH` (Task 5), `formatDate` (`src/utils/dates.ts`, existing), `BaseLayout`/`NavPill` (existing components), `POST /api/guestbook` (Task 7) via client fetch, `initBotId` from `botid/client/core` (Task 3)

- [ ] **Step 1: Write the page**

```astro
---
// src/pages/guestbook.astro
export const prerender = false;

import BaseLayout from '../layouts/BaseLayout.astro';
import NavPill from '../components/NavPill.astro';
import { formatDate } from '../utils/dates';
import { listMessages } from '../utils/guestbookDb';
import { NAME_MAX_LENGTH, MESSAGE_MAX_LENGTH } from '../utils/guestbook';

const messages = await listMessages();
---

<BaseLayout title="Guestbook" description="Leave your mark.">
  <NavPill />
  <div class="container">
    <header class="guestbook-header">
      <span class="p4g-tab">Guestbook</span>
      <h1 class="guestbook-title"><span class="p4g-heading">Leave your mark</span></h1>
      <span class="p4g-underline" aria-hidden="true"></span>
    </header>

    <form id="guestbook-form" class="guestbook-form">
      <div class="guestbook-form__row">
        <label for="gb-name">Name</label>
        <input id="gb-name" name="name" type="text" maxlength={NAME_MAX_LENGTH} required />
      </div>
      <div class="guestbook-form__row">
        <label for="gb-message">Message</label>
        <input
          id="gb-message"
          name="message"
          type="text"
          maxlength={MESSAGE_MAX_LENGTH}
          placeholder="leave your mark — one line"
          required
        />
      </div>
      <!-- Honeypot: hidden from real visitors, off-screen rather than display:none
           (some bots skip display:none fields specifically). -->
      <div class="guestbook-form__honeypot" aria-hidden="true">
        <label for="gb-website">Website</label>
        <input id="gb-website" name="website" type="text" tabindex="-1" autocomplete="off" />
      </div>
      <button type="submit" class="guestbook-form__submit p4g-sweep">
        <span>Sign</span>
      </button>
      <p id="guestbook-form__status" class="guestbook-form__status" role="status"></p>
    </form>

    <ul id="guestbook-list" class="guestbook-list">
      {messages.length > 0 ? (
        messages.map((m) => (
          <li id={`gb-${m.id}`} class="guestbook-list__item">
            <span class="guestbook-list__name">{m.name}</span>
            <span class="guestbook-list__message">{m.message}</span>
            <span class="guestbook-list__date">{formatDate(new Date(m.created_at))}</span>
          </li>
        ))
      ) : (
        <p class="empty-state">No one's signed yet — be the first.</p>
      )}
    </ul>
  </div>
</BaseLayout>

<style>
  .guestbook-header {
    max-width: 60ch;
    margin: 0 auto var(--space-2xl);
    padding-bottom: var(--space-xl);
    border-bottom: var(--border-thick) solid var(--color-gold-dim);
  }

  .guestbook-header :global(.p4g-tab) {
    margin-bottom: var(--space-xs);
  }

  .guestbook-title {
    font-size: var(--text-page-title);
    color: var(--color-gold);
    margin-bottom: var(--space-xs);
  }

  .guestbook-form {
    max-width: 60ch;
    margin: 0 auto var(--space-2xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .guestbook-form__row {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .guestbook-form__row label {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    color: var(--color-text-muted);
  }

  .guestbook-form__row input {
    min-height: 44px;
    padding: var(--space-sm) var(--space-md);
    background: var(--color-bg-elevated);
    border: var(--border-thin) solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    font-size: var(--text-md);
  }

  .guestbook-form__row input:focus-visible {
    outline: 2px solid var(--color-gold);
    outline-offset: 2px;
  }

  .guestbook-form__honeypot {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .guestbook-form__submit {
    align-self: flex-start;
    min-height: 44px;
    padding: var(--space-sm) var(--space-xl);
    background: var(--color-gold);
    color: var(--color-black);
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    border-radius: var(--radius-sm);
  }

  .guestbook-form__submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .guestbook-form__status {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    min-height: 1.5em;
  }

  .guestbook-form__status[data-tone='error'] {
    color: var(--color-live);
  }

  .guestbook-list {
    max-width: 60ch;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding-bottom: calc(var(--nav-clearance, 80px) + var(--space-md));
  }

  .guestbook-list__item {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    background: var(--color-bg-elevated);
    border: var(--border-thin) solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .guestbook-list__name {
    font-family: var(--font-display);
    color: var(--color-gold);
  }

  .guestbook-list__message {
    color: var(--color-text);
    flex: 1;
  }

  .guestbook-list__date {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-family: var(--font-mono);
  }

  .empty-state {
    color: var(--color-text-muted);
    font-style: italic;
    text-align: center;
    padding: var(--space-xl);
  }
</style>

<script>
  import { initBotId } from 'botid/client/core';

  initBotId({
    protect: [{ path: '/api/guestbook', method: 'POST' }],
  });

  interface SubmitResponse {
    id: number;
    name: string;
    message: string;
    createdAt: string;
  }

  const form = document.getElementById('guestbook-form') as HTMLFormElement | null;
  const list = document.getElementById('guestbook-list');
  const status = document.getElementById('guestbook-form__status');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form || !status) return;

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      message: formData.get('message'),
      website: formData.get('website'),
    };

    if (submitBtn) submitBtn.disabled = true;
    status.textContent = '';
    status.removeAttribute('data-tone');

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        status.textContent = (data as { error?: string }).error || 'Something went wrong.';
        status.dataset.tone = 'error';
        return;
      }

      const entry = await res.json() as SubmitResponse;

      const emptyState = document.querySelector('.empty-state');
      emptyState?.remove();

      const li = document.createElement('li');
      li.id = `gb-${entry.id}`;
      li.className = 'guestbook-list__item';
      li.innerHTML = `
        <span class="guestbook-list__name"></span>
        <span class="guestbook-list__message"></span>
        <span class="guestbook-list__date"></span>
      `;
      li.querySelector('.guestbook-list__name')!.textContent = entry.name;
      li.querySelector('.guestbook-list__message')!.textContent = entry.message;
      li.querySelector('.guestbook-list__date')!.textContent = new Date(entry.createdAt).toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      list?.prepend(li);

      form.reset();
      status.textContent = 'Signed — thanks for leaving your mark.';
    } catch {
      status.textContent = 'Network error — please try again.';
      status.dataset.tone = 'error';
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
</script>
```

- [ ] **Step 2: Verify it type-checks and the build succeeds**

Run: `npx astro check && npm run build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/guestbook.astro
git commit -m "feat: add /guestbook page"
```

---

## Task 11: Homepage ambient band

**Files:**
- Modify: `src/pages/index.astro` (insert markup after the closing `</div>` of `.container` at line 439, before `</BaseLayout>` at line 440; add CSS to the existing bottom `<style>` block; add JS to the existing bottom `<script>` block)

**Interfaces:**
- Consumes: `bandRotation` (Task 4), `GET /api/guestbook/recent` (Task 8)

- [ ] **Step 1: Insert the band markup**

Find this in `src/pages/index.astro` (currently lines 438–440):

```astro
    </BentoGrid>
  </div>
</BaseLayout>
```

Replace with:

```astro
    </BentoGrid>
  </div>

  <section class="guestbook-band" id="guestbook-band" aria-label="Guestbook signatures">
    <a href="/guestbook" class="guestbook-band__label p4g-tab">Guestbook</a>
    <div class="guestbook-band__pills" id="guestbook-band-pills"></div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Add the band CSS**

Add to the existing `<style>` block (near the top, alongside `.container`):

```css
  .guestbook-band {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-sm) var(--space-md);
    max-width: var(--content-max-width, 1200px);
    margin: 0 auto;
    padding: var(--space-md) var(--space-md) calc(var(--nav-clearance, 80px) + var(--space-md));
  }

  .guestbook-band__pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  /* Ticket-stub treatment: dashed gold border on black, mono caps, a small
     sparkle accent — reads like a raffle/claim stub rather than a plain tag. */
  .guestbook-band__pill {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: var(--space-2xs) var(--space-sm);
    background: var(--color-black);
    border: var(--border-hairline) dashed var(--color-gold);
    border-radius: var(--radius-sm);
    color: var(--color-gold);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    letter-spacing: 0.03em;
    text-decoration: none;
    transform: rotate(var(--rot, 0deg));
    transition: border-color var(--transition-fast), background-color var(--transition-fast);
  }

  .guestbook-band__pill::after {
    content: '\2726';
    margin-left: var(--space-xs);
    font-size: var(--text-floor, 10px);
    opacity: 0.6;
  }

  .guestbook-band__pill:hover,
  .guestbook-band__pill:focus-visible,
  .guestbook-band__pill.is-revealed {
    border-color: var(--color-gold-orange);
    background: rgba(var(--color-gold-rgb), 0.08);
  }

  .guestbook-band__flyout {
    position: absolute;
    bottom: calc(100% + var(--space-xs));
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    max-width: 60vw;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: var(--space-2xs) var(--space-sm);
    background: var(--color-bg-elevated);
    border: var(--border-hairline) solid var(--color-gold);
    border-radius: var(--radius-sm);
    color: var(--color-text);
    font-size: var(--text-xs);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity var(--transition-fast);
  }

  .guestbook-band__pill:hover .guestbook-band__flyout,
  .guestbook-band__pill:focus-visible .guestbook-band__flyout,
  .guestbook-band__pill.is-revealed .guestbook-band__flyout {
    opacity: 1;
    visibility: visible;
  }

  @media (prefers-reduced-motion: reduce) {
    .guestbook-band__pill,
    .guestbook-band__flyout {
      transition: none;
    }
  }
```

- [ ] **Step 3: Add the band script**

Add to the existing bottom `<script>` block, alongside the other `import` and `initializeX` functions:

```ts
  import { bandRotation } from '../utils/guestbookRotation';

  interface GuestbookEntry {
    id: number;
    name: string;
    message: string;
  }

  async function initializeGuestbookBand(): Promise<void> {
    const pillsEl = document.getElementById('guestbook-band-pills');
    if (!pillsEl || pillsEl.dataset.bound === 'true') return;
    pillsEl.dataset.bound = 'true';

    let entries: GuestbookEntry[];
    try {
      const res = await fetch('/api/guestbook/recent');
      if (!res.ok) return;
      const data = await res.json() as { entries: GuestbookEntry[] };
      entries = data.entries;
    } catch {
      return;
    }

    if (entries.length === 0) return;

    for (const entry of entries) {
      const pill = document.createElement('a');
      pill.href = `/guestbook#gb-${entry.id}`;
      pill.className = 'guestbook-band__pill';
      pill.style.setProperty('--rot', `${bandRotation(entry.id)}deg`);
      pill.textContent = entry.name;

      const flyout = document.createElement('span');
      flyout.className = 'guestbook-band__flyout';
      flyout.textContent = entry.message;
      pill.appendChild(flyout);

      pill.addEventListener('click', (e) => {
        if (window.matchMedia('(hover: none)').matches && !pill.classList.contains('is-revealed')) {
          e.preventDefault();
          document.querySelectorAll('.guestbook-band__pill.is-revealed')
            .forEach(p => { if (p !== pill) p.classList.remove('is-revealed'); });
          pill.classList.add('is-revealed');
        }
      });

      pillsEl.appendChild(pill);
    }
  }
```

Then add `initializeGuestbookBand();` next to the other `// Run on initial page load` calls, and inside the `astro:page-load` listener next to the other re-init calls (both existing blocks near the end of the script — do not add a new listener, extend the existing two).

- [ ] **Step 4: Verify it type-checks and the build succeeds**

Run: `npx astro check && npm run build`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add homepage guestbook band"
```

---

## Task 12: Manual end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server and open the homepage**

Run the dev server (`npm run dev`) and open it in the browser preview. Confirm the guestbook band renders below the bento grid (it will be empty if no messages exist yet — that's expected; skip to Step 2 first, then reload the homepage).

- [ ] **Step 2: Submit a message on `/guestbook`**

Navigate to `/guestbook`. Submit a valid name + message. Confirm: the new entry appears at the top of the list immediately (optimistic prepend), the form clears, and the status line reads "Signed — thanks for leaving your mark."

- [ ] **Step 3: Trigger the rate limit**

Submit a second message immediately after. Confirm the status line shows the 429 message ("One message at a time — try again in a few minutes.") and no duplicate entry is added to the list.

- [ ] **Step 4: Confirm the honeypot silently no-ops**

Using the browser devtools console on `/guestbook`, run:
```js
fetch('/api/guestbook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'bot', message: 'spam', website: 'http://spam.example' }),
}).then(r => r.status).then(console.log);
```
Expected: logs `200`, and reloading `/guestbook` shows no new "bot" entry was inserted.

- [ ] **Step 5: Confirm length caps are enforced**

Try submitting a message over 100 characters (the `maxlength` attribute should prevent typing past the cap; also verify the same request via devtools console with a message artificially longer than 100 chars gets a `400`).

- [ ] **Step 6: Reload the homepage and check the band**

Reload `/`. Confirm the guestbook band now shows the name(s) just submitted, each pill slightly rotated. Hover a pill (desktop) and confirm the message flyout appears above it. Click a pill and confirm it navigates to `/guestbook#gb-<id>`.

- [ ] **Step 7: Check mobile tap behavior**

Using `resize_window` to the mobile preset, reload the homepage. Tap a pill once — confirm the flyout reveals without navigating. Tap it again (or tap another pill) — confirm it navigates / the reveal switches.

- [ ] **Step 8: Check reduced motion**

Set `prefers-reduced-motion: reduce` (via `resize_window`'s `colorScheme` sibling option or OS emulation) and reload. Confirm the band pills still render (rotation is static, not animated) and hover/focus reveal still works without a transition.

- [ ] **Step 9: Test the admin delete route**

Using devtools console or `curl`, call the delete route for the id created in Step 2:
```bash
curl -X DELETE https://localhost:4321/api/guestbook/<id> -H "x-admin-key: <the GUESTBOOK_ADMIN_KEY value>"
```
Expected: `200 {"deleted":true}`. Calling it again for the same id: `404 {"deleted":false}`. Calling it with a wrong/missing key: `401`.

- [ ] **Step 10: Run the full test suite**

Run: `npm run test`
Expected: all tests pass, including the new `guestbook.test.ts` and `guestbookRotation.test.ts`.

- [ ] **Step 11: No commit for this task** (verification only — if any step surfaces a bug, fix it in the relevant task's files and commit there)
