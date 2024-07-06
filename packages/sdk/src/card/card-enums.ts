import type { Values } from '@game/shared';

export const CARD_KINDS = {
  MINION: 'MINION',
  GENERAL: 'GENERAL',
  SPELL: 'SPELL',
  ARTIFACT: 'ARTIFACT'
} as const;

export type CardKind = Values<typeof CARD_KINDS>;

export class Faction {
  constructor(
    public id: string,
    public name: string
  ) {}

  equals(faction: Faction) {
    return faction.id === this.id;
  }
}

export const FACTION_IDS = {
  F1: 'f1',
  F2: 'f2',
  F3: 'f3',
  F4: 'f4',
  F5: 'f5',
  F6: 'f6'
} as const;

export type FactionId = Values<typeof FACTION_IDS>;

export const FACTIONS = {
  F1: new Faction(FACTION_IDS.F1, 'Lyonar'),
  F2: new Faction(FACTION_IDS.F2, 'Songhai'),
  F3: new Faction(FACTION_IDS.F3, 'Vetruvian'),
  F4: new Faction(FACTION_IDS.F4, 'Abyssian'),
  F5: new Faction(FACTION_IDS.F5, 'Magmar'),
  F6: new Faction(FACTION_IDS.F6, 'Vanar')
} as const satisfies Record<string, Faction>;

export const getFactionById = (id: FactionId) =>
  Object.values(FACTIONS).find(f => f.id === id);

export const RARITIES = {
  BASIC: 'basic',
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  TOKEN: 'token'
} as const;

export type Rarity = Values<typeof RARITIES>;

export const INTERCEPTOR_PRIORITIES = {
  FIRST: 0,
  FINAL: 999
};
