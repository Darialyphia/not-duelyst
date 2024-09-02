import { v } from 'convex/values';
import { mutation } from '../../_generated/server';
import {
  GAME_ANALYTICS_EVENTS,
  getGlobalStats,
  type GameAnalyticsEvent
} from '../analytics.utils';
import { match } from 'ts-pattern';
import { CARD_KINDS, CARDS } from '@game/sdk';
import { getGamePlayers } from '../../game/game.utils';
import { isDefined } from '@game/shared';
import { getFeatureFlag } from '../../featureFlags/featureFlags.utils';
import { FEATURE_FLAGS } from '../../featureFlags/featureFlags.constants';

export const procesGameInsightsUsecase = mutation({
  args: {
    gameId: v.id('games'),
    events: v.array(
      v.object({
        type: v.literal(GAME_ANALYTICS_EVENTS.GAME_ENDED),
        payload: v.any()
      })
    )
  },
  async handler(ctx, args) {
    const isEnabled = await getFeatureFlag(ctx.db, FEATURE_FLAGS.ANALYTICS);
    if (!isEnabled) return;

    const globalStats = await getGlobalStats(ctx);

    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error('Game not found.');
    }
    const players = await getGamePlayers(ctx, game);
    const profiles = (
      await Promise.all(
        players.map(p =>
          ctx.db
            .query('userProfiles')
            .withIndex('by_user_id', q => q.eq('userId', p._id))
            .first()
        )
      )
    ).filter(isDefined);
    if (players.length !== profiles.length) {
      throw new Error("Players profiles haven't been initialized !");
    }

    (args.events as GameAnalyticsEvent[]).forEach(event => {
      match(event)
        .with({ type: GAME_ANALYTICS_EVENTS.GAME_ENDED }, ({ payload }) => {
          payload.players.forEach(player => {
            const isWinner = payload.winnerId === player.id;
            const cards = player.loadout.map(id => CARDS[id]);
            const general = cards.find(card => card.kind === CARD_KINDS.GENERAL);
            const faction = general!.faction!;
            const profile = profiles.find(profile => profile?.userId === player.id)!;

            globalStats.gamesByFaction[faction].played++;
            profile.stats.gamesByFaction[faction].played++;
            if (isWinner) {
              profile.stats.gamesByFaction[faction].won++;
              globalStats.gamesByFaction[faction].won++;
            }

            cards.forEach(card => {
              profile.stats.gamesByCard[card.id].played++;
              globalStats.gamesByCard[card.id].played++;
              if (isWinner) {
                profile.stats.gamesByCard[card.id].won++;
                globalStats.gamesByFaction[faction].won++;
              }
            });
            profile.stats.averageGameDuration =
              (profile.stats.averageGameDuration * profile.stats.totalGames +
                payload.duration) /
              ++profile.stats.totalGames;
          });

          globalStats.averageGameDuration =
            (globalStats.averageGameDuration * globalStats.totalGames +
              payload.duration) /
            ++globalStats.totalGames;
        })
        .exhaustive();
    });

    await Promise.all([
      ctx.db.replace(globalStats._id, globalStats),
      ...profiles.map(profile => ctx.db.replace(profile._id, profile))
    ]);
  }
});
