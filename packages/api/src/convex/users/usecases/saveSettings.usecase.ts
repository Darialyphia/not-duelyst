import { v } from 'convex/values';
import { mutationWithAuth, ensureAuthenticated } from '../../auth/auth.utils';

export const saveSettingsUsecase = mutationWithAuth({
  args: {
    settings: v.any()
  },
  async handler({ db, session }, args) {
    const user = ensureAuthenticated(session);

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
