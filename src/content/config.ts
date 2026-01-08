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

// Media collection — anime, manga, films
const media = defineCollection({
  type: 'content',
  schema: sharedSchema.extend({
    media_type: z.enum(['anime', 'manga', 'film']),
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

// Experiments collection — projects framed as inquiries
const experiments = defineCollection({
  type: 'content',
  schema: sharedSchema
});

export const collections = {
  media,
  music,
  notes,
  experiments,
};
