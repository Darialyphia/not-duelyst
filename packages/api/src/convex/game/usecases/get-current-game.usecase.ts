import { queryWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { getCurrentGame } from '../game.utils';

export const getCurrentGameUsecase = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = ensureAuthenticated(ctx.session);

    return getCurrentGame({ db: ctx.db }, user._id);
  }
});
