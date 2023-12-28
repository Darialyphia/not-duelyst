import { FACTIONS } from '../faction/faction-lookup';
import { Heal } from '../skill/heal.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { UNIT_KIND } from './constants';
import { UnitBlueprint } from './unit-lookup';
import { HealAction } from '../action/heal.action';
import { AddEffectAction } from '../action/add-effect.action';
import { PlunderOnKill } from '../effect/plunder-on-kill.effect';

export const NEUTRAL_UNITS: UnitBlueprint[] = [
  {
    id: 'neutral-healer',
    spriteId: 'neutral-healer',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.neutral,
    summonCost: 2,
    summonCooldown: 4,
    maxHp: 8,
    maxAp: 3,
    apRegenRate: 1,
    attack: 1,
    defense: 0,
    speed: 3,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
      new Heal({ cooldown: 2, cost: 2, power: 2, range: 2 })
    ],
    onSummoned: {
      getDescription() {
        return 'Restore 1 hp to all nearby allies.';
      },
      minTargetCount: 0,
      maxTargetCount: 0,
      isTargetable() {
        return false;
      },
      execute(ctx, targets, summonedEntity) {
        ctx.actionQueue.push(
          new HealAction(
            {
              amount: 1,
              sourceId: summonedEntity.id,
              targets: ctx.entityManager
                .getNearbyAllies(summonedEntity.position, summonedEntity.playerId)
                .map(ally => ally.id)
            },
            ctx
          )
        );
      }
    }
  },

  {
    id: 'neutral-tank',
    spriteId: 'neutral-tank',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.neutral,
    summonCost: 3,
    summonCooldown: 4,
    maxHp: 8,
    maxAp: 3,
    apRegenRate: 1,
    attack: 2,
    defense: 1,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    onSummoned: {
      getDescription() {
        return 'Taunt nearby enemies for 2 turns';
      },
      minTargetCount: 0,
      maxTargetCount: 0,
      isTargetable() {
        return false;
      },
      execute(ctx, targets, summonedEntity) {
        const nearby = ctx.entityManager.getNearbyEnemies(
          summonedEntity.position,
          summonedEntity.playerId
        );

        nearby.forEach(entity => {
          ctx.actionQueue.push(
            new AddEffectAction(
              {
                attachedTo: entity.id,
                effectId: 'taunted',
                effectArg: { duration: 2, radius: 1 },
                sourceId: summonedEntity.id
              },
              ctx
            )
          );
        });
      }
    }
  },

  {
    id: 'neutral-thief',
    spriteId: 'neutral-thief',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.neutral,
    summonCost: 3,
    summonCooldown: 4,
    maxHp: 6,
    maxAp: 3,
    apRegenRate: 1,
    attack: 2,
    defense: 0,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    triggers: [
      {
        description: `When this unit takes down an enemy, gain 1 gold.`,
        getEffect: (ctx, entity) => {
          return new PlunderOnKill(ctx, entity, {
            duration: Infinity,
            amount: 1
          });
        }
      }
    ]
  }
];
