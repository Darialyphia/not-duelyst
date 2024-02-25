import { RARITY } from '../../../enums';
import { FACTIONS } from '../../../faction/faction-lookup';
import { MeleeAttack } from '../../../skill/melee-attack.skill';
import { UNIT_KIND } from '../../constants';
import { UnitBlueprint } from '../../unit-lookup';

export const coreSet: UnitBlueprint[] = [
  {
    id: 'dark-general',
    spriteId: 'chaos-hero2',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.DARK, FACTIONS.DARK, FACTIONS.DARK],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'light-general',
    spriteId: 'haven-hero2',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.LIGHT, FACTIONS.LIGHT, FACTIONS.LIGHT],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'fire-general',
    spriteId: 'fire-hero',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.FIRE, FACTIONS.FIRE, FACTIONS.FIRE],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'air-general',
    spriteId: 'air-hero',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.AIR, FACTIONS.AIR, FACTIONS.AIR],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'water-general',
    spriteId: 'water-hero',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.WATER, FACTIONS.WATER, FACTIONS.WATER],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'earth-general',
    spriteId: 'earth-hero',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.EARTH, FACTIONS.EARTH, FACTIONS.EARTH],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'air-elemental',
    spriteId: 'air-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.AIR],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'dark-elemental',
    spriteId: 'dark-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.DARK],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'fire-elemental',
    spriteId: 'fire-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.FIRE],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'earth-elemental',
    spriteId: 'earth-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.EARTH],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'light-elemental',
    spriteId: 'light-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.LIGHT],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'water-elemental',
    spriteId: 'water-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.WATER],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  }
];
