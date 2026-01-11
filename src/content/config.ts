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
});

// Media collection — anime, manga, films, series, music, books, games, characters, and other inspirations
const media = defineCollection({
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

export const collections = {
  media,
  notes,
  showcase,
  now,
};
