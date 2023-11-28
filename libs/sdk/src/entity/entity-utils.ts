import { Game, GameContext } from '../game';
import { PlayerId } from '../player/player';

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

export const ensureEntityBelongsToPlayer = (
  ctx: GameContext,
  entityId: number,
  playerId: string
) => {
  const entity = ctx.entityManager.getEntityById(entityId);
  if (!entity) return false;

  return entity.owner.id === playerId;
};

export const ensureActiveEntityBelongsToPlayer = (
  ctx: GameContext,
  playerId: PlayerId
) => {
  return ctx.atb.activeEntity.owner.id === playerId;
};
