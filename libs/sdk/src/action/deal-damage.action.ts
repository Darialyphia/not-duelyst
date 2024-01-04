import { Entity, EntityId, isEntityId } from '../entity/entity';
import { calculateDamage } from '../entity/entity-utils';
import { InteractableId } from '../interactable/interactable';
import { GameAction } from './action';
import { DieAction } from './die.action';

export class DealDamageAction extends GameAction<{
  amount: number;
  sourceId: EntityId | InteractableId;
  targets: EntityId[];
  isTrueDamage?: boolean;
}> {
  readonly name = 'DEAL_DAMAGE';

  get attacker() {
    if (!isEntityId(this.payload.sourceId, this.ctx)) return null;

    const attacker = this.ctx.entityManager.getEntityById(this.payload.sourceId);
    if (!attacker) throw new Error(`Entity not found: ${this.payload.sourceId}`);
    return attacker;
  }

  get targets() {
    return this.payload.targets.map(targetId => {
      const target = this.ctx.entityManager.getEntityById(targetId);
      if (!target) throw new Error(`Entity not found: ${targetId}`);
      return target;
    });
  }

  get logMessage() {
    return `${this.attacker?.id ?? this.payload.sourceId} deals damage to ${this.targets
      .map(t => t.unitId)
      .join(', ')}.`;
  }

  getDamage(target: Entity) {
    if (!this.attacker) return this.payload.amount;

    return calculateDamage(
      this.payload.amount,
      target.defense,
      this.payload.isTrueDamage
    );
  }

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;
    if (!this.payload.targets.length) return;

    this.ctx.fxContext.playSoundOnce('hit-placeholder');

    await Promise.all(
      this.payload.targets.map(targetId => {
        const target = this.ctx.entityManager.getEntityById(targetId)!;
        const amount = this.getDamage(target);

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
          offset: { x: 0, y: 32 },
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
    this.payload.targets.forEach(targetId => {
      const target = this.ctx.entityManager.getEntityById(targetId)!;

      if (this.attacker) {
        this.attacker.dealDamage(this.payload.amount, target, this.payload.isTrueDamage);
      } else {
        target.takeDamage(this.payload.amount, null, this.payload.isTrueDamage);
      }

      if (target.hp <= 0) {
        this.ctx.actionQueue.push(
          new DieAction({ entityId: targetId, sourceId: this.payload.sourceId }, this.ctx)
        );
      }
    });
  }
}
