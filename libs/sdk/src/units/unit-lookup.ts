import { Values } from '@hc/shared';
import { Faction, FACTIONS } from '../faction/faction-lookup';

export const UNIT_KIND = {
  GENERAL: 'GENERAL',
  SOLDIER: 'SOLDIER'
} as const;

export type UnitKind = Values<typeof UNIT_KIND>;

export const isUnitId = (str: string): str is UnitId =>
  Object.keys(UNITS).includes(str);

export type UnitBlueprint = {
  kind: UnitKind;
  faction: Faction;

  summonCost: number;
  summonCooldown: number;

  maxHp: number;

  maxAp: number;
  apRegenRate: number;

  attack: number;
  defense: number;
  speed: number;
  initiative: number;
};

export type UnitId = keyof typeof UNITS;

export const UNITS = {
  havenGeneral1: {
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
    initiative: 8
  }
} as const satisfies Record<string, UnitBlueprint>;
