import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { action } from '../../_generated/server';

export const endGameUsecase = action({
  args: {
    gameId: v.id('games'),
    winnerId: v.id('users'),
    replay: v.string()
  },
  async handler(ctx, { replay, ...args }) {
    const game = await ctx.runMutation(internal.games.finish, args);
    await ctx.runMutation(internal.games.createReplay, {
      gameId: args.gameId,
      replay: replay
    });
    await ctx.runAction(internal.hathora.destroyRoom, { roomId: game.roomId });
  }
});
