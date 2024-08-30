import { v } from 'convex/values';
import { authedQuery } from '../../auth/auth.utils';
import { defaultFormat } from '../../formats/format.utils';
import { toLobbyDetailsDto } from '../lobby.mapper';
import { ensureLobbyExists } from '../lobby.utils';

export const getLobbyDetailsUsecase = authedQuery({
  args: {
    lobbyId: v.id('lobbies')
  },
  async handler(ctx, args) {
    const lobby = await ensureLobbyExists(ctx, args.lobbyId);

    const [users, format, owner] = await Promise.all([
      (async () => {
        const lobbyUsers = await ctx.db
          .query('lobbyUsers')
          .withIndex('by_lobby_id', q => q.eq('lobbyId', lobby._id))
          .collect();

        return Promise.all(
          lobbyUsers.map(async lobbyUser => {
            const loadout = lobbyUser.loadoutId
              ? await ctx.db.get(lobbyUser.loadoutId)
              : undefined;
            const user = await ctx.db.get(lobbyUser.userId);

            return { ...lobbyUser, user: user!, loadout: loadout! };
          })
        );
      })(),
      lobby.formatId ? ctx.db.get(lobby.formatId) : defaultFormat,
      ctx.db.get(lobby.ownerId)
    ]);

    return toLobbyDetailsDto({
      ...lobby,
      users,
      format: format!,
      owner: owner!
    });
  }
});
