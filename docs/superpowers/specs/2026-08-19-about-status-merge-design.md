# Merging /status into /about

**Date:** 2026-08-19
**Status:** approved, ready for implementation planning

## Why

`/about` and `/status` are two one-screen answers to "who is this?" that already
share three quarters of their substance:

| Shared | `/about` | `/status` |
|---|---|---|
| protagonist header (portrait / name / epithet from `_protagonist.md`) | ✓ | ✓ |
| `profile.links` strip | all links, `Find me` rail | external-only, `status-row` |
| client-assembled mailbox (never in served HTML) | `#about-mail` | `#mail-address` |

Only two things are unique to `/status`: the current-arc card and the `LV n`
chip. Maintaining a whole route, a whole stylesheet, and a duplicate mailbox
script for those two is not worth it — and a visitor who lands on one page has
no reason to suspect the other exists.

The merge keeps `/about` as the surviving page and folds the arc card in as its
live layer. Framing: **a profile that has a status**, not a status screen that
has a profile.

## The merged page

Layout is unchanged — header, left rail, main column. One insertion, one
absorption, one deletion.

### Arc card → top of the main column

The arc card becomes the first child of `.about__main`, above the hook:

```
[arc card — accent border, stat emblem badge, "Current arc · <Stat>",
 arc title, "Active decision" + decision text, "updated …"]
hook
What I make
Subjects I explore
About (prose)
Now
```

The live thing leads; the static profile follows. The card keeps its existing
markup and its `--arc-color` / `--arc-color-dim` inline style verbatim, sourced
the same way: `parseCurrentArc()` over `src/content/sessions/_quests.md`.

Degradation contract is unchanged and must be preserved:

- no `## Current Arc` section, or an incomplete one → **no card at all**, no
  blank space or placeholder;
- an unrecognized `Stat` value → neutral gold accent, not a build failure.

### Connect absorbs the mailbox strip

The rail's existing `Connect` section takes on the one line worth keeping from
`.s-mail-strip`:

```
Connect
Open to collaboration — stories, niche apps, JP-learning tools…   ← profile.connect
Send mail to be read on stream                                    ← new, hard-coded
mailbox@ninjaruss.net                                             ← #about-mail
```

"Send mail to be read on stream" is literal page copy, not a new `profile`
schema field — one line does not earn a Zod field.

`/about`'s mailbox script (`#about-mail`) and `<noscript>` fallback survive
as-is; `/status`'s duplicate (`#mail-address`) dies with the page. Likewise the
rail's `Find me` strip already renders primary + secondary links, a superset of
the external-only strip `/status` showed, so no link is lost.

### The LV chip is dropped

The level was a byproduct stat for a screen that no longer exists. Removing it
also removes the only reason `/about` would need `buildNovelTree()` and
`getAllCollections()`, so the merged page's build cost is lower than `/status`'s
was.

`src/utils/level.ts` and `src/tests/level.test.ts` **stay in the repo**,
unimported. They are pure, tested, and cheap to keep; deleting them is a
separate decision if the level never comes back.

### CSS

`.arc-*` rules move from `src/styles/status.css` into `src/styles/about.css`
unchanged, including the `@media (max-width: 768px)` `.arc-card__top`
flex-wrap rule. Everything else in `status.css` — `.status-page`, `.sheet*`,
`.status-row`, `.status-link`, `.s-mail-*`, `.mail-address` — dies with the
page. `status.css` is deleted.

The merged Connect block reuses `/about`'s existing `.about__connect` and
`.about__mail` rules, so no mail CSS moves. The one genuinely new rule is a
small `.about__connect-stream` line (muted, same scale as `.about__connect`)
for the "Send mail to be read on stream" sub-label.

## Routing

- Delete `src/pages/status/index.astro`.
- `astro.config.mjs` redirects: add `'/status': '/about'`, and retarget
  `'/stream'` from `/status` to `/about` so there is no redirect chain.
- `src/scripts/transition.ts`: `['/status', 'Chaos']` → `['/about', 'Chaos']`.
  Without this, `/about` falls through to the `Determination` default and
  silently loses the teal Chaos transition card.
- `src/components/NavPill.astro`: the Status item becomes
  `{ href: '/about', label: 'About', match: ['/about'] }`. Still 7 items — the
  4+3 mobile wrap is untouched.

This reverses the previous "About is not in the nav" stance deliberately: the
page now carries the arc card that the homepage teases, so it needs a path from
every interior page.

## Homepage (`src/pages/index.astro`)

- Remove the `.title-tile__about` anchor and its scoped CSS (roughly lines
  706–730). The nav item replaces it.
- `#stream-tile`:
  - `href` → `/about`
  - `.bento-tile__label` → `About` (was `Status`)
  - `.bento-tile__title` → `protagonist.name` (was the arc name). Requires
    importing `parseProtagonist` / `DEFAULT_PROTAGONIST` and reading
    `_protagonist.md`, which `index.astro` does not currently do.
  - unchanged: `--st-lead` accent, `.st-teaser` = `currentArc.decision`, the
    empty state "The story hasn't started yet.", the `► load` CTA, the
    `/api/live-status.ts` polling, the `LIVE` badge, and the red `is-live`
    pulse.
- `#mail-tile`'s no-JS `href` → `/about`.

A stranger now reads "About / Ninjaruss" first, with the current-arc line
underneath as evidence there is a person behind it — instead of an arc title
under a kicker that told them nothing about whose arc it is.

## Testing

No new unit tests. The merge moves markup, and every pure function it touches
(`parseCurrentArc`, `parseProtagonist`, `pickProfile`, `nowLine`) is already
covered.

One existing test must change: `src/tests/transition.test.ts:86-87` asserts
`statForPath('/status')` is Chaos/`#2dd4bf`. Retarget both assertions to
`/about`.

Verification:

1. `npm run test` — green, with the transition assertions updated.
2. `npm run build` — clean.
3. Browser pass:
   - `/about` renders the arc card with its stat accent and emblem badge above
     the hook, and the Connect block shows the stream line plus the assembled
     address;
   - `/status` and `/stream` both 301 to `/about`;
   - the homepage tile reads "About / Ninjaruss" with the arc decision as its
     teaser, and the title tile no longer has an About button;
   - NavPill shows About and highlights it on `/about`.

## Out of scope

- Deleting `src/utils/level.ts` (kept, unimported).
- The `social-links` collection, still unused.
- Any change to `_quests.md`'s private planning sections, which remain
  unrendered.
