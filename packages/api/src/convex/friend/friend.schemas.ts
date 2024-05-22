import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const friendSchemas = {
  friendRequests: defineTable({
    senderId: v.id('users'),
    receiverId: v.id('users'),
    status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('declined')),
    seen: v.boolean()
  })
    .index('by_user_id', ['receiverId', 'senderId'])
    .index('by_sender_id', ['senderId']),

  friendlyChallenges: defineTable({
    challengerId: v.id('users'),
    challengedId: v.id('users'),
    status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('declined'))
  })
    .index('by_challenger_id', ['challengerId'])
    .index('by_challenged_id', ['challengedId'])
    .index('by_user_id', ['challengerId', 'challengedId'])
};
