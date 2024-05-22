import type { Values } from '@game/shared';

export const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
} as const;

export type FriendRequestStatus = Values<typeof FRIEND_REQUEST_STATUS>;

export const FRIEND_CHALLENGE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
} as const;

export type FriendChallengeStatus = Values<typeof FRIEND_CHALLENGE_STATUS>;
