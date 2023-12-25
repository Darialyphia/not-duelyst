import { query } from './_generated/server';
import { toUserDto } from './users/user.mapper';
import { findMe } from './users/user.utils';
import { ensureAuthenticated } from './utils/auth';

export const getCurrent = query(async ctx => {
  await ensureAuthenticated(ctx);
  const user = await findMe(ctx);

  const currentGameUser = await ctx.db
    .query('gamePlayers')
    .withIndex('by_creation_time')
    .filter(q => q.eq(q.field('userId'), user!._id))
    .order('desc')
    .first();

  if (!currentGameUser) return null;

  const game = await ctx.db.get(currentGameUser?.gameId);
  if (!game) return null;

  const gamePlayers = await ctx.db
    .query('gamePlayers')
    .withIndex('by_game_id', q => q.eq('gameId', game?._id))
    .collect();

  return {
    ...game,
    players: await Promise.all(
      gamePlayers.map(async gamePlayer => {
        const user = await ctx.db.get(gamePlayer.userId);
        return toUserDto(user!);
      })
    )
  };
});
