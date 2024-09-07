import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { gameStatsSchema } from '../analytics/analytics.schemas';

export const userSchemas = {
  users: defineTable({
    id: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    discriminator: v.optional(v.string()),
    slug: v.optional(v.string()),
    mmr: v.number(),
    avatar: v.string(),
    hasOnboarded: v.boolean(),
    presence: v.union(v.literal('offline'), v.literal('online'), v.literal('away')),
    presenceLastUpdatedAt: v.optional(v.number())
  })
    .index('byId', ['id'])
    .index('by_fullname', ['name', 'discriminator'])
    .index('by_slug', ['slug'])
    .index('by_email', ['email'])
    .index('by_mmr', ['mmr']),

  userSettings: defineTable({
    userId: v.id('users'),
    settings: v.any()
  }).index('by_user_id', ['userId']),

  userProfiles: defineTable({
    userId: v.id('users'),
    stats: v.object(gameStatsSchema)
  }).index('by_user_id', ['userId'])
};
