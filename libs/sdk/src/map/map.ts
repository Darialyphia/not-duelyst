import { Vec3 } from '../types';
import { Cell } from './cell';
import {
  Direction,
  OPPOSITE_DIRECTIONS,
  Tile,
  TileId,
  tileLookup
} from './tile';

type GameMapOptions = {
  cells: { position: Vec3; tileId: TileId }[];
  height: number;
  width: number;
  startPositions: [Vec3, Vec3];
};

export class GameMap {
  height: number;
  width: number;
  startPositions: [Vec3, Vec3];

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

  private getCellMapKey({ x, y, z }: Vec3) {
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

  getCellAt(pos: Vec3) {
    return this.cellsMap.get(this.getCellMapKey(pos)) ?? null;
  }

  getDestination(from: Vec3, direction: Direction): Vec3 | null {
    const { x, y } = {
      x:
        direction === 'east'
          ? from.x + 1
          : direction === 'west'
          ? from.x - 1
          : from.x,
      y:
        direction === 'south'
          ? from.y + 1
          : direction === 'north'
          ? from.y - 1
          : from.y
    };

    const target = { x, y, z: from.z };
    const targetAbove = { x, y, z: from.z + 1 };
    const targetBelow = { x, y, z: from.z - 1 };

    const currentCell = this.getCellAt(from);
    const cell = this.getCellAt(target);
    const cellBelow = this.getCellAt(targetAbove);
    const cellAbove = this.getCellAt(targetBelow);

    if (currentCell?.tile.isRamp) {
      if (cell && !cellAbove) {
        return cell.isWalkable ? cellAbove : null;
      }

      if (!cellBelow) return null;
      if (cellBelow.isRamp) return null;
      if (cellBelow.isWalkable) return null;
      return targetBelow;
    }

    if (cell?.isRamp) return target;

    if (!cellBelow) return null;
    if (!cellBelow.isWalkable) return null;
    if (cellBelow.isRamp) return targetBelow;

    return target;
  }
}
