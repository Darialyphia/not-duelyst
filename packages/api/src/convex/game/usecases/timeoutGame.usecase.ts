import { v } from 'convex/values';
import { api } from '../../_generated/api';
import { internalMutation } from '../../_generated/server';
import { GAME_STATUS } from '../game.constants';

export const timeoutGameUsecase = internalMutation({
  args: {
    roomId: v.string()
  },
  async handler(ctx, { roomId }) {
    const game = await ctx.db
      .query('games')
      .withIndex('by_roomId', q => q.eq('roomId', roomId))
      .first();
    if (!game) throw new Error('Game Not Found');
    if (game.status === GAME_STATUS.WAITING_FOR_PLAYERS) {
      ctx.scheduler.runAfter(0, api.games.cancel, {
        roomId
      });
    }
  }
});
