import { v } from 'convex/values';
import { query } from '../../_generated/server';
import { toGameDetailsDto } from '../game.mapper';
import { getGameById } from '../game.utils';

export const getGameReplayUsecase = query({
  args: { gameId: v.id('games') },
  async handler(ctx, args) {
    const replay = await ctx.db
      .query('gameReplays')
      .withIndex('by_game_id', q => q.eq('gameId', args.gameId))
      .unique();

    if (!replay) throw new Error('Replay not found.');

    const game = await getGameById(ctx, replay.gameId);
    if (!game) throw new Error('Game not found.');

    return {
      game: toGameDetailsDto(game),
      replay: replay.replay,
      initialState: replay.initialState
    };
  }
});
