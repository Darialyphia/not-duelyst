import { DealDamageAction } from '../action/deal-damage.action';
import { skillBuilder } from './skill-builder';
import {
  skillTargetGuard,
  ensureTargetIsEnemy,
  ensureIsWithinCellsOfCaster,
  ensureIsAxisAlignedWithCaster,
  skillAreaGuard,
  ensureIsWithinCellsOfTarget
} from './skill-utils';

export const createSimpleMeleeAttack = ({
  baseDamage,
  cost,
  cooldown
}: {
  baseDamage: number;
  cost: number;
  cooldown: number;
}) =>
  skillBuilder()
    .id('melee_attack')
    .cost(cost)
    .cooldown(cooldown)
    .isTargetable(
      skillTargetGuard(
        ensureTargetIsEnemy,
        ensureIsWithinCellsOfCaster(1),
        ensureIsAxisAlignedWithCaster
      )
    )
    .isInAreaOfEffect(skillAreaGuard(ensureTargetIsEnemy, ensureIsWithinCellsOfTarget(0)))
    .execute((ctx, caster, target) => {
      const entity = ctx.entityManager.getEntityAt(target)!;
      ctx.actionQueue.push(
        new DealDamageAction(
          {
            amount: baseDamage,
            sourceId: caster.id,
            targets: [entity.id]
          },
          ctx
        )
      );
    })
    .build();
