import { isString } from '@hc/shared';
import { Point3D } from '../types';
import { Cell, CellId } from './cell';
import { DIRECTIONS_TO_DIFF, Direction, Tile } from './tile';
import { TileId } from './tile-lookup';

export type GameMapOptions = {
  cells: { position: Point3D; tileId: TileId }[];
  height: number;
  width: number;
  startPositions: [Point3D, Point3D];
};

export class GameMap {
  height: number;
  width: number;
  startPositions: [Point3D, Point3D];

  readonly cells: Cell[];
  private cellsMap = new Map<CellId, Cell>();

  constructor(definition: GameMapOptions) {
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

    return (
      this.cellsMap.get(`${posOrKey.x}:${posOrKey.y}:${posOrKey.z}`) ?? null
    );
  }

  getDestination(
    posOrKey: Point3D | CellId,
    direction: Direction
  ): Point3D | null {
    let from: Point3D;
    if (isString(posOrKey)) {
      const [x, y, z] = posOrKey.split(':').map(Number);
      from = { x: x, y, z };
    } else {
      from = posOrKey;
    }

    const x = from.x + (DIRECTIONS_TO_DIFF[direction] ?? 0);
    const y = from.y + (DIRECTIONS_TO_DIFF[direction] ?? 0);

    const target = { x, y, z: from.z };
    const targetAbove = { x, y, z: from.z + 1 };
    const targetBelow = { x, y, z: from.z - 1 };

    const currentCell = this.getCellAt(from);
    const cell = this.getCellAt(target);
    const cellBelow = this.getCellAt(targetAbove);
    const cellAbove = this.getCellAt(targetBelow);

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
}
