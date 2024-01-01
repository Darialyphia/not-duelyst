<script setup lang="ts">
import { api } from '@hc/api';
import type { Id } from '@hc/api/convex/_generated/dataModel';
import { GameSession, type SerializedAction, type SerializedGameState } from '@hc/sdk';
import type { Nullable } from '@hc/shared';
import { parse } from 'zipson';

definePageMeta({
  layout: 'fullscreen',
  colorMode: 'dark',
  name: 'Replay'
});

const route = useRoute();
const { data: replay, isLoading } = useConvexQuery(
  api.gameReplays.byGameId,
  {
    gameId: route.params.id as Id<'games'>
  },
  { ssr: false }
);

const parsedReplay = computed(() =>
  replay.value
    ? (parse(replay.value.replay) as {
        initialState: SerializedGameState;
        replay: SerializedAction[];
      })
    : null
);

const currentStep = ref(0);
const isPlaying = ref(false);

const gameSession = shallowRef<GameSession>();

const next = () => {
  if (!parsedReplay.value) return;
  if (currentStep.value === parsedReplay.value.replay.length - 1) {
    isPlaying.value = false;
    return;
  }

  gameSession.value?.dispatchAction(parsedReplay.value.replay[currentStep.value]);
  currentStep.value++;
};
let unsub: () => void = () => void 0;

onUnmounted(() => {
  unsub();
});
until(parsedReplay)
  .not.toBeNull()
  .then(replay => {
    gameSession.value = GameSession.createClientSession(replay.initialState);

    unsub = gameSession.value.subscribe(() => {
      if (isPlaying.value) {
        setTimeout(() => {
          next();
        }, 1000);
      }
    });
  });
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <ClientOnly v-else-if="gameSession">
    <div class="relative">
      <GameView :game-session="gameSession" :player-id="null" is-replay />
      <div class="flex absolute bottom-8 right-11">
        <UiButton
          class="ghost-button"
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
        <UiButton class="ghost-button" :disabled="isPlaying" @click="next">
          <Icon name="material-symbols:fast-forward" size="2em" />
        </UiButton>
      </div>
    </div>
    <template #fallback><div /></template>
  </ClientOnly>
</template>
