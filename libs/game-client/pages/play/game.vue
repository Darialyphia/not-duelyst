<script setup lang="ts">
import { api } from '@hc/api';
import { GameSession } from '@hc/sdk';
import { io, type Socket } from 'socket.io-client';
definePageMeta({
  name: 'Game'
});
const route = useRoute();
const { getToken } = useConvexAuth();

const { data: game, isLoading: isGameLoading } = useConvexQuery(api.games.getCurrent, {});
const { data: me, isLoading: isMeLoading } = useConvexQuery(api.users.me, {});

const gameSession = shallowRef<{
  session: GameSession;
  dispatch: (
    type: Parameters<GameSession['dispatchPlayerInput']>[0]['type'],
    payload: any
  ) => void;
}>();

let socket: Socket;
onMounted(async () => {
  const socketUrl = await $fetch('/api/room', {
    query: { roomId: route.query.roomId }
  });

  socket = io(socketUrl as string, {
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
    if (gameSession.value) return;
    const session = GameSession.createClientSession(serializedState);

    session.onReady(() => {
      gameSession.value = {
        session,
        dispatch(type, payload) {
          socket.emit('game:input', { type, payload });
        }
      };
    });

    socket.on('game:action', (arg: any) => {
      gameSession.value?.session.dispatchAction(arg);
    });
  });
});

onUnmounted(() => {
  socket?.disconnect();
});

const isLoading = computed(() => isMeLoading.value || isGameLoading.value);
const canSeeGame = computed(() => {
  if (isLoading.value) return true;
  return game.value?.players.some(p => p._id === me.value?._id);
});
</script>

<template>
  <ClientOnly>
    <div v-if="isLoading">Loading...</div>
    <div v-if="!canSeeGame">
      You are not authorized to see this game
      <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
    </div>
    <div v-else-if="game?.status === 'WAITING_FOR_PLAYERS'">Waiting for opponent...</div>
    <div v-else-if="game?.status === 'FINISHED'">
      This game is already finished.
      <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
    </div>

    <GameView
      v-else-if="gameSession && me"
      :game-session="gameSession.session"
      :player-id="me._id"
      @move="gameSession.dispatch('MOVE', $event)"
      @end-turn="gameSession.dispatch('END_TURN', {})"
      @use-skill="gameSession.dispatch('USE_SKILL', $event)"
      @summon="gameSession.dispatch('SUMMON', $event)"
      @surrender="gameSession.dispatch('SURRENDER', {})"
    />

    <template #fallback>Loading...</template>
  </ClientOnly>
</template>
