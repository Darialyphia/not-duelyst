import type { AnyObject } from '@game/shared';
import { queryWithAuth, ensureAuthenticated } from '../../auth/auth.utils';

export const getMySettingsUecase = queryWithAuth({
  args: {},
  async handler({ db, session }) {
    const user = ensureAuthenticated(session);

    const settings = await db
      .query('userSettings')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .unique();

    return (settings?.settings ?? {}) as AnyObject;
  }
});
