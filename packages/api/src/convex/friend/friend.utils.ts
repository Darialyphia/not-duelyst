import type { Id } from '../_generated/dataModel';
import type { QueryCtx } from '../_generated/server';
import {
  FRIEND_CHALLENGE_STATUS,
  FRIEND_REQUEST_STATUS
} from './friendRequest.constants';

export const getAllFriendRequests = async (
  { db }: { db: QueryCtx['db'] },
  userId: Id<'users'>
) => {
  const friendRequests = await Promise.all([
    db
      .query('friendRequests')
      .withIndex('by_user_id', q => q.eq('receiverId', userId))
      .filter(q => q.eq(q.field('status'), FRIEND_REQUEST_STATUS.ACCEPTED))
      .collect(),
    db
      .query('friendRequests')
      .withIndex('by_sender_id', q => q.eq('senderId', userId))
      .filter(q => q.eq(q.field('status'), FRIEND_REQUEST_STATUS.ACCEPTED))
      .collect()
  ]);

  return friendRequests.flat();
};

export const getAllFriendIds = async (
  ctx: { db: QueryCtx['db'] },
  userId: Id<'users'>
) => {
  const friendRequests = await getAllFriendRequests(ctx, userId);
  return friendRequests.map(fr =>
    fr.receiverId === userId ? fr.senderId : fr.receiverId
  );
};

export const getCurrentChallenge = (
  { db }: { db: QueryCtx['db'] },
  userId: Id<'users'>
) =>
  db
    .query('friendlyChallenges')

    .filter(q =>
      q.and(
        q.eq(q.field('status'), FRIEND_CHALLENGE_STATUS.ACCEPTED),
        q.or(q.eq(q.field('challengedId'), userId), q.eq(q.field('challengerId'), userId))
      )
    )
    .order('desc')
    .first();
