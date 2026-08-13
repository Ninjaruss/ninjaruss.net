# /about — Profile Card

**Date:** 2026-08-12
**Status:** approved design, pending implementation plan

## Problem

The site has no answer to "who is this?" that a stranger can read in one screen.
`/about` 301-redirects to `/notes/i-am-ninjaruss` — a 1,200-word philosophical
declaration. That note is the right artifact for a fellow traveler who already
cares, and the wrong one for someone who just watched a video and wants to know
what this channel is, or for a collaborator evaluating whether the projects are
real.

`/status` renders a character sheet (portrait, epithet, level, stats, quests,
bonds) but it is a *game* surface — stat radars and XP bars, not a human-readable
introduction.

## What we're building

`/about` — a single profile card page, replacing the redirect. One card, one
screen on desktop. Its shape
follows the creator profile-card convention (subjects / roles / about / contact)
rather than a resume or a manifesto.

### Audiences, in priority order

1. Someone who arrived from a video and wants to know what this is
2. A fellow traveler who resonates with the commitment/avoidance material
3. A potential collaborator evaluating the work

### Explicit non-goals

- Not a strategy document. No funnel, no monetization, no platform plan.
- Not a resume. No dated employment history.
- Not a second `/status`. No stats, no levels, no quests.
- Not a manifesto. The "golden rules" list was considered and cut — the
  declaration note already carries that weight.

## Content

Hand-written markdown, edited by hand. This matches the established preference
for plain markdown over generated content, and the copy that defines an identity
must be chosen rather than assembled.

Exactly one live element: the NOW line, pulled from the latest `now` entry.
Everything else is authored.

### Card sections

**Header**
- Portrait (reuses `_protagonist.md`'s `portrait` field — one portrait, one source)
- `NINJARUSS`
- Epithet: *the fool who will move to Japan*
- Hook: "I decide on a whim and figure out the logistics after. This is the evidence."
- Quiet credential lines — two mono lines establishing background without a
  resume block. No employer names, no job titles:

  > B.S. Computer Science, 2021
  > four years at a desk, then I quit to see how things fall — now on a grocery
  > floor, on purpose

  The second line is the card's most load-bearing fact: the downshift was a
  deliberate full reset, taken partly to accumulate money for the move and
  partly out of curiosity about what retail work actually feels like. It is the
  strongest available evidence for the "comfort as the enemy" thesis the rest of
  the site argues, and it earns its place precisely because it costs something to
  say. Employer names are omitted — the shape of the move is the point, not who
  signed the checks.

**WHAT I MAKE** — three current rows plus one variety line:

| Row | Copy |
|---|---|
| Remember Rain | The visual novel — people who cross a point of no return. The thing I'm actually trying to get good enough to make |
| Ninjaruss (YouTube / Twitch) | Yap videos on life, Japanese learning live, and whatever I decide to explore next |
| Things I build | Utasync (learn Japanese through music), L-file (the Usogui database that didn't exist), and this site |

Row order is deliberate: the writing leads, because that is the stated goal.
This does not contradict the two-platform hierarchy in FIND ME — YouTube keeps
primary CTA billing there as the way people arrive, while this list states what
the work is *for*.

Followed by: *plus a video essay, a Roblox ninja clan, and whatever's next →*
linking to `/journal?types=showcase`.

KAIMA is not a separate row. The JP-learning stream folds into Ninjaruss; the
channel split is not settled and the card should not assert one.

**SUBJECTS I EXPLORE** — three groups.

*the self*
- Commitment as the thing that builds a self; killing potential on purpose
- Avoidance, backsliding, and the coward reflex
- Progress you can only see in hindsight
- Determinism vs. the individual's agency
- Gratitude, the life lottery, and the guilt under it

*Japan & language*
- Learning Japanese by immersion — anime, songs, flashcards, "vibe learning"
- Moving to Japan as a refusal of the comfortable path
- What being a "real weeb" actually obligates you to

*making things*
- Writing a visual novel in public, badly, on purpose
- Vibe coding niche apps for an audience of one
- Live streaming as thinking out loud
- Anime and manga as mirrors — Gurren Lagann, Usogui, 5D's, Code Geass

Each group's items are plain text, not links. Thematic browsing already has a
home at `/codex`; the card closes with a link there rather than 12 deep links.

**ABOUT** — four short paragraphs, first person. The writing leads; software is
named as a real interest and a means, not the identity:

> What I want is to be a writer. Remember Rain is the visual novel I'm working
> toward being good enough to actually make — a producer and storyteller who can
> put something like it into the world is the version of me I'm aiming at.
> Everything else here is practice or scaffolding for that.
>
> Software is the interest that pays its way. I build small applications for
> myself — a Japanese-learning app because nothing like it existed, a database
> for a manga almost nobody has read, this site. A tech job will probably be
> what buys me stability. It isn't the goal.
>
> The thread is commitment. Infinite potential is comfortable, and it's a slow
> way to erase yourself — so I make the choice out loud, where backing out costs
> something, and then I document the falling forward. The notes, the streams,
> the months I lost and got back.
>
> I'm moving to Japan. Everything on this site is either preparation for that or
> evidence I'm capable of it.

Closes with a link to the full declaration (`/notes/i-am-ninjaruss`).

**NOW** — one line: the latest `now` entry's title, linked to `/now`. The single
live element on the page.

**CONNECT** — "Open to collaboration — stories, niche apps, JP-learning tools,
anything weeb-adjacent." Plus the mail link. No pricing, no services, no availability
block.

**FIND ME** — two primary CTAs (YouTube, and the journal as "read"), with Twitch,
MyAnimeList and Spotify as secondary links. Two-platform hierarchy per the
authored strategy: YouTube is the top funnel, this site is where the thinking
lives.

## Architecture

### Content source

A new `profile` content collection holding a single entry,
`src/content/profile/about.md`:

- **Frontmatter** (Zod-validated in `src/content/config.ts`): `hook`,
  `credentials[]` (the mono lines), `makes[]` (`{ label, blurb, href }`), `makesMore`
  (`{ text, href }`), `subjects[]` (`{ group, items[] }`), `connect`, `links[]`
  (`{ label, href, primary }`).
- **Body**: the ABOUT prose as markdown.

Name and epithet come from `_protagonist.md` via the existing
`parseProtagonist()` — not duplicated in the profile file. One portrait, one
name, one source of truth, already shared with `/status`.

Rationale for a collection over a bare `_about.md`: the card's structured lists
(makes, subjects, links) benefit from Zod validation at build time, and the body
prose wants normal markdown rendering. `_protagonist.md`'s hand-rolled parser
exists because it holds three scalar fields; this holds nested arrays.

### Route

`src/pages/about.astro` — the existing file, converted from a 301 redirect into
a real page. Static, prerendered, `BaseLayout` + `NavPill`.

### Entry points

- The homepage title-tile "who?" corner link already points at `/about` and needs
  no change — it now lands on the card instead of bouncing to the note.
- The declaration note `/notes/i-am-ninjaruss` stays reachable from the card's
  ABOUT section, so nothing is orphaned. `/about` becomes the summary; the note
  becomes the deep read.
- This reverses the stance recorded in the old `about.astro` comment ("there is
  deliberately no About page"). The reasoning behind that comment — learn about
  me through the stuff I do — is preserved: the card is entirely output and
  links, not biography. Update the comment rather than deleting it silently.
- `/about` is **not** added to `NavPill`. Eight items would break the 4+3 mobile
  wrap, and the card is a destination you visit once, not a section you navigate
  between.

### Styling

New `src/styles/about.css`, reusing existing tokens and P4G vocabulary utilities —
`.p4g-tab` (kicker "PROFILE"), `.p4g-heading` (h1 `NINJARUSS`), `.p4g-underline`,
`.p4g-sweep` on the CTA links, `.p4g-cut` on the portrait frame. No new colors,
no new radii.

Layout: two columns at ≥1024px — left rail (portrait, name, epithet, quiet line,
FIND ME, CONNECT), right column (hook, WHAT I MAKE, SUBJECTS, ABOUT, NOW). Single
column below 1024px, portrait capped so the identity block stays above the fold on
mobile. Bottom padding respects `--nav-clearance`.

Per the diagonal-language rule, the card carries the motif only through the
existing utilities — no bespoke decorative seams.

### Email

The address must not appear in served HTML. Reuse the established pattern
(`initializeMailTile` / `#mail-address` on `/status`): assemble the `mailto:` on
first pointerenter/focus/touch/click.

### Testing

`src/tests/profile.test.ts` — pure logic only, since vitest cannot resolve
`astro:content`:

- The subjects/makes/links shapes survive a round trip through the schema
- A missing `profile` entry degrades gracefully (page renders the protagonist
  header and nothing else, rather than throwing the build)
- The NOW line falls back to omission when the `now` collection is empty

Existing `protagonist.test.ts` coverage of `parseProtagonist` is unchanged.

## Documentation to update

- `CLAUDE.md` — the Legacy Routes section currently documents `/about` as a 301
  to `/notes/i-am-ninjaruss`. It becomes a real page and moves out of that list.
- The comment in `src/pages/about.astro` explaining why no About page exists.

## Invariants respected

- No absence counters, no streaks, no time-since anywhere on the card
- `aria-current` present or absent, never `"false"`
- `prefers-reduced-motion` honored on the entrance animation
- Every `:hover` treatment gets `:focus-visible` parity
