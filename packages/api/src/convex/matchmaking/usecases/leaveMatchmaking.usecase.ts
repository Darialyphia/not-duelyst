import { authedMutation } from '../../auth/auth.utils';
import { ensureIsInMatchmaking } from '../matchmaking.utils';

export const leaveMatchmakingUsecase = authedMutation({
  args: {},
  handler: async ctx => {
    const matchMakingUser = await ensureIsInMatchmaking(ctx, ctx.user._id);

    return ctx.db.delete(matchMakingUser._id);
  }
});
