import { Values } from '@hc/shared';

export type Faction = {
  id: FactionName;
};

export const FACTION_NAMES = {
  HAVEN: 'haven',
  CHAOS: 'chaos',
  NEUTRAL: 'neutral'
} as const;

export type FactionName = Values<typeof FACTION_NAMES>;
export type FactionId = keyof typeof FACTIONS;

export const FACTIONS = {
  haven: {
    id: 'haven'
  },
  chaos: {
    id: 'chaos'
  },
  neutral: {
    id: 'neutral'
  }
} as const satisfies Record<FactionName, Faction>;
