import { isDefined } from '@game/shared';
import { authedQuery } from '../../auth/auth.utils';
import { toFriendRequestDto } from '../friendRequest.mapper';

export const getReceivedFriendRequestsUsecase = authedQuery({
  args: {},
  async handler(ctx) {
    const friendRequests = await ctx.db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', ctx.user._id))
      .filter(q => q.eq(q.field('status'), 'pending'))
      .collect();

    const mapped = await Promise.all(
      friendRequests.map(async req => {
        const [sender, receiver] = await Promise.all([
          ctx.db.get(req.senderId),
          ctx.db.get(req.receiverId)
        ]);
        if (!sender || !receiver) return null;
        return toFriendRequestDto({
          ...req,
          sender,
          receiver
        });
      })
    );

    return mapped.filter(isDefined);
  }
});
