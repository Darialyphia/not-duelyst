import { v } from 'convex/values';
import { mutationWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { ensureLoadoutExists, ensureOwnsLoadout } from '../loadout.utils';

export const deleteLoadoutUsecase = mutationWithAuth({
  args: {
    loadoutId: v.id('loadouts')
  },
  async handler(ctx, args) {
    const user = await ensureAuthenticated(ctx.session);
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);
    await ensureOwnsLoadout(loadout, user._id);

    ctx.db.delete(args.loadoutId);
  }
});
