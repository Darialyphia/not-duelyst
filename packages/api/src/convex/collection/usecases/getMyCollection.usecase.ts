import { authedQuery } from '../../auth/auth.utils';
import { toCollectionItemDto } from '../collection.mapper';

export const getMyCollectionUsecase = authedQuery({
  args: {},
  handler: async ctx => {
    const collection = await ctx.db
      .query('collectionItems')
      .withIndex('by_owner_id', q => q.eq('ownerId', ctx.user._id))
      .collect();

    return collection.map(toCollectionItemDto);
  }
});
