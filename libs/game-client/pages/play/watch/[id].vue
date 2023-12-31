<script setup lang="ts">
import { io, type Socket } from 'socket.io-client';
import { api } from '@hc/api';
import type { Id } from '@hc/api/convex/_generated/dataModel';
import { GameSession } from '@hc/sdk';

definePageMeta({
  name: 'WatchGame'
});

const route = useRoute();

const { getToken, isAuthenticated } = useConvexAuth();
watchEffect(() => {
  console.log(isAuthenticated.value);
});
const { data: game, isLoading: isGameLoading } = useConvexQuery(
  api.games.getById,
  { gameId: route.params.id as Id<'games'> },
  {}
);

const gameSession = shallowRef<GameSession>();

let socket: Socket;
onMounted(async () => {
  const socketUrl = await $fetch('/api/room', {
    baseURL: window.location.origin,
    query: { roomId: route.query.roomId }
  });

  socket = io(`${socketUrl}?spectator=true&gameId=${route.params.id}` as string, {
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
      gameSession.value = session;
    });

    socket.on('game:action', (arg: any) => {
      gameSession.value?.dispatchAction(arg);
    });
  });
});

onUnmounted(() => {
  socket?.disconnect();
});
</script>

<template>
  <ClientOnly>
    <div v-if="isGameLoading">Loading...</div>

    <div v-else-if="game?.status === 'WAITING_FOR_PLAYERS'">Waiting for opponent...</div>
    <div v-else-if="game?.status === 'FINISHED'">
      This game is already finished.
      <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
    </div>

    <GameView v-else-if="gameSession" :game-session="gameSession" :player-id="null" />

    <template #fallback>Loading...</template>
  </ClientOnly>
</template>
