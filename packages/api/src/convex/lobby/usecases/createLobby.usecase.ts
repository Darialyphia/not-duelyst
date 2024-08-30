import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureHasNoCurrentLobby } from '../lobby.utils';
import { LOBBY_STATUS, LOBBY_USER_ROLES } from '../lobby.constants';

export const createLobbyUsecase = authedMutation({
  args: {
    name: v.string(),
    password: v.optional(v.string()),
    formatId: v.optional(v.id('formats'))
  },
  async handler(ctx, args) {
    await ensureHasNoCurrentLobby(ctx, ctx.user._id);

    const lobbyId = await ctx.db.insert('lobbies', {
      name: args.name,
      ownerId: ctx.user._id,
      password: args.password,
      formatId: args.formatId,
      status: LOBBY_STATUS.WAITING_FOR_PLAYERS,
      messages: []
    });

    await ctx.db.insert('lobbyUsers', {
      lobbyId: lobbyId,
      userId: ctx.user._id,
      role: LOBBY_USER_ROLES.PLAYER
    });

    return lobbyId;
  }
});
