import { isDefined } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { isEnemy } from '../entity/entity-utils';
import { FACTIONS } from '../faction/faction-lookup';
import { Fireball } from '../skill/fireball.skill';
import { Heal } from '../skill/heal.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { RangedAttack } from '../skill/ranged-attack';
import { isWithinCells } from '../skill/skill-utils';
import { StatModifier } from '../skill/stat-modifier';
import { UNIT_KIND } from './constants';
import { UnitBlueprint } from './unit-lookup';

export const HAVEN_UNITS: UnitBlueprint[] = [
  {
    id: 'haven-hero',
    spriteId: 'haven-hero',
    kind: UNIT_KIND.GENERAL,
    faction: FACTIONS.haven,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 20,
    maxAp: 4,
    apRegenRate: 1,
    attack: 3,
    defense: 1,
    speed: 3,
    initiative: 8,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
      new Heal({ cooldown: 2, cost: 2, power: 3, range: 2 })
    ]
  },
  {
    id: 'haven-melee',
    spriteId: 'haven-melee',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.haven,
    summonCost: 2,
    summonCooldown: 2,
    maxHp: 7,
    maxAp: 3,
    apRegenRate: 1,
    attack: 3,
    defense: 0,
    speed: 3,
    initiative: 7,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    onSummoned: {
      getDescription() {
        return 'Deal 1 damage to a nearby unit.';
      },
      minTargetCount: 0,
      maxTargetCount: 1,
      isTargetable(ctx, point, summonedPoint) {
        return (
          isWithinCells(ctx, summonedPoint, point, 1) &&
          isEnemy(
            ctx,
            ctx.entityManager.getEntityAt(point)?.id,
            ctx.playerManager.getActivePlayer().id
          )
        );
      },
      execute(ctx, targets, caster) {
        ctx.actionQueue.push(
          new DealDamageAction(
            {
              amount: 1,
              sourceId: caster.id,
              targets: targets
                .map(point => ctx.entityManager.getEntityAt(point)?.id)
                .filter(isDefined),
              isTrueDamage: true
            },
            ctx
          )
        );
      }
    }
  },
  {
    id: 'haven-archer',
    spriteId: 'haven-archer',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.haven,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    maxAp: 3,
    apRegenRate: 1,
    attack: 2,
    defense: 0,
    speed: 3,
    initiative: 7,
    skills: [
      new RangedAttack({
        cooldown: 1,
        cost: 0,
        power: 0,
        minRange: { x: 2, y: 2, z: 1 },
        maxRange: 3
      })
    ]
  },
  {
    id: 'haven-tank',
    spriteId: 'haven-tank',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.haven,
    summonCost: 3,
    summonCooldown: 4,
    maxHp: 10,
    maxAp: 3,
    apRegenRate: 1,
    attack: 3,
    defense: 1,
    speed: 2,
    initiative: 6,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
      new StatModifier({
        name: 'Bulwatk',
        spriteId: 'bulwark',
        animationFX: 'cast',
        soundFX: 'cast-placeholder',
        cost: 2,
        cooldown: 5,
        duration: 2,
        statKey: 'defense',
        range: 0,
        targetType: 'self',
        value: 1
      })
    ]
  },
  {
    id: 'haven-caster',
    spriteId: 'haven-caster',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.haven,
    summonCost: 3,
    summonCooldown: 3,
    maxHp: 6,
    maxAp: 3,
    apRegenRate: 1,
    attack: 1,
    defense: 0,
    speed: 3,
    initiative: 7,
    skills: [
      new RangedAttack({
        cooldown: 1,
        cost: 0,
        power: 0,
        minRange: { x: 2, y: 2, z: 1 },
        maxRange: 3
      }),
      new Fireball({
        cost: 2,
        cooldown: 2,
        power: 3,
        range: 3,
        dotPower: 1,
        dotDuration: 2,
        spriteId: 'fireball'
      })
    ]
  }
];
