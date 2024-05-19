import { mutationWithAuth, ensureAuthenticated } from '../../auth/auth.utils';

export const completeOnboardingUsecase = mutationWithAuth({
  args: {},
  handler: async ctx => {
    const user = ensureAuthenticated(ctx.session);
    ctx.db.patch(user._id, { hasOnboarded: true });
  }
});
