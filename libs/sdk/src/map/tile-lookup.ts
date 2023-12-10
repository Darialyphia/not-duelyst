import { Values } from '@hc/shared';
import { TileDefinition } from './tile';

export const TERRAIN = {
  GROUND: 'GROUND',
  WATER: 'WATER'
} as const;
export type Terrain = Values<typeof TERRAIN>;

export const TILES: Record<string, TileDefinition> = {
  'placeholder-water': {
    terrain: TERRAIN.WATER,
    isHalfTile: false
  },
  'placeholder-ground': {
    terrain: TERRAIN.GROUND,
    isHalfTile: false
  },
  'placeholder-ground-half': {
    terrain: TERRAIN.GROUND,
    isHalfTile: true
  },
  'placeholder-ground-half-ramp-south': {
    terrain: TERRAIN.GROUND,
    isHalfTile: true,
    isRamp: true
  },
  'placeholder-ground-ramp-south': {
    terrain: TERRAIN.GROUND,
    isHalfTile: true,
    isRamp: true
  },

  water: {
    terrain: TERRAIN.WATER,
    isHalfTile: false
  },
  dirt: {
    terrain: TERRAIN.GROUND,
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
};

export type TileId = keyof typeof TILES;
