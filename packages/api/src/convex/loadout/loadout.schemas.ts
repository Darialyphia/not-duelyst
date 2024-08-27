import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const loadoutSchemas = {
  loadouts: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    formatId: v.id('formats'),
    cards: v.array(
      v.object({
        id: v.string(),
        pedestalId: v.string(),
        cardBackId: v.string()
      })
    )
  }).index('by_owner_id', ['ownerId'])
};
