import { CARDS, RARITIES } from '@game/sdk';
import { v } from 'convex/values';
import { internalMutation } from '../../_generated/server';
import { grantCards } from '../collection.utils';

export const grantBasicCardsUsecase = internalMutation({
  args: {
    userId: v.id('users')
  },
  async handler(ctx, args) {
    const cards = await grantCards(ctx, {
      cards: Object.values(CARDS).filter(card => card.rarity === RARITIES.BASIC),
      userId: args.userId
    });

    return cards.map(c => c.id);
  }
});
