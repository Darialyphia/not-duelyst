import { GameContext } from '../game-session';
import { PlayerId } from '../player/player';
import { Point3D } from '../types';
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

export const isAlly = (ctx: GameContext, entityId: number, playerId: string) => {
  const entity = ctx.entityManager.getEntityById(entityId);
  if (!entity) return false;

  return entity.playerId === playerId;
};

export const isEnemy = (ctx: GameContext, entityId: number, playerId: string) => {
  const entity = ctx.entityManager.getEntityById(entityId);
  if (!entity) return false;

  return entity.playerId !== playerId;
};

export const ensureActiveEntityBelongsToPlayer = (
  ctx: GameContext,
  playerId: PlayerId
) => {
  return ctx.atb.activeEntity.playerId === playerId;
};

export const isKind = (kind: UnitKind) => (entity: Entity) => entity.kind === kind;
export const isGeneral = isKind(UNIT_KIND.GENERAL);

export const isEmpty = (ctx: GameContext, point: Point3D) => {
  return !ctx.entityManager.getEntityAt(point);
};
