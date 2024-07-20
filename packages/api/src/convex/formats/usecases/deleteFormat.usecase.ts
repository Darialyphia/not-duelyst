import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';

export const deleteFormatUsecase = authedMutation({
  args: {
    id: v.id('formats')
  },
  async handler(ctx, args) {
    const format = await ctx.db.get(args.id);
    if (!format) throw new Error('Format not found.');

    if (format.authorId !== ctx.user._id) {
      throw new Error('Forbidden');
    }

    await ctx.db.delete(format._id);
  }
});
