import { authedQuery } from '../../auth/auth.utils';
import { getCurrentChallenge } from '../friend.utils';

export const getCurrentChallengeUsecase = authedQuery({
  args: {},
  async handler(ctx) {
    const challenge = await getCurrentChallenge(ctx, ctx.user._id);

    if (!challenge) return challenge;

    const [challenger, challenged] = await Promise.all([
      ctx.db.get(challenge.challengerId),
      ctx.db.get(challenge.challengedId)
    ]);
    if (!challenger) return null;

    return { ...challenge, challenger: challenger!, challenged: challenged! };
  }
});
