import { clamp } from '@hc/shared';
import { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class ModifyApAction extends GameAction<{ entityId: EntityId; amount: number }> {
  readonly name = 'MODIFY_AP';

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId)!;

    entity.ap = clamp(entity.ap - this.payload.amount, 0, Infinity);
  }
}
