// eslint-disable-next-line import/no-unresolved
import { Doc } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';

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
