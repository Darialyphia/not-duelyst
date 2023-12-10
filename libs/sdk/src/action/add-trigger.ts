import { EntityId } from '../entity/entity';
import { TriggerId } from '../trigger/trigger-builder';
import { TRIGGERS } from '../trigger/trigger-lookup';
import { GameAction } from './action';

export class AddTriggerAction extends GameAction<{
  triggerId: TriggerId;
  ownerId: EntityId;
}> {
  readonly name = 'ADD_TRIGGER';

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    const owner = this.ctx.entityManager.getEntityById(this.payload.ownerId);
    if (!owner) throw new Error(`Entity not found: ${this.payload.ownerId}`);

    const triggerBuilder = TRIGGERS[this.payload.triggerId];
    if (!triggerBuilder) throw new Error(`Triger not found: ${this.payload.triggerId}`);

    const trigger = triggerBuilder.builder(owner);

    this.ctx.emitter.on('game:action', action => {
      if (action.name !== trigger.actionName) return;
      trigger.execute(this.ctx, action, trigger);
    });
  }
}
