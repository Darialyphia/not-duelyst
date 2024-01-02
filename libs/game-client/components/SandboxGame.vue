<script setup lang="ts">
import { GameSession, type Player, type SerializedGameState } from '@hc/sdk';

const { initialState } = defineProps<{ initialState: SerializedGameState }>();
const serverSession = GameSession.createServerSession(initialState);
const clientSession = GameSession.createClientSession(initialState);
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
      playerId: clientSession.playerManager.getActivePlayer().id
    }
  });
};

const onEnd = ({ winner }: { winner: Player }) => {
  alert(`Game Over ! ${winner.id} won !`);
};
</script>

<template>
  <GameView
    :player-id="null"
    :game-session="clientSession"
    @move="dispatch('MOVE', $event)"
    @end-turn="dispatch('END_TURN', {})"
    @use-skill="dispatch('USE_SKILL', $event)"
    @summon="dispatch('SUMMON', $event)"
    @surrender="dispatch('SURRENDER', {})"
    @end="onEnd"
  />
</template>
