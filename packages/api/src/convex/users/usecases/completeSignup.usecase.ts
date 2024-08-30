import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { authedMutation } from '../../auth/auth.utils';
import { FEATURE_FLAGS } from '../../featureFlags/featureFlags.constants';
import { getFeatureFlag } from '../../featureFlags/featureFlags.utils';
import { ensureAuthorized } from '../../utils/ability.utils';
import { createUserAbility } from '../user.ability';
import { generateDiscriminator, DEFAULT_MMR, slugify } from '../user.utils';

export const completeSignupUsecase = authedMutation({
  args: {
    name: v.string()
  },
  handler: async ({ user, session, db, scheduler }, { name }) => {
    const userAbility = await createUserAbility(session);
    await ensureAuthorized(userAbility.can('create', 'user'));

    const discriminator = await generateDiscriminator({ db }, name);
    const slug = slugify(`${name}-${discriminator}`);
    const updatedUser = await db.patch(user._id, {
      name: name,
      discriminator: discriminator,
      slug,
      mmr: DEFAULT_MMR
    });

    const grantCollection = await getFeatureFlag(
      db,
      FEATURE_FLAGS.GRANT_COLLECTION_ON_SIGNUP
    );

    if (grantCollection) {
      scheduler.runAfter(0, internal.collection.grantAllCollection, {
        userId: user._id
      });
    } else {
      scheduler.runAfter(0, internal.collection.grantBasicCards, {
        userId: user._id
      });
    }

    return updatedUser;
  }
});
