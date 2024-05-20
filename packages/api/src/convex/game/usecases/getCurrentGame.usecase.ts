import { authedQuery } from '../../auth/auth.utils';
import { getCurrentGame } from '../game.utils';

export const getCurrentGameUsecase = authedQuery({
  args: {},
  handler: async ctx => {
    return getCurrentGame({ db: ctx.db }, ctx.user._id);
  }
});
