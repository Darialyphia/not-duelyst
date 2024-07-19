import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { createCollectionAbility } from '../collection.ability';
import { subject } from '@casl/ability';

export const updateCollectionItemUsecase = authedMutation({
  args: {
    id: v.id('collectionItems'),
    pedestalId: v.optional(v.string()),
    cardBackId: v.optional(v.string())
  },
  async handler(ctx, args) {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error('Collection item not found');

    const ability = await createCollectionAbility(ctx.session);
    if (ability.cannot('edit', subject('collection-item', item))) {
      throw new Error('Forbidden');
    }

    await ctx.db.patch(item._id, {
      cardBackId: args.cardBackId,
      pedestalId: args.pedestalId
    });
  }
});
