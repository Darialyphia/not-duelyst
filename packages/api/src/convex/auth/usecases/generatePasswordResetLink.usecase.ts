import { generateRandomString, isWithinExpiration } from 'lucia/utils';
import { internalAction, mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { ensureUserByEmail } from '../../users/user.utils';
import { internal } from '../../_generated/api';
import { PASSWORD_TOKEN_EXPIRES_IN } from '../auth.constants';

export const generatePasswordResetLinkUseCase = mutation({
  args: {
    email: v.string()
  },
  async handler(ctx, args) {
    const user = await ensureUserByEmail(ctx, args.email);

    const storedUserTokens = await ctx.db
      .query('password_reset_token')
      .withIndex('by_user_id', q => q.eq('user_id', user._id))
      .collect();

    const validToken = storedUserTokens.find(token => {
      return isWithinExpiration(Number(token.expires) - PASSWORD_TOKEN_EXPIRES_IN / 2);
    });

    let token = validToken?.token;

    if (!token) {
      token = generateRandomString(63);
      await ctx.db.insert('password_reset_token', {
        token,
        expires: new Date().getTime() + PASSWORD_TOKEN_EXPIRES_IN,
        user_id: user._id
      });
    }

    await ctx.scheduler.runAfter(0, internal.auth.sendPasswordResetLink, {
      token,
      email: user.email
    });
  }
});
