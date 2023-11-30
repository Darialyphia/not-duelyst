import { EntityId } from '../entity/entity';
import { GameContext } from '../game';
import { Point3D } from '../types';
import { EVENT_NAME, GameEvent } from './event';

export type MoveEventPayload = {
  entityId: EntityId;
  path: Point3D[];
};

export class MoveEvent extends GameEvent<MoveEventPayload> {
  protected name = EVENT_NAME.MOVE;

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);

    entity.move(this.payload.path);
  }
}
