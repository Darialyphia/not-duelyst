import { queryWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { toUserDto } from '../user.mapper';

export const getMeUsecase = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = ensureAuthenticated(ctx.session);

    return toUserDto(user);
  }
});
