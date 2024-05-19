import { v } from 'convex/values';
import { mutationWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { ensureHasNoCurrentGame } from '../../game/game.utils';
import { ensureIsNotInMatchmaking, startMatchmakingIfNeeded } from '../matchmaking.utils';

export const joinMatchmakingUsecase = mutationWithAuth({
  args: {
    loadoutId: v.id('loadouts')
  },
  handler: async (ctx, args) => {
    const user = ensureAuthenticated(ctx.session);

    await ensureHasNoCurrentGame(ctx, user._id);
    await ensureIsNotInMatchmaking(ctx, user._id);

    const result = await ctx.db.insert('matchmakingUsers', {
      loadoutId: args.loadoutId,
      userId: user!._id
    });
    await startMatchmakingIfNeeded(ctx);

    return result;
  }
});
