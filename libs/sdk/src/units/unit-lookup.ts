import { FACTIONS, Faction } from '../faction/faction-lookup';
import { keyBy } from 'lodash-es';
import { Skill } from '../skill/skill';
import { UNIT_KIND, UnitKind } from './constants';
// import { HAVEN_UNITS } from './haven.units';
// import { CHAOS_UNITS } from './chaos.units';
import { Point3D } from '../types';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
// import { NEUTRAL_UNITS } from './neutral.units';
import { Effect } from '../effect/effect';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { Fireball } from '../skill/fireball.skill';
import { RARITY, Rarity } from '../enums';
import { Teleport } from '../skill/teleport.skill';

export type UnitId = string;

export const isUnitId = (str: string): str is UnitId => Object.keys(UNITS).includes(str);

export type UnitBlueprint = {
  id: string;
  spriteId: string;
  kind: UnitKind;
  factions: Faction[];
  rarity: Rarity;

  summonCost: number;
  summonCooldown: number;

  maxHp: number;

  attack: number;
  speed: number;

  skills: Array<Skill>;

  effects?: {
    getEffect(ctx: GameSession, entity: Entity): Effect;
    description: string;
  }[];
  onSummoned?: {
    getDescription(unit: UnitBlueprint): string;
    minTargetCount: number;
    maxTargetCount: number;
    isTargetable(ctx: GameSession, point: Point3D, summonedPoint: Point3D): boolean;
    execute(ctx: GameSession, targets: Point3D[], summonedentity: Entity): void;
  };
};

export const UNITS = keyBy(
  // [...NEUTRAL_UNITS, ...HAVEN_UNITS, ...CHAOS_UNITS],
  [
    {
      id: 'melee-fire-air',
      spriteId: 'midas',
      kind: UNIT_KIND.SOLDIER,
      factions: [FACTIONS.FIRE, FACTIONS.AIR],
      rarity: RARITY.COMMON,
      summonCost: 2,
      summonCooldown: 4,
      maxHp: 7,
      attack: 2,
      speed: 3,
      skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
    },
    {
      id: 'melee-fire-fire-air',
      spriteId: 'haven-hero2',
      kind: UNIT_KIND.GENERAL,
      factions: [FACTIONS.AIR, FACTIONS.DARK, FACTIONS.FIRE],
      rarity: RARITY.LEGENDARY,
      summonCost: 2,
      summonCooldown: 4,
      maxHp: 10,
      attack: 2,
      speed: 3,
      skills: [
        new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
        new Fireball({
          cooldown: 1,
          cost: 0,
          power: 0,
          dotDuration: 2,
          dotPower: 1,
          range: 2,
          spriteId: 'fireball'
        }),
        new MeleeAttack({
          cooldown: 1,
          cost: 0,
          power: 0,
          spriteId: 'vulnerable',
          id: 'test'
        })
      ]
    },
    {
      id: 'melee-fire',
      spriteId: 'pegasus-knight',
      kind: UNIT_KIND.SOLDIER,
      factions: [FACTIONS.FIRE],
      rarity: RARITY.LEGENDARY,
      summonCost: 2,
      summonCooldown: 4,
      maxHp: 7,
      attack: 2,
      speed: 3,
      skills: [
        new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
        new MeleeAttack({ cooldown: 1, cost: 0, power: 0, spriteId: 'waterball' }),
        new MeleeAttack({ cooldown: 1, cost: 0, power: 0, spriteId: 'thorns' })
      ]
    },
    {
      id: 'melee-water',
      spriteId: 'blind-monk',
      kind: UNIT_KIND.SOLDIER,
      factions: [FACTIONS.WATER],
      rarity: RARITY.RARE,
      summonCost: 2,
      summonCooldown: 4,
      maxHp: 7,
      attack: 2,
      speed: 3,
      skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
    },
    {
      id: 'melee-air',
      spriteId: 'air-dark-dragon',
      kind: UNIT_KIND.SOLDIER,
      factions: [FACTIONS.DARK, FACTIONS.AIR, FACTIONS.AIR],
      rarity: RARITY.LEGENDARY,
      summonCost: 5,
      summonCooldown: 5,
      maxHp: 10,
      attack: 4,
      speed: 3,
      skills: [
        new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
        new Fireball({
          cooldown: 2,
          cost: 0,
          power: 0,
          dotDuration: 2,
          dotPower: 1,
          range: 2,
          spriteId: 'waterball2'
        }),
        new Teleport({
          cooldown: 3,
          maxRange: 3,
          minRange: 0,
          cost: 0
        })
      ]
    },
    {
      id: 'melee-earth',
      spriteId: 'barbarian',
      kind: UNIT_KIND.SOLDIER,
      factions: [FACTIONS.EARTH],
      rarity: RARITY.COMMON,
      summonCost: 2,
      summonCooldown: 4,
      maxHp: 7,
      attack: 2,
      speed: 3,
      skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
    },
    {
      id: 'melee-light',
      spriteId: 'chaos-hero2',
      kind: UNIT_KIND.SOLDIER,
      factions: [FACTIONS.LIGHT],
      rarity: RARITY.COMMON,
      summonCost: 2,
      summonCooldown: 4,
      maxHp: 7,
      attack: 2,
      speed: 3,
      skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
    },
    {
      id: 'melee-dark',
      spriteId: 'necromancer2',
      kind: UNIT_KIND.SOLDIER,
      factions: [FACTIONS.DARK],
      rarity: RARITY.COMMON,
      summonCost: 2,
      summonCooldown: 4,
      maxHp: 7,
      attack: 2,
      speed: 3,
      skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0, spriteId: 'fire2' })]
    },
    {
      id: 'necromancer',
      spriteId: 'midas',
      kind: UNIT_KIND.SOLDIER,
      factions: [FACTIONS.DARK, FACTIONS.DARK],
      rarity: RARITY.COMMON,
      summonCost: 2,
      summonCooldown: 4,
      maxHp: 7,
      attack: 2,
      speed: 3,
      skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
    }
  ] as UnitBlueprint[],
  'id'
) satisfies Record<UnitId, UnitBlueprint>;
