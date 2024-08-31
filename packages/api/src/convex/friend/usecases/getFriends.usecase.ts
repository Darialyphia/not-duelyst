import { isDefined } from '@game/shared';
import { authedQuery } from '../../auth/auth.utils';
import { toUserDto } from '../../users/user.mapper';
import { getAllFriendRequests } from '../friend.utils';

export const getFriendsUsecase = authedQuery({
  args: {},
  async handler(ctx) {
    const friendRequests = await getAllFriendRequests(ctx, ctx.user._id);

    const friends = await Promise.all(
      friendRequests.map(async fr => {
        const userId = fr.receiverId === ctx.user._id ? fr.senderId : fr.receiverId;

        const user = await ctx.db.get(userId);
        if (!user) return null;

        const challenge = await ctx.db
          .query('friendlyChallenges')
          .filter(q =>
            q.or(
              q.eq(q.field('challengedId'), userId),
              q.eq(q.field('challengerId'), userId)
            )
          )
          .first();

        const unreadMessages = await ctx.db
          .query('friendMessages')
          .withIndex('by_friend_request_id', q => q.eq('friendRequestId', fr._id))
          .filter(q => q.eq(q.field('readAt'), undefined))
          .filter(q => q.neq(q.field('userId'), ctx.user._id))
          .collect();

        return {
          ...user,
          challenge,
          friendRequestId: fr._id,
          unreadMessagesCount: unreadMessages.length
        };
      })
    );

    return friends.filter(isDefined).map(user => {
      return {
        ...toUserDto(user),
        challenge: user.challenge,
        friendRequestId: user.friendRequestId,
        unreadMessagesCount: user.unreadMessagesCount
      };
    });
  }
});
