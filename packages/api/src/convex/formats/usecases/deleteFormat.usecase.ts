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

    const loadouts = await ctx.db
      .query('loadouts')
      .withIndex('by_format_id', q => q.eq('formatId', args.id))
      .collect();

    await Promise.all(
      loadouts.map(loadout => ctx.db.patch(loadout._id, { formatId: undefined }))
    );
  }
});
