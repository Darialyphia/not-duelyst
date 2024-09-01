<script setup lang="ts">
import { api } from '@game/api';
import type { GameDetailsDto } from '@game/api/src/convex/game/game.mapper';
import { ClientSession, type SerializedGameState } from '@game/sdk';
import type { SerializedAction } from '@game/sdk/src/action/action';
import { type Socket } from 'socket.io-client';

const { game } = defineProps<{ game: GameDetailsDto }>();
const route = useRoute();

const { data: me } = useConvexAuthedQuery(api.users.me, {});

const socket = ref<Socket>();
const gameSession = shallowRef<ClientSession>();

const timeRemainingForTurn = ref(0);
const isCreatingRoom = ref(true);

const { error } = useGameSocket({
  roomId: route.query.roomId as string,
  gameId: () => game._id,
  spectator: true,
  onConnected(_socket) {
    socket.value = _socket;
    isCreatingRoom.value = false;

    socket.value.on('game:init', (serializedState: SerializedGameState) => {
      if (gameSession.value) return;

      until(game)
        .toBeTruthy()
        .then(() => {
          const session = ClientSession.create(serializedState, {
            format: game.format
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
        });
    });

    socket.value?.on('p1:emote', addP1);
    socket.value?.on('p2:emote', addP2);
  }
});

const { addP1, addP2, p1Emote, p2Emote } = useEmoteQueue();
</script>

<template>
  <div>
    <div v-if="isCreatingRoom" class="full-page">Creating game room...</div>

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
        :p1-emote="p1Emote"
        :p2-emote="p2Emote"
        :player-id="me._id"
        :game-type="GAME_TYPES.SPECTATOR"
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
