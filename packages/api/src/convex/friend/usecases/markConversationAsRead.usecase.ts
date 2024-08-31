import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';

export const markConversationAsReadUsecase = authedMutation({
  args: {
    friendRequestId: v.id('friendRequests')
  },
  async handler(ctx, args) {
    const messages = await ctx.db
      .query('friendMessages')
      .withIndex('by_friend_request_id', q =>
        q.eq('friendRequestId', args.friendRequestId)
      )
      .filter(q => q.eq(q.field('readAt'), undefined))
      .filter(q => q.neq(q.field('userId'), ctx.user._id))
      .collect();

    await Promise.all(messages.map(m => ctx.db.patch(m._id, { readAt: Date.now() })));
  }
});
