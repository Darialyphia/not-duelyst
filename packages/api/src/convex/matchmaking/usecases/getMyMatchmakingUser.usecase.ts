import { authedQuery } from '../../auth/auth.utils';
import { toMatchmakingUserDto } from '../matchmaking.mapper';

export const getMyMatchmakingUserUsecase = authedQuery({
  args: {},
  async handler(ctx) {
    const matchmakingUser = await ctx.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', ctx.user._id))
      .unique();

    if (!matchmakingUser) return null;

    return toMatchmakingUserDto(matchmakingUser);
  }
});
