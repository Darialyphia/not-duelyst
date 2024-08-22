import { Vec3, type Nullable, type Serializable } from '@game/shared';
import type { Point3D } from '../types';
import { pointToCellId } from '../utils/helpers';
import type { GameSession } from '../game-session';
import { TERRAINS, type Direction, type Terrain } from './board-utils';
import { Tile } from '../tile/tile';
import type { PlayerId } from '../player/player';

export type CellId = `${string}:${string}:${string}`;

export type SerializedCell = {
  spriteId: string;
  terrain: Terrain;
  position: Point3D;
  tileBlueprintId: string | null;
  defaultRotation?: 0 | 90 | 180 | 270;
};

export class Cell implements Serializable {
  public position: Vec3;
  public spriteId: string;
  public tile: Nullable<Tile>;
  public terrain: Terrain;
  public defaultRotation: 0 | 90 | 180 | 270;

  constructor(
    private session: GameSession,
    public options: SerializedCell
  ) {
    this.terrain = options.terrain;
    this.position = Vec3.fromPoint3D(options.position);
    this.spriteId = options.spriteId;
    this.defaultRotation = options.defaultRotation ?? 0;

    this.tile = options.tileBlueprintId
      ? new Tile(this.session, {
          position: this.position,
          blueprintId: options.tileBlueprintId
        })
      : null;
  }

  equals(cell: Cell) {
    return cell.id === this.id;
  }

  get cellAbove(): Cell | null {
    return this.session.boardSystem.getCellAt({
      ...this.position,
      z: this.position.z + 1
    });
  }

  get cellBelow(): Cell | null {
    return this.session.boardSystem.getCellAt({
      ...this.position,
      z: this.position.z - 1
    });
  }

  get isTopMost(): boolean {
    return !this.session.boardSystem.getCellAt({ x: this.x, y: this.y, z: this.z + 1 });
  }

  removeTile() {
    if (this.tile) {
      this.tile.destroy();
    }
  }

  addTile(newTileId: string, playerId?: PlayerId) {
    this.removeTile();
    this.tile = new Tile(this.session, {
      position: this.position,
      blueprintId: newTileId,
      playerId
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
    if (this.terrain !== TERRAINS.GROUND) return false;
    return true;
  }

  get entity() {
    return this.session.entitySystem.getEntityAt(this);
  }

  get canSummonAt() {
    return !this.entity && this.isWalkable && this.terrain === TERRAINS.GROUND;
  }

  serialize(): SerializedCell {
    return this.options;
  }
}
