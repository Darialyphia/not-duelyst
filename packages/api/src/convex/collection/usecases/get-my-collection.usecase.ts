import { queryWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { toCollectionItemDto } from '../collection.mapper';

export const getMyCollectionUsecase = queryWithAuth({
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
