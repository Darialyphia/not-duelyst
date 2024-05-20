import { authedQuery } from '../../auth/auth.utils';

export const getGlobalStatsUsecase = authedQuery({
  args: {},
  handler(ctx) {
    return ctx.db.query('globalStats').first();
  }
});
