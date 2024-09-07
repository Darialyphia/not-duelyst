import { authedQuery } from '../../auth/auth.utils';
import { getFormatWithAuthor } from '../format.utils';
import { toGameFormatDto } from '../format.mapper';
import { v } from 'convex/values';

export const getFormatByIdUseCase = authedQuery({
  args: {
    id: v.id('formats')
  },
  async handler(ctx, args) {
    const format = await ctx.db.get(args.id);
    if (!format) throw new Error('Format not found.');

    return toGameFormatDto(await getFormatWithAuthor(ctx.db, format));
  }
});
