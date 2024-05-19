import { internalQuery } from '../../_generated/server';

export const getMatchmakingUsersUsecase = internalQuery(async ctx => {
  const matchmakingUsers = await ctx.db.query('matchmakingUsers').collect();

  return await Promise.all(
    matchmakingUsers.map(async matchmakingUser => ({
      matchmakingUser,
      user: (await ctx.db.get(matchmakingUser.userId))!
    }))
  );
});
