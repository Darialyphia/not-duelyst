import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { internalMutation } from '../../_generated/server';
import { getGameInitialState } from '../../game/game.utils';

export const handleMatchmadePairUsecase = internalMutation({
  args: {
    roomId: v.string(),
    players: v.array(
      v.object({
        loadoutId: v.id('loadouts'),
        matchmakingUserId: v.id('matchmakingUsers'),
        userId: v.id('users')
      })
    )
  },
  async handler(ctx, arg) {
    await Promise.all(
      arg.players.map(({ matchmakingUserId }) => ctx.db.delete(matchmakingUserId))
    );

    const { mapId, firstPlayer, status, seed } = await getGameInitialState(
      ctx,
      arg.players.map(p => p.userId)
    );

    ctx.scheduler.runAfter(0, internal.friends.internalCancelPendingChallenges, {
      userIds: arg.players.map(p => p.userId)
    });

    const gameId = await ctx.db.insert('games', {
      firstPlayer,
      mapId,
      status,
      seed,
      roomId: arg.roomId
    });

    await Promise.all(
      arg.players.map(({ userId, loadoutId }) =>
        ctx.db.insert('gamePlayers', {
          loadoutId,
          gameId,
          userId
        })
      )
    );

    ctx.scheduler.runAfter(45_000, internal.games.timeout, { roomId: arg.roomId });
  }
});
