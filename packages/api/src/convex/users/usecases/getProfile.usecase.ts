import { ConvexError, v } from 'convex/values';
import { authedQuery } from '../../auth/auth.utils';
import { toUserDto } from '../user.mapper';

export const getProfileUsecase = authedQuery({
  args: {
    fullname: v.string()
  },
  handler: async (ctx, args) => {
    const [name, discriminator] = args.fullname.split('#');
    const user = await ctx.db
      .query('users')
      .withIndex('by_fullname', q =>
        q.eq('name', name).eq('discriminator', discriminator)
      )
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
