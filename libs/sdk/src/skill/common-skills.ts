import { DealDamageAction } from '../action/deal-damage.action';
import { isEnemy } from '../entity/entity-utils';
import { skillBuilder } from './skill-builder';
import { isAxisAligned, isWithinCells, isWithinRange } from './skill-utils';

export const createSimpleMeleeAttack = ({
  baseDamage,
  cost,
  cooldown,
  animationFX = 'attack',
  soundFX = 'attack-placeholder'
}: {
  baseDamage: number;
  cost: number;
  cooldown: number;
  animationFX?: string;
  soundFX?: string;
}) =>
  skillBuilder()
    .id('melee_attack')
    .cost(cost)
    .cooldown(cooldown)
    .animationFX(animationFX)
    .soundFX(soundFX)
    .isTargetable((ctx, point, caster) => {
      return (
        isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
        isWithinCells(caster.position, point, 1) &&
        isAxisAligned(point, caster.position)
      );
    })
    .isInAreaOfEffect((ctx, point, caster, target) => {
      return isWithinCells(target, point, 1);
    })
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
