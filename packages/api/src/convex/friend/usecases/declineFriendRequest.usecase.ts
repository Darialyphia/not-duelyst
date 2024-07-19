import { ConvexError, v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureAuthorized } from '../../utils/ability.utils';

export const declineFriendRequestUsecase = authedMutation({
  args: {
    friendRequestId: v.id('friendRequests')
  },
  async handler(ctx, args) {
    const friendRequest = await ctx.db.get(args.friendRequestId);
    if (!friendRequest) {
      throw new ConvexError('Not found');
    }

    await ensureAuthorized(() => friendRequest.receiverId === ctx.user._id);

    // return ctx.db.patch(friendRequest._id, { status: FRIEND_REQUEST_STATUS.DECLINED });
    return ctx.db.delete(friendRequest._id);
  }
});
