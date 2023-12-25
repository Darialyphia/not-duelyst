<script setup lang="ts">
import { GameSession } from '@hc/sdk';
import { io } from 'socket.io-client';
definePageMeta({
  name: 'Game'
});
const { data: socketUrl } = await useFetch('/api/room');
const { getToken } = useConvexAuth();

const game = ref<{
  session: GameSession;
  dispatch: (
    type: Parameters<GameSession['dispatchPlayerInput']>[0]['type'],
    payload: any
  ) => void;
}>();

onMounted(async () => {
  console.log(socketUrl.value);
  const socket = io(socketUrl.value as string, {
    transports: ['websocket'],
    upgrade: false,
    auth: {
      token: await getToken()
    }
  });

  socket.on('connect_error', err => {
    console.log(err.message);
  });

  socket.on('game:init', (serializedState: any) => {
    if (game.value) return;
    game.value = {
      session: GameSession.createClientSession(serializedState),
      dispatch(type, payload) {
        socket.emit('game:input', { type, payload });
      }
    };

    socket.on('game:action', (arg: any) => {
      game.value?.session.dispatchAction(arg);
    });
  });
});
</script>

<template>
  <ClientOnly>
    <GameView
      v-if="game"
      :game-session="game.session"
      @move="game.dispatch('MOVE', $event)"
      @end-turn="game.dispatch('END_TURN', {})"
      @use-skill="game.dispatch('USE_SKILL', $event)"
      @summon="game.dispatch('SUMMON', $event)"
      @end="
        () => {
          console.log('todo game end');
        }
      "
    />
    <div v-else>Waiting for opponent...</div>
    <template #fallback>Connecting to the game...</template>
  </ClientOnly>
</template>
