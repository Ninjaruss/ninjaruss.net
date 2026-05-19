import { defineCollection, z } from 'astro:content';

// Shared schema fields across all content types
const sharedSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()).default([]),
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
  }),
});

// Notes collection — philosophical fragments, beliefs in progress
const notes = defineCollection({
  type: 'content',
  schema: sharedSchema,
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

// Stream collection — session logs for the ninjaruss_ Twitch stream
const stream = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    stats: z.array(z.enum(['Determination', 'Insight', 'Expression', 'Sincerity', 'Chaos'])),
    summary: z.string(),
    memorable: z.string().optional(),
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

export const collections = {
  shelf,
  notes,
  showcase,
  now,
  stream,
  'social-links': socialLinks,
};
