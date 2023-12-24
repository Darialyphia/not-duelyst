import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { ensureAuthenticated } from './utils/auth';
import { createUserAbility } from './users/user.ability';
import { ensureAuthorized } from './utils/ability';
import { DEFAULT_MMR, findMe, generateDiscriminator } from './users/user.utils';
import { toUserDto } from './users/user.mapper';

export const get = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return undefined;

    return await ctx.db.query('users').collect();
  }
});

export const signUp = mutation({
  args: {
    name: v.string()
  },
  handler: async ({ auth, db }, { name }) => {
    const identity = await ensureAuthenticated({ auth });
    const userAbility = await createUserAbility({ auth, db });
    await ensureAuthorized(userAbility.can('create', 'user'));

    return db.insert('users', {
      name: name,
      discriminator: await generateDiscriminator({ db }, name),
      tokenIdentifier: identity.tokenIdentifier,
      mmr: DEFAULT_MMR
    });
  }
});

export const me = query({
  handler: async ctx => {
    const user = await findMe(ctx);
    if (!user) return null;

    return toUserDto(user);
  }
});
