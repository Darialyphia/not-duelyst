import { authedQuery } from '../../auth/auth.utils';
import { toLoadoutDto } from '../loadout.mapper';

export const getMyLoadoutsUsecase = authedQuery({
  args: {},
  handler: async ctx => {
    const loadouts = await ctx.db
      .query('loadouts')
      .withIndex('by_owner_id', q => q.eq('ownerId', ctx.user._id))
      .collect();

    return loadouts.map(toLoadoutDto);
  }
});
