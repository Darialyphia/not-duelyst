import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { LOBBY_USER_ROLES, MAX_PLAYERS_PER_LOBBY } from '../lobby.constants';
import { LOBBY_USER_ROLE_VALIDATOR } from '../lobby.schemas';

export const selectLobbyRoleUsecase = authedMutation({
  args: {
    lobbyId: v.id('lobbies'),
    role: LOBBY_USER_ROLE_VALIDATOR
  },
  async handler(ctx, args) {
    const lobbyUsers = await ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_id', q => q.eq('lobbyId', args.lobbyId))
      .collect();

    const lobbyUser = lobbyUsers.find(l => l.userId == ctx.user._id);
    if (!lobbyUser) throw new Error('Lobby user not found');

    const tooManyPlayers =
      lobbyUsers.filter(l => l.role === LOBBY_USER_ROLES.PLAYER).length ===
      MAX_PLAYERS_PER_LOBBY;

    if (args.role === LOBBY_USER_ROLES.PLAYER && tooManyPlayers) {
      throw new Error('too many players');
    }

    await ctx.db.patch(lobbyUser._id, {
      role: args.role,
      loadoutId:
        args.role === LOBBY_USER_ROLES.SPECTATOR ? undefined : lobbyUser.loadoutId
    });
  }
});
