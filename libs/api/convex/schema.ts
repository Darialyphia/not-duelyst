import { defineSchema, defineTable } from 'convex/server';
import { Validator, v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    discriminator: v.string()
  }).index('by_fullname', ['name', 'discriminator'])
});
