<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

definePageMeta({
  name: 'WatchGame',
  bgm: BGMS.BATTLE
});

const route = useRoute();

const { data: game } = useConvexQuery(api.games.byId, {
  gameId: route.params.id as Id<'games'>
});
</script>

<template>
  <div class="page">
    <SpectatorMode v-if="game" :game="game" />
    <div else class="h-full grid place-content-center">
      <UiLoader />
    </div>
  </div>
</template>

<style scoped>
.page {
  overflow: hidden;
  height: 100dvh;
  background-color: black;
}
</style>
