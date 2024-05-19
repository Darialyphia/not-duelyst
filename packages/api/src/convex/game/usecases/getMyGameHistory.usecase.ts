import { queryWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { toUserDto } from '../../users/user.mapper';

export const getMyGameHistoryUsecase = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = ensureAuthenticated(ctx.session);

    const gameUsers = await ctx.db
      .query('gamePlayers')
      .withIndex('by_creation_time')
      .filter(q => q.eq(q.field('userId'), user._id))
      .collect();

    return Promise.all(
      gameUsers.map(async gu => {
        const game = await ctx.db.get(gu.gameId);
        if (!game) throw new Error('Game not found.');

        const gamePlayers = await ctx.db
          .query('gamePlayers')
          .withIndex('by_game_id', q => q.eq('gameId', game?._id))
          .collect();

        return {
          ...game,

          players: await Promise.all(
            gamePlayers.map(async gamePlayer => {
              const user = await ctx.db.get(gamePlayer.userId);
              return {
                ...toUserDto(user!),
                gamePlayerId: gamePlayer._id,
                loadout: await ctx.db.get(gamePlayer.loadoutId)
              };
            })
          )
        };
      })
    );
  }
});
