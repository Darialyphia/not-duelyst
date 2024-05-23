import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { mutationWithAuth } from '../auth.utils';

export const signinUsecase = mutationWithAuth({
  args: {
    email: v.string(),
    password: v.string()
  },
  handler: async (ctx, { email, password }) => {
    const key = await ctx.auth.useKey('password', email, password);
    const session = await ctx.auth.createSession({
      userId: key.userId,
      attributes: {
        // These will be filled out by Convex
        _id: '' as Id<'sessions'>,
        _creationTime: 0
      }
    });

    return {
      sessionId: session.sessionId,
      expiresAt: session.activePeriodExpiresAt.getTime()
    };
  }
});
