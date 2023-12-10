import { keyBy } from 'lodash-es';
import { Trigger, TriggerId, triggerBuilder } from './trigger-builder';
import { Entity } from '../entity/entity';
import { DealDamageAction } from '../action/deal-damage.action';
import { isAlly, isEnemy } from '../entity/entity-utils';

export const TRIGGERS = keyBy(
  [
    {
      id: 'test_trigger',
      builder: (owner: Entity) =>
        triggerBuilder()
          .id('test_trigger')
          .duration(3)
          .owner(owner)
          .actionName('DEAL_DAMAGE')
          .execute((ctx, _action, trigger: Trigger) => {
            const action = _action as DealDamageAction;

            if (isAlly(ctx, action.payload.sourceId, trigger.owner.playerId)) return;
            ctx.actionQueue.push(
              new DealDamageAction(
                {
                  amount: 1,
                  sourceId: trigger.owner.id,
                  targets: [action.payload.sourceId],
                  isTrueDamage: true
                },
                ctx
              )
            );
          })
          .build()
    }
  ],
  'id'
) satisfies Record<TriggerId, { id: string; builder: (owner: Entity) => Trigger }>;
