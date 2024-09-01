import { v, ConvexError } from 'convex/values';
import { LuciaError } from 'lucia';
import type { Id } from '../../_generated/dataModel';
import { DEFAULT_MMR } from '../../users/user.utils';
import { mutationWithAuth } from '../auth.utils';
import { getFeatureFlag } from '../../featureFlags/featureFlags.utils';
import { FEATURE_FLAGS } from '../../featureFlags/featureFlags.constants';

export const signupUsecase = mutationWithAuth({
  args: {
    email: v.string(),
    password: v.string()
  },
  handler: async (ctx, { email, password }) => {
    try {
      const tutorialEnabled = await getFeatureFlag(ctx.db, FEATURE_FLAGS.TUTORIAL);
      const user = await ctx.auth.createUser({
        key: {
          password: password,
          providerId: 'password',
          providerUserId: email
        },
        attributes: {
          email,
          avatar: '/assets/portraits/tree.jpg',
          hasOnboarded: !tutorialEnabled,
          mmr: DEFAULT_MMR,
          presence: 'offline',
          _id: '' as Id<'users'>,
          _creationTime: 0
        }
      });
      const session = await ctx.auth.createSession({
        userId: user.userId,
        attributes: {
          _id: '' as Id<'sessions'>,
          _creationTime: 0
        }
      });
      return { sessionId: session.sessionId };
    } catch (err) {
      if (err instanceof LuciaError && err.message === 'AUTH_DUPLICATE_KEY_ID') {
        throw new ConvexError('An account associated with this email already exists.');
      }
      console.log(err);
      throw new ConvexError('Something went wrong. Please retry.');
    }
  }
});
