import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const collectionSchemas = {
  collectionItems: defineTable({
    itemId: v.string(),
    ownerId: v.id('users'),
    grantedAt: v.union(v.number(), v.null()),
    pedestalId: v.string(),
    cardBackId: v.string()
  })
    .index('by_owner_id', ['ownerId'])
    .index('by_item_id', ['itemId'])
};
