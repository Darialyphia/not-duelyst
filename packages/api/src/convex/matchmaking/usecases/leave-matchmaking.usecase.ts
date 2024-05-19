import { mutationWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { ensureIsInMatchmaking } from '../matchmaking.utils';

export const leaveMatchmakingUsecase = mutationWithAuth({
  args: {},
  handler: async ctx => {
    const user = ensureAuthenticated(ctx.session);
    const matchMakingUser = await ensureIsInMatchmaking(ctx, user._id);

    return ctx.db.delete(matchMakingUser._id);
  }
});
