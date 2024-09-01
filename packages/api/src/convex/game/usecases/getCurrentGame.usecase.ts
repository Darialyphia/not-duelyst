import { authedQuery } from '../../auth/auth.utils';
import { toGameDetailsDto } from '../game.mapper';
import { getCurrentGame } from '../game.utils';

export const getCurrentGameUsecase = authedQuery({
  args: {},
  handler: async ctx => {
    const game = await getCurrentGame({ db: ctx.db }, ctx.user._id);
    if (!game) return null;
    return toGameDetailsDto(game);
  }
});
