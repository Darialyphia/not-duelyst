import { v } from 'convex/values';
import { authedQuery } from '../../auth/auth.utils';
import { toGameDto } from '../game.mapper';
import { getGamePlayers } from '../game.utils';
import { GAME_STATUS } from '../game.constants';
import { isDefined } from '@game/shared';

export const getGameHistoryUsecase = authedQuery({
  args: {
    userId: v.id('users')
  },
  handler: async (ctx, args) => {
    const gameUsers = await ctx.db
      .query('gamePlayers')
      .withIndex('by_creation_time')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .take(15);
    const history = await Promise.all(
      gameUsers.map(async gu => {
        const game = await ctx.db.get(gu.gameId);
        if (!game) return null;

        if (game.status !== GAME_STATUS.FINISHED) return null;

        return toGameDto({
          ...game,
          players: await getGamePlayers(ctx, game)
        });
      })
    );
    return history.filter(isDefined);
  }
});
