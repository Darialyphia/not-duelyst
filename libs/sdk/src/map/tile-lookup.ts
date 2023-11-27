import { TERRAIN, TileDefinition } from './tile';

export const tileLookup = {
  grass: {
    terrain: TERRAIN.GROUND,
    isHalfTile: false
  }
} as const satisfies Record<string, TileDefinition>;

export type TileId = keyof typeof tileLookup;
