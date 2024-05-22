import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';

export const updatePresenceUsecase = authedMutation({
  args: {
    presence: v.union(v.literal('online'), v.literal('away'))
  },
  async handler(ctx, args) {
    await ctx.db.patch(ctx.user._id, {
      presence: args.presence,
      presenceLastUpdatedAt: Date.now()
    });
  }
});
