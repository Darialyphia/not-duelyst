import { v } from 'convex/values';
import { authedQuery } from '../../auth/auth.utils';
import { toLoadoutDto } from '../loadout.mapper';
import { ensureLoadoutExists, ensureOwnsLoadout } from '../loadout.utils';

export const getLoadoutUsecase = authedQuery({
  args: {
    loadoutId: v.id('loadouts')
  },
  async handler(ctx, args) {
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);

    ensureOwnsLoadout(loadout, ctx.user._id);

    return toLoadoutDto(loadout);
  }
});
