import { queryWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { toLoadoutDto } from '../loadout.mapper';

export const getMyLoadoutsUsecase = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = await ensureAuthenticated(ctx.session);

    const loadouts = await ctx.db
      .query('loadouts')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .collect();

    return loadouts.map(toLoadoutDto);
  }
});
