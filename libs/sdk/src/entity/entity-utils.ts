import { isDefined } from '@hc/shared';
import { Game, GameContext } from '../game';
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

export const isCellOccupied = (ctx: GameContext, point: Point3D) => {
  return !!ctx.entityManager.getEntityAt(point);
};

export const isKind = (kind: UnitKind) => (entity: Entity) =>
  entity.kind === kind;
export const isGeneral = isKind(UNIT_KIND.GENERAL);

export const getSurroundingEntities = (
  ctx: GameContext,
  { x, y, z }: Point3D
) => {
  // prettier-ignore
  return [
    // Same level
    ctx.entityManager.getEntityAt({ x: x - 1, y: y - 1, z }), // top left
    ctx.entityManager.getEntityAt({ x: x    , y: y - 1, z }), // top
    ctx.entityManager.getEntityAt({ x: x + 1, y: y - 1, z }), // top right
    ctx.entityManager.getEntityAt({ x: x - 1, y: y    , z}),  // left
    ctx.entityManager.getEntityAt({ x: x + 1, y: y    , z}),  // right
    ctx.entityManager.getEntityAt({ x: x - 1, y: y + 1, z }), // bottom left
    ctx.entityManager.getEntityAt({ x: x    , y: y + 1, z }), // bottom
    ctx.entityManager.getEntityAt({ x: x + 1, y: y + 1, z }), // bottom right,

    // below
    ctx.entityManager.getEntityAt({ x: x - 1, y: y - 1, z: z - 1 }), // top left
    ctx.entityManager.getEntityAt({ x: x    , y: y - 1, z: z - 1 }), // top
    ctx.entityManager.getEntityAt({ x: x + 1, y: y - 1, z: z - 1 }), // top right
    ctx.entityManager.getEntityAt({ x: x - 1, y: y    , z: z - 1 }), // left
    ctx.entityManager.getEntityAt({ x: x    , y: y    , z: z - 1 }), // center
    ctx.entityManager.getEntityAt({ x: x + 1, y: y    , z: z - 1 }), // right
    ctx.entityManager.getEntityAt({ x: x - 1, y: y + 1, z: z - 1 }), // bottom left
    ctx.entityManager.getEntityAt({ x: x    , y: y + 1, z: z - 1 }), // bottom
    ctx.entityManager.getEntityAt({ x: x + 1, y: y + 1, z: z - 1 }), // bottom right,

    // Above
    ctx.entityManager.getEntityAt({ x: x - 1, y: y - 1, z: z + 1 }), // top left
    ctx.entityManager.getEntityAt({ x: x    , y: y - 1, z: z + 1 }), // top
    ctx.entityManager.getEntityAt({ x: x + 1, y: y - 1, z: z + 1 }), // top right
    ctx.entityManager.getEntityAt({ x: x - 1, y: y    , z: z + 1 }), // left
    ctx.entityManager.getEntityAt({ x: x    , y: y    , z: z + 1 }), // center
    ctx.entityManager.getEntityAt({ x: x + 1, y: y    , z: z + 1 }), // right
    ctx.entityManager.getEntityAt({ x: x - 1, y: y + 1, z: z + 1 }), // bottom left
    ctx.entityManager.getEntityAt({ x: x    , y: y + 1, z: z + 1 }), // bottom
    ctx.entityManager.getEntityAt({ x: x + 1, y: y + 1, z: z + 1 }), // bottom right,
  ].filter(isDefined);
};

export const hasAllyNearby = (
  ctx: GameContext,
  position: Point3D,
  playerId: PlayerId
) => {
  const nearby = getSurroundingEntities(ctx, position);

  return nearby.some(entity =>
    ensureActiveEntityBelongsToPlayer(ctx, playerId)
  );
};

export const getGeneral = (ctx: GameContext, playerId: PlayerId) =>
  ctx.entityManager
    .getList()
    .find(entity => isGeneral(entity) && entity.playerId === playerId)!;
