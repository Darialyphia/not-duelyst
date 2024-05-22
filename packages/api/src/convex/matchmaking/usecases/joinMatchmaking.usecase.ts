import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureHasNoCurrentGame } from '../../game/game.utils';
import { ensureIsNotInMatchmaking, startMatchmakingIfNeeded } from '../matchmaking.utils';

export const joinMatchmakingUsecase = authedMutation({
  args: {
    loadoutId: v.id('loadouts')
  },
  handler: async (ctx, args) => {
    await ensureHasNoCurrentGame(ctx, ctx.user._id);
    await ensureIsNotInMatchmaking(ctx, ctx.user._id);
    const result = await ctx.db.insert('matchmakingUsers', {
      loadoutId: args.loadoutId,
      userId: ctx.user!._id
    });
    await startMatchmakingIfNeeded(ctx);

    return result;
  }
});
