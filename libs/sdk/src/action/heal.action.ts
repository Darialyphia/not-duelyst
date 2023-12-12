import { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class HealAction extends GameAction<{
  amount: number;
  sourceId: EntityId;
  targets: EntityId[];
}> {
  readonly name = 'HEAL';

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    await Promise.all(
      this.payload.targets.map(target => {
        this.ctx.fxContext?.displayText(String(this.payload.amount), target, {
          color: 0x00ff00,
          duration: 1,
          path: [
            { x: 0, y: 25, alpha: 0, scale: 0 },
            { x: 0, y: 0, alpha: 0, scale: 1 },
            { x: 0, y: 0, alpha: 1, scale: 1 }
          ]
        });
        return this.ctx.fxContext?.addChildSprite('heal_01', target, {
          waitUntilAnimationDone: false,
          offset: { x: 0, y: 24 },
          scale: 1
        });
      })
    );
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
