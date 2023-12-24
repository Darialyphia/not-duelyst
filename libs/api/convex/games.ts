import { query } from './_generated/server';
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

  return ctx.db.get(currentGameUser?.gameId);
});
