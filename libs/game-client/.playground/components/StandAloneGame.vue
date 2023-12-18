<script setup lang="ts">
import { GameSession, type Player } from '@hc/sdk';
import { makeDummyState } from '~/dummy-state';

const dummyState = await makeDummyState('map1');
const serverSession = GameSession.createServerSession(dummyState);
const clientSession = GameSession.createClientSession(dummyState);
serverSession.subscribe(action => {
  clientSession.dispatchAction(action.serialize() as any); // @FIXME
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

const onEnd = ({ winner }: { winner: Player }) => {
  alert(`Game Over ! ${winner.id} won !`);
};
</script>

<template>
  <GameView
    :game-session="clientSession"
    @move="dispatch('MOVE', $event)"
    @end-turn="dispatch('END_TURN', {})"
    @use-skill="dispatch('USE_SKILL', $event)"
    @summon="dispatch('SUMMON', $event)"
    @end="onEnd"
  />
</template>
