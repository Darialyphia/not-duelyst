import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureLobbyExists } from '../lobby.utils';
import { internal } from '../../_generated/api';
import { LOBBY_STATUS } from '../lobby.constants';

export const startLobbyGameUsecase = authedMutation({
  args: {
    lobbyId: v.id('lobbies')
  },
  async handler(ctx, args) {
    const lobby = await ensureLobbyExists(ctx, args.lobbyId);

    if (lobby.ownerId !== ctx.user._id) {
      throw new Error('Forbidden');
    }

    const lobbyUsers = await ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_id', q => q.eq('lobbyId', args.lobbyId))
      .collect();

    if (!lobbyUsers.every(l => l.loadoutId)) {
      throw new Error('Not all players have chosen their loadout.');
    }
    await ctx.db.patch(args.lobbyId, { status: LOBBY_STATUS.CREATING_GAME });
    await ctx.scheduler.runAfter(0, internal.lobbies.getRoomId, {
      lobbyId: args.lobbyId,
      players: lobbyUsers.map(l => ({ userId: l.userId, loadoutId: l.loadoutId! }))
    });
  }
});
