import { v } from 'convex/values';
import { mutationWithAuth } from '../../auth/auth.utils';

export const startGameUsecase = mutationWithAuth({
  args: {
    gameId: v.id('games')
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error('Not Found');
    if (game?.status !== 'WAITING_FOR_PLAYERS') {
      throw new Error('Game is already started');
    }

    await ctx.db.patch(game._id, { status: 'ONGOING' });
  }
});
