import type { EntityId } from '@game/sdk';

export const useEntity = (entityId: EntityId) =>
  useGameSelector(session => session.entitySystem.getEntityById(entityId)!);
