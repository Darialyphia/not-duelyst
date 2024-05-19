import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { mutationWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { FEATURE_FLAGS } from '../../featureFlags/featureFlags.constants';
import { getFeatureFlag } from '../../featureFlags/featureFlags.utils';
import { ensureAuthorized } from '../../utils/ability';
import { createUserAbility } from '../user.ability';
import { generateDiscriminator, DEFAULT_MMR } from '../user.utils';

export const completeSignupUsecase = mutationWithAuth({
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
    } else {
      scheduler.runAfter(0, internal.collection.grantBasicCards, { userId: user._id });
    }

    return updatedUser;
  }
});
