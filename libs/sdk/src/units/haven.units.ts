import { AddTriggerAction } from '../action/add-trigger';
import { DealDamageAction } from '../action/deal-damage.action';
import { HealAction } from '../action/heal.action';
import { isAlly } from '../entity/entity-utils';
import { FACTIONS } from '../faction/faction-lookup';
import { createSimpleMeleeAttack } from '../skill/common-skills';
import { skillBuilder } from '../skill/skill-builder';
import { isSelf, isWithinCells } from '../skill/skill-utils';
import { UNIT_KIND } from './constants';
import { UnitBlueprint } from './unit-lookup';

export const HAVEN_UNITS: UnitBlueprint[] = [
  {
    id: 'haven_general_1',
    kind: UNIT_KIND.GENERAL,
    faction: FACTIONS.haven,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    maxAp: 4,
    apRegenRate: 1,
    attack: 4,
    defense: 1,
    speed: 5,
    initiative: 8,
    skills: [
      createSimpleMeleeAttack({ cost: 0, cooldown: 1, baseDamage: 1 }),

      skillBuilder()
        .id('retribution')
        .cost(1)
        .cooldown(3)
        .animationFX('cast')
        .soundFX('cast-placeholder')
        .isTargetable((ctx, point, caster) => {
          return isSelf(caster, ctx.entityManager.getEntityAt(point));
        })
        .isInAreaOfEffect((ctx, point, caster) => {
          return isSelf(caster, ctx.entityManager.getEntityAt(point));
        })
        .execute((ctx, caster) => {
          ctx.actionQueue.push(
            new AddTriggerAction(
              {
                triggerId: 'retribution',
                ownerId: caster.id
              },
              ctx
            )
          );
        })
        .build(),

      skillBuilder()
        .id('heal')
        .cost(1)
        .cooldown(2)
        .animationFX('cast')
        .soundFX('cast-placeholder')
        .isTargetable((ctx, point, caster) => {
          return (
            isAlly(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
            isWithinCells(caster.position, point, 3)
          );
        })
        .isInAreaOfEffect((ctx, point, caster, target) => {
          return (
            isAlly(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
            isWithinCells(target, point, 0)
          );
        })
        .execute((ctx, caster, target) => {
          const entity = ctx.entityManager.getEntityAt(target)!;

          ctx.actionQueue.push(
            new HealAction(
              {
                amount: 3,
                sourceId: caster.id,
                targets: [entity.id]
              },
              ctx
            )
          );
        })
        .build()
    ]
  },
  {
    id: 'haven_soldier_1',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.haven,
    summonCost: 1,
    summonCooldown: 1,
    maxHp: 10,
    maxAp: 3,
    apRegenRate: 1,
    attack: 2,
    defense: 0,
    speed: 5,
    initiative: 7,
    skills: [createSimpleMeleeAttack({ cost: 0, cooldown: 1, baseDamage: 1 })]
  }
];
