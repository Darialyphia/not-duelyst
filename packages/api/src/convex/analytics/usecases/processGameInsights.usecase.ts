import { v, Validator } from 'convex/values';
import { mutation } from '../../_generated/server';
import { GAME_ANALYTICS_EVENTS, type GameAnalyticsEvent } from '../analytics.utils';
import { match } from 'ts-pattern';
import { CARD_KINDS, CARDS } from '@game/sdk';

export const procesGameInsightsUsecase = mutation({
  args: {
    events: v.array(
      v.object({
        type: v.literal(GAME_ANALYTICS_EVENTS.GAME_ENDED)
      }) as Validator<GameAnalyticsEvent>
    )
  },
  async handler(ctx, args) {
    const globalStats = await ctx.db.query('globalStats').first();
    if (!globalStats) {
      throw new Error('global stats not initialized !');
    }

    args.events.forEach(event => {
      match(event)
        .with({ type: GAME_ANALYTICS_EVENTS.GAME_ENDED }, ({ payload }) => {
          payload.players.forEach(player => {
            const isWinner = payload.winnerId === player.id;
            const cards = player.loadout.map(id => CARDS[id]);
            const general = cards.find(card => card.kind === CARD_KINDS.MINION)!;
            const faction = general.factions[0]!.id;
            globalStats.gamesByFaction[faction].played++;
            if (isWinner) {
              globalStats.gamesByFaction[faction].won++;
            }

            cards.forEach(card => {
              globalStats.gamesByCard[card.id].played++;
              if (isWinner) {
                globalStats.gamesByFaction[faction].won++;
              }
            });
          });

          globalStats.averageGameDuration =
            (globalStats.averageGameDuration * globalStats.totalGames +
              payload.duration) /
            ++globalStats.totalGames;
        })
        .exhaustive();
    });

    return ctx.db.replace(globalStats._id, globalStats);
  }
});
