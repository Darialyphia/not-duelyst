import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureAuthorized, ensureExists } from '../../utils/ability.utils';

export const cancelFriendlyChallengeUsecase = authedMutation({
  args: {
    challengeId: v.id('friendlyChallenges')
  },
  async handler(ctx, args) {
    const challenge = await ensureExists(ctx, args.challengeId);

    ensureAuthorized(
      () =>
        challenge.challengerId === ctx.user._id || challenge.challengedId === ctx.user._id
    );

    return ctx.db.delete(challenge._id);
  }
});
