import { api, internal } from './_generated/api';
import { internalAction, internalMutation, mutation, query } from './_generated/server';
import { Matchmaking } from './matchmaking/matchmaking';
import { MatchmakingTestStrategy } from './matchmaking/strategies/test.strategy';
import { ensureUserExists, findMe } from './users/user.utils';
import { ensureAuthenticated } from './utils/auth';
import {
  createGameFromMatchmadePair,
  ensureIsInMatchmaking,
  ensureIsNotInMatchmaking,
  getMatchmaking,
  scheduleNextMatchmakingInvocation,
  startMatchmakingIfNeeded
} from './matchmaking/matchmaking.utils';
import { v } from 'convex/values';
import { ensureHasNoCurrentGame, getGameInitialState } from './game/utils';

export const join = mutation({
  handler: async ctx => {
    const identity = await ensureAuthenticated(ctx);
    const user = await ensureUserExists(ctx, identity.tokenIdentifier);
    await ensureHasNoCurrentGame(ctx, user._id);
    await ensureIsNotInMatchmaking(ctx, user._id);

    const result = await ctx.db.insert('matchmakingUsers', { userId: user!._id });
    await startMatchmakingIfNeeded(ctx);

    return result;
  }
});

export const leave = mutation({
  handler: async ctx => {
    const identity = await ensureAuthenticated(ctx);
    const user = await ensureUserExists(ctx, identity.tokenIdentifier);
    const matchMakingUser = await ensureIsInMatchmaking(ctx, user._id);

    return ctx.db.delete(matchMakingUser._id);
  }
});

export const handleMatchmadePair = internalMutation({
  args: {
    roomId: v.string(),
    players: v.array(
      v.object({
        matchmakingUserId: v.id('matchmakingUsers'),
        userId: v.id('users')
      })
    )
  },
  async handler(ctx, arg) {
    await Promise.all(
      arg.players.map(({ matchmakingUserId }) => ctx.db.delete(matchmakingUserId))
    );

    const { mapId, firstPlayer, status } = await getGameInitialState(
      ctx,
      arg.players.map(p => p.userId)
    );

    const gameId = await ctx.db.insert('games', {
      firstPlayer,
      mapId,
      status,
      roomId: arg.roomId
    });

    await Promise.all(
      arg.players.map(({ userId }) =>
        ctx.db.insert('gamePlayers', {
          gameId,
          userId
        })
      )
    );
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
  console.log('matching players');
  const participants = await ctx.runQuery(api.matchmaking.getMatchmakingUsers);

  const strategy = new MatchmakingTestStrategy();
  const { pairs, remaining } = new Matchmaking(participants, strategy).makePairs();
  console.log(pairs);
  await Promise.allSettled(
    pairs.map(pair =>
      createGameFromMatchmadePair(
        ctx,
        pair.map(p => ({
          userId: p._id,
          matchmakingUserId: p.matchmakingUserId
        }))
      )
    )
  );

  await scheduleNextMatchmakingInvocation(ctx, remaining.length);
});
