import { Values } from '@hc/shared';

export type Faction = {
  id: FactionName;
};

export const FACTION_NAMES = {
  HAVEN: 'haven',
  CHAOS: 'chaos'
} as const;

export type FactionName = Values<typeof FACTION_NAMES>;
export type FactionId = keyof typeof FACTIONS;

export const FACTIONS = {
  haven: {
    id: 'haven'
  },
  chaos: {
    id: 'chaos'
  }
} as const satisfies Record<FactionName, Faction>;
