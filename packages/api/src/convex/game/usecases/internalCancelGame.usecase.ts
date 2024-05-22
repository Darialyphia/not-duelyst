import { v } from 'convex/values';
import { internalMutation } from '../../_generated/server';
import { GAME_STATUS } from '../game.constants';

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
  }
});
