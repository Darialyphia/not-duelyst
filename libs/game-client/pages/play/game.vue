<script setup lang="ts">
import { api } from '@hc/api';
import { GameSession } from '@hc/sdk';
import { io } from 'socket.io-client';
definePageMeta({
  name: 'Game'
});
const route = useRoute();
const { data: socketUrl } = await useFetch('/api/room', {
  query: { roomId: route.query.roomId }
});
const { getToken } = useConvexAuth();

const { data: me } = useConvexQuery(api.users.me, {});

const game = ref<{
  session: GameSession;
  dispatch: (
    type: Parameters<GameSession['dispatchPlayerInput']>[0]['type'],
    payload: any
  ) => void;
}>();

onMounted(async () => {
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
    const session = GameSession.createClientSession(serializedState);
    session.onReady(() => {
      console.log('ready');
      game.value = {
        session,
        dispatch(type, payload) {
          socket.emit('game:input', { type, payload });
        }
      };
    });

    socket.on('game:action', (arg: any) => {
      game.value?.session.dispatchAction(arg);
    });
  });
});
</script>

<template>
  <ClientOnly>
    <GameView
      v-if="game && me"
      :game-session="game.session"
      :player-id="me._id"
      @move="game.dispatch('MOVE', $event)"
      @end-turn="game.dispatch('END_TURN', {})"
      @use-skill="game.dispatch('USE_SKILL', $event)"
      @summon="game.dispatch('SUMMON', $event)"
      @surrender="game.dispatch('SURRENDER', {})"
    />
    <div v-else>Waiting for opponent...</div>
    <template #fallback>Connecting to the game...</template>
  </ClientOnly>
</template>
