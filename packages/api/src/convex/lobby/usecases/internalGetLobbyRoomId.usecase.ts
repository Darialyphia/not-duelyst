import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { internalAction } from '../../_generated/server';

export const internalGetLobbyRoomIdUsecase = internalAction({
  args: {
    lobbyId: v.id('lobbies'),
    players: v.array(
      v.object({
        userId: v.id('users'),
        loadoutId: v.id('loadouts')
      })
    )
  },
  async handler(ctx, args) {
    const roomId = await ctx.runAction(internal.hathora.getRoomId);
    await ctx.runMutation(internal.lobbies.createGame, {
      lobbyId: args.lobbyId,
      roomId,
      players: args.players
    });
  }
});
