# Traces — design spec

Date: 2026-08-23 (revised: renamed from "Guestbook" to "Traces";
homepage interaction changed from full-page navigation to a
modal/overlay, per follow-up discussion after the visual companion
session)

## Purpose

Give visitors a way to leave a public, lightweight mark on the site —
a classic guestbook, not per-entry comments. Two hard constraints
drove every decision below: bot submissions must be filtered
invisibly (no CAPTCHA), and the input shape itself should nudge
people toward short, honest/playful lines rather than open-ended
ranting or spam-shaped text.

**Naming:** the feature is called **Traces** everywhere user-facing
(the homepage tab, the page title, the standalone route). "Guestbook"
was the working name during design; it's dated and generic. Internal
identifiers (table name, route paths, util filenames) use `traces`
throughout for consistency — there is no user-facing/internal name
split.

## Non-goals

- Per-page/per-note comments (rejected in favor of a single running
  list)
- User accounts, auth, or verified identity for authors
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
create table traces_messages (
  id          bigserial primary key,
  name        text not null,
  message     text not null,
  ip_hash     text not null,
  created_at  timestamptz not null default now()
);
create index traces_messages_created_at_idx
  on traces_messages (created_at desc);
```

`ip_hash` is `sha256(ip + secret_salt)` — never the raw IP. It exists
only for rate-limiting and abuse tracing, not display.

### Routes

The site is currently fully static. Astro 5 with the Vercel adapter
allows per-route opt-out of prerendering (`export const prerender =
false`) without changing the site-wide `output` mode — only the
routes below go dynamic; everything else stays static as today.

- `POST /api/traces` — submit a message
- `GET /api/traces` — public, returns messages newest-first as JSON
  (`{ entries: [{ id, name, message }] }`). Accepts an optional
  `?limit=N` query param: the homepage band requests `?limit=15`; the
  modal (see below) requests it with no limit for the full list. One
  route handles both the band's small feed and the modal's full list
  — no need for a separate `/recent` endpoint.
- `DELETE /api/traces/[id]` — admin delete, gated by a secret key
  checked against an `x-admin-key` header (env var
  `TRACES_ADMIN_KEY`); not a UI, invoked manually (curl/bookmarklet)
- `/traces` page — full list + the submit form, newest first,
  server-rendered (same on-demand rendering as the API routes) so it's
  always current; P4G-styled, matching the journal/shelf visual
  language. This is the **fallback and canonical destination**: it
  works with no JS, and it's what gets linked/shared. It is not the
  primary way most visitors will interact with the feature — see
  Homepage below.

### Data flow — submit

Identical whether the visitor is on the `/traces` page or the
homepage modal (see Homepage) — both post to the same endpoint and
render the response the same way, just into different DOM containers:

1. Visitor fills name + message (see Input below)
2. Client posts to `POST /api/traces` with a BotID token attached
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

### Data flow — homepage

The homepage stays static-generated; everything below is a
progressive-enhancement layer, the same pattern the Stream tile
already uses for `/api/live-status.ts` polling:

1. On page load, client fetches `GET /api/traces?limit=15`
2. Renders each returned name as a small pill in a horizontal band,
   positioned/rotated deterministically from its `id` (same technique
   as `wallRotation()` in `shelfWall.ts` — slug-seeded, here
   id-seeded). This tilt is a fixed cosmetic angle per message, not an
   animation — it never changes after render.
3. The pills' flyouts **auto-cycle**, one active at a time, ~2.5s apart,
   looping continuously — the same idea as the homepage Latest tile's
   auto-cycling excerpt, so a visitor who never touches the band still
   passively sees several messages. Hovering/focusing a pill pauses the
   cycle on that pill (so reading isn't interrupted) and resumes from
   there on mouseleave/blur. Under `prefers-reduced-motion`, cycling is
   disabled entirely (matching the Latest tile's own reduced-motion
   behavior) and the first pill's flyout is shown statically. (The
   `?limit=15` response already includes message text, so no second
   fetch is needed for any of this.)
4. **Clicking the "Traces" tab, or any pill, opens a modal/dialog over
   the homepage** — it does not navigate away. The modal fetches
   `GET /api/traces` (no limit — full list) on open and client-renders
   the same form + full list that `/traces` renders server-side. A
   pill click also scrolls the modal's list to that entry on open.
5. Touch devices: first tap on a pill reveals the flyout; a second tap
   (or tapping elsewhere on the pill) opens the modal — matching the
   hover-then-click pattern already used elsewhere in the codebase
6. No JS → the band simply doesn't render, and the "Traces" tab is a
   plain link to `/traces` instead of a modal trigger (progressive
   enhancement: the tab is an `<a href="/traces">` by default; JS
   intercepts the click to open the modal instead, same technique the
   homepage's journal tile already uses for its own click routing)
7. The modal is dismissible via ESC, a close button, and clicking the
   backdrop — standard dialog behavior, focus-trapped while open

### Placement

Not a bento tile. A thin horizontal strip below the bento grid, above
where the footer would be — the homepage's `NavPill` is already hidden
here (per CLAUDE.md), so this space is free. Visually: small
angled/rotated name pills in a **ticket-stub treatment** — dashed gold
border on black, monospace caps, a small ✦ accent — chosen over a
plain quiet tag or a paper-sticky-note look after reviewing all three
in the visual companion.

## Input shape (the tone-steering part)

- Two fields: `name` (short, required, capped at 40 characters) and
  `message` (required, hard-capped at 100 characters — enforced both
  client-side via `maxlength` and server-side)
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
   (e.g. 5 minutes), enforced via a query against `traces_messages` —
   no separate rate-limit service needed at this volume
4. **Length cap + plain-text-only** — removes the two easiest spam
   vectors (wall-of-text payloads, embedded links/markup)
5. **Blocklist** — a narrow, whole-word/phrase match (with basic
   leetspeak normalization) against an editable list of terms. Ships
   with only unambiguous self-harm-incitement phrases by default (zero
   legitimate use, zero false-positive risk); it is explicitly not a
   general profanity/slur filter — what else counts as unacceptable
   for this site is the owner's editorial call, made by extending the
   list directly, not something generated generically. This targets
   the one gap the layers above don't cover: a single human-typed
   hostile message posting once. The admin-delete route remains the
   backstop for whatever this doesn't catch.

## Moderation

The blocklist above (see Anti-spam) is a proactive filter, not a
review step — it runs inline on submit, before insert. It complements,
rather than replaces, the reactive safety valve below.

No pre-publish queue — messages go live immediately. The only
after-the-fact control is `DELETE /api/traces/[id]`, gated by a secret
admin key, invoked manually when something slips through. No admin
UI; this is a safety valve, not a workflow.

## Testing

Following the project's existing split (pure logic in `src/utils/`,
unit-tested with vitest; framework glue thin and untested directly —
same pattern as `journal.ts`/`journalMerge.ts` and `shelfWall.ts`):

- New `src/utils/traces.ts` (pure): message validation (length/
  empty-after-trim), rate-limit window check (given "now" and "last
  submission at", pure comparison), `ip_hash` computation
- New `src/utils/tracesRotation.ts` (pure, zero imports — gets bundled
  directly into the homepage's client `<script>`): the id-seeded
  rotation calc for the homepage band's pills
- `src/tests/traces.test.ts` and `src/tests/tracesRotation.test.ts`
  cover the above
- API routes (`src/pages/api/traces*.ts`) stay thin: parse request →
  call pure validators → touch the DB → respond. Not unit-tested
  directly; verified manually via the dev server (submit flow,
  rate-limit trigger, honeypot trigger, admin delete) per the
  project's verification workflow before calling this done
- `/traces` page, the homepage band, and the modal verified visually
  in the browser preview (empty state, several entries, auto-cycling
  flyouts, hover-to-pause/resume, mobile tap-then-reveal-then-open,
  modal open/close/focus-trap, reduced-motion disables cycling)

## Open implementation details (left for the plan)

- Exact copy for the placeholder/label and empty states
- Rate-limit window length (proposing 5 minutes, adjustable)
- Exact modal sizing/breakpoint behavior on narrow viewports
