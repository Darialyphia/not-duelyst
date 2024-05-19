import { isDefined } from '@game/shared';
import { v } from 'convex/values';
import { stringify } from 'zipson/lib';
import { internalMutation } from '../../_generated/server';
import { queryWithAuth } from '../../auth/auth.utils';
import { toGameDto } from '../game.mapper';
import { getGameById, getReplayInitialState } from '../game.utils';

export const getLatestGamesWithReplaysUsecase = queryWithAuth({
  args: {},
  async handler(ctx) {
    const replays = await ctx.db
      .query('gameReplays')
      .withIndex('by_creation_time')
      .order('desc')
      .take(15);

    const games = await Promise.all(
      replays.map(replay => getGameById(ctx, replay.gameId))
    );

    return games.filter(isDefined).map(toGameDto);
  }
});

export const createReplay = internalMutation({
  args: {
    gameId: v.id('games'),
    replay: v.string()
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    return ctx.db.insert('gameReplays', {
      ...args,
      initialState: stringify(await getReplayInitialState(ctx, game!))
    });
  }
});
