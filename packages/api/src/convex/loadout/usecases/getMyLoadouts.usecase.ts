import { authedQuery } from '../../auth/auth.utils';
import { ensureFormatExists } from '../../formats/format.utils';
import { toLoadoutDto } from '../loadout.mapper';

export const getMyLoadoutsUsecase = authedQuery({
  args: {},
  handler: async ctx => {
    const loadouts = await ctx.db
      .query('loadouts')
      .withIndex('by_owner_id', q => q.eq('ownerId', ctx.user._id))
      .collect();

    const loadoutsWithFormat = await Promise.all(
      loadouts.map(async loadout => {
        return {
          ...loadout,
          format: await ensureFormatExists(ctx, loadout.formatId)
        };
      })
    );
    return loadoutsWithFormat.map(toLoadoutDto);
  }
});
