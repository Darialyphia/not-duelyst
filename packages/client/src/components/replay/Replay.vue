<script setup lang="ts">
import { api } from '@game/api';
import type { GameDetailsDto } from '@game/api/src/convex/game/game.mapper';
import { ClientSession, ServerSession } from '@game/sdk';
import { parse } from 'zipson';

const { game, replay, initialState } = defineProps<{
  game: GameDetailsDto;
  replay: string;
  initialState: string;
}>();

const emit = defineEmits<{ ready: [] }>();
const parsedReplay = parse(replay);

const parsedState = parse(initialState);

const serverSession = ServerSession.create(parsedState, {
  seed: game.seed,
  format: toRaw(game.format)
});
const clientSession = ClientSession.create(serverSession.serialize(), {
  format: toRaw(game.format)
});
serverSession.onUpdate((action, opts) => {
  clientSession.dispatch(action, opts);

  if (isPlaying.value) {
    setTimeout(() => {
      next();
    }, 2000);
  }
});

const currentStep = ref(0);
const isPlaying = ref(false);

const next = () => {
  if (!parsedReplay) return;
  if (currentStep.value === parsedReplay.length) {
    isPlaying.value = false;
    return;
  }
  serverSession.dispatch(parsedReplay[currentStep.value]);
  currentStep.value++;
};

const me = useConvexAuthedQuery(api.users.me, {});
const gameType = ref<GameType>(GAME_TYPES.SPECTATOR);

const { addP1, addP2, p1Emote, p2Emote } = useEmoteQueue();

const dispatch = (
  type: Parameters<(typeof serverSession)['dispatch']>[0]['type'],
  payload: any
) => {
  if (gameType.value === GAME_TYPES.SPECTATOR) return;
  serverSession.dispatch({
    type,
    payload: {
      ...payload,
      playerId: payload?.playerId ?? serverSession.playerSystem.activePlayer.id
    }
  });
};
</script>

<template>
  <div class="relative">
    <GameRoot
      :game-session="clientSession"
      :player-id="null"
      :game-type="gameType"
      :p1-emote="p1Emote"
      :p2-emote="p2Emote"
      @move="dispatch('move', $event)"
      @attack="dispatch('attack', $event)"
      @end-turn="dispatch('endTurn', $event)"
      @play-card="dispatch('playCard', $event)"
      @replace="dispatch('replaceCard', $event)"
      @mulligan="dispatch('mulligan', $event)"
      @draw="dispatch('draw', $event)"
      @get-gold="dispatch('getGold', $event)"
      @p1-emote="addP1($event)"
      @p2-emote="addP2($event)"
      @ready="emit('ready')"
    />
    <div
      v-if="gameType === GAME_TYPES.SPECTATOR"
      class="controls"
      :style="{
        '--ui-button-radius': 'var(--radius-round)'
      }"
    >
      <UiButton v-if="me" class="primary-button" @click="gameType = GAME_TYPES.SANDBOX">
        Convert to sandbox
      </UiButton>
      <UiButton
        class="primary-button"
        @click="
          () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
              next();
            }
          }
        "
      >
        <Icon
          size="2em"
          :name="
            isPlaying ? 'material-symbols:pause' : 'material-symbols-light:play-arrow'
          "
        />
      </UiButton>
      <UiButton class="primary-button" :disabled="isPlaying" @click="next">
        <Icon name="material-symbols:fast-forward" size="2em" />
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.controls {
  position: absolute;
  right: calc(var(--size-11) - var(--size-7));
  bottom: var(--size-4);

  display: flex;
  gap: var(--size-3);
}
button {
  height: 58px;
}
</style>
