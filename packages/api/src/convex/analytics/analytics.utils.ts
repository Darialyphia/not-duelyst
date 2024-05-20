import type { Id } from '../_generated/dataModel';
import type { CardBlueprintId } from '@game/sdk/src/card/card';
import type { MutationCtx, QueryCtx } from '../_generated/server';

export const GAME_ANALYTICS_EVENTS = {
  GAME_ENDED: 'game_ended'
} as const;

export type GameAnalyticsEvent = {
  type: typeof GAME_ANALYTICS_EVENTS.GAME_ENDED;
  payload: {
    players: Array<{
      id: Id<'users'>;
      loadout: CardBlueprintId[];
    }>;
    winnerId: Id<'users'>;
    duration: number;
  };
};

export const getGlobalStats = async ({ db }: { db: QueryCtx['db'] }) => {
  const globalStats = await db.query('globalStats').first();
  if (!globalStats) {
    throw new Error(
      'Global stats are not initialized ! You probaly need to run analytics.init() in the Convex dashboard.'
    );
  }

  return globalStats;
};
