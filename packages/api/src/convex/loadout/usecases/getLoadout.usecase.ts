import { v } from 'convex/values';
import { queryWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { toLoadoutDto } from '../loadout.mapper';
import { ensureLoadoutExists, ensureOwnsLoadout } from '../loadout.utils';

export const getLoadoutUsecase = queryWithAuth({
  args: {
    loadoutId: v.id('loadouts')
  },
  async handler(ctx, args) {
    const user = await ensureAuthenticated(ctx.session);
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);

    ensureOwnsLoadout(loadout, user._id);

    return toLoadoutDto(loadout);
  }
});
