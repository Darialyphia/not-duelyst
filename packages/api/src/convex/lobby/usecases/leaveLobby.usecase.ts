import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureHasNoCurrentLobby, ensureLobbyExists } from '../lobby.utils';

export const leaveLobbyUsecase = authedMutation({
  args: {
    lobbyId: v.id('lobbies')
  },
  async handler(ctx, args) {
    await ensureHasNoCurrentLobby(ctx, ctx.user._id);
    await ensureLobbyExists(ctx, args.lobbyId);

    const lobbyUsers = await ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_id', q => q.eq('lobbyId', args.lobbyId))
      .collect();

    const lobbyUser = lobbyUsers.find(u => u.userId === ctx.user._id);
    if (lobbyUser) {
      await ctx.db.delete(lobbyUser._id);
    }
  }
});
