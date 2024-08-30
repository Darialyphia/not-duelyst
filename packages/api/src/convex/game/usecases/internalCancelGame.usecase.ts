import { v } from 'convex/values';
import { internalMutation } from '../../_generated/server';
import { GAME_STATUS } from '../game.constants';
import { LOBBY_STATUS } from '../../lobby/lobby.constants';

export const internalCancelGameUsecase = internalMutation({
  args: {
    roomId: v.string()
  },
  async handler(ctx, args) {
    const game = await ctx.db
      .query('games')
      .withIndex('by_roomId', q => q.eq('roomId', args.roomId))
      .first();
    if (!game) throw new Error('Game Not Found');

    await ctx.db.patch(game._id, { status: GAME_STATUS.CANCELLED });
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
  }
});
