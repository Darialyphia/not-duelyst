import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { formatConfigValidator } from '../format.utils';
import type { Id } from '../../_generated/dataModel';

const DEFAULT_MAP_ID = 'jn77k33k3z5zdajcwhnjee2e7d6x928n' as Id<'gameMaps'>;
export const createFormatUsecase = authedMutation({
  args: {
    name: v.string(),
    description: v.string(),
    config: formatConfigValidator
  },
  async handler(ctx, args) {
    const format = await ctx.db.insert('formats', {
      ...args,
      author: ctx.user._id,
      cards: {},
      map: DEFAULT_MAP_ID
    });

    return format;
  }
});
