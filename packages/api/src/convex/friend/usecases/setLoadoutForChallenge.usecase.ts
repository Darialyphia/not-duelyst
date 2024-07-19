import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureAuthorized, ensureExists } from '../../utils/ability.utils';
import { FRIEND_CHALLENGE_STATUS } from '../friendRequest.constants';
import { internal } from '../../_generated/api';

export const setLoadoutForChallengeUsecase = authedMutation({
  args: {
    challengeId: v.id('friendlyChallenges'),
    loadoutId: v.optional(v.id('loadouts'))
  },
  async handler(ctx, args) {
    const challenge = await ensureExists(ctx, args.challengeId);
    ensureAuthorized(() => challenge.status === FRIEND_CHALLENGE_STATUS.ACCEPTED);
    ensureAuthorized(
      () =>
        challenge.challengedId === ctx.user._id || challenge.challengerId == ctx.user._id
    );

    if (challenge.challengedId === ctx.user._id) {
      challenge.challengedLoadoutId = args.loadoutId;
    } else {
      challenge.challengerLoadoutId = args.loadoutId;
    }
    await ctx.db.patch(
      challenge._id,
      challenge.challengedId === ctx.user._id
        ? { challengedLoadoutId: args.loadoutId }
        : { challengerLoadoutId: args.loadoutId }
    );
    if (challenge.challengedLoadoutId && challenge.challengerLoadoutId) {
      ctx.scheduler.runAfter(0, internal.friends.setupChallengeGame, {
        challengeId: challenge._id
      });
    }
  }
});
