<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

definePageMeta({
  name: 'Replay',
  layout: 'fullscreen',
  bgm: BGMS.BATTLE
});

useBgmProvider();
const route = useRoute();

const { data: game, isLoading } = useConvexQuery(api.games.replayByGameId, {
  gameId: route.params.id as Id<'games'>
});
</script>

<template>
  <div class="page">
    <div v-if="isLoading">Loading...</div>
    <ClientOnly>
      <Replay v-if="game" v-bind="game" />
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
          <img src="/assets/ui/loading.gif" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style lang="postcss" scoped>
.page {
  overflow: hidden;
  min-height: 100dvh;
}
</style>
