import { v } from 'convex/values';
import { internalAction } from '../../_generated/server';
import { internal } from '../../_generated/api';

export const internalSetupChallengeGame = internalAction({
  args: {
    challengeId: v.id('friendlyChallenges')
  },
  async handler(ctx, args) {
    const roomId = await ctx.runAction(internal.hathora.getRoomId);
    await ctx.runMutation(internal.friends.createChallengeGame, {
      roomId,
      challengeId: args.challengeId
    });
  }
});
