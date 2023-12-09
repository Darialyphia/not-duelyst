import { EntityId } from '../entity/entity';
import { Point3D } from '../types';
import { GameAction } from './action';

const waitFor = (duration: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), duration);
  });

export class MoveAction extends GameAction<{
  entityId: EntityId;
  path: Point3D[];
}> {
  readonly name = 'MOVE';

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    const stopWalking = this.ctx.fxContext.playAnimationUntil(
      this.payload.entityId,
      'walk'
    );
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId)!;
    for (const point of this.payload.path) {
      await this.ctx.fxContext.moveEntity(this.payload.entityId, point, 200);
    }

    stopWalking();
  }

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);

    entity.move(this.payload.path);
  }
}
