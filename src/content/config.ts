import { defineCollection, z } from 'astro:content';

// Shared schema fields across all content types
const sharedSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()).default([]),
  collections: z.array(z.string()).default([]),
  status: z.enum(['completed', 'ongoing', 'unresolved']).default('unresolved'),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  draft: z.boolean().default(false),
});

// Reflections collection — anime, manga, films
const reflections = defineCollection({
  type: 'content',
  schema: sharedSchema.extend({
    reflections_type: z.enum(['anime', 'manga', 'film']),
  }),
});

// Music collection — curated song collections by mood
const music = defineCollection({
  type: 'content',
  schema: sharedSchema.extend({
    mood: z.string().optional(),
    tracks: z.array(z.object({
      title: z.string(),
      artist: z.string(),
      link: z.string().optional(),
    })).optional(),
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
  reflections,
  music,
  notes,
  showcase,
  now,
};
