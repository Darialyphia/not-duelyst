import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureLobbyExists } from '../lobby.utils';
import { ensureLoadoutExists, validateLoadout } from '../../loadout/loadout.utils';
import { LOBBY_USER_ROLES } from '../lobby.constants';

export const selectLobbyLoadoutUsecase = authedMutation({
  args: {
    lobbyId: v.id('lobbies'),
    loadoutId: v.optional(v.id('loadouts'))
  },
  async handler(ctx, args) {
    const lobby = await ensureLobbyExists(ctx, args.lobbyId);
    const lobbyUser = await ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_user', q =>
        q.eq('lobbyId', args.lobbyId).eq('userId', ctx.user._id)
      )
      .unique();
    if (!lobbyUser) throw new Error('Lobby user not found');
    if (lobbyUser.role !== LOBBY_USER_ROLES.PLAYER) {
      throw new Error('You are not a player');
    }

    if (!args.loadoutId) {
      await ctx.db.patch(lobbyUser._id, { loadoutId: undefined });
      return;
    }

    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);

    if (loadout.ownerId !== ctx.user._id) throw new Error('Forbidden');
    if (loadout.formatId !== lobby.formatId) throw new Error('Forbidden');
    await validateLoadout(ctx, loadout);

    await ctx.db.patch(lobbyUser._id, { loadoutId: loadout._id });
  }
});
