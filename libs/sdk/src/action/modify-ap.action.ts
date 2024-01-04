import { clamp } from '@hc/shared';
import { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class ModifyApAction extends GameAction<{ entityId: EntityId; amount: number }> {
  readonly name = 'MODIFY_AP';

  get logMessage() {
    return `${this.entity.unitId} ${this.payload.amount > 0 ? 'wins' : 'loses'} ${
      this.payload.amount
    } AP.`;
  }

  get entity() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);
    return entity;
  }

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    this.entity.ap = clamp(this.entity.ap - this.payload.amount, 0, Infinity);
  }
}
