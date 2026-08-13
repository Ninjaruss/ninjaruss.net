/**
 * Profile card data layer for /about.
 *
 * Pure by design: vitest cannot resolve the `astro:content` virtual module, so
 * nothing in this file may import it. The Zod schema is built from `astro/zod`
 * (a real subpath export of the astro package) rather than the re-export on
 * `astro:content`, which keeps it loadable in a plain node test run.
 */

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
