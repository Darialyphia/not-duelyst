import { api, internal } from './_generated/api';
import { internalAction, internalMutation, mutation, query } from './_generated/server';
import { Matchmaking } from './matchmaking/matchmaking';
import { MatchmakingTestStrategy } from './matchmaking/strategies/test.strategy';
import { findMe } from './users/user.utils';
import { ensureAuthenticated } from './utils/auth';
import { getMatchmaking } from './matchmaking/matchmaking.utils';
import { v } from 'convex/values';

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

export const internalLeave = internalMutation({
  args: {
    playersIds: v.array(v.id('matchmakingUsers'))
  },
  handler(ctx, arg) {
    return Promise.all(arg.playersIds.map(id => ctx.db.delete(id)));
  }
});

export const getMatchmakingUsers = query(async ctx => {
  const users = await ctx.db.query('matchmakingUsers').collect();

  return await Promise.all(
    users.map(async user => ({
      matchmakingUserId: user._id,
      ...(await ctx.db.get(user.userId))!
    }))
  );
});

export const setupNextInvocation = internalMutation({
  args: {
    schedulerId: v.optional(v.id('_scheduled_functions'))
  },
  async handler(ctx, arg) {
    const matchmaking = await getMatchmaking(ctx);
    await ctx.db.patch(matchmaking._id, { nextInvocationId: arg.schedulerId });
  }
});

export const matchPlayers = internalAction(async ctx => {
  const participants = await ctx.runQuery(api.matchmaking.getMatchmakingUsers);

  const strategy = new MatchmakingTestStrategy();
  const { pairs, remaining } = new Matchmaking(participants, strategy).makePairs();

  await Promise.allSettled(
    pairs.map(async pair => {
      await ctx.runMutation(internal.matchmaking.internalLeave, {
        playersIds: pair.map(p => p.matchmakingUserId)
      });
      const roomId = await ctx.runAction(internal.games.getRoomId);
      await ctx.runMutation(internal.games.create, {
        playersIds: [pair[0]._id, pair[1]._id],
        roomId
      });
    })
  );

  await ctx.runMutation(internal.matchmaking.setupNextInvocation, {
    schedulerId:
      remaining.length > 1
        ? await ctx.scheduler.runAfter(0, internal.matchmaking.matchPlayers)
        : undefined
  });
});
