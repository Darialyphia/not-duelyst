import { isDefined } from '@game/shared';
import { authedQuery } from '../../auth/auth.utils';
import { toUserDto } from '../../users/user.mapper';
import { getAllFriendIds, getAllFriendRequests } from '../friend.utils';

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

        return { ...user, challenge, friendRequestId: fr._id };
      })
    );

    return friends.filter(isDefined).map(user => {
      return {
        ...toUserDto(user),
        challenge: user.challenge,
        friendRequestId: user.friendRequestId
      };
    });
  }
});
