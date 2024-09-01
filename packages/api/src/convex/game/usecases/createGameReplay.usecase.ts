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
    const initialState = await getReplayInitialState(game!);

    return ctx.db.insert('gameReplays', {
      ...args,
      initialState: stringify(initialState)
    });
  }
});
