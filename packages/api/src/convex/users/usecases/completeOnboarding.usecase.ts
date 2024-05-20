import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { getGlobalStats } from '../../analytics/analytics.utils';
import { CARDS, FACTIONS } from '@game/sdk';

export const completeOnboardingUsecase = authedMutation({
  args: {
    skippedTutorial: v.boolean()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(ctx.user._id, { hasOnboarded: true });
    const globalStats = await getGlobalStats(ctx);

    globalStats.users.count++;
    if (args.skippedTutorial) {
      globalStats.users.skippedTutorial++;
    }

    await ctx.db.replace(globalStats._id, globalStats);

    await ctx.db.insert('userProfiles', {
      userId: ctx.user._id,
      stats: {
        totalGames: 0,
        averageGameDuration: 0,
        gamesByFaction: Object.fromEntries(
          Object.values(FACTIONS).map(f => [f.id, { played: 0, won: 0 }])
        ),
        gamesByCard: Object.fromEntries(
          Object.keys(CARDS).map(f => [f, { played: 0, won: 0 }])
        )
      }
    });
    return true;
  }
});
