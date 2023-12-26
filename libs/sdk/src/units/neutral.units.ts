import { FACTIONS } from '../faction/faction-lookup';
import { Heal } from '../skill/heal.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { UNIT_KIND } from './constants';
import { UnitBlueprint } from './unit-lookup';
import { HealAction } from '../action/heal.action';

export const NEUTRAL_UNITS: UnitBlueprint[] = [
  {
    id: 'neutral-healer',
    spriteId: 'neutral-healer',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.neutral,
    summonCost: 2,
    summonCooldown: 4,
    maxHp: 8,
    maxAp: 4,
    apRegenRate: 1,
    attack: 1,
    defense: 0,
    speed: 3,
    initiative: 8,
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
      execute(ctx, targets, caster) {
        ctx.actionQueue.push(
          new HealAction(
            {
              amount: 1,
              sourceId: caster.id,
              targets: ctx.entityManager
                .getNearbyAllies(caster.position, caster.playerId)
                .map(ally => ally.id)
            },
            ctx
          )
        );
      }
    }
  }
];
