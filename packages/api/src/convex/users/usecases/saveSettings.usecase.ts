import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';

export const saveSettingsUsecase = authedMutation({
  args: {
    settings: v.any()
  },
  async handler({ db, user }, args) {
    const settings = await db
      .query('userSettings')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .unique();

    if (!settings) {
      await db.insert('userSettings', {
        userId: user._id,
        settings: args.settings
      });
    } else {
      await db.patch(settings._id, { settings: args.settings });
    }
  }
});
