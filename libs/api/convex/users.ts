import { v } from 'convex/values';
import { query, mutation, internalQuery } from './_generated/server';
import { createUserAbility } from './users/user.ability';
import { ensureAuthorized } from './utils/ability';
import { DEFAULT_MMR, generateDiscriminator } from './users/user.utils';
import { ensureAuthenticated, mutationWithAuth, queryWithAuth } from './auth/auth.utils';
import { toUserDto } from './users/user.mapper';
import { getFeatureFlag } from './featureFlags/featureFlags.utils';
import { FEATURE_FLAGS } from './featureFlags/featureFlags.constants';
import { internal } from './_generated/api';

export const completeSignUp = mutationWithAuth({
  args: {
    name: v.string()
  },
  handler: async ({ session, db, scheduler }, { name }) => {
    const user = ensureAuthenticated(session);

    const userAbility = await createUserAbility(session);
    await ensureAuthorized(userAbility.can('create', 'user'));

    const updatedUser = await db.patch(user._id, {
      name: name,
      discriminator: await generateDiscriminator({ db }, name),
      mmr: DEFAULT_MMR
    });

    const grantCollection = await getFeatureFlag(
      db,
      FEATURE_FLAGS.GRANT_COLLECTION_ON_SIGNUP
    );

    if (grantCollection) {
      scheduler.runAfter(0, internal.collection.grantAllCollection, { userId: user._id });
    }

    return updatedUser;
  }
});

export const me = queryWithAuth({
  args: {},
  handler: async (ctx, args) => {
    console.log(ctx.session, args);
    const user = ensureAuthenticated(ctx.session);

    return toUserDto(user);
  }
});

export const all = internalQuery(({ db }) => db.query('users').collect());
