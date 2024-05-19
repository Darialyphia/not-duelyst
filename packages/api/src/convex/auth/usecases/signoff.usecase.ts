import { mutationWithAuth } from '../auth.utils';

export const signoffUsecase = mutationWithAuth({
  args: {},
  handler: async ctx => {
    if (ctx.session) {
      await ctx.auth.invalidateSession(ctx.session.sessionId);
    }

    return null;
  }
});
