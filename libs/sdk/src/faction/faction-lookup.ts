import { Values } from '@hc/shared';

export type Faction = {
  id: FactionName;
};

export const FACTION_NAMES = {
  FIRE: 'FIRE',
  WATER: 'WATER',
  AIR: 'AIR',
  EARTH: 'EARTH'
} as const;

export type FactionName = Values<typeof FACTION_NAMES>;
export type FactionId = keyof typeof FACTIONS;

export const FACTIONS = {
  [FACTION_NAMES.FIRE]: {
    id: FACTION_NAMES.FIRE
  },
  [FACTION_NAMES.WATER]: {
    id: FACTION_NAMES.WATER
  },
  [FACTION_NAMES.AIR]: {
    id: FACTION_NAMES.AIR
  },
  [FACTION_NAMES.EARTH]: {
    id: FACTION_NAMES.EARTH
  }
} as const satisfies Record<FactionName, Faction>;
