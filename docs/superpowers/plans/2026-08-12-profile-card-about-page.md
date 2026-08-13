# /about Profile Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/about` from a 301 redirect into a single-screen profile card that answers "who is this?" for a stranger.

**Architecture:** A new single-entry `profile` content collection holds the hand-written copy. Its Zod schema and two pure selector helpers live in `src/utils/profile.ts` (unit-testable — vitest cannot resolve `astro:content`, so nothing testable may import it). `src/pages/about.astro` renders the card: name/epithet/portrait come from the existing `_protagonist.md` via `parseProtagonist`, structured lists come from the collection frontmatter, the ABOUT prose is the entry body, and one live line comes from the `now` collection.

**Tech Stack:** Astro 5 content collections, Zod (via `astro/zod`), vanilla CSS with the existing P4G token/utility vocabulary, vitest.

**Spec:** `docs/superpowers/specs/2026-08-12-profile-card-about-page-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `src/utils/profile.ts` (create) | Zod schema for the profile entry + `pickProfile()` + `nowLine()`. Pure — no `astro:content` import, so vitest can load it. |
| `src/tests/profile.test.ts` (create) | Unit tests for the above. |
| `src/content/config.ts` (modify) | Register the `profile` collection using the schema from `utils/profile.ts`. |
| `src/content/profile/about.md` (create) | The hand-written card copy. The only file the author edits day to day. |
| `src/styles/about.css` (create) | Card layout and styling. Tokens/utilities only, no new colors. |
| `src/pages/about.astro` (modify) | Was a 301 redirect; becomes the page. |
| `CLAUDE.md` (modify) | `/about` moves out of Legacy Routes; document the new page. |

`src/pages/index.astro:157` already links `/about` from the title tile's "who?" corner link — **no change needed there.**

---

## Task 1: Pure profile module — `pickProfile`

**Files:**
- Create: `src/utils/profile.ts`
- Create: `src/tests/profile.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/tests/profile.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pickProfile } from '../utils/profile';

describe('pickProfile', () => {
  it('returns null when the collection is empty', () => {
    expect(pickProfile([])).toBeNull();
  });

  it('prefers the entry whose id is about', () => {
    const entries = [{ id: 'draft.md' }, { id: 'about.md' }];
    expect(pickProfile(entries)).toEqual({ id: 'about.md' });
  });

  it('matches about.mdx as well as about.md', () => {
    expect(pickProfile([{ id: 'about.mdx' }])).toEqual({ id: 'about.mdx' });
  });

  it('falls back to the alphabetically first entry when no about exists', () => {
    const entries = [{ id: 'zeta.md' }, { id: 'alpha.md' }];
    expect(pickProfile(entries)).toEqual({ id: 'alpha.md' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/profile.test.ts`
Expected: FAIL — `Failed to resolve import "../utils/profile"`

- [ ] **Step 3: Write minimal implementation**

Create `src/utils/profile.ts`:

```ts
/**
 * Profile card data layer for /about.
 *
 * Pure by design: vitest cannot resolve the `astro:content` virtual module, so
 * nothing in this file may import it. The Zod schema is built from `astro/zod`
 * (a real subpath export of the astro package) rather than the re-export on
 * `astro:content`, which keeps it loadable in a plain node test run.
 */

/**
 * The profile collection is a singleton, but a collection is still a list.
 * Prefer the entry literally named `about`; otherwise take the alphabetically
 * first so the page renders something deterministic rather than throwing.
 */
export function pickProfile<T extends { id: string }>(entries: readonly T[]): T | null {
  if (entries.length === 0) return null;
  const named = entries.find(e => e.id.replace(/\.mdx?$/, '') === 'about');
  if (named) return named;
  return [...entries].sort((a, b) => a.id.localeCompare(b.id))[0];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/profile.test.ts`
Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/utils/profile.ts src/tests/profile.test.ts
git commit -m "feat: pickProfile selector for the profile collection"
```

---

## Task 2: Pure profile module — `nowLine`

The card carries exactly one live element: the latest `now` entry's title. It must
degrade to nothing (not to a broken line) when the collection is empty or the
latest entry has no usable title.

**Files:**
- Modify: `src/utils/profile.ts`
- Modify: `src/tests/profile.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/tests/profile.test.ts`:

```ts
import { nowLine } from '../utils/profile';

const nowEntry = (title: string, iso: string, draft = false) => ({
  data: { title, publishedAt: new Date(iso), draft },
});

describe('nowLine', () => {
  it('returns null for an empty collection', () => {
    expect(nowLine([])).toBeNull();
  });

  it('returns the newest entry title linked to /now', () => {
    const entries = [
      nowEntry('Older thing', '2026-06-01'),
      nowEntry('Go 日本語 Go!!!', '2026-08-01'),
      nowEntry('Middle thing', '2026-07-01'),
    ];
    expect(nowLine(entries)).toEqual({ title: 'Go 日本語 Go!!!', href: '/now' });
  });

  it('ignores drafts', () => {
    const entries = [
      nowEntry('Published', '2026-06-01'),
      nowEntry('Secret', '2026-08-01', true),
    ];
    expect(nowLine(entries)).toEqual({ title: 'Published', href: '/now' });
  });

  it('returns null when every entry is a draft', () => {
    expect(nowLine([nowEntry('Secret', '2026-08-01', true)])).toBeNull();
  });

  it('returns null when the newest title is blank', () => {
    expect(nowLine([nowEntry('   ', '2026-08-01')])).toBeNull();
  });

  it('skips entries with an unparseable date', () => {
    const entries = [
      nowEntry('Good', '2026-06-01'),
      { data: { title: 'Broken', publishedAt: new Date('not a date'), draft: false } },
    ];
    expect(nowLine(entries)).toEqual({ title: 'Good', href: '/now' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/profile.test.ts`
Expected: FAIL — `nowLine is not a function`

- [ ] **Step 3: Write minimal implementation**

Append to `src/utils/profile.ts`:

```ts
export interface NowLine {
  title: string;
  href: string;
}

interface NowEntryLike {
  data: { title?: string; publishedAt?: Date; draft?: boolean };
}

/**
 * The single live element on the card. Returns null rather than a placeholder
 * whenever there is nothing real to show — an empty slot is honest, a stub line
 * is not.
 */
export function nowLine(entries: readonly NowEntryLike[]): NowLine | null {
  const usable = entries.filter(e =>
    !e.data.draft &&
    e.data.publishedAt instanceof Date &&
    !Number.isNaN(e.data.publishedAt.getTime())
  );
  if (usable.length === 0) return null;

  const latest = usable.reduce((a, b) =>
    (b.data.publishedAt as Date) > (a.data.publishedAt as Date) ? b : a
  );

  const title = latest.data.title?.trim();
  return title ? { title, href: '/now' } : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/profile.test.ts`
Expected: PASS — 10 tests

- [ ] **Step 5: Commit**

```bash
git add src/utils/profile.ts src/tests/profile.test.ts
git commit -m "feat: nowLine selector for the profile card's live line"
```

---

## Task 3: Profile schema

**Files:**
- Modify: `src/utils/profile.ts`
- Modify: `src/tests/profile.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/tests/profile.test.ts`:

```ts
import { profileSchema } from '../utils/profile';

const validProfile = {
  hook: 'I decide on a whim and figure out the logistics after.',
  credentials: ['B.S. Computer Science, 2021'],
  makes: [{ label: 'Remember Rain', blurb: 'The visual novel', href: '/novel' }],
  makesMore: { text: 'plus whatever is next', href: '/journal?types=showcase' },
  subjects: [{ group: 'the self', items: ['Commitment', 'Avoidance'] }],
  connect: 'Open to collaboration',
  links: [{ label: 'YouTube', href: 'https://youtube.com/@x', primary: true }],
};

describe('profileSchema', () => {
  it('accepts a fully populated profile', () => {
    expect(profileSchema.parse(validProfile)).toMatchObject(validProfile);
  });

  it('defaults every list to empty so a minimal file still renders', () => {
    const parsed = profileSchema.parse({ hook: 'just a hook' });
    expect(parsed.credentials).toEqual([]);
    expect(parsed.makes).toEqual([]);
    expect(parsed.subjects).toEqual([]);
    expect(parsed.links).toEqual([]);
    expect(parsed.makesMore).toBeUndefined();
    expect(parsed.connect).toBeUndefined();
  });

  it('defaults link.primary to false', () => {
    const parsed = profileSchema.parse({
      hook: 'h',
      links: [{ label: 'Twitch', href: 'https://twitch.tv/x' }],
    });
    expect(parsed.links[0].primary).toBe(false);
  });

  it('rejects a makes row missing its label', () => {
    expect(() =>
      profileSchema.parse({ hook: 'h', makes: [{ blurb: 'b', href: '/x' }] })
    ).toThrow();
  });

  it('rejects a subject group missing its items', () => {
    expect(() =>
      profileSchema.parse({ hook: 'h', subjects: [{ group: 'the self' }] })
    ).toThrow();
  });

  it('requires a hook', () => {
    expect(() => profileSchema.parse({})).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/tests/profile.test.ts`
Expected: FAIL — `profileSchema is not exported` / undefined

- [ ] **Step 3: Write minimal implementation**

Add to the top of `src/utils/profile.ts`, directly under the file docblock:

```ts
import { z } from 'astro/zod';

export const profileSchema = z.object({
  /** The one line a stranger reads first, under the name. */
  hook: z.string(),
  /** Mono lines establishing background. No employer names, no job titles. */
  credentials: z.array(z.string()).default([]),
  /** WHAT I MAKE rows, in deliberate order — the writing leads. */
  makes: z.array(z.object({
    label: z.string(),
    blurb: z.string(),
    href: z.string(),
  })).default([]),
  /** The "and whatever's next" line closing the makes list. */
  makesMore: z.object({
    text: z.string(),
    href: z.string(),
  }).optional(),
  /** SUBJECTS I EXPLORE, grouped. Plain text — thematic browsing lives at /codex. */
  subjects: z.array(z.object({
    group: z.string(),
    items: z.array(z.string()),
  })).default([]),
  /** The collaboration invitation above the mail link. */
  connect: z.string().optional(),
  /** FIND ME links; `primary: true` gets CTA billing. */
  links: z.array(z.object({
    label: z.string(),
    href: z.string(),
    primary: z.boolean().default(false),
  })).default([]),
});

export type ProfileData = z.infer<typeof profileSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/tests/profile.test.ts`
Expected: PASS — 16 tests

- [ ] **Step 5: Commit**

```bash
git add src/utils/profile.ts src/tests/profile.test.ts
git commit -m "feat: zod schema for the profile card entry"
```

---

## Task 4: Register the profile collection

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: Add the import**

At the top of `src/content/config.ts`, below the existing `astro:content` import, add:

```ts
import { profileSchema } from '../utils/profile';
```

- [ ] **Step 2: Define the collection**

Immediately after the `socialLinks` collection definition and before `export const collections`, add:

```ts
// Profile — single-entry collection backing the /about card. The schema lives in
// utils/profile.ts so vitest (which cannot resolve astro:content) can test it.
const profile = defineCollection({
  type: 'content',
  schema: profileSchema,
});
```

- [ ] **Step 3: Register it**

Change the `export const collections` block to:

```ts
export const collections = {
  shelf,
  notes,
  showcase,
  now,
  sessions,
  'social-links': socialLinks,
  profile,
};
```

- [ ] **Step 4: Verify the config still type-checks**

Run: `npx astro check --minimumSeverity error`
Expected: no errors referencing `config.ts` or `profile`. (Errors elsewhere in the repo, if any pre-exist, are out of scope — confirm with `git stash` if unsure.)

- [ ] **Step 5: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: register the profile content collection"
```

---

## Task 5: The card content

This is the file the author edits. Every string below is approved copy from the
spec — do not paraphrase, reword, or "improve" it.

**Files:**
- Create: `src/content/profile/about.md`

- [ ] **Step 1: Write the content file**

Create `src/content/profile/about.md`:

```markdown
---
hook: "I decide on a whim and figure out the logistics after. This is the evidence."
credentials:
  - "B.S. Computer Science, 2021"
  - "four years at a desk, then I quit to see how things fall — now on a grocery floor, on purpose"
makes:
  - label: "Remember Rain"
    blurb: "The visual novel — people who cross a point of no return. The thing I'm actually trying to get good enough to make."
    href: "/novel"
  - label: "Ninjaruss"
    blurb: "Yap videos on life, Japanese learning live, and whatever I decide to explore next."
    href: "https://www.youtube.com/@Ninjaruss_"
  - label: "Things I build"
    blurb: "Utasync (learn Japanese through music), L-file (the Usogui database that didn't exist), and this site."
    href: "/journal?types=showcase"
makesMore:
  text: "plus a video essay, a Roblox ninja clan, and whatever's next"
  href: "/journal?types=showcase"
subjects:
  - group: "the self"
    items:
      - "Commitment as the thing that builds a self; killing potential on purpose"
      - "Avoidance, backsliding, and the coward reflex"
      - "Progress you can only see in hindsight"
      - "Determinism vs. the individual's agency"
      - "Gratitude, the life lottery, and the guilt under it"
  - group: "Japan & language"
    items:
      - "Learning Japanese by immersion — anime, songs, flashcards, \"vibe learning\""
      - "Moving to Japan as a refusal of the comfortable path"
      - "What being a \"real weeb\" actually obligates you to"
  - group: "making things"
    items:
      - "Writing a visual novel in public, badly, on purpose"
      - "Vibe coding niche apps for an audience of one"
      - "Live streaming as thinking out loud"
      - "Anime and manga as mirrors — Gurren Lagann, Usogui, 5D's, Code Geass"
connect: "Open to collaboration — stories, niche apps, JP-learning tools, anything weeb-adjacent."
links:
  - label: "YouTube"
    href: "https://www.youtube.com/@Ninjaruss_"
    primary: true
  - label: "Read the journal"
    href: "/journal"
    primary: true
  - label: "Twitch"
    href: "https://twitch.tv/ninjaruss_"
  - label: "MyAnimeList"
    href: "https://myanimelist.net/animelist/Ninjaruss_?status=7&order=4&order2=0"
  - label: "Spotify"
    href: "https://open.spotify.com/playlist/6PYIeR2dXsbTrk47TqetSD?si=2b68cabcfc26451c"
---

What I want is to be a writer. Remember Rain is the visual novel I'm working toward being good enough to actually make — a producer and storyteller who can put something like it into the world is the version of me I'm aiming at. Everything else here is practice or scaffolding for that.

Software is the interest that pays its way. I build small applications for myself — a Japanese-learning app because nothing like it existed, a database for a manga almost nobody has read, this site. A tech job will probably be what buys me stability. It isn't the goal.

The thread is commitment. Infinite potential is comfortable, and it's a slow way to erase yourself — so I make the choice out loud, where backing out costs something, and then I document the falling forward. The notes, the streams, the months I lost and got back.

I'm moving to Japan. Everything on this site is either preparation for that or evidence I'm capable of it.

[The full declaration →](/notes/i-am-ninjaruss)
```

- [ ] **Step 2: Verify the schema accepts it**

Run: `npm run build`
Expected: build succeeds. A Zod error here means the frontmatter and
`profileSchema` disagree — fix the frontmatter, not the schema.

- [ ] **Step 3: Commit**

```bash
git add src/content/profile/about.md
git commit -m "content: the profile card copy"
```

---

## Task 6: Card styles

**Files:**
- Create: `src/styles/about.css`

- [ ] **Step 1: Write the stylesheet**

Create `src/styles/about.css`:

```css
/* ── /about — profile card ──────────────────────────────────────────────
   Tokens and P4G utilities only: no new colors, no new radii. The card is a
   single-zone surface, so per the diagonal-language rule it carries the motif
   through .p4g-tab / .p4g-heading / .p4g-underline / .p4g-sweep only — no
   decorative seams. */

.about {
  max-width: 1100px;
  margin: 0 auto;
  padding: 4rem 1.5rem calc(var(--nav-clearance, 96px) + 3rem);
}

.about__header {
  margin-bottom: 2.5rem;
}

.about__title {
  margin: 0.75rem 0 0;
  font-size: var(--text-page-title);
}

.about__epithet {
  margin: 0.75rem 0 0;
  color: var(--color-gold);
  font-style: italic;
}

/* ── Two-column card ─────────────────────────────────────────────────── */

.about__grid {
  display: grid;
  grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
  gap: 3rem;
  align-items: start;
}

@media (max-width: 1023px) {
  .about__grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

/* ── Left rail ───────────────────────────────────────────────────────── */

.about__rail {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* clip-path clips box-shadow, so the hard gold shadow goes on a wrapper. */
.about__portrait-wrap {
  filter: drop-shadow(var(--shadow-hard));
}

.about__portrait {
  display: block;
  width: 100%;
  height: auto;
  background: var(--color-surface-2);
}

@media (max-width: 1023px) {
  .about__portrait-wrap {
    max-width: 220px;
  }
}

.about__credentials {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.about__credential {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--color-text-muted);
}

.about__section-label {
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-gold);
  transform: skewX(var(--skew-display));
  margin-bottom: 0.75rem;
}

/* ── Links ───────────────────────────────────────────────────────────── */

.about__links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.about__link {
  position: relative;
  display: block;
  padding: 0.6rem 0.9rem;
  min-height: 44px;
  border: 1px solid var(--color-surface-3);
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9rem;
  line-height: 1.6;
}

.about__link--primary {
  border-color: var(--color-gold);
  font-weight: 700;
}

.about__connect {
  margin: 0 0 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.about__mail {
  color: var(--color-gold);
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  word-break: break-all;
}

/* ── Right column ────────────────────────────────────────────────────── */

.about__main {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.about__hook {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--color-text);
}

.about__makes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.about__make {
  position: relative;
  display: block;
  padding: 0.9rem 1.1rem;
  border-left: 2px solid var(--color-surface-3);
  color: var(--color-text);
  text-decoration: none;
  transition: border-color var(--animation-base) var(--animation-easing),
              transform var(--animation-base) var(--animation-easing);
}

.about__make:hover,
.about__make:focus-visible {
  border-left-color: var(--color-gold);
  transform: translateX(4px);
}

.about__make-label {
  display: block;
  font-weight: 700;
  font-size: var(--text-panel-title);
}

.about__make-blurb {
  display: block;
  margin-top: 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.about__makes-more {
  color: var(--color-text-subtle);
  font-size: 0.85rem;
}

.about__subject-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.75rem;
}

.about__subject-group-name {
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: rgba(var(--color-gold-rgb), 0.55);
  margin-bottom: 0.5rem;
}

.about__subject-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.about__subject {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.about__now {
  padding: 1rem 1.25rem;
  border: 1px solid rgba(var(--color-gold-rgb), 0.25);
  background: var(--color-surface-1);
}

.about__now-link {
  color: var(--color-text);
  font-size: 1rem;
}

@media (prefers-reduced-motion: reduce) {
  .about__make {
    transition: none;
  }
  .about__make:hover,
  .about__make:focus-visible {
    transform: none;
  }
}
```

`--font-mono` is defined at `src/styles/typography.css:10` (`'JetBrains Mono',
monospace`) — the token names above are correct as written.

- [ ] **Step 2: Commit**

```bash
git add src/styles/about.css
git commit -m "style: profile card styles for /about"
```

---

## Task 7: The page

**Files:**
- Modify: `src/pages/about.astro` (currently a 6-line redirect — replace entirely)

- [ ] **Step 1: Replace the redirect with the page**

Overwrite `src/pages/about.astro`:

```astro
---
import { getCollection } from 'astro:content';
import { readFileSync } from 'fs';
import { join } from 'path';
import BaseLayout from '../layouts/BaseLayout.astro';
import NavPill from '../components/NavPill.astro';
import { parseProtagonist, DEFAULT_PROTAGONIST } from '../utils/protagonist';
import { pickProfile, nowLine } from '../utils/profile';
import '../styles/about.css';

/* The profile card. This page used to 301 to /notes/i-am-ninjaruss on the
   principle that there should be no About page — learn about me through the
   stuff I do. That principle is intact: everything below is output and links,
   not biography, and the declaration note is still the deep read (linked from
   the prose). What changed is that a stranger now gets a one-screen answer
   before being handed 1,200 words. */

// Name / epithet / portrait share one source with /status.
let protagonist = DEFAULT_PROTAGONIST;
try {
  const raw = readFileSync(join(process.cwd(), 'src/content/sessions/_protagonist.md'), 'utf-8');
  protagonist = parseProtagonist(raw);
} catch {
  /* Missing file degrades to defaults — same contract as /status. */
}

const profileEntries = await getCollection('profile');
const entry = pickProfile(profileEntries);
const profile = entry?.data ?? null;
const Content = entry ? (await entry.render()).Content : null;

const nowEntries = await getCollection('now');
const now = nowLine(nowEntries);

const primaryLinks   = profile?.links.filter(l => l.primary) ?? [];
const secondaryLinks = profile?.links.filter(l => !l.primary) ?? [];
---

<BaseLayout
  title="About"
  description="Who Ninjaruss is: a writer working toward Remember Rain, moving to Japan, building small things on the way."
>
  <NavPill />
  <div class="about p3r-animate">
    <header class="about__header">
      <span class="p4g-tab">profile</span>
      <h1 class="about__title"><span class="p4g-heading">{protagonist.name}</span></h1>
      <span class="p4g-underline" aria-hidden="true"></span>
      {protagonist.epithet && <p class="about__epithet">{protagonist.epithet}</p>}
    </header>

    <div class="about__grid">
      <aside class="about__rail">
        {protagonist.portrait && (
          <div class="about__portrait-wrap p4g-cut">
            <img
              class="about__portrait"
              src={protagonist.portrait}
              alt={`Portrait of ${protagonist.name}`}
              width="280"
              height="280"
              loading="eager"
            />
          </div>
        )}

        {profile && profile.credentials.length > 0 && (
          <ul class="about__credentials">
            {profile.credentials.map(line => (
              <li class="about__credential">{line}</li>
            ))}
          </ul>
        )}

        {profile && profile.links.length > 0 && (
          <section>
            <h2 class="about__section-label">Find me</h2>
            <div class="about__links">
              {primaryLinks.map(link => (
                <a class="about__link about__link--primary p4g-sweep" href={link.href}>{link.label}</a>
              ))}
              {secondaryLinks.map(link => (
                <a class="about__link p4g-sweep" href={link.href}>{link.label}</a>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 class="about__section-label">Connect</h2>
          {profile?.connect && <p class="about__connect">{profile.connect}</p>}
          {/* Address + href injected client-side so it never sits in the served HTML */}
          <a href="#mailbox" class="about__mail" id="about-mail"></a>
          {/* JS-free fallback: still obfuscated, no `@` or `mailto:` in the HTML */}
          <noscript>
            <p class="about__mail">mailbox [at] ninjaruss [dot] net</p>
          </noscript>
        </section>
      </aside>

      <main class="about__main">
        {profile && <p class="about__hook">{profile.hook}</p>}

        {profile && profile.makes.length > 0 && (
          <section>
            <h2 class="about__section-label">What I make</h2>
            <div class="about__makes">
              {profile.makes.map(make => (
                <a class="about__make" href={make.href}>
                  <span class="about__make-label">{make.label}</span>
                  <span class="about__make-blurb">{make.blurb}</span>
                </a>
              ))}
            </div>
            {profile.makesMore && (
              <p class="about__makes-more">
                <a href={profile.makesMore.href}>{profile.makesMore.text} →</a>
              </p>
            )}
          </section>
        )}

        {profile && profile.subjects.length > 0 && (
          <section>
            <h2 class="about__section-label">Subjects I explore</h2>
            <div class="about__subject-groups">
              {profile.subjects.map(group => (
                <div>
                  <h3 class="about__subject-group-name">{group.group}</h3>
                  <ul class="about__subject-list">
                    {group.items.map(item => <li class="about__subject">{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {Content && (
          <section class="prose">
            <h2 class="about__section-label">About</h2>
            <Content />
          </section>
        )}

        {now && (
          <section class="about__now">
            <h2 class="about__section-label">Now</h2>
            <a class="about__now-link" href={now.href}>{now.title} →</a>
          </section>
        )}
      </main>
    </div>
  </div>
</BaseLayout>

<script>
  /* Mailbox address assembled at runtime so scrapers reading the served HTML
     never see a mailto or a full address. Same pattern as the homepage Email
     tile and the /status mail strip. */
  function initAboutMail(): void {
    const el = document.getElementById('about-mail') as HTMLAnchorElement | null;
    if (!el || el.textContent) return;
    const addr = ['mailbox', ['ninjaruss', 'net'].join('.')].join('@');
    el.textContent = addr;
    el.href = 'mailto:' + addr;
  }
  initAboutMail();
  document.addEventListener('astro:page-load', initAboutMail);
</script>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds, and the output includes `dist/about/index.html` (or
`dist/about.html`).

Verify: `grep -c "mailbox@" dist/about/index.html`
Expected: `0` — the address must not be in the served HTML.

Verify: `grep -o "Remember Rain" dist/about/index.html | head -1`
Expected: `Remember Rain`

- [ ] **Step 3: Verify in the browser**

Start the dev server via the preview tooling (never `npm run dev` in a shell)
and check `/about`:
- The card renders two columns at desktop width and one column below 1024px.
- The "who?" link on `/` lands here.
- The mail link fills in and its `href` is a `mailto:`.
- No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: /about is the profile card, not a redirect"
```

---

## Task 8: Documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Remove /about from Legacy Routes**

In `CLAUDE.md`, under `### Legacy Routes (301 Redirects)`, delete this bullet:

```markdown
- `/about` → redirects to the current identity-declaration note (`/notes/i-am-ninjaruss`). Deliberate design: no static About page — "learn about me through the stuff I do." When a newer declaration note is written, repoint this redirect (`src/pages/about.astro`). The homepage title tile carries a quiet "who?" corner link to it.
```

- [ ] **Step 2: Document the page**

Under `### Utility Pages`, after the `/` bullet, add:

```markdown
- `/about` — profile card. One card, one screen: header (name/epithet/portrait from `_protagonist.md` via `parseProtagonist`, shared with `/status`), credential lines, WHAT I MAKE, SUBJECTS I EXPLORE, ABOUT prose, NOW, CONNECT + FIND ME. Copy is hand-written in the single-entry `profile` collection (`src/content/profile/about.md`); the Zod schema and the `pickProfile`/`nowLine` selectors live in `src/utils/profile.ts` (pure — vitest cannot resolve `astro:content`). Exactly one live element: the NOW line, pulled from the latest `now` entry and omitted entirely when there isn't one. Reached from the homepage title tile's "who?" corner link; deliberately **not** in NavPill (an 8th item breaks the 4+3 mobile wrap). Was a 301 to `/notes/i-am-ninjaruss` — that note is now linked from the ABOUT prose as the deep read. The email address is assembled client-side (`#about-mail`), never in the served HTML.
```

- [ ] **Step 3: Add the collection to the schema docs**

Under `## Content Collections Schema`, after the `now` bullet in the
collection-specific extensions list, add:

```markdown
- **profile**: single entry backing `/about` — `hook` (required), `credentials[]`, `makes[]` (`{label, blurb, href}`), `makesMore` (`{text, href}`), `subjects[]` (`{group, items[]}`), `connect`, `links[]` (`{label, href, primary}`). Schema defined in `src/utils/profile.ts`, not inline in `config.ts`, so it is unit-testable. Body markdown is the ABOUT prose.
```

- [ ] **Step 4: Add the utility module row**

In the `## Utility Modules` table, add a row:

```markdown
| `src/utils/profile.ts` | `profileSchema`, `pickProfile()`, `nowLine()` | /about profile card data layer — Zod schema (from `astro/zod`, not `astro:content`, so vitest can load it), singleton entry selection, and the single live NOW line |
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: /about is a real page now"
```

---

## Task 9: Full verification

- [ ] **Step 1: Run the whole test suite**

Run: `npm run test`
Expected: all suites pass, including the 16 new `profile.test.ts` tests.

- [ ] **Step 2: Clean build**

Run: `rm -rf .astro node_modules/.astro && npm run build`
Expected: succeeds. (The cache clear pre-empts the known stale-cache
`[glob-loader] Duplicate id` warning that a new collection directory can
trigger.)

- [ ] **Step 3: Confirm no route regressions**

Run: `ls dist/about* dist/notes/i-am-ninjaruss* -d`
Expected: both exist — the card and the declaration note.

- [ ] **Step 4: Confirm the email is not in any built page**

Run: `grep -rl "mailbox@ninjaruss" dist/ | head`
Expected: no output.

- [ ] **Step 5: Commit any remaining changes**

```bash
git status
```

Expected: clean tree. If not, review and commit.

---

## Self-Review Notes

Spec coverage checked section by section:

| Spec section | Task |
|---|---|
| Header (portrait, name, epithet, hook) | 5, 7 |
| Credential lines | 3, 5, 7 |
| WHAT I MAKE + variety line | 3, 5, 7 |
| SUBJECTS I EXPLORE (3 groups) | 3, 5, 7 |
| ABOUT prose + declaration link | 5, 7 |
| NOW (single live element) | 2, 7 |
| CONNECT + mail | 5, 7 |
| FIND ME, YouTube+site primary | 3, 5, 7 |
| `profile` collection + schema | 3, 4, 5 |
| `/about` converted from redirect | 7 |
| Not added to NavPill | 7 (no NavPill change made) |
| Styles from tokens/utilities | 6 |
| Email never in served HTML | 7 (verified in step 2) |
| Tests: schema round trip, missing entry, empty now | 1, 2, 3 |
| Docs updated | 8 |

Known deliberate omissions: no `draft` field on the profile schema (a singleton
the author edits directly does not need one), and no `emblem`/`image` fields
(the portrait comes from `_protagonist.md`).
