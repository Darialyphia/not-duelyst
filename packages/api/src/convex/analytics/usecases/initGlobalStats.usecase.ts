import { internalMutation } from '../../_generated/server';
import { difference } from 'lodash-es';
import { CARDS, FACTIONS } from '@game/sdk';

export const initGlobalStatsUsecase = internalMutation(async ctx => {
  const exists = await ctx.db.query('globalStats').first();
  if (exists) {
    const missingCards = difference(Object.keys(CARDS), Object.keys(exists.gamesByCard));
    const missingFactions = difference(
      Object.values(FACTIONS).map(f => f.id),
      Object.keys(exists.gamesByFaction)
    );

    return ctx.db.patch(exists._id, {
      gamesByFaction: {
        ...exists.gamesByFaction,
        ...Object.fromEntries(missingFactions.map(f => [f, { played: 0, won: 0 }]))
      },
      gamesByCard: {
        ...exists.gamesByCard,
        ...Object.fromEntries(missingCards.map(f => [f, { played: 0, won: 0 }]))
      }
    });
  } else {
    return ctx.db.insert('globalStats', {
      gamesByFaction: Object.fromEntries(
        Object.values(FACTIONS).map(f => [f.id, { played: 0, won: 0 }])
      ),
      gamesByCard: Object.fromEntries(
        Object.keys(CARDS).map(f => [f, { played: 0, won: 0 }])
      ),
      averageGameDuration: 0,
      totalGames: 0,
      users: {
        count: 0,
        skippedTutorial: 0
      }
    });
  }
});
