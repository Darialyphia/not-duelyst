import { authedQuery } from '../../auth/auth.utils';
import { FRIEND_CHALLENGE_STATUS } from '../friendRequest.constants';

export const getLatestChallengeUsecase = authedQuery({
  args: {},
  async handler(ctx) {
    const challenge = await ctx.db
      .query('friendlyChallenges')
      .withIndex('by_challenged_id', q => q.eq('challengedId', ctx.user._id))
      .filter(q => q.eq(q.field('status'), FRIEND_CHALLENGE_STATUS.PENDING))
      .order('desc')
      .first();

    if (!challenge) return challenge;

    const challenger = await ctx.db.get(challenge.challengerId);
    if (!challenger) return null;

    return { ...challenge, challenger: challenger! };
  }
});
