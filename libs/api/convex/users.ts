import { v } from 'convex/values';
import { query, mutation, internalQuery } from './_generated/server';
import { createUserAbility } from './users/user.ability';
import { ensureAuthorized } from './utils/ability';
import { DEFAULT_MMR, generateDiscriminator } from './users/user.utils';
import { ensureAuthenticated, mutationWithAuth, queryWithAuth } from './auth/auth.utils';
import { toUserDto } from './users/user.mapper';

export const completeSignUp = mutationWithAuth({
  args: {
    name: v.string()
  },
  handler: async ({ session, db }, { name }) => {
    const user = ensureAuthenticated(session);

    const userAbility = await createUserAbility(session);
    await ensureAuthorized(userAbility.can('create', 'user'));

    return db.patch(user._id, {
      name: name,
      discriminator: await generateDiscriminator({ db }, name),
      mmr: DEFAULT_MMR
    });
  }
});

export const me = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = ensureAuthenticated(ctx.session);

    return toUserDto(user);
  }
});

export const all = internalQuery(({ db }) => db.query('users').collect());
