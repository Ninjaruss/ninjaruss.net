# /who — Profile Card

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

`/who` — a single profile card page. One card, one screen on desktop. Its shape
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
- Quiet credential line — a single mono line establishing employability without
  a resume block. **Author supplies the wording.** Working placeholder:
  `software engineer by day · building the exit`

**WHAT I MAKE** — three current rows plus one variety line:

| Row | Copy |
|---|---|
| Ninjaruss (YouTube / Twitch) | Yap videos on life, Japanese learning live, and whatever I decide to explore next |
| Remember Rain | Visual novel in progress — people who cross a point of no return |
| Things I build | Utasync (learn Japanese through music), L-file (the Usogui database that didn't exist), and this site |

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

**ABOUT** — three short paragraphs, first person:

> I'm a software developer who spends most of his energy on things that don't
> pay: a visual novel called Remember Rain, a Japanese-learning app I built
> because nothing like it existed, and a database for a manga almost nobody has
> read.
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

**CONNECT** — "Open to collaboration — niche apps, JP-learning tools, anything
weeb-adjacent." Plus the mail link. No pricing, no services, no availability
block.

**FIND ME** — two primary CTAs (YouTube, and the journal as "read"), with Twitch,
MyAnimeList and Spotify as secondary links. Two-platform hierarchy per the
authored strategy: YouTube is the top funnel, this site is where the thinking
lives.

## Architecture

### Content source

A new `profile` content collection holding a single entry,
`src/content/profile/who.md`:

- **Frontmatter** (Zod-validated in `src/content/config.ts`): `hook`,
  `quietLine`, `makes[]` (`{ label, blurb, href }`), `makesMore`
  (`{ text, href }`), `subjects[]` (`{ group, items[] }`), `connect`, `links[]`
  (`{ label, href, primary }`).
- **Body**: the ABOUT prose as markdown.

Name and epithet come from `_protagonist.md` via the existing
`parseProtagonist()` — not duplicated in the profile file. One portrait, one
name, one source of truth, already shared with `/status`.

Rationale for a collection over a bare `_who.md`: the card's structured lists
(makes, subjects, links) benefit from Zod validation at build time, and the body
prose wants normal markdown rendering. `_protagonist.md`'s hand-rolled parser
exists because it holds three scalar fields; this holds nested arrays.

### Route

`src/pages/who.astro` — static, prerendered, `BaseLayout` + `NavPill`.

### Redirects and entry points

- Homepage title-tile "who?" corner link: `/about` → `/who`
- `src/pages/about.astro`: repoint the 301 from `/notes/i-am-ninjaruss` to
  `/who`. The declaration note stays reachable from the card's ABOUT section, so
  nothing is orphaned; `/about` now lands on the summary and the note becomes
  the deep read.
- `/who` is **not** added to `NavPill`. Eight items would break the 4+3 mobile
  wrap, and the card is a destination you visit once, not a section you navigate
  between.

### Styling

New `src/styles/who.css`, reusing existing tokens and P4G vocabulary utilities —
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

## Open item

The quiet credential line is a placeholder pending the author's own wording. The
page must render correctly when `quietLine` is absent, so this does not block
implementation.

## Invariants respected

- No absence counters, no streaks, no time-since anywhere on the card
- `aria-current` present or absent, never `"false"`
- `prefers-reduced-motion` honored on the entrance animation
- Every `:hover` treatment gets `:focus-visible` parity
