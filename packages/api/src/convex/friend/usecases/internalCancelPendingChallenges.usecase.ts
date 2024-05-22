import { v } from 'convex/values';
import { FRIEND_CHALLENGE_STATUS } from '../friendRequest.constants';
import { internalMutation } from '../../_generated/server';

export const internalCancelPendingChallengesUsecase = internalMutation({
  args: {
    userIds: v.array(v.id('users'))
  },
  async handler(ctx, args) {
    const challengesToCancel = await Promise.all(
      args.userIds
        .map(userId => [
          ctx.db
            .query('friendlyChallenges')
            .withIndex('by_challenged_id', q => q.eq('challengedId', userId))
            .filter(q => q.eq(q.field('status'), FRIEND_CHALLENGE_STATUS.PENDING))
            .collect(),
          ctx.db
            .query('friendlyChallenges')
            .withIndex('by_challenger_id', q => q.eq('challengerId', userId))
            .filter(q => q.eq(q.field('status'), FRIEND_CHALLENGE_STATUS.PENDING))
            .collect()
        ])
        .flat()
    );

    await Promise.all(
      challengesToCancel.flat().map(challenge => ctx.db.delete(challenge._id))
    );
  }
});
