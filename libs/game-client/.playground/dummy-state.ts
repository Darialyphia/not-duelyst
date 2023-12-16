import type { SerializedGameState } from '@hc/sdk';

const width = 5;
const height = 5;
// const mapLayout = Array.from({ length: height }, (_, y) =>
//   Array.from({ length: width }, (_, x) => ({
//     position: { x, y, z: 0 },
//     tileId: x === 0 || y === 0 ? ('water' as const) : ('ground' as const)
//   }))
// ).flat();

export const dummyState: SerializedGameState = {
  entities: [],
  history: [],
  map: {
    width,
    height,
    startPositions: [
      { x: 4, y: 2, z: 0 },
      { x: 4, y: 3, z: 0 }
    ],
    // cells: mapLayout
    cells: [
      { position: { x: 0, y: 0, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 1, y: 0, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 2, y: 0, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 3, y: 0, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 4, y: 0, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 0, y: 1, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 1, y: 1, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 2, y: 1, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 3, y: 1, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 4, y: 1, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 0, y: 2, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 1, y: 2, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 2, y: 2, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 3, y: 2, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 4, y: 2, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 0, y: 3, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 1, y: 3, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 2, y: 3, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 3, y: 3, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 4, y: 3, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 0, y: 4, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 1, y: 4, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 2, y: 4, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 3, y: 4, z: 0 }, tileId: 'ground', spriteIds: ['grass'] },
      { position: { x: 4, y: 4, z: 0 }, tileId: 'ground', spriteIds: ['grass'] }
    ]
  },
  players: [
    {
      id: 'Player1',
      loadout: {
        units: {
          'haven-melee-placeholder': { cooldown: 0 },
          'haven-archer-placeholder': { cooldown: 0 },
          'haven-tank-placeholder': { cooldown: 0 },
          'haven-caster-placeholder': { cooldown: 0 }
        }
      },
      generalId: 'haven-hero-placeholder'
    },
    {
      id: 'Player2',
      loadout: {
        units: {
          'haven-melee-placeholder': { cooldown: 0 },
          'haven-archer-placeholder': { cooldown: 0 },
          'haven-tank-placeholder': { cooldown: 0 },
          'haven-caster-placeholder': { cooldown: 0 }
        }
      },
      generalId: 'haven-hero-placeholder'
    }
  ]
};
