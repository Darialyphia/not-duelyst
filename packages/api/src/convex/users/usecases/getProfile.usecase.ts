import { ConvexError, v } from 'convex/values';
import { authedQuery } from '../../auth/auth.utils';
import { toUserDto } from '../user.mapper';

export const getProfileUsecase = authedQuery({
  args: {
    userId: v.id('users')
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError('User not found.');

    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', q => q.eq('userId', args.userId))
      .unique();

    return {
      user: toUserDto(user),
      profile: profile!
    };
  }
});
