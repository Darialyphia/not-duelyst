import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { validateLoadout } from '../loadout.utils';

export const createLoadoutUsecase = authedMutation({
  args: {
    name: v.string(),
    cards: v.array(
      v.object({ id: v.string(), pedestalId: v.string(), cardBackId: v.string() })
    ),
    formatId: v.optional(v.id('formats'))
  },
  async handler(ctx, args) {
    const validData = await validateLoadout(ctx, {
      ownerId: ctx.user._id,
      cards: args.cards,
      formatId: args.formatId
    });

    ctx.db.insert('loadouts', {
      ...validData,
      name: args.name
    });
  }
});
