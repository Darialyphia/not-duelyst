import { EntityId } from '../entity/entity';
import { Point3D } from '../types';
import { GameAction } from './action';

export class MoveAction extends GameAction<{
  entityId: EntityId;
  path: Point3D[];
}> {
  readonly name = 'MOVE';

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);

    entity.move(this.payload.path);
  }
}
