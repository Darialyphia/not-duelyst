import { EffectId } from '../effect/effect';
import { EFFECTS } from '../effect/effect-lookup';
import { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class AddEffectAction extends GameAction<{
  effectId: EffectId;
  ownerId: EntityId;
}> {
  readonly name = 'ADD_EFFECT';

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    const owner = this.ctx.entityManager.getEntityById(this.payload.ownerId);
    if (!owner) throw new Error(`Entity not found: ${this.payload.ownerId}`);

    const effectClass = EFFECTS[this.payload.effectId];

    const effect = new effectClass(this.ctx);
    effect.attach(owner);
  }
}
