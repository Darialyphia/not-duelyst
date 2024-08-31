import { v } from 'convex/values';
import { internalMutation } from '../../_generated/server';
import { createGame } from '../../game/game.utils';

export const createChallengeGameUsecase = internalMutation({
  args: {
    roomId: v.string(),
    challengeId: v.id('friendlyChallenges')
  },
  async handler(ctx, args) {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) return;

    const matchmakingusers = await ctx.db
      .query('matchmakingUsers')
      .filter(q =>
        q.or(
          q.eq(q.field('userId'), challenge.challengedId),
          q.eq(q.field('userId'), challenge.challengerId)
        )
      )
      .collect();
    await Promise.all(
      matchmakingusers.map(mu => {
        if (mu) return ctx.db.delete(mu._id);
      })
    );

    await createGame(ctx, {
      roomId: args.roomId,
      players: [
        {
          userId: challenge.challengedId,
          loadoutId: challenge.challengedLoadoutId!
        },
        {
          userId: challenge.challengerId,
          loadoutId: challenge.challengerLoadoutId!
        }
      ],
      private: true
    });

    await ctx.db.delete(args.challengeId);
  }
});
