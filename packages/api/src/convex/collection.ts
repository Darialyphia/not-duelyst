import { v } from 'convex/values';
import { internalAction, internalMutation } from './_generated/server';

import { toCollectionItemDto } from './collection/collection.mapper';
import { internal } from './_generated/api';
import { ensureAuthenticated, mutationWithAuth, queryWithAuth } from './auth/auth.utils';
import { CARDS, RARITIES } from '@game/sdk';
import { grantCards } from './collection/collection.utils';

export const grantAllCollection = internalMutation({
  args: {
    userId: v.id('users')
  },
  async handler(ctx, args) {
    return grantCards(ctx, { cards: Object.values(CARDS), userId: args.userId });
  }
});

export const grantBasicCards = internalMutation({
  args: {
    userId: v.id('users')
  },
  async handler(ctx, args) {
    return grantCards(ctx, {
      cards: Object.values(CARDS).filter(card => card.rarity === RARITIES.BASIC),
      userId: args.userId
    });
  }
});

export const grantAllCollectionToAllPlayers = internalAction(async ctx => {
  const users = await ctx.runQuery(internal.users.all);

  await Promise.all(
    users.map(user => {
      return ctx.runMutation(internal.collection.grantAllCollection, {
        userId: user._id
      });
    })
  );

  return true;
});

export const acknowledgeGranted = mutationWithAuth({
  args: {},
  async handler(ctx, args) {
    const user = await ensureAuthenticated(ctx.session);

    const grantedCards = await ctx.db
      .query('collectionItems')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .filter(q => q.lte(q.field('grantedAt'), Date.now()))
      .collect();
    await Promise.all(
      grantedCards.map(card => ctx.db.patch(card._id, { grantedAt: null }))
    );

    return true;
  }
});

export const myCollection = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = await ensureAuthenticated(ctx.session);

    const collection = await ctx.db
      .query('collectionItems')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .collect();

    return collection.map(toCollectionItemDto);
  }
});
