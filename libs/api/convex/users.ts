import { query } from './_generated/server';

export const get = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return undefined;

    return await ctx.db.query('users').collect();
  }
});
