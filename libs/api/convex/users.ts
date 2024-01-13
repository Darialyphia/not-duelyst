import { v } from 'convex/values';
import { query, mutation, internalQuery } from './_generated/server';
import { ensureAuthenticated } from './utils/auth';
import { createUserAbility } from './users/user.ability';
import { ensureAuthorized } from './utils/ability';
import { DEFAULT_MMR, generateDiscriminator } from './users/user.utils';
import { mutationWithAuth, queryWithAuth } from './auth/auth.utils';

export const completeSignUp = mutationWithAuth({
  args: {
    name: v.string()
  },
  handler: async ({ session, db }, { name }) => {
    const userAbility = await createUserAbility(session);
    await ensureAuthorized(userAbility.can('create', 'user'));

    return db.patch(session?.user_id, {
      name: name,
      discriminator: await generateDiscriminator({ db }, name),
      mmr: DEFAULT_MMR
    });
  }
});

export const me = queryWithAuth({
  args: {},
  handler: async ctx => {
    return ctx.session?.user;
  }
});

export const all = internalQuery(({ db }) => db.query('users').collect());
