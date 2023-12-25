// eslint-disable-next-line import/no-unresolved
import { internal } from '../_generated/api';
import { Doc, Id } from '../_generated/dataModel';
import type { ActionCtx, MutationCtx } from '../_generated/server';
import { MATCHMAKING_SCHEDULER_INTERVAL_MS } from './matchmaking.constants';

export const getMatchmaking = async (ctx: MutationCtx): Promise<Doc<'matchmaking'>> => {
  let matchmaking = await ctx.db.query('matchmaking').first();
  if (!matchmaking) {
    const id = await ctx.db.insert('matchmaking', {
      nextInvocationId: undefined
    });
    matchmaking = await ctx.db.get(id)!;
  }

  return matchmaking!;
};

export const startMatchmakingIfNeeded = async (ctx: MutationCtx) => {
  const matchmaking = await getMatchmaking(ctx);
  if (!matchmaking.nextInvocationId) {
    console.log('scheduling machmaking');
    const next = await ctx.scheduler.runAfter(0, internal.matchmaking.matchPlayers);
    console.log('scheduled', next);
    await ctx.db.patch(matchmaking._id, { nextInvocationId: next });
  }
};

export const ensureIsInMatchmaking = async ({ db }: MutationCtx, userId: Id<'users'>) => {
  const matchmakingUser = await db
    .query('matchmakingUsers')
    .withIndex('by_userId', q => q.eq('userId', userId))
    .unique();

  if (!matchmakingUser) throw new Error('User is not in matchmaking');

  return matchmakingUser;
};
export const ensureIsNotInMatchmaking = async (
  { db }: MutationCtx,
  userId: Id<'users'>
) => {
  const matchmakingUser = await db
    .query('matchmakingUsers')
    .withIndex('by_userId', q => q.eq('userId', userId))
    .unique();

  if (matchmakingUser) throw new Error('User is already in matchmaking');
};

export const createGameFromMatchmadePair = async (
  ctx: ActionCtx,
  pair: { userId: Id<'users'>; matchmakingUserId: Id<'matchmakingUsers'> }[]
) => {
  const roomId = await ctx.runAction(internal.hathora.getRoomId);
  await ctx.runMutation(internal.matchmaking.handleMatchmadePair, {
    roomId,
    players: pair.map(p => ({
      userId: p.userId,
      matchmakingUserId: p.matchmakingUserId
    }))
  });
};

export const scheduleNextMatchmakingInvocation = async (
  ctx: ActionCtx,
  remaining: number
) => {
  const nextInvocationId =
    remaining > 1
      ? await ctx.scheduler.runAfter(
          MATCHMAKING_SCHEDULER_INTERVAL_MS,
          internal.matchmaking.matchPlayers
        )
      : undefined;

  await ctx.runMutation(internal.matchmaking.setupNextInvocation, {
    schedulerId: nextInvocationId
  });
};
