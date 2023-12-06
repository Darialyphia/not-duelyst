import { isString } from '@hc/shared';
import { Point3D } from '../types';
import { Cell, CellId } from './cell';
import { DIRECTIONS_TO_DIFF, Direction, Tile } from './tile';
import { TileId } from './tile-lookup';
import { cellIdToPoint } from '../utils/helpers';
import { GameContext } from '../game-session';
import { Serializable } from '../utils/interfaces';
import { Entity } from '../entity/entity';
import { Pathfinder } from './pathfinding';
import { Vec3 } from '../utils/vector';

export type GameMapOptions = {
  cells: { position: Point3D; tileId: TileId }[];
  height: number;
  width: number;
  startPositions: [Point3D, Point3D];
};

export class GameMap implements Serializable {
  height!: number;

  width!: number;

  startPositions!: [Point3D, Point3D];

  cells!: Cell[];

  cellsMap = new Map<CellId, Cell>();

  constructor(private ctx: GameContext) {}

  setup(definition: GameMapOptions) {
    this.height = definition.height;
    this.width = definition.width;
    this.startPositions = definition.startPositions;
    this.cells = this.makeCells(definition.cells);
    this.cells.forEach(cell => {
      this.cellsMap.set(cell.id, cell);
    });
  }

  private makeCells(cells: GameMapOptions['cells']) {
    return cells.map(({ tileId, position }) => {
      return new Cell(new Tile(tileId), position);
    });
  }

  serialize(): GameMapOptions {
    return {
      width: this.width,
      height: this.height,
      startPositions: this.startPositions,
      cells: this.cells.map(cell => cell.serialize())
    };
  }

  getCellAt(posOrKey: CellId | Point3D) {
    if (isString(posOrKey)) {
      return this.cellsMap.get(posOrKey) ?? null;
    }

    return this.cellsMap.get(`${posOrKey.x}:${posOrKey.y}:${posOrKey.z}`) ?? null;
  }

  getDestination(posOrKey: Point3D | CellId, direction: Direction): Point3D | null {
    const from = isString(posOrKey)
      ? Vec3.fromPoint3D(cellIdToPoint(posOrKey))
      : Vec3.fromPoint3D(posOrKey);

    const { x, y } = Vec3.add(from, { ...DIRECTIONS_TO_DIFF[direction], z: 0 });

    const target = { x, y, z: from.z };

    const targetAbove = { x, y, z: from.z + 1 };
    const targetBelow = { x, y, z: from.z - 1 };

    const currentCell = this.getCellAt(from);
    const cell = this.getCellAt(target);
    const cellBelow = this.getCellAt(targetBelow);
    const cellAbove = this.getCellAt(targetAbove);

    if (currentCell) {
      if (currentCell?.isHalfTile) return null;
      if (cell && !cellAbove) {
        return cell.isHalfTile ? target : targetAbove;
      }

      if (!cellBelow) return null;
      if (cellBelow.isHalfTile) return null;

      return target;
    }

    if (cell?.isHalfTile) return target;

    if (!cellBelow) return null;
    if (cellBelow.isHalfTile) return targetBelow;

    return target;
  }

  canSummonAt(point: Point3D) {
    if (this.ctx.entityManager.getEntityAt(point)) return false;

    const cell = this.getCellAt(point);
    const below = this.getCellAt({ ...point, z: point.z - 1 });

    return cell ? cell.isHalfTile && cell.isWalkable : below && below.isWalkable;
  }

  getDistanceMap(point: Point3D, maxDistance?: number) {
    const boundaries = maxDistance
      ? ([
          Vec3.sub(point, { x: maxDistance, y: maxDistance, z: maxDistance }),
          Vec3.add(point, { x: maxDistance, y: maxDistance, z: maxDistance })
        ] as [Vec3, Vec3])
      : undefined;
    return new Pathfinder(this.ctx, boundaries).getDistanceMap(point);
  }

  getPathTo(entity: Entity, point: Point3D) {
    const path = new Pathfinder(this.ctx).findPath(entity.position, point);

    if (!path) return null;

    return {
      distance: path.distance,
      path: path.path.map(p => Vec3.fromPoint3D(cellIdToPoint(p)))
    };
  }
}
