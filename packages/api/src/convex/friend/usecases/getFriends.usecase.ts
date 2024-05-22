import { isDefined } from '@game/shared';
import { authedQuery } from '../../auth/auth.utils';
import { toUserDto } from '../../users/user.mapper';
import { FRIEND_REQUEST_STATUS } from '../friendRequest.constants';

export const getFriendUsecase = authedQuery({
  args: {},
  async handler(ctx) {
    const friendRequests = await Promise.all([
      ctx.db
        .query('friendRequests')
        .withIndex('by_user_id', q => q.eq('receiverId', ctx.user._id))
        .filter(q => q.eq(q.field('status'), FRIEND_REQUEST_STATUS.ACCEPTED))
        .collect(),
      ctx.db
        .query('friendRequests')
        .withIndex('by_sender_id', q => q.eq('senderId', ctx.user._id))
        .filter(q => q.eq(q.field('status'), FRIEND_REQUEST_STATUS.ACCEPTED))
        .collect()
    ]);

    const friends = await Promise.all(
      friendRequests
        .flat()
        .map(friendRequest =>
          ctx.db.get(
            friendRequest.receiverId === ctx.user._id
              ? friendRequest.senderId
              : friendRequest.receiverId
          )
        )
    );

    return friends.filter(isDefined).map(toUserDto);
  }
});
