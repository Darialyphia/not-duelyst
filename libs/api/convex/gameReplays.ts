import { v } from 'convex/values';
import { internalMutation, query } from './_generated/server';

export const createReplay = internalMutation({
  args: {
    gameId: v.id('games'),
    replay: v.string()
  },
  async handler(ctx, args) {
    return ctx.db.insert('gameReplays', args);
  }
});

export const byGameId = query({
  args: { gameId: v.id('games') },
  handler(ctx, args) {
    return ctx.db
      .query('gameReplays')
      .withIndex('by_game_id', q => q.eq('gameId', args.gameId))
      .unique();
  }
});
