import { authedQuery } from '../../auth/auth.utils';
import { getCurrentLobby } from '../../lobby/lobby.utils';
import { toMeDto } from '../user.mapper';

export const getMeUsecase = authedQuery({
  args: {},
  handler: async ctx => {
    const lobby = await getCurrentLobby(ctx, ctx.user._id);
    const res = toMeDto({
      ...ctx.user,
      lobby: lobby ?? undefined
    });
    return res;
  }
});
