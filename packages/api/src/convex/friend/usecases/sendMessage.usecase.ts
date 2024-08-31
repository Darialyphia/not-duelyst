import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';

export const sendMessageUsecase = authedMutation({
  args: {
    friendRequestId: v.id('friendRequests'),
    text: v.string()
  },
  handler(ctx, args) {
    ctx.db.insert('friendMessages', {
      friendRequestId: args.friendRequestId,
      text: args.text,
      userId: ctx.user._id
    });
  }
});
