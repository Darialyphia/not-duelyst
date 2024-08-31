import { paginationOptsValidator } from 'convex/server';
import { authedQuery } from '../../auth/auth.utils';
import { v } from 'convex/values';

export const getFriendMessagesUsecase = authedQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    friendRequestId: v.id('friendRequests')
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('friendMessages')
      .withIndex('by_friend_request_id', q =>
        q.eq('friendRequestId', args.friendRequestId)
      )
      .order('desc')
      .paginate(args.paginationOpts);

    return messages;
  }
});
