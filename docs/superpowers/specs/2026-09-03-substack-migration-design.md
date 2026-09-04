# Substack migration — design

**Date:** 2026-09-03
**Status:** approved, pending implementation

## Summary

Writing moves to Substack (`https://ninjaruss.substack.com`). The site stops
serving note prose entirely. The note markdown stays in the repository — public
on GitHub — where it continues to be the author's working copy, but it no longer
produces pages.

Showcases stay on the site and stay canonical here. `/journal`, which merged
notes and showcases into one list, is dissolved: after this change the two were
never really one stream, and pretending otherwise would leave a list where half
the rows redirect off-site.

## Decisions

These were settled during brainstorming and are not open in implementation:

1. **Substack is canonical.** The site is not a mirror; it does not serve the prose at all.
2. **Every note eventually gets a Substack post.** `substackUrl` is optional in
   the schema only because a half-written entry must not fail the build.
3. **No notes listing on the site.** Substack's own `/archive` already does this,
   automatically and better. A hand-synced copy would be strictly worse.
4. **Showcases stay**, canonical on the site, as their own surface.
5. **`/rss.xml` redirects** to the Substack feed rather than 404ing.
6. **The homepage keeps advertising the writing**, via a build-time fetch of the
   Substack feed.

## Non-goals

- Mirroring or archiving post prose on the site.
- Cross-posting automation in either direction. Publishing is manual.
- Any change to `/novel`, `/shelf`, `/now`, `/traces`, or the arc card.

## Routes

| Route | Today | After |
|---|---|---|
| `/notes/[slug]` | full prose, SplitViewLayout | **301 → the note's Substack post** |
| `/notes` | 301 → `/journal?types=note` | **301 → Substack archive** (same route, empty slug) |
| `/journal` | merged notes + showcases | **301 → `/showcase`** |
| `/showcase` | 301 → `/journal?types=showcase` | **the showcase surface** |
| `/showcase/[slug]` | SplitViewLayout, merged list panel | same, list panel showcase-only |
| `/rss.xml` | site feed | **301 → `https://ninjaruss.substack.com/feed`** |

### Note redirects are server-rendered

`/notes/[...slug].astro` becomes an on-demand route (`export const prerender =
false`) that reads the `notes` collection, looks up the slug, and returns
`Astro.redirect(substackUrl, 301)`. Unknown slugs and notes not yet backfilled
fall back to `https://ninjaruss.substack.com/archive`.

Because the parameter is a rest parameter, this route also matches bare `/notes`
(empty slug), which takes the same archive fallback. `src/pages/notes/index.astro`
is therefore deleted with no replacement redirect — adding a `vercel.json` entry
for `/notes` would shadow the route and is unnecessary.

This is deliberate. The alternatives were both worse:

- **`Astro.redirect` from a static page** degrades to a meta-refresh HTML
  document. Browsers follow those; search engines treat them as weak signals and
  feed readers ignore them. It would not preserve the inbound links this exists
  to preserve.
- **Per-slug entries in `astro.config.mjs` or `vercel.json`** need the slug→URL
  map at config time, which means either duplicating it outside the frontmatter
  or generating a checked-in file from a prebuild script. Both create a sync
  obligation that the SSR route does not have.

The site already opts into on-demand rendering for the Traces API, so this
introduces no new deployment concern — only one additional function.

`/rss.xml` is the exception: it is a single fixed external destination with no
lookup, and feed readers must get a true 301, so it goes in `vercel.json`
alongside the existing BotID rewrites. `/journal` → `/showcase` is internal and
fixed, so it goes in `astro.config.mjs` beside the existing `/status` and
`/stream` entries.

## Content and data

### `notes` collection

Stays defined in `src/content/config.ts`. Files stay in `src/content/notes/`.
The collection is now **data for redirects**, not a source of pages — keeping the
prose and its mapping in one file is the point.

Schema gains one field:

```ts
substackUrl: z.string().url().optional(),
```

### Backfill

All 24 existing notes get posted to Substack over time and have `substackUrl`
filled in. Until then those slugs redirect to the archive. Backfill is the
author's ongoing manual work, not part of this implementation.

### Inbound prose links

Two references to note URLs exist in content and break otherwise:

- `src/content/profile/about.md` → `/notes/i-am-ninjaruss`
- `src/content/now/2026-03.md` → `/notes/addiction`

Both keep working through the redirect route, so neither is urgent. Retarget
them to the Substack URLs once those two notes are backfilled.

`collections: ["japan"]` appears on 6 notes and on no shelf or showcase entry, so
`RelatedContent` loses no cross-collection edges when notes stop rendering.

## Surfaces

### `/showcase` (new index)

`SplitViewLayout`, `section="showcase"`, showcase entries only, **bare**: no
search, no draw deck, no type control, no RSS icon. Six entries in date order.

`populateTypes` already hides the type control when fewer than two types are
present (`filterUI.ts:22`), so that one needs no change.

Search is unconditional markup, so suppressing it means gating the whole
`.split-view__filter` block behind a new `showSearch` prop (default `true`).
**The client JS in `eventBindings` and `filterEngine` queries those nodes.** Every
query site must be audited and null-guarded before the block is removed: an
unguarded dereference throws during init and takes *detail-panel content loading*
down with it, not just filtering. This is the highest-risk change in the plan and
must be verified in the browser, not by reading.

### `/showcase/[slug]`

Unchanged except that its list panel renders showcases instead of the merged
journal. Canonical stays self.

### Homepage — Journal tile

The 4×2 core tile's left field currently lists seven note titles. It becomes the
latest Substack posts, linking out; the right field keeps the three showcase
rows. The two-zone slash design survives and gets more honest — writing on one
side, projects on the other, two real destinations rather than two filters of one
list.

- `data-tile-href` → `/showcase`
- left field head → `https://ninjaruss.substack.com`
- right field tab `/journal?types=showcase` → `/showcase`
- kicker `Journal` → `Writing` (it currently sits above an `h3` reading "Notes"
  and, once no route is named journal, is a stale label duplicating the word
  beneath it)

### Homepage — Latest tile

Currently cycles the latest 2 notes + 1 showcase. Becomes the latest 2 Substack
posts + 1 showcase. Substack items have no per-entry emblem; they use
`/images/emblems/scroll.svg`, the existing default for written reflection.

### Substack feed fetch

New `src/utils/substack.ts`:

- `parseSubstackFeed(xml: string): SubstackPost[]` — pure, zero-import, unit
  tested against a checked-in fixture. Extracts title, link, pubDate, and
  description from `<item>` elements. No new dependency; the shape of a Substack
  RSS item is stable and narrow enough not to justify one.
- `fetchSubstackPosts(limit)` — build-time `fetch` of
  `https://ninjaruss.substack.com/feed`, wrapped in `try`/`catch`, **returning
  `[]` on any failure**. A Substack outage or an offline build must degrade to a
  showcase-only tile, never fail the build.

Both homepage tiles render conditionally on a non-empty result, the same way the
Journal tile already guards `recentShowcase.length > 0`.

### NavPill

`{ href: '/journal', label: 'Journal', match: ['/journal','/notes','/showcase'] }`
becomes `{ href: '/showcase', label: 'Showcase', match: ['/showcase'] }`. Still
six items, so the ≤768px 4+3 wrap is unaffected.

No external Substack nav item: `/about` and the homepage tile carry that link,
and an outbound link in site-section navigation reads as a mistake.

### `/about`

In `src/content/profile/about.md`:

- `links[]`: add `{ label: "Substack", href: "https://ninjaruss.substack.com", primary: true }`
- `Read the journal` → `Read on Substack`, pointing at the publication
- `makes[]` "Things I build": `/journal?types=showcase` → `/showcase`

`src/tests/profile.test.ts` asserts on that `makes` href and updates with it.

### `BaseLayout`

The autodiscovery `<link rel="alternate" type="application/rss+xml">` retargets
to `https://ninjaruss.substack.com/feed`, title `ninjaruss — Substack`.

No `canonical` prop is added. An earlier draft threaded one through for mirrored
note pages; with no note pages served, there is nothing to canonicalise.

## Deletions

| Path | Why |
|---|---|
| `src/pages/journal/index.astro` | route dissolved |
| `src/pages/notes/index.astro` | the rest route matches bare `/notes` |
| `src/pages/rss.xml.ts` | feed moves to Substack |
| `src/utils/journal.ts` | no callers once the merge is gone |
| `src/utils/journalMerge.ts` | same |
| `src/tests/journal.test.ts` | tests the deleted merge |
| `src/utils/splitView/drawCard.ts` | notes-only pool, no notes surface |
| `src/tests/drawCard.test.ts` | same |
| draw UI in `SplitViewLayout.astro` | `showDraw` prop, deck markup, mobile DRAW button |

`SplitViewLayout` and the remaining `splitView/` modules survive for showcase.
`EmblemCard`, which is used nowhere else, survives with them.

## Testing

**New**

- `src/tests/substack.test.ts` — `parseSubstackFeed` against a fixture: a normal
  multi-item feed, an empty feed, and malformed XML (must return `[]`, not throw).

**Updated**

- `src/tests/profile.test.ts` — the `/showcase` href.

**Deleted**

- `src/tests/journal.test.ts`, `src/tests/drawCard.test.ts`.

**Verification before any completion claim**

1. `npm test` green.
2. `npm run build` green.
3. Browser pane: `/showcase` renders its list; **a showcase detail page loads its
   content into the detail panel** (the filter-block removal risk); the homepage
   renders Substack rows in the Journal tile and cycles the Latest tile.
4. `curl -sI` a note URL on the deployment and confirm a real `301` with the
   right `Location`, not a 200 carrying a meta-refresh.

Per the project's browser-pane notes, assert via DOM reads rather than
screenshots where the two disagree.

## Documentation

`CLAUDE.md` documents `/journal`, the journal tile, the RSS feed, the draw deck,
`journal.ts`/`journalMerge.ts`, and the legacy-redirect table. All of it needs
updating, plus a new section describing the Substack relationship and the
`substackUrl` backfill obligation. This is part of the work.

## Risks

| Risk | Mitigation |
|---|---|
| Removing `.split-view__filter` throws in client init and breaks showcase detail loading | Audit and null-guard every query site; verify in browser |
| Substack feed unreachable at build | `try`/`catch` → `[]`; tiles guard on empty |
| Substack changes its feed markup | `parseSubstackFeed` returns `[]` rather than throwing; tile degrades |
| A note redirects to the archive instead of its post | Expected during backfill; the archive is a correct if imprecise destination |
| Inbound links and search results to `/notes/*` | Preserved by the 301 route; this is the reason it is server-rendered |
