import { Vec3, type Nullable, type Serializable, type Values } from '@game/shared';
import type { Point3D } from '../types';
import { pointToCellId } from '../utils/helpers';
import type { GameSession } from '../game-session';
import type { Direction } from './board-utils';
import { Tile } from '../tile/tile';

export type CellId = `${string}:${string}:${string}`;

export const TERRAINS = {
  GROUND: 'ground',
  WATER: 'water'
} as const;

export type Terrain = Values<typeof TERRAINS>;

export type SerializedCell = {
  spriteId: string;
  terrain: Terrain;
  position: Point3D;
  tileBlueprintId: string | null;
};

export class Cell implements Serializable {
  public position: Vec3;
  public readonly spriteId: string;
  public tile: Nullable<Tile>;

  constructor(
    private session: GameSession,
    public options: SerializedCell
  ) {
    this.position = Vec3.fromPoint3D(options.position);
    this.spriteId = options.spriteId;

    this.tile = options.tileBlueprintId
      ? new Tile(this.session, {
          position: this.position,
          blueprintId: options.tileBlueprintId
        })
      : null;
  }

  get terrain() {
    return this.options.terrain;
  }

  equals(cell: Cell) {
    return cell.id === this.id;
  }

  async removeTile() {
    if (this.tile) {
      await this.tile.destroy();
    }
  }

  async addTile(newTileId: string) {
    await this.removeTile();
    this.tile = new Tile(this.session, {
      position: this.position,
      blueprintId: newTileId
    });
  }

  getDestination(direction: Direction) {
    return this.session.boardSystem.getDestination(this, direction);
  }

  get id(): CellId {
    return pointToCellId(this);
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get z() {
    return this.position.z;
  }

  get isWalkable() {
    const above = this.session.boardSystem.getCellAt({
      ...this.position,
      z: this.position.z + 1
    });
    if (above) return false;

    return true;
  }

  get entity() {
    return this.session.entitySystem.getEntityAt(this);
  }

  get canSummonAt() {
    return this.isWalkable && this.terrain === TERRAINS.GROUND;
  }

  serialize(): SerializedCell {
    return this.options;
  }
}
