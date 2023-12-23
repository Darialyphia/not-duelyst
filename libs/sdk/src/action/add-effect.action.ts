import { EFFECTS } from '../effect/effect-lookup';
import { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class AddEffectAction<T extends keyof typeof EFFECTS> extends GameAction<{
  effectId: T;
  sourceId: EntityId;
  attachedTo: EntityId;
  effectArg: InstanceType<(typeof EFFECTS)[T]>['meta'];
}> {
  readonly name = 'ADD_EFFECT';

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    const attachedTo = this.ctx.entityManager.getEntityById(this.payload.attachedTo);
    if (!attachedTo) throw new Error(`Entity not found: ${this.payload.attachedTo}`);
    const source = this.ctx.entityManager.getEntityById(this.payload.sourceId);
    if (!source) throw new Error(`Entity not found: ${this.payload.sourceId}`);

    const effectClass = EFFECTS[this.payload.effectId];

    // @ts-expect-error
    const effect = new effectClass(this.ctx, source, this.payload.effectArg);
    effect.attach(attachedTo);
  }
}
