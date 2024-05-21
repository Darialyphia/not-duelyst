import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const friendSchemas = {
  friendRequests: defineTable({
    senderId: v.id('users'),
    receiverId: v.id('users'),
    status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('declined'))
  })
    .index('by_receiver_id', ['receiverId'])
    .index('by_sender_id', ['senderId'])
};
