import { defineSchema } from 'convex/server';
import { authSchemas } from './auth/auth.schema';
import { userSchemas } from './users/user.schemas';
import { matchmakingSchemas } from './matchmaking/matchmaking.schemas';
import { gameSchemas } from './game/game.schemas';
import { gameMapSchemas } from './gameMap/gameMap.schemas';
import { loadoutSchemas } from './loadout/loadout.schemas';
import { collectionSchemas } from './collection/collection.schemas';
import { featureflagSchemas } from './featureFlags/featureFlags.schemas';
import { analyticsSchemas } from './analytics/analytics.schemas';
import { friendSchemas } from './friend/friend.schemas';
import { formatSchemas } from './formats/format.schemas';

export default defineSchema({
  ...authSchemas,
  ...userSchemas,
  ...matchmakingSchemas,
  ...gameSchemas,
  ...gameMapSchemas,
  ...loadoutSchemas,
  ...collectionSchemas,
  ...featureflagSchemas,
  ...analyticsSchemas,
  ...friendSchemas,
  ...formatSchemas
});
