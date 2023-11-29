import { TERRAIN, TileDefinition } from './tile';

export const TILES = {
  water: {
    terrain: TERRAIN.WATER,
    isHalfTile: false
  },
  grass: {
    terrain: TERRAIN.GROUND,
    isHalfTile: false
  },
  grassHalf: {
    terrain: TERRAIN.GROUND,
    isHalfTile: true
  }
} as const satisfies Record<string, TileDefinition>;

export type TileId = keyof typeof TILES;
