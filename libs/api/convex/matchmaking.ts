import { internal } from './_generated/api';
import { internalMutation, mutation } from './_generated/server';
import { Matchmaking } from './matchmaking/matchmaking';
import { MatchmakingTestStrategy } from './matchmaking/strategies/test.strategy';
import { findMe } from './users/user.utils';
import { ensureAuthenticated } from './utils/auth';
import { getMatchmaking } from './matchmaking/matchmaking.utils';
import { randomInt } from '@hc/shared';

export const join = mutation({
  handler: async ctx => {
    await ensureAuthenticated(ctx);
    const user = await findMe(ctx);
    if (!user) return null;

    const currentGameUser = await ctx.db
      .query('gamePlayers')
      .withIndex('by_creation_time')
      .filter(q => q.eq(q.field('userId'), user._id))
      .order('desc')
      .first();
    if (currentGameUser) throw new Error('Already in game');

    const matchmaking = await getMatchmaking(ctx);

    const matchmakingUser = await ctx.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', user!._id))
      .unique();

    if (matchmakingUser) throw new Error('Already in matchmaking');

    const result = await ctx.db.insert('matchmakingUsers', { userId: user!._id });

    if (!matchmaking.nextInvocationId) {
      const next = await ctx.scheduler.runAfter(0, internal.matchmaking.matchPlayers);
      await ctx.db.patch(matchmaking._id, { nextInvocationId: next });
    }

    return result;
  }
});

export const leave = mutation({
  handler: async ctx => {
    await ensureAuthenticated(ctx);
    const user = await findMe(ctx);

    const matchMakingUser = await ctx.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', user!._id))
      .unique();

    if (!matchMakingUser) throw new Error('Not in matchmaking');

    return ctx.db.delete(matchMakingUser._id);
  }
});

export const matchPlayers = internalMutation(async ctx => {
  const matchmakingUsers = await ctx.db.query('matchmakingUsers').collect();

  const participants = await Promise.all(
    matchmakingUsers.map(async user => ({
      matchmakingUserId: user._id,
      ...(await ctx.db.get(user.userId))!
    }))
  );
  const strategy = new MatchmakingTestStrategy();
  const { pairs, remaining } = new Matchmaking(participants, strategy).makePairs();

  await Promise.all(pairs.flat().map(player => ctx.db.delete(player.matchmakingUserId)));

  const maps = await ctx.db.query('gameMaps').collect();
  for (const pair of pairs) {
    const firstPlayerIndex = Math.round(Math.random());
    const mapIndex = randomInt(maps.length - 1);

    const gameId = await ctx.db.insert('games', {
      firstPlayer: pair[firstPlayerIndex]._id,
      mapId: maps[mapIndex]._id,
      status: 'WAITING_FOR_PLAYERS'
    });

    await Promise.all(
      pair.map(player =>
        ctx.db.insert('gamePlayers', {
          gameId,
          userId: player._id
        })
      )
    );
  }

  for (const player of remaining) {
    // @TODO
  }

  const matchmaking = await getMatchmaking(ctx);

  if (remaining.length > 1) {
    const next = await ctx.scheduler.runAfter(0, internal.matchmaking.matchPlayers);
    await ctx.db.patch(matchmaking._id, { nextInvocationId: next });
  } else {
    await ctx.db.patch(matchmaking._id, { nextInvocationId: undefined });
  }
});
