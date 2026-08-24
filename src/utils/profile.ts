/**
 * Profile card data layer for /about.
 *
 * Pure by design: vitest cannot resolve the `astro:content` virtual module, so
 * nothing in this file may import it. The Zod schema is built from `astro/zod`
 * (a real subpath export of the astro package) rather than the re-export on
 * `astro:content`, which keeps it loadable in a plain node test run.
 */

import { z } from 'astro/zod';

/**
 * Every string is `.min(1)`: a blank field renders as an empty slot with a live
 * label above it, which reads as broken. Failing the build is the honest
 * outcome — same stance as `nowLine`, which refuses a blank title.
 *
 * No `draft` field on purpose. Every other collection has one because it holds
 * many entries at different stages; this is a singleton the author edits in
 * place, and a drafted profile would just blank the page.
 */
export const profileSchema = z.object({
  /** The one line a stranger reads first, under the name. */
  hook: z.string().min(1),
  /** Mono lines establishing background. No employer names, no job titles. */
  credentials: z.array(z.string().min(1)).default([]),
  /** WHAT I MAKE rows, in deliberate order — the writing leads. */
  makes: z.array(z.object({
    label: z.string().min(1),
    blurb: z.string().min(1),
    href: z.string().min(1),
  })).default([]),
  /** The "and whatever's next" line closing the makes list. */
  makesMore: z.object({
    text: z.string().min(1),
    href: z.string().min(1),
  }).optional(),
  /** SUBJECTS I EXPLORE, grouped. Plain text, no thematic browsing/linking. */
  subjects: z.array(z.object({
    group: z.string().min(1),
    items: z.array(z.string().min(1)),
  })).default([]),
  /** The collaboration invitation above the mail link. */
  connect: z.string().min(1).optional(),
  /** FIND ME links; `primary: true` gets CTA billing. */
  links: z.array(z.object({
    label: z.string().min(1),
    href: z.string().min(1),
    primary: z.boolean().default(false),
  })).default([]),
});

export type ProfileData = z.infer<typeof profileSchema>;

/**
 * The profile collection is a singleton, but a collection is still a list.
 * Prefer the entry literally named `about`; otherwise take the alphabetically
 * first so the page renders something deterministic rather than throwing.
 */
export function pickProfile<T extends { id: string }>(entries: readonly T[]): T | null {
  if (entries.length === 0) return null;
  const named = entries.find(e => e.id.replace(/\.mdx?$/, '') === 'about');
  if (named) return named;
  // Codepoint order, not localeCompare — the latter is locale-dependent, which
  // would make "deterministic" above a lie.
  return [...entries].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))[0];
}

export interface NowLine {
  title: string;
  href: string;
}

interface NowEntryLike {
  // publishedAt/draft are required and already coerced by the `now` collection
  // schema (`z.coerce.date()` / `z.boolean().default(false)`), so an unparseable
  // date fails the build long before it reaches here — no guard needed.
  data: { title?: string; publishedAt: Date; draft: boolean };
}

/**
 * The single live element on the card. Returns null rather than a placeholder
 * whenever there is nothing real to show — an empty slot is honest, a stub line
 * is not.
 */
export function nowLine(entries: readonly NowEntryLike[]): NowLine | null {
  const usable = entries.filter(e => !e.data.draft);
  if (usable.length === 0) return null;

  // Ties keep the earlier array element, matching the stable descending sorts
  // used on /now and the homepage.
  const latest = usable.reduce((a, b) =>
    b.data.publishedAt > a.data.publishedAt ? b : a
  );

  const title = latest.data.title?.trim();
  return title ? { title, href: '/now' } : null;
}
