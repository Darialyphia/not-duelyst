import { authedQuery } from '../../auth/auth.utils';
import { getGlobalStats } from '../analytics.utils';

export const getGlobalStatsUsecase = authedQuery({
  args: {},
  handler(ctx) {
    return getGlobalStats(ctx);
  }
});
