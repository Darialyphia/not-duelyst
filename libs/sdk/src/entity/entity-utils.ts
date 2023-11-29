import { GameContext } from '../game';
import { PlayerId } from '../player/player';
import { UNIT_KIND, UnitKind } from '../units/unit-lookup';
import { Entity } from './entity';

export const getEntityIfOwnerMatches = (
  ctx: GameContext,
  entityId: number,
  playerId: string
) => {
  const entity = ctx.entityManager.getEntityById(entityId);
  if (!entity) return null;

  if (entity.playerId === playerId) return null;

  return entity;
};

export const ensureEntityBelongsToPlayer = (
  ctx: GameContext,
  entityId: number,
  playerId: string
) => {
  const entity = ctx.entityManager.getEntityById(entityId);
  if (!entity) return false;

  return entity.playerId === playerId;
};

export const ensureActiveEntityBelongsToPlayer = (
  ctx: GameContext,
  playerId: PlayerId
) => {
  return ctx.atb.activeEntity.playerId === playerId;
};

export const isKind = (kind: UnitKind) => (entity: Entity) =>
  entity.kind === kind;
export const isGeneral = isKind(UNIT_KIND.GENERAL);
