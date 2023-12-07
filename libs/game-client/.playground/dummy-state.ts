import type { SerializedGameState } from '@hc/sdk';

const width = 3;
const height = 3;
const mapLayout = Array.from({ length: height }, (_, y) =>
  Array.from({ length: width }, (_, x) => ({
    position: { x, y, z: 0 },
    tileId: 'grass' as const
  }))
).flat();

export const dummyState: SerializedGameState = {
  entities: [],
  history: [],
  map: {
    width,
    height,
    startPositions: [
      { x: 0, y: 0, z: 0 },
      { x: 2, y: 2, z: 0 }
    ],
    cells: mapLayout
  },
  players: [
    {
      id: 'Player1',
      loadout: {
        units: {
          haven_soldier_1: { cooldown: 0 }
        }
      },
      generalId: 'haven_general_1'
    },
    {
      id: 'Player2',
      loadout: {
        units: {
          haven_soldier_1: { cooldown: 0 }
        }
      },
      generalId: 'haven_general_1'
    }
  ]
};
