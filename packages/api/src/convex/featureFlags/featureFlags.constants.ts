import type { Values } from '@game/shared';

export const FEATURE_FLAGS = {
  GRANT_COLLECTION_ON_SIGNUP: 'grant_collection_on_signup',
  HATHORA_ROOMS: 'hathora_rooms',
  TUTORIAL: 'tutorial',
  MATCHMAKING: 'matchmaking',
  LOBBIES: 'lobbies',
  TOURNAMENT: 'tournament',
  FRIENDLIES: 'friendlies',
  ANALYTICS: 'analytics'
} as const;

export type FeatureFlag = Values<typeof FEATURE_FLAGS>;
