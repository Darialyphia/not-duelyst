<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

definePageMeta({
  name: 'Replay',
  layout: 'fullscreen',
  bgm: BGMS.BATTLE
});

defineRouteRules({
  ssr: false
});

useBgmProvider();
const route = useRoute();

const { data: game, isLoading } = useConvexQuery(api.games.replayByGameId, {
  gameId: route.params.id as Id<'games'>
});
const assets = useAssetsProvider();
assets.load();

const isReady = ref(false);
until(assets.loaded)
  .toBe(true)
  .then(() => {
    // Removed the loader code before the SPA got loaded
    const loader = document.getElementById('app-loader');
    if (!loader) {
      isReady.value = true;
      return;
    }

    loader.addEventListener('animationend', () => {
      loader.remove();
      isReady.value = true;
    });
    loader.classList.add('loader-fadeout');
  });

const ready = ref(false);
</script>

<template>
  <div v-if="isReady" class="page">
    <div v-if="isLoading || !ready" class="h-full grid place-content-center">
      <UiLoader />
    </div>
    <ClientOnly>
      <Replay
        v-if="game"
        v-bind="game"
        class="replay"
        :class="ready && 'is-ready'"
        @ready="ready = true"
      />
      <div v-else>Replay not found</div>
      <template #fallback>
        <div
          id="app-loader"
          style="
            position: absolute;
            z-index: 1;
            inset: 0;

            display: grid;
            place-content: center;

            height: 100dvh;

            background: black;
            background-attachment: fixed;
            background-size: cover;
          "
        >
          <img src="/assets/ui/mystic_loading.gif" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style lang="postcss" scoped>
.page {
  overflow: hidden;
  height: 100dvh;
}

.replay {
  opacity: 0;
  transition: opacity 1s;
  &.is-ready {
    opacity: 1;
  }
}
</style>
