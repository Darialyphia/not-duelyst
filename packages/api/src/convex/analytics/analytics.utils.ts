import type { Id } from '../_generated/dataModel';
import type { CardBlueprintId } from '@game/sdk/src/card/card';

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
