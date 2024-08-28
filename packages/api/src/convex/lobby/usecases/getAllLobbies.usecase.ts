import { authedQuery } from '../../auth/auth.utils';
import { defaultFormat } from '../../formats/format.utils';
import { toLobbyDto } from '../lobby.mapper';

export const getAllLobbiesUsecase = authedQuery({
  args: {},
  async handler(ctx) {
    const lobbies = await ctx.db.query('lobbies').collect();

    return Promise.all(
      lobbies.map(async lobby => {
        const format = lobby.formatId ? await ctx.db.get(lobby.formatId) : defaultFormat;
        const owner = await ctx.db.get(lobby.ownerId);

        const users = await ctx.db
          .query('lobbyUsers')
          .withIndex('by_lobby_id', q => q.eq('lobbyId', lobby._id))
          .collect();

        return toLobbyDto({
          ...lobby,
          format: format!,
          owner: owner!,
          users
        });
      })
    );
  }
});
