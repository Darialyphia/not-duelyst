import { queryWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { toMatchmakingUserDto } from '../matchmaking.mapper';

export const getMyMatchmakingUserUsecase = queryWithAuth({
  args: {},
  async handler(ctx) {
    const user = await ensureAuthenticated(ctx.session);

    const matchmakingUser = await ctx.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', user._id))
      .unique();

    if (!matchmakingUser) return null;

    return toMatchmakingUserDto(matchmakingUser);
  }
});
