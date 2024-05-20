import { authedMutation } from '../../auth/auth.utils';

export const completeOnboardingUsecase = authedMutation({
  args: {},
  handler: async ctx => {
    ctx.db.patch(ctx.user._id, { hasOnboarded: true });
  }
});
