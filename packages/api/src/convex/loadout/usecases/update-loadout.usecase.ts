import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import {
  ensureLoadoutExists,
  ensureOwnsLoadout,
  validateLoadout
} from '../loadout.utils';

export const updateLoadoutUsecase = authedMutation({
  args: {
    loadoutId: v.id('loadouts'),
    name: v.string(),
    cards: v.array(
      v.object({ id: v.string(), pedestalId: v.string(), cardBackId: v.string() })
    ),
    formatId: v.optional(v.id('formats'))
  },
  async handler(ctx, args) {
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);
    await ensureOwnsLoadout(loadout, ctx.user._id);

    const validData = await validateLoadout(ctx, {
      ownerId: ctx.user._id,
      cards: args.cards,
      formatId: args.formatId
    });

    ctx.db.replace(args.loadoutId, {
      ...validData,
      name: args.name
    });
  }
});
