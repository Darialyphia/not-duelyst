import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';

export const deleteLobbyUsecase = authedMutation({
  args: {
    lobbyId: v.id('lobbies')
  },
  async handler(ctx, args) {
    const users = await ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_id', q => q.eq('lobbyId', args.lobbyId))
      .collect();

    await Promise.all(users.map(el => ctx.db.delete(el._id)));

    await ctx.db.delete(args.lobbyId);

    return true;
  }
});
