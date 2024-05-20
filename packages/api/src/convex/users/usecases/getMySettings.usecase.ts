import type { AnyObject } from '@game/shared';
import { authedQuery } from '../../auth/auth.utils';

export const getMySettingsUecase = authedQuery({
  args: {},
  async handler({ db, user }) {
    const settings = await db
      .query('userSettings')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .unique();

    return (settings?.settings ?? {}) as AnyObject;
  }
});
