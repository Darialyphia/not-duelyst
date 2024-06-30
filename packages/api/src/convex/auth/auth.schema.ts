import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const authSchemas = {
  sessions: defineTable({
    id: v.string(),
    user_id: v.string(),
    expires_at: v.float64()
  })
    .index('byId', ['id'])
    .index('byUserId', ['user_id']),

  auth_keys: defineTable({
    id: v.string(),
    hashed_password: v.union(v.string(), v.null()),
    user_id: v.string()
  })
    .index('byId', ['id'])
    .index('byUserId', ['user_id'])
};
