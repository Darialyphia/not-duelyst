import { EntityId } from '../entity/entity';
import { GameAction } from './action';
import { DieAction } from './die.action';

export class DealDamageAction extends GameAction<{
  amount: number;
  sourceId: EntityId;
  targets: EntityId[];
  isTrueDamage?: boolean;
}> {
  readonly name = 'DEAL_DAMAGE';

  get attacker() {
    const attacker = this.ctx.entityManager.getEntityById(this.payload.sourceId);
    if (!attacker) throw new Error(`Entity not found: ${this.payload.sourceId}`);
    return attacker;
  }

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;
    if (!this.payload.targets.length) return;

    this.ctx.fxContext.playSoundOnce('hit-placeholder');

    await Promise.all(
      this.payload.targets.map(targetId => {
        const target = this.ctx.entityManager.getEntityById(targetId)!;
        const amount = target.calculateDamage(
          this.payload.amount,
          this.attacker,
          target,
          this.payload.isTrueDamage
        );
        this.ctx.fxContext?.displayText(String(amount), targetId, {
          color: 0xff0000,
          duration: 1,
          path: [
            { x: 0, y: 25, alpha: 0, scale: 0 },
            { x: 0, y: 0, alpha: 0, scale: 1 },
            { x: 0, y: 0, alpha: 1, scale: 1 }
          ]
        });
        this.ctx.fxContext?.addChildSprite('blood_01', targetId, {
          waitUntilAnimationDone: false,
          offset: { x: 0, y: 64 },
          scale: 0.5
        });
        return this.ctx.fxContext?.shakeEntity(targetId, {
          count: 6,
          totalDuration: 0.4,
          axis: 'x',
          amount: 1
        });
      })
    );
  }

  protected impl() {
    const attacker = this.ctx.entityManager.getEntityById(this.payload.sourceId);
    if (!attacker) throw new Error(`Entity not found: ${this.payload.sourceId}`);

    this.payload.targets.forEach(targetId => {
      const target = this.ctx.entityManager.getEntityById(targetId)!;
      attacker.dealDamage(this.payload.amount, target, this.payload.isTrueDamage);
      if (target.hp <= 0) {
        this.ctx.actionQueue.push(
          new DieAction({ entityId: targetId, sourceId: this.payload.sourceId }, this.ctx)
        );
      }
    });
  }
}
