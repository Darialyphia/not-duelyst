import { ConvexError, v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { FRIEND_REQUEST_STATUS } from '../friendRequest.constants';
import { ensureAuthorized } from '../../utils/ability.utils';

export const acceptFriendRequestUsecase = authedMutation({
  args: {
    friendRequestId: v.id('friendRequests')
  },
  async handler(ctx, args) {
    const friendRequest = await ctx.db.get(args.friendRequestId);
    if (!friendRequest) {
      throw new ConvexError('Not found');
    }

    await ensureAuthorized(() => friendRequest.receiverId === ctx.user._id);

    await ctx.db.patch(friendRequest._id, { status: FRIEND_REQUEST_STATUS.ACCEPTED });
  }
});
