import { v } from 'convex/values';
import { stringify } from 'zipson/lib';
import { internalMutation } from '../../_generated/server';
import { getReplayInitialState } from '../game.utils';

export const createGameReplayUsecase = internalMutation({
  args: {
    gameId: v.id('games'),
    replay: v.string()
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    return ctx.db.insert('gameReplays', {
      ...args,
      initialState: stringify(await getReplayInitialState(ctx, game!))
    });
  }
});
