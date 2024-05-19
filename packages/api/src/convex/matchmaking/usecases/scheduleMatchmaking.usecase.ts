import { v } from 'convex/values';
import { internalMutation } from '../../_generated/server';
import { getMatchmaking } from '../matchmaking.utils';

export const scheduleMatchmakingUsecase = internalMutation({
  args: {
    schedulerId: v.optional(v.id('_scheduled_functions'))
  },
  async handler(ctx, arg) {
    const matchmaking = await getMatchmaking(ctx.db);
    await ctx.db.patch(matchmaking._id, { nextInvocationId: arg.schedulerId });
  }
});
