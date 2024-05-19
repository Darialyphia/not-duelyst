import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const userSchemas = {
  users: defineTable({
    id: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    discriminator: v.optional(v.string()),
    mmr: v.number(),
    hasOnboarded: v.boolean()
  })
    .index('byId', ['id'])
    .index('by_fullname', ['name', 'discriminator'])
    .index('by_mmr', ['mmr']),

  userSettings: defineTable({
    userId: v.id('users'),
    settings: v.any()
  }).index('by_user_id', ['userId'])
};
