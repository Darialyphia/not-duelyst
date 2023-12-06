<script setup lang="ts">
import { GameSession } from '@hc/sdk';
import { dummyState } from '~/dummy-state';

const serverSession = GameSession.createServerSession(dummyState);
const clientSession = GameSession.createClientSession(dummyState);
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
  <GameView :game-session="clientSession" @move="dispatch('MOVE', $event)" />
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
