import { MatchmakingStrategy } from '../matchmaking';
import { User } from '../../users/user.entity';
import type { Id } from '../../_generated/dataModel';

type TestStrategyParticipant = User & {
  matchmakingUserId: Id<'matchmakingUsers'>;
};
export class MatchmakingTestStrategy
  implements MatchmakingStrategy<TestStrategyParticipant>
{
  sorter(a: TestStrategyParticipant, b: TestStrategyParticipant): number {
    return b.mmr - a.mmr;
  }

  matcher(a: TestStrategyParticipant, b: TestStrategyParticipant): boolean {
    return Math.abs(a.mmr - b.mmr) < 9999;
  }

  processUnmatched(participant: TestStrategyParticipant): TestStrategyParticipant {
    return participant;
  }
}
