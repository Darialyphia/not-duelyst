import { EntityId } from '../entity/entity';
import { EVENT_NAME, GameEvent } from './event';

export type DealDamageEventPayload = {
  amount: number;
  sourceId: EntityId;
  targets: EntityId[];
};

export class DealDamageEvent extends GameEvent<DealDamageEventPayload> {
  protected name = EVENT_NAME.DEAL_DAMAGE;

  protected impl() {
    const attacker = this.ctx.entityManager.getEntityById(this.payload.sourceId)!;

    this.payload.targets.forEach(targetId => {
      const target = this.ctx.entityManager.getEntityById(targetId)!;
      attacker.dealDamage(this.payload.amount, target);
    });
  }
}
