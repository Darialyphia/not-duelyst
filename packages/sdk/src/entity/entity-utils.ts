import { type Nullable, isDefined } from '@game/shared';
import { GameSession } from '../game-session';
import { type Point3D } from '../types';
import { Entity, type EntityId } from './entity';
import { isWithinCells } from '../utils/targeting';
import { match } from 'ts-pattern';

export const getEntityIfOwnerMatches = (
  ctx: GameSession,
  entityId: number,
  playerId: string
) => {
  const entity = ctx.entitySystem.getEntityById(entityId);
  if (!entity) return null;

  if (entity.player.id !== playerId) return null;

  return entity;
};

export const isAlly = (
  session: GameSession,
  entityId: Nullable<EntityId>,
  playerId: string
) => {
  if (!isDefined(entityId)) return false;
  const entity = session.entitySystem.getEntityById(entityId);

  if (!entity) return false;
  return entity.player.id === playerId;
};

export const isAllyMinion = (
  session: GameSession,
  entityId: Nullable<EntityId>,
  playerId: string
) => {
  if (!isDefined(entityId)) return false;
  const entity = session.entitySystem.getEntityById(entityId);

  if (!entity) return false;
  return entity.player.id === playerId && !entity.isGeneral;
};

export const isEnemy = (
  session: GameSession,
  entityId: Nullable<EntityId>,
  playerId: string
) => {
  if (!isDefined(entityId)) return false;
  const entity = session.entitySystem.getEntityById(entityId);
  if (!entity) return false;

  return entity.player.id !== playerId;
};

export const isEnemyMinion = (
  session: GameSession,
  entityId: Nullable<EntityId>,
  playerId: string
) => {
  if (!isDefined(entityId)) return false;
  const entity = session.entitySystem.getEntityById(entityId);
  if (!entity) return false;

  return entity.player.id !== playerId && !entity.isGeneral;
};

export const isEnemyGeneral = (
  session: GameSession,
  entityId: Nullable<EntityId>,
  playerId: string
) => {
  if (!isDefined(entityId)) return false;
  const entity = session.entitySystem.getEntityById(entityId);
  if (!entity) return false;

  return entity.player.id !== playerId && entity.isGeneral;
};

export const isEmpty = (session: GameSession, point: Point3D) => {
  return !session.entitySystem.getEntityAt(point);
};

export const hasNearbyUnit = (session: GameSession, origin: Point3D, point: Point3D) => {
  return !isEmpty(session, point) && isWithinCells(origin, point, 1);
};

export const pointsToEntities = (session: GameSession, points: Point3D[]): Entity[] =>
  points.map(point => session.entitySystem.getEntityAt(point)).filter(isDefined);

export const pointsToEntityIds = (session: GameSession, points: Point3D[]): EntityId[] =>
  pointsToEntities(session, points).map(e => e.id);

export const getNearest = (
  session: GameSession,
  direction: 'up' | 'down' | 'left' | 'right',
  point: Point3D
) => {
  let found: Entity | null = null;
  let n = 0;
  while (!found) {
    n++;
    const newPoint: Point3D = match(direction)
      .with('up', () => {
        return { ...point, y: point.y - n };
      })
      .with('down', () => {
        return { ...point, y: point.y + n };
      })
      .with('left', () => {
        return { ...point, x: point.x - n };
      })
      .with('right', () => {
        return { ...point, x: point.x + n };
      })
      .exhaustive();
    const above = session.boardSystem.getCellAt({ ...newPoint, z: point.z + 1 });
    const below = session.boardSystem.getCellAt({ ...newPoint, z: point.z - 1 });
    const cell = session.boardSystem.getCellAt(newPoint);
    if (!cell && !below && !above) break;

    found = above?.entity ?? cell?.entity ?? below?.entity ?? null;
  }

  return found;
};

export const getCellInFront = (session: GameSession, entity: Entity) => {
  const xOffset = entity.player.isPlayer1 ? 1 : -1;
  const above = session.boardSystem.getCellAt({
    ...entity.position,
    z: entity.position.z + 1,
    x: entity.position.x + xOffset
  });
  if (above) return above;
  const cell = session.boardSystem.getCellAt({
    ...entity.position,
    x: entity.position.x + xOffset
  });
  if (cell) return cell;
  const below = session.boardSystem.getCellAt({
    ...entity.position,
    z: entity.position.z - 1,
    x: entity.position.x + xOffset
  });
  if (below) return below;

  return null;
};

export const getEntityInFront = (session: GameSession, entity: Entity) => {
  return getCellInFront(session, entity)?.entity;
};

export const getCellBehind = (session: GameSession, entity: Entity) => {
  const xOffset = entity.player.isPlayer1 ? -1 : 1;
  const above = session.boardSystem.getCellAt({
    ...entity.position,
    z: entity.position.z + 1,
    x: entity.position.x + xOffset
  });
  if (above) return above;
  const cell = session.boardSystem.getCellAt({
    ...entity.position,
    x: entity.position.x + xOffset
  });
  if (cell) return cell;
  const below = session.boardSystem.getCellAt({
    ...entity.position,
    z: entity.position.z - 1,
    x: entity.position.x + xOffset
  });
  if (below) return below;

  return null;
};

export const getEntityBehind = (session: GameSession, entity: Entity) => {
  return getCellBehind(session, entity)?.entity;
};

export const getCellAbove = (session: GameSession, entity: Entity) => {
  const yOffset = -1;
  const above = session.boardSystem.getCellAt({
    ...entity.position,
    z: entity.position.z + 1,
    y: entity.position.y + yOffset
  });
  if (above) return above;
  const cell = session.boardSystem.getCellAt({
    ...entity.position,
    y: entity.position.y + yOffset
  });
  if (cell) return cell;
  const below = session.boardSystem.getCellAt({
    ...entity.position,
    z: entity.position.z - 1,
    y: entity.position.y + yOffset
  });
  if (below) return below;

  return null;
};

export const getEntityAbove = (session: GameSession, entity: Entity) => {
  return getCellAbove(session, entity)?.entity;
};

export const getCellBelow = (session: GameSession, entity: Entity) => {
  const yOffset = 1;
  const above = session.boardSystem.getCellAt({
    ...entity.position,
    z: entity.position.z + 1,
    y: entity.position.y + yOffset
  });
  if (above) return above;
  const cell = session.boardSystem.getCellAt({
    ...entity.position,
    y: entity.position.y + yOffset
  });
  if (cell) return cell;
  const below = session.boardSystem.getCellAt({
    ...entity.position,
    z: entity.position.z - 1,
    y: entity.position.y + yOffset
  });
  if (below) return below;

  return null;
};

export const getEntityBelow = (session: GameSession, entity: Entity) => {
  return getCellBelow(session, entity)?.entity;
};

export const isNearbyEnemy = (
  session: GameSession,
  origin: Nullable<Entity>,
  point: Point3D
) =>
  !!origin &&
  isWithinCells(origin.position, point, 1) &&
  isEnemy(session, session.entitySystem.getEntityAt(point)?.id, origin.player.id);

export const isNearbyAlly = (
  session: GameSession,
  origin: Nullable<Entity>,
  point: Point3D
) =>
  !!origin &&
  !session.entitySystem.getEntityAt(point)?.equals(origin) &&
  isWithinCells(origin.position, point, 1) &&
  isAlly(session, session.entitySystem.getEntityAt(point)?.id, origin.player.id);
