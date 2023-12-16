import { Values } from '@hc/shared';
import { TileDefinition } from './tile';

export const TERRAIN = {
  GROUND: 'GROUND',
  WATER: 'WATER'
} as const;
export type Terrain = Values<typeof TERRAIN>;

export const TILES: Record<string, TileDefinition> = {
  water: {
    terrain: TERRAIN.WATER,
    isHalfTile: false
  },
  ground: {
    terrain: TERRAIN.GROUND,
    isHalfTile: false
  },
  groudnHalf: {
    terrain: TERRAIN.GROUND,
    isHalfTile: true
  }
};

export type TileId = keyof typeof TILES;
