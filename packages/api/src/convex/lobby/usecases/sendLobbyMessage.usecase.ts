import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { ensureLobbyExists } from '../lobby.utils';

export const sendLobbyMesageUsecase = authedMutation({
  args: {
    lobbyId: v.id('lobbies'),
    text: v.string()
  },
  async handler(ctx, args) {
    const lobby = await ensureLobbyExists(ctx, args.lobbyId);
    lobby.messages.push({
      author: ctx.user.name!,
      text: args.text
    });
    await ctx.db.patch(lobby._id, { messages: lobby.messages });
  }
});
