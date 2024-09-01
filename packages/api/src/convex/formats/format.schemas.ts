import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { formatConfigValidator } from './format.utils';

export const formatSchemas = {
  formats: defineTable({
    name: v.string(),
    description: v.string(),
    config: formatConfigValidator,
    cards: v.string(),
    authorId: v.id('users'),
    map: v.optional(v.string())
  })
    .index('by_name', ['name'])
    .index('by_authorId', ['authorId'])
};
