import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const matchmakingSchemas = {
  matchmaking: defineTable({
    nextInvocationId: v.optional(v.id('_scheduled_functions'))
  }),

  matchmakingUsers: defineTable({
    userId: v.id('users'),
    loadoutId: v.id('loadouts')
  }).index('by_userId', ['userId'])
};
