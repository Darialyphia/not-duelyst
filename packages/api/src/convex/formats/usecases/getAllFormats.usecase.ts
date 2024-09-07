import { authedQuery } from '../../auth/auth.utils';
import { getFormatWithAuthor } from '../format.utils';
import { toGameFormatDto } from '../format.mapper';

export const getAllFormatsUseCase = authedQuery({
  args: {},
  async handler(ctx) {
    const formats = await ctx.db.query('formats').collect();

    const populated = await Promise.all(
      formats.map(format => getFormatWithAuthor(ctx.db, format))
    );

    return populated.map(toGameFormatDto);
  }
});
