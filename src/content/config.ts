import { defineCollection, z } from 'astro:content';
import { profileSchema } from '../utils/profile';

// Shared schema fields across all content types
const sharedSchema = z.object({
  title: z.string(),
  collections: z.array(z.string()).default([]),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  emblem: z.string().optional(), // Path to page-specific emblem image
  description: z.string().optional(), // For meta/OG description
  image: z.string().optional(), // Path to social share image
});

// Shelf collection — anime, manga, films, series, music, books, games, characters, and other inspirations
const shelf = defineCollection({
  type: 'content',
  schema: sharedSchema.extend({
    content_type: z.enum(['anime', 'manga', 'film', 'series', 'music', 'book', 'game', 'character', 'other']),
    isFavorite: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

// Notes collection — philosophical fragments, beliefs in progress.
// No longer renders pages: writing is published on Substack, and this
// collection is the slug -> post redirect map (src/utils/noteRedirect.ts).
// The markdown stays in the repo as the working copy, public via GitHub.
const notes = defineCollection({
  type: 'content',
  schema: sharedSchema.extend({
    // Optional only because a half-written entry must not fail the build.
    // Backfill target: every note carries one.
    substackUrl: z.string().url().optional(),
  }),
});

// Showcase collection — projects framed as inquiries
const showcase = defineCollection({
  type: 'content',
  schema: sharedSchema
});

// Now collection — archived "now" snapshots
const now = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().default('Now'),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

// Sessions collection — logged work sessions (Japanese, writing, streams, …)
const sessions = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    stats: z.array(z.enum(['Determination', 'Insight', 'Expression', 'Sincerity', 'Chaos'])),
    summary: z.string(),
    memorable: z.string().optional(),
    streamed: z.boolean().default(false),
    reflection: z.string().optional(), // bounded mirror synthesis (2-3 sentences)
    nextStep: z.string().optional(),   // the one forward-pointing action
    quest: z.string().optional(),      // active-quest text this session advanced
    draft: z.boolean().default(false),
  }),
});

// Social links — bonds / connections for the Bonds panel
const socialLinks = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    arcana: z.string(),
    affinity: z.string(),
    rank: z.number().min(0).max(5).default(0),
    stat: z.enum(['Determination', 'Insight', 'Expression', 'Sincerity', 'Chaos']).optional(),
    reachedDate: z.string().optional(),
    lore: z.string().optional(),
    lastSession: z.string().optional(),
    lastInteraction: z.string().optional(),
    img: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Profile — single-entry collection backing the /about card. The schema lives in
// utils/profile.ts so vitest (which cannot resolve astro:content) can test it.
const profile = defineCollection({
  type: 'content',
  schema: profileSchema,
});

export const collections = {
  shelf,
  notes,
  showcase,
  now,
  sessions,
  'social-links': socialLinks,
  profile,
};
