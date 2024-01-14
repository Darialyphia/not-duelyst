<script setup lang="ts">
import { api } from '@hc/api';
import { GameSession } from '@hc/sdk';
import { io, type Socket } from 'socket.io-client';
definePageMeta({
  name: 'Game'
});

const route = useRoute();
const sessionId = useSessionId();

const { data: game, isLoading: isGameLoading } = useConvexAuthedQuery(
  api.games.getCurrent,
  {}
);
const { data: me, isLoading: isMeLoading } = useConvexAuthedQuery(api.users.me, {});

const gameSession = shallowRef<{
  session: GameSession;
  dispatch: (
    type: Parameters<GameSession['dispatchPlayerInput']>[0]['type'],
    payload: any
  ) => void;
}>();

const timeRemainingForTurn = ref(0);

let socket: Socket;
onMounted(async () => {
  const socketUrl = await $fetch('/api/room', {
    baseURL: window.location.origin,
    query: { roomId: route.query.roomId }
  });

  socket = io(socketUrl as string, {
    transports: ['websocket'],
    upgrade: false,
    auth: {
      token: sessionId.value
    }
  });

  socket.on('connect_error', err => {
    console.log(err);
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
      if (arg.type === 'END_TURN') {
        timeRemainingForTurn.value = 0;
      }
    });

    socket.on('time-remaining', time => {
      timeRemainingForTurn.value = time;
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
  <div>
    <ClientOnly>
      <div v-if="isLoading">Loading...</div>
      <div v-if="!canSeeGame">
        You are not authorized to see this game
        <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
      </div>
      <div v-else-if="game?.status === 'WAITING_FOR_PLAYERS'">
        Waiting for opponent...
      </div>
      <div v-else-if="game?.status === 'FINISHED'">
        This game is already finished.
        <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
      </div>

      <template v-else-if="gameSession && me">
        <GameView
          :game-session="gameSession.session"
          :player-id="me._id"
          @move="gameSession.dispatch('MOVE', $event)"
          @end-turn="gameSession.dispatch('END_TURN', {})"
          @use-skill="gameSession.dispatch('USE_SKILL', $event)"
          @summon="gameSession.dispatch('SUMMON', $event)"
          @surrender="gameSession.dispatch('SURRENDER', {})"
        />

        <div v-if="timeRemainingForTurn" class="remaining" />
      </template>

      <template #fallback>Loading...</template>
    </ClientOnly>
  </div>
</template>

<style scoped lang="postcss">
@keyframes remaining-time {
  from {
    transform: scaleX(1);
    background-color: var(--red-4);
  }
  to {
    transform: scaleX(0);
    background-color: var(--red-7);
  }
}
.remaining {
  position: fixed;
  z-index: 1;
  bottom: 0;
  left: 0;

  width: 100%;
  height: var(--size-2);

  background-color: var(--red-7);

  animation: remaining-time;
  animation-duration: calc(v-bind(timeRemainingForTurn) * 1ms);
}
</style>
