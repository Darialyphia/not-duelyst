<script setup lang="ts">
import { GameSession, type SerializedGameState } from '@hc/sdk';
const width = 13;
const height = 13;
const mapLayout = Array.from({ length: height }, (_, y) =>
  Array.from({ length: width }, (_, x) => ({
    position: { x, y, z: 0 },
    tileId: 'grass' as const
  }))
).flat();

const initialState: SerializedGameState = {
  entities: [],
  history: [],
  map: {
    width,
    height,
    startPositions: [
      { x: 4, y: 6, z: 1 },
      { x: 7, y: 6, z: 1 }
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
const serverSession = GameSession.createServerSession(initialState);
const clientSession = GameSession.createClientSession(initialState);
serverSession.subscribe(action => {
  clientSession.dispatchAction(action);
});

const dispatch = (
  type: Parameters<(typeof serverSession)['dispatchPlayerInput']>[0]['type'],
  payload: any
) => {
  serverSession.dispatchPlayerInput({
    type,
    payload: {
      ...payload,
      playerId: serverSession.getState().activeEntity.playerId
    }
  });
};
</script>

<template>
  <header class="flex gap-3 p-3">
    <button @click="dispatch('END_TURN', {})">End turn</button>
  </header>
  <GameView :game-session="clientSession" />
</template>

<style scoped>
header {
  display: flex;
  gap: var(--size-3);
  padding: var(--size-3);
}
button {
  cursor: pointer;
  padding: var(--size-2) var(--size-3);
  color: white;
  background-color: var(--blue-7);
}
</style>
