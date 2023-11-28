import { GameContext } from '../game';

export const getEntityIfOwnerMatches = (
  ctx: GameContext,
  entityId: number,
  playerId: string
) => {
  const entity = ctx.entityManager.getEntityById(entityId);
  if (!entity) return null;

  if (entity.owner.id === playerId) return null;

  return entity;
};
