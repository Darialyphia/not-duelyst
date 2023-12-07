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

const debugServer = () => {
  console.log(serverSession);
};
const debugClient = () => {
  console.log(clientSession);
};
</script>

<template>
  <button @click="debugServer">Debug server session</button>
  <button @click="debugClient">Debug client session</button>
  <GameView
    :game-session="clientSession"
    @move="dispatch('MOVE', $event)"
    @end-turn="dispatch('END_TURN', {})"
    @use-skill="dispatch('USE_SKILL', $event)"
    @summon="dispatch('SUMMON', $event)"
  />
</template>
