import { v } from 'convex/values';
import { internalMutation } from '../../_generated/server';

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

    const gamePlayer = await ctx.db
      .query('gamePlayers')
      .withIndex('by_user_id', q => q.eq('userId', args.winnerId))
      .filter(q => q.eq(q.field('gameId'), args.gameId))
      .unique();

    await ctx.db.patch(game._id, { status: 'FINISHED', winnerId: gamePlayer!._id });

    return game;
  }
});
