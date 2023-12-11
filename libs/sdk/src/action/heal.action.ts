import { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class HealAction extends GameAction<{
  amount: number;
  sourceId: EntityId;
  targets: EntityId[];
}> {
  readonly name = 'HEAL';

  protected async fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    const source = this.ctx.entityManager.getEntityById(this.payload.sourceId);
    if (!source) throw new Error(`Entity not found: ${this.payload.sourceId}`);

    this.payload.targets.forEach(targetId => {
      const target = this.ctx.entityManager.getEntityById(targetId)!;
      target.heal(this.payload.amount, source);
    });
  }
}
