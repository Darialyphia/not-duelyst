import { CARDS } from '@game/sdk';
import { internalMutation } from '../../_generated/server';
import { grantCards } from '../collection.utils';
import { v } from 'convex/values';

export const grantAllCollectionUsecase = internalMutation({
  args: {
    userId: v.id('users')
  },
  async handler(ctx, args) {
    const cards = await grantCards(ctx, {
      cards: Object.values(CARDS),
      userId: args.userId
    });
    console.log(`granted ${cards.map(c => c.id).join(', ')}`);
    return cards.map(c => c.id);
  }
});
