import { EntityId } from '../entity/entity';
import { Point3D } from '../types';
import { Vec3 } from '../utils/vector';
import { GameAction } from './action';

export class TeleportAction extends GameAction<{
  entityId: EntityId;
  point: Point3D;
}> {
  readonly name = 'TELEPORT';

  protected async fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);

    entity.position = Vec3.fromPoint3D(this.payload.point);
  }
}
