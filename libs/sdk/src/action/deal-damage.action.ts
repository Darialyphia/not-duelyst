import { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class DealDamageAction extends GameAction<{
  amount: number;
  sourceId: EntityId;
  targets: EntityId[];
}> {
  readonly name = 'DEAL_DAMAGE';

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    const attacker = this.ctx.entityManager.getEntityById(this.payload.sourceId)!;

    this.payload.targets.forEach(targetId => {
      const target = this.ctx.entityManager.getEntityById(targetId)!;
      attacker.dealDamage(this.payload.amount, target);
    });
  }
}
