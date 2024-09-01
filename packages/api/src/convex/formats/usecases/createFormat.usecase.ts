import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { formatConfigValidator } from '../format.utils';
import { stringify } from 'zipson';

export const createFormatUsecase = authedMutation({
  args: {
    name: v.string(),
    description: v.string(),
    config: formatConfigValidator,
    cards: v.any()
  },
  async handler(ctx, args) {
    const format = await ctx.db.insert('formats', {
      ...args,
      authorId: ctx.user._id,
      cards: stringify(args.cards)
    });

    return format;
  }
});
