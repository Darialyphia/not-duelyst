import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { formatConfigValidator } from '../format.utils';
import { stringify } from 'zipson';

export const updateFormatUsecase = authedMutation({
  args: {
    id: v.id('formats'),
    name: v.string(),
    description: v.string(),
    config: formatConfigValidator,
    cards: v.any()
  },
  async handler(ctx, args) {
    const format = await ctx.db.get(args.id);
    if (!format) throw new Error('Format not found.');

    if (format.authorId !== ctx.user._id) {
      throw new Error('Forbidden');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = args;

    await ctx.db.patch(format._id, { ...data, cards: stringify(data.cards) });
  }
});
