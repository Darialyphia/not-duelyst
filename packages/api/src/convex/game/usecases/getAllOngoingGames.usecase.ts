import { query } from '../../_generated/server';
import { GAME_STATUS } from '../game.constants';
import { toGameDto } from '../game.mapper';
import { getGamePlayers } from '../game.utils';

export const getAllOngoingGamesUsecase = query(async ctx => {
  const games = await ctx.db
    .query('games')
    .withIndex('by_status', q => q.eq('status', GAME_STATUS.ONGOING))
    .filter(q => q.eq(q.field('private'), false))
    .collect();

  return Promise.all(
    games.map(async game => {
      return toGameDto({
        ...game,
        players: await getGamePlayers(ctx, game)
      });
    })
  );
});
