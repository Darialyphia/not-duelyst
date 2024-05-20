import { authedQuery } from '../../auth/auth.utils';
import { toUserDto } from '../user.mapper';

export const getMeUsecase = authedQuery({
  args: {},
  handler: async ctx => {
    return toUserDto(ctx.user);
  }
});
