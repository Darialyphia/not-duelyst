export type Faction = {};

export type FactionId = keyof typeof factionLookup;

export const factionLookup = {
  haven: {},
  inferno: {},
  necropolis: {},
  academy: {},
  rampart: {},
  dungeon: {}
} as const satisfies Record<string, Faction>;
