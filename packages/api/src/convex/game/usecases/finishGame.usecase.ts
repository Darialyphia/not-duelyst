import { v } from 'convex/values';
import { internalMutation } from '../../_generated/server';
import { GAME_STATUS } from '../game.constants';
import { LOBBY_STATUS } from '../../lobby/lobby.constants';

export const finishGameUsecase = internalMutation({
  args: {
    gameId: v.id('games'),
    winnerId: v.id('users')
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error('Game Not Found');
    if (game?.status !== 'ONGOING') {
      throw new Error('Game is not ongoing');
    }

    await ctx.db.patch(game._id, {
      status: GAME_STATUS.FINISHED,
      winnerId: args.winnerId
    });

    const lobby = await ctx.db
      .query('lobbies')
      .withIndex('by_game_id', q => q.eq('gameId', game._id))
      .first();
    if (lobby) {
      await ctx.db.patch(lobby._id, {
        status: LOBBY_STATUS.WAITING_FOR_PLAYERS,
        gameId: undefined
      });
    }

    return game;
  }
});
