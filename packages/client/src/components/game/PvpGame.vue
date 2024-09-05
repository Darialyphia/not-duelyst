<script setup lang="ts">
import { api } from '@game/api';
import {
  ClientSession,
  GameSession,
  type SerializedGameState,
  type SimulationResult
} from '@game/sdk';
import type { SerializedAction } from '@game/sdk/src/action/action';
import type { Nullable } from '@game/shared';
import { type Socket } from 'socket.io-client';

const route = useRoute();

const { data: game, isLoading: isGameLoading } = useConvexAuthedQuery(
  api.games.getCurrent,
  {}
);

const { data: me, isLoading: isMeLoading } = useConvexAuthedQuery(api.users.me, {});

const socket = ref<Socket>();
const gameSession = shallowRef<ClientSession>();
const simulationResult = ref<Nullable<SimulationResult>>(null);
const simulationsCache = new Map<string, SimulationResult>();
const simulateAction = async (event: any) => {
  if (!gameSession.value) return;
  const key = JSON.stringify(event);
  if (simulationsCache.has(key)) {
    simulationResult.value = simulationsCache.get(key);
  }
  try {
    const result = await gameSession.value.simulateAction({
      type: event.type,
      payload: {
        ...event.payload,
        playerId: gameSession.value.playerSystem.activePlayer.id
      }
    });
    simulationsCache.set(key, result);
    simulationResult.value = result;
  } catch (err) {
    console.error(err);
    socket.value?.emit('game:simulation', event);
  }
};

const dispatch = (type: Parameters<GameSession['dispatch']>[0]['type'], payload: any) => {
  socket.value?.emit('game:action', { type, payload });
};
const timeRemainingForTurn = ref(0);
const isCreatingRoom = ref(true);

const { error } = useGameSocket({
  roomId: route.query.roomId as string,
  gameId: () => game.value?._id,
  spectator: false,
  onConnected(_socket) {
    socket.value = _socket;
    isCreatingRoom.value = false;

    socket.value?.on('game:init', (serializedState: SerializedGameState) => {
      if (gameSession.value) return;

      until(game)
        .toBeTruthy()
        .then(currentGame => {
          const session = ClientSession.create(serializedState, {
            winnerId: currentGame.winnerId ?? undefined,
            format: toRaw(currentGame.format)
          });
          session.on('game:action', () => {
            simulationsCache.clear();
          });

          session.onReady(() => {
            gameSession.value = session;
          });

          socket.value?.on(
            'game:action',
            ({ action, ctx }: { action: SerializedAction; ctx: any }) => {
              session.dispatch(action, ctx);
              if (action.type === 'endTurn') {
                timeRemainingForTurn.value = 0;
              }
            }
          );

          socket.value?.on('time-remaining', time => {
            timeRemainingForTurn.value = time;
          });
          socket.value?.on('game:simulation-result', result => {
            simulationResult.value = result;
          });
        });
    });

    socket.value?.on('p1:emote', addP1);
    socket.value?.on('p2:emote', addP2);
  }
});

const { addP1, addP2, p1Emote, p2Emote } = useEmoteQueue();

const isLoading = computed(() => isMeLoading.value || isGameLoading.value);

const canSeeGame = computed(() => {
  if (isLoading.value) return true;

  return game.value?.players.some(p => p.id === me.value?._id);
});
</script>

<template>
  <div>
    <div v-if="isLoading" class="full-page"><UiLoader /></div>

    <div v-if="!canSeeGame" class="full-page">
      You are not authorized to see this game
      <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
    </div>

    <div v-else-if="isCreatingRoom" class="full-page">Creating game room...</div>

    <div v-else-if="game?.status === 'WAITING_FOR_PLAYERS'" class="full-page">
      Waiting for opponent to connect...
    </div>

    <div v-else-if="!gameSession" class="full-page">
      <UiLoader />
    </div>
    <template v-else-if="gameSession && me">
      <GameRoot
        v-model:simulation-result="simulationResult"
        :game-session="gameSession"
        :p1-emote="p1Emote"
        :p2-emote="p2Emote"
        :player-id="me._id"
        :game-type="GAME_TYPES.PVP"
        @move="dispatch('move', $event)"
        @attack="dispatch('attack', $event)"
        @end-turn="dispatch('endTurn', $event)"
        @play-card="dispatch('playCard', $event)"
        @replace="dispatch('replaceCard', $event)"
        @surrender="dispatch('surrender', $event)"
        @mulligan="dispatch('mulligan', $event)"
        @simulate-action="simulateAction"
        @draw="dispatch('draw', $event)"
        @get-gold="dispatch('getGold', $event)"
        @add-rune="dispatch('addRune', $event)"
        @p1-emote="
          emote => {
            socket?.emit('p1:emote', emote);
          }
        "
        @p2-emote="
          emote => {
            socket?.emit('p2:emote', emote);
          }
        "
      />

      <div v-if="timeRemainingForTurn" class="remaining" />
    </template>
    <UiModal
      title="There is no escape from the snagging"
      :is-opened="!!error || game?.status === 'CANCELLED'"
      :style="{ '--ui-modal-size': 'var(--size-sm)' }"
      :closable="false"
    >
      <p>An error has occured and the game has been cancelled.</p>
      <div v-if="error">
        <code>{{ error }}</code>
      </div>
      <NuxtLink v-slot="{ href, navigate }" :to="{ name: 'ClientHome' }" custom>
        <UiButton :href class="error-button mx-auto mt-4" @click="navigate">
          Back to home
        </UiButton>
      </NuxtLink>
    </UiModal>
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

code {
  padding: var(--size-2);
  border: var(--fancy-border);
  :has(&) {
    display: flex;
    justify-content: center;
    padding-block: var(--size-4);
  }
}
</style>
