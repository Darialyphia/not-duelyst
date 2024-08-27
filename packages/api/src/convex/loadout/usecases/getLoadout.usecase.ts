import { v } from 'convex/values';
import { authedQuery } from '../../auth/auth.utils';
import { toLoadoutDto } from '../loadout.mapper';
import { ensureLoadoutExists, ensureOwnsLoadout } from '../loadout.utils';
import { ensureFormatExists } from '../../formats/format.utils';

export const getLoadoutUsecase = authedQuery({
  args: {
    loadoutId: v.id('loadouts')
  },
  async handler(ctx, args) {
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);

    ensureOwnsLoadout(loadout, ctx.user._id);

    const format = await ensureFormatExists(ctx, loadout.formatId);

    return toLoadoutDto({ ...loadout, format });
  }
});
