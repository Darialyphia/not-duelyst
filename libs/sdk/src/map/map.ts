import { Point3D } from '../types';
import { Cell } from './cell';
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
  private cellsMap = new Map<string, Cell>();

  constructor(definition: GameMapOptions) {
    this.height = definition.height;
    this.width = definition.width;
    this.startPositions = definition.startPositions;
    this.cells = this.makeCells(definition.cells);
    this.cells.forEach(cell => {
      this.cellsMap.set(this.getCellMapKey(cell), cell);
    });
  }

  private getCellMapKey({ x, y, z }: Point3D) {
    return `${x}:${y}:${z}`;
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

  getCellAt(pos: Point3D) {
    return this.cellsMap.get(this.getCellMapKey(pos)) ?? null;
  }

  getDestination(from: Point3D, direction: Direction): Point3D | null {
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
