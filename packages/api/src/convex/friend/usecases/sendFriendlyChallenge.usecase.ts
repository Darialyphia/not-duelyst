import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { FRIEND_CHALLENGE_STATUS } from '../friendRequest.constants';
import { ensureAuthorized } from '../../utils/ability.utils';
import { getAllFriendIds } from '../friend.utils';

export const sendFriendlyChallengeUsecase = authedMutation({
  args: {
    challengedId: v.id('users')
  },
  async handler(ctx, args) {
    const friendIds = await getAllFriendIds(ctx, ctx.user._id);
    ensureAuthorized(() => friendIds.some(id => id === args.challengedId));

    const existing = await ctx.db
      .query('friendlyChallenges')
      .withIndex('by_user_id', q =>
        q.eq('challengerId', ctx.user._id).eq('challengedId', args.challengedId)
      )
      .unique();

    ensureAuthorized(() => !existing);

    return ctx.db.insert('friendlyChallenges', {
      status: FRIEND_CHALLENGE_STATUS.PENDING,
      challengerId: ctx.user._id,
      challengedId: args.challengedId
    });
  }
});
