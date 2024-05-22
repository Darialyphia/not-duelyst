import type { Doc } from '../_generated/dataModel';

export type FriendRequest = Omit<Doc<'friendRequests'>, 'id'>;
