export type Faction = {};

export type FactionId = keyof typeof FACTIONS;

export const FACTIONS = {
  haven: {},
  inferno: {},
  necropolis: {},
  academy: {},
  rampart: {},
  dungeon: {}
} as const satisfies Record<string, Faction>;
