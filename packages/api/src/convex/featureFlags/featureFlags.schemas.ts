import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const featureflagSchemas = {
  featureFlags: defineTable({
    key: v.string(),
    value: v.boolean()
  })
};
