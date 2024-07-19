import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureAuthorized, ensureExists } from '../../utils/ability.utils';
import { FRIEND_CHALLENGE_STATUS } from '../friendRequest.constants';
import { internal } from '../../_generated/api';

export const acceptFriendlyChallengeUsecase = authedMutation({
  args: {
    challengeId: v.id('friendlyChallenges')
  },
  async handler(ctx, args) {
    const challenge = await ensureExists(ctx, args.challengeId);

    ensureAuthorized(() => challenge.challengedId === ctx.user._id);

    await ctx.db.patch(challenge._id, { status: FRIEND_CHALLENGE_STATUS.ACCEPTED });

    await ctx.scheduler.runAfter(0, internal.friends.internalCancelPendingChallenges, {
      userIds: [challenge.challengedId, challenge.challengerId]
    });

    return true;
  }
});
