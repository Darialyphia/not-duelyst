import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const authSchemas = {
  sessions: defineTable({
    id: v.string(),
    user_id: v.string(),
    active_expires: v.float64(),
    idle_expires: v.float64()
  })
    .index('byId', ['id'])
    .index('byUserId', ['user_id']),

  auth_keys: defineTable({
    id: v.string(),
    hashed_password: v.union(v.string(), v.null()),
    user_id: v.string()
  })
    .index('byId', ['id'])
    .index('byUserId', ['user_id']),

  password_reset_token: defineTable({
    token: v.string(),
    expires: v.float64(),
    user_id: v.id('users')
  })
    .index('by_user_id', ['user_id'])
    .index('by_token', ['token'])
};
