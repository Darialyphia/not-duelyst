import { ConvexError, v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureAuthorized } from '../../utils/ability.utils';

export const markFriendRequestAsSeenUsecase = authedMutation({
  args: {},
  async handler(ctx, args) {
    const friendRequests = await await ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', ctx.user._id))
      .filter(q => q.eq(q.field('seen'), false))
      .collect();

    await Promise.all(friendRequests.map(req => ctx.db.patch(req._id, { seen: true })));

    return true;
  }
});
