# Guestbook — design spec

Date: 2026-08-23

## Purpose

Give visitors a way to leave a public, lightweight mark on the site —
a classic guestbook, not per-entry comments. Two hard constraints
drove every decision below: bot submissions must be filtered
invisibly (no CAPTCHA), and the input shape itself should nudge
people toward short, honest/playful lines rather than open-ended
ranting or spam-shaped text.

## Non-goals

- Per-page/per-note comments (rejected in favor of a single guestbook)
- User accounts, auth, or verified identity for guestbook authors
- A moderation queue / pre-publish approval step (messages publish
  immediately; see Moderation)
- Threaded replies or reactions

## Architecture

### Storage: Neon Postgres

Provisioned via the Vercel Marketplace (`vercel integration add neon`
→ `vercel env pull`). Relational, structured, low write volume — a
good fit, and lets the rate-limit check and the message list come
from the same simple SQL rather than juggling a second KV service.

```sql
create table guestbook_messages (
  id          bigserial primary key,
  name        text not null,
  message     text not null,
  ip_hash     text not null,
  created_at  timestamptz not null default now()
);
create index guestbook_messages_created_at_idx
  on guestbook_messages (created_at desc);
```

`ip_hash` is `sha256(ip + secret_salt)` — never the raw IP. It exists
only for rate-limiting and abuse tracing, not display.

### Routes

The site is currently fully static. Astro 5 with the Vercel adapter
allows per-route opt-out of prerendering (`export const prerender =
false`) without changing the site-wide `output` mode — only the
guestbook routes below go dynamic; everything else stays static as
today.

- `POST /api/guestbook` — submit a message
- `GET /api/guestbook/recent` — public, returns the last ~15 `{ id,
  name }` pairs only (no message text — see Homepage below)
- `DELETE /api/guestbook/[id]` — admin delete, gated by a secret key
  checked against an `x-admin-key` header (env var
  `GUESTBOOK_ADMIN_KEY`); not a UI, invoked manually (curl/bookmarklet)
- `/guestbook` page — full list, newest first, server-rendered (same
  on-demand rendering as the API routes) so it's always current;
  P4G-styled list matching the journal/shelf visual language

### Data flow — submit

1. Visitor fills name + message on `/guestbook` (see Input below)
2. Client posts to `POST /api/guestbook` with a BotID token attached
3. Server validates, in order, short-circuiting on first failure:
   - honeypot field non-empty → reject silently (200 OK, no-op) so
     bots get no signal they were caught
   - BotID token invalid → 403, generic message
   - `ip_hash` has a submission within the rate-limit window (e.g.
     last 5 minutes) → 429, friendly "one at a time" message
   - `message` exceeds the character cap or is empty after trim → 400
4. On success: strip the message to plain text (no HTML/markdown
   rendering — stored and displayed as literal text, so there's no
   markup-injection surface), insert row, return the new entry
5. Client appends the new entry to the visible list (optimistic) and
   clears the form

### Data flow — homepage band

The homepage stays static-generated; the band is a small progressive
enhancement layered on top, the same pattern the Stream tile already
uses for `/api/live-status.ts` polling:

1. On page load, client fetches `GET /api/guestbook/recent`
2. Renders each returned name as a small pill in a horizontal band,
   positioned/rotated deterministically from its `id` (same technique
   as `wallRotation()` in `shelfWall.ts` — slug-seeded, here
   id-seeded)
3. Hover/focus on a name reveals that entry's message in a small
   flyout (a second, on-demand fetch or — simpler — `/recent` returns
   message text too, capped at 15 rows, since the payload is tiny;
   revisit only if that ever feels wrong)
4. Clicking a name navigates to `/guestbook` (view-transition link)
5. Touch devices: first tap reveals the flyout, a second tap on the
   same name (or the flyout itself) navigates — matching the
   hover-then-click pattern already used elsewhere in the codebase
6. No JS → the band simply doesn't render. This is fine: it's
   decorative surfacing, not the source of truth. `/guestbook` (plain
   server-rendered list, no JS required to read) is.

### Placement

Not a bento tile. A thin horizontal strip below the bento grid, above
the footer — the homepage's `NavPill` is already hidden here (per
CLAUDE.md), so this space is free. Visually: small angled/rotated name
pills in the P4G gold-on-black language, echoing the `/shelf` wall's
pinned-rotation motif at a much smaller scale.

## Input shape (the tone-steering part)

- Two fields: `name` (short, required) and `message` (required,
  hard-capped at ~100 characters — enforced both client-side via
  `maxlength` and server-side)
- No rotating prompts (adds build/maintenance surface for a tone
  effect the character cap already produces)
- No reaction chips (dropped — extra design/build surface, cap does
  the work)
- A fixed placeholder/label that frames the intended tone, e.g. *"leave
  your mark — one line"* — static copy, not data-driven
- Message stored and rendered as plain text only; no markdown, no HTML

## Anti-spam (all invisible to real visitors)

1. **Honeypot field** — hidden input real users never fill; a filled
   honeypot silently no-ops the request (no error surfaced, so a bot
   gets no feedback loop to calibrate against)
2. **Vercel BotID** — invisible challenge on the submit endpoint, no
   user-facing puzzle
3. **Rate limit** — one submission per `ip_hash` per rate-limit window
   (e.g. 5 minutes), enforced via a query against
   `guestbook_messages` — no separate rate-limit service needed at
   this volume
4. **Length cap + plain-text-only** — removes the two easiest spam
   vectors (wall-of-text payloads, embedded links/markup)

## Moderation

No pre-publish queue — messages go live immediately. The only
after-the-fact control is `DELETE /api/guestbook/[id]`, gated by a
secret admin key, invoked manually when something slips through. No
admin UI; this is a safety valve, not a workflow.

## Testing

Following the project's existing split (pure logic in `src/utils/`,
unit-tested with vitest; framework glue thin and untested directly —
same pattern as `journal.ts`/`journalMerge.ts` and `shelfWall.ts`):

- New `src/utils/guestbook.ts` (pure): message validation (length/
  empty-after-trim), rate-limit window check (given "now" and "last
  submission at", pure comparison), `ip_hash` computation, and the
  id-seeded rotation/position calc for the homepage band
- `src/tests/guestbook.test.ts` covers all of the above
- API routes (`src/pages/api/guestbook*.ts`) stay thin: parse request
  → call pure validators → touch the DB → respond. Not unit-tested
  directly; verified manually via the dev server (submit flow,
  rate-limit trigger, honeypot trigger, admin delete) per the project's
  verification workflow before calling this done
- `/guestbook` page and the homepage band verified visually in the
  browser preview (empty state, several entries, hover/focus reveal,
  mobile tap-then-navigate, reduced-motion)

## Open implementation details (left for the plan)

- Exact copy for the placeholder/label and empty states
- Rate-limit window length (proposing 5 minutes, adjustable)
- Character cap (proposing 100, adjustable)
- Exact visual treatment of the band (pill styling, spacing, mobile
  behavior at narrow widths)
