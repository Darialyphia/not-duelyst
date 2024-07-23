import { Vec3, type AnyObject, type Nullable, type Point3D } from '@game/shared';
import type { GameSession } from '../game-session';
import { TILES, type TileblueprintId } from './tile-lookup';
import type { Entity } from '../entity/entity';

export type TileOptions = {
  blueprintId: TileblueprintId;
  position: Point3D;
};

export class Tile {
  position: Vec3;
  blueprintId: TileblueprintId;
  occupant: Nullable<Entity> = null;

  meta: AnyObject = {};

  constructor(
    private session: GameSession,
    options: TileOptions
  ) {
    this.blueprintId = options.blueprintId;
    this.position = Vec3.fromPoint3D(options.position);

    this.checkOccupation = this.checkOccupation.bind(this);
    this.session.on('entity:created', this.checkOccupation);
    this.session.on('entity:after_destroy', this.checkOccupation);
    this.session.on('entity:after_move', this.checkOccupation);
    this.checkOccupation();
    this.blueprint.onCreated?.(this.session, this.occupant, this);
  }

  get blueprint() {
    return TILES[this.blueprintId];
  }

  private checkOccupation() {
    const previous = this.occupant;

    this.occupant = this.session.entitySystem.getEntityAt(this.position);
    if (!previous && this.occupant) {
      this.blueprint.onEnter?.(this.session, this.occupant, this);
    } else if (previous && !this.occupant) {
      this.blueprint.onLeave?.(this.session, previous, this);
    }
  }

  destroy() {
    this.blueprint.onDestroyed?.(this.session, this.occupant, this);
    this.session.boardSystem.getCellAt(this.position)!.tile = null;
  }
}
