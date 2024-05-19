import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { action } from '../../_generated/server';

export const cancelGameUsecase = action({
  args: {
    roomId: v.string()
  },
  async handler(ctx, { roomId }) {
    await ctx.runMutation(internal.games.internalCancel, { roomId });
    await ctx.runAction(internal.hathora.destroyRoom, { roomId });
  }
});
