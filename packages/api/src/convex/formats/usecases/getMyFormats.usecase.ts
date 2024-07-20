import { authedQuery } from '../../auth/auth.utils';
import { getFormatsByAuthor } from '../format.utils';
import { toGameFormatDto } from '../format.mapper';

export const getMyFormatsUseCase = authedQuery({
  args: {},
  async handler(ctx) {
    const formats = await getFormatsByAuthor(ctx.db, ctx.user._id);
    return formats.map(toGameFormatDto);
  }
});
