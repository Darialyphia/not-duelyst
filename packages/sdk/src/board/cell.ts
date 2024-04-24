import { Vec3, type Nullable, type Serializable } from '@game/shared';
import type { Point3D } from '../types';
import { pointToCellId } from '../utils/helpers';
import type { GameSession } from '../game-session';
import type { Direction } from './board-utils';
import { Tile } from '../tile/tile';
// import { Tile } from './tile';

export type CellId = `${string}:${string}:${string}`;

export type SerializedCell = {
  spriteId: string;
  position: Point3D;
  tileBlueprintId: string | null;
};

export class Cell implements Serializable {
  public position: Vec3;
  public readonly spriteId: string;
  public tile: Nullable<Tile>;

  constructor(
    private session: GameSession,
    options: SerializedCell
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

  equals(cell: Cell) {
    return cell.id === this.id;
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

  serialize(): SerializedCell {
    return {
      position: this.position.serialize(),
      spriteId: this.spriteId,
      tileBlueprintId: this.tile?.blueprintId ?? null
    };
  }
}
