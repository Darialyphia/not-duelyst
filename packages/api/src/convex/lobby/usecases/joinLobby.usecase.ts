import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureHasNoCurrentLobby, ensureLobbyExists } from '../lobby.utils';
import { LOBBY_USER_ROLES, MAX_PLAYERS_PER_LOBBY } from '../lobby.constants';
import { api } from '../../_generated/api';

export const joinLobbyUsecase = authedMutation({
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

    const isInLobby = lobbyUsers.some(u => u.userId === ctx.user._id);
    if (isInLobby) {
      throw new Error('already in lobby');
    }

    await ctx.db.insert('lobbyUsers', {
      lobbyId: args.lobbyId,
      userId: ctx.user._id,
      role:
        lobbyUsers.filter(l => l.role === LOBBY_USER_ROLES.PLAYER).length >=
        MAX_PLAYERS_PER_LOBBY
          ? LOBBY_USER_ROLES.SPECTATOR
          : LOBBY_USER_ROLES.PLAYER
    });

    ctx.scheduler.runAfter(0, api.matchmaking.leave, {
      sessionId: ctx.session.sessionId
    });
  }
});
