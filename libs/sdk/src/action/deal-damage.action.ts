import { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class DealDamageAction extends GameAction<{
  amount: number;
  sourceId: EntityId;
  targets: EntityId[];
}> {
  readonly name = 'DEAL_DAMAGE';

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    await Promise.all(
      this.payload.targets.map(
        target =>
          this.ctx.fxContext?.shakeEntity(target, {
            count: 8,
            totalDuration: 0.4,
            axis: 'x',
            amount: 2
          })
      )
    );
  }

  protected impl() {
    const attacker = this.ctx.entityManager.getEntityById(this.payload.sourceId)!;

    this.payload.targets.forEach(targetId => {
      const target = this.ctx.entityManager.getEntityById(targetId)!;
      attacker.dealDamage(this.payload.amount, target);
    });
  }
}
