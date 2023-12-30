import { internal } from './_generated/api';
import { query, mutation, internalMutation, action } from './_generated/server';
import { toUserDto } from './users/user.mapper';
import { findMe } from './users/user.utils';
import { ensureAuthenticated } from './utils/auth';
import { v } from 'convex/values';

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

export const start = mutation({
  args: {
    gameId: v.id('games')
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error('Not Found');
    if (game?.status !== 'WAITING_FOR_PLAYERS') {
      throw new Error('Game is already started');
    }

    return ctx.db.patch(game._id, { status: 'ONGOING' });
  }
});

export const destroy = internalMutation({
  args: {
    gameId: v.id('games'),
    winnerId: v.id('users')
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error('Game Not Found');
    if (game?.status !== 'ONGOING') {
      throw new Error('Game is not ongoing');
    }

    const gamePlayer = await ctx.db
      .query('gamePlayers')
      .withIndex('by_user_id', q => q.eq('userId', args.winnerId))
      .filter(q => q.eq(q.field('gameId'), args.gameId))
      .unique();

    await ctx.db.patch(game._id, { status: 'FINISHED', winnerId: gamePlayer!._id });

    return game;
  }
});

export const end = action({
  args: {
    gameId: v.id('games'),
    winnerId: v.id('users')
  },
  async handler(ctx, args) {
    const game = await ctx.runMutation(internal.games.destroy, args);

    await ctx.runAction(internal.hathora.destroyRoom, { roomId: game.roomId });
  }
});
