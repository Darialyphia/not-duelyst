import type { Values } from '@game/shared';

export const FEATURE_FLAGS = {
  GRANT_COLLECTION_ON_SIGNUP: 'grant_collection_on_signup',
  HATHORA_ROOMS: 'hathora_rooms'
} as const;

export type FeatureFlag = Values<typeof FEATURE_FLAGS>;
