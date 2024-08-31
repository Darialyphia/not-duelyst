import { isDefined } from '@game/shared';
import { queryWithAuth } from '../../auth/auth.utils';
import { toGameDto } from '../game.mapper';
import { getGameById } from '../game.utils';

export const getLatestGamesWithReplaysUsecase = queryWithAuth({
  args: {},
  async handler(ctx) {
    const replays = await ctx.db
      .query('gameReplays')
      .withIndex('by_creation_time')
      .order('desc')
      .take(15);

    const games = await Promise.all(
      replays.map(async replay => {
        try {
          return await getGameById(ctx, replay.gameId);
        } catch (err) {
          return null;
        }
      })
    );

    return games
      .filter(isDefined)
      .filter(g => !g.private)
      .map(toGameDto);
  }
});
