import { mutationWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { grantCards } from '../collection.utils';

export const acknowledgeGrantedCardsUsecase = mutationWithAuth({
  args: {},
  async handler(ctx) {
    const user = await ensureAuthenticated(ctx.session);

    const grantedCards = await ctx.db
      .query('collectionItems')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .filter(q => q.lte(q.field('grantedAt'), Date.now()))
      .collect();
    await Promise.all(
      grantedCards.map(card => ctx.db.patch(card._id, { grantedAt: null }))
    );

    return grantCards.length;
  }
});
