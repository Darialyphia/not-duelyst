import { defineSchema, defineTable } from 'convex/server';
import { Validator, v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    discriminator: v.string(),
    tokenIdentifier: v.string(),
    mmr: v.number()
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_fullname', ['name', 'discriminator'])
    .index('by_mmr', ['mmr'])
});
