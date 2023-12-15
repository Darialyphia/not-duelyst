import { FACTIONS } from '../faction/faction-lookup';
import { Heal } from '../skill/heal.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { UNIT_KIND } from './constants';
import { UnitBlueprint } from './unit-lookup';

export const HAVEN_UNITS: UnitBlueprint[] = [
  {
    id: 'haven-hero-placeholder',
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
      new MeleeAttack({ cooldown: 1, cost: 1, power: 1 }),
      new Heal({ cooldown: 1, cost: 1, power: 3, range: 2 })
    ]
  },
  {
    id: 'haven-melee-placeholder',
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
    skills: [new MeleeAttack({ cooldown: 1, cost: 1, power: 1 })]
  },
  {
    id: 'haven-archer-placeholder',
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
    skills: [new MeleeAttack({ cooldown: 1, cost: 1, power: 1 })]
  },
  {
    id: 'haven-tank-placeholder',
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
    skills: [new MeleeAttack({ cooldown: 1, cost: 1, power: 1 })]
  }
];
