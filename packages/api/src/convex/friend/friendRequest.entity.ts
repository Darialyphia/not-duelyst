import type { Doc } from '../_generated/dataModel';

export type FriendRequest = Omit<Doc<'friendRequests'>, 'id'>;
export type FriendlyChallenge = Doc<'friendlyChallenges'>;
