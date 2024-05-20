import { authedMutation } from '../../auth/auth.utils';
import { grantCards } from '../collection.utils';

export const acknowledgeGrantedCardsUsecase = authedMutation({
  args: {},
  async handler(ctx) {
    const grantedCards = await ctx.db
      .query('collectionItems')
      .withIndex('by_owner_id', q => q.eq('ownerId', ctx.user._id))
      .filter(q => q.lte(q.field('grantedAt'), Date.now()))
      .collect();
    await Promise.all(
      grantedCards.map(card => ctx.db.patch(card._id, { grantedAt: null }))
    );

    return grantCards.length;
  }
});
