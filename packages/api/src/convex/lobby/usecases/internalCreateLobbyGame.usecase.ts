import { v } from 'convex/values';
import { LOBBY_STATUS } from '../lobby.constants';
import { internal } from '../../_generated/api';
import { createGame } from '../../game/game.utils';
import { internalMutation } from '../../_generated/server';

export const internalCreateLobbyGameUsecase = internalMutation({
  args: {
    roomId: v.string(),
    lobbyId: v.id('lobbies'),
    players: v.array(
      v.object({
        userId: v.id('users'),
        loadoutId: v.id('loadouts')
      })
    )
  },
  async handler(ctx, args) {
    ctx.scheduler.runAfter(0, internal.friends.internalCancelPendingChallenges, {
      userIds: args.players.map(l => l.userId)
    });

    const gameId = await createGame(ctx, {
      roomId: args.roomId,
      players: args.players
    });

    await ctx.db.patch(args.lobbyId, {
      gameId: gameId,
      status: LOBBY_STATUS.ONGOING
    });
  }
});