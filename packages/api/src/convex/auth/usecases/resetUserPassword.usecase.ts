import { v } from 'convex/values';
import { mutationWithAuth } from '../auth.utils';
import { isWithinExpiration } from 'lucia/utils';
import type { Id } from '../../_generated/dataModel';

export const resetUserPasswordUsecase = mutationWithAuth({
  args: {
    token: v.string(),
    password: v.string()
  },
  async handler(ctx, args) {
    const storedToken = await ctx.db
      .query('password_reset_token')
      .withIndex('by_token', q => q.eq('token', args.token))
      .unique();
    if (!storedToken) throw new Error('Invalid token');

    await ctx.db.delete(storedToken._id);

    if (!isWithinExpiration(Number(storedToken.expires))) {
      throw new Error('Expired token');
    }

    const user = await ctx.db.get(storedToken.user_id);

    await ctx.auth.invalidateAllUserSessions(user!._id);
    const key = await ctx.auth.updateKeyPassword('password', user!.email, args.password);

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
