<script setup lang="ts">
import type { GameFormatDto } from '@game/api/src/convex/formats/format.mapper';
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import {
  ClientSession,
  ServerSession,
  type SerializedGameState,
  type SimulationResult
} from '@game/sdk';
import type { Nullable } from '@game/shared';
import { nanoid } from 'nanoid';

const { player1Loadout, player2Loadout, seed, format } = defineProps<{
  player1Loadout: LoadoutDto;
  player2Loadout: LoadoutDto;
  seed?: string;
  format: GameFormatDto;
}>();

const state: SerializedGameState = {
  history: [],
  entities: [],
  rng: {
    values: []
  },
  players: [
    {
      id: '1',
      name: 'Player 1',
      deck: player1Loadout.cards.map(({ id, pedestalId, cardBackId }) => ({
        pedestalId,
        cardBackId,
        blueprintId: id
      })),
      isPlayer1: true,
      graveyard: []
    },
    {
      id: '2',
      name: 'Player 2',
      deck: player2Loadout.cards.map(({ id, pedestalId, cardBackId }) => ({
        pedestalId,
        cardBackId,
        blueprintId: id
      })),
      isPlayer1: false,
      graveyard: []
    }
  ]
};

const serverSession = ServerSession.create(state, {
  seed: seed ?? nanoid(),
  format: toRaw(format)
});
const clientSession = ClientSession.create(serverSession.serialize(), {
  format
});
serverSession.onUpdate((action, opts) => {
  clientSession.dispatch(action, opts);
});

const error = ref<Nullable<Error>>(null);
serverSession.on('game:error', err => {
  error.value = err;
});

const dispatch = (
  type: Parameters<(typeof serverSession)['dispatch']>[0]['type'],
  payload: any
) => {
  serverSession.dispatch({
    type,
    payload: {
      ...payload,
      playerId: payload?.playerId ?? serverSession.playerSystem.activePlayer.id
    }
  });
};

const { addP1, addP2, p1Emote, p2Emote } = useEmoteQueue();

const simulationResult = ref<Nullable<SimulationResult>>(null);
const simulationsCache = new Map<string, SimulationResult>();
const simulateAction = async (event: any) => {
  const key = JSON.stringify(event);
  if (simulationsCache.has(key)) {
    simulationResult.value = simulationsCache.get(key);
    return;
  }

  const result = await serverSession.simulateAction({
    type: event.type,
    payload: {
      ...event.payload,
      playerId: serverSession.playerSystem.activePlayer.id
    }
  });
  simulationsCache.set(key, result);
  simulationResult.value = result;
};
clientSession.on('game:action', () => {
  simulationsCache.clear();
});
</script>

<template>
  <div class="relative">
    <GameRoot
      v-model:simulation-result="simulationResult"
      :p1-emote="p1Emote"
      :p2-emote="p2Emote"
      :game-session="clientSession"
      :player-id="null"
      :game-type="GAME_TYPES.SANDBOX"
      @simulate-action="simulateAction"
      @move="dispatch('move', $event)"
      @attack="dispatch('attack', $event)"
      @end-turn="dispatch('endTurn', $event)"
      @play-card="dispatch('playCard', $event)"
      @replace="dispatch('replaceCard', $event)"
      @surrender="dispatch('surrender', $event)"
      @mulligan="dispatch('mulligan', $event)"
      @p1-emote="addP1($event)"
      @p2-emote="addP2($event)"
      @draw="dispatch('draw', $event)"
      @add-rune="dispatch('addRune', $event)"
      @get-gold="dispatch('getGold', $event)"
    />

    <SandboxTools :server-session="serverSession" :client-session="clientSession" />

    <UiModal
      title="There is no escape from the snagging"
      :is-opened="!!error"
      :style="{ '--ui-modal-size': 'var(--size-sm)' }"
      :closable="false"
    >
      <p>An error has occured and the game has been cancelled.</p>
      <div v-if="error">
        <code class="error">{{ error }}</code>
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
.error {
  display: block;
  white-space: normal;
}
</style>
