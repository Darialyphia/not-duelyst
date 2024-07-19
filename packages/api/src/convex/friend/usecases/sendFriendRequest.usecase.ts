import { ConvexError, v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';

export const sendFriendRequestUsecase = authedMutation({
  args: {
    name: v.string(),
    discriminator: v.string()
  },
  async handler(ctx, args) {
    const receiver = await ctx.db
      .query('users')
      .withIndex('by_fullname', q =>
        q.eq('name', args.name).eq('discriminator', args.discriminator)
      )
      .first();
    if (!receiver) {
      throw new ConvexError('Player not found.');
    }

    const existing = await ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q =>
        q.eq('receiverId', receiver._id).eq('senderId', ctx.user._id)
      );
    if (!existing) {
      return new ConvexError('You already sent a friend request to this user');
    }

    return ctx.db.insert('friendRequests', {
      receiverId: receiver._id,
      senderId: ctx.user._id,
      seen: false,
      status: 'pending'
    });
  }
});
