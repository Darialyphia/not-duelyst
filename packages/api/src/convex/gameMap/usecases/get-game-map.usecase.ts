import { v } from 'convex/values';
import { query } from '../../_generated/server';

export const getGameMapUsecase = query({
  args: {
    mapId: v.id('gameMaps')
  },
  handler(ctx, args) {
    return ctx.db.get(args.mapId);
  }
});
