<script setup lang="ts">
import { GameSession } from '@hc/sdk';
const width = 9;
const height = 5;
const mapLayout = Array.from({ length: height }, (_, y) =>
  Array.from({ length: width }, (_, x) => ({
    position: { x, y, z: 0 },
    tileId: 'grass' as const
  }))
).flat();

const serverSesion = GameSession.createServerSession({
  entities: [],
  history: [],
  map: {
    width,
    height,
    startPositions: [
      { x: 1, y: 2, z: 1 },
      { x: 7, y: 2, z: 1 }
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
});
</script>
<template>
  <GameView />
</template>
