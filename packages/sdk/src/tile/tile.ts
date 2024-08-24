import { Vec3, type AnyObject, type Nullable, type Point3D } from '@game/shared';
import type { GameSession } from '../game-session';
import { TILES, type TileblueprintId } from './tile-lookup';
import type { Entity } from '../entity/entity';
import type { PlayerId } from '../player/player';

export type TileOptions = {
  blueprintId: TileblueprintId;
  position: Point3D;
  playerId?: PlayerId;
};

export class Tile {
  position: Vec3;
  blueprintId: TileblueprintId;
  playerId?: PlayerId;
  occupant: Nullable<Entity> = null;
  spriteId: string;
  meta: AnyObject = {};

  constructor(
    private session: GameSession,
    options: TileOptions
  ) {
    this.blueprintId = options.blueprintId;
    this.spriteId = this.blueprint.spriteId;
    this.position = Vec3.fromPoint3D(options.position);
    this.playerId = options.playerId;
    this.checkOccupation = this.checkOccupation.bind(this);
    this.session.on('entity:created', this.checkOccupation);
    this.session.on('entity:after_destroy', this.checkOccupation);
    this.session.on('entity:after_move', this.checkOccupation);
    this.session.on('entity:after_teleport', this.checkOccupation);
    this.session.on('entity:after_bounce', this.checkOccupation);
    void this.checkOccupation().then(() => {
      this.blueprint.onCreated?.(this.session, this.occupant, this);
    });
  }

  get player() {
    if (!this.playerId) return null;
    return this.session.playerSystem.getPlayerById(this.playerId);
  }

  get blueprint() {
    return TILES[this.blueprintId];
  }

  private async checkOccupation() {
    const previous = this.occupant;

    this.occupant = this.session.entitySystem.getEntityAt(this.position);
    if (!previous && this.occupant) {
      await this.blueprint.onEnter?.(this.session, this.occupant, this);
    } else if (previous && !this.occupant) {
      await this.blueprint.onLeave?.(this.session, previous, this);
    }
  }

  destroy() {
    this.blueprint.onDestroyed?.(this.session, this.occupant, this);
    this.session.boardSystem.getCellAt(this.position)!.tile = null;
    this.session.off('entity:created', this.checkOccupation);
    this.session.off('entity:after_destroy', this.checkOccupation);
    this.session.off('entity:after_move', this.checkOccupation);
    this.session.off('entity:after_teleport', this.checkOccupation);
    this.session.off('entity:after_bounce', this.checkOccupation);
  }
}
