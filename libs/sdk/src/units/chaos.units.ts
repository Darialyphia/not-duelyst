import { isDefined } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { isEnemy } from '../entity/entity-utils';
import { FACTIONS } from '../faction/faction-lookup';
import { Fireball } from '../skill/fireball.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { RangedAttack } from '../skill/ranged-attack';
import { isWithinCells } from '../skill/skill-utils';
import { StatModifier } from '../skill/state-modifier';
import { UNIT_KIND } from './constants';
import { UnitBlueprint } from './unit-lookup';

export const CHAOS_UNITS: UnitBlueprint[] = [
  {
    id: 'chaos-hero',
    spriteId: 'chaos-hero-placeholder',
    kind: UNIT_KIND.GENERAL,
    faction: FACTIONS.chaos,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 20,
    maxAp: 4,
    apRegenRate: 1,
    attack: 3,
    defense: 1,
    speed: 4,
    initiative: 8,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
      new (class extends StatModifier {
        getDescription() {
          return `Give an ally ${this.value} ${this.statKey}.`;
        }
      })({
        cost: 2,
        cooldown: 3,
        animationFX: 'cast',
        spriteId: 'bloodlust',
        name: 'Blood lust',
        soundFX: 'cast-placeholder',
        duration: Infinity,
        range: 3,
        statKey: 'attack',
        targetType: 'ally',
        value: 1
      })
    ]
  },
  {
    id: 'chaos-melee',
    spriteId: 'chaos-melee-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.chaos,
    summonCost: 2,
    summonCooldown: 2,
    maxHp: 8,
    maxAp: 3,
    apRegenRate: 1,
    attack: 3,
    defense: 0,
    speed: 4,
    initiative: 7,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    onSummoned: {
      getDescription() {
        return 'Deal 1 damage to a nearby unit.';
      },
      minTargetCount: 0,
      maxTargetCount: 1,
      isTargetable(ctx, point, caster) {
        return (
          isWithinCells(ctx, caster.position, point, 1) &&
          isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId)
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
    id: 'chaos-archer',
    spriteId: 'chaos-archer-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.chaos,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    maxAp: 3,
    apRegenRate: 1,
    attack: 2,
    defense: 0,
    speed: 4,
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
    id: 'chaos-tank',
    spriteId: 'chaos-tank-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.chaos,
    summonCost: 3,
    summonCooldown: 4,
    maxHp: 10,
    maxAp: 3,
    apRegenRate: 1,
    attack: 3,
    defense: 1,
    speed: 3,
    initiative: 6,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
      new StatModifier({
        name: 'Bulwark',
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
    id: 'chaos-caster',
    spriteId: 'chaos-caster-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.chaos,
    summonCost: 3,
    summonCooldown: 2,
    maxHp: 6,
    maxAp: 3,
    apRegenRate: 1,
    attack: 1,
    defense: 0,
    speed: 4,
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
        cooldown: 3,
        power: 3,
        range: 3,
        dotPower: 1,
        dotDuration: 2,
        spriteId: 'fireball'
      })
    ]
  }
];
