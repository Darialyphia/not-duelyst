import { isDefined } from '@hc/shared';
import { isCellOccupied } from '../entity/entity-utils';
import { GameContext } from '../game';
import { Point3D } from '../types';

export const canSummonAt = (ctx: GameContext, point: Point3D) => {
  if (isCellOccupied(ctx, point)) return false;

  const cell = ctx.map.getCellAt(point);
  const below = ctx.map.getCellAt({ ...point, z: point.z - 1 });

  return cell ? cell.isHalfTile && cell.isWalkable : below && below.isWalkable;
};
