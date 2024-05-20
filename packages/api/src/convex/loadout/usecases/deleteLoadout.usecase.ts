import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureLoadoutExists, ensureOwnsLoadout } from '../loadout.utils';

export const deleteLoadoutUsecase = authedMutation({
  args: {
    loadoutId: v.id('loadouts')
  },
  async handler(ctx, args) {
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);
    await ensureOwnsLoadout(loadout, ctx.user._id);

    ctx.db.delete(args.loadoutId);
  }
});
