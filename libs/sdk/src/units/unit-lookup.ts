import { Values } from '@hc/shared';
import { Faction, factionLookup } from '../faction/faction-lookup';

const UNIT_KIND = {
  GENERAL: 'GENERAL',
  SOLDIER: 'SOLDIER'
} as const;

export type UnitKind = Values<typeof UNIT_KIND>;

export type UnitBlueprint = {
  kind: UnitKind;
  faction: Faction;

  maxHp: number;

  maxAp: number;
  apRegenRate: number;

  attack: number;
  defense: number;
  speed: number;
  initiative: number;
};

export type UnitId = keyof typeof unitLookup;

export const unitLookup = {
  havenGeneral1: {
    kind: UNIT_KIND.GENERAL,
    faction: factionLookup.haven,
    maxHp: 25,
    maxAp: 4,
    apRegenRate: 1,
    attack: 4,
    defense: 1,
    speed: 5,
    initiative: 8
  }
} as const satisfies Record<string, UnitBlueprint>;
