import { AddEffectAction } from '../action/add-effect';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { FACTIONS } from '../faction/faction-lookup';
import { GameSession } from '../game-session';
import { Fireball } from '../skill/fireball.skill';
import { Heal } from '../skill/heal.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { RangedAttack } from '../skill/ranged-attack';
import { Skill } from '../skill/skill';
import { isAxisAligned, isSelf, isWithinCells } from '../skill/skill-utils';
import { Point3D } from '../types';
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
    maxHp: 25,
    maxAp: 4,
    apRegenRate: 1,
    attack: 3,
    defense: 1,
    speed: 4,
    initiative: 8,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
      new Heal({ cooldown: 2, cost: 2, power: 3, range: 2 })
    ]
  },
  {
    id: 'chaos-melee',
    spriteId: 'chaos-melee-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.chaos,
    summonCost: 2,
    summonCooldown: 1,
    maxHp: 10,
    maxAp: 3,
    apRegenRate: 1,
    attack: 3,
    defense: 0,
    speed: 5,
    initiative: 7,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'chaos-archer',
    spriteId: 'chaos-archer-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.chaos,
    summonCost: 2,
    summonCooldown: 2,
    maxHp: 8,
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
        power: 1,
        minRange: { x: 2, y: 2, z: 1 },
        maxRange: 4
      })
    ]
  },
  {
    id: 'chaos-tank',
    spriteId: 'chaos-tank-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.chaos,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 14,
    maxAp: 3,
    apRegenRate: 1,
    attack: 4,
    defense: 1,
    speed: 3,
    initiative: 6,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 1 }),
      new (class extends Skill {
        id = 'bulwark';

        isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
          return isSelf(caster, ctx.entityManager.getEntityAt(point));
        }

        isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
          return this.isWithinRange(ctx, point, caster);
        }

        isInAreaOfEffect(
          ctx: GameSession,
          point: Point3D,
          caster: Entity,
          target: Point3D
        ) {
          return isSelf(
            ctx.entityManager.getEntityAt(target)!,
            ctx.entityManager.getEntityAt(point)
          );
        }

        execute(ctx: GameSession, caster: Entity, target: Point3D) {
          const entity = ctx.entityManager.getEntityAt(target)!;
          ctx.actionQueue.push(
            new AddEffectAction(
              {
                sourceId: caster.id,
                attachedTo: entity.id,
                effectId: 'statModifier',
                effectArg: { duration: 3, statKey: 'defense', value: 1 }
              },
              ctx
            )
          );
        }
      })({
        cost: 2,
        cooldown: 3,
        animationFX: 'cast',
        spriteId: 'bulwark',
        soundFX: 'cast-placeholder'
      })
    ]
  },
  {
    id: 'chaos-caster',
    spriteId: 'chaos-caster-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.chaos,
    summonCost: 2,
    summonCooldown: 2,
    maxHp: 8,
    maxAp: 3,
    apRegenRate: 1,
    attack: 1,
    defense: 0,
    speed: 4,
    initiative: 7,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 1 }),
      new Fireball({
        cost: 2,
        cooldown: 4,
        power: 3,
        range: 3,
        dotPower: 1,
        dotDuration: 3,
        spriteId: 'fireball'
      })
    ]
  }
];
