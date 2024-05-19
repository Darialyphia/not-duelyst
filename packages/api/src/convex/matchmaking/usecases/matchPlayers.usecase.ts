import { internal } from '../../_generated/api';
import { internalAction } from '../../_generated/server';
import { Matchmaking } from '../matchmaking';
import {
  createGameFromMatchmadePair,
  scheduleNextMatchmakingInvocation
} from '../matchmaking.utils';
import { MatchmakingTestStrategy } from '../strategies/test.strategy';

export const matchPlayersUsecase = internalAction(async ctx => {
  const participants = await ctx.runQuery(internal.matchmaking.getMatchmakingUsers);

  const strategy = new MatchmakingTestStrategy();
  const { pairs, remaining } = new Matchmaking(participants, strategy).makePairs();

  await Promise.allSettled(
    pairs.map(pair =>
      createGameFromMatchmadePair(
        ctx,
        pair.map(p => ({
          userId: p.user._id,
          matchmakingUserId: p.matchmakingUser._id,
          loadoutId: p.matchmakingUser.loadoutId
        }))
      )
    )
  );

  await scheduleNextMatchmakingInvocation(ctx, remaining.length);
});
