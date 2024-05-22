import { isDefined } from '@game/shared';
import { authedQuery } from '../../auth/auth.utils';
import { toUserDto } from '../../users/user.mapper';
import { getAllFriendIds } from '../friend.utils';

export const getFriendsUsecase = authedQuery({
  args: {},
  async handler(ctx) {
    const friendIds = await getAllFriendIds(ctx, ctx.user._id);

    const friends = await Promise.all(
      friendIds.map(async id => {
        const user = await ctx.db.get(id);
        if (!user) return null;
        const challenge = await ctx.db
          .query('friendlyChallenges')
          .filter(q =>
            q.or(q.eq(q.field('challengedId'), id), q.eq(q.field('challengerId'), id))
          )
          .first();
        return { ...user, challenge };
      })
    );

    return friends.filter(isDefined).map(user => {
      return { ...toUserDto(user), challenge: user.challenge };
    });
  }
});
