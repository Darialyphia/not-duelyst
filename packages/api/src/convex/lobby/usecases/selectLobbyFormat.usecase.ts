import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureLobbyExists } from '../lobby.utils';

export const selectLobbyFormatUsecase = authedMutation({
  args: {
    lobbyId: v.id('lobbies'),
    formatId: v.optional(v.id('formats'))
  },
  async handler(ctx, args) {
    const lobby = await ensureLobbyExists(ctx, args.lobbyId);

    if (lobby.ownerId !== ctx.user._id) {
      throw new Error('Forbidden');
    }

    await ctx.db.patch(args.lobbyId, {
      formatId: args.formatId
    });
    const lobbyUsers = await ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_id', q => q.eq('lobbyId', args.lobbyId))
      .collect();
    await Promise.all(lobbyUsers.map(l => ctx.db.patch(l._id, { loadoutId: undefined })));
  }
});
