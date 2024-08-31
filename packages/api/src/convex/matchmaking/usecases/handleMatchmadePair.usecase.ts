import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { internalMutation } from '../../_generated/server';
import { createGame } from '../../game/game.utils';

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

    ctx.scheduler.runAfter(0, internal.friends.internalCancelPendingChallenges, {
      userIds: arg.players.map(p => p.userId)
    });

    await createGame(ctx, { ...arg, private: false });

    return true;
  }
});
