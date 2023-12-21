import { FACTIONS } from '../faction/faction-lookup';
import { Fireball } from '../skill/fireball.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { RangedAttack } from '../skill/ranged-attack';
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
          return `Give an ally ${this.value}.`;
        }
      })({
        cost: 2,
        cooldown: 3,
        animationFX: 'cast',
        spriteId: 'bloodlust',
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
    summonCooldown: 1,
    maxHp: 8,
    maxAp: 3,
    apRegenRate: 1,
    attack: 3,
    defense: 0,
    speed: 4,
    initiative: 7,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
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
        power: 1,
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
    summonCost: 2,
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
        cost: 2,
        cooldown: 5,
        animationFX: 'cast',
        soundFX: 'cast-placeholder',
        spriteId: 'bulwark',
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
    summonCost: 2,
    summonCooldown: 2,
    maxHp: 6,
    maxAp: 3,
    apRegenRate: 1,
    attack: 1,
    defense: 0,
    speed: 4,
    initiative: 7,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
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
