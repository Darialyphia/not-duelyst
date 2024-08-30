import { ConvexError, v } from 'convex/values';
import { authedQuery } from '../../auth/auth.utils';
import { toUserDto } from '../user.mapper';

export const getProfileUsecase = authedQuery({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_slug', q => q.eq('slug', args.slug))
      .unique();
    if (!user) throw new ConvexError('User not found.');

    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .unique();

    return {
      user: toUserDto(user),
      profile: profile!
    };
  }
});
