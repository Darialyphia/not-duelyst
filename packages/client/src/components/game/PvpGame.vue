<script setup lang="ts">
import { api } from '@game/api';
import { GameSession, type SerializedGameState } from '@game/sdk';
import { type Socket } from 'socket.io-client';

const route = useRoute();

const { data: game, isLoading: isGameLoading } = useConvexAuthedQuery(
  api.games.getCurrent,
  {}
);
const { data: me, isLoading: isMeLoading } = useConvexAuthedQuery(api.users.me, {});

const socket = ref<Socket>();
const gameSession = shallowRef<GameSession>();

const dispatch = (type: Parameters<GameSession['dispatch']>[0]['type'], payload: any) => {
  socket.value?.emit('game:action', { type, payload });
};
const timeRemainingForTurn = ref(0);
const isCreatingRoom = ref(true);

const { connect, error } = useGameSocket(
  route.query.roomId as string,
  () => game.value?._id,
  { spectator: false }
);

const fx = useFXProvider();

onMounted(async () => {
  socket.value = await connect();
  isCreatingRoom.value = false;

  socket.value?.on('game:init', (serializedState: SerializedGameState) => {
    if (gameSession.value) return;

    until(game)
      .toBeTruthy()
      .then(currentGame => {
        const session = GameSession.createClientSession(
          serializedState,
          currentGame.seed,
          fx.ctx
        );

        session.onReady(() => {
          gameSession.value = session;
        });

        socket.value?.on('game:action', (arg: any) => {
          session.dispatch(arg);
          if (arg.type === 'endTurn') {
            timeRemainingForTurn.value = 0;
          }
        });

        socket.value?.on('time-remaining', time => {
          timeRemainingForTurn.value = time;
        });
      });
  });
});

const isLoading = computed(() => isMeLoading.value || isGameLoading.value);

const canSeeGame = computed(() => {
  if (isLoading.value) return true;

  return game.value?.players.some(p => p._id === me.value?._id);
});
</script>

<template>
  <div>
    <div v-if="isLoading" class="full-page">Loading...</div>

    <div v-if="!canSeeGame" class="full-page">
      You are not authorized to see this game
      <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
    </div>

    <div v-else-if="isCreatingRoom" class="full-page">Creating game room...</div>

    <div v-else-if="error || game?.status === 'CANCELLED'" class="full-page">
      An error has occured while creating the room.
      <code>{{ error }}</code>
    </div>

    <div v-else-if="game?.status === 'WAITING_FOR_PLAYERS'" class="full-page">
      Waiting for opponent to connect...
    </div>

    <div v-else-if="game?.status === 'FINISHED'" class="full-page">
      This game is already finished. (TODO: Add end game screen)
      <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
    </div>

    <template v-else-if="gameSession && me">
      <GameRoot
        :game-session="gameSession"
        :player-id="me._id"
        :game-type="GAME_TYPES.PVP"
        @move="dispatch('move', $event)"
        @attack="dispatch('attack', $event)"
        @end-turn="dispatch('endTurn', $event)"
        @use-skill="dispatch('useSkill', $event)"
        @play-card="dispatch('playCard', $event)"
        @surrender="dispatch('surrender', $event)"
      />

      <div v-if="timeRemainingForTurn" class="remaining" />
    </template>
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

.full-page {
  display: grid;
  place-content: center;
  height: 100dvh;
  font-size: var(--font-size-5);
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
